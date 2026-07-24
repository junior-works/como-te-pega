# Borrador — Decreto 315/2026 · RIFL (incentivo a la formalización laboral)

- **id propuesto:** `decreto_formalizacion_laboral_315`
- **área:** laboral · **estado:** vigente
- **fuente BORA:** https://www.boletinoficial.gob.ar/detalleAviso/primera/341443/20260504
- **verificación:** WebFetch OK — PEN, Decreto 315/2026, 30/04/2026. Reglamenta el Régimen de Incentivo a la Formalización Laboral (RIFL) creado por la Ley 27.802: contribución patronal reducida al 2% por hasta 48 meses al contratar desempleados / ex monotributistas / ex empleados públicos. Aplica del 1-may-2026 al 30-abr-2027.
- **estado auditoría:** ✅ pasó (node --check, impact() corre, id JS==SQL, fuente viva, vocabulario válido)

> Tono neutro. REGLA EMPLEADOR respetada: el detalle de contribución patronal aparece solo bajo `p.ocupacion === 'pyme'`.
> Nota editorial: es una reglamentación de la Ley 27.802 (ya cargada). Se propone como ficha propia por ser un régimen distinto (RIFL) con efecto sobre `desempleado`. Si preferís, se puede fusionar como parámetros de la ficha 27802.

---

## 1) Objeto JS (pegar en el array `MEASURES_BASE` de `js/medidas-base.js`)

```js
{
  id: "decreto_formalizacion_laboral_315",
  date: "2026-05-04",
  title: "Incentivo para contratar personas desempleadas (RIFL)",
  meta: "Decreto 315/2026 · BORA 4-may-2026 · vigente · reglamenta la Ley 27.802 · altas del 1-may-2026 al 30-abr-2027",
  desc: "Reglamenta el Régimen de Incentivo a la Formalización Laboral (RIFL) de la Ley 27.802. Las empresas que registren nuevas altas de personas desempleadas, ex monotributistas o ex empleados públicos pagan contribuciones patronales reducidas al 2% durante hasta 48 meses. Régimen transitorio: las altas se toman entre el 1-may-2026 y el 30-abr-2027.",
  tags: ["Trabajo", "Plata"],
  fuente: "https://www.boletinoficial.gob.ar/detalleAviso/primera/341443/20260504",
  impact: function(p) {
    const dims = [];
    const empleador = p.ocupacion === 'pyme';

    if (empleador) {
      dims.push({ name: "Trabajo", level: "pos_soft",
        body: "Si tomás personal nuevo entre el 1-may-2026 y el 30-abr-2027, las contribuciones patronales bajan al <strong>2%</strong> por hasta 48 meses, siempre que la persona estuviera desempleada, fuera ex monotributista o ex empleada pública." });
    }

    if (p.ocupacion === 'desempleado') {
      dims.push({ name: "Trabajo", level: "pos_soft",
        body: "Entrás en el grupo que una empresa puede contratar con <strong>contribuciones reducidas</strong>: baja el costo de tomarte y puede mejorar tus chances de un alta registrada. No cambia tu sueldo de bolsillo ni tus aportes personales." });
    }

    if (p.ocupacion === 'monotrib') {
      dims.push({ name: "Trabajo", level: "soft",
        body: "Si pasás de monotributo a relación de dependencia, tu empleador puede tomarte dentro del régimen. Mientras sigas facturando como monotributista, tu situación no cambia." });
    }

    if (['empleado_priv','empleado_pub','autonomo','trab_informal','domestica_reg','domestica_no_reg','jubilado_min','jubilado_med','pensionado','estudiante','ama_casa'].includes(p.ocupacion)) {
      dims.push({ name: "Trabajo", level: "soft",
        body: "Sin efecto directo sobre tu situación actual: el beneficio aplica a nuevas altas registradas de personas desempleadas o que dejan el monotributo/el empleo público." });
    }

    dims.push({ name: "País / Equilibrio institucional", level: "soft",
      body: "Reglamenta la <strong>Ley 27.802</strong>. Es un régimen <strong>transitorio</strong>: las altas se computan hasta el 30-abr-2027 y la reducción rige por trabajador durante hasta 48 meses desde el alta." });

    return dims;
  },
  compareWinners: [
    "Empresas y PyMEs que amplían plantel (contribución patronal al 2% por hasta 48 meses)",
    "Personas desempleadas y ex monotributistas (mayor probabilidad de un alta registrada)"
  ],
  compareProfiles: [
    { name: "PyME que suma personal",
      sub: "PyME · interior",
      badges: { Trabajo: "pos_soft", "País / Equilibrio institucional": "soft" } },
    { name: "Persona buscando empleo",
      sub: "Desempleado · GBA",
      badges: { Trabajo: "pos_soft", "País / Equilibrio institucional": "soft" } },
    { name: "Monotributista que busca relación de dependencia",
      sub: "Monotributista · CABA",
      badges: { Trabajo: "soft", "País / Equilibrio institucional": "soft" } }
  ]
}
```

## 2) SQL (`migrations/add_decreto_315.sql`)

```sql
BEGIN;

INSERT INTO medidas (
  id, fecha_bora, tipo_norma, numero, titulo, descripcion, area, tags,
  vigente, estado, fuente_url, fuente_descripcion, analisis_listo
) VALUES (
  'decreto_formalizacion_laboral_315',
  '2026-05-04',
  'Decreto',
  '315/2026',
  'Incentivo para contratar personas desempleadas (RIFL)',
  'Reglamenta el Régimen de Incentivo a la Formalización Laboral (RIFL) de la Ley 27.802. Las empresas que registren nuevas altas de personas desempleadas, ex monotributistas o ex empleados públicos pagan contribuciones patronales reducidas al 2% durante hasta 48 meses. Las altas se computan entre el 1-may-2026 y el 30-abr-2027.',
  'laboral',
  ARRAY['RIFL','formalización','contribuciones patronales','desempleo','Ley 27.802','ARCA'],
  true,
  'vigente',
  'https://www.boletinoficial.gob.ar/detalleAviso/primera/341443/20260504',
  'Boletín Oficial (04/05/2026); Decreto 315/2026, 30/04/2026; reglamenta la Ley 27.802',
  true
);

INSERT INTO parametros_medida (medida_id, clave, valor, unidad, fuente, fecha_valor) VALUES
  ('decreto_formalizacion_laboral_315','contribucion_patronal_reducida','2','porcentaje','BORA Decreto 315/2026','2026-05-04'),
  ('decreto_formalizacion_laboral_315','duracion_beneficio','48','meses','BORA Decreto 315/2026','2026-05-04'),
  ('decreto_formalizacion_laboral_315','vigencia_altas_desde','2026-05-01',NULL,'BORA Decreto 315/2026','2026-05-04'),
  ('decreto_formalizacion_laboral_315','vigencia_altas_hasta','2027-04-30',NULL,'BORA Decreto 315/2026','2026-05-04'),
  ('decreto_formalizacion_laboral_315','elegibles','desempleados, ex monotributistas, ex empleados públicos',NULL,'BORA Decreto 315/2026','2026-05-04');

SELECT COUNT(*) AS total_medidas FROM medidas;
SELECT COUNT(*) FROM parametros_medida WHERE medida_id = 'decreto_formalizacion_laboral_315';

COMMIT;
```

## 3) Notas de verificación

- **Beneficio:** contribuciones patronales al 2% (SIPA y similares) por hasta 48 meses por trabajador.
- **Ventana de altas:** 1-may-2026 → 30-abr-2027 (régimen transitorio).
- **Elegibles:** personas desempleadas, ex monotributistas, ex empleados públicos, tomadas como registradas ante ARCA.
- **Vínculo:** reglamenta la Ley 27.802 (ficha `ley_modernizacion_laboral_27802` ya cargada).
- **Dudas para tu revisión:** ¿ficha propia o parámetros de la 27802? Confirmar si hay tope de plantel o de remuneración para acceder (el decreto delega detalles operativos).
