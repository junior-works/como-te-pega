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

const CACHE_KEY = "ctp-data-v0.6";
const TTL_MS = 6 * 60 * 60 * 1000; // 6 horas

// Endpoints de solo-lectura. select explícito = payload chico y estable.
const ENDPOINTS = {
  medidas:        "medidas_con_popularidad?select=id,titulo,descripcion,tags,area,estado,vigente,tipo_norma,numero,fuente_url,popularidad_medios,nivel_popularidad,created_at",
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

// ---- merge: Supabase ENCIMA del base v0.5 ---------------------------------
function buildMeasures(db) {
  const medios = (db.medios || []).slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));
  const totalMedios = medios.length || 6;
  const mediosById = Object.fromEntries(medios.map(m => [m.id, m]));
  const articulosByNum = Object.fromEntries((db.articulos || []).map(a => [a.numero, a]));

  // Agrupar cobertura y observaciones por medida.
  const coberturaPorMedida = {};
  (db.cobertura || []).forEach(c => {
    if (!c.cubierto) return;
    (coberturaPorMedida[c.medida_id] ||= []).push(c);
  });
  const obsPorMedida = {};
  (db.observaciones || []).forEach(o => {
    (obsPorMedida[o.medida_id] ||= []).push(o);
  });

  const dbById = Object.fromEntries((db.medidas || []).map(m => [m.id, m]));

  // Conjunto de ids: base + cualquier medida de la DB que aún no esté en base.
  const ids = [];
  MEASURES_BASE.forEach(m => ids.push(m.id));
  (db.medidas || []).forEach(m => { if (!MEASURES_BASE_BY_ID[m.id]) ids.push(m.id); });

  const measures = ids.map(id => {
    const base = MEASURES_BASE_BY_ID[id];
    const row = dbById[id];

    // Cobertura mediática enriquecida con el medio.
    const coberturaRaw = coberturaPorMedida[id] || [];
    const cobertura = coberturaRaw
      .map(c => ({
        medioId: c.medio_id,
        nombre: mediosById[c.medio_id]?.nombre || c.medio_id,
        orden: mediosById[c.medio_id]?.orden ?? 99,
        titular: c.titular || null,
        fecha: c.fecha_cobertura || null
      }))
      .sort((a, b) => a.orden - b.orden);

    // Observaciones constitucionales enriquecidas con el artículo.
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

    if (base) {
      // Base v0.5 + override editorial de la DB (si existe la fila).
      return {
        ...base,
        title: row?.titulo ?? base.title,
        desc:  row?.descripcion ?? base.desc,
        tags:  (Array.isArray(row?.tags) && row.tags.length) ? row.tags : base.tags,
        area:  row?.area ?? base.area,
        estado: row?.estado ?? base.estado,
        // meta y fuente ricos del v0.5 se conservan (el schema no los guarda).
        meta: base.meta,
        fuente: base.fuente,
        fuenteUrl: row?.fuente_url ?? null,
        popularidad: row?.popularidad_medios ?? cobertura.length,
        nivelPopularidad: row?.nivel_popularidad ?? null,
        cobertura,
        coberturaTotal: totalMedios,
        observaciones,
        hasDb: !!row
      };
    }

    // Medida que solo existe en la DB (catálogo extendido futuro). Sin reglas
    // impact() todavía → devolvemos vacío hasta que se carguen en v0.7.
    return {
      id,
      date: (row?.created_at || "").slice(0, 10) || "2023-12-10",
      title: row?.titulo || id,
      meta: [row?.tipo_norma, row?.numero].filter(Boolean).join(" ") || "—",
      desc: row?.descripcion || "",
      tags: Array.isArray(row?.tags) ? row.tags : [],
      area: row?.area || "Otras",
      estado: row?.estado || "vigente",
      fuente: null,
      fuenteUrl: row?.fuente_url || null,
      impact: () => [],
      compareProfiles: [],
      popularidad: row?.popularidad_medios ?? cobertura.length,
      nivelPopularidad: row?.nivel_popularidad ?? null,
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
