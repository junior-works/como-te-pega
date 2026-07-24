# Borrador — Resolución 704/2026 Economía · Venta del 90% de AySA

- **id propuesto:** `res_704_privatizacion_aysa`
- **área:** privatizaciones · **estado:** vigente
- **fuente BORA:** https://www.boletinoficial.gob.ar/detalleAviso/primera/341989/20260515
- **verificación:** WebFetch OK — Ministerio de Economía, Resolución 704/2026, 14/05/2026. Autoriza el llamado a Licitación Pública Nacional e Internacional para vender el 90% de AySA; operador estratégico compra ≥51%, resto a bolsa; 10% queda en Programa de Propiedad Participada. Ofertas hasta 27/08/2026.
- **estado auditoría:** ✅ pasó (node --check, impact() corre, id JS==SQL, fuente viva, vocabulario válido)

> Alcance geográfico: AySA presta agua potable y cloacas en **CABA y GBA**. El impacto se acota por `zona`.
> Es una **licitación (aún no adjudicada)**: el borrador lo dice explícito para no dar por hecho un resultado.

---

## 1) Objeto JS

```js
{
  id: "res_704_privatizacion_aysa",
  date: "2026-05-15",
  title: "Venta del 90% de AySA (agua y cloacas)",
  meta: "Res. 704/2026 Economía · BORA 15-may-2026 · vigente · ofertas hasta 27-ago-2026",
  desc: "Autoriza el llamado a Licitación Pública Nacional e Internacional para vender el 90% del capital de Agua y Saneamientos Argentinos (AySA). Un operador estratégico adquiriría al menos el 51%; el resto se ofrecería en bolsas y mercados. El 10% restante queda en el Programa de Propiedad Participada de los empleados. Presentación de ofertas hasta el 27-ago-2026.",
  tags: ["Servicios", "Plata"],
  fuente: "https://www.boletinoficial.gob.ar/detalleAviso/primera/341989/20260515",
  impact: function(p) {
    const dims = [];
    const areaAySA = ['caba', 'gba_norte', 'gba_sur', 'gba_oeste'].includes(p.zona);

    if (areaAySA) {
      dims.push({ name: "Servicios", level: "mid",
        body: "Si vivís en el área de AySA (CABA y GBA), cambia <strong>quién presta</strong> el agua potable y las cloacas: pasa a un operador privado (al menos 51% del capital). La gestión y las tarifas quedarán en manos privadas dentro del marco regulatorio vigente." });
      dims.push({ name: "Plata", level: "soft",
        body: "El régimen tarifario seguirá regulado por el ente correspondiente; el impacto concreto en la factura dependerá del contrato que surja de la licitación." });
    } else {
      dims.push({ name: "Servicios", level: "none",
        body: "AySA presta servicio en CABA y GBA. Si vivís fuera de esa área, esta venta no te afecta directamente." });
    }

    dims.push({ name: "País / Equilibrio institucional", level: "soft",
      body: "Es una <strong>licitación de venta, todavía no adjudicada</strong> (ofertas hasta 27-ago-2026). La prestación seguirá bajo regulación del ente de control del servicio." });

    return dims;
  },
  compareWinners: [
    "El operador estratégico que adquiera el control (mín. 51% del capital)",
    "Empleados de AySA (10% en Programa de Propiedad Participada)"
  ],
  compareProfiles: [
    { name: "Usuario/a de AySA",
      sub: "CABA / GBA",
      badges: { Servicios: "mid", Plata: "soft", "País / Equilibrio institucional": "soft" } },
    { name: "Fuera del área AySA",
      sub: "Interior",
      badges: { Servicios: "none", "País / Equilibrio institucional": "soft" } }
  ]
}
```

## 2) SQL (`migrations/add_res_704_aysa.sql`)

```sql
BEGIN;

INSERT INTO medidas (
  id, fecha_bora, tipo_norma, numero, titulo, descripcion, area, tags,
  vigente, estado, fuente_url, fuente_descripcion, analisis_listo
) VALUES (
  'res_704_privatizacion_aysa',
  '2026-05-15',
  'Resolución',
  '704/2026',
  'Venta del 90% de AySA (agua y cloacas)',
  'El Ministerio de Economía autoriza el llamado a Licitación Pública Nacional e Internacional para vender el 90% del capital de Agua y Saneamientos Argentinos (AySA). Un operador estratégico adquiriría al menos el 51%; el resto se ofrecería en bolsas y mercados. El 10% restante queda en el Programa de Propiedad Participada de los empleados. Presentación de ofertas hasta el 27-ago-2026.',
  'privatizaciones',
  ARRAY['AySA','agua','cloacas','privatización','licitación','servicios públicos'],
  true,
  'vigente',
  'https://www.boletinoficial.gob.ar/detalleAviso/primera/341989/20260515',
  'Boletín Oficial (15/05/2026); Res. 704/2026 Ministerio de Economía, 14/05/2026',
  true
);

INSERT INTO parametros_medida (medida_id, clave, valor, unidad, fuente, fecha_valor) VALUES
  ('res_704_privatizacion_aysa','porcentaje_en_venta','90','porcentaje del capital','BORA Res. 704/2026','2026-05-15'),
  ('res_704_privatizacion_aysa','operador_estrategico_minimo','51','porcentaje','BORA Res. 704/2026','2026-05-15'),
  ('res_704_privatizacion_aysa','propiedad_participada','10','porcentaje (empleados)','BORA Res. 704/2026','2026-05-15'),
  ('res_704_privatizacion_aysa','cierre_ofertas','2026-08-27',NULL,'BORA Res. 704/2026','2026-05-15'),
  ('res_704_privatizacion_aysa','area_servicio','CABA y GBA',NULL,'BORA Res. 704/2026','2026-05-15');

SELECT COUNT(*) AS total_medidas FROM medidas;
SELECT COUNT(*) FROM parametros_medida WHERE medida_id = 'res_704_privatizacion_aysa';

COMMIT;
```

## 3) Notas de verificación

- **Qué se vende:** 90% del capital de AySA. Operador estratégico ≥51%; resto en bolsa; 10% Propiedad Participada (empleados).
- **Plazos:** consultas hasta 12/08/2026; ofertas y apertura 27/08/2026.
- **Alcance:** agua potable y cloacas en CABA + partidos del GBA.
- **Estado:** licitación autorizada, aún no adjudicada — el borrador evita afirmar resultado o cambio tarifario concreto.
- **Dudas para tu revisión:** ¿querés listar los 26 partidos del GBA para afinar el gate por zona, o alcanza con las 4 zonas GBA + CABA?
