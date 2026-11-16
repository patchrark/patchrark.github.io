/**
 * JUEGO DE ORACIONES Y ABSURDOS CON PICTOGRAMAS DE ARASAAC
 * Incluye discriminación visual, reconocimiento de voz y modulación de audio (chillona / gruesa).
 */

// ============================================================================
// CONFIGURACIÓN DE ORACIONES Y PICTOGRAMAS ARASAAC
// ============================================================================
const SENTENCES_DATA = {
  A: {
    id: 'A',
    name: 'ORACIÓN A',
    sentenceText: 'La niña come una sopa',
    // Título / Estado inicial
    initialContext: {
      title: 'LA',
      words: [{ word: 'LA', pictoId: 8476 }]
    },
    // Pasos de preguntas (absurdos y discriminación)
    steps: [
      {
        stepIndex: 1,
        prompt: '¿Quién? Elige la opción correcta:',
        options: [
          { word: 'NIÑA', pictoId: 2484, isCorrect: true },
          { word: 'NIÑO', pictoId: 2485, isCorrect: false }
        ]
      },
      {
        stepIndex: 2,
        prompt: '¿Qué hace? Elige la acción correcta:',
        options: [
          { word: 'COME', pictoId: 2349, isCorrect: true },
          { word: 'COMEN', pictoId: 5970, isCorrect: false }
        ]
      },
      {
        stepIndex: 3,
        prompt: '¿Cuánto o cuál? Elige la opción correcta:',
        options: [
          { word: 'UNAS', pictoId: 8475, isCorrect: false },
          { word: 'UNA', pictoId: 8474, isCorrect: true }
        ]
      }
    ],
    // Al finalizar se complementa automáticamente con "SOPA"
    autoComplete: { word: 'SOPA', pictoId: 2573 },
    // Palabras para la práctica y modulación de voz (las 3 palabras correctas elegidas)
    voiceWords: [
      { id: 'word-1', word: 'NIÑA', pictoId: 2484, matchTerms: ['niña', 'nina', 'la niña', 'chica'] },
      { id: 'word-2', word: 'COME', pictoId: 2349, matchTerms: ['come', 'comer', 'comiendo'] },
      { id: 'word-3', word: 'UNA', pictoId: 8474, matchTerms: ['una', 'uno', 'la una', 'un'] }
    ]
  },
  B: {
    id: 'B',
    name: 'ORACIÓN B',
    sentenceText: 'La chica lava los platos',
    // Título / Estado inicial
    initialContext: {
      title: 'LA',
      words: [{ word: 'LA', pictoId: 8476 }]
    },
    // Pasos de preguntas (absurdos y discriminación)
    steps: [
      {
        stepIndex: 1,
        prompt: '¿Quién realiza la acción? Elige la opción correcta:',
        options: [
          { word: 'CHICA', pictoId: 2484, isCorrect: true },
          { word: 'CHICAS', pictoId: 6974, isCorrect: false }
        ]
      },
      {
        stepIndex: 2,
        prompt: '¿Qué hace? Elige la acción correcta:',
        options: [
          { word: 'LAVA', pictoId: 8617, isCorrect: true },
          { word: 'COCINA', pictoId: 2342, isCorrect: false }
        ]
      },
      {
        stepIndex: 3,
        prompt: '¿Qué artículo corresponde? Elige:',
        options: [
          { word: 'LOS', pictoId: 8477, isCorrect: true },
          { word: 'LAS', pictoId: 7031, isCorrect: false }
        ]
      }
    ],
    // Al finalizar se complementa automáticamente con "PLATOS"
    autoComplete: { word: 'PLATOS', pictoId: 2532 },
    // Palabras para la práctica y modulación de voz (las 3 palabras correctas elegidas)
    voiceWords: [
      { id: 'b-word-1', word: 'CHICA', pictoId: 2484, matchTerms: ['chica', 'la chica', 'niña', 'la niña'] },
      { id: 'b-word-2', word: 'LAVA', pictoId: 8617, matchTerms: ['lava', 'lavar', 'lavando', 'fregar'] },
      { id: 'b-word-3', word: 'LOS', pictoId: 8477, matchTerms: ['los', 'el'] }
    ]
  },
  C: {
    id: 'C',
    name: 'ORACIÓN C',
    sentenceText: 'La mamá lee un libro',
    // Título / Estado inicial
    initialContext: {
      title: 'LA',
      words: [{ word: 'LA', pictoId: 8476 }]
    },
    // Pasos de preguntas (absurdos y discriminación)
    steps: [
      {
        stepIndex: 1,
        prompt: '¿Quién realiza la acción? Elige la opción correcta:',
        options: [
          { word: 'MAMÁ', pictoId: 2458, isCorrect: true },
          { word: 'PAPÁ', pictoId: 31146, isCorrect: false }
        ]
      },
      {
        stepIndex: 2,
        prompt: '¿Qué hace? Elige la acción correcta:',
        options: [
          { word: 'LEE', pictoId: 7141, isCorrect: true },
          { word: 'LEEN', pictoId: 39762, isCorrect: false }
        ]
      },
      {
        stepIndex: 3,
        prompt: '¿Cuánto o cuál? Elige la opción correcta:',
        options: [
          { word: 'UN', pictoId: 8474, isCorrect: true },
          { word: 'UNA', pictoId: 8476, isCorrect: false }
        ]
      }
    ],
    // Al finalizar se complementa automáticamente con "LIBRO"
    autoComplete: { word: 'LIBRO', pictoId: 2450 },
    // Palabras para la práctica y modulación de voz (las 3 palabras correctas elegidas)
    voiceWords: [
      { id: 'c-word-1', word: 'MAMÁ', pictoId: 2458, matchTerms: ['mama', 'mamá', 'la mama', 'la mamá', 'madre'] },
      { id: 'c-word-2', word: 'LEE', pictoId: 7141, matchTerms: ['lee', 'leer', 'leyendo'] },
      { id: 'c-word-3', word: 'UN', pictoId: 8474, matchTerms: ['un', 'uno', 'el'] }
    ]
  }
};

// ============================================================================
// CONFIGURACIÓN DE CATEGORÍAS (PUNTO DE ENGANCHE FUTURO)
// ============================================================================
const SENTENCE_CATEGORIES = [
  { id: 'categoria_1', label: 'Categoría 1' }, // Reemplazar con nombres reales
  { id: 'categoria_2', label: 'Categoría 2' },
  { id: 'categoria_3', label: 'Categoría 3' }
];

// ============================================================================
// ESTADO DE LA APLICACIÓN Y SESIÓN FAMILIAR
// ============================================================================
const SESSION_STORAGE_KEY = 'arasaac_family_session';

let currentFamilySession = null; // { family_id, family_label, login_session_id }
let currentAttemptState = null;

let currentSentenceKey = 'A';
let currentStepIndex = 0;
let accumulatedWords = [];
let currentAudioContext = null;
let activeAudioSource = null;

// Grabaciones de voz guardadas: { [wordId]: { blob, audioBuffer, isValidated } }
const voiceRecordings = {};

// ============================================================================
// SISTEMA DE AUDIO SINTETIZADO (Web Audio API)
// ============================================================================
function getAudioContext() {
  if (!currentAudioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    currentAudioContext = new AudioContextClass();
  }
  if (currentAudioContext.state === 'suspended') {
    currentAudioContext.resume();
  }
  return currentAudioContext;
}

// Sonido de Acierto (Campanita brillante)
function playCorrectSound() {
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + (idx * 0.08);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  } catch (e) {
    console.warn('Audio feedback error', e);
  }
}

// Sonido de Error ("Boing" suave / Oops)
function playErrorSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now); // A3
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.3); // baja a A2

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (e) {
    console.warn('Audio feedback error', e);
  }
}

// Fanfarria de victoria
function playVictoryFanfare() {
  try {
    const ctx = getAudioContext();
    const melody = [
      { f: 523.25, d: 0.12 }, // Do
      { f: 659.25, d: 0.12 }, // Mi
      { f: 783.99, d: 0.12 }, // Sol
      { f: 1046.50, d: 0.4 }  // Do alto
    ];
    let time = ctx.currentTime + 0.05;
    melody.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, time);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.3, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + note.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + note.d);
      time += note.d + 0.04;
    });
  } catch (e) {
    console.warn('Fanfare error', e);
  }
}

// ============================================================================
// GESTOR DE VOCES (TTS), SELECCIÓN DE LECTOR Y VELOCIDAD
// ============================================================================
let availableVoices = [];
let selectedVoice = null;
let currentVoiceRate = 0.9; // Velocidad clara por defecto

function initVoiceSelector() {
  const voiceSelect = document.getElementById('voice-select');
  const speedSelect = document.getElementById('voice-speed-select');
  const testBtn = document.getElementById('btn-test-voice');

  if (!('speechSynthesis' in window)) {
    if (voiceSelect) {
      voiceSelect.innerHTML = '<option value="">Síntesis de voz no disponible</option>';
    }
    return;
  }

  // Cargar velocidad guardada
  const savedSpeed = localStorage.getItem('arasaac_voice_speed');
  if (savedSpeed && speedSelect) {
    speedSelect.value = savedSpeed;
    currentVoiceRate = parseFloat(savedSpeed) || 0.9;
  }

  if (speedSelect) {
    speedSelect.addEventListener('change', () => {
      currentVoiceRate = parseFloat(speedSelect.value) || 0.9;
      localStorage.setItem('arasaac_voice_speed', currentVoiceRate);
    });
  }

  // Cargar opciones de voz
  populateVoiceOptions();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = populateVoiceOptions;
  }

  if (voiceSelect) {
    voiceSelect.addEventListener('change', () => {
      const voiceUri = voiceSelect.value;
      selectedVoice = availableVoices.find(v => (v.voiceURI || v.name) === voiceUri) || null;
      if (selectedVoice) {
        localStorage.setItem('arasaac_selected_voice', selectedVoice.voiceURI || selectedVoice.name);
      }
    });
  }

  if (testBtn) {
    testBtn.addEventListener('click', () => {
      speakText('¡Hola! Con esta voz leeré las oraciones y palabras del juego.');
    });
  }
}

function getVoiceQualityScore(voice) {
  const name = ((voice.name || '') + ' ' + (voice.voiceURI || '')).toLowerCase();
  // Priorizar voces naturales / neuronales modernas
  if (name.includes('natural')) return 5;
  if (name.includes('neural')) return 4;
  if (name.includes('google')) return 3;
  if (name.includes('online')) return 2;
  if (name.includes('helena') || name.includes('sabina') || name.includes('dalia') || name.includes('jorge')) return 2;
  return 1;
}

function populateVoiceOptions() {
  const voiceSelect = document.getElementById('voice-select');
  if (!voiceSelect) return;

  availableVoices = window.speechSynthesis.getVoices();
  if (!availableVoices || availableVoices.length === 0) return;

  // Filtrar voces en español prioritariamente
  const spanishVoices = availableVoices.filter(v => v.lang && v.lang.toLowerCase().startsWith('es'));
  const otherVoices = availableVoices.filter(v => !v.lang || !v.lang.toLowerCase().startsWith('es'));

  // Ordenar voces en español: poner primero las que son 'Natural', 'Neural', 'Google'
  spanishVoices.sort((a, b) => getVoiceQualityScore(b) - getVoiceQualityScore(a));

  voiceSelect.innerHTML = '';

  // Grupo Voces en Español
  if (spanishVoices.length > 0) {
    const esGroup = document.createElement('optgroup');
    esGroup.label = '🇪🇸 Voces en Español (Recomendadas)';

    spanishVoices.forEach(voice => {
      const opt = document.createElement('option');
      opt.value = voice.voiceURI || voice.name;
      const isNatural = getVoiceQualityScore(voice) >= 2;
      const badge = isNatural ? '✨ ' : '';
      opt.textContent = `${badge}${voice.name} (${voice.lang})`;
      esGroup.appendChild(opt);
    });
    voiceSelect.appendChild(esGroup);
  }

  // Grupo otras voces
  if (otherVoices.length > 0) {
    const otherGroup = document.createElement('optgroup');
    otherGroup.label = '🌐 Otras Voces del Sistema';
    otherVoices.slice(0, 15).forEach(voice => {
      const opt = document.createElement('option');
      opt.value = voice.voiceURI || voice.name;
      opt.textContent = `${voice.name} (${voice.lang})`;
      otherGroup.appendChild(opt);
    });
    voiceSelect.appendChild(otherGroup);
  }

  // Recuperar selección guardada o elegir la mejor voz natural por defecto
  const savedVoiceKey = localStorage.getItem('arasaac_selected_voice');
  let chosen = null;

  if (savedVoiceKey) {
    chosen = availableVoices.find(v => (v.voiceURI || v.name) === savedVoiceKey);
  }

  if (!chosen && spanishVoices.length > 0) {
    chosen = spanishVoices[0]; // La primera es la mejor según getVoiceQualityScore
  } else if (!chosen) {
    chosen = availableVoices[0];
  }

  if (chosen) {
    selectedVoice = chosen;
    voiceSelect.value = chosen.voiceURI || chosen.name;
  }
}

// Síntesis de voz (Text-To-Speech) con voz y velocidad personalizadas
function speakText(text, pitch = 1.05, rate = null) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  if (selectedVoice) {
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang || 'es-ES';
  } else {
    utterance.lang = 'es-ES';
  }

  utterance.pitch = pitch;
  utterance.rate = rate !== null ? rate : currentVoiceRate;

  window.speechSynthesis.speak(utterance);
}

// ============================================================================
// SISTEMA DE CONFETI CELEBRATORIO (Canvas Confetti puro)
// ============================================================================
const confettiCanvas = document.getElementById('confetti-canvas');
let confettiCtx = null;
let confettiParticles = [];
let confettiAnimationId = null;

function resizeConfettiCanvas() {
  if (!confettiCanvas) return;
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeConfettiCanvas);
resizeConfettiCanvas();

function triggerConfetti(duration = 2000, intensity = 60) {
  if (!confettiCanvas) return;
  confettiCtx = confettiCanvas.getContext('2d');
  resizeConfettiCanvas();

  const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  for (let i = 0; i < intensity; i++) {
    confettiParticles.push({
      x: window.innerWidth * (0.2 + Math.random() * 0.6),
      y: window.innerHeight * 0.4,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.7) * 16,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      alpha: 1
    });
  }

  if (!confettiAnimationId) {
    renderConfetti();
  }

  setTimeout(() => {
    // Las partículas desaparecerán progresivamente
  }, duration);
}

function renderConfetti() {
  if (!confettiCtx) return;
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    const p = confettiParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.35; // Gravedad
    p.rotation += p.vRot;
    p.alpha -= 0.008;

    if (p.alpha <= 0 || p.y > confettiCanvas.height) {
      confettiParticles.splice(i, 1);
      continue;
    }

    confettiCtx.save();
    confettiCtx.globalAlpha = Math.max(0, p.alpha);
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate((p.rotation * Math.PI) / 180);
    confettiCtx.fillStyle = p.color;
    confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    confettiCtx.restore();
  }

  if (confettiParticles.length > 0) {
    confettiAnimationId = requestAnimationFrame(renderConfetti);
  } else {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiAnimationId = null;
  }
}

// ============================================================================
// SESIÓN FAMILIAR Y PANTALLA DE ACCESO (SCREEN 0)
// ============================================================================
function saveFamilySession(sessionData) {
  currentFamilySession = sessionData;
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
  } catch (e) {
    console.warn('No se pudo guardar sesión en sessionStorage:', e);
  }
}

function loadFamilySession() {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.family_id && parsed.login_session_id) {
      return parsed;
    }
  } catch (e) {
    console.warn('Error leyendo sesión de sessionStorage:', e);
  }
  return null;
}

function clearFamilySession() {
  currentFamilySession = null;
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {}
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {}
}

function updateHeaderForSession() {
  const badge = document.getElementById('family-badge');
  const badgeLabel = document.getElementById('family-badge-label');
  const logoutBtn = document.getElementById('btn-logout');

  if (currentFamilySession) {
    if (badgeLabel) badgeLabel.textContent = currentFamilySession.family_label || 'Familia';
    if (badge) badge.style.display = 'inline-flex';
    if (logoutBtn) logoutBtn.style.display = 'inline-flex';
  } else {
    if (badge) badge.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
}

function showLoginError(message) {
  const errorEl = document.getElementById('login-error-msg');
  if (!errorEl) return;
  if (message) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  } else {
    errorEl.textContent = '';
    errorEl.style.display = 'none';
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();

  const codeInput = document.getElementById('family-code-input');
  const submitBtn = document.getElementById('btn-login-submit');
  const rawCode = codeInput ? codeInput.value.trim().toUpperCase() : '';

  if (!rawCode) {
    showLoginError('Por favor, escribe tu código de familia.');
    if (codeInput) codeInput.focus();
    return;
  }

  showLoginError('');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verificando...';
  }

  const result = await verifyFamilyCode(rawCode);

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Ingresar ▶';
  }

  if (!result.ok) {
    showLoginError(result.error || 'Código incorrecto.');
    if (codeInput) {
      codeInput.focus();
      codeInput.select();
    }
    return;
  }

  saveFamilySession({
    family_id: result.family_id,
    family_label: result.family_label,
    login_session_id: result.login_session_id
  });

  if (codeInput) codeInput.value = '';
  updateHeaderForSession();
  showScreen('screen-menu');
}

function logoutFamily() {
  stopActiveRecording();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  abandonCurrentAttemptIfActive(false);
  currentAttemptState = null;

  clearFamilySession();
  updateHeaderForSession();
  showLoginError('');
  showScreen('screen-login');

  const codeInput = document.getElementById('family-code-input');
  if (codeInput) {
    codeInput.value = '';
    codeInput.focus();
  }
}

function initLoginScreen() {
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('btn-logout');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginSubmit);
  }
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutFamily);
  }

  // Restaurar sesión en sessionStorage al recargar (F5) sin contar nuevo inicio de sesión
  const existingSession = loadFamilySession();
  if (existingSession) {
    currentFamilySession = existingSession;
    updateHeaderForSession();
    showScreen('screen-menu');
  } else {
    updateHeaderForSession();
    showScreen('screen-login');
    const codeInput = document.getElementById('family-code-input');
    if (codeInput) codeInput.focus();
  }
}

// ============================================================================
// INSTRUMENTACIÓN DE INTENTOS EN SUPABASE
// ============================================================================
function beginAttemptTracking(sentenceKey, sentence, selectedCategory) {
  const voiceErrorsInit = {};
  sentence.voiceWords.forEach((w) => {
    voiceErrorsInit[w.id] = 0;
  });

  const attemptState = {
    attemptId: null,
    attemptPromise: null,
    sentenceKey,
    sentenceText: sentence.sentenceText,
    selectedCategory: selectedCategory || null,
    startedAtMs: Date.now(),
    discriminationCompletedAtMs: null,
    discriminationErrors: { 1: 0, 2: 0, 3: 0 },
    voiceErrors: voiceErrorsInit,
    savedParts: {},
    status: 'in_progress'
  };

  currentAttemptState = attemptState;

  if (currentFamilySession && typeof startExerciseAttempt === 'function') {
    attemptState.attemptPromise = startExerciseAttempt({
      familyId: currentFamilySession.family_id,
      loginSessionId: currentFamilySession.login_session_id,
      sentenceKey,
      sentenceText: sentence.sentenceText,
      selectedCategory: attemptState.selectedCategory
    }).then((attemptId) => {
      attemptState.attemptId = attemptId;
      return attemptId;
    });
  } else {
    attemptState.attemptPromise = Promise.resolve(null);
  }
}

async function resolveAttemptId(attemptState) {
  if (!attemptState) return null;
  if (attemptState.attemptId) return attemptState.attemptId;
  if (attemptState.attemptPromise) {
    try {
      return await attemptState.attemptPromise;
    } catch (e) {
      return null;
    }
  }
  return null;
}

async function recordPartResult(partType, partIndex, targetWord, errorsCount, validationMethod = null) {
  const attemptState = currentAttemptState;
  if (!attemptState) return;

  const partKey = `${partType}_${partIndex}`;
  if (attemptState.savedParts[partKey]) return;
  attemptState.savedParts[partKey] = true;

  const attemptId = await resolveAttemptId(attemptState);
  if (!attemptId || typeof savePartResult !== 'function') return;

  await savePartResult({
    attemptId,
    partType,
    partIndex,
    targetWord,
    errorsCount,
    validationMethod
  });
}

async function completeCurrentAttempt(attemptState, durationSeconds) {
  if (!attemptState) return;
  const attemptId = await resolveAttemptId(attemptState);
  if (!attemptId || typeof completeExerciseAttempt !== 'function') return;

  await completeExerciseAttempt(attemptId, durationSeconds);
}

function abandonCurrentAttemptIfActive(useKeepalive = false) {
  const attemptState = currentAttemptState;
  if (!attemptState || attemptState.status !== 'in_progress') return;

  attemptState.status = 'abandoned';
  const durationSeconds = Math.max(1, Math.round((Date.now() - attemptState.startedAtMs) / 1000));

  if (useKeepalive) {
    if (attemptState.attemptId && typeof abandonExerciseAttempt === 'function') {
      abandonExerciseAttempt(attemptState.attemptId, durationSeconds, true);
    }
    return;
  }

  resolveAttemptId(attemptState).then((attemptId) => {
    if (attemptId && typeof abandonExerciseAttempt === 'function') {
      abandonExerciseAttempt(attemptId, durationSeconds, false);
    }
  });
}

window.addEventListener('pagehide', () => {
  abandonCurrentAttemptIfActive(true);
});

// ============================================================================
// NAVEGACIÓN ENTRE PANTALLAS
// ============================================================================
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');

  const backBtn = document.getElementById('btn-back-menu');
  if (backBtn) {
    const showBack = screenId !== 'screen-menu' && screenId !== 'screen-login';
    backBtn.style.display = showBack ? 'inline-flex' : 'none';
  }

  const voiceBar = document.querySelector('.voice-settings-bar');
  if (voiceBar) {
    voiceBar.style.display = screenId === 'screen-login' ? 'none' : 'flex';
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToMenu() {
  if (!currentFamilySession) {
    showScreen('screen-login');
    return;
  }

  stopActiveRecording();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  abandonCurrentAttemptIfActive(false);
  currentAttemptState = null;

  showScreen('screen-menu');
}

document.getElementById('btn-back-menu').addEventListener('click', goToMenu);

// ============================================================================
// MODAL PARA ORACIONES VACÍAS (B Y C)
// ============================================================================
function showEmptyModal(sentenceKey) {
  const modal = document.getElementById('empty-modal');
  const title = document.getElementById('modal-sentence-title');
  if (title) title.textContent = `ORACIÓN ${sentenceKey} (En Construcción)`;
  if (modal) modal.classList.add('active');
}

function closeEmptyModal() {
  const modal = document.getElementById('empty-modal');
  if (modal) modal.classList.remove('active');
}

// ============================================================================
// INICIO Y SECUENCIA DE PREGUNTAS (ORACIÓN A, B, C)
// ============================================================================
function startSentenceActivity(sentenceKey, selectedCategory = null) {
  if (!currentFamilySession) {
    showScreen('screen-login');
    return;
  }

  const sentence = SENTENCES_DATA[sentenceKey];
  if (!sentence) {
    showEmptyModal(sentenceKey);
    return;
  }

  // Si había un intento inconcluso (ej. al pulsar "Repetir"), marcarlo como abandonado
  abandonCurrentAttemptIfActive(false);

  // Detener grabaciones o audios previos y reiniciar estado de voz para esta oración
  stopActiveRecording();
  if (activeAudioSource) {
    try { activeAudioSource.stop(); } catch (e) {}
    activeAudioSource = null;
  }
  sentence.voiceWords.forEach((w) => {
    delete voiceRecordings[w.id];
  });

  currentSentenceKey = sentenceKey;
  currentStepIndex = 0;
  // Inicializamos la oración con el título/palabra inicial: "LA"
  accumulatedWords = [...sentence.initialContext.words];

  // Iniciar registro del intento en Supabase y cronómetro
  beginAttemptTracking(sentenceKey, sentence, selectedCategory);

  showScreen('screen-activity');
  renderCurrentStep();
  // Pronunciar inicio
  speakText(sentence.initialContext.title);
}

function renderCurrentStep() {
  const sentence = SENTENCES_DATA[currentSentenceKey];
  const step = sentence.steps[currentStepIndex];
  const totalSteps = sentence.steps.length;

  // Actualizar progreso
  const stepText = document.getElementById('activity-step-text');
  const progressFill = document.getElementById('activity-progress-fill');
  if (stepText) stepText.textContent = `Paso ${currentStepIndex + 1} de ${totalSteps}`;
  if (progressFill) progressFill.style.width = `${((currentStepIndex + 1) / totalSteps) * 100}%`;

  // Renderizar cinta acumulativa
  renderAccumulatedSentence();

  // Pregunta
  const questionTitle = document.getElementById('question-title');
  const questionSubtitle = document.getElementById('question-subtitle');
  if (questionTitle) questionTitle.textContent = step.prompt;
  if (questionSubtitle) questionSubtitle.textContent = 'Toca el pictograma correcto para continuar:';

  // Limpiar mensaje de feedback
  const feedback = document.getElementById('feedback-banner');
  if (feedback) {
    feedback.className = 'feedback-banner';
    feedback.textContent = '';
  }

  // Renderizar opciones (los dos cuadrados con pictogramas)
  const optionsGrid = document.getElementById('options-grid');
  optionsGrid.innerHTML = '';

  step.options.forEach((opt, idx) => {
    const card = document.createElement('div');
    card.className = 'picto-option-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.dataset.index = idx;

    card.innerHTML = `
      <div class="picto-image-box">
        <img src="https://static.arasaac.org/pictograms/${opt.pictoId}/${opt.pictoId}_500.png" 
             alt="${opt.word}" 
             onerror="this.src='https://api.arasaac.org/api/pictograms/${opt.pictoId}'">
      </div>
      <div class="picto-label">${opt.word}</div>
      <div class="error-overlay">❌</div>
      <div class="success-overlay">⭐</div>
    `;

    card.addEventListener('click', () => handleOptionSelection(card, opt));
    optionsGrid.appendChild(card);
  });
}

function renderAccumulatedSentence() {
  const container = document.getElementById('accumulator-container');
  if (!container) return;
  container.innerHTML = '';

  accumulatedWords.forEach(w => {
    const tag = document.createElement('div');
    tag.className = 'picto-tag';
    tag.innerHTML = `
      <img src="https://static.arasaac.org/pictograms/${w.pictoId}/${w.pictoId}_500.png" alt="${w.word}">
      <span>${w.word}</span>
    `;
    container.appendChild(tag);
  });

  // Espacio pendiente
  const placeholder = document.createElement('div');
  placeholder.className = 'picto-tag placeholder';
  placeholder.innerHTML = '<span>¿...?</span>';
  container.appendChild(placeholder);
}

// Manejar la selección del usuario
function handleOptionSelection(cardElement, option) {
  const sentence = SENTENCES_DATA[currentSentenceKey];
  const step = sentence.steps[currentStepIndex];
  const feedback = document.getElementById('feedback-banner');

  if (option.isCorrect) {
    // CORRECTO:
    // 1. Iluminación y celebración
    cardElement.classList.remove('incorrect');
    cardElement.classList.add('correct');

    playCorrectSound();
    triggerConfetti(1200, 35);
    speakText(`¡Muy bien! ${option.word}`);

    if (feedback) {
      feedback.className = 'feedback-banner success';
      feedback.textContent = `¡Correcto! Es "${option.word}" ⭐`;
    }

    // Registrar paso de discriminación en Supabase
    if (currentAttemptState) {
      const stepErrors = currentAttemptState.discriminationErrors[step.stepIndex] || 0;
      recordPartResult('discrimination_step', step.stepIndex, option.word, stepErrors, null);
    }

    // Agregar palabra elegida a la oración acumulada
    accumulatedWords.push({ word: option.word, pictoId: option.pictoId });

    // Deshabilitar clics adicionales temporalmente
    const allCards = document.querySelectorAll('.picto-option-card');
    allCards.forEach(c => c.style.pointerEvents = 'none');

    setTimeout(() => {
      currentStepIndex++;
      if (currentStepIndex < sentence.steps.length) {
        renderCurrentStep();
      } else {
        // Fin de los pasos: Completar automáticamente la oración
        finishSentenceWithAutoCompletion();
      }
    }, 1200);

  } else {
    // INCORRECTO:
    // 1. Mostrar X, iluminar en rojo, sonido boing, no avanza
    if (currentAttemptState) {
      currentAttemptState.discriminationErrors[step.stepIndex] =
        (currentAttemptState.discriminationErrors[step.stepIndex] || 0) + 1;
    }

    cardElement.classList.add('incorrect');
    playErrorSound();
    speakText(`Esa no es. ¡Prueba otra vez!`);

    if (feedback) {
      feedback.className = 'feedback-banner error';
      feedback.textContent = `¡Ups! Inténtalo de nuevo. ¿Cuál es la palabra correcta?`;
    }

    // Quitar la clase de error después de que termine la animación de sacudida
    setTimeout(() => {
      cardElement.classList.remove('incorrect');
    }, 900);
  }
}

// ============================================================================
// COMPLEMENTACIÓN AUTOMÁTICA Y CELEBRACIÓN DE ORACIÓN COMPLETA
// ============================================================================
function finishSentenceWithAutoCompletion() {
  const sentence = SENTENCES_DATA[currentSentenceKey];

  // Mantener cronómetro total corriendo hasta completar screen-voice (Opción B)
  if (currentAttemptState) {
    currentAttemptState.discriminationCompletedAtMs = Date.now();
  }

  // Complemento automático con "SOPA"
  const autoWord = sentence.autoComplete;
  accumulatedWords.push({ word: autoWord.word, pictoId: autoWord.pictoId, isAuto: true });

  showScreen('screen-complete');
  playVictoryFanfare();
  triggerConfetti(3500, 80);

  // Renderizar cinta completa con todos los pictogramas
  const strip = document.getElementById('full-sentence-strip');
  strip.innerHTML = '';

  accumulatedWords.forEach(w => {
    const card = document.createElement('div');
    card.className = `sentence-picto-card ${w.isAuto ? 'auto-added' : ''}`;
    card.innerHTML = `
      <img src="https://static.arasaac.org/pictograms/${w.pictoId}/${w.pictoId}_500.png" alt="${w.word}">
      <span class="word">${w.word}</span>
      ${w.isAuto ? '<span class="auto-badge">Auto</span>' : ''}
    `;
    strip.appendChild(card);
  });

  // Leer la oración completa en voz alta
  setTimeout(() => {
    speakCurrentSentence();
  }, 600);
}

function speakCurrentSentence() {
  const sentence = SENTENCES_DATA[currentSentenceKey];
  speakText(sentence.sentenceText);
}

// ============================================================================
// PANTALLA DE GRABACIÓN Y MODULACIÓN DE VOZ (3 PALABRAS)
// ============================================================================
function goToVoicePractice() {
  showScreen('screen-voice');
  renderVoicePracticeRows();
}

function renderVoicePracticeRows() {
  const sentence = SENTENCES_DATA[currentSentenceKey];
  const list = document.getElementById('voice-rows-list');
  list.innerHTML = '';

  sentence.voiceWords.forEach((item, idx) => {
    const existingRec = voiceRecordings[item.id];
    const isReady = existingRec && existingRec.isValidated;

    const row = document.createElement('div');
    row.className = `word-voice-row ${isReady ? 'recorded-success' : ''}`;
    row.id = `row-${item.id}`;

    row.innerHTML = `
      <!-- Pictograma e info de la palabra -->
      <div class="row-word-info">
        <img class="row-picto-img" 
             src="https://static.arasaac.org/pictograms/${item.pictoId}/${item.pictoId}_500.png" 
             alt="${item.word}">
        <div class="row-text">
          <span class="word-title">${item.word}</span>
          <button class="listen-word-btn" onclick="speakText('${item.word}')">
            🔊 Escuchar modelo
          </button>
        </div>
      </div>

      <!-- Grabación y validación por voz -->
      <div class="row-mic-section">
        <button id="btn-rec-${item.id}" class="btn-record" onclick="toggleVoiceRecording('${item.id}', '${item.word}')">
          🎙️ Grabar Voz
        </button>
        <span id="status-${item.id}" class="record-status-text ${isReady ? 'ok' : ''}">
          ${isReady ? '✅ ¡Palabra correcta y guardada!' : 'Presiona para grabar'}
        </span>
        <button id="btn-approve-${item.id}" class="btn-manual-approve" style="display: none;" onclick="manualApproveWord('${item.id}')">
          👍 Aprobar pronunciación manualmente
        </button>
      </div>

      <!-- Controles de modulación y replay -->
      <div class="row-playback-section">
        <div class="playback-controls">
          <button id="btn-play-normal-${item.id}" 
                  class="playback-btn btn-replay-normal" 
                  ${!isReady ? 'disabled' : ''} 
                  onclick="playRecordedAudioEffect('${item.id}', 'normal')">
            🔁 Escuchar Normal
          </button>
          
          <button id="btn-play-squeaky-${item.id}" 
                  class="playback-btn btn-squeaky" 
                  ${!isReady ? 'disabled' : ''} 
                  onclick="playRecordedAudioEffect('${item.id}', 'squeaky')"
                  title="Efecto de ardilla / chillona">
            🐿️ Voz Chillona
          </button>
          
          <button id="btn-play-deep-${item.id}" 
                  class="playback-btn btn-deep" 
                  ${!isReady ? 'disabled' : ''} 
                  onclick="playRecordedAudioEffect('${item.id}', 'deep')"
                  title="Efecto monstruo / gruesa">
            🐻 Voz Gruesa
          </button>
        </div>
      </div>
    `;

    list.appendChild(row);
  });

  const repeatBtn = document.getElementById('btn-repeat-activity');
  if (repeatBtn) {
    repeatBtn.textContent = `🔄 Repetir Juego (${sentence.name})`;
  }
}

// ============================================================================
// GRABACIÓN DE AUDIO (MediaRecorder) Y RECONOCIMIENTO (SpeechRecognition)
// ============================================================================
let activeMediaRecorder = null;
let activeRecordingId = null;
let activeSpeechRecognizer = null;
let recordedAudioChunks = [];

function toggleVoiceRecording(wordId, targetWord) {
  var recBtn = document.getElementById('btn-rec-' + wordId);
  var statusLabel = document.getElementById('status-' + wordId);

  // Si ya está grabando esta misma palabra, detenemos
  if (activeRecordingId === wordId && activeMediaRecorder && activeMediaRecorder.state === 'recording') {
    stopActiveRecording();
    return;
  }

  // Si estaba grabando otra palabra, paramos primero
  if (activeMediaRecorder && activeMediaRecorder.state === 'recording') {
    stopActiveRecording();
  }

  navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
    getAudioContext(); // Activar contexto

    recordedAudioChunks = [];
    activeRecordingId = wordId;

    // 1. Configurar MediaRecorder
    activeMediaRecorder = new MediaRecorder(stream);
    activeMediaRecorder.ondataavailable = function(e) {
      if (e.data && e.data.size > 0) {
        recordedAudioChunks.push(e.data);
      }
    };

    activeMediaRecorder.onstop = function() {
      var audioBlob = new Blob(recordedAudioChunks, { type: 'audio/webm; codecs=opus' });
      // Detener los tracks del micrófono
      stream.getTracks().forEach(function(track) { track.stop(); });

      // Decodificar a AudioBuffer usando FileReader para máxima compatibilidad
      var reader = new FileReader();
      reader.onloadend = function() {
        var arrayBuffer = reader.result;
        var ctx = getAudioContext();
        ctx.decodeAudioData(arrayBuffer, function(decodedBuffer) {
          voiceRecordings[wordId] = voiceRecordings[wordId] || {};
          voiceRecordings[wordId].blob = audioBlob;
          voiceRecordings[wordId].audioBuffer = decodedBuffer;
        }, function(decodeErr) {
          console.warn('Error decodificando audio buffer:', decodeErr);
        });
      };
      reader.readAsArrayBuffer(audioBlob);

      recBtn.classList.remove('recording');
      recBtn.innerHTML = '🎙️ Grabar de nuevo';

      if (!voiceRecordings[wordId] || !voiceRecordings[wordId].isValidated) {
        const approveBtn = document.getElementById(`btn-approve-${wordId}`);
        if (approveBtn) approveBtn.style.display = 'inline-block';
        if (statusLabel && statusLabel.classList.contains('listening')) {
          statusLabel.className = 'record-status-text';
          statusLabel.textContent = `Audio grabado. ¿Pronunciaste "${targetWord}"?`;
        }
      }
    };

    activeMediaRecorder.start();
    recBtn.classList.add('recording');
    recBtn.innerHTML = '⏹️ Detener Grabación';

    if (statusLabel) {
      statusLabel.className = 'record-status-text listening';
      statusLabel.textContent = '🎤 Escuchando... Di "' + targetWord + '"';
    }

    // 2. Configurar Reconocimiento de Voz (Web Speech API)
    startSpeechRecognition(wordId, targetWord);

  }).catch(function(err) {
    console.error('Error accediendo al micrófono:', err);
    if (statusLabel) {
      statusLabel.textContent = '⚠️ Permiso de micrófono denegado.';
    }
    alert('Por favor, permite el acceso al micrófono en tu navegador para practicar la voz.');
  });
}

function stopActiveRecording() {
  if (activeMediaRecorder && activeMediaRecorder.state === 'recording') {
    activeMediaRecorder.stop();
  }
  if (activeSpeechRecognizer) {
    try { activeSpeechRecognizer.stop(); } catch (e) {}
  }
}

function startSpeechRecognition(wordId, targetWord) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const statusLabel = document.getElementById(`status-${wordId}`);
  const approveBtn = document.getElementById(`btn-approve-${wordId}`);

  if (!SpeechRecognition) {
    console.warn('SpeechRecognition no está soportado en este navegador');
    if (statusLabel) {
      statusLabel.textContent = '🎙️ Grabando audio (Reconocimiento no disponible, pulsa aprobar)';
    }
    if (approveBtn) approveBtn.style.display = 'inline-block';
    return;
  }

  activeSpeechRecognizer = new SpeechRecognition();
  activeSpeechRecognizer.lang = 'es-ES';
  activeSpeechRecognizer.continuous = false;
  activeSpeechRecognizer.interimResults = false;

  activeSpeechRecognizer.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim().toLowerCase();
    console.log(`Reconocido: "${transcript}" para palabra objetivo: "${targetWord}"`);

    // Comprobar coincidencia
    const matched = checkWordMatch(wordId, transcript);
    if (matched) {
      handleWordRecognizedSuccess(wordId, targetWord, transcript);
    } else {
      handleWordRecognizedFail(wordId, targetWord, transcript);
    }
  };

  activeSpeechRecognizer.onerror = (event) => {
    console.warn('Speech recognition error:', event.error);
    if (statusLabel && activeRecordingId === wordId) {
      statusLabel.className = 'record-status-text';
      statusLabel.textContent = `Audio grabado. ¿Pronunciaste "${targetWord}"?`;
    }
    if (approveBtn) approveBtn.style.display = 'inline-block';
  };

  activeSpeechRecognizer.onend = () => {
    if ((!voiceRecordings[wordId] || !voiceRecordings[wordId].isValidated) && activeRecordingId === wordId) {
      if (approveBtn) approveBtn.style.display = 'inline-block';
      if (statusLabel && statusLabel.classList.contains('listening')) {
        statusLabel.className = 'record-status-text';
        statusLabel.textContent = `Audio grabado. ¿Pronunciaste "${targetWord}"?`;
      }
    }
  };

  try {
    activeSpeechRecognizer.start();
  } catch (e) {
    console.warn('Error iniciando SpeechRecognition:', e);
  }
}

function checkWordMatch(wordId, recognizedText) {
  const sentence = SENTENCES_DATA[currentSentenceKey];
  const item = sentence.voiceWords.find(w => w.id === wordId);
  if (!item) return false;

  const cleanText = recognizedText.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  
  // Buscar coincidencia en los términos permitidos
  return item.matchTerms.some(term => {
    const cleanTerm = term.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    return cleanText.includes(cleanTerm) || cleanTerm.includes(cleanText);
  });
}

function markVoiceWordAsValidated(wordId, validationMethod, statusText, confettiCount) {
  voiceRecordings[wordId] = voiceRecordings[wordId] || {};
  voiceRecordings[wordId].isValidated = true;

  playCorrectSound();
  triggerConfetti(validationMethod === 'speech' ? 1500 : 1000, confettiCount);

  const statusLabel = document.getElementById(`status-${wordId}`);
  if (statusLabel) {
    statusLabel.className = 'record-status-text ok';
    statusLabel.textContent = statusText;
  }

  const approveBtn = document.getElementById(`btn-approve-${wordId}`);
  if (approveBtn) approveBtn.style.display = 'none';

  const row = document.getElementById(`row-${wordId}`);
  if (row) row.classList.add('recorded-success');

  // Habilitar botones de reproducción y modulación
  enablePlaybackButtons(wordId);

  // Registrar parte de voz en Supabase y completar intento si las 3 palabras están listas
  const sentence = SENTENCES_DATA[currentSentenceKey];
  if (sentence && currentAttemptState) {
    const wordIdx = sentence.voiceWords.findIndex(w => w.id === wordId);
    if (wordIdx !== -1) {
      const targetItem = sentence.voiceWords[wordIdx];
      const errorsCount = currentAttemptState.voiceErrors[wordId] || 0;
      recordPartResult('voice_word', wordIdx + 1, targetItem.word, errorsCount, validationMethod);
    }

    const allValidated = sentence.voiceWords.every(
      w => voiceRecordings[w.id] && voiceRecordings[w.id].isValidated === true
    );
    if (allValidated && currentAttemptState.status === 'in_progress') {
      currentAttemptState.status = 'completed';
      const durationSeconds = Math.max(1, Math.round((Date.now() - currentAttemptState.startedAtMs) / 1000));
      completeCurrentAttempt(currentAttemptState, durationSeconds);
    }
  }
}

function handleWordRecognizedSuccess(wordId, targetWord, transcript) {
  stopActiveRecording();
  markVoiceWordAsValidated(
    wordId,
    'speech',
    `⭐ ¡Excelente pronunciación! (${transcript})`,
    40
  );
}

function handleWordRecognizedFail(wordId, targetWord, transcript) {
  stopActiveRecording();

  if (currentAttemptState) {
    currentAttemptState.voiceErrors[wordId] = (currentAttemptState.voiceErrors[wordId] || 0) + 1;
  }

  const statusLabel = document.getElementById(`status-${wordId}`);
  if (statusLabel) {
    statusLabel.className = 'record-status-text';
    statusLabel.textContent = `Dijiste: "${transcript}". ¡Inténtalo de nuevo con "${targetWord}"!`;
  }

  // Permitir al profesor / terapeuta aprobar manualmente si lo desea
  const approveBtn = document.getElementById(`btn-approve-${wordId}`);
  if (approveBtn) approveBtn.style.display = 'inline-block';
}

function manualApproveWord(wordId) {
  markVoiceWordAsValidated(
    wordId,
    'manual',
    '⭐ ¡Audio validado y guardado!',
    30
  );
}

function enablePlaybackButtons(wordId) {
  ['btn-play-normal', 'btn-play-squeaky', 'btn-play-deep'].forEach(prefix => {
    const btn = document.getElementById(`${prefix}-${wordId}`);
    if (btn) btn.disabled = false;
  });
}

// ============================================================================
// MODULACIÓN DE VOZ (CHILLONA / GRUESA / NORMAL)
// ============================================================================
function playRecordedAudioEffect(wordId, effectType) {
  const rec = voiceRecordings[wordId];
  if (!rec || !rec.audioBuffer) {
    alert('Aún no has grabado tu voz para esta palabra.');
    return;
  }

  try {
    const ctx = getAudioContext();

    // Detener reproducción anterior si existe
    if (activeAudioSource) {
      try { activeAudioSource.stop(); } catch (e) {}
    }

    const source = ctx.createBufferSource();
    source.buffer = rec.audioBuffer;

    if (effectType === 'squeaky') {
      // 🐿️ VOZ CHILLONA (PlaybackRate acelerado a 1.6 + ecualizador de agudos)
      source.playbackRate.value = 1.6;

      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 600;

      source.connect(highpass);
      highpass.connect(ctx.destination);

    } else if (effectType === 'deep') {
      // 🐻 VOZ GRUESA (PlaybackRate ralentizado a 0.72 + ecualizador de graves)
      source.playbackRate.value = 0.72;

      const bass = ctx.createBiquadFilter();
      bass.type = 'lowpass';
      bass.frequency.value = 1200;

      source.connect(bass);
      bass.connect(ctx.destination);

    } else {
      // 🔁 VOZ NORMAL (Velocidad 1.0)
      source.playbackRate.value = 1.0;
      source.connect(ctx.destination);
    }

    activeAudioSource = source;
    source.start(0);

    // Animación en el botón correspondiente
    const btn = document.getElementById(`btn-play-${effectType}-${wordId}`);
    if (btn) {
      btn.style.transform = 'scale(0.95)';
      setTimeout(() => btn.style.transform = '', 200);
    }

  } catch (err) {
    console.error('Error reproduciendo efecto de audio:', err);
  }
}

// Inicialización de sesión familiar, selector de voces y eventos
function initApp() {
  initVoiceSelector();
  initLoginScreen();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
