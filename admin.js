/**
 * TAPit - Pagina de resumen privada (solo administrador).
 * Requiere iniciar sesion con un usuario de Supabase Auth cuyo correo
 * este en la tabla admin_emails.
 */

// Oraciones disponibles para asignar a las fichas (deben coincidir con SENTENCES_DATA de app.js)
// Las fichas salen del banco (fichas.js)
const SENTENCE_OPTIONS = Object.keys(FICHAS).map((key) => {
  const f = FICHAS[key];
  const text = [f.inicio].concat(f.tapas.map((t) => t.palabra), [f.final]).join(' ').toLowerCase();
  return { key, text: text.charAt(0).toUpperCase() + text.slice(1) };
});

const MODE_LABEL = { numero: 'Número', genero: 'Género' };
const TYPE_LABEL = { numero: 'núm', genero: 'gén', absurdo: 'abs' };

function errorsByType(attempts) {
  const t = { numero: 0, genero: 0, absurdo: 0 };
  attempts.forEach((a) => (a.errors || []).forEach((p) => {
    if (p.error_type && t[p.error_type] !== undefined) t[p.error_type] += p.errors || 0;
  }));
  return t;
}

const REFRESH_MS = 10000;
const TZ = 'America/Lima';

let dashData = null;
let refreshTimer = null;
let cardsDirty = false;

const $ = (id) => document.getElementById(id);

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
function esc(v) {
  return String(v === null || v === undefined ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-PE', {
    timeZone: TZ, day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });
}

function fmtDay(iso) {
  return new Date(iso).toLocaleDateString('es-PE', { timeZone: TZ, weekday: 'short', day: '2-digit', month: 'short' });
}

function dayKey(iso) {
  // AAAA-MM-DD en hora de Lima
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ });
}

function ago(iso) {
  if (!iso) return 'nunca';
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `hace ${s} s`;
  const m = Math.round(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  if (h < 48) return `hace ${h} h`;
  return `hace ${Math.round(h / 24)} días`;
}

function minutesBetween(a, b) {
  return Math.max(0, Math.round((new Date(b) - new Date(a)) / 60000));
}

function sentenceText(key) {
  const o = SENTENCE_OPTIONS.find((x) => x.key === key);
  return o ? o.text : '';
}

function attemptStatus(a) {
  if (a.status === 'completed') return { cls: 'done', label: 'Completada' };
  if (a.status === 'abandoned') return { cls: 'aband', label: 'Abandonada' };
  const old = Date.now() - new Date(a.started_at).getTime() > 30 * 60000;
  return old ? { cls: 'aband', label: 'Sin terminar' } : { cls: 'prog', label: 'En curso' };
}

function totalErrors(a) {
  return (a.errors || []).reduce((s, p) => s + (p.errors || 0), 0);
}

// ---------------------------------------------------------------------------
// Acceso
// ---------------------------------------------------------------------------
async function showLogin(message) {
  stopRefresh();
  $('view-dash').classList.add('hide');
  $('view-login').classList.remove('hide');
  $('login-err').textContent = message || '';
}

async function handleLogin(e) {
  e.preventDefault();
  const client = getSupabaseClient();
  if (!client) return showLogin('No se pudo cargar Supabase. Revisa tu conexión.');
  $('login-btn').disabled = true;
  $('login-err').textContent = '';
  const { error } = await client.auth.signInWithPassword({
    email: $('email').value.trim(),
    password: $('password').value
  });
  $('login-btn').disabled = false;
  if (error) {
    $('login-err').textContent = 'Correo o contraseña incorrectos.';
    return;
  }
  startDashboard();
}

async function handleLogout() {
  const client = getSupabaseClient();
  if (client) await client.auth.signOut();
  showLogin('');
}

// ---------------------------------------------------------------------------
// Datos
// ---------------------------------------------------------------------------
async function loadData() {
  const client = getSupabaseClient();
  if (!client) return;
  const { data, error } = await client.rpc('admin_get_data', { p_days: Number($('days').value) });
  if (error) {
    console.warn(error);
    $('live').innerHTML = '<span class="dot" style="background:#f97316"></span>Sin conexión, reintentando...';
    return;
  }
  if (!data || data.ok !== true) {
    await showLogin('Esta cuenta no tiene permiso para ver el resumen.');
    return;
  }
  dashData = data;
  $('live').innerHTML = '<span class="dot"></span>En vivo · ' +
    new Date().toLocaleTimeString('es-PE', { timeZone: TZ, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  render();
}

function startRefresh() {
  stopRefresh();
  refreshTimer = setInterval(loadData, REFRESH_MS);
}

function stopRefresh() {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = null;
}

async function startDashboard() {
  $('view-login').classList.add('hide');
  $('view-dash').classList.remove('hide');
  await loadData();
  startRefresh();
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------
function render() {
  const d = dashData;
  const famName = {};
  d.families.forEach((f) => { famName[f.id] = f.name; });

  renderFamilies(d);
  renderDaily(d, famName);
  renderSessions(d, famName);
  if (!cardsDirty) renderCards(d);
  renderEvents(d, famName);
}

function renderFamilies(d) {
  const html = d.families.map((f) => {
    const dev = d.devices.find((x) => x.family_id === f.id);
    const sessions = d.sessions.filter((s) => s.family_id === f.id);
    const attempts = d.attempts.filter((a) => a.family_id === f.id);
    const reads = d.events.filter((e) => e.family_id === f.id && e.type === 'card_read').length;
    const done = attempts.filter((a) => a.status === 'completed').length;
    const aband = attempts.length - done;
    const errors = attempts.reduce((s, a) => s + totalErrors(a), 0);
    const perSession = sessions.length ? (attempts.length / sessions.length).toFixed(1) : '0';
    const lastOpen = sessions.length ? sessions[0].started_at : null;
    const byType = errorsByType(attempts);
    const nNum = attempts.filter((a) => a.mode === 'numero').length;
    const nGen = attempts.filter((a) => a.mode === 'genero').length;

    const pill = dev
      ? (dev.online
        ? '<span class="pill on"><span class="dot"></span>Conectado</span>'
        : `<span class="pill off"><span class="dot"></span>Desconectado</span>`)
      : '<span class="pill"><span class="dot"></span>Sin aparato</span>';

    return `
      <div class="card">
        <div class="fam-head">
          <div>
            <div class="fam-name">${esc(f.name)}</div>
            <div class="fam-code">${esc(f.code)}${dev ? ' · ' + esc(dev.code) : ''}</div>
          </div>
          ${pill}
        </div>
        <div class="kpis">
          <div class="kpi"><b>${sessions.length}</b><span>Sesiones</span></div>
          <div class="kpi"><b>${attempts.length}</b><span>Fichas jugadas</span></div>
          <div class="kpi"><b>${done}</b><span>Completadas</span></div>
          <div class="kpi"><b>${aband}</b><span>Sin completar</span></div>
          <div class="kpi"><b>${errors}</b><span>Errores</span></div>
          <div class="kpi"><b>${perSession}</b><span>Fichas / sesión</span></div>
        </div>
        <div class="meta">
          Última apertura de la app: <b>${fmtDateTime(lastOpen)}</b><br>
          Modo elegido: <b>Número ${nNum}</b> · <b>Género ${nGen}</b><br>
          Errores por tipo: <b>número ${byType.numero}</b> · <b>género ${byType.genero}</b> · <b>absurdo ${byType.absurdo}</b><br>
          Fichas acercadas al aparato: <b>${reads}</b><br>
          Aparato visto por última vez: <b>${dev ? ago(dev.last_seen_at) : '—'}</b>
        </div>
        ${dev ? `<div class="meta-actions">
          <button class="ghost small" onclick="sendWifiReset('${dev.id}', '${esc(dev.code)}')">Reconfigurar WiFi</button>
        </div>` : ''}
      </div>`;
  }).join('');
  $('families').innerHTML = html || '<div class="empty">No hay familias.</div>';
}

function renderDaily(d, famName) {
  const days = {};
  d.sessions.forEach((s) => {
    const k = dayKey(s.started_at);
    days[k] = days[k] || { iso: s.started_at, fam: {} };
    const f = (days[k].fam[s.family_id] = days[k].fam[s.family_id] || { s: 0, a: 0, c: 0 });
    f.s++;
  });
  d.attempts.forEach((a) => {
    const k = dayKey(a.started_at);
    days[k] = days[k] || { iso: a.started_at, fam: {} };
    const f = (days[k].fam[a.family_id] = days[k].fam[a.family_id] || { s: 0, a: 0, c: 0 });
    f.a++;
    if (a.status === 'completed') f.c++;
  });
  const keys = Object.keys(days).sort().reverse();
  if (!keys.length) {
    $('daily').innerHTML = '<tr><td class="empty">Todavía no hay uso en este periodo.</td></tr>';
    return;
  }
  const head = '<tr><th>Día</th>' + d.families.map((f) => `<th>${esc(f.name)}</th>`).join('') + '</tr>';
  const rows = keys.map((k) => '<tr><td>' + fmtDay(days[k].iso) + '</td>' + d.families.map((f) => {
    const v = days[k].fam[f.id];
    return v
      ? `<td>${v.s} ses. · ${v.a} fichas · <b>${v.c}</b> compl.</td>`
      : '<td class="errs">—</td>';
  }).join('') + '</tr>').join('');
  $('daily').innerHTML = head + rows;
}

function renderSessions(d, famName) {
  const sessions = d.sessions.slice(0, 60);
  if (!sessions.length) {
    $('sessions').innerHTML = '<tr><td class="empty">Todavía no hay sesiones.</td></tr>';
    return;
  }
  const head = '<tr><th>Familia</th><th>Apertura</th><th class="num">Duración</th><th>Fichas (oración · modo · resultado · errores por tapa)</th></tr>';
  const rows = sessions.map((s) => {
    const atts = d.attempts.filter((a) => a.session_id === s.id).slice().reverse();
    const tags = atts.length ? atts.map((a) => {
      const st = attemptStatus(a);
      const errs = (a.errors || []).map((p) => p.errors + (p.error_type ? ' ' + TYPE_LABEL[p.error_type] : '')).join(' · ') || '—';
      const mode = a.mode ? MODE_LABEL[a.mode] + ' · ' : '';
      return `<div><span class="tag ${st.cls}">${esc(a.sentence_key)} · ${esc(mode)}${st.label}</span><span class="errs">errores ${esc(errs)}</span></div>`;
    }).join('') : '<span class="errs">Abrió la app sin jugar fichas</span>';
    return `<tr>
      <td>${esc(famName[s.family_id] || '—')}</td>
      <td>${fmtDateTime(s.started_at)}</td>
      <td class="num">${minutesBetween(s.started_at, s.last_activity_at)} min</td>
      <td>${tags}</td>
    </tr>`;
  }).join('');
  $('sessions').innerHTML = head + rows;
}

function renderCards(d) {
  if (!d.cards.length) {
    $('cards').innerHTML = '<tr><td class="empty">Aún no se ha leído ninguna ficha. Acerca cada ficha a un TAPit conectado y aparecerá aquí.</td></tr>';
    return;
  }
  const opts = (c) => {
    const sel = c.role === 'config' ? 'CONFIG' : (c.sentence_key || '');
    return `<option value="" ${sel === '' ? 'selected' : ''}>— Sin asignar —</option>` +
      SENTENCE_OPTIONS.map((o) => `<option value="${o.key}" ${sel === o.key ? 'selected' : ''}>${o.key} · ${esc(o.text)}</option>`).join('') +
      `<option value="CONFIG" ${sel === 'CONFIG' ? 'selected' : ''}>⚙️ Tarjeta de configuración WiFi</option>`;
  };
  const head = '<tr><th>Código del tag</th><th>Asignada a</th><th>Etiqueta (opcional)</th><th>Leída por primera vez</th><th></th></tr>';
  const rows = d.cards.map((c) => {
    const isNew = !c.sentence_key && c.role !== 'config';
    return `<tr>
      <td class="mono">${esc(c.uid)} ${isNew ? '<span class="tag new">Nueva</span>' : ''}</td>
      <td><select data-uid="${esc(c.uid)}" class="card-sel" onchange="cardsDirty=true">${opts(c)}</select></td>
      <td><input data-uid="${esc(c.uid)}" class="card-label" value="${esc(c.label || '')}" placeholder="ej. Ficha 1" oninput="cardsDirty=true"></td>
      <td>${fmtDateTime(c.first_seen_at)}</td>
      <td><button class="small accent" onclick="saveCard('${esc(c.uid)}')">Guardar</button></td>
    </tr>`;
  }).join('');
  $('cards').innerHTML = head + rows;
}

function renderEvents(d, famName) {
  const labels = {
    boot: 'Se encendió',
    card_read: 'Ficha leída',
    card_ignored: 'Ficha ignorada (actividad en curso)',
    config_card: 'Tarjeta de configuración',
    wifi_config: 'Entró a configurar WiFi'
  };
  const devCode = {};
  d.devices.forEach((x) => { devCode[x.id] = x.code; });
  const evs = d.events.slice(0, 40);
  if (!evs.length) {
    $('events').innerHTML = '<tr><td class="empty">Sin actividad de los aparatos en este periodo.</td></tr>';
    return;
  }
  const cardKey = {};
  d.cards.forEach((c) => { cardKey[c.uid] = c.role === 'config' ? 'config' : c.sentence_key; });
  const head = '<tr><th>Hora</th><th>Familia</th><th>Aparato</th><th>Evento</th><th>Ficha</th></tr>';
  const rows = evs.map((e) => `<tr>
      <td>${fmtDateTime(e.created_at)}</td>
      <td>${esc(famName[e.family_id] || '—')}</td>
      <td>${esc(devCode[e.device_id] || '—')}</td>
      <td>${esc(labels[e.type] || e.type)}</td>
      <td>${e.card_uid ? `<span class="mono">${esc(e.card_uid)}</span>${cardKey[e.card_uid] ? ' · ' + esc(cardKey[e.card_uid]) : ''}` : ''}</td>
    </tr>`).join('');
  $('events').innerHTML = head + rows;
}

// ---------------------------------------------------------------------------
// Acciones
// ---------------------------------------------------------------------------
async function saveCard(uid) {
  const sel = document.querySelector(`.card-sel[data-uid="${uid}"]`);
  const lbl = document.querySelector(`.card-label[data-uid="${uid}"]`);
  const value = sel ? sel.value : '';
  const isConfig = value === 'CONFIG';
  const client = getSupabaseClient();
  const { data, error } = await client.rpc('admin_assign_card', {
    p_card_uid: uid,
    p_sentence_key: isConfig ? null : (value || null),
    p_role: isConfig ? 'config' : 'activity',
    p_label: lbl && lbl.value.trim() ? lbl.value.trim() : null
  });
  if (error || !data || data.ok !== true) {
    alert('No se pudo guardar la ficha.');
    return;
  }
  cardsDirty = false;
  if (isConfig) {
    alert('Listo. Para que los aparatos reconozcan esta tarjeta, desenchúfalos y vuelve a enchufarlos una vez (con internet).');
  }
  await loadData();
}

async function sendWifiReset(deviceId, code) {
  if (!confirm(`¿Reconfigurar el WiFi de ${code}?\n\nEl aparato borrará su WiFi y abrirá la red "TAPit-Configurar". Solo funciona si ahora está conectado.`)) return;
  const client = getSupabaseClient();
  const { data, error } = await client.rpc('admin_send_command', { p_device_id: deviceId, p_command: 'wifi_reset', p_arg: null });
  alert(error || !data || data.ok !== true ? 'No se pudo enviar la orden.' : 'Orden enviada. El aparato la recibirá en menos de 20 segundos.');
}

function downloadCsv() {
  if (!dashData) return;
  const famName = {};
  dashData.families.forEach((f) => { famName[f.id] = f.name; });
  const sesStart = {};
  dashData.sessions.forEach((s) => { sesStart[s.id] = s.started_at; });
  const rows = [['familia', 'sesion_apertura', 'ficha_uid', 'oracion', 'texto', 'modo', 'estado', 'inicio', 'fin', 'duracion_seg',
    'tapa1_palabra', 'tapa1_distractor', 'tapa1_tipo', 'tapa1_errores',
    'tapa2_palabra', 'tapa2_distractor', 'tapa2_tipo', 'tapa2_errores',
    'tapa3_palabra', 'tapa3_distractor', 'tapa3_tipo', 'tapa3_errores', 'errores_total']];
  dashData.attempts.forEach((a) => {
    const e = { 1: ['', '', '', ''], 2: ['', '', '', ''], 3: ['', '', '', ''] };
    (a.errors || []).forEach((p) => { e[p.part] = [p.word || '', p.distractor || '', p.error_type || '', p.errors]; });
    rows.push([
      famName[a.family_id] || '', a.session_id ? fmtDateTime(sesStart[a.session_id]) : '',
      a.card_uid || '', a.sentence_key, a.sentence_text, a.mode ? MODE_LABEL[a.mode] : '', attemptStatus(a).label,
      fmtDateTime(a.started_at), fmtDateTime(a.completed_at), a.duration_seconds || ''
    ].concat(e[1], e[2], e[3], [totalErrors(a)]));
  });
  const csv = rows.map((r) => r.map((v) => `"${String(v === null || v === undefined ? '' : v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `tapit_actividades_${dayKey(new Date().toISOString())}.csv`;
  a.click();
}

// ---------------------------------------------------------------------------
// Inicio
// ---------------------------------------------------------------------------
async function init() {
  $('login-form').addEventListener('submit', handleLogin);
  $('btn-logout').addEventListener('click', handleLogout);
  $('btn-csv').addEventListener('click', downloadCsv);
  $('days').addEventListener('change', loadData);

  const client = getSupabaseClient();
  if (!client) return showLogin('No se pudo cargar Supabase. Revisa tu conexión.');
  const { data } = await client.auth.getSession();
  if (data && data.session) startDashboard();
  else showLogin('');
}

init();
