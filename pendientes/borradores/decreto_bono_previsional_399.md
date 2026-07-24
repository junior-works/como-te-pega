# Borrador — Decreto 399/2026 · Bono extraordinario previsional

- **id propuesto:** `decreto_bono_previsional_399`
- **área:** previsional · **estado:** vigente
- **fuente BORA:** https://www.boletinoficial.gob.ar/detalleAviso/primera/342525/20260529
- **verificación:** WebFetch OK — Presidencia, Decreto 399/2026 (DECTO-2026-399-APN-PTE), 28/05/2026, bono de hasta $70.000 para el pago de junio 2026.
- **estado auditoría:** ✅ pasó (node --check, impact() corre, id JS==SQL, fuente viva, vocabulario válido)

> Tono neutro: describe el mecanismo del bono, no lo juzga. Es un pago por única vez.

---

## 1) Objeto JS (pegar en el array `MEASURES_BASE` de `js/medidas-base.js`)

```js
{
  id: "decreto_bono_previsional_399",
  date: "2026-05-29",
  title: "Bono extraordinario para jubilados y pensionados",
  meta: "Decreto 399/2026 · BORA 29-may-2026 · vigente · pago de junio 2026 (por única vez)",
  desc: "Otorga un bono extraordinario previsional de hasta $70.000 en el haber de junio de 2026. El monto es completo para quienes cobran hasta el haber mínimo y decrece para haberes superiores. Es no remunerativo (no se le hacen descuentos) y no modifica la fórmula de movilidad de la Ley 27.609.",
  tags: ["Plata", "Estabilidad"],
  fuente: "https://www.boletinoficial.gob.ar/detalleAviso/primera/342525/20260529",
  impact: function(p) {
    const dims = [];

    if (p.ocupacion === 'jubilado_min') {
      dims.push({ name: "Plata", level: "pos",
        body: "Cobrás el <strong>bono completo (hasta $70.000)</strong> junto con el haber de junio 2026. Es no remunerativo: no se te descuenta nada. Se suma al haber mínimo." });
    }

    if (p.ocupacion === 'jubilado_med') {
      dims.push({ name: "Plata", level: "pos_soft",
        body: "El bono <strong>decrece</strong> a medida que tu haber supera el mínimo: cobrás una parte, o nada si tu haber está por encima del tope que fije ANSES." });
    }

    if (p.ocupacion === 'pensionado') {
      dims.push({ name: "Plata", level: "pos",
        body: "Alcanza a pensiones no contributivas (vejez, invalidez, madre de 7+ hijos) y a la PUAM: <strong>bono completo</strong> para quienes están en el mínimo, decreciente por encima." });
    }

    // Refuerzo por asistencia previsional aunque la ocupación no sea 'jubilado/pensionado'.
    // p.asistencia es un ARRAY multi-select → usar (p.asistencia || []).includes(...)
    const pnc = ['pnc_vejez','pnc_discap','pnc_madre'].some(a => (p.asistencia || []).includes(a));
    if (pnc && !['jubilado_min','jubilado_med','pensionado'].includes(p.ocupacion)) {
      dims.push({ name: "Plata", level: "pos_soft",
        body: "Si cobrás una pensión no contributiva, el bono de junio 2026 también te alcanza según el monto de tu prestación." });
    }

    if (['empleado_priv','empleado_pub','monotrib','autonomo','pyme','trab_informal','desempleado','estudiante','ama_casa'].includes(p.ocupacion)
        && !pnc) {
      dims.push({ name: "Plata", level: "soft",
        body: "Sin efecto directo hoy: es un refuerzo puntual para jubilaciones y pensiones." });
    }

    dims.push({ name: "País / Equilibrio institucional", level: "soft",
      body: "Pago por <strong>única vez</strong> para compensar los efectos de la Ley 27.609 de movilidad; no cambia la fórmula de actualización de los haberes. Lo instrumenta ANSES." });

    return dims;
  },
  compareWinners: [
    "Jubilados y pensionados en el haber mínimo (bono completo)",
    "Beneficiarios de PUAM y pensiones no contributivas en el mínimo"
  ],
  compareProfiles: [
    { name: "Jubilado/a de la mínima",
      sub: "Jubilado mínima · CABA",
      badges: { Plata: "pos", "País / Equilibrio institucional": "soft" } },
    { name: "Jubilado/a de haber medio-alto",
      sub: "Jubilado media-alta · interior",
      badges: { Plata: "pos_soft", "País / Equilibrio institucional": "soft" } },
    { name: "Pensión no contributiva",
      sub: "Pensionado · GBA",
      badges: { Plata: "pos", "País / Equilibrio institucional": "soft" } }
  ]
}
```

## 2) SQL (`migrations/add_decreto_399.sql`)

```sql
BEGIN;

INSERT INTO medidas (
  id, fecha_bora, tipo_norma, numero, titulo, descripcion, area, tags,
  vigente, estado, fuente_url, fuente_descripcion, analisis_listo
) VALUES (
  'decreto_bono_previsional_399',
  '2026-05-29',
  'Decreto',
  '399/2026',
  'Bono extraordinario para jubilados y pensionados',
  'Otorga un bono extraordinario previsional de hasta $70.000 en el haber de junio de 2026, completo para quienes cobran hasta el haber mínimo y decreciente para haberes superiores. Es no remunerativo y no modifica la fórmula de movilidad de la Ley 27.609. Alcanza a prestaciones del SIPA, PUAM y pensiones no contributivas.',
  'previsional',
  ARRAY['bono','jubilaciones','pensiones','ANSES','PUAM','movilidad','Ley 27.609'],
  true,
  'vigente',
  'https://www.boletinoficial.gob.ar/detalleAviso/primera/342525/20260529',
  'Boletín Oficial (29/05/2026); Decreto 399/2026 (DECTO-2026-399-APN-PTE), 28/05/2026',
  true
);

INSERT INTO parametros_medida (medida_id, clave, valor, unidad, fuente, fecha_valor) VALUES
  ('decreto_bono_previsional_399','bono_monto_maximo','70000','pesos','BORA Decreto 399/2026','2026-05-29'),
  ('decreto_bono_previsional_399','bono_caracter','no remunerativo, sin descuentos',NULL,'BORA Decreto 399/2026','2026-05-29'),
  ('decreto_bono_previsional_399','bono_mes_pago','2026-06',NULL,'BORA Decreto 399/2026','2026-05-29'),
  ('decreto_bono_previsional_399','bono_alcance','completo hasta el haber mínimo, decreciente por encima',NULL,'BORA Decreto 399/2026','2026-05-29'),
  ('decreto_bono_previsional_399','bono_frecuencia','pago por única vez',NULL,'BORA Decreto 399/2026','2026-05-29');

SELECT COUNT(*) AS total_medidas FROM medidas;
SELECT COUNT(*) FROM parametros_medida WHERE medida_id = 'decreto_bono_previsional_399';

COMMIT;
```

## 3) Notas de verificación

- **Monto:** hasta $70.000 (art. citado en el decreto). Completo en el mínimo, reducido por encima; tope operativo lo define ANSES.
- **Carácter:** no remunerativo, sin descuentos. Pago de junio 2026, por única vez.
- **Alcance:** SIJP/SIPA, PUAM, PNC (vejez, invalidez, madre 7+ hijos), regímenes provinciales/municipales transferidos.
- **Contexto:** compensa efectos de la Ley 27.609; NO cambia la fórmula de movilidad.
- **Dudas para tu revisión:** confirmar el tope exacto de haber a partir del cual el bono es $0 (el decreto delega el detalle en ANSES; no lo fijé como parámetro numérico para no inventar).
