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
      family_label: payload.family_label,
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
