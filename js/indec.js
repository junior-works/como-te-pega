/* Cómo Te Pega — datos oficiales del INDEC para ubicar un hogar
 * ==================================================================
 * POR QUÉ EXISTE (20-09-2026)
 *
 * Hasta ahora la app preguntaba el ingreso TOTAL del hogar y lo usaba
 * crudo: un hogar de $1,5M con una persona y otro de $1,5M con cinco
 * caían en el mismo tramo. Eso no es un estrato social, es un número
 * suelto, y no se sostiene delante de nadie que sepa del tema.
 *
 * La forma oficial de ubicar un hogar en la Argentina es el INGRESO PER
 * CÁPITA FAMILIAR (IPCF): el ingreso total del hogar dividido por la
 * cantidad de integrantes. Es exactamente la variable con la que el
 * INDEC arma los deciles en la Encuesta Permanente de Hogares.
 *
 * REGLA DE ESTE ARCHIVO: acá no se escribe un número que no esté en un
 * informe publicado del INDEC, con su período y su URL. Si un dato
 * envejece, se actualiza el bloque entero y se cambia `periodo`. Nunca
 * se interpola ni se "actualiza por inflación" a ojo: eso sería
 * inventar un dato oficial, que es peor que no tenerlo.
 * ================================================================== */

/* ------------------------------------------------------------------
 * DECILES DE INGRESO PER CÁPITA FAMILIAR
 * Fuente: INDEC, "Evolución de la distribución del ingreso (EPH)",
 * primer trimestre de 2026. Informe publicado el 25/06/2026.
 * Período relevado: 21/12/2025 al 14/03/2026.
 * Cobertura: 31 aglomerados urbanos · 30.095 mil personas.
 * Coeficiente de Gini del IPCF: 0,442.
 * https://www.indec.gob.ar/uploads/informesdeprensa/ingresos1trim26536C8EDD3E.pdf
 *
 * LIMITACIÓN QUE HAY QUE DECIR SIEMPRE: la EPH cubre aglomerados
 * URBANOS. Un hogar rural no está representado en esta distribución.
 * ------------------------------------------------------------------ */
export const IPCF_DECILES = {
  fuente: 'INDEC · Evolución de la distribución del ingreso (EPH)',
  periodo: 'primer trimestre de 2026',
  relevamiento: '21/12/2025 al 14/03/2026',
  cobertura: '31 aglomerados urbanos (30.095 mil personas)',
  gini: 0.442,
  promedioGeneral: 728008,
  url: 'https://www.indec.gob.ar/uploads/informesdeprensa/ingresos1trim26536C8EDD3E.pdf',
  // desde = límite inferior inclusive; hasta = límite superior.
  tramos: [
    { decil: 1,  desde: 0,        hasta: 200000,   promedio: 130550 },
    { decil: 2,  desde: 200000,   hasta: 270000,   promedio: 235139 },
    { decil: 3,  desde: 270000,   hasta: 350000,   promedio: 308588 },
    { decil: 4,  desde: 350000,   hasta: 420000,   promedio: 382238 },
    { decil: 5,  desde: 420000,   hasta: 500000,   promedio: 461506 },
    { decil: 6,  desde: 500000,   hasta: 601333,   promedio: 554804 },
    { decil: 7,  desde: 601333,   hasta: 766667,   promedio: 679991 },
    { decil: 8,  desde: 766667,   hasta: 1000000,  promedio: 882599 },
    { decil: 9,  desde: 1000000,  hasta: 1500000,  promedio: 1209872 },
    { decil: 10, desde: 1500000,  hasta: 23160000, promedio: 2435937 }
  ]
};

/* Tramos de ingreso del formulario → rango en pesos.
 * El formulario pregunta por tramos y no por un número exacto porque
 * mucha gente no sabe el total al peso. La consecuencia honesta es que
 * el resultado es un RANGO de deciles, no un decil único, y así se
 * muestra. */
export const TRAMOS_INGRESO = {
  hasta_700k:  { min: 0,        max: 700000 },
  '700k_1.5m': { min: 700000,   max: 1500000 },
  '1.5m_3m':   { min: 1500000,  max: 3000000 },
  '3m_6m':     { min: 3000000,  max: 6000000 },
  '6m_15m':    { min: 6000000,  max: 15000000 },
  mas_15m:     { min: 15000000, max: null }
};

/* Integrantes del hogar a partir del perfil.
 * El formulario pregunta hijos y adultos a cargo; la persona que
 * responde cuenta como 1. */
export function integrantesHogar(p) {
  const HIJOS = { '0': 0, '1': 1, '2': 2, '3mas': 3 };
  const hijos = HIJOS[p?.hijos] ?? 0;
  const adultos = Number(p?.adultos) || 0;
  return 1 + hijos + adultos;
}

function decilDe(ipcf) {
  if (!(ipcf > 0)) return null;
  for (const t of IPCF_DECILES.tramos) {
    if (ipcf < t.hasta) return t.decil;
  }
  return 10;
}

/* Ubica el hogar en la distribución oficial.
 * Devuelve null si falta el dato: preferimos no decir nada antes que
 * decir algo sin respaldo. */
export function estratoINDEC(p) {
  const tramo = TRAMOS_INGRESO[p?.ingreso];
  if (!tramo) return null;

  const personas = integrantesHogar(p);
  const ipcfMin = tramo.min / personas;
  const ipcfMax = tramo.max == null ? null : tramo.max / personas;

  const decilMin = decilDe(ipcfMin) ?? 1;
  const decilMax = tramo.max == null ? 10 : (decilDe(ipcfMax) ?? 10);

  return {
    personas,
    ipcfMin: Math.round(ipcfMin),
    ipcfMax: ipcfMax == null ? null : Math.round(ipcfMax),
    decilMin,
    decilMax,
    // Texto listo para mostrar, siempre con el período a la vista.
    etiqueta: decilMin === decilMax
      ? `decil ${decilMin} de 10`
      : `entre el decil ${decilMin} y el ${decilMax} de 10`,
    fuente: `${IPCF_DECILES.fuente}, ${IPCF_DECILES.periodo}`,
    url: IPCF_DECILES.url,
    advertencia: 'La EPH del INDEC cubre aglomerados urbanos: si vivís en zona rural, esta distribución no te representa.'
  };
}
