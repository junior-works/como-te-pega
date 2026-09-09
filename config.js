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

/* ==================================================================
 * APOYO AL PROYECTO — enlaces configurables
 * ------------------------------------------------------------------
 * POR QUÉ ESTÁ ACÁ Y NO HARDCODEADO: los links de apoyo cambian
 * (se crea un plan, se rota un alias) y no queremos tocar la UI para
 * eso. Si un campo queda vacío, esa opción NO se muestra. Así se puede
 * publicar la app antes de tener el plan mensual creado.
 *
 * ⚠️ REGLA EDITORIAL Y DE POLÍTICA DE TIENDAS — no la rompas:
 * el apoyo es una DONACIÓN VOLUNTARIA. No compra nada, no desbloquea
 * nada, no da beneficios, contenido, prioridad ni "modo sin publicidad"
 * (no hay publicidad). Por eso NO es una compra digital y NO dispara la
 * obligación de usar la facturación de Google Play, que aplica a la
 * venta de bienes y servicios digitales dentro de la app.
 *
 * En consecuencia, el vocabulario de la app evita a propósito las
 * palabras "membresía", "suscripción", "socio", "premium", "plan" y
 * "beneficios": describimos un APORTE (puntual o mensual). Si algún día
 * se quiere dar algo a cambio, deja de ser donación y hay que rever
 * todo el esquema antes de publicar en Play.
 * ================================================================== */
export const APOYO = {
  // Aporte puntual (Cafecito cobra y liquida; nosotros no cobramos nada).
  cafecito: "https://cafecito.app/juniorworks",

  // Aporte MENSUAL. Ko-fi, modo "simple monthly tips" (sin niveles ni
  // recompensas: nadie recibe nada distinto por aportar).
  // OJO: el link abre la pestaña "One time"; la persona tiene que tocar
  // "Monthly". Por eso el botón lo aclara.
  // Vacío = la opción mensual no aparece en ningún lado.
  mensual: "https://ko-fi.com/juniorworks",

  // Transferencia directa a la cuenta familiar (lo más barato: 0% de comisión).
  alias: "Mallorca83.mp",
  cbu: "0000003100065127446351",
  titular: "Carlos Amancio Acevedo",

  // ¿Mostrar el bloque de apoyo dentro de la app Android (TWA)?
  // true  = se muestra igual que en la web (es una donación, no una compra).
  // false = dentro de la app solo se ve el alias para transferir, sin
  //         links de cobro externos. Ponelo en false si Play alguna vez
  //         objeta algo; no hace falta tocar nada más.
  enAndroid: true
};

/* ==================================================================
 * NEWSLETTER — resumen semanal
 * ------------------------------------------------------------------
 * Es GRATIS y va aparte del perfil: el mail nunca se cruza con las
 * respuestas personales de nadie. Vacío = el bloque no se muestra.
 * ================================================================== */
export const NEWSLETTER = {
  url: "",
  titulo: "El resumen semanal",
  bajada: "Una vez por semana, qué se publicó en el Boletín Oficial y a quién le pega. Gratis. Tu mail no se cruza nunca con tu perfil."
};
