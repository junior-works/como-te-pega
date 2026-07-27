# ctp-semanal — runbook del ciclo semanal

> Este archivo es la **lógica versionada** del loop. El disparador
> (`.claude/commands/ctp-semanal.md`) solo dice "ejecutá este runbook".
> Se versiona acá porque `.claude/` está en `.gitignore` en este repo.

## Qué hace y qué NO hace

Detecta medidas nuevas del Boletín Oficial argentino, redacta **borradores** de
ficha y te notifica. **Nunca publica.** La aprobación editorial es tuya.

### 🚫 LÍMITE DURO (el ciclo se detiene si algo de esto haría falta)

- **No** editar `js/medidas-base.js`.
- **No** ejecutar SQL / no tocar Supabase.
- **No** `git commit`, `git push`, ni cambiar de branch.
- **No** bumpear versión (`config.js`, `service-worker.js`, `manifest.json`).
- El ciclo **termina** en: borradores de ficha + **borrador de newsletter** +
  `candidatas.md`/`log_bora.md` actualizados + notificación ntfy. Nada más.
- El **newsletter es un BORRADOR editorial**: nunca se envía ni se publica solo
  (no mailing, no redes). La revisión y el envío los hace la persona editora.

Si en algún paso parece necesario cruzar el límite, **frená y reportá** en vez de hacerlo.

---

## Paso 1 — Leer el estado

1. Abrí `pendientes/log_bora.md`. Tomá la fecha de **"procesado hasta"** → es `DESDE`.
2. `HASTA` = la fecha de hoy.
3. Si `DESDE == HASTA`, no hay ventana nueva → andá directo al Paso 6 (notificar "sin novedades").

## Paso 2 — Barrer fuentes oficiales

Buscá medidas publicadas **entre `DESDE` (exclusive) y `HASTA`** en:

- `boletinoficial.gob.ar` (Primera Sección — normas)
- `argentina.gob.ar` (normativa / novedades)

Usá WebSearch + WebFetch. Enfocá en medidas que **afectan a la ciudadanía** en estas áreas
(mapean 1:1 al vocabulario `area`, §2 de `patron-medida.md`):

> fiscal · laboral · previsional · energia · transporte · salud · educacion ·
> comercio_exterior · privatizaciones · **cambiario→fiscal/otros** · vivienda

**EXCLUIR** (no son candidatas): designaciones, nombramientos, renuncias, jubilaciones
de funcionarios, trámites administrativos internos, edictos, y todo lo
que no cambie la vida de la gente común.

**Tarifas — leé con cuidado (criterio afinado):**
- ✅ **SÍ son candidatas:** revisiones tarifarias **quinquenales** (RQT), cambios de
  **cuadros tarifarios completos** o nuevos regímenes tarifarios (ej. Res. 40/2026 del
  ENReGE). Cambian la estructura de lo que paga la gente → ficha.
- ❌ **Excluir solo:** actualizaciones **mensuales automáticas por fórmula** de
  indexación (ajustes de rutina sin cambio de estructura).
- Ante la duda entre "ajuste mensual" y "cuadro nuevo": tratala como candidata y
  dejá que la revisión editorial decida.

**Privatizaciones / licitaciones — matiz:** una **licitación de venta** de una empresa
de servicios que usa la gente (ej. AySA, agua/cloacas) **sí es candidata** (cambia quién
presta el servicio). Las licitaciones puramente internas de compras del Estado, no.

Para cada norma relevante anotá: tipo+número, título, fecha BORA, URL del aviso, área, resumen.

## Paso 3 — Redactar el borrador (por candidata)

Seguí **`pendientes/patron-medida.md`** al pie de la letra. Para cada candidata escribí
un archivo `pendientes/borradores/<id_propuesto>.md` con TRES bloques:

1. **Objeto JS** listo para pegar en el array `MEASURES_BASE` de `medidas-base.js`.
2. **SQL** de migración (`BEGIN; INSERT … COMMIT;`), `id` idéntico al del JS.
3. **Parámetros / notas**: valores duros citables y de dónde salió cada uno.

Tono **NEUTRO** en todo `body`/`desc`: describir el mecanismo, nunca juzgar (§7 del patrón).
Recordá la **REGLA EMPLEADOR** (§6): texto de empleador solo bajo `p.ocupacion === 'pyme'`.

`id_propuesto` sugerido: `<tipo>_<tema>_<numero>` en snake_case, sin tildes
(ej. `decreto_tarifas_energia_512`).

## Paso 4 — AUDITORÍA (actuá como verificador separado)

Validá cada borrador contra criterios **objetivos**. Si algo falla → corregí y **re-auditá**
hasta pasar. Un borrador no se guarda como `borrador` hasta pasar todo:

**a) Sintaxis del objeto JS** — extraé el objeto a un archivo temporal envuelto como módulo y corré `node --check`:

```bash
# escribí el objeto en <scratch>/check.mjs así:
#   export const M = { …el objeto… };
node --check "<scratch>/check.mjs" && echo "JS OK"
```

Opcional pero recomendado — ejercitar `impact()` sin que explote:

```bash
# <scratch>/run.mjs:
#   import { M } from './check.mjs';
#   // ⚠️ p.asistencia SIEMPRE se pasa como ARRAY (multi-select). Incluir códigos reales
#   //    (sef, pnc_vejez, ...) para que un bug `asistencia === 'x'` (que nunca matchea)
#   //    se manifieste como dim faltante y sea detectable.
#   const ASIS = [[], ['ninguno'], ['sef'], ['pnc_vejez','tarifa_sube'], ['pnc_madre']];
#   for (const oc of ['empleado_priv','pyme','trab_informal','jubilado_min','jubilado_med','pensionado','desempleado']) {
#     for (const as of ASIS) {
#       const dims = M.impact({ ocupacion: oc, extra: 'no', asistencia: as });
#       if (!Array.isArray(dims)) throw new Error('impact no devolvió array: ' + oc + '/' + JSON.stringify(as));
#     }
#   }
#   console.log('impact OK');
node "<scratch>/run.mjs"
```

**REGLA DEL HARNESS:** `p.asistencia` es un **array** (multi-select). El auditor **debe** pasarlo
como array —incluyendo `['sef']`, `['pnc_vejez']`, etc.— nunca como string. Si se pasa string, un
bug del tipo `p.asistencia === 'sef'` no se detecta (con string "matchearía por casualidad"; con
array real nunca dispara y la dim esperada falta). Ver `patron-medida.md` §5.

**b) `id` idéntico** entre el objeto JS y el `INSERT INTO medidas` del SQL (comparación exacta).

**c) `fuente_url` del BORA responde** — WebFetch (o `curl -sI`) a la URL; esperar 200 / contenido del aviso.

**d) Vocabulario cerrado** — todos con valores existentes:
   - `area` ∈ los 14 (§2 del patrón)
   - `estado` ∈ los 7 (§2)
   - cada dim `name` ∈ `DIM_ICONS` (§4)
   - cada `level` ∈ los 7 (§3)
   - cada `p.ocupacion`/`p.extra`/… ∈ los vocabularios (§5)

**e) Sincronización** — `date==fecha_bora`, `title≈titulo`, `fuente==fuente_url`.

Si una candidata no puede pasar la auditoría (p. ej. necesita una dimensión o una
ocupación que no existe), **no la fuerces**: marcala `dudosa` en `candidatas.md`, sin
borrador, y describí qué falta.

## Paso 5 — Persistir el estado

1. Dejá los borradores validados en `pendientes/borradores/`.
2. Agregá/actualizá filas en `pendientes/candidatas.md` (estado `borrador` o `dudosa`).
3. En `pendientes/log_bora.md`:
   - Actualizá el bloque "Estado actual" → **procesado hasta `HASTA`** y, si cargaste una
     referencia clara, la última medida vista.
   - Agregá una línea al historial: `- DESDE → HASTA | N candidatas | ids, notas`.

## Paso 5b — Borrador del newsletter semanal

Después de los borradores de ficha, redactá **también** el borrador del newsletter en
`pendientes/newsletter/edicion-YYYY-MM-DD.md` (fecha = `HASTA`). Es **contenido editorial**:
queda como **BORRADOR para revisión**, **nunca se envía solo**. Tono idéntico a las fichas —
neutral, rioplatense, verificable, sin juicios de valor. Seguí el molde de
`pendientes/newsletter/edicion-referencia.md`.

Estructura obligatoria:

1. **Asunto propuesto** — una línea, llamativo **sin alarmismo**.
2. **Encabezado fijo:** `CÓMO TE PEGA SEMANAL` + 1-2 líneas de apertura.
3. **Un bloque por medida nueva de la semana**, cada uno con:
   - emoji temático + **título en claro**
   - `(norma y número)` — ej. `(Decreto 399/2026)`
   - 2-4 líneas neutras de **qué dice** (el mecanismo, no si es bueno o malo)
   - línea final **`Le pega a: …`** (a quién afecta, en criollo)
4. **Si la semana no trajo medidas:** un bloque único **"Semana tranquila en el Boletín"** +
   **una** medida del catálogo existente (`js/medidas-base.js`) como **"repaso"**, elegida por
   relevancia **estacional** (ej. en marzo: cuotas de colegio / útiles; en invierno: tarifas de
   gas; etc.). Mismo formato de bloque (emoji + título + norma + qué dice + `Le pega a:`).
5. **Cierre fijo** (literal, siempre):
   - CTA a la app: `👉 Mirá cómo te pega a vos: junior-works.github.io/como-te-pega`
   - Suscripción: `¿Te lo reenviaron? Suscribite acá: [LINK DE SUSCRIPCIÓN]`
   - `Este resumen no opina: informa.`
   - Firma: `El equipo de Cómo Te Pega`

Regla de sincronía: los bloques de "medida nueva" deben salir de los borradores de ficha de
esta semana (mismos hechos, mismo tono). No introduzcas datos que no estén verificados en una ficha.

## Paso 6 — Notificar por ntfy.sh (OBLIGATORIO, SIEMPRE)

**Regla dura:** el ciclo termina SÍ o SÍ con una notificación ntfy — con novedades o sin
ellas, sea cual sea el resultado. El silencio es una señal reservada: significa que la tarea
**no corrió**. Nunca termines el ciclo sin notificar. (Un heartbeat de FALLO adicional lo
cubre el wrapper `run-ctp-semanal.ps1` si el ciclo se cae antes de este paso.)

Leé el topic desde `.env` (`NTFY_TOPIC=...`; copiá `.env.example` la primera vez).

Siempre mencioná que el **borrador de newsletter** quedó listo (Paso 5b lo genera sí o sí).

Con novedades:
```bash
curl -s -H "Title: CTP semanal" \
     -d "N candidatas nuevas (DESDE→HASTA). Borradores listos: <ids>. Borrador de newsletter listo. Revisá pendientes/borradores/ y pendientes/newsletter/." \
     "https://ntfy.sh/$NTFY_TOPIC"
```

Sin novedades:
```bash
curl -s -H "Title: CTP semanal" \
     -d "Sin novedades esta semana (DESDE→HASTA). No hay borradores nuevos. Borrador de newsletter listo (edición de repaso) en pendientes/newsletter/." \
     "https://ntfy.sh/$NTFY_TOPIC"
```

## Paso 7 — Cerrar

Terminá con un resumen en el chat: cuántas candidatas, cuáles pasaron auditoría,
cuáles quedaron `dudosa`, la ruta del **borrador de newsletter** generado, y el
recordatorio de que **la publicación (fichas y newsletter) la hacés vos**.
No cruces el LÍMITE DURO.
