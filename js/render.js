/* Cómo Te Pega — capa de UI (render + navegación)
 * ------------------------------------------------------------------
 * Script clásico (no module) para poder exponer las funciones globales que
 * usan los onclick del HTML (show, etc.). Los datos llegan por window.MEASURES
 * y window.MEDIOS, que setea el bootstrap de módulos al final del index.html.
 *
 * v0.6 agrega tres vistas:
 *   A. Home / Trending  → "Lo que están discutiendo todos" (cobertura ≥ 5/6).
 *   B. Historial cronológico (pantalla nueva).
 *   C. Apartado "⚖️ Constitución" dentro de cada medida.
 * ------------------------------------------------------------------ */
/* global calcularClaseSocial, CLASES_SOCIALES, PERFILES_ARQUETIPICOS */

// ============== LABELS ==============
const FIELD_LABELS = {
  ocupacion: {
    empleado_priv: "Empleado privado", empleado_pub: "Empleado público",
    monotrib: "Monotributista", autonomo: "Autónomo",
    trab_informal: "Trabajo informal", domestica_reg: "Doméstica reg.",
    domestica_no_reg: "Doméstica no reg.", jubilado_min: "Jubilado mínima",
    jubilado_med: "Jubilado media-alta", pensionado: "Pensionado",
    estudiante: "Estudiante", desempleado: "Desempleado",
    ama_casa: "Cuidado hogar", pyme: "PyME"
  },
  zona: {
    caba: "CABA", gba_norte: "GBA Norte", gba_sur: "GBA Sur", gba_oeste: "GBA Oeste",
    laplata: "La Plata", cba_cap: "Córdoba cap.", cba_int: "Córdoba int.",
    rosario: "Rosario", santafe_int: "Santa Fe int.",
    mendoza: "Mendoza", tucuman: "Tucumán",
    nea: "NEA", noa: "NOA", cuyo: "Cuyo", patagonia: "Patagonia", pueblo: "Pueblo chico"
  },
  vivienda: {
    alquila: "Alquila", propio: "Propia", propio_credito: "Propia c/crédito",
    familiar: "Con familia", alquila_renta: "Alquila + renta", ocupada: "Informal"
  },
  ingreso: {
    "hasta_700k": "≤$700k", "700k_1.5m": "$700k–1,5M",
    "1.5m_3m": "$1,5M–3M", "3m_6m": "$3M–6M",
    "6m_15m": "$6M–15M", "mas_15m": "+$15M"
  },
  pareja: {
    si_ambos_trab: "Pareja, ambos trabajan", si_uno_trab: "Pareja, uno trabaja",
    si_ninguno: "Pareja, ninguno trabaja", no: "Sin pareja"
  },
  hijos: { "0": "Sin hijos", "1": "1 hijo", "2": "2 hijos", "3mas": "3+ hijos" },
  adultos: { "0": "", "1": "1 adulto a cargo", "2mas": "2+ adultos a cargo" },
  extra: {
    no: "Sin extras", plataforma: "Plataforma (Uber/Rappi)",
    segundo: "Segundo empleo", changas: "Changas", renta: "Renta"
  },
  transporte: {
    "2colectivos": "2 colectivos/día", combinacion: "Colectivo+tren/subte",
    tren: "Solo tren", auto: "Auto", moto: "Moto",
    cerca: "A pie/bici", mixto: "Mixto", solo_finde: "Solo finde"
  },
  salud: {
    hosp_pub: "Hospital público", os_sindical: "Obra social", pami: "PAMI",
    prepaga: "Prepaga bolsillo", prepaga_aporte: "Prepaga c/aporte OS", mixta: "Mixta"
  },
  discapacidad: {
    no: "Sin discapacidad", propia_cud: "Propia c/CUD", propia_sin_cud: "Propia s/CUD",
    familiar_cud: "Familiar c/CUD", familiar_sin_cud: "Familiar s/CUD"
  },
  asistencia: {
    auh: "AUH", embarazo: "Embarazo", alimentar: "Alimentar", progresar: "Progresar",
    potenciar: "Potenciar", pnc_vejez: "PNC vejez", pnc_discap: "PNC discap.",
    pnc_madre: "Madre 7 hijos", sub_pami: "Sub. PAMI", tarifa_sube: "Tarifa SUBE",
    sef: "SEF energético", procrear: "Plan vivienda", ninguno: "Sin asistencia"
  }
};

// Estilo visual de cada medio (inicial + color). El schema de `medios` no
// guarda color/inicial, así que es presentación pura y vive acá.
const MEDIO_STYLE = {
  clarin:    { inicial: "CL",  color: "#c0392b" },
  lanacion:  { inicial: "LN",  color: "#1f4e79" },
  infobae:   { inicial: "IN",  color: "#7b2fbe" },
  pagina12:  { inicial: "P12", color: "#119da4" },
  eldestape: { inicial: "ED",  color: "#e0701b" },
  c5n:       { inicial: "C5",  color: "#444b59" }
};
function medioStyle(id) {
  return MEDIO_STYLE[id] || { inicial: (id || "?").slice(0, 2).toUpperCase(), color: "#8a8f9b" };
}

// Estados de observación constitucional → frase neutra + clase de color.
// (Traducción sobria de los enums, como pidió el brief.)
const CONST_ESTADO = {
  en_tramite:                     { label: "Amparo en trámite",                              cls: "c-amber" },
  cautelar_vigente:               { label: "Cautelar vigente",                               cls: "c-orange" },
  fallo_camara_inconstitucional:  { label: "Cámara federal lo declaró inconstitucional",     cls: "c-red-soft" },
  fallo_csjn_inconstitucional:    { label: "CSJN lo declaró inconstitucional",               cls: "c-red" },
  convalidada_csjn:               { label: "Convalidada por CSJN",                           cls: "c-green" },
  convalidada_congreso:           { label: "Veto rechazado por Congreso (norma vigente)",    cls: "c-green" }
};

// ============== v0.7 — FILTROS (config) ==============
// 14 áreas de la DB (valor crudo → etiqueta sobria).
const AREA_LABELS = {
  vivienda: "Vivienda", transporte: "Transporte", fiscal: "Fiscal", energia: "Energía",
  previsional: "Previsional", laboral: "Laboral", salud: "Salud", educacion: "Educación",
  comercio_exterior: "Comercio exterior", plataformas: "Plataformas",
  privatizaciones: "Privatizaciones", comunicaciones: "Comunicaciones",
  agroindustria: "Agroindustria", otros: "Otros"
};
const AREA_KEYS = Object.keys(AREA_LABELS);

// Estado: cada botón mapea a uno o más valores crudos de la columna `estado`.
const ESTADO_FILTERS = [
  { key: "vigente",     label: "Vigente",                  estados: ["vigente"] },
  { key: "suspendida",  label: "Suspendida judicialmente", estados: ["suspendida_judicialmente"] },
  { key: "derogada",    label: "Derogada",                 estados: ["derogada_parcial", "derogada_total"] },
  { key: "vetada",      label: "Vetada",                   estados: ["vetada"] },
  { key: "convalidada", label: "Convalidada",              estados: ["convalidada_congreso"] }
];

// Popularidad mediática: los datos reales topean en 4/6 (ninguna medida llega
// a 5-6), así que los buckets se ajustan a la distribución real.
const POP_FILTERS = [
  { key: "trending", label: "Trending (3+)",     vals: [3, 4, 5, 6] },
  { key: "media",    label: "Media (2)",         vals: [2] },
  { key: "baja",     label: "Baja (1)",          vals: [1] },
  { key: "sin",      label: "Sin cobertura (0)", vals: [0] }
];

// Fecha: single-select. Los relativos se calculan en runtime (no se hardcodean).
const FECHA_FILTERS = [
  { key: "todas",   label: "Todas" },
  { key: "mes",     label: "Último mes",       months: 1 },
  { key: "3meses",  label: "Últimos 3 meses",  months: 3 },
  { key: "anio",    label: "Último año",       months: 12 },
  { key: "2024",    label: "2024", desde: "2024-01-01", hasta: "2025-01-01" },
  { key: "2025",    label: "2025", desde: "2025-01-01", hasta: "2026-01-01" },
  { key: "2026",    label: "2026", desde: "2026-01-01", hasta: "2027-01-01" }
];

function isoMonthsAgo(months) {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}

// Estado crudo → pill (clase de color + etiqueta) para la pantalla de impacto.
function estadoPill(estado) {
  const map = {
    vigente:                  { c: "e-vigente",     l: "Vigente" },
    suspendida_judicialmente: { c: "e-suspendida",  l: "Suspendida judicialmente" },
    derogada_parcial:         { c: "e-derogada",    l: "Derogada (parcial)" },
    derogada_total:           { c: "e-derogada",    l: "Derogada" },
    vetada:                   { c: "e-vetada",      l: "Vetada" },
    convalidada_congreso:     { c: "e-convalidada", l: "Convalidada por el Congreso" }
  };
  return map[estado] || { c: "e-vigente", l: estado || "—" };
}

// ============== STATE ==============
const state = {
  perfil: { asistencia: [] },
  measure: null,
  histArea: null, histAnio: null,
  // v0.7: filtros de la pantalla de medidas + paginación
  filtersOpen: false,
  filters: { areas: AREA_KEYS.slice(), estadoKeys: [], popKeys: [], fecha: "todas", busqueda: "" },
  list: { items: [], total: 0, loading: false },
  listLoaded: false,
  searchTimer: null
};

function getMeasures() { return window.MEASURES || []; }

function show(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-' + screenId);
  if (el) el.classList.add('active');
  if (screenId === 'measures') { renderHome(); updateMiniBar(); }
  if (screenId === 'profile') updateProfileSummary();
  if (screenId === 'impact') { updateProfileSummary(); }
  if (screenId === 'compare') renderCompare();
  if (screenId === 'sectores') renderSectores();
  if (screenId === 'historial') renderHistorial();
  if (screenId === 'balance') { updateProfileSummary(); renderBalance(); }
  window.scrollTo(0, 0);
}
window.show = show;

// ============== CHIPS ==============
function wireChips() {
  document.querySelectorAll('.chips').forEach(group => {
    const field = group.dataset.field;
    const multi = group.dataset.multi === 'true';
    group.querySelectorAll('.chip').forEach(btn => {
      btn.addEventListener('click', () => {
        if (multi) {
          const v = btn.dataset.v;
          if (!state.perfil[field]) state.perfil[field] = [];
          if (v === "ninguno") {
            state.perfil[field] = ["ninguno"];
            group.querySelectorAll('.chip').forEach(o => o.classList.remove('sel-multi','sel'));
            btn.classList.add('sel-multi');
          } else {
            state.perfil[field] = state.perfil[field].filter(x => x !== "ninguno");
            group.querySelector('[data-v="ninguno"]')?.classList.remove('sel-multi','sel');
            if (state.perfil[field].includes(v)) {
              state.perfil[field] = state.perfil[field].filter(x => x !== v);
              btn.classList.remove('sel-multi');
            } else {
              state.perfil[field].push(v);
              btn.classList.add('sel-multi');
            }
          }
        } else {
          group.querySelectorAll('.chip').forEach(o => o.classList.remove('sel'));
          btn.classList.add('sel');
          state.perfil[field] = btn.dataset.v;
        }
        checkProfileComplete();
      });
    });
  });
}

function checkProfileComplete() {
  const required = ['ocupacion', 'zona', 'vivienda', 'ingreso', 'transporte'];
  const complete = required.every(f => state.perfil[f]);
  const go = document.getElementById('btnGoMeasures');
  const skip = document.getElementById('btnSkip');
  if (go) go.disabled = !complete;
  if (skip) skip.style.display = complete ? 'none' : 'block';
}

function updateProfileSummary() {
  const p = state.perfil;
  const parts = [];
  if (p.ocupacion) parts.push(FIELD_LABELS.ocupacion[p.ocupacion]);
  if (p.zona) parts.push(FIELD_LABELS.zona[p.zona]);
  if (p.ingreso) parts.push(FIELD_LABELS.ingreso[p.ingreso]);
  if (p.vivienda) parts.push(FIELD_LABELS.vivienda[p.vivienda]);
  if (p.hijos && p.hijos !== "0") parts.push(FIELD_LABELS.hijos[p.hijos]);
  if (p.adultos && p.adultos !== "0") parts.push(FIELD_LABELS.adultos[p.adultos]);
  if (p.extra && p.extra !== "no") parts.push(FIELD_LABELS.extra[p.extra]);
  if (p.discapacidad && p.discapacidad !== "no") parts.push(FIELD_LABELS.discapacidad[p.discapacidad]);
  if (Array.isArray(p.asistencia) && p.asistencia.length && !p.asistencia.includes("ninguno")) {
    parts.push(p.asistencia.map(a => FIELD_LABELS.asistencia[a]).join(" + "));
  }
  const summary = parts.join(' · ') || '—';
  let claseChip = '';
  if (p.ingreso && typeof window.calcularClaseSocial === 'function') {
    const clase = window.calcularClaseSocial(p.ingreso);
    if (clase) claseChip = ` <span class="clase-chip" title="Derivada del ingreso del hogar (CBT INDEC) · ${clase.aam} · ${clase.quintil}">${clase.label}</span>`;
  }
  const html = `<strong>TU PERFIL</strong>${summary}${claseChip}`;
  ['perfilSummary', 'perfilSummary2', 'perfilSummary3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  });
}
window.updateProfileSummary = updateProfileSummary;

// ============== HOME / TRENDING (vista A) ==============
function renderHome() {
  updateProfileSummary();
  const measures = getMeasures();

  // --- Trending: "Lo que están discutiendo todos" ---
  // Brief pedía cobertura ≥ 5/6, pero los datos reales topean en 4/6 (ninguna
  // medida llega a 5). Umbral ajustado a ≥ 3/6 = la franja más cubierta.
  const trendingEl = document.getElementById('trendingSection');
  if (trendingEl) {
    const trending = measures
      .filter(m => (m.popularidad || 0) >= 3)
      .sort((a, b) => ((b.popularidad || 0) - (a.popularidad || 0)) || String(b.date).localeCompare(String(a.date)))
      .slice(0, 10);
    if (!trending.length) {
      trendingEl.innerHTML = '';
    } else {
      let cards = trending.map(m => {
        const n = m.popularidad || (m.cobertura?.length || 0), tot = m.coberturaTotal || 6;
        const medios = (m.cobertura || []).map(c => {
          const st = medioStyle(c.medioId);
          return `<span class="medio-badge" style="background:${st.color}" title="${c.nombre}${c.titular ? ' — ' + c.titular : ''}">${st.inicial}</span>`;
        }).join('');
        const tagsHtml = (m.tags || []).slice(0, 3).map(t => `<span class="measure-tag">${t}</span>`).join('');
        return `<div class="card measure trending-card" data-id="${m.id}">
          <div class="trending-top">
            <span class="cobertura-badge">${n}/${tot}</span>
            <div class="medio-badges">${medios}</div>
          </div>
          <h3>${m.title}</h3>
          <div class="measure-tags">${tagsHtml}</div>
        </div>`;
      }).join('');
      trendingEl.innerHTML = `
        <div class="trending-head">
          <h2 class="step" style="margin:0;">Lo que están discutiendo todos</h2>
          <p class="step-sub" style="margin:4px 0 14px;">Las medidas más cubiertas por los 6 medios que seguimos. El badge muestra cuántos medios la cubrieron.</p>
        </div>
        ${cards}`;
      trendingEl.querySelectorAll('.trending-card').forEach(card => {
        card.onclick = () => openMeasure(card.dataset.id);
      });
    }
  }

  renderFilters();
  // Si ya cargamos una página antes (p. ej. el usuario volvió de una medida),
  // re-renderizamos lo que había para preservar cuántas tarjetas se veían.
  if (!state.listLoaded) loadFirstPage();
  else { renderResultCount(); renderMeasureCards(); updateLoadMore(); }
  updateMiniBar();
}

function openMeasure(id) {
  const m = getMeasures().find(x => x.id === id);
  if (!m) return;
  state.measure = m;
  renderImpact();
  show('impact');
}

// ============== v0.7 — FILTROS COLAPSABLES ==============
function activeFilterCount() {
  const f = state.filters;
  let n = 0;
  if (f.areas.length < AREA_KEYS.length) n++;
  n += f.estadoKeys.length;
  n += f.popKeys.length;
  if (f.fecha !== "todas") n++;
  if (f.busqueda.trim()) n++;
  return n;
}

function toggleFilters() {
  state.filtersOpen = !state.filtersOpen;
  renderFilters();
}
window.toggleFilters = toggleFilters;

function clearFilters() {
  state.filters = { areas: AREA_KEYS.slice(), estadoKeys: [], popKeys: [], fecha: "todas", busqueda: "" };
  renderFilters();
  loadFirstPage();
}
window.clearFilters = clearFilters;

function renderFilters() {
  const el = document.getElementById('measureFilters');
  const toggle = document.getElementById('filterToggle');
  const countEl = document.getElementById('filterCount');
  const clearEl = document.getElementById('filterClear');
  if (!el) return;
  const f = state.filters;
  const n = activeFilterCount();

  if (toggle) toggle.classList.toggle('open', state.filtersOpen);
  if (countEl) { countEl.textContent = n; countEl.classList.toggle('on', n > 0); }
  if (clearEl) clearEl.style.display = n > 0 ? '' : 'none';

  el.hidden = !state.filtersOpen;
  if (!state.filtersOpen) return;

  const areaChips = AREA_KEYS.map(k =>
    `<button class="fchip ${f.areas.includes(k) ? 'sel' : ''}" data-kind="area" data-v="${k}">${AREA_LABELS[k]}</button>`).join('');
  const fechaChips = FECHA_FILTERS.map(x =>
    `<button class="fchip ${f.fecha === x.key ? 'sel' : ''}" data-kind="fecha" data-v="${x.key}">${x.label}</button>`).join('');
  const estadoChips = ESTADO_FILTERS.map(x =>
    `<button class="fchip ${f.estadoKeys.includes(x.key) ? 'sel' : ''}" data-kind="estado" data-v="${x.key}">${x.label}</button>`).join('');
  const popChips = POP_FILTERS.map(x =>
    `<button class="fchip ${f.popKeys.includes(x.key) ? 'sel' : ''}" data-kind="pop" data-v="${x.key}">${x.label}</button>`).join('');

  el.innerHTML = `
    <div class="filter-row"><span class="filter-lbl">Área</span><div class="fchips">
      <button class="fchip ${f.areas.length === AREA_KEYS.length ? 'sel' : ''}" data-kind="area-all" data-v="">Todas</button>${areaChips}</div></div>
    <div class="filter-row"><span class="filter-lbl">Fecha</span><div class="fchips">${fechaChips}</div></div>
    <div class="filter-row"><span class="filter-lbl">Estado</span><div class="fchips">${estadoChips}</div></div>
    <div class="filter-row"><span class="filter-lbl">Medios</span><div class="fchips">${popChips}</div></div>
    <div class="filter-row"><span class="filter-lbl">Buscar</span>
      <input class="filter-search" id="filterSearch" type="text" placeholder="Título o descripción…" value="${escapeAttr(f.busqueda)}"></div>`;

  el.querySelectorAll('.fchip').forEach(b => {
    b.onclick = () => {
      const v = b.dataset.v, kind = b.dataset.kind;
      if (kind === 'area-all') {
        f.areas = AREA_KEYS.slice();
      } else if (kind === 'area') {
        // Desde el estado por defecto (todas activas), el primer click filtra
        // SOLO a esa área. Después se comporta como multi-select (toggle).
        if (f.areas.length === AREA_KEYS.length) f.areas = [v];
        else f.areas = f.areas.includes(v) ? f.areas.filter(x => x !== v) : [...f.areas, v];
      } else if (kind === 'fecha') {
        f.fecha = v; // single-select
      } else if (kind === 'estado') {
        f.estadoKeys = f.estadoKeys.includes(v) ? f.estadoKeys.filter(x => x !== v) : [...f.estadoKeys, v];
      } else if (kind === 'pop') {
        f.popKeys = f.popKeys.includes(v) ? f.popKeys.filter(x => x !== v) : [...f.popKeys, v];
      }
      renderFilters();
      loadFirstPage();
    };
  });

  const search = document.getElementById('filterSearch');
  if (search) {
    search.oninput = () => {
      f.busqueda = search.value;
      if (state.searchTimer) clearTimeout(state.searchTimer);
      state.searchTimer = setTimeout(() => {
        const cnt = document.getElementById('filterCount');
        if (cnt) { const n2 = activeFilterCount(); cnt.textContent = n2; cnt.classList.toggle('on', n2 > 0); }
        const cl = document.getElementById('filterClear');
        if (cl) cl.style.display = activeFilterCount() > 0 ? '' : 'none';
        loadFirstPage();
      }, 300);
    };
  }
}

function escapeAttr(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

// Traduce el estado de los filtros al payload que espera queryMeasures().
function buildFilterPayload(offset, limit) {
  const f = state.filters;
  const payload = { offset: offset || 0, limit: limit != null ? limit : 15 };
  if (f.areas.length === 0) payload.areas = ['__nomatch__'];           // nada seleccionado → 0 resultados
  else if (f.areas.length < AREA_KEYS.length) payload.areas = f.areas.slice();
  const est = f.estadoKeys.flatMap(k => (ESTADO_FILTERS.find(e => e.key === k) || {}).estados || []);
  if (est.length) payload.estados = est;
  const pop = f.popKeys.flatMap(k => (POP_FILTERS.find(p => p.key === k) || {}).vals || []);
  if (pop.length) payload.popularidades = pop;
  const fr = FECHA_FILTERS.find(x => x.key === f.fecha);
  if (fr) {
    if (fr.months) payload.fechaDesde = isoMonthsAgo(fr.months);
    if (fr.desde) payload.fechaDesde = fr.desde;
    if (fr.hasta) payload.fechaHasta = fr.hasta;
  }
  if (f.busqueda.trim()) payload.busqueda = f.busqueda.trim();
  return payload;
}

// ============== v0.7 — LISTADO PAGINADO ==============
async function loadFirstPage() {
  state.list = { items: [], total: 0, loading: true };
  state.listLoaded = true;
  renderResultCount();
  renderMeasureCards();
  const res = await window.queryMeasures(buildFilterPayload(0, 15));
  state.list = { items: res.medidas || [], total: res.total || 0, loading: false };
  renderResultCount();
  renderMeasureCards();
  updateLoadMore();
}

async function loadMoreMeasures() {
  if (state.list.loading) return;
  const offset = state.list.items.length;
  state.list.loading = true;
  updateLoadMore();
  const res = await window.queryMeasures(buildFilterPayload(offset, 15));
  state.list.items = state.list.items.concat(res.medidas || []);
  if (res.total) state.list.total = res.total;
  state.list.loading = false;
  renderResultCount();
  renderMeasureCards();
  updateLoadMore();
}
window.loadMoreMeasures = loadMoreMeasures;

function renderResultCount() {
  const el = document.getElementById('resultCount');
  if (!el) return;
  if (state.list.loading && !state.list.items.length) { el.textContent = ''; return; }
  el.innerHTML = `Mostrando <strong>${state.list.items.length}</strong> de <strong>${state.list.total}</strong> medidas`;
}

function updateLoadMore() {
  const btn = document.getElementById('btnLoadMore');
  if (!btn) return;
  const more = state.list.items.length < state.list.total;
  btn.style.display = more ? '' : 'none';
  btn.textContent = state.list.loading ? 'Cargando…' : 'Mostrar 15 más';
  btn.disabled = !!state.list.loading;
}

function renderMeasureCards() {
  const list = document.getElementById('measureList');
  if (!list) return;
  if (state.list.loading && !state.list.items.length) {
    list.innerHTML = '<div class="list-loading">Cargando medidas…</div>';
    return;
  }
  if (!state.list.items.length) {
    list.innerHTML = '<div style="font-size:13px;color:var(--ink-mute);padding:14px 0;">No hay medidas con esos filtros.</div>';
    return;
  }
  list.innerHTML = '';
  state.list.items.forEach(m => {
    const card = document.createElement('div');
    card.className = 'card measure';
    const tagsHtml = (m.tags || []).slice(0, 4).map(t => `<span class="measure-tag">${t}</span>`).join('');
    const pop = (m.popularidad || 0);
    const cobBadge = pop >= 2 ? `<span class="cobertura-badge sm" title="Cobertura mediática">${pop}/${m.coberturaTotal || 6}</span>` : '';
    const obsIcon = (m.observaciones?.length) ? '<span class="const-icon" title="Tiene observaciones constitucionales">⚖️</span>' : '';
    card.innerHTML = `
      <div class="measure-head"><h3>${m.title}</h3><div class="measure-flags">${cobBadge}${obsIcon}</div></div>
      <div class="meta">${m.meta}</div>
      <div class="desc">${m.desc}</div>
      <div class="measure-tags">${tagsHtml}</div>
    `;
    card.onclick = () => openMeasure(m.id);
    list.appendChild(card);
  });
}

// ============== IMPACT (descripción + cobertura + constitución SIEMPRE) ==============
function renderImpact() {
  const m = state.measure;
  if (!m) return;
  document.getElementById('measureTitle').textContent = m.title;
  // La fecha (BORA) al frente; pero varias `meta` del base ya la incluyen → evitamos duplicarla.
  const fd = formatDate(m.date);
  document.getElementById('measureMeta').textContent =
    (m.meta && fd && m.meta.includes(fd)) ? m.meta : [fd, m.meta].filter(Boolean).join(' · ');

  // Área + estado (chips).
  const chips = document.getElementById('measureAreaChips');
  if (chips) {
    const ep = estadoPill(m.estado);
    chips.innerHTML = `${m.area ? `<span class="area-chip">${m.area}</span>` : ''}<span class="estado-pill ${ep.c}">${ep.l}</span>`;
  }

  // Descripción de la norma (siempre, si la hay).
  const descEl = document.getElementById('measureDesc');
  if (descEl) {
    if (m.desc) { descEl.innerHTML = m.desc; descEl.style.display = ''; }
    else descEl.style.display = 'none';
  }

  renderCobertura(m);
  renderConstitucion(m);

  // Fuente.
  let fuenteHtml = '';
  if (m.fuente) fuenteHtml = '<strong>FUENTE:</strong> ' + m.fuente;
  if (m.fuenteUrl) fuenteHtml += `${fuenteHtml ? '<br>' : ''}<a href="${m.fuenteUrl}" target="_blank" rel="noopener">Ver en el Boletín Oficial ↗</a>`;
  document.getElementById('sourceBox').innerHTML = fuenteHtml || '';

  // Análisis personalizado: solo si hay reglas cargadas. Si no, cartel honesto.
  const analysis = document.getElementById('impactAnalysis');
  const notice = document.getElementById('impactNotice');
  const dimList = document.getElementById('dimList');

  if (!m.hasRules) {
    if (analysis) analysis.style.display = 'none';
    if (notice) notice.innerHTML = `<div class="impact-notice">Esta medida aún no tiene análisis personalizado por perfil. Mientras vamos cargando las reglas, te dejamos arriba la información objetiva: descripción de la norma, cobertura mediática y procesos judiciales si los hay.</div>`;
  } else {
    if (notice) notice.innerHTML = '';
    if (analysis) analysis.style.display = '';
    dimList.innerHTML = '';
    const dims = m.impact(state.perfil);
    if (!dims.length) {
      dimList.innerHTML = '<div style="font-size:13px;color:var(--ink-mute);padding:10px 0;">Con este perfil no detectamos impacto directo de esta medida.</div>';
    } else {
      dims.forEach(d => {
        const card = document.createElement('div');
        card.className = 'dim-card hit-' + d.level;
        const tagText = { strong: "Fuerte", mid: "Medio", soft: "Leve", pos: "Positivo", none: "No aplica" }[d.level];
        card.innerHTML = `
          <div class="dim-head">
            <div class="dim-name"><span class="dim-icon">${d.icon || "•"}</span>${d.name}</div>
            <div class="dim-tag tag-${d.level}">${tagText}</div>
          </div>
          <div class="dim-body">${d.body}</div>
        `;
        dimList.appendChild(card);
      });
    }
  }
}

// 🗞 Cobertura mediática — siempre visible (badge X/6 + medios; mensaje si 0).
function renderCobertura(m) {
  const box = document.getElementById('coberturaBox');
  if (!box) return;
  const tot = m.coberturaTotal || 6;
  const n = (m.popularidad != null) ? m.popularidad : (m.cobertura?.length || 0);
  let inner;
  if (!m.hasDb) {
    inner = `<div class="cob-card cob-empty">La cobertura mediática se carga con conexión. Volvé a abrir la app con internet para ver qué medios la cubrieron.</div>`;
  } else if (!n) {
    inner = `<div class="cob-card cob-empty">Ningún medio del panel cubrió esta medida en portada.</div>`;
  } else {
    const badges = (m.cobertura || []).map(c => {
      const st = medioStyle(c.medioId);
      return `<span class="medio-badge" style="background:${st.color}" title="${c.nombre}${c.titular ? ' — ' + c.titular : ''}">${st.inicial}</span>`;
    }).join('');
    inner = `<div class="cob-card"><div class="cob-top"><span class="cobertura-badge">${n}/${tot}</span><div class="medio-badges">${badges}</div></div></div>`;
  }
  box.innerHTML = `<div class="cob-section">
    <div class="cob-title">🗞 Cobertura mediática</div>
    ${inner}
    <div class="cob-foot">Cobertura en portada de los 6 medios que seguimos: Clarín, La Nación, Infobae, Página 12, El Destape, C5N.</div>
  </div>`;
}

function renderConstitucion(m) {
  const box = document.getElementById('constitucionBox');
  if (!box) return;
  const obs = m.observaciones || [];

  let inner;
  if (!m.hasDb) {
    inner = `<div class="const-card const-empty">El apartado constitucional se carga con conexión. Volvé a abrir la app con internet para ver los procesos judiciales de esta medida.</div>`;
  } else if (!obs.length) {
    inner = `<div class="const-card const-empty">Sin observaciones constitucionales conocidas a esta fecha.</div>`;
  } else {
    inner = obs.map((o, i) => {
      const est = CONST_ESTADO[o.estado] || { label: o.estado, cls: 'c-amber' };
      const artNum = o.articuloNumero || '';
      const artName = o.articuloNombre ? ` — ${o.articuloNombre}` : '';
      const meta = [];
      if (o.falloReferencia) meta.push(o.falloReferencia);
      if (o.fechaFallo) meta.push(formatDate(o.fechaFallo));
      const metaLine = meta.length ? `<div class="const-meta">${meta.join(' · ')}</div>` : '';
      const link = o.fuenteUrl ? `<a class="const-link" href="${o.fuenteUrl}" target="_blank" rel="noopener">Ver fuente ↗</a>` : '';
      const artResumen = o.articuloResumen
        ? `<div class="const-art-resumen" id="art-res-${i}" hidden>${o.articuloResumen}</div>` : '';
      return `<div class="const-card">
        <button class="const-art" data-target="art-res-${i}">
          <span class="const-art-num">Art. ${artNum}</span><span class="const-art-name">${artName}</span>
          ${o.articuloResumen ? '<span class="const-art-toggle">ⓘ</span>' : ''}
        </button>
        ${artResumen}
        <div class="const-estado ${est.cls}">${est.label}</div>
        ${metaLine}
        ${o.resumen ? `<div class="const-resumen">${o.resumen}</div>` : ''}
        ${link}
      </div>`;
    }).join('');
  }

  box.innerHTML = `
    <div class="const-section">
      <div class="const-title">⚖️ Constitución</div>
      ${inner}
      <div class="const-foot">Solo se incluyen procesos judiciales reales (amparos, cautelares, fallos). No incluimos opinión doctrinaria.</div>
    </div>`;

  box.querySelectorAll('.const-art').forEach(btn => {
    btn.onclick = () => {
      const t = document.getElementById(btn.dataset.target);
      if (t) t.hidden = !t.hidden;
    };
  });
}

// ============== COMPARE ==============
function renderCompare() {
  const m = state.measure;
  if (!m) return;
  document.getElementById('compareTitle').textContent = `Cómo le pega "${m.title}" al resto`;
  const list = document.getElementById('compareList');
  list.innerHTML = '';
  (m.compareProfiles || []).forEach(p => {
    const row = document.createElement('div');
    row.className = 'compare-row';
    let badges = '';
    Object.keys(p.badges).forEach(k => {
      const lvl = p.badges[k];
      const initials = k.substring(0, 3);
      badges += `<span class="badge ${lvl}" title="${k}: ${lvl}">${initials.toUpperCase()}</span>`;
    });
    row.innerHTML = `
      <div class="name">${p.name}<small>${p.sub}</small></div>
      <div class="badge-row">${badges}</div>
    `;
    list.appendChild(row);
  });
  if (!list.innerHTML) list.innerHTML = '<div style="font-size:13px;color:var(--ink-mute);">Sin comparación disponible para esta medida.</div>';
}

// ============== BALANCE FEATURE ==============
const LEVEL_WEIGHT = { pos: 1, none: 0, soft: -1, mid: -2, strong: -3 };

function scoreMeasure(m) {
  if (!state.perfil.ocupacion) return { score: 0, dims: [], bucket: 'neutral' };
  let dims;
  try { dims = m.impact(state.perfil); } catch (e) { dims = []; }
  let score = 0;
  dims.forEach(d => { score += (LEVEL_WEIGHT[d.level] || 0); });
  let bucket = 'neutral';
  if (score > 0) bucket = 'pos';
  else if (score <= -6) bucket = 'neg';
  else if (score <= -3) bucket = 'midneg';
  else if (score < 0) bucket = 'softneg';
  return { score, dims, bucket };
}

function bucketLabel(b) {
  return { neg: "EN CONTRA", midneg: "MEDIO", softneg: "LEVE", neutral: "NEUTRA", pos: "A FAVOR" }[b] || "";
}

function formatDate(iso) {
  if (!iso) return '';
  const [y, mm, d] = String(iso).split('-');
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${parseInt(d)}-${meses[parseInt(mm) - 1]}-${y}`;
}

function aggregateDims(scored) {
  const tally = {};
  scored.forEach(s => {
    s.dims.forEach(d => {
      if (!tally[d.name]) tally[d.name] = { icon: d.icon || "•", pos: 0, neg: 0, items: 0 };
      tally[d.name].items += 1;
      if (d.level === "pos") tally[d.name].pos += 1;
      else if (d.level !== "none") tally[d.name].neg += 1;
    });
  });
  return tally;
}

function renderBalance() {
  if (!state.perfil.ocupacion) return;
  const scored = getMeasures().map(m => ({ m, ...scoreMeasure(m) }));

  let contra = 0, neutral = 0, favor = 0;
  let byBucket = { neg: 0, midneg: 0, softneg: 0, neutral: 0, pos: 0 };
  scored.forEach(s => {
    byBucket[s.bucket]++;
    if (s.bucket === 'pos') favor++;
    else if (s.bucket === 'neutral') neutral++;
    else contra++;
  });

  document.getElementById('balContra').textContent = contra;
  document.getElementById('balNeutral').textContent = neutral;
  document.getElementById('balFavor').textContent = favor;

  const stacked = document.getElementById('stackedBar');
  stacked.innerHTML = '';
  const seq = [
    { cls: 'bar-contra', n: byBucket.neg },
    { cls: 'bar-mid', n: byBucket.midneg },
    { cls: 'bar-soft', n: byBucket.softneg },
    { cls: 'bar-neutral', n: byBucket.neutral },
    { cls: 'bar-favor', n: byBucket.pos }
  ];
  seq.forEach(s => {
    if (s.n > 0) {
      const span = document.createElement('span');
      span.className = s.cls;
      span.style.flex = s.n;
      stacked.appendChild(span);
    }
  });

  const total = scored.length;
  let tip;
  if (contra > favor * 2) tip = `<strong>Mayoría de medidas con impacto negativo en tu perfil:</strong> ${contra} de ${total}. ${favor} con impacto positivo, ${neutral} no te tocan.`;
  else if (favor > contra) tip = `<strong>Mayoría de medidas con impacto positivo en tu perfil:</strong> ${favor} de ${total}. ${contra} con impacto negativo, ${neutral} no te tocan.`;
  else if (contra === favor) tip = `<strong>Balance parejo en tu perfil:</strong> ${favor} con impacto positivo, ${contra} con impacto negativo, ${neutral} no te tocan.`;
  else tip = `<strong>${contra} medidas con impacto negativo, ${favor} con impacto positivo</strong> en tu perfil. La mayoría con magnitud leve a media.`;
  document.getElementById('balTip').innerHTML = tip;

  const tally = aggregateDims(scored);
  const dimEntries = Object.entries(tally).sort((a, b) => (b[1].neg + b[1].pos) - (a[1].neg + a[1].pos));
  const tallyEl = document.getElementById('dimTally');
  tallyEl.innerHTML = '';
  if (!dimEntries.length) {
    tallyEl.innerHTML = '<div style="font-size:13px;color:var(--ink-mute);">Sin impacto detectado en este perfil.</div>';
  } else {
    const maxHits = Math.max(...dimEntries.map(([_, d]) => d.neg + d.pos));
    dimEntries.forEach(([name, d]) => {
      const negPct = (d.neg / maxHits * 100);
      const posPct = (d.pos / maxHits * 100);
      const row = document.createElement('div');
      row.className = 'dim-tally-row';
      row.innerHTML = `<div class="dim-tally-name"><span>${d.icon}</span>${name}</div><div class="dim-tally-bar"><span class="fill neg" style="width: ${negPct}%"></span><span class="fill pos" style="width: ${posPct}%"></span></div><div class="dim-tally-count">${d.neg ? "-" + d.neg : ""}${d.pos ? " +" + d.pos : ""}</div>`;
      tallyEl.appendChild(row);
    });
  }

  const sorted = scored.slice().sort((a, b) => String(b.m.date).localeCompare(String(a.m.date)));
  const timeline = document.getElementById('timeline');
  timeline.innerHTML = '';
  sorted.forEach(s => {
    const item = document.createElement('div');
    item.className = 'tl-item ' + s.bucket;
    const label = bucketLabel(s.bucket);
    const negDims = s.dims.filter(d => d.level !== 'none' && d.level !== 'pos').map(d => d.name).slice(0, 3);
    const posDims = s.dims.filter(d => d.level === 'pos').map(d => d.name);
    let summary = '';
    if (negDims.length) summary += `Pega en: ${negDims.join(', ')}`;
    if (posDims.length) summary += (summary ? ' · ' : '') + `Beneficia: ${posDims.join(', ')}`;
    if (!summary) summary = 'Sin impacto directo en tu perfil.';
    item.innerHTML = `<div class="tl-date">${formatDate(s.m.date)}</div><div class="tl-title">${s.m.title}</div><span class="tl-pill ${s.bucket}">${label}</span><div class="tl-summary">${summary}</div>`;
    item.onclick = () => { state.measure = s.m; renderImpact(); show('impact'); };
    timeline.appendChild(item);
  });

  buildDonut(contra, neutral, favor);
}

function updateMiniBar() {
  const bar = document.getElementById('miniBar');
  if (!bar) return;
  if (!state.perfil.ocupacion) { bar.innerHTML = ''; return; }
  const scored = getMeasures().map(m => scoreMeasure(m));
  let contra = 0, neutral = 0, favor = 0;
  scored.forEach(s => {
    if (s.bucket === 'pos') favor++;
    else if (s.bucket === 'neutral') neutral++;
    else contra++;
  });
  bar.innerHTML = '';
  [
    { color: 'var(--hit-strong)', n: contra },
    { color: 'rgba(255,255,255,0.35)', n: neutral },
    { color: 'var(--hit-pos)', n: favor }
  ].forEach(seg => {
    if (seg.n > 0) {
      const s = document.createElement('span');
      s.style.background = seg.color;
      s.style.flex = seg.n;
      bar.appendChild(s);
    }
  });
}

// Donut chart builder
function buildDonut(contra, neutral, favor) {
  const total = contra + neutral + favor;
  const svgEl = document.getElementById('donutSvg');
  const legendEl = document.getElementById('donutLegend');
  if (!svgEl || !legendEl) return;
  if (total === 0) {
    svgEl.innerHTML = '<div style="padding:30px;color:var(--ink-mute);font-size:13px;">Sin datos para mostrar</div>';
    legendEl.innerHTML = '';
    return;
  }
  const cx = 110, cy = 110, r = 78, sw = 28;
  function polar(deg) {
    const rad = (deg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }
  let offset = 0;
  const segs = [
    { value: contra, color: '#b91c1c', label: 'En contra', cls: 'contra' },
    { value: neutral, color: '#c4bfb0', label: 'Neutras', cls: 'neutral' },
    { value: favor, color: '#15803d', label: 'A favor', cls: 'favor' }
  ];
  let paths = '';
  segs.forEach(s => {
    if (s.value === 0) return;
    const angle = (s.value / total) * 360;
    const drawAngle = angle >= 359.99 ? 359.99 : angle;
    const start = polar(offset);
    const end = polar(offset + drawAngle);
    const largeArc = drawAngle > 180 ? 1 : 0;
    paths += `<path d="M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}" stroke="${s.color}" stroke-width="${sw}" fill="none" stroke-linecap="butt"/>`;
    offset += angle;
  });
  const svg = `<svg class="donut-svg" viewBox="0 0 220 220" width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    ${paths}
    <text class="donut-center-num" x="110" y="118" text-anchor="middle">${total}</text>
    <text class="donut-center-lbl" x="110" y="138" text-anchor="middle">MEDIDAS</text>
  </svg>`;
  svgEl.innerHTML = svg;

  let legend = '';
  segs.forEach(s => {
    const pct = total ? Math.round((s.value / total) * 100) : 0;
    legend += `<div class="donut-legend-row">
      <div class="donut-legend-dot ${s.cls}"></div>
      <div class="donut-legend-label">${s.label}</div>
      <div class="donut-legend-count">${s.value}<span class="donut-legend-pct">${pct}%</span></div>
    </div>`;
  });
  legendEl.innerHTML = legend;
}

// Inyecta la pantalla de balance (evita un Edit gigante de HTML).
function injectBalanceScreen() {
  const measuresScreen = document.getElementById('screen-measures');
  if (!measuresScreen || document.getElementById('screen-balance')) return;
  const sec = document.createElement('section');
  sec.id = 'screen-balance';
  sec.className = 'screen';
  sec.innerHTML = `
    <div class="crumb" onclick="show('measures')">← Volver a medidas</div>
    <div class="perfil-box" id="perfilSummary3"><strong>TU PERFIL</strong>—</div>
    <h2 class="step">Tu balance histórico</h2>
    <p class="step-sub">Suma del impacto de las medidas vigentes en tu perfil — desde <strong>dic-2023 hasta hoy</strong>. Por dimensión y por línea de tiempo. <em>Misma fórmula para cualquier gobierno.</em></p>
    <div class="donut-wrap">
      <div id="donutSvg"></div>
      <div id="donutLegend" class="donut-legend"></div>
    </div>
    <div class="balance-summary">
      <div class="bal-card contra"><div class="big" id="balContra">—</div><div class="lbl">En contra</div></div>
      <div class="bal-card neutral"><div class="big" id="balNeutral">—</div><div class="lbl">Neutras</div></div>
      <div class="bal-card favor"><div class="big" id="balFavor">—</div><div class="lbl">A favor</div></div>
    </div>
    <div style="font-size: 11px; color: var(--ink-mute); text-transform: uppercase; letter-spacing: 0.7px; margin: 18px 4px 6px; font-weight: 700;">Intensidad de los impactos en contra</div>
    <div class="stacked-bar" id="stackedBar"></div>
    <div class="bal-tip" id="balTip">—</div>
    <div class="bal-section-title">Dónde te pegaron más</div>
    <div class="dim-tally" id="dimTally"></div>
    <div class="bal-section-title">Línea de tiempo</div>
    <div class="timeline" id="timeline"></div>
  `;
  measuresScreen.parentNode.insertBefore(sec, measuresScreen.nextSibling);
}

// ============== SECTORES SOCIALES ==============
function renderSectores() {
  const m = state.measure;
  if (!m) return;
  document.getElementById('sectoresTitle').textContent = `Cómo le pega "${m.title}" a cada clase social`;
  const list = document.getElementById('sectoresList');
  list.innerHTML = '';
  if (!m.hasRules) {
    list.innerHTML = '<div style="font-size:13px;color:var(--ink-mute);padding:10px 0;">Análisis de impacto para esta medida en preparación.</div>';
    return;
  }
  const clases = window.CLASES_SOCIALES || [];
  const perfiles = window.PERFILES_ARQUETIPICOS || {};
  if (!clases.length) {
    list.innerHTML = '<div style="font-size:13px;color:var(--ink-mute);padding:10px 0;">Para esta vista hay que servir la app por HTTP (no abrir el archivo directo): el módulo de clases sociales no carga bajo file://.</div>';
    return;
  }
  clases.forEach(c => {
    const perfil = perfiles[c.id];
    let dims = [];
    try { dims = perfil ? m.impact(perfil) : []; } catch (e) { dims = []; }
    const row = document.createElement('div');
    row.className = 'compare-row';
    let badges = '';
    dims.forEach(d => {
      const initials = d.name.substring(0, 3).toUpperCase();
      badges += `<span class="badge ${d.level}" title="${d.name}: ${d.level}">${initials}</span>`;
    });
    if (!badges) badges = '<span class="badge none" title="Sin impacto directo en este perfil">—</span>';
    row.innerHTML = `<div class="name">${c.label}<small>${c.aam} · ${c.quintil}</small></div><div class="badge-row">${badges}</div>`;
    list.appendChild(row);
  });
}

// ============== HISTORIAL CRONOLÓGICO (vista B) ==============
const POP_DOT = { alta: 'pop-alta', media: 'pop-media', baja: 'pop-baja', nula: 'pop-nula' };

function renderHistorial() {
  const measures = getMeasures();
  const filtEl = document.getElementById('histFilters');
  if (filtEl) {
    const areas = [...new Set(measures.map(m => m.area).filter(Boolean))].sort();
    const anios = [...new Set(measures.map(m => String(m.date).slice(0, 4)).filter(Boolean))].sort().reverse();
    const areaChips = areas.map(a => `<button class="fchip ${state.histArea === a ? 'sel' : ''}" data-kind="area" data-v="${a}">${a}</button>`).join('');
    const anioChips = anios.map(y => `<button class="fchip ${state.histAnio === y ? 'sel' : ''}" data-kind="anio" data-v="${y}">${y}</button>`).join('');
    filtEl.innerHTML = `
      <div class="filter-row"><span class="filter-lbl">Área</span><div class="fchips">
        <button class="fchip ${!state.histArea ? 'sel' : ''}" data-kind="area" data-v="">Todas</button>${areaChips}</div></div>
      <div class="filter-row"><span class="filter-lbl">Año</span><div class="fchips">
        <button class="fchip ${!state.histAnio ? 'sel' : ''}" data-kind="anio" data-v="">Todos</button>${anioChips}</div></div>`;
    filtEl.querySelectorAll('.fchip').forEach(b => {
      b.onclick = () => {
        const v = b.dataset.v || null;
        if (b.dataset.kind === 'area') state.histArea = v; else state.histAnio = v;
        renderHistorial();
      };
    });
  }

  let items = measures.slice();
  if (state.histArea) items = items.filter(m => m.area === state.histArea);
  if (state.histAnio) items = items.filter(m => String(m.date).slice(0, 4) === state.histAnio);
  items.sort((a, b) => String(b.date).localeCompare(String(a.date))); // más recientes arriba

  const tl = document.getElementById('histTimeline');
  if (!tl) return;
  tl.innerHTML = '';
  if (!items.length) {
    tl.innerHTML = '<div style="font-size:13px;color:var(--ink-mute);padding:14px 0;">No hay medidas con esos filtros.</div>';
    return;
  }
  items.forEach(m => {
    const dotCls = POP_DOT[m.nivelPopularidad] || 'pop-nula';
    const tagsHtml = (m.tags || []).slice(0, 3).map(t => `<span class="tl-tag">${t}</span>`).join('');
    const cob = (m.cobertura?.length || 0);
    const popBadge = `<span class="tl-pop" title="Cobertura mediática">${cob}/${m.coberturaTotal || 6}</span>`;
    const obsIcon = (m.observaciones?.length) ? '<span class="const-icon" title="Tiene observaciones constitucionales">⚖️</span>' : '';
    const item = document.createElement('div');
    item.className = 'tl-item hist ' + dotCls;
    item.innerHTML = `
      <div class="tl-date">${formatDate(m.date)}</div>
      <div class="tl-title">${m.title}</div>
      <div class="tl-chips">${tagsHtml}${popBadge}${obsIcon}</div>`;
    item.onclick = () => openMeasure(m.id);
    tl.appendChild(item);
  });
}

// ============== INIT ==============
// Llamado por el bootstrap de módulos una vez que window.MEASURES está cargado.
function initApp() {
  injectBalanceScreen();
  wireChips();
  checkProfileComplete();
  updateProfileSummary();
  // Si ya estamos parados en la home (raro al inicio), refrescamos.
  if (document.getElementById('screen-measures')?.classList.contains('active')) renderHome();
}
window.initApp = initApp;
