# patron-medida — el molde EXACTO de una ficha de Cómo Te Pega

> Fuente de verdad para redactar borradores. Extraído de la medida real
> `ley_modernizacion_laboral_27802` (en `js/medidas-base.js`) y su migración
> `migrations/add_ley_27802.sql`. Todo borrador nuevo tiene que calcar esta
> estructura y respetar **solo** los vocabularios listados acá.

Una ficha vive en **dos lugares que tienen que estar sincronizados**:

1. **Objeto JS** dentro del array `MEASURES_BASE` en `js/medidas-base.js`
   → la lógica de impacto por perfil, textos, comparativas.
2. **SQL** en `migrations/add_<id>.sql`
   → la fila en la tabla `medidas` + sus `parametros_medida`.

El `id` tiene que ser **idéntico** en los dos. Es la regla de oro.

---

## 1) Objeto JS — estructura

```js
{
  id: "snake_case_unico",              // = PK del SQL. minúsculas, sin tildes ni espacios.
  date: "YYYY-MM-DD",                  // fecha de publicación en el BORA.
  title: "Título corto y claro",       // como lo ve el usuario.
  meta: "Norma · BORA <fecha> · <estado legible> · <reglamentación si hay>",
  desc: "Qué hace la medida, 1–3 frases, NEUTRO. Describe el mecanismo, no juzga.",
  tags: ["Trabajo", "Estabilidad", "Plata"],   // 2–4 tags. Ver §5 (mismo set que dim names).
  fuente: "https://www.boletinoficial.gob.ar/detalleAviso/primera/<id>/<fecha>",

  // El corazón: dado un perfil `p`, devuelve las dimensiones de impacto.
  impact: function(p) {
    const dims = [];

    // Ramas por tipo de persona. Ejemplo de las variables usadas en 27802:
    const dependiente = ['empleado_priv','domestica_reg'].includes(p.ocupacion);
    const empleador   = p.ocupacion === 'pyme';   // ← ver REGLA EMPLEADOR (§6)
    const informal    = p.ocupacion === 'trab_informal'
                     || p.ocupacion === 'domestica_no_reg'
                     || p.extra === 'changas';

    if (dependiente) {
      dims.push({ name: "Estabilidad", icon: "🛡️", level: "strong",
        body: "Texto con <strong>resaltados</strong> permitidos. Neutro." });
    }
    // ... más ramas ...

    // Casi todas las fichas cierran con la dimensión institucional:
    dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
      body: "Estado judicial/constitucional de la norma, en tono descriptivo." });

    return dims;
  },

  // Quiénes ganan con la medida (para la pantalla comparativa). Frases neutras.
  compareWinners: [
    "Grupo A (por qué, sin juicio de valor)",
    "Grupo B (...)"
  ],

  // Perfiles arquetípicos precomputados para la comparativa.
  compareProfiles: [
    { name: "Etiqueta del perfil",
      sub: "Ocupación · zona",
      badges: { Estabilidad: "strong", Trabajo: "mid", "País / Equilibrio institucional": "soft" } }
  ]
}
```

### La dimensión (objeto que se hace `push` a `dims`)

```js
{ name: "<una clave de DIM_ICONS>",   // §4 — vocabulario cerrado
  icon: "🛡️",                          // opcional; si lo omitís, render.js lo resuelve por name
  level: "<strong|mid|soft|none|pos_strong|pos|pos_soft>",   // §3
  body: "Texto del impacto. NEUTRO. Permite <strong>…</strong>." }
```

- `name` **debe** ser una clave exacta de `DIM_ICONS` (§4).
- Podés omitir `icon`: `render.js` lo resuelve desde `DIM_ICONS[name]` (ver `dimIcon()` en render.js:196).
- El `badges` de `compareProfiles` usa `name → level` con el mismo vocabulario.

---

## 2) SQL — estructura (calcar `add_ley_27802.sql`)

```sql
BEGIN;

INSERT INTO medidas (
  id, fecha_bora, tipo_norma, numero, titulo, descripcion, area, tags,
  vigente, estado, fuente_url, fuente_descripcion, analisis_listo
) VALUES (
  'snake_case_unico',              -- = id del objeto JS (IDÉNTICO)
  'YYYY-MM-DD',                    -- fecha_bora
  'Ley',                           -- tipo_norma: Ley | Decreto | DNU | Resolución | Disposición
  '27.802',                        -- numero (string, como sale en el BORA)
  'Título …',                      -- titulo
  'Descripción larga y neutra …',  -- descripcion
  'laboral',                       -- area  → §2 vocabulario cerrado (14 valores)
  ARRAY['reforma laboral','LCT'],  -- tags (array de texto libre; distinto de los tags del JS)
  true,                            -- vigente (boolean)
  'vigente',                       -- estado → §2 vocabulario cerrado (7 valores)
  'https://www.boletinoficial.gob.ar/detalleAviso/primera/<id>/<fecha>',  -- fuente_url
  'Boletín Oficial N° … (dd/mm/aaaa); reglamentada por …',                -- fuente_descripcion
  true                             -- analisis_listo
);

INSERT INTO parametros_medida (medida_id, clave, valor, unidad, fuente, fecha_valor) VALUES
  ('snake_case_unico','clave_parametro','valor','unidad_o_NULL','BORA <norma>','YYYY-MM-DD'),
  ('snake_case_unico','otra_clave','otro_valor',NULL,'BORA <norma>','YYYY-MM-DD');

SELECT COUNT(*) AS total_medidas FROM medidas;
SELECT COUNT(*) FROM parametros_medida WHERE medida_id = 'snake_case_unico';

COMMIT;
```

Notas:
- `unidad` puede ser `NULL` cuando el valor ya es descriptivo (ej. una fórmula).
- `parametros_medida` es opcional pero recomendado: son los números duros citables.
- El bloque va **siempre** entre `BEGIN;` … `COMMIT;`.

---

## 2) Vocabulario de `area` (front vs DB) y `estado` (7)

### ⚠️ IMPORTANTE — `area`: el front NO es la lista completa

`AREA_LABELS` en `js/render.js` es el vocabulario de **presentación del front** (las 14 áreas
que el front sabe etiquetar y filtrar):

```
vivienda · transporte · fiscal · energia · previsional · laboral · salud ·
educacion · comercio_exterior · plataformas · privatizaciones ·
comunicaciones · agroindustria · otros
```

**Pero la columna `medidas.area` de la DB (Supabase) acepta MÁS valores que esos 14.**
Valores reales en la DB que NO están en el front (confirmados contra el inventario de medidas):

```
cambiario   → ej. cepo_cambiario_levantamiento, bcra_a8417_cambiario
agro        → SOLO dnu70_alquileres_tierras_rurales (alquiler de tierras rurales)
```

### ⚠️ `agro` y `agroindustria` COEXISTEN — no confundir

Son dos valores distintos de la DB, para temas distintos:

| valor            | se usa para… | ejemplos |
|------------------|--------------|----------|
| `agroindustria`  | **retenciones / derechos de exportación** de granos y carnes | `baja_retenciones_granos_julio_2025`, `baja_retenciones_diciembre_2025`, `eliminacion_retenciones_carne_vacuna`, `decreto_retenciones_agro_423` |
| `agro`           | alquiler de **tierras rurales** (uso acotado) | `dnu70_alquileres_tierras_rurales` |

→ Para una ficha de **retenciones/exportación agropecuaria**, el `area` correcta es **`agroindustria`**
(no `agro`). Regla general: **alineá el `area` a las fichas hermanas del mismo tema** que ya están
en la DB, no al literal que "suene" mejor.

Regla para el SQL:
- **Usá el vocabulario de la DB, no el del front.** Si una medida encaja en `cambiario`
  o `agroindustria`, ese es el valor correcto en el `INSERT`, aunque el front todavía no lo
  etiquete (cae bajo un fallback hasta que se agregue a `AREA_LABELS`).
- **Alineate a las medidas hermanas ya cargadas** (mismo tema → misma `area`). Ante duda,
  `SELECT DISTINCT area FROM medidas` y mirá qué usan las del mismo rubro. **No asumas que las
  14 del front son el set cerrado, ni que un valor parecido (`agro` vs `agroindustria`) es el mismo.**
- `estado` sí coincide front/DB (los 7 de abajo). Ídem `ocupacion`, dims, levels.

`estado` — fuente: `ESTADO_LABELS` en `js/render.js` (coincide con la DB):

```
vigente · suspendida_judicialmente · derogada_total · derogada_parcial ·
vetada · convalidada_congreso · convalidada_csjn
```

### `area` NO va en el objeto JS

Las medidas **nuevas no llevan campo `area` en el objeto JS** (vive solo en la DB/SQL). Algunas
medidas viejas tienen `area:` con **labels de front** ("Impuestos", "Jubilaciones", "Servicios"),
que son legacy y NO coinciden con el enum de la DB. No agregues `area` a un objeto JS nuevo.

### `tags` del objeto JS: vocabulario SUELTO (no es DIM_ICONS)

Los `tags` del objeto JS son **chips de presentación** y usan un vocabulario libre: las fichas
reales usan `"País"`, `"Impuestos"`, `"Calidad de servicios"`, etc., que NO son claves de
`DIM_ICONS`. **Solo el `name` de una dim dentro de `impact()` debe ser una clave exacta de
`DIM_ICONS`** (§4). Los `tags` no se auditan contra ese catálogo.

---

## 3) `level` de una dimensión (7 valores)

Escala de intensidad del impacto. Los `pos_*` son la cara "a favor del perfil".

```
strong · mid · soft · none · pos_strong · pos · pos_soft
```

- `strong / mid / soft` → impacto que pega (negativo o neutro-fuerte), de mayor a menor.
- `pos_strong / pos / pos_soft` → impacto favorable, de mayor a menor.
- `none` → sin efecto para ese perfil.

Convención observada en 27802: al empleador (`pyme`) se le muestra `pos_soft`
(le conviene relativamente); al dependiente, `strong/mid/soft`.

---

## 4) `name` de una dimensión = clave de `DIM_ICONS`

Fuente: `DIM_ICONS` en `js/medidas-base.js`. **Solo** estas claves valen como `name`:

```
Plata · Vivienda · Trabajo · Salud · Carga mental · Tiempo · Estabilidad ·
Servicios · Calidad de servicios · Movilidad · Movilidad social ·
Vida familiar / ocio · Vida familiar · Educación ·
País / Equilibrio institucional · Ahorro · Vacaciones · Ocio
```

`Ahorro`, `Vacaciones`, `Ocio` existen en el catálogo pero todavía sin medida que las use.
Si una ficha necesita una dimensión que NO está acá, **no la inventes en el borrador**:
marcá la candidata como `dudosa` y avisá — agregar una clave a `DIM_ICONS` es decisión tuya.

---

## 5) Vocabulario de `p.*` (los chips del perfil, en index.html / render.js)

El parámetro `p` que recibe `impact(p)` tiene estos campos. Solo estos valores existen:

- **`p.ocupacion`** (14): `empleado_priv` · `empleado_pub` · `monotrib` · `autonomo` ·
  `trab_informal` · `domestica_reg` · `domestica_no_reg` · `jubilado_min` ·
  `jubilado_med` · `pensionado` · `estudiante` · `desempleado` · `ama_casa` · `pyme`
- **`p.extra`** (5): `no` · `plataforma` · `segundo` · `changas` · `renta`
- **`p.zona`** (16): `caba` · `gba_norte` · `gba_sur` · `gba_oeste` · `laplata` ·
  `cba_cap` · `cba_int` · `rosario` · `santafe_int` · `mendoza` · `tucuman` ·
  `nea` · `noa` · `cuyo` · `patagonia` · `pueblo`
- **`p.vivienda`** (6): `alquila` · `propio` · `propio_credito` · `familiar` ·
  `alquila_renta` · `ocupada`
- **`p.ingreso`** (6): `hasta_700k` · `700k_1.5m` · `1.5m_3m` · `3m_6m` · `6m_15m` · `mas_15m`
- **`p.pareja`** (4): `si_ambos_trab` · `si_uno_trab` · `si_ninguno` · `no`
- **`p.hijos`** (4): `0` · `1` · `2` · `3mas`
- **`p.adultos`** (3): `0` · `1` · `2mas`
- **`p.transporte`** (8): `2colectivos` · `combinacion` · `tren` · `auto` · `moto` ·
  `cerca` · `mixto` · `solo_finde`
- **`p.salud`** (6): `hosp_pub` · `os_sindical` · `pami` · `prepaga` · `prepaga_aporte` · `mixta`
- **`p.discapacidad`** (5): `no` · `propia_cud` · `propia_sin_cud` · `familiar_cud` · `familiar_sin_cud`
- **`p.asistencia`** (13, **ARRAY multi-select** — ver ⚠️ abajo): `auh` · `embarazo` ·
  `alimentar` · `progresar` · `potenciar` · `pnc_vejez` · `pnc_discap` · `pnc_madre` ·
  `sub_pami` · `tarifa_sube` · `sef` · `procrear` · `ninguno`

### ⚠️ `p.asistencia` es un ARRAY, no un string

El usuario puede marcar **varias** asistencias a la vez, así que `p.asistencia` llega como
**array de strings** (o `undefined`). **Nunca** compares con `===`:

```js
// ❌ MAL — nunca matchea (asistencia es array): silenciosamente no dispara la dim
if (p.asistencia === 'sef') { ... }

// ✅ BIEN — patrón canónico del catálogo (render/medidas-base.js líneas 150, 290, 2139)
const conSEF = (p.asistencia || []).includes('sef');
const pnc = ['pnc_vejez','pnc_discap','pnc_madre'].some(a => (p.asistencia || []).includes(a));
```

El `(p.asistencia || [])` cubre el caso `undefined`. Todos los demás campos de `p` (`ocupacion`,
`zona`, `ingreso`, `extra`, …) **sí son strings** y se comparan con `===` / `.includes()` sobre
listas literales.

> Si te falta un valor de perfil que la medida necesita (ej. un nuevo tipo de
> ocupación), **no lo inventes**: es un cambio de front que decidís vos.

---

## 6) REGLA EMPLEADOR (no negociable)

El texto dirigido al **empleador** (quien contrata, paga aportes patronales, etc.)
se muestra **solo** cuando `p.ocupacion === 'pyme'`.

```js
const empleador = p.ocupacion === 'pyme';
if (empleador) {
  dims.push({ name: "Trabajo", level: "pos_soft",
    body: "Si contratás personal: …" });
}
```

Ninguna otra ocupación recibe la mirada de empleador. Ver 27802 líneas 3476 y 3497–3500.

---

## 7) Tono — NEUTRO siempre

- Describí **el mecanismo**: qué cambia, para quién, cuánto. Nunca si es bueno o malo.
- Sí: "la base de cálculo ahora excluye el aguinaldo".
- No: "un recorte injusto" / "una mejora largamente esperada".
- Los `pos_*` indican *a quién favorece* la mecánica, no que la medida sea buena.
- `<strong>…</strong>` es el único HTML permitido en `body` (resaltar números/hechos).

---

## 8) Checklist de sincronización JS ↔ SQL

- [ ] `id` idéntico en objeto JS y en el `INSERT INTO medidas`.
- [ ] `date` (JS) == `fecha_bora` (SQL).
- [ ] `title` (JS) ≈ `titulo` (SQL).
- [ ] `fuente` (JS) == `fuente_url` (SQL) y la URL responde (BORA vivo).
- [ ] `area` ∈ los 14 valores (§2).
- [ ] `estado` ∈ los 7 valores (§2).
- [ ] cada `name` de dim ∈ DIM_ICONS (§4).
- [ ] cada `level` ∈ los 7 valores (§3).
- [ ] cada `p.ocupacion` / `p.extra` / etc. usado ∈ los vocabularios (§5).
- [ ] texto de empleador **solo** bajo `p.ocupacion === 'pyme'` (§6).
- [ ] el objeto JS pasa `node --check` (envuelto como módulo — ver el runbook).
