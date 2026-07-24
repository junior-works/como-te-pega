# Borrador — Comunicación BCRA "A" 8417 · Flexibilización cambiaria (personas humanas)

- **id propuesto:** `bcra_a8417_cambiario`
- **área:** `cambiario` · **estado:** vigente
- **fuente BORA:** https://www.boletinoficial.gob.ar/detalleAviso/primera/340665/20260413
- **verificación:** WebFetch OK — BCRA, Comunicación "A" 8417, 09/04/2026 (pub. 13/04/2026). Elimina límites a los adelantos en efectivo (retiros) en el exterior con tarjetas emitidas localmente; amplía excepciones para exportadores personas humanas de bienes y servicios (plazos de liquidación).
- **estado auditoría:** ✅ pasó (node --check, impact() corre, id JS==SQL, fuente viva, vocabulario válido)

> ✅ **VOCABULARIO corregido:** `area='cambiario'` **sí existe** en la DB real (la medida
> `cepo_cambiario_levantamiento` ya está cargada con ese valor). El set de 14 áreas de `render.js`
> es solo el vocabulario del **front**; la DB acepta más valores (incluye `cambiario` y `agro`).
> Ver la nota front/DB en `patron-medida.md` §2. El objeto JS **no lleva** campo `area` (legacy).

---

## 1) Objeto JS

```js
{
  id: "bcra_a8417_cambiario",
  date: "2026-04-13",
  title: "Flexibilización del cepo cambiario para personas",
  meta: "Com. BCRA \"A\" 8417 · BORA 13-abr-2026 · vigente",
  desc: "Amplía el acceso de las personas humanas al mercado de cambios: elimina los límites a los adelantos en efectivo (retiros) en el exterior con tarjetas de crédito emitidas en el país, y extiende las excepciones para exportadores personas humanas de bienes y servicios (plazos y obligación de liquidar divisas).",
  tags: ["Plata"],
  fuente: "https://www.boletinoficial.gob.ar/detalleAviso/primera/340665/20260413",
  impact: function(p) {
    const dims = [];

    if (p.ocupacion === 'monotrib' || p.ocupacion === 'autonomo') {
      dims.push({ name: "Plata", level: "pos_soft",
        body: "Si exportás servicios (freelance, software, profesionales) o bienes, se amplían las <strong>excepciones para cobrar y disponer de esas divisas</strong> y se flexibilizan los plazos de liquidación." });
    }

    // Aplica a cualquiera que viaje al exterior y use tarjeta local.
    dims.push({ name: "Plata", level: "soft",
      body: "Si viajás al exterior, se <strong>eliminan los límites</strong> para extraer efectivo (adelantos) con tarjetas de crédito emitidas en el país." });

    dims.push({ name: "País / Equilibrio institucional", level: "soft",
      body: "Continúa el desarme gradual de restricciones cambiarias. Son normas del BCRA que pueden modificarse por comunicaciones posteriores." });

    return dims;
  },
  compareWinners: [
    "Exportadores personas humanas de bienes y servicios (freelancers, profesionales)",
    "Personas que viajan al exterior (sin tope de retiro de efectivo con tarjeta local)"
  ],
  compareProfiles: [
    { name: "Freelance que exporta servicios",
      sub: "Monotributista · CABA",
      badges: { Plata: "pos_soft", "País / Equilibrio institucional": "soft" } },
    { name: "Persona que viaja al exterior",
      sub: "Empleado priv. · CABA",
      badges: { Plata: "soft", "País / Equilibrio institucional": "soft" } }
  ]
}
```

## 2) SQL (`migrations/add_bcra_a8417.sql`)

```sql
BEGIN;

INSERT INTO medidas (
  id, fecha_bora, tipo_norma, numero, titulo, descripcion, area, tags,
  vigente, estado, fuente_url, fuente_descripcion, analisis_listo
) VALUES (
  'bcra_a8417_cambiario',
  '2026-04-13',
  'Comunicación',
  'A 8417',
  'Flexibilización del cepo cambiario para personas',
  'El BCRA amplía el acceso de las personas humanas al mercado de cambios: elimina los límites a los adelantos en efectivo en el exterior con tarjetas emitidas localmente y extiende las excepciones para exportadores personas humanas de bienes y servicios (plazos y obligación de liquidar divisas).',
  'cambiario',
  ARRAY['cambiario','cepo','BCRA','divisas','exportación','tarjetas','viajes'],
  true,
  'vigente',
  'https://www.boletinoficial.gob.ar/detalleAviso/primera/340665/20260413',
  'Boletín Oficial (13/04/2026); Comunicación BCRA "A" 8417 del 09/04/2026',
  true
);

INSERT INTO parametros_medida (medida_id, clave, valor, unidad, fuente, fecha_valor) VALUES
  ('bcra_a8417_cambiario','retiro_efectivo_exterior','sin límite (adelantos con tarjeta local)',NULL,'BORA Com. A 8417','2026-04-13'),
  ('bcra_a8417_cambiario','exportadores_ph_servicios','excepción ampliada a todos los conceptos de servicios',NULL,'BORA Com. A 8417','2026-04-13'),
  ('bcra_a8417_cambiario','plazo_liquidacion_max','365','días (ciertos productos)','BORA Com. A 8417','2026-04-13');

SELECT COUNT(*) AS total_medidas FROM medidas;
SELECT COUNT(*) FROM parametros_medida WHERE medida_id = 'bcra_a8417_cambiario';

COMMIT;
```

## 3) Notas de verificación

- **Personas que viajan:** se eliminan los límites de adelanto de efectivo en el exterior con tarjeta local.
- **Exportadores personas humanas:** excepción ampliada a todos los conceptos de servicios; plazos extendidos (hasta 365 días para ciertos productos).
- **Vocabulario:** `area='cambiario'` (valor real de la DB, verificado contra `cepo_cambiario_levantamiento`).
- **Dudas para tu revisión:** el detalle cambiario es amplio (títulos valores, coberturas). Modelé solo los dos efectos más directos sobre personas: viajes y exportación de servicios.
