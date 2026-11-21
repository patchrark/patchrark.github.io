/**
 * Cliente y helpers de Supabase (sin bundler, usando @supabase/supabase-js v2 vía CDN).
 *
 * IMPORTANTE:
 * - Reemplaza SUPABASE_URL y SUPABASE_ANON_KEY con los valores de tu proyecto en
 *   Supabase Dashboard -> Project Settings -> API (usa únicamente la anon / publishable key).
 * - Nunca coloques la service_role / secret key en el frontend.
 */

const SUPABASE_URL = 'https://meojsahephmbadkvrlii.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_d2S9Tc5wOxE4pB8cYnJ8OQ_CLInrm1S';

let supabaseClientInstance = null;

/**
 * Verifica si las credenciales de Supabase ya fueron configuradas.
 * @returns {boolean}
 */
function isSupabaseConfigured() {
  return (
    Boolean(SUPABASE_URL) &&
    Boolean(SUPABASE_ANON_KEY) &&
    !SUPABASE_URL.includes('TU-PROYECTO') &&
    !SUPABASE_ANON_KEY.includes('TU_ANON_KEY_AQUI')
  );
}

/**
 * Devuelve la instancia única del cliente de Supabase o null si falta configurar o cargar el SDK.
 * @returns {object|null}
 */
function getSupabaseClient() {
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.warn('El SDK de Supabase (@supabase/supabase-js) no se cargó.');
    return null;
  }

  supabaseClientInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClientInstance;
}

/**
 * Normaliza respuestas RPC que pueden venir como objeto directo o arreglo de 1 fila.
 * @param {any} data
 * @returns {any}
 */
function unwrapRpcData(data) {
  if (Array.isArray(data)) {
    return data.length > 0 ? data[0] : null;
  }
  return data;
}

/**
 * Valida el código familiar mediante la función RPC `verify_family_code(p_code)`.
 * @param {string} code
 * @returns {Promise<{ok: boolean, family_id?: string, family_label?: string, login_session_id?: string, error?: string}>}
 */
async function verifyFamilyCode(code) {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error: 'Falta configurar SUPABASE_URL y SUPABASE_ANON_KEY en supabase-client.js.'
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      ok: false,
      error: 'No se pudo inicializar el cliente de Supabase. Revisa tu conexión.'
    };
  }

  try {
    const { data, error } = await client.rpc('verify_family_code', {
      p_code: code
    });

    if (error) {
      console.warn('Error en verify_family_code:', error);
      return {
        ok: false,
        error: 'No se pudo validar el código. Inténtalo de nuevo.'
      };
    }

    const payload = unwrapRpcData(data);
    if (!payload || payload.ok !== true) {
      return {
        ok: false,
        error: 'Código incorrecto o inactivo. Verifica e inténtalo de nuevo.'
      };
    }

    return {
      ok: true,
      family_id: payload.family_id,
      family_label: payload.family_label || payload.display_name,
      login_session_id: payload.login_session_id
    };
  } catch (err) {
    console.error('Excepción en verifyFamilyCode:', err);
    return {
      ok: false,
      error: 'Error de conexión al verificar el código.'
    };
  }
}

/**
 * Crea un nuevo registro en `exercise_attempts` mediante RPC `start_exercise_attempt`.
 * @param {object} params
 * @param {string} params.familyId
 * @param {string} params.loginSessionId
 * @param {string} params.sentenceKey
 * @param {string} params.sentenceText
 * @param {string|null} [params.selectedCategory=null]
 * @returns {Promise<string|null>} attemptId o null si falló / no configurado
 */
async function startExerciseAttempt({
  familyId,
  loginSessionId,
  sentenceKey,
  sentenceText,
  selectedCategory = null
}) {
  const client = getSupabaseClient();
  if (!client || !familyId || !loginSessionId) return null;

  try {
    const { data, error } = await client.rpc('start_exercise_attempt', {
      p_family_id: familyId,
      p_login_session_id: loginSessionId,
      p_sentence_key: sentenceKey,
      p_sentence_text: sentenceText,
      p_selected_category: selectedCategory
    });

    if (error) {
      console.warn('Error en start_exercise_attempt:', error);
      return null;
    }

    const payload = unwrapRpcData(data);
    if (typeof payload === 'string') return payload;
    if (payload && typeof payload === 'object') {
      if (payload.ok === false) {
        console.warn('start_exercise_attempt devolvió ok=false:', payload.error || payload);
        return null;
      }
      return payload.attempt_id || payload.id || null;
    }
    return null;
  } catch (err) {
    console.warn('Excepción en startExerciseAttempt:', err);
    return null;
  }
}

/**
 * Registra un paso de discriminación o palabra de voz en `exercise_part_results` vía `save_part_result`.
 * @param {object} params
 * @param {string} params.attemptId
 * @param {'discrimination_step'|'voice_word'} params.partType
 * @param {number} params.partIndex
 * @param {string} params.targetWord
 * @param {number} params.errorsCount
 * @param {'speech'|'manual'|null} [params.validationMethod=null]
 * @returns {Promise<boolean>}
 */
async function savePartResult({
  attemptId,
  partType,
  partIndex,
  targetWord,
  errorsCount,
  validationMethod = null
}) {
  const client = getSupabaseClient();
  if (!client || !attemptId) return false;

  try {
    const { data, error } = await client.rpc('save_part_result', {
      p_attempt_id: attemptId,
      p_part_type: partType,
      p_part_index: partIndex,
      p_target_word: targetWord,
      p_errors_count: errorsCount,
      p_validation_method: validationMethod
    });

    if (error) {
      console.warn('Error en save_part_result:', error);
      return false;
    }

    const payload = unwrapRpcData(data);
    if (payload && payload.ok === false) {
      console.warn('save_part_result devolvió ok=false:', payload.error || payload);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Excepción en savePartResult:', err);
    return false;
  }
}

/**
 * Marca un intento como completado con su duración total en segundos mediante `finish_exercise_attempt`.
 * @param {string} attemptId
 * @param {number} durationSeconds
 * @returns {Promise<boolean>}
 */
async function completeExerciseAttempt(attemptId, durationSeconds) {
  const client = getSupabaseClient();
  if (!client || !attemptId) return false;

  try {
    const { data, error } = await client.rpc('finish_exercise_attempt', {
      p_attempt_id: attemptId,
      p_duration_seconds: durationSeconds,
      p_status: 'completed'
    });

    if (error) {
      console.warn('Error en finish_exercise_attempt (completed):', error);
      return false;
    }

    const payload = unwrapRpcData(data);
    if (payload && payload.ok === false) {
      console.warn('finish_exercise_attempt devolvió ok=false:', payload.error || payload);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Excepción en completeExerciseAttempt:', err);
    return false;
  }
}

/**
 * Marca un intento inconcluso como `'abandoned'` con duración parcial vía `finish_exercise_attempt`.
 * @param {string} attemptId
 * @param {number} durationSeconds
 * @param {boolean} [useKeepalive=false]
 * @returns {Promise<boolean>}
 */
async function abandonExerciseAttempt(attemptId, durationSeconds, useKeepalive = false) {
  if (!isSupabaseConfigured() || !attemptId) return false;

  if (useKeepalive && typeof fetch === 'function') {
    try {
      fetch(`${SUPABASE_URL}/rest/v1/rpc/finish_exercise_attempt`, {
        method: 'POST',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          p_attempt_id: attemptId,
          p_duration_seconds: durationSeconds,
          p_status: 'abandoned'
        })
      }).catch(() => {});
      return true;
    } catch (err) {
      return false;
    }
  }

  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { data, error } = await client.rpc('finish_exercise_attempt', {
      p_attempt_id: attemptId,
      p_duration_seconds: durationSeconds,
      p_status: 'abandoned'
    });

    if (error) {
      console.warn('Aviso en finish_exercise_attempt (abandoned):', error);
      return false;
    }

    const payload = unwrapRpcData(data);
    if (payload && payload.ok === false) {
      console.warn('finish_exercise_attempt (abandoned) devolvió ok=false:', payload.error || payload);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Excepción en abandonExerciseAttempt:', err);
    return false;
  }
}

// ============================================================================
// TAPit: SESIONES DE USO, APARATO Y FICHAS
// ============================================================================

/**
 * Llama a una funcion RPC y devuelve su respuesta (o null si falla).
 * @param {string} fn
 * @param {object} params
 * @returns {Promise<any|null>}
 */
async function callRpc(fn, params) {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client.rpc(fn, params);
    if (error) {
      console.warn(`Error en ${fn}:`, error);
      return null;
    }
    return unwrapRpcData(data);
  } catch (err) {
    console.warn(`Excepción en ${fn}:`, err);
    return null;
  }
}

/** Abre una sesion de uso (cada apertura de la app). Devuelve el id o null. */
async function appOpenSession(familyId) {
  const payload = await callRpc('app_open_session', {
    p_family_id: familyId,
    p_device_info: (navigator.userAgent || '').slice(0, 300)
  });
  return payload && payload.ok ? payload.app_session_id : null;
}

/** Marca actividad en la sesion de uso. */
async function appTouchSession(appSessionId) {
  if (!appSessionId) return;
  await callRpc('app_touch_session', { p_app_session_id: appSessionId });
}

/**
 * Pregunta por el estado del aparato y si hay una ficha nueva.
 * @returns {Promise<{ok:boolean, has_device:boolean, online:boolean, last_event_id:number, card:object|null}|null>}
 */
async function appPoll(familyId, afterId) {
  return callRpc('app_poll', {
    p_family_id: familyId,
    p_after_id: afterId === null || afterId === undefined ? null : afterId
  });
}

/** Envia una orden al aparato de la familia: 'start', 'open' (arg 1-3), 'close_all', 'finish'. */
async function appSendCommand(familyId, command, arg = null) {
  const payload = await callRpc('app_send_command', {
    p_family_id: familyId,
    p_command: command,
    p_arg: arg
  });
  return Boolean(payload && payload.ok);
}

/** Version que sobrevive al cierre de la pagina (para avisar 'finish' al salir). */
function appSendCommandKeepalive(familyId, command, arg = null) {
  if (!isSupabaseConfigured() || typeof fetch !== 'function') return;
  try {
    fetch(`${SUPABASE_URL}/rest/v1/rpc/app_send_command`, {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ p_family_id: familyId, p_command: command, p_arg: arg })
    }).catch(() => {});
  } catch (err) {}
}

/** Inicia un intento ligado a la ficha, el modo elegido, la sesion de uso y el aparato. Devuelve attemptId o null. */
async function appStartAttempt({ familyId, appSessionId, sentenceKey, sentenceText, cardUid, mode }) {
  const payload = await callRpc('app_start_attempt', {
    p_family_id: familyId,
    p_app_session_id: appSessionId || null,
    p_sentence_key: sentenceKey,
    p_sentence_text: sentenceText,
    p_card_uid: cardUid || null,
    p_mode: mode || null
  });
  return payload && payload.ok ? payload.attempt_id : null;
}

/** Guarda el resultado de una tapa (1-3): palabra correcta, distractor, tipo de error y errores. */
async function appSavePart({ attemptId, partIndex, targetWord, distractorWord, errorType, errorsCount }) {
  if (!attemptId) return false;
  const payload = await callRpc('app_save_part', {
    p_attempt_id: attemptId,
    p_part_index: partIndex,
    p_target_word: targetWord,
    p_distractor_word: distractorWord || null,
    p_error_type: errorType || null,
    p_errors_count: errorsCount || 0
  });
  return Boolean(payload && payload.ok);
}
