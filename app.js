/* =====================================================================
   TAPit · app de la familia
   Flujo: código de familia → "Acerca una ficha" → ¿Número o Género? →
   3 tapas (2 opciones cada una) → ¡Ficha completa!
   Todo se registra en Supabase (supabase-client.js) y el aparato recibe
   las órdenes start / open n / finish.
   ===================================================================== */

const APP_NAME = 'TAPit';
const SESSION_STORAGE_KEY = 'arasaac_family_session';     // { family_id, family_label, login_session_id }
const APP_SESSION_STORAGE_KEY = 'tapit_app_session';      // { id, familyId, lastActivityMs }
const PICTO_CACHE_KEY = 'tapit_pictos_v1';
const APP_SESSION_TIMEOUT_MS = 10 * 60 * 1000;            // 10 min sin uso = nueva sesión
const DEVICE_POLL_MS = 800;
const ABSURDO_PROBABILIDAD = 1 / 3;                       // 1 de cada 3 actividades

let currentFamilySession = null;
let currentAppSessionId = null;
let lastSessionTouchMs = 0;
let devicePollTimer = null;
let devicePollBusy = false;
let lastDeviceEventId = null;
let lastDeviceRes = null;

let pendingCard = null;     // ficha leída, esperando que se elija el modo: { key, cardUid }
let game = null;            // actividad en curso

/* ===================================================================
   ESCALA DE PANTALLA (diseño 844×390 que llena cualquier pantalla)
   =================================================================== */
function fitStage() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const portrait = h > w;
  document.body.classList.toggle('portrait', portrait);
  const root = document.documentElement.style;
  root.setProperty('--s', Math.min(w / 844, h / 390).toFixed(4));
  root.setProperty('--sp', Math.min(w / 390, h / 844).toFixed(4));
}
window.addEventListener('resize', fitStage);
window.addEventListener('orientationchange', () => setTimeout(fitStage, 200));

function showScreen(name) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  const el = document.getElementById('screen-' + name);
  if (el) el.classList.add('active');
  document.body.dataset.screen = name;
}

function currentScreen() {
  return document.body.dataset.screen;
}

/* ===================================================================
   SONIDOS, VOZ Y CONFETI
   =================================================================== */
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playNotes(notes, type = 'triangle', volume = 0.25) {
  try {
    const ctx = getAudioContext();
    let t = ctx.currentTime + 0.02;
    notes.forEach(([freq, dur, gap]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(volume, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.05);
      t += gap === undefined ? dur : gap;
    });
  } catch (e) { /* sin audio */ }
}
const playCorrectSound = () => playNotes([[523.25, 0.3, 0.08], [659.25, 0.3, 0.08], [783.99, 0.3, 0.08], [1046.5, 0.4]]);
const playVictoryFanfare = () => playNotes([[523.25, 0.12, 0.16], [659.25, 0.12, 0.16], [783.99, 0.12, 0.16], [1046.5, 0.5]], 'sine', 0.3);
function playErrorSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.3);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  } catch (e) { /* sin audio */ }
}

let spanishVoice = null;
function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices().filter((v) => (v.lang || '').toLowerCase().startsWith('es'));
  const score = (v) => {
    const n = ((v.name || '') + ' ' + (v.voiceURI || '')).toLowerCase();
    let s = 0;
    if (/natural|neural|premium|enhanced|mejorad/.test(n)) s += 5;
    if (/paulina|m[oó]nica|google|sabina|dalia|helena/.test(n)) s += 3;
    if (/es-(mx|us|419|pe)/i.test(v.lang)) s += 2;
    if (v.localService) s += 1;
    return s;
  };
  voices.sort((a, b) => score(b) - score(a));
  spanishVoice = voices[0] || null;
}
if ('speechSynthesis' in window) {
  pickVoice();
  window.speechSynthesis.onvoiceschanged = pickVoice;
}

function speak(text, rate = 0.85) {
  if (!('speechSynthesis' in window) || !text) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = spanishVoice ? spanishVoice.lang : 'es-ES';
  if (spanishVoice) u.voice = spanishVoice;
  u.rate = rate;
  u.pitch = 1.05;
  window.speechSynthesis.speak(u);
}

function stopSpeaking() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

const confettiCanvas = document.getElementById('confetti-canvas');
let confettiParticles = [];
let confettiRunning = false;
function launchConfetti(count = 90) {
  if (!confettiCanvas) return;
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  const colors = ['#FFC83D', '#FF7A59', '#2FCB8E', '#FFFFFF', '#A99BFF', '#4965F5'];
  for (let i = 0; i < count; i++) {
    confettiParticles.push({
      x: window.innerWidth * (0.15 + Math.random() * 0.7),
      y: window.innerHeight * 0.35,
      w: Math.random() * 8 + 6, h: Math.random() * 6 + 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 15 - 3,
      rot: Math.random() * 360, vr: (Math.random() - 0.5) * 12, a: 1
    });
  }
  if (!confettiRunning) { confettiRunning = true; requestAnimationFrame(drawConfetti); }
}
function drawConfetti() {
  const ctx = confettiCanvas.getContext('2d');
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    const p = confettiParticles[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.35; p.vx *= 0.99; p.rot += p.vr; p.a -= 0.007;
    if (p.a <= 0 || p.y > confettiCanvas.height + 20) { confettiParticles.splice(i, 1); continue; }
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.a);
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rot * Math.PI) / 180);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  }
  if (confettiParticles.length) requestAnimationFrame(drawConfetti);
  else { confettiRunning = false; ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height); }
}

/* ===================================================================
   PICTOGRAMAS DE ARASAAC
   =================================================================== */
let pictoCache = {};
try { pictoCache = JSON.parse(localStorage.getItem(PICTO_CACHE_KEY) || '{}'); } catch (e) { pictoCache = {}; }
const pictoRequests = {};

function savePictoCache() {
  try { localStorage.setItem(PICTO_CACHE_KEY, JSON.stringify(pictoCache)); } catch (e) {}
}

async function searchArasaac(text) {
  const base = 'https://api.arasaac.org/api/pictograms/es/';
  for (const kind of ['bestsearch', 'search']) {
    try {
      const res = await fetch(base + kind + '/' + encodeURIComponent(text.toLowerCase()));
      if (!res.ok) continue;
      const list = await res.json();
      if (Array.isArray(list) && list.length && list[0]._id) return list[0]._id;
    } catch (e) { /* sin internet o bloqueado */ }
  }
  return null;
}

// Devuelve (promesa) el número de pictograma de una palabra, o null
function getPictoId(word) {
  if (!word) return Promise.resolve(null);
  if (PICTOS[word]) return Promise.resolve(PICTOS[word]);
  const cached = pictoCache[word];
  if (cached && cached.id) return Promise.resolve(cached.id);
  if (cached && !cached.id && Date.now() - cached.t < 24 * 3600 * 1000) return Promise.resolve(null);
  if (!pictoRequests[word]) {
    pictoRequests[word] = searchArasaac(PICTOS_BUSCAR[word] || word).then((id) => {
      pictoCache[word] = { id: id || 0, t: Date.now() };
      savePictoCache();
      delete pictoRequests[word];
      return id;
    });
  }
  return pictoRequests[word];
}

// Crea el recuadro del pictograma: primero muestra la inicial y luego la imagen
function pictoElement(word, small = false) {
  const box = document.createElement('div');
  box.className = 'picto' + (small ? ' sm' : '');
  const ph = document.createElement('div');
  ph.className = 'ph';
  ph.textContent = word.length <= 3 ? word : word.charAt(0);
  box.appendChild(ph);
  getPictoId(word).then((id) => {
    if (!id) return;
    const img = new Image();
    img.alt = word;
    img.draggable = false;
    img.onload = () => { box.innerHTML = ''; box.appendChild(img); };
    img.src = 'https://static.arasaac.org/pictograms/' + id + '/' + id + '_' + (small ? 300 : 500) + '.png';
  });
  return box;
}

function preloadPictos(ficha) {
  const words = [ficha.inicio, ficha.final];
  ficha.tapas.forEach((t) => words.push(t.palabra, t.numero, t.genero, t.absurdo));
  words.filter(Boolean).forEach((w) => getPictoId(w));
}

/* ===================================================================
   REGLAS DE LOS MODOS
   Número: las 3 tapas con error de número. 1 de cada 3 veces, la tapa 1
           o la 2 (al azar) usa su absurdo.
   Género: tapa 1 y 3 con error de género, tapa 2 (verbo) siempre absurdo.
           1 de cada 3 veces la tapa 1 usa su absurdo. Si una palabra no
           tiene género, usa su absurdo.
   =================================================================== */
function buildPlan(ficha, mode) {
  let tipos;
  if (mode === 'numero') {
    tipos = ['numero', 'numero', 'numero'];
    if (Math.random() < ABSURDO_PROBABILIDAD) {
      const conAbsurdo = [0, 1].filter((i) => ficha.tapas[i].absurdo);
      if (conAbsurdo.length) tipos[conAbsurdo[Math.floor(Math.random() * conAbsurdo.length)]] = 'absurdo';
    }
  } else {
    tipos = ['genero', 'absurdo', 'genero'];
    if (Math.random() < ABSURDO_PROBABILIDAD) tipos[0] = 'absurdo';
  }

  return ficha.tapas.map((tapa, i) => {
    let tipo = tipos[i];
    if (!tapa[tipo]) tipo = ['absurdo', 'genero', 'numero'].find((t) => tapa[t]) || tipo;
    return { index: i + 1, palabra: tapa.palabra, distractor: tapa[tipo], tipo };
  });
}

function sentenceOf(ficha) {
  const words = [ficha.inicio].concat(ficha.tapas.map((t) => t.palabra), [ficha.final]);
  const text = words.join(' ').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/* ===================================================================
   SESIÓN DE LA FAMILIA
   =================================================================== */
function loadFamilySession() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || 'null');
    return parsed && parsed.family_id ? parsed : null;
  } catch (e) { return null; }
}

function saveFamilySession(data) {
  currentFamilySession = data;
  try { localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
}

function clearFamilySession() {
  currentFamilySession = null;
  currentAppSessionId = null;
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(APP_SESSION_STORAGE_KEY);
  } catch (e) {}
  stopDevicePolling();
}

function renderFamily() {
  const label = (currentFamilySession && currentFamilySession.family_label) || 'Familia';
  document.getElementById('family-label').textContent = label;
  document.getElementById('family-initial').textContent = label.trim().charAt(0).toUpperCase() || 'F';
}

function setLoginError(msg) {
  document.querySelectorAll('.login-error').forEach((el) => {
    el.textContent = msg || '';
    el.classList.toggle('show', Boolean(msg));
  });
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const input = form.querySelector('input');
  const button = form.querySelector('button');
  const code = input.value.trim().toUpperCase();
  getAudioContext(); // desbloquea el audio en iPhone

  if (!code) {
    setLoginError('Escribe tu código de familia.');
    input.focus();
    return;
  }
  setLoginError('');
  button.disabled = true;
  const original = button.innerHTML;
  button.textContent = 'Revisando...';

  const result = await verifyFamilyCode(code);
  button.disabled = false;
  button.innerHTML = original;

  if (!result.ok) {
    setLoginError(result.error || 'Ese código no existe.');
    input.select();
    return;
  }

  saveFamilySession({
    family_id: result.family_id,
    family_label: result.family_label,
    login_session_id: result.login_session_id
  });
  document.querySelectorAll('[data-login] input').forEach((el) => { el.value = ''; el.blur(); });
  onFamilyReady();
}

function askLogout() {
  openModal({
    title: '¿Cerrar sesión?',
    text: 'Tendrás que escribir el código de familia otra vez.',
    actions: [
      { label: 'Cancelar', style: 'soft' },
      { label: 'Salir', style: 'navy', onClick: logout }
    ]
  });
}

function logout() {
  stopSpeaking();
  abandonGame(false);
  pendingCard = null;
  clearFamilySession();
  setLoginError('');
  showScreen('login');
}

function onFamilyReady() {
  renderFamily();
  renderFichaMenu();
  goToWait();
  lastDeviceEventId = null;
  // Si una actividad anterior quedó abierta (app cerrada a mitad), libera el aparato para que lea fichas
  sendDeviceCommand('finish');
  ensureAppSession().then(() => startDevicePolling());
  showInstallHintIfNeeded();
  requestWakeLock();
}

/* ===================================================================
   SESIÓN DE USO (cada vez que se abre la app)
   =================================================================== */
async function ensureAppSession() {
  if (!currentFamilySession) return null;
  let stored = null;
  try { stored = JSON.parse(localStorage.getItem(APP_SESSION_STORAGE_KEY) || 'null'); } catch (e) {}
  const now = Date.now();
  if (stored && stored.id && stored.familyId === currentFamilySession.family_id &&
      now - stored.lastActivityMs < APP_SESSION_TIMEOUT_MS) {
    currentAppSessionId = stored.id;
    touchAppSession(true);
    return currentAppSessionId;
  }
  const id = await appOpenSession(currentFamilySession.family_id);
  currentAppSessionId = id;
  if (id) {
    lastSessionTouchMs = now;
    saveAppSessionLocal(id, now);
  }
  return id;
}

function saveAppSessionLocal(id, lastActivityMs) {
  try {
    localStorage.setItem(APP_SESSION_STORAGE_KEY, JSON.stringify({
      id, familyId: currentFamilySession ? currentFamilySession.family_id : null, lastActivityMs
    }));
  } catch (e) {}
}

function touchAppSession(force = false) {
  if (!currentAppSessionId) return;
  const now = Date.now();
  saveAppSessionLocal(currentAppSessionId, now);
  if (force || now - lastSessionTouchMs > 60 * 1000) {
    lastSessionTouchMs = now;
    appTouchSession(currentAppSessionId);
  }
}

/* ===================================================================
   APARATO: órdenes y escucha de fichas
   =================================================================== */
function sendDeviceCommand(command, arg = null) {
  if (!currentFamilySession) return;
  appSendCommand(currentFamilySession.family_id, command, arg);
}

function startDevicePolling() {
  stopDevicePolling();
  if (!currentFamilySession) return;
  pollDeviceOnce();
  devicePollTimer = setInterval(pollDeviceOnce, DEVICE_POLL_MS);
}

function stopDevicePolling() {
  if (devicePollTimer) clearInterval(devicePollTimer);
  devicePollTimer = null;
}

async function pollDeviceOnce() {
  if (devicePollBusy || !currentFamilySession || document.hidden) return;
  devicePollBusy = true;
  try {
    const res = await appPoll(currentFamilySession.family_id, lastDeviceEventId);
    lastDeviceRes = res && res.ok ? res : null;
    renderDeviceStatus(lastDeviceRes);
    if (!lastDeviceRes) return;

    // Primera consulta: solo se toma como referencia (no se usan lecturas viejas)
    if (lastDeviceEventId === null) {
      lastDeviceEventId = res.last_event_id || 0;
      return;
    }
    if (res.card && res.card.event_id > lastDeviceEventId) {
      lastDeviceEventId = res.card.event_id;
      handleCardDetected(res.card);
    } else if (res.last_event_id > lastDeviceEventId) {
      lastDeviceEventId = res.last_event_id;
    }
  } finally {
    devicePollBusy = false;
  }
}

function isGameInProgress() {
  return Boolean(game && game.status === 'in_progress' && currentScreen() === 'activity');
}

function handleCardDetected(card) {
  if (!card || card.role === 'config') return;
  if (isGameInProgress()) return;               // durante la actividad, otras fichas se ignoran

  closeModal();
  const key = (card.sentence_key || '').toUpperCase();
  if (!key || !FICHAS[key]) {
    showUnknownCard(card.card_uid);
    return;
  }
  touchAppSession();
  stopSpeaking();
  game = null;
  pendingCard = { key, cardUid: card.card_uid || null };
  preloadPictos(FICHAS[key]);
  sendDeviceCommand('start');
  goToMode();
}

// Menú de fichas (mientras el aparato no use lector NFC)
function renderFichaMenu() {
  const box = document.getElementById('ficha-menu');
  if (!box || box.childElementCount) return;
  Object.keys(FICHAS).forEach((key) => {
    const f = FICHAS[key];
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ficha-btn';
    b.appendChild(pictoElement(f.tapas[0].palabra, true));
    const t = document.createElement('span');
    t.innerHTML = '<b>' + key + '</b><small></small>';
    t.querySelector('small').textContent = f.tapas[0].palabra + ' · ' + f.final;
    b.appendChild(t);
    b.addEventListener('click', () => chooseFichaFromMenu(key));
    box.appendChild(b);
  });
}

async function chooseFichaFromMenu(key) {
  if (!FICHAS[key] || isGameInProgress()) return;
  getAudioContext();
  touchAppSession();
  stopSpeaking();
  game = null;
  pendingCard = { key, cardUid: null };
  preloadPictos(FICHAS[key]);
  goToMode();
  // Las órdenes van en orden: primero cerrar las tapas, luego marcar la actividad
  if (currentFamilySession) {
    await appSendCommand(currentFamilySession.family_id, 'close_all', null);
    await appSendCommand(currentFamilySession.family_id, 'start', null);
  }
}

function renderDeviceStatus(res) {
  const pill = document.getElementById('device-status');
  const label = document.getElementById('device-status-label');
  const help = document.getElementById('device-status-help');
  const led = document.getElementById('wait-led');
  let state = 'offline';
  let text;
  let helpText = '';

  if (res && res.has_device === false) {
    text = 'Sin ' + APP_NAME + ' asignado';
    helpText = 'Avisa a quien te entregó ' + APP_NAME + '.';
  } else if (res && res.online) {
    state = 'online';
    text = APP_NAME + ' conectado';
  } else if (res) {
    text = APP_NAME + ' sin conexión';
    helpText = 'Revisa que esté enchufado y que la luz azul esté fija.';
  } else {
    text = 'Sin internet en el teléfono';
    helpText = 'Revisa tu conexión WiFi.';
  }
  pill.dataset.state = state;
  label.textContent = text;
  help.textContent = helpText;
  help.style.display = helpText ? 'block' : 'none';
  if (led) led.setAttribute('fill', state === 'online' ? '#2FCB8E' : '#FF7A59');
}

function showUnknownCard(uid) {
  const clean = String(uid || '').replace(/[^0-9A-F]/gi, '');
  openModal({
    title: 'Esta ficha aún no está lista',
    html: 'Prueba con otra ficha.' + (clean ? '<br><span class="modal-uid">Código: ' + clean + '</span>' : ''),
    actions: [{ label: 'Entendido', style: 'navy' }]
  });
}

/* ===================================================================
   PANTALLAS
   =================================================================== */
function goToWait() {
  stopSpeaking();
  pendingCard = null;
  showScreen('wait');
  if (lastDeviceRes) renderDeviceStatus(lastDeviceRes);
}

function chip(text, cls = '') {
  const el = document.createElement('span');
  el.className = 'chip' + (cls ? ' ' + cls : '');
  if (text) el.textContent = text;
  return el;
}

function goToMode() {
  const ficha = FICHAS[pendingCard.key];
  const strip = document.getElementById('mode-strip');
  strip.innerHTML = '';
  const ready = chip('', 'ready');
  ready.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>Ficha lista';
  strip.appendChild(ready);
  strip.appendChild(chip(ficha.inicio));
  ficha.tapas.forEach(() => strip.appendChild(chip('', 'cover')));
  strip.appendChild(chip(ficha.final));

  const t0 = ficha.tapas[0];
  document.getElementById('mode-sub-numero').textContent = 'uno o varios · ' + t0.palabra + ' / ' + t0.numero;
  const conGenero = ficha.tapas.find((t) => t.genero);
  document.getElementById('mode-sub-genero').textContent = conGenero
    ? 'él o ella · ' + conGenero.palabra + ' / ' + conGenero.genero
    : 'él o ella';
  showScreen('mode');
}

function leaveMode() {
  sendDeviceCommand('finish');
  goToWait();
}

/* ------------------------------ Actividad ------------------------------ */
function startGame(mode) {
  if (!pendingCard) return;
  getAudioContext();
  const ficha = FICHAS[pendingCard.key];
  game = {
    key: pendingCard.key,
    cardUid: pendingCard.cardUid,
    ficha,
    mode,
    plan: buildPlan(ficha, mode),
    step: 0,
    errors: [0, 0, 0],
    startedAtMs: Date.now(),
    status: 'in_progress',
    attemptId: null,
    attemptPromise: null,
    locked: false
  };
  pendingCard = null;
  touchAppSession();

  const g = game;
  g.attemptPromise = appStartAttempt({
    familyId: currentFamilySession ? currentFamilySession.family_id : null,
    appSessionId: currentAppSessionId,
    sentenceKey: g.key,
    sentenceText: sentenceOf(ficha),
    cardUid: g.cardUid,
    mode
  }).then((id) => { g.attemptId = id; return id; }).catch(() => null);

  showScreen('activity');
  renderStep();
}

function renderStars(done) {
  const pill = document.getElementById('stars-pill');
  pill.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    pill.insertAdjacentHTML('beforeend',
      '<svg width="26" height="26" viewBox="0 0 24 24" class="' + (i < done ? 'on' : '') + '"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z"/></svg>');
  }
  pill.setAttribute('aria-label', 'Paso ' + Math.min(done + 1, 3) + ' de 3');
}

function renderActivityStrip() {
  const strip = document.getElementById('activity-strip');
  strip.innerHTML = '';
  strip.appendChild(chip(game.ficha.inicio));
  game.plan.forEach((p, i) => {
    if (i < game.step) strip.appendChild(chip(p.palabra, 'done'));
    else if (i === game.step) strip.appendChild(chip('?', 'ask'));
    else strip.appendChild(chip('', 'cover'));
  });
  strip.appendChild(chip(game.ficha.final, 'muted'));
}

function renderStep() {
  const step = game.plan[game.step];
  renderStars(game.step);
  renderActivityStrip();
  game.locked = false;

  const options = [
    { word: step.palabra, correct: true },
    { word: step.distractor, correct: false }
  ];
  if (Math.random() < 0.5) options.reverse();

  const box = document.getElementById('options');
  box.innerHTML = '';
  box.classList.remove('locked');
  options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option c' + i;
    btn.appendChild(pictoElement(opt.word));
    const w = document.createElement('span');
    w.className = 'word' + (opt.word.length > 8 ? ' long' : '');
    w.textContent = opt.word;
    btn.appendChild(w);
    btn.addEventListener('click', () => chooseOption(btn, opt));
    box.appendChild(btn);
  });
}

function chooseOption(btn, opt) {
  if (!game || game.locked || game.status !== 'in_progress') return;
  touchAppSession();
  const step = game.plan[game.step];

  if (!opt.correct) {
    game.errors[game.step] += 1;
    playErrorSound();
    btn.classList.remove('wrong');
    void btn.offsetWidth;
    btn.classList.add('wrong');
    setTimeout(() => btn.classList.add('disabled'), 450);
    return;
  }

  game.locked = true;
  document.getElementById('options').classList.add('locked');
  btn.classList.add('right');
  playCorrectSound();
  speak(step.palabra.toLowerCase());
  sendDeviceCommand('open', step.index);
  savePart(game, step, game.errors[game.step]);

  game.step += 1;
  renderStars(game.step);
  renderActivityStrip();

  const g = game;
  setTimeout(() => {
    if (game !== g || g.status !== 'in_progress') return;
    if (g.step >= 3) finishGame();
    else renderStep();
  }, 1100);
}

async function savePart(g, step, errors) {
  const id = g.attemptId || (await g.attemptPromise);
  if (!id) return;
  appSavePart({
    attemptId: id,
    partIndex: step.index,
    targetWord: step.palabra,
    distractorWord: step.distractor,
    errorType: step.tipo,
    errorsCount: errors
  });
}

function finishGame() {
  const g = game;
  g.status = 'completed';
  const seconds = Math.max(1, Math.round((Date.now() - g.startedAtMs) / 1000));
  Promise.resolve(g.attemptId || g.attemptPromise).then((id) => {
    if (id) completeExerciseAttempt(id, seconds);
  });
  sendDeviceCommand('finish');
  showDone(g);
}

function showDone(g) {
  const chips = document.getElementById('done-chips');
  chips.innerHTML = '';
  const words = [{ w: g.ficha.inicio }].concat(g.plan.map((p) => ({ w: p.palabra, hit: true })), [{ w: g.ficha.final }]);
  words.forEach((item) => {
    const c = document.createElement('div');
    c.className = 'done-chip' + (item.hit ? ' hit' : '');
    c.appendChild(pictoElement(item.w, true));
    const s = document.createElement('span');
    s.className = 'w';
    s.textContent = item.w;
    c.appendChild(s);
    chips.appendChild(c);
  });
  const sentence = sentenceOf(g.ficha);
  document.getElementById('done-sentence').textContent = sentence;
  const titles = ['¡Excelente!', '¡Muy bien!', '¡Lo lograste!', '¡Genial!'];
  document.getElementById('done-title').textContent = titles[Math.floor(Math.random() * titles.length)];

  showScreen('done');
  playVictoryFanfare();
  launchConfetti(110);
  setTimeout(() => { if (currentScreen() === 'done') speak(sentence); }, 900);
}

function abandonGame(useKeepalive) {
  const g = game;
  if (!g || g.status !== 'in_progress') return;
  g.status = 'abandoned';
  const seconds = Math.max(1, Math.round((Date.now() - g.startedAtMs) / 1000));
  if (useKeepalive) {
    if (g.attemptId) abandonExerciseAttempt(g.attemptId, seconds, true);
    return;
  }
  Promise.resolve(g.attemptId || g.attemptPromise).then((id) => {
    if (id) abandonExerciseAttempt(id, seconds, false);
  });
}

function askPause() {
  openModal({
    title: 'Pausa',
    text: '¿Quieres terminar esta ficha?',
    actions: [
      { label: 'Seguir jugando', style: 'navy' },
      { label: 'Terminar', style: 'soft', onClick: () => {
        abandonGame(false);
        game = null;
        sendDeviceCommand('finish');
        goToWait();
      } }
    ]
  });
}

/* ===================================================================
   MODAL
   =================================================================== */
function openModal({ title, text, html, actions }) {
  const modal = document.getElementById('modal');
  document.getElementById('modal-title').textContent = title || '';
  const body = document.getElementById('modal-text');
  if (html) body.innerHTML = html; else body.textContent = text || '';
  const box = document.getElementById('modal-actions');
  box.innerHTML = '';
  (actions || []).forEach((a) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = a.style === 'soft' ? 'btn-soft' : 'btn-navy';
    b.textContent = a.label;
    b.addEventListener('click', () => { closeModal(); if (a.onClick) a.onClick(); });
    box.appendChild(b);
  });
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
}

/* ===================================================================
   EXTRAS: agregar a inicio, pantalla siempre encendida
   =================================================================== */
function showInstallHintIfNeeded() {
  const hint = document.getElementById('install-hint');
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent || '');
  const standalone = window.navigator.standalone === true ||
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  let dismissed = false;
  try { dismissed = localStorage.getItem('tapit_install_hint_closed') === '1'; } catch (e) {}
  hint.style.display = isIos && !standalone && !dismissed ? 'flex' : 'none';
}

function closeInstallHint() {
  document.getElementById('install-hint').style.display = 'none';
  try { localStorage.setItem('tapit_install_hint_closed', '1'); } catch (e) {}
}

let wakeLock = null;
async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator && !document.hidden && !wakeLock) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    }
  } catch (e) { wakeLock = null; }
}

document.addEventListener('visibilitychange', () => {
  if (!currentFamilySession) return;
  if (document.hidden) {
    stopDevicePolling();
  } else {
    if (currentScreen() === 'wait') sendDeviceCommand('finish');
    ensureAppSession().then(() => startDevicePolling());
    requestWakeLock();
  }
});

window.addEventListener('pagehide', () => {
  if (!currentFamilySession) return;
  if ((game && game.status === 'in_progress') || currentScreen() === 'mode') {
    appSendCommandKeepalive(currentFamilySession.family_id, 'finish');
  }
  abandonGame(true);
});

/* ===================================================================
   INICIO
   =================================================================== */
function initApp() {
  fitStage();
  document.querySelectorAll('[data-login]').forEach((f) => f.addEventListener('submit', handleLoginSubmit));
  document.getElementById('btn-logout').addEventListener('click', askLogout);
  document.getElementById('btn-install-close').addEventListener('click', closeInstallHint);
  document.getElementById('btn-mode-back').addEventListener('click', leaveMode);
  document.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => startGame(b.dataset.mode)));
  document.getElementById('btn-pause').addEventListener('click', askPause);
  document.getElementById('btn-listen').addEventListener('click', () => { if (game) speak(sentenceOf(game.ficha)); });
  document.getElementById('btn-next').addEventListener('click', () => { game = null; goToWait(); });

  const saved = loadFamilySession();
  if (saved) {
    currentFamilySession = saved;
    onFamilyReady();
  } else {
    showScreen('login');
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp);
else initApp();
