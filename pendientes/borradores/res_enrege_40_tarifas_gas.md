# Borrador — Res. 40/2026 ENReGE · Cuadros tarifarios de gas (RQT 2025-2030)

- **id propuesto:** `res_enrege_40_tarifas_gas`
- **área:** energia · **estado:** vigente
- **fuente BORA:** https://www.boletinoficial.gob.ar/detalleAviso/primera/342571/20260529
- **verificación:** WebFetch OK — ENReGE, Resolución 40/2026, 28/05/2026. Aprueba nuevos cuadros tarifarios (vigencia 1-jun-2026) que incorporan un escalón de la **Revisión Quinquenal de Tarifas (RQT) 2025-2030** (31 aumentos mensuales escalonados) + el Precio Anual Uniforme (PAU) del gas. Usuarios vulnerables mantienen bonificación SEF.
- **estado auditoría:** ✅ pasó (node --check, impact() corre, id JS==SQL, fuente viva, vocabulario válido)

> ⚠️ **Nota de alcance para tu revisión:** la Res. 40/2026 aprueba específicamente el cuadro de
> **Distribuidora de Gas del Centro S.A.** (región Centro/Cuyo). Es un escalón del esquema RQT 2025-2030,
> que se aplica distribuidora por distribuidora con resoluciones espejo. La ficha describe el **mecanismo
> estructural** (RQT + PAU + SEF); si querés acotarla a la región o esperar el set completo de distribuidoras,
> es decisión tuya. Por eso el impacto general se mantiene neutro y la nota regional se marca aparte.

---

## 1) Objeto JS

```js
{
  id: "res_enrege_40_tarifas_gas",
  date: "2026-05-29",
  title: "Nuevos cuadros tarifarios de gas (Revisión Quinquenal 2025-2030)",
  meta: "Res. 40/2026 ENReGE · BORA 29-may-2026 · vigente · aplica desde 1-jun-2026",
  desc: "Aprueba nuevos cuadros tarifarios de gas por red que incorporan un escalón de la Revisión Quinquenal de Tarifas (RQT) 2025-2030 —implementada en 31 aumentos mensuales escalonados— más el Precio Anual Uniforme (PAU) del gas. Los usuarios residenciales de menores ingresos mantienen las bonificaciones del régimen de Subsidios Energéticos Focalizados (SEF) sobre el consumo base. Esta resolución aprueba el cuadro de Distribuidora de Gas del Centro; las demás distribuidoras se aprueban por resoluciones espejo dentro del mismo esquema.",
  tags: ["Servicios", "Plata"],
  fuente: "https://www.boletinoficial.gob.ar/detalleAviso/primera/342571/20260529",
  impact: function(p) {
    const dims = [];
    // p.asistencia es un ARRAY multi-select → usar (p.asistencia || []).includes(...)
    const conSEF = (p.asistencia || []).includes('sef') || p.ingreso === 'hasta_700k';

    if (conSEF) {
      dims.push({ name: "Servicios", level: "soft",
        body: "Tu factura de gas sube por el nuevo cuadro tarifario (escalón de la Revisión Quinquenal 2025-2030 + PAU), pero mantenés la <strong>bonificación SEF</strong> sobre el consumo base, que amortigua el aumento." });
    } else {
      dims.push({ name: "Servicios", level: "mid",
        body: "El nuevo cuadro tarifario aplica el <strong>precio pleno del gas (PAU)</strong> más el escalón mensual de la Revisión Quinquenal 2025-2030. Sin bonificación SEF, la factura refleja el valor completo." });
      dims.push({ name: "Plata", level: "soft",
        body: "El aumento es <strong>escalonado</strong>: se distribuye en subas mensuales previsibles a lo largo del quinquenio, no en un salto único." });
    }

    dims.push({ name: "País / Equilibrio institucional", level: "soft",
      body: "Es un acto regulatorio del ENReGE dentro de la RQT 2025-2030. El sendero de aumentos y las bonificaciones SEF pueden ajustarse por resoluciones posteriores de la Secretaría de Energía." });

    return dims;
  },
  compareWinners: [
    "Usuarios con tarifa social / SEF (conservan la bonificación sobre el consumo base)",
    "La distribuidora (recompone ingresos vía RQT para operación e inversión)"
  ],
  compareProfiles: [
    { name: "Hogar con tarifa social",
      sub: "Ingreso ≤$700k · con SEF",
      badges: { Servicios: "soft", "País / Equilibrio institucional": "soft" } },
    { name: "Hogar sin subsidio",
      sub: "Ingreso medio · sin SEF",
      badges: { Servicios: "mid", Plata: "soft", "País / Equilibrio institucional": "soft" } }
  ]
}
```

## 2) SQL (`migrations/add_res_enrege_40.sql`)

```sql
BEGIN;

INSERT INTO medidas (
  id, fecha_bora, tipo_norma, numero, titulo, descripcion, area, tags,
  vigente, estado, fuente_url, fuente_descripcion, analisis_listo
) VALUES (
  'res_enrege_40_tarifas_gas',
  '2026-05-29',
  'Resolución',
  '40/2026',
  'Nuevos cuadros tarifarios de gas (Revisión Quinquenal 2025-2030)',
  'El ENReGE aprueba nuevos cuadros tarifarios de gas por red (vigencia 1-jun-2026) que incorporan un escalón de la Revisión Quinquenal de Tarifas (RQT) 2025-2030 —31 aumentos mensuales escalonados— más el Precio Anual Uniforme (PAU). Los usuarios residenciales de menores ingresos conservan la bonificación del régimen de Subsidios Energéticos Focalizados (SEF) sobre el consumo base. Esta resolución aprueba el cuadro de Distribuidora de Gas del Centro; las demás distribuidoras se aprueban por resoluciones espejo dentro del mismo esquema.',
  'energia',
  ARRAY['gas','tarifas','RQT','ENReGE','PAU','SEF','quinquenal'],
  true,
  'vigente',
  'https://www.boletinoficial.gob.ar/detalleAviso/primera/342571/20260529',
  'Boletín Oficial (29/05/2026); Res. 40/2026 ENReGE, 28/05/2026; cuadro de Distribuidora de Gas del Centro S.A.',
  true
);

INSERT INTO parametros_medida (medida_id, clave, valor, unidad, fuente, fecha_valor) VALUES
  ('res_enrege_40_tarifas_gas','marco','Revisión Quinquenal de Tarifas 2025-2030',NULL,'BORA Res. 40/2026 ENReGE','2026-05-29'),
  ('res_enrege_40_tarifas_gas','aumentos_escalonados','31','meses','BORA Res. 40/2026 ENReGE','2026-05-29'),
  ('res_enrege_40_tarifas_gas','vigencia_cuadro','2026-06-01',NULL,'BORA Res. 40/2026 ENReGE','2026-05-29'),
  ('res_enrege_40_tarifas_gas','bonificacion','SEF sobre consumo base para usuarios de menores ingresos',NULL,'BORA Res. 40/2026 ENReGE','2026-05-29'),
  ('res_enrege_40_tarifas_gas','alcance_resolucion','Distribuidora de Gas del Centro S.A.',NULL,'BORA Res. 40/2026 ENReGE','2026-05-29');

SELECT COUNT(*) AS total_medidas FROM medidas;
SELECT COUNT(*) FROM parametros_medida WHERE medida_id = 'res_enrege_40_tarifas_gas';

COMMIT;
```

## 3) Notas de verificación

- **Mecanismo:** RQT 2025-2030 (31 escalones mensuales) + PAU + bonificación SEF. Vigencia del cuadro: 1-jun-2026.
- **Alcance de ESTA resolución:** Distribuidora de Gas del Centro S.A. (resoluciones espejo para otras distribuidoras).
- **Dudas para tu revisión:** ¿ficha del esquema RQT general o una por distribuidora? No cargué porcentajes específicos de aumento por categoría (el cuadro es extenso y regional; evité inventar cifras).
