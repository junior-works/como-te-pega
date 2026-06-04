/* Cómo Te Pega — capa de datos (Supabase + cache + fallback)
 * ------------------------------------------------------------------
 * Orquesta de dónde salen los datos de las medidas:
 *
 *   1. CACHE FRESCO (localStorage, TTL 6h)  → uso directo, sin red.
 *   2. SUPABASE (fetch en paralelo)         → si no hay cache fresco.
 *   3. CACHE VIEJO                          → si el fetch falla pero hay cache.
 *   4. FALLBACK v0.5 (medidas-base.js)      → si no hay nada (primer load offline).
 *
 * En todos los casos las reglas impact() y los compareProfiles salen de
 * medidas-base.js. De Supabase vienen los datos editoriales (titulo,
 * descripcion, tags, area, estado, popularidad) + la cobertura mediática y
 * las observaciones constitucionales, que se mergean ENCIMA del base por id.
 * ------------------------------------------------------------------ */
import { SUPABASE_REST, SUPABASE_HEADERS } from "../config.js";
import { MEASURES_BASE, MEASURES_BASE_BY_ID } from "./medidas-base.js";

const CACHE_KEY = "ctp-data-v0.8.1";
const TTL_MS = 6 * 60 * 60 * 1000; // 6 horas

// Endpoints de solo-lectura. select explícito = payload chico y estable.
const ENDPOINTS = {
  medidas:        "medidas_con_popularidad?select=id,fecha_bora,titulo,descripcion,tags,area,estado,vigente,tipo_norma,numero,fuente_url,fuente_descripcion,popularidad_medios,nivel_popularidad,created_at",
  cobertura:      "cobertura_mediatica?select=medida_id,medio_id,cubierto,fecha_cobertura,titular&cubierto=is.true",
  observaciones:  "observaciones_constitucionales?select=medida_id,articulo_numero,estado,fallo_referencia,fecha_fallo,resumen,fuente_url",
  articulos:      "articulos_constitucion?select=numero,nombre,resumen",
  medios:         "medios?select=id,nombre,posicionamiento,orden&order=orden.asc"
};

async function fetchOne(path) {
  const res = await fetch(`${SUPABASE_REST}/${path}`, { headers: SUPABASE_HEADERS });
  if (!res.ok) throw new Error(`Supabase ${res.status} en ${path}`);
  return res.json();
}

async function fetchAll() {
  const keys = Object.keys(ENDPOINTS);
  const results = await Promise.all(keys.map(k => fetchOne(ENDPOINTS[k])));
  const out = {};
  keys.forEach((k, i) => { out[k] = results[i]; });
  return out;
}

// ---- cache helpers --------------------------------------------------------
function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.ts || !parsed.db) return null;
    return parsed;
  } catch (_) { return null; }
}

function writeCache(db) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), db }));
  } catch (_) { /* quota / modo privado: seguimos sin cachear */ }
}

function isFresh(parsed) {
  return parsed && (Date.now() - parsed.ts) < TTL_MS;
}

// "comercio_exterior" → "Comercio Exterior"; para mostrar el área lindo.
function capitalizeArea(a) {
  if (!a) return "Otras";
  return String(a).split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const NOIMPACT = () => [];

// ---- build: catálogo DRIVEN POR LA DB ------------------------------------
// El listado de medidas SON las filas de la DB (67 hitos reales). El v0.5
// (medidas-base.js) solo aporta las reglas impact()/compareProfiles cuando el
// id coincide; si no coincide, la medida se muestra igual pero sin análisis de
// impacto (mensaje neutro en la pantalla de impacto).
function buildMeasures(db) {
  const medios = (db.medios || []).slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));
  const totalMedios = medios.length || 6;
  const mediosById = Object.fromEntries(medios.map(m => [m.id, m]));
  const articulosByNum = Object.fromEntries((db.articulos || []).map(a => [a.numero, a]));

  // Agrupar cobertura (solo cubierto=true) y observaciones por medida.
  const coberturaPorMedida = {};
  (db.cobertura || []).forEach(c => {
    if (!c.cubierto) return;
    (coberturaPorMedida[c.medida_id] ||= []).push(c);
  });
  const obsPorMedida = {};
  (db.observaciones || []).forEach(o => {
    (obsPorMedida[o.medida_id] ||= []).push(o);
  });

  const rows = db.medidas || [];
  // DB vacía → fallback al catálogo v0.5 (offline / pre-seed).
  if (!rows.length) return buildFallback();

  const measures = rows.map(row => {
    const id = row.id;
    const base = MEASURES_BASE_BY_ID[id];
    const hasRules = !!(base && typeof base.impact === "function");

    const cobertura = (coberturaPorMedida[id] || [])
      .map(c => ({
        medioId: c.medio_id,
        nombre: mediosById[c.medio_id]?.nombre || c.medio_id,
        orden: mediosById[c.medio_id]?.orden ?? 99,
        titular: c.titular || null,
        fecha: c.fecha_cobertura || null
      }))
      .sort((a, b) => a.orden - b.orden);

    const observaciones = (obsPorMedida[id] || []).map(o => ({
      articuloNumero: o.articulo_numero,
      articuloNombre: articulosByNum[o.articulo_numero]?.nombre || null,
      articuloResumen: articulosByNum[o.articulo_numero]?.resumen || null,
      estado: o.estado,
      falloReferencia: o.fallo_referencia || null,
      fechaFallo: o.fecha_fallo || null,
      resumen: o.resumen || null,
      fuenteUrl: o.fuente_url || null
    }));

    return {
      id,
      // fecha_bora ordena el historial; si faltara, created_at como respaldo.
      date: row.fecha_bora || (row.created_at || "").slice(0, 10) || "",
      title: row.titulo || (base ? base.title : id),
      meta: base ? base.meta : [row.tipo_norma, row.numero].filter(Boolean).join(" ") || "—",
      desc: row.descripcion ?? (base ? base.desc : ""),
      tags: (Array.isArray(row.tags) && row.tags.length) ? row.tags : (base ? base.tags : []),
      area: capitalizeArea(row.area),
      areaRaw: row.area || "otros", // valor crudo para filtrar (la DB guarda snake_case)
      estado: row.estado || "vigente",
      fuente: row.fuente_descripcion || (base ? base.fuente : null),
      fuenteUrl: row.fuente_url || null,
      impact: hasRules ? base.impact : NOIMPACT,
      hasRules,
      compareProfiles: base ? base.compareProfiles : [],
      popularidad: row.popularidad_medios ?? cobertura.length,
      nivelPopularidad: row.nivel_popularidad ?? null,
      cobertura,
      coberturaTotal: totalMedios,
      observaciones,
      hasDb: true
    };
  });

  // Orden por fecha desc (más recientes primero) — usado por home e historial.
  measures.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return { measures, medios };
}

// Fallback puro v0.5 (sin DB): normaliza el base a la forma que espera render.
function buildFallback() {
  const measures = MEASURES_BASE.map(m => ({
    ...m,
    areaRaw: String(m.area || "otros").toLowerCase(), // best-effort offline (las 6 del base mapean 1:1)
    hasRules: typeof m.impact === "function",
    fuenteUrl: null,
    popularidad: null,
    nivelPopularidad: null,
    cobertura: [],          // sin cobertura conocida offline
    coberturaTotal: 6,
    observaciones: [],      // sin observaciones conocidas offline
    hasDb: false
  }));
  measures.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return { measures, medios: [] };
}

// Store del catálogo COMPLETO (las 68) ya hidratado. Lo usan:
//   - el balance histórico, el trending y el historial (necesitan todo),
//   - queryMeasures() para enriquecer las filas paginadas y como fallback
//     offline cuando el fetch con filtros falla.
let _store = { measures: [], byId: {} };

function setStore(measures) {
  _store = {
    measures: measures || [],
    byId: Object.fromEntries((measures || []).map(m => [m.id, m]))
  };
}

// Medida "liviana" a partir de una fila cruda de la vista. Se usa cuando una
// fila devuelta por la query paginada no está en el store completo (p. ej.
// cache parcial/desfasado): así la tarjeta se muestra igual en vez de perderse.
// No trae cobertura/observaciones detalladas (la query liviana no las pide),
// pero sí el conteo de popularidad para el badge.
function buildLightMeasure(row) {
  const base = MEASURES_BASE_BY_ID[row.id];
  const hasRules = !!(base && typeof base.impact === "function");
  return {
    id: row.id,
    date: row.fecha_bora || (row.created_at || "").slice(0, 10) || "",
    title: row.titulo || (base ? base.title : row.id),
    meta: base ? base.meta : [row.tipo_norma, row.numero].filter(Boolean).join(" ") || "—",
    desc: row.descripcion ?? (base ? base.desc : ""),
    tags: (Array.isArray(row.tags) && row.tags.length) ? row.tags : (base ? base.tags : []),
    area: capitalizeArea(row.area),
    areaRaw: row.area || "otros",
    estado: row.estado || "vigente",
    fuente: row.fuente_descripcion || (base ? base.fuente : null),
    fuenteUrl: row.fuente_url || null,
    impact: hasRules ? base.impact : NOIMPACT,
    hasRules,
    compareProfiles: base ? base.compareProfiles : [],
    popularidad: row.popularidad_medios ?? 0,
    nivelPopularidad: row.nivel_popularidad ?? null,
    cobertura: [],
    coberturaTotal: 6,
    observaciones: [],
    hasDb: true
  };
}

// Resuelve una fila contra el store; si falta, la construye y la registra
// (mutando el array compartido, que ES window.MEASURES) para que openMeasure()
// la encuentre después.
function resolveRow(row) {
  let m = _store.byId[row.id];
  if (!m) {
    m = buildLightMeasure(row);
    _store.byId[row.id] = m;
    _store.measures.push(m);
  }
  return m;
}

/* loadData()
 * Devuelve { measures, medios, source } donde source ∈
 *   "cache" | "network" | "cache-stale" | "fallback".
 * Carga el catálogo completo una vez (balance/trending/historial + offline).
 */
export async function loadData() {
  const cached = readCache();
  let result;
  if (isFresh(cached)) {
    result = { ...buildMeasures(cached.db), source: "cache" };
  } else {
    try {
      const db = await fetchAll();
      writeCache(db);
      result = { ...buildMeasures(db), source: "network" };
    } catch (err) {
      console.warn("[ctp] fetch Supabase falló:", err?.message || err);
      if (cached) result = { ...buildMeasures(cached.db), source: "cache-stale" };
      else result = { ...buildFallback(), source: "fallback" };
    }
  }
  setStore(result.measures);
  return result;
}

// ---- query con filtros + paginación (pantalla de medidas) -----------------
// Construye la URL PostgREST con .in()/.gte()/.lt()/.ilike() + limit/offset.
function buildQueryUrl(f) {
  const sel = "select=id,fecha_bora,titulo,descripcion,tags,area,estado,vigente," +
              "tipo_norma,numero,fuente_url,fuente_descripcion,popularidad_medios," +
              "nivel_popularidad,created_at";
  const parts = [sel, "order=fecha_bora.desc"];
  if (f.areas && f.areas.length)
    parts.push(`area=in.(${f.areas.map(encodeURIComponent).join(",")})`);
  if (f.estados && f.estados.length)
    parts.push(`estado=in.(${f.estados.map(encodeURIComponent).join(",")})`);
  if (f.popularidades && f.popularidades.length)
    parts.push(`popularidad_medios=in.(${f.popularidades.join(",")})`);
  if (f.fechaDesde) parts.push(`fecha_bora=gte.${f.fechaDesde}`);
  if (f.fechaHasta) parts.push(`fecha_bora=lt.${f.fechaHasta}`);
  if (f.busqueda && f.busqueda.trim()) {
    const t = encodeURIComponent("*" + f.busqueda.trim() + "*");
    parts.push(`or=(titulo.ilike.${t},descripcion.ilike.${t})`);
  }
  parts.push(`limit=${f.limit != null ? f.limit : 15}`);
  parts.push(`offset=${f.offset || 0}`);
  return `${SUPABASE_REST}/medidas_con_popularidad?${parts.join("&")}`;
}

// Mismo filtrado que el server, pero client-side sobre el store (fallback / offline).
function clientQuery(f) {
  let arr = _store.measures.slice();
  if (f.areas && f.areas.length) arr = arr.filter(m => f.areas.includes(m.areaRaw));
  if (f.estados && f.estados.length) arr = arr.filter(m => f.estados.includes(m.estado));
  if (f.popularidades && f.popularidades.length)
    arr = arr.filter(m => f.popularidades.includes(m.popularidad ?? (m.cobertura?.length || 0)));
  if (f.fechaDesde) arr = arr.filter(m => String(m.date) >= f.fechaDesde);
  if (f.fechaHasta) arr = arr.filter(m => String(m.date) < f.fechaHasta);
  if (f.busqueda && f.busqueda.trim()) {
    const t = f.busqueda.trim().toLowerCase();
    arr = arr.filter(m =>
      (m.title || "").toLowerCase().includes(t) || (m.desc || "").toLowerCase().includes(t));
  }
  arr.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const total = arr.length;
  const offset = f.offset || 0;
  const limit = f.limit != null ? f.limit : 15;
  return { medidas: arr.slice(offset, offset + limit), total, source: "offline" };
}

/* queryMeasures(filters)
 * filters: { areas[], estados[], popularidades[], fechaDesde, fechaHasta,
 *            busqueda, limit, offset }  (todos opcionales)
 * Devuelve { medidas, total, source }. Las filas vienen de la DB pero se
 * enriquecen contra el store completo (cobertura/observaciones/reglas), así
 * las tarjetas son idénticas a las del catálogo. Si el fetch falla, filtra
 * el store client-side (offline).
 */
export async function queryMeasures(filters = {}) {
  try {
    const res = await fetch(buildQueryUrl(filters), {
      headers: { ...SUPABASE_HEADERS, Prefer: "count=exact" }
    });
    if (!res.ok) throw new Error(`Supabase ${res.status}`);
    const rows = await res.json();
    const cr = res.headers.get("content-range") || "";
    const total = parseInt((cr.split("/")[1] || ""), 10);
    const medidas = rows.map(resolveRow);
    return { medidas, total: Number.isFinite(total) ? total : medidas.length, source: "network" };
  } catch (err) {
    console.warn("[ctp] queryMeasures cayó a offline:", err?.message || err);
    return clientQuery(filters);
  }
}
