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

const CACHE_KEY = "ctp-data-v0.6.1";
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

/* loadData()
 * Devuelve { measures, medios, source } donde source ∈
 *   "cache" | "network" | "cache-stale" | "fallback".
 */
export async function loadData() {
  const cached = readCache();
  if (isFresh(cached)) {
    return { ...buildMeasures(cached.db), source: "cache" };
  }
  try {
    const db = await fetchAll();
    writeCache(db);
    return { ...buildMeasures(db), source: "network" };
  } catch (err) {
    console.warn("[ctp] fetch Supabase falló:", err?.message || err);
    if (cached) return { ...buildMeasures(cached.db), source: "cache-stale" };
    return { ...buildFallback(), source: "fallback" };
  }
}
