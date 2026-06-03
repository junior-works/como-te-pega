/* Cómo Te Pega — Derivación de clase social
 * ------------------------------------------------------------------
 * La clase social NO la elige el usuario: se DERIVA del ingreso del hogar.
 *
 * Principio rector:
 *   "El ingreso te dice dónde estás parado; la objetividad evita
 *    que la gente se crea de otra clase."
 *
 * Por eso no preguntamos "¿de qué clase sos?": la inferimos del ingreso
 * declarado, en múltiplos de la Canasta Básica Total (CBT) del INDEC.
 * ------------------------------------------------------------------ */

// Múltiplos de Canasta Básica Total (CBT) INDEC.
// Junio 2026 estimado: CBT hogar tipo (4 personas) ~ $1.200.000
// Estos valores deben moverse a config dinámica cuando enchufemos INDEC.
const CBT_HOGAR_JUN_2026 = 1200000;

export const CLASES_SOCIALES = [
  { id: "baja",        label: "Clase baja",        umbralMin: 0,  umbralMax: 1,  aam: "D2 / E",     quintil: "Q1" },
  { id: "media_baja",  label: "Clase media baja",  umbralMin: 1,  umbralMax: 2,  aam: "D1 / C3",    quintil: "Q2" },
  { id: "media",       label: "Clase media",       umbralMin: 2,  umbralMax: 4,  aam: "C2 / C3",    quintil: "Q3" },
  { id: "media_alta",  label: "Clase media alta",  umbralMin: 4,  umbralMax: 7,  aam: "ABC1 / C2",  quintil: "Q4 bajo" },
  { id: "alta",        label: "Clase alta",        umbralMin: 7,  umbralMax: 15, aam: "ABC1",       quintil: "Q5 medio" },
  { id: "muy_alta",    label: "Clase muy alta",    umbralMin: 15, umbralMax: Infinity, aam: "ABC1 top", quintil: "Q5 top / D10" }
];

// Mapeo del bucket de ingreso del formulario actual al valor central en pesos.
const INGRESO_PROXY = {
  "hasta_700k":   500000,
  "700k_1.5m":   1100000,
  "1.5m_3m":     2250000,
  "3m_6m":       4500000,
  "mas_6m":      8000000, // proxy legacy; el form actual lo divide en 6m_15m / mas_15m
  "6m_15m":      9000000,
  "mas_15m":    25000000
};

export function calcularClaseSocial(ingresoBucket) {
  const ingreso = INGRESO_PROXY[ingresoBucket];
  if (!ingreso) return null;
  const cbts = ingreso / CBT_HOGAR_JUN_2026;
  return CLASES_SOCIALES.find(c => cbts >= c.umbralMin && cbts < c.umbralMax) || CLASES_SOCIALES[0];
}

/* Perfiles arquetípicos por clase social.
 * ------------------------------------------------------------------
 * Para la vista "Cómo te pega por sector social" instanciamos un perfil
 * representativo de cada clase (ingreso central + vivienda, transporte,
 * salud y asistencia "típicos") y corremos m.impact(perfil) sobre la
 * medida actual. Son hardcodeados POR AHORA — se mueven a Supabase después.
 *
 * Las claves coinciden con los campos que leen las funciones impact()
 * del catálogo de medidas en index.html.
 * ------------------------------------------------------------------ */
export const PERFILES_ARQUETIPICOS = {
  baja: {
    ocupacion: "trab_informal", extra: "changas", zona: "gba_sur",
    vivienda: "alquila", pareja: "si_uno_trab", hijos: "2", adultos: "0",
    ingreso: "hasta_700k", asistencia: ["auh", "alimentar", "tarifa_sube"],
    salud: "hosp_pub", discapacidad: "no", transporte: "2colectivos"
  },
  media_baja: {
    ocupacion: "empleado_priv", extra: "no", zona: "gba_oeste",
    vivienda: "alquila", pareja: "si_ambos_trab", hijos: "1", adultos: "0",
    ingreso: "1.5m_3m", asistencia: ["ninguno"],
    salud: "os_sindical", discapacidad: "no", transporte: "combinacion"
  },
  media: {
    ocupacion: "empleado_priv", extra: "no", zona: "caba",
    vivienda: "propio_credito", pareja: "si_ambos_trab", hijos: "2", adultos: "0",
    ingreso: "3m_6m", asistencia: ["ninguno"],
    salud: "prepaga_aporte", discapacidad: "no", transporte: "combinacion"
  },
  media_alta: {
    ocupacion: "empleado_priv", extra: "no", zona: "caba",
    vivienda: "propio", pareja: "si_ambos_trab", hijos: "1", adultos: "0",
    ingreso: "6m_15m", asistencia: ["ninguno"],
    salud: "prepaga", discapacidad: "no", transporte: "auto"
  },
  alta: {
    ocupacion: "pyme", extra: "renta", zona: "caba",
    vivienda: "alquila_renta", pareja: "si_uno_trab", hijos: "2", adultos: "0",
    ingreso: "6m_15m", asistencia: ["ninguno"],
    salud: "prepaga", discapacidad: "no", transporte: "auto"
  },
  muy_alta: {
    ocupacion: "pyme", extra: "renta", zona: "caba",
    vivienda: "alquila_renta", pareja: "si_ambos_trab", hijos: "2", adultos: "0",
    ingreso: "mas_15m", asistencia: ["ninguno"],
    salud: "prepaga", discapacidad: "no", transporte: "auto"
  }
};
