/* Cómo Te Pega — configuración pública
 * ------------------------------------------------------------------
 * La anon key de Supabase es PUBLISHABLE: está pensada para vivir en el
 * front, protegida por Row Level Security del lado del servidor. Por eso
 * este archivo va commiteado sin problema (no es un secreto).
 *
 * Si algún día rota la key o cambia el proyecto, se toca solo acá.
 * ------------------------------------------------------------------ */
export const SUPABASE_URL = "https://nqwnanfdpaesojuyaztm.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_qYaVjpDBAGNHYIG-4dZEKA_1NSr9r5f";

// REST base + headers reutilizables para los fetch de solo-lectura.
export const SUPABASE_REST = `${SUPABASE_URL}/rest/v1`;
export const SUPABASE_HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`
};
