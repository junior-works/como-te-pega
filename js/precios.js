/* Cómo Te Pega — precios de referencia, con fuente y fecha
 * ==================================================================
 * POR QUÉ EXISTE (20-09-2026)
 *
 * Había tarifas escritas a mano adentro de las funciones impact(), sin
 * fuente y sin fecha. La del colectivo del AMBA decía 728 pesos: era el
 * valor de un aumento anterior y la app lo mostraba como si fuera el de
 * hoy, con cara de dato duro. Un número viejo sin fecha es peor que no
 * tener el número.
 *
 * REGLA: acá no entra un precio sin `fuente` y sin `vigenteDesde`. Si no
 * se puede verificar, no se pone y el texto de la medida habla del
 * mecanismo sin inventar una cifra.
 *
 * CÓMO SE ACTUALIZA: se cambia el valor, se cambia `vigenteDesde` y se
 * revisa la fuente. Nunca se "ajusta por inflación" a ojo.
 *
 * DÓNDE DEBERÍA VIVIR ESTO: en la tabla `parametros_medida` de Supabase,
 * que ya tiene columnas de fuente y fecha y ya se muestra en la ficha.
 * Queda acá por ahora porque impact() corre desde el repo, sin acceso a
 * la base. Migrarlo es trabajo pendiente.
 * ================================================================== */

export const PRECIOS = {

  /* Colectivo AMBA, tarifa mínima (0-3 km) con SUBE registrada. */
  colectivoAMBA: {
    valor: 887.99,
    unidad: 'pesos',
    vigenteDesde: '2026-09-01',
    fuente: 'Secretaría de Transporte — Tarifas de transporte público AMBA',
    url: 'https://www.argentina.gob.ar/redsube/tarifas-de-transporte-publico-amba'
  },

  /* Valor de referencia de diciembre de 2023, para comparar contra hoy.
   * Es el punto de partida del período que mide la app. */
  colectivoAMBA_dic2023: {
    valor: 76,
    unidad: 'pesos',
    vigenteDesde: '2023-12-01',
    fuente: 'Tarifa mínima de colectivo en el AMBA vigente a diciembre de 2023'
  },

  /* Descuento del Atributo Social / Tarifa Social SUBE. */
  descuentoTarifaSocial: {
    valor: 55,
    unidad: 'porcentaje',
    vigenteDesde: '2026-09-01',
    fuente: 'Régimen de Atributo Social — Tarifa Social SUBE',
    url: 'https://www.argentina.gob.ar/redsube'
  }
};

/* Supuestos de uso. NO son datos: son promedios de referencia que la app
 * usa para dar una magnitud. Van etiquetados como estimación donde se
 * muestran. */
export const SUPUESTOS = {
  // 2 viajes por día × 22 días hábiles.
  viajesMes_1tramo: 44,
  // Lo mismo, pero combinando dos medios por tramo.
  viajesMes_2tramos: 88,
  nota: '2 viajes por día hábil, 22 días al mes'
};

export function fechaLegible(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(iso || ''))) return String(iso || '');
  const [y, m] = String(iso).split('-');
  const MES = ['enero','febrero','marzo','abril','mayo','junio','julio',
               'agosto','septiembre','octubre','noviembre','diciembre'];
  return `${MES[Number(m) - 1]} de ${y}`;
}
