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

/* ------------------------------------------------------------------
 * LA CANASTA, CON FUENTE Y FECHA
 *
 * Hasta el 20-09-2026 este archivo usaba $1.200.000 con el comentario
 * "junio 2026 estimado". Era un número a ojo, desactualizado, y encima se
 * comparaba contra la canasta de una FAMILIA TIPO sin importar cuántas
 * personas vivían en el hogar: una persona sola que gana $1,1M quedaba
 * medida contra la canasta de cuatro.
 *
 * Ahora se usa el dato oficial, y se divide por adulto equivalente como
 * hace el INDEC.
 * ------------------------------------------------------------------ */
export const CBT_INDEC = {
  // Canasta Básica Total de la familia tipo (hogar 2 de referencia).
  familiaTipo: 1605497,
  // Ese hogar equivale a 3,09 adultos equivalentes:
  // varón 35 (1,00) + mujer 31 (0,77) + hijo 6 (0,64) + hija 8 (0,68).
  adultosEquivalentesFamiliaTipo: 3.09,
  periodo: 'agosto de 2026',
  publicado: '2026-09-10',
  fuente: 'INDEC · Valorización mensual de la canasta básica alimentaria y total',
  url: 'https://www.indec.gob.ar/indec/web/Nivel3-Tema-4-43'
};

// CBT por adulto equivalente = canasta de la familia tipo / 3,09.
export const CBT_POR_ADULTO_EQUIV =
  CBT_INDEC.familiaTipo / CBT_INDEC.adultosEquivalentesFamiliaTipo;

/* Coeficientes de adulto equivalente (INDEC).
 * El formulario no pregunta edad ni sexo, así que se usan valores
 * REPRESENTATIVOS y se dice que lo son:
 *  - primera persona adulta: 1,00 (varón 30-60, unidad de referencia)
 *  - segunda persona adulta: 0,77 (mujer 30-45)
 *  - cada hijo/a: 0,66 (promedio de los dos niños de la familia tipo del
 *    INDEC: 0,64 y 0,68)
 * Fuente de los coeficientes: INDEC, "Canasta básica alimentaria y total —
 * preguntas frecuentes".
 * https://www.indec.gob.ar/ftp/cuadros/sociedad/preguntas_frecuentes_cba_cbt.pdf */
const AE_PRIMER_ADULTO = 1.00;
const AE_OTRO_ADULTO   = 0.77;
const AE_HIJO          = 0.66;

export function adultosEquivalentes(perfil) {
  const HIJOS = { '0': 0, '1': 1, '2': 2, '3mas': 3 };
  const hijos = HIJOS[perfil?.hijos] ?? 0;
  const otrosAdultos = Number(perfil?.adultos) || 0;
  return AE_PRIMER_ADULTO + otrosAdultos * AE_OTRO_ADULTO + hijos * AE_HIJO;
}

export const CLASES_SOCIALES = [
  { id: "baja",        label: "Clase baja",        umbralMin: 0,  umbralMax: 1,  aam: "D2 / E",     quintil: "Q1" },
  { id: "media_baja",  label: "Clase media baja",  umbralMin: 1,  umbralMax: 2,  aam: "D1 / C3",    quintil: "Q2" },
  { id: "media",       label: "Clase media",       umbralMin: 2,  umbralMax: 4,  aam: "C2 / C3",    quintil: "Q3" },
  { id: "media_alta",  label: "Clase media alta",  umbralMin: 4,  umbralMax: 7,  aam: "ABC1 / C2",  quintil: "Q4 bajo" },
  { id: "alta",        label: "Clase alta",        umbralMin: 7,  umbralMax: 15, aam: "ABC1",       quintil: "Q5 medio" },
  { id: "muy_alta",    label: "Clase muy alta",    umbralMin: 15, umbralMax: Infinity, aam: "ABC1 top", quintil: "Q5 top / D10" }
];

// Valor central de cada tramo del formulario. Es una APROXIMACIÓN: el
// formulario pregunta por tramos, no por el número exacto.
const INGRESO_PROXY = {
  "hasta_700k":   500000,
  "700k_1.5m":   1100000,
  "1.5m_3m":     2250000,
  "3m_6m":       4500000,
  "mas_6m":      8000000, // proxy legacy; el form actual lo divide en 6m_15m / mas_15m
  "6m_15m":      9000000,
  "mas_15m":    25000000
};

/* Acepta el perfil completo (recomendado) o, por compatibilidad, el bucket
 * de ingreso suelto — en ese caso asume un hogar de familia tipo y lo avisa
 * en el resultado. */
export function calcularClaseSocial(perfilOBucket) {
  const esPerfil = perfilOBucket && typeof perfilOBucket === 'object';
  const bucket = esPerfil ? perfilOBucket.ingreso : perfilOBucket;
  const ingreso = INGRESO_PROXY[bucket];
  if (!ingreso) return null;

  const ae = esPerfil
    ? adultosEquivalentes(perfilOBucket)
    : CBT_INDEC.adultosEquivalentesFamiliaTipo;
  const cbtHogar = ae * CBT_POR_ADULTO_EQUIV;
  const cbts = ingreso / cbtHogar;

  const clase = CLASES_SOCIALES.find(c => cbts >= c.umbralMin && cbts < c.umbralMax)
    || CLASES_SOCIALES[0];

  return {
    ...clase,
    cbts: Math.round(cbts * 100) / 100,
    adultosEquiv: Math.round(ae * 100) / 100,
    cbtHogar: Math.round(cbtHogar),
    periodo: CBT_INDEC.periodo,
    fuente: CBT_INDEC.fuente,
    url: CBT_INDEC.url,
    aproximado: !esPerfil
  };
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
