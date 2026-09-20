/* Cómo Te Pega — títulos y respuestas de búsqueda por medida
 * ------------------------------------------------------------------
 * POR QUÉ EXISTE (20-09-2026)
 * Search Console, primeros 11 días del dominio: 11 impresiones, 0 clics.
 * La ÚNICA consulta por la que apareció el sitio fue
 * "cuadro tarifario edenor agosto 2026" — 4 impresiones, 0 clics,
 * posición media 8,9. O sea: la página llegó a la primera pantalla y
 * nadie la tocó.
 *
 * El motivo: la gente busca CUÁNTO ES, y la página prometía CÓMO TE PEGA.
 * "¿Cómo me pega a mí?" es el alma de la app, pero casi nadie lo escribe
 * en Google: escriben "cuánto aumenta la luz". El "cómo te pega" es lo
 * que descubren DESPUÉS de entrar.
 *
 * Este archivo arregla eso sin tocar el catálogo (medidas-base.js pesa
 * 380 KB y cualquier edición estructural ahí es riesgosa: ya nos rompió
 * una vez). Acá va, por id de medida:
 *
 *   h   → el título de búsqueda: lo que la persona escribiría.
 *   num → la respuesta concreta, con el número, en una línea.
 *         Sale SIEMPRE del `desc` de la medida, que ya está con fuente
 *         del BORA. No se inventa un dato acá.
 *
 * `num` se usa en la meta description (para que el resultado de Google
 * prometa el número) y en el bloque "En números" arriba de la página.
 *
 * Las medidas que no están acá caen en el patrón por defecto del
 * generador. Agregar entradas es aditivo y seguro.
 * ------------------------------------------------------------------ */
export const SEO_MEDIDAS = {

  res_enrege_374_tarifas_electricidad_agosto: {
    h: "Cuadros tarifarios EDENOR y EDESUR agosto 2026: cuánto aumentó la luz",
    num: "La luz subió 1,71% respecto de julio de 2026 en el AMBA, con vigencia desde el 1 de agosto."
  },

  res_enrege_40_tarifas_gas: {
    h: "Tarifas de gas 2026: cuánto aumenta y desde cuándo",
    num: "Nuevos cuadros tarifarios de gas por red desde el 1 de junio de 2026, dentro de la Revisión Quinquenal 2025-2030 que se aplica en 31 aumentos mensuales escalonados."
  },

  decreto_bono_previsional_septiembre_824: {
    h: "Bono para jubilados septiembre 2026: de cuánto es y quién lo cobra",
    num: "Bono extraordinario de hasta $70.000 en el haber de septiembre de 2026, completo para quienes cobran hasta el haber mínimo garantizado."
  },

  decreto_bono_previsional_agosto_686: {
    h: "Bono para jubilados agosto 2026: de cuánto es y quién lo cobra",
    num: "Bono extraordinario de hasta $70.000 en el haber de agosto de 2026, completo para quienes cobran hasta el haber mínimo garantizado."
  },

  decreto_bono_previsional_399: {
    h: "Bono para jubilados: de cuánto es y quién lo cobra",
    num: "Bono extraordinario previsional en el haber del mes, completo para quienes cobran hasta el haber mínimo garantizado."
  },

  transporte: {
    h: "Aumento de la SUBE: cuánto subió el colectivo y el tren",
    num: "Quita gradual del subsidio al transporte, con aumentos por resolución en el AMBA y quita del Fondo Compensador en el interior. La Tarifa Social SUBE mantiene el descuento del 55%."
  },

  alquileres: {
    h: "Ley de Alquileres derogada: cómo quedan los contratos hoy",
    num: "Se derogó la Ley 27.551. Los contratos se pactan libres —plazo mínimo de 2 años, índice y moneda a convenir, sin tope ICL— y conviven 3 regímenes según la fecha del contrato."
  },

  monotributo_actualizacion_27743: {
    h: "Topes del monotributo: cuánto se puede facturar por categoría",
    num: "La Ley 27.743 subió los topes de facturación entre 300% y 330%, retroactivo a enero de 2024. La categoría A pasó a $6,45 millones anuales."
  },

  decreto_combustibles_impuesto_693: {
    h: "Impuesto a los combustibles 2026: cuándo aumenta la nafta",
    num: "El Decreto 693/2026 difiere parte de los aumentos del impuesto a los combustibles y al dióxido de carbono: una porción rige desde el 1 de agosto de 2026 y el resto desde septiembre."
  },

  dnu70_prepagas: {
    h: "Aumentos de prepagas: qué cambió con el DNU 70",
    num: "El DNU 70/2023 derogó artículos de la Ley 26.682 y le quitó al Ministerio de Salud la facultad de autorizar los aumentos de las prepagas. La jurisprudencia federal limitó después esos aumentos."
  },

  jubilaciones: {
    h: "Movilidad jubilatoria: cómo se actualizan las jubilaciones hoy",
    num: "Las jubilaciones se ajustan todos los meses por el IPC del INDEC. El bono de $70.000 sigue congelado desde que se creó."
  },

  ganancias: {
    h: "Ganancias en el sueldo: desde cuánto se paga",
    num: "El mínimo no imponible anual es de $5.151.802 (RG ARCA 5759/2025), con actualización semestral por IPC."
  },

  subsidios_energeticos: {
    h: "Subsidio de luz y gas: quién lo cobra y hasta qué ingreso",
    num: "Se reemplazó el sistema N1/N2/N3: el subsidio se asigna por ingreso del hogar bajo un umbral de alrededor de $3,77 millones, actualizable. Por encima del umbral, tarifa plena."
  },

  bono_jubilatorio_congelado_70000: {
    h: "Bono de $70.000 para jubilados: por qué no aumenta",
    num: "El bono previsional está fijado en $70.000 y no se actualiza desde su creación, así que pierde valor mes a mes frente a la inflación."
  }

};
