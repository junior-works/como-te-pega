# Borrador — Decreto 423/2026 · Cronograma de baja de retenciones al agro

- **id propuesto:** `decreto_retenciones_agro_423`
- **área:** `agroindustria` (alineada a las 3 fichas hermanas — ver nota) · **estado:** vigente
- **fuente:** https://www.argentina.gob.ar/normativa/nacional/decreto-423-2026  (HTTP 200)
- **verificación:** el visor `normativa` es JS y no rindió texto en WebFetch; contenido **corroborado por fuentes independientes**: [argentina.gob.ar/noticias](https://www.argentina.gob.ar/noticias/el-gobierno-nacional-oficializo-una-nueva-reduccion-de-los-derechos-de-exportacion-al-campo), Infobae (03/06/2026) y estudios jurídicos (Beccar Varela, CDA). Publicado 03/06/2026, vigente desde 05/06/2026.
- **estado auditoría:** ✅ pasó (node --check, impact() corre, id JS==SQL, fuente viva HTTP 200, vocabulario válido)

> ✅ **Modelado alineado** a las 3 fichas de retenciones ya cargadas (`baja_retenciones_granos_julio_2025`,
> `baja_retenciones_diciembre_2025`, `eliminacion_retenciones_carne_vacuna`): mismas variables
> (`interior` / `esAgro` / `ingresoBajoMedio`), mismas dims (Plata productor + Trabajo cadena + Plata
> consumidor de alimentos + País/recaudación), mismos íconos inline y tags. Solo cambian los números
> del Decreto 423/2026.
> ✅ **`area='agroindustria'`**: es el valor que usan las 3 fichas hermanas de retenciones en la DB.
> Ojo — `agro` **también existe** en la DB pero lo usa `dnu70_alquileres_tierras_rurales` (otro tema);
> para retenciones/derechos de exportación el valor correcto es `agroindustria`. (Ver `patron-medida.md` §2.)

---

## 1) Objeto JS

```js
{
  id: "decreto_retenciones_agro_423",
  date: "2026-06-03",
  title: "Tercer cronograma de baja de retenciones al agro",
  meta: "Decreto 423/2026 · BORA 3-jun-2026 · vigencia 5-jun-2026 · baja gradual de derechos de exportación de la cadena de granos y biocombustibles hasta dic-2028",
  desc: "Tras las bajas de julio y diciembre de 2025, el decreto fija un cronograma de reducción gradual de las retenciones de la cadena de granos y biocombustibles hasta diciembre de 2028. Trigo y cebada bajan de inmediato del 7,5% al 5,5%; la soja se mantiene en 24% durante 2026 y desciende desde enero de 2027 (0,25 pts/mes) hacia 21% en dic-2027 y 15% en dic-2028 (0,5 pts/mes). Incluye maíz, sorgo, girasol y biocombustibles en el mismo sendero gradual. Mejora el precio que recibe el exportador de forma escalonada.",
  tags: ["Plata", "País", "Trabajo"],
  fuente: "https://www.argentina.gob.ar/normativa/nacional/decreto-423-2026",
  impact: function(p) {
    const dims = [];
    const interior = ['nea', 'noa', 'cuyo', 'patagonia', 'pueblo', 'cba_int', 'santafe_int'].includes(p.zona);
    const esAgro = ((p.ocupacion === 'pyme' || p.ocupacion === 'autonomo') && interior) || p.extra === 'renta';
    const ingresoBajoMedio = ['hasta_700k', '700k_1.5m', '1.5m_3m'].includes(p.ingreso);
    if (esAgro) {
      dims.push({ name: "Plata", icon: "💰", level: "pos_soft",
        body: "Si vivís de la producción agrícola, este tercer recorte llega en cuotas: <strong>trigo y cebada bajan ya del 7,5% al 5,5%</strong>, pero la soja se mantiene en 24% durante 2026 y recién empieza a ceder desde enero de 2027 (hacia 21% en dic-2027 y 15% en dic-2028). El alivio de margen es real, aunque para el grueso de tu facturación (la soja) llega diferido y escalonado." });
      dims.push({ name: "Trabajo", icon: "🛠️", level: "pos_soft",
        body: "Un sendero de menores retenciones tiende a sostener la actividad de la cadena agroindustrial (acopio, transporte de granos, servicios rurales, plantas aceiteras), de la que dependen muchos puestos en el interior productivo." });
    }
    if (ingresoBajoMedio && !esAgro) {
      dims.push({ name: "Plata", icon: "💰", level: "soft",
        body: "Cuando exportar rinde más, el precio interno de lo que sale de esos granos (harina, aceite, fideos, pan, alimento para animales) tiende a acompañar el valor internacional. Como la baja es gradual, la presión sobre la góndola es suave y se reparte en el tiempo." });
    }
    dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
      body: "El Tesoro resigna recaudación de derechos de exportación de forma escalonada a cambio de más liquidación de divisas y competitividad del agro. Ganan exportadores y productores; el costo fiscal y la eventual presión sobre el precio de los alimentos los reparten el resto del presupuesto y el consumidor." });
    return dims;
  },
  compareProfiles: [
    { name: "Productor agrícola del interior", sub: "Empresario PyME · NEA", badges: { Plata: "pos_soft", Trabajo: "pos_soft", "País / Equilibrio institucional": "soft" } },
    { name: "Familia que compra harina, aceite y pan", sub: "Empleado priv. · ≤$1,5M", badges: { Plata: "soft", "País / Equilibrio institucional": "soft" } },
    { name: "Rentista del campo (arrienda hectáreas)", sub: "Renta · interior", badges: { Plata: "pos_soft", Trabajo: "pos_soft" } },
    { name: "Contribuyente que mira la recaudación", sub: "Autónomo · CABA", badges: { "País / Equilibrio institucional": "soft" } }
  ]
}
```

## 2) SQL (`migrations/add_decreto_423.sql`)

```sql
BEGIN;

INSERT INTO medidas (
  id, fecha_bora, tipo_norma, numero, titulo, descripcion, area, tags,
  vigente, estado, fuente_url, fuente_descripcion, analisis_listo
) VALUES (
  'decreto_retenciones_agro_423',
  '2026-06-03',
  'Decreto',
  '423/2026',
  'Cronograma de baja de retenciones al agro',
  'Tras las bajas de julio y diciembre de 2025, fija un cronograma de reducción gradual de los derechos de exportación de la cadena de granos (soja, maíz, trigo, cebada, sorgo, girasol) y biocombustibles hasta diciembre de 2028. Trigo y cebada bajan de inmediato del 7,5% al 5,5%; la soja se mantiene en 24% en 2026 y desciende desde enero de 2027 hacia 21% (dic-2027) y 15% (dic-2028).',
  'agroindustria',
  ARRAY['retenciones','derechos de exportación','agro','soja','trigo','biocombustibles'],
  true,
  'vigente',
  'https://www.argentina.gob.ar/normativa/nacional/decreto-423-2026',
  'Decreto 423/2026, BORA 03/06/2026, vigente desde 05/06/2026',
  true
);

INSERT INTO parametros_medida (medida_id, clave, valor, unidad, fuente, fecha_valor) VALUES
  ('decreto_retenciones_agro_423','trigo_cebada','5.5','porcentaje (baja inmediata desde 7,5%)','Decreto 423/2026','2026-06-03'),
  ('decreto_retenciones_agro_423','soja_2026','24','porcentaje (sin cambio en 2026)','Decreto 423/2026','2026-06-03'),
  ('decreto_retenciones_agro_423','soja_dic_2027','21','porcentaje','Decreto 423/2026','2026-06-03'),
  ('decreto_retenciones_agro_423','soja_dic_2028','15','porcentaje','Decreto 423/2026','2026-06-03'),
  ('decreto_retenciones_agro_423','vigencia','2026-06-05',NULL,'Decreto 423/2026','2026-06-03'),
  ('decreto_retenciones_agro_423','horizonte_cronograma','2028-12',NULL,'Decreto 423/2026','2026-06-03');

SELECT COUNT(*) AS total_medidas FROM medidas;
SELECT COUNT(*) FROM parametros_medida WHERE medida_id = 'decreto_retenciones_agro_423';

COMMIT;
```

## 3) Notas de verificación

- **Cronograma:** trigo/cebada 7,5%→5,5% inmediato; soja 24% (2026) → 21% (dic-2027) → 15% (dic-2028); baja de 0,25 pts/mes en 2027 y 0,5 pts/mes en 2028. Incluye maíz, sorgo, girasol y biocombustibles.
- **Vigencia:** desde 05/06/2026; horizonte hasta dic-2028.
- **Fuente:** URL `normativa` responde 200 pero es visor JS; contenido confirmado por argentina.gob.ar/noticias + prensa + estudios jurídicos. Si querés, en el próximo ciclo consigo el número de aviso del BORA para usar la URL directa del aviso.
- **Modelado:** alineado a `baja_retenciones_granos_julio_2025` / `baja_retenciones_diciembre_2025` / `eliminacion_retenciones_carne_vacuna` (mismas dims y lectura por perfil). Nivel `pos_soft` para el productor (no `pos`/`pos_strong` de las anteriores) porque el grueso —soja— es diferido a 2027; honesto con el cronograma gradual.
- **Vocabulario:** `area='agroindustria'` (igual que las 3 fichas hermanas de retenciones en la DB; `agro` es otra cosa — ver nota arriba). Tags con "País" (vocabulario suelto de chips, como las fichas hermanas).
- **Dudas para tu revisión:** confirmar alícuotas exactas de maíz/sorgo/girasol si vas a cargarlas como parámetros.
