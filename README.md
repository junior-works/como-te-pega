# Cómo Te Pega

Calculadora personal de impacto de medidas del **Boletín Oficial** argentino.
Cargás un perfil mínimo y ves cómo cada medida vigente te toca a vos — no solo
en el bolsillo, también en tu tiempo, tu salud, tu vivienda y tu vida.

PWA estática (HTML + JS vanilla, sin build), proyecto de **Junior Works**.

## Principio rector: objetividad

No juzgamos al gobierno, **medimos impacto**. Las mismas reglas se aplican a
cualquier gobierno; cuando un dato no es seguro, se dice.

La **clase social no la elige el usuario**: se *deriva* del ingreso del hogar,
en múltiplos de la Canasta Básica Total (CBT) del INDEC.

> El ingreso te dice dónde estás parado; la objetividad evita que la gente se
> crea de otra clase.

La derivación vive en [`js/clases-sociales.js`](js/clases-sociales.js).

## Stack

- HTML + CSS + JavaScript vanilla (un ES module: `js/clases-sociales.js`).
- PWA: `manifest.json` + `service-worker.js` (app shell con precache).
- Sin dependencias, sin bundler, sin paso de build.
- Hosting: GitHub Pages (`junior-works.github.io/como-te-pega`).

## Cómo correrlo local

No hay que instalar nada, pero **sí hay que servirlo por HTTP** (no abrir el
`index.html` directo): los ES modules y el service worker no cargan bajo
`file://`. Desde la raíz del repo:

```bash
# Python (viene con Windows si instalaste Python)
python -m http.server 8080

# o Node, si lo tenés
npx serve .
```

Después abrí `http://localhost:8080/`.

## Datos

Desde **v0.6** el catálogo de medidas se sirve desde **Supabase** (proyecto
`nqwnanfdpaesojuyaztm`), con fallback al catálogo hardcodeado del v0.5 si el
fetch falla (offline OK tras el primer load).

**Config:** `config.js` (raíz) exporta `SUPABASE_URL` y `SUPABASE_ANON_KEY`. La
anon key es *publishable* (pública, protegida por Row Level Security), por eso
va commiteada.

**Capa de datos** (`js/data.js`): al cargar hace `Promise.all` de
`medidas_con_popularidad`, `cobertura_mediatica`,
`observaciones_constitucionales`, `articulos_constitucion` y `medios`. Cachea el
payload crudo en `localStorage` con TTL de **6 horas**. Orden de resolución:
cache fresco → red → cache viejo → fallback v0.5.

**Schema relevante (Supabase):**

| Tabla | Para qué |
|---|---|
| `medidas` / vista `medidas_con_popularidad` | datos editoriales (titulo, descripcion, tags, area, estado) + `popularidad_medios` / `nivel_popularidad` |
| `cobertura_mediatica` | qué medios cubrieron cada medida (alimenta el *trending* ≥ 5/6) |
| `observaciones_constitucionales` | procesos judiciales reales por medida (apartado ⚖️) |
| `articulos_constitucion` | artículos CN referenciados por las observaciones |
| `medios` | los 6 medios que seguimos |
| `parametros_medida` | valores computables numéricos (tarifas, haberes, MNI…) — uso pleno en v0.7 |
| `clases_sociales` / `perfiles_arquetipos` | derivación de clase y perfiles por sector |

**Fuentes de datos:** BORA (Boletín Oficial), ARCA, INDEC, BCRA, ANSES y las
fuentes citadas por medida.

Las **reglas de impacto** (`impact(perfil)`) y los `compareProfiles` siguen
hardcodeados en `js/medidas-base.js` — migran a la tabla `reglas_impacto` en
v0.7. La fecha de cada norma también vive ahí (la tabla `medidas` no tiene
columna de fecha calendario todavía).

El seed inicial de las 6 medidas del v0.5 está en
`migrations/seed_initial_medidas.sql` (idempotente, no destructivo).

## Actualización semanal (`pendientes/`)

Loop asistido para detectar medidas nuevas del BORA y preparar fichas, **sin
publicar nada automáticamente**. La aprobación editorial final es siempre manual.

**Qué es** — la carpeta [`pendientes/`](pendientes/) es el estado del loop:

| Archivo | Rol |
|---|---|
| `log_bora.md` | hasta qué fecha se barrió el BORA (estado del loop) |
| `candidatas.md` | medidas detectadas, esperando decisión editorial |
| `patron-medida.md` | molde exacto de una ficha (objeto JS + SQL + vocabularios) |
| `ctp-semanal.md` | runbook del ciclo (7 pasos + el *límite duro*) |
| `borradores/` | una ficha por candidata, lista para revisar |

**Cómo se dispara** — manual, una vez por semana (p. ej. lunes), desde la raíz del repo:

```bash
/ctp-semanal            # dentro de Claude Code
# o headless:
claude -p "/ctp-semanal"
```

El ciclo lee `log_bora.md`, barre `boletinoficial.gob.ar` / `argentina.gob.ar` desde
esa fecha (excluye designaciones y trámites internos), redacta borradores con tono
neutro siguiendo `patron-medida.md`, **se autoaudita** (`node --check`, `id` JS==SQL,
`fuente_url` viva, vocabularios válidos) y avisa por [ntfy.sh](https://ntfy.sh). El
topic se configura en `.env` (`NTFY_TOPIC`, copiar de `.env.example`; `.env` está en
`.gitignore`).

**Límite duro:** el loop **no** edita `js/medidas-base.js`, **no** ejecuta SQL, **no**
commitea/pushea ni bumpea versión. Termina en borradores + notificación.

> ⚠️ **Los borradores requieren aprobación manual antes de cargarse.** El editor
> revisa cada ficha en `pendientes/borradores/`; recién ahí aplica a mano el objeto
> a `js/medidas-base.js` y corre el SQL de la migración. El loop nunca toca los datos
> en producción.

## Estado

Prototipo **v0.6** — fetch desde Supabase + trending mediático
("lo que están discutiendo todos") + historial cronológico + apartado
constitucional por medida. Construido sobre el v0.5 (rebrand, clase social
derivada y vista por sector social).
