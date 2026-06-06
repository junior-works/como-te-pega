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
// 14 áreas de la DB (valor crudo → etiqueta legible, con tildes/mayúsculas).
const AREA_LABELS = {
  vivienda: "Vivienda", transporte: "Transporte", fiscal: "Fiscal", energia: "Energía",
  previsional: "Previsional", laboral: "Laboral", salud: "Salud", educacion: "Educación",
  comercio_exterior: "Comercio Exterior", plataformas: "Plataformas",
  privatizaciones: "Privatizaciones", comunicaciones: "Comunicaciones",
  agroindustria: "Agroindustria", otros: "Otros"
};
const AREA_KEYS = Object.keys(AREA_LABELS);

// Estado: un chip por valor crudo de la columna `estado`, con etiqueta legible.
// El chip muestra la etiqueta; el filtro usa el valor crudo (la clave). Los
// chips se renderizan según los estados realmente presentes en los datos, en
// este orden. ESTADO_LABELS/ESTADO_CLS son la única fuente de verdad (también
// las usa la pill de la pantalla de impacto).
const ESTADO_LABELS = {
  vigente:                  "Vigente",
  suspendida_judicialmente: "Suspendida por la Justicia",
  derogada_total:           "Derogada",
  derogada_parcial:         "Derogada parcialmente",
  vetada:                   "Vetada",
  convalidada_congreso:     "Convalidada por Congreso",
  convalidada_csjn:         "Convalidada por CSJN"
};
const ESTADO_ORDER = Object.keys(ESTADO_LABELS);
const ESTADO_CLS = {
  vigente: "e-vigente", suspendida_judicialmente: "e-suspendida",
  derogada_total: "e-derogada", derogada_parcial: "e-derogada", vetada: "e-vetada",
  convalidada_congreso: "e-convalidada", convalidada_csjn: "e-convalidada"
};

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
  return { c: ESTADO_CLS[estado] || "e-vigente", l: ESTADO_LABELS[estado] || estado || "—" };
}

// ============== STATE ==============
const state = {
  perfil: { asistencia: [] },
  measure: null,
  histArea: null, histAnio: null,
  // v0.7: filtros de la pantalla de medidas + paginación
  filtersOpen: false,
  filters: { areas: [], estados: [], popKeys: [], fecha: "todas", busqueda: "" },
  list: { items: [], total: 0, loading: false },
  listLoaded: false,
  searchTimer: null,
  autoCloseTimer: null // v0.8: cierre automático del panel de filtros
};

function getMeasures() { return window.MEASURES || []; }

// ============== v0.8 — PERSISTENCIA (localStorage) ==============
// Guardamos en CADA cambio relevante y restauramos al cargar la app. Todo
// envuelto en try/catch porque localStorage puede tirar (modo privado, cuota).
const LS = { perfil: "ctp.perfil", filters: "ctp.filters", lastMeasure: "ctp.lastMeasure" };
const PERFIL_REQUIRED = ["ocupacion", "zona", "vivienda", "ingreso", "transporte"];
const FILTERS_DEFAULT = () => ({ areas: [], estados: [], popKeys: [], fecha: "todas", busqueda: "" });

function lsGet(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }

function persistPerfil() { lsSet(LS.perfil, state.perfil); }
function persistFilters() { lsSet(LS.filters, state.filters); }
function persistLastMeasure(id) { if (id) lsSet(LS.lastMeasure, id); }

function perfilComplete(p) { return !!p && PERFIL_REQUIRED.every(f => p[f]); }

// Ícono de una dimensión: el inline gana; si la regla lo omitió, lo resuelve
// del catálogo window.DIM_ICONS (medidas-base.js) por nombre; "•" como último
// recurso. Así una medida futura puede no repetir el emoji.
function dimIcon(d) { return d.icon || (window.DIM_ICONS || {})[d.name] || "•"; }

// ============== v0.8.3 — SIGLAS DE DIMENSIONES ==============
// Las grillas del comparador/sectores muestran cada dimensión como una sigla
// de 3 letras. Antes se generaba con name.substring(0,3) → colisiones (MOV =
// Movilidad y Movilidad social) y siglas con acento (PAÍ). Este mapa canónico
// fija la sigla por nombre de dimensión (acepta tanto el `name` canónico como
// los alias cortos que usan los compareProfiles, p. ej. "Familia" / "País").
const DIM_SIGLA = {
  "Plata": "PLA", "Vivienda": "VIV", "Tiempo": "TIE", "Salud": "SAL",
  "Carga mental": "CAR", "Estabilidad": "EST", "Trabajo": "TRA",
  "Servicios": "SER", "Calidad de servicios": "CAL",
  "Movilidad": "MOV", "Movilidad social": "MOS",
  "Vida familiar / ocio": "FAM", "Vida familiar": "FAM",
  "Educación": "EDU", "País / Equilibrio institucional": "PAI",
  "Ahorro": "AHO", "Vacaciones": "VAC", "Ocio": "OCI",
  // alias cortos usados como claves de badge en los compareProfiles:
  "Familia": "FAM", "País": "PAI"
};
function dimSigla(name) {
  return DIM_SIGLA[name] || String(name || "?").substring(0, 3).toUpperCase();
}

// Nivel crudo → etiqueta legible. Se usa en los tooltips de los badges para no
// exponer el enum crudo (pos_strong, mid…) al usuario.
const LEVEL_LABEL = {
  strong: "En contra fuerte", mid: "En contra medio", soft: "En contra leve",
  pos_strong: "A favor fuerte", pos: "A favor medio", pos_soft: "A favor leve",
  none: "Neutra"
};

// Glosario para el panel colapsable "Qué significa cada sigla". Orden pensado
// para lectura, no alfabético. Es la fuente única del panel.
const SIGLA_GLOSSARY = [
  { sigla: "PLA", full: "Plata" },
  { sigla: "VIV", full: "Vivienda" },
  { sigla: "TIE", full: "Tiempo" },
  { sigla: "SAL", full: "Salud" },
  { sigla: "FAM", full: "Vida familiar / ocio" },
  { sigla: "CAR", full: "Carga mental" },
  { sigla: "EST", full: "Estabilidad" },
  { sigla: "TRA", full: "Trabajo" },
  { sigla: "MOV", full: "Movilidad (transporte)" },
  { sigla: "SER", full: "Servicios" },
  { sigla: "EDU", full: "Educación" },
  { sigla: "MOS", full: "Movilidad social" },
  { sigla: "CAL", full: "Calidad de servicios" },
  { sigla: "PAI", full: "País / Equilibrio institucional" },
  { sigla: "AHO", full: "Ahorro" },
  { sigla: "VAC", full: "Vacaciones" },
  { sigla: "OCI", full: "Ocio" }
];

// HTML del panel colapsable (cerrado por defecto). Lo inyectan compare/sectores.
function siglasPanelHTML() {
  const items = SIGLA_GLOSSARY.map(s =>
    `<div class="sigla-item"><strong>${s.sigla}</strong>${s.full}</div>`).join('');
  return `<div class="siglas-card">
    <button class="siglas-head" type="button" aria-expanded="false" onclick="toggleSiglas(this)">
      <span class="siglas-head-title">Qué significa cada sigla</span>
      <span class="siglas-chevron" aria-hidden="true"></span>
    </button>
    <div class="siglas-body"><div class="siglas-grid">${items}</div></div>
  </div>`;
}
function toggleSiglas(headEl) {
  const card = headEl.closest('.siglas-card');
  if (!card) return;
  const open = card.classList.toggle('open');
  headEl.setAttribute('aria-expanded', open ? 'true' : 'false');
}
window.toggleSiglas = toggleSiglas;

// Restaura las clases .sel / .sel-multi de los chips de perfil según state.perfil.
function restoreChipSelections() {
  document.querySelectorAll('.chips').forEach(group => {
    const field = group.dataset.field;
    const multi = group.dataset.multi === 'true';
    const val = state.perfil[field];
    group.querySelectorAll('.chip').forEach(btn => {
      btn.classList.remove('sel', 'sel-multi');
      if (multi) {
        if (Array.isArray(val) && val.includes(btn.dataset.v)) btn.classList.add('sel-multi');
      } else if (val === btn.dataset.v) {
        btn.classList.add('sel');
      }
    });
  });
}

// Carga perfil + filtros guardados. Devuelve true si hay un perfil válido.
function restoreSession() {
  const savedFilters = lsGet(LS.filters);
  if (savedFilters && typeof savedFilters === 'object') {
    state.filters = Object.assign(FILTERS_DEFAULT(), savedFilters);
    if (!Array.isArray(state.filters.areas)) state.filters.areas = [];
    if (!Array.isArray(state.filters.estados)) state.filters.estados = [];
    if (!Array.isArray(state.filters.popKeys)) state.filters.popKeys = [];
  }
  const savedPerfil = lsGet(LS.perfil);
  if (perfilComplete(savedPerfil)) {
    state.perfil = Object.assign({ asistencia: [] }, savedPerfil);
    if (!Array.isArray(state.perfil.asistencia)) state.perfil.asistencia = [];
    restoreChipSelections();
    return true;
  }
  return false;
}

// v0.9: rango de cada pantalla para decidir la dirección del slide (fwd/back).
const SCREEN_RANK = { hero: 0, profile: 1, measures: 2, balance: 3, historial: 3, impact: 4, compare: 5, sectores: 5 };
let _curScreen = 'hero';

// Swap real de pantalla + renders por pantalla + estado del bottom nav.
function applyScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active', 'slide-fwd', 'slide-back'));
  const el = document.getElementById('screen-' + screenId);
  if (el) el.classList.add('active');
  if (screenId === 'hero') renderHeroResume();
  if (screenId === 'measures') { renderHome(); updateMiniBar(); }
  if (screenId === 'profile') updateProfileSummary();
  if (screenId === 'impact') { updateProfileSummary(); }
  if (screenId === 'compare') renderCompare();
  if (screenId === 'sectores') renderSectores();
  if (screenId === 'historial') renderHistorial();
  if (screenId === 'balance') { updateProfileSummary(); renderBalance(); }
  updateBottomNav(screenId);
  window.scrollTo(0, 0);
}

function show(screenId) {
  const dir = (SCREEN_RANK[screenId] ?? 0) >= (SCREEN_RANK[_curScreen] ?? 0) ? 'fwd' : 'back';
  _curScreen = screenId;
  // Transición de entrada: view-transitions nativo si existe; si no, slide CSS.
  if (typeof document.startViewTransition === 'function') {
    document.startViewTransition(() => applyScreen(screenId));
  } else {
    applyScreen(screenId);
    const el = document.getElementById('screen-' + screenId);
    if (el) { void el.offsetWidth; el.classList.add(dir === 'fwd' ? 'slide-fwd' : 'slide-back'); }
  }
}
window.show = show;

// ============== v0.9 — BOTTOM NAV ==============
// Las sub-pantallas (impact/compare/…) cuelgan visualmente de "Medidas".
const NAV_TAB_FOR = {
  measures: 'measures', impact: 'measures', historial: 'measures',
  compare: 'measures', sectores: 'measures', balance: 'balance', profile: 'profile'
};
function updateBottomNav(screenId) {
  document.body.classList.toggle('no-nav', screenId === 'hero');
  const active = NAV_TAB_FOR[screenId] || '';
  document.querySelectorAll('.app-bottom-nav .nav-item').forEach(b =>
    b.classList.toggle('active', b.dataset.screen === active));
}
function navTo(screen) {
  // Balance necesita perfil para calcularse: si no hay, mandamos a cargarlo.
  if (screen === 'balance' && !state.perfil.ocupacion) {
    showToast('Cargá tu perfil para ver el balance');
    show('profile');
    return;
  }
  show(screen);
}
window.navTo = navTo;

// ============== v0.9 — TOAST ==============
let _toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}
window.showToast = showToast;

// ============== v0.9 — WEB SHARE ==============
function shareMeasure(m) {
  if (!m) return;
  const url = location.origin + location.pathname + '#m=' + encodeURIComponent(m.id);
  const payload = { title: m.title, text: 'Te paso esta medida en Cómo Te Pega', url };
  if (navigator.share) {
    navigator.share(payload).catch(() => {});
  } else if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => showToast('Link copiado'), () => showToast('No se pudo copiar el link'));
  } else {
    showToast('Compartir no está disponible en este navegador');
  }
}
function shareCurrentMeasure() { shareMeasure(state.measure); }
window.shareMeasure = shareMeasure;
window.shareCurrentMeasure = shareCurrentMeasure;

// ============== v0.9 — GUARDADAS (marcar para después) ==============
const LS_SAVED = 'ctp.saved';
function getSaved() { const v = lsGet(LS_SAVED); return Array.isArray(v) ? v : []; }
function isSaved(id) { return getSaved().includes(id); }
function toggleSaved(id) {
  let s = getSaved();
  if (s.includes(id)) { s = s.filter(x => x !== id); lsSet(LS_SAVED, s); showToast('Quitada de guardadas'); }
  else { s.push(id); lsSet(LS_SAVED, s); showToast('Guardada para después'); }
}

// ============== v0.9 — BOTTOM-SHEET (long-press) ==============
const ICON_SHARE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"></path></svg>';
const ICON_BOOKMARK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>';
const ICON_OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>';

function openSheet(m) {
  const bd = document.getElementById('sheetBackdrop');
  const titleEl = document.getElementById('sheetTitle');
  const itemsEl = document.getElementById('sheetItems');
  if (!bd || !itemsEl) return;
  if (titleEl) titleEl.textContent = m.title;
  const saved = isSaved(m.id);
  itemsEl.innerHTML = `
    <button class="sheet-item" data-act="share">${ICON_SHARE} Compartir</button>
    <button class="sheet-item" data-act="save">${ICON_BOOKMARK} ${saved ? 'Quitar de guardadas' : 'Marcar para después'}</button>
    <button class="sheet-item" data-act="open">${ICON_OPEN} Ver cómo te pega</button>`;
  itemsEl.querySelectorAll('.sheet-item').forEach(b => {
    b.onclick = () => {
      const act = b.dataset.act;
      closeSheet();
      if (act === 'share') shareMeasure(m);
      else if (act === 'save') toggleSaved(m.id);
      else if (act === 'open') openMeasure(m.id);
    };
  });
  bd.classList.add('show');
}
// Cierra si el click vino del backdrop (no de adentro del sheet) o sin evento (item).
function closeSheet(e) {
  if (e && e.target && e.target.id !== 'sheetBackdrop') return;
  document.getElementById('sheetBackdrop')?.classList.remove('show');
}
window.closeSheet = closeSheet;

// ============== v0.9.4 — MODAL MERCADO PAGO (datos copiables) ==============
function openMpModal() {
  document.getElementById('mpBackdrop')?.classList.add('show');
}
// Cierra si el click vino del backdrop (no de adentro del modal) o sin evento (botón Cerrar).
function closeMpModal(e) {
  if (e && e.target && e.target.id !== 'mpBackdrop') return;
  document.getElementById('mpBackdrop')?.classList.remove('show');
}
function copyMpData(text, okMsg) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(
      () => showToast(okMsg),
      () => showToast('No se pudo copiar')
    );
  } else {
    showToast('Copiar no está disponible en este navegador');
  }
}
window.openMpModal = openMpModal;
window.closeMpModal = closeMpModal;
window.copyMpData = copyMpData;

// Long-press (touch 500ms) sobre una card → bottom-sheet. Suprime el click de
// navegación si el long-press disparó. Cancela si el dedo se mueve >10px.
function attachLongPress(card, m) {
  let timer = null, longFired = false, sx = 0, sy = 0;
  const start = (e) => {
    longFired = false;
    const t = e.touches ? e.touches[0] : e;
    sx = t.clientX; sy = t.clientY;
    timer = setTimeout(() => {
      longFired = true;
      if (navigator.vibrate) navigator.vibrate(15);
      openSheet(m);
    }, 500);
  };
  const cancel = () => { if (timer) { clearTimeout(timer); timer = null; } };
  const move = (e) => {
    const t = e.touches ? e.touches[0] : e;
    if (Math.abs(t.clientX - sx) > 10 || Math.abs(t.clientY - sy) > 10) cancel();
  };
  card.addEventListener('touchstart', start, { passive: true });
  card.addEventListener('touchmove', move, { passive: true });
  card.addEventListener('touchend', cancel);
  card.addEventListener('touchcancel', cancel);
  card.addEventListener('click', (e) => {
    if (longFired) { e.preventDefault(); e.stopPropagation(); longFired = false; }
  }, true);
}

// ============== v0.9 — BÚSQUEDA EN HEADER ==============
function toggleSearch() {
  const box = document.getElementById('headerSearch');
  if (!box) return;
  const willShow = box.hidden;
  box.hidden = !willShow;
  if (willShow) {
    if (_curScreen !== 'measures') show('measures');
    const inp = document.getElementById('globalSearch');
    if (inp) { inp.value = state.filters.busqueda || ''; setTimeout(() => inp.focus(), 40); }
  }
}
window.toggleSearch = toggleSearch;

function wireGlobalSearch() {
  const inp = document.getElementById('globalSearch');
  if (!inp) return;
  inp.oninput = () => {
    state.filters.busqueda = inp.value;
    if (state.searchTimer) clearTimeout(state.searchTimer);
    state.searchTimer = setTimeout(() => {
      persistFilters();
      if (_curScreen !== 'measures') show('measures');
      else loadFirstPage();
      const panelSearch = document.getElementById('filterSearch');
      if (panelSearch) panelSearch.value = inp.value;
    }, 300);
  };
  inp.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); inp.blur(); } };
}

// ============== v0.9 — TABS SCROLLABLES (filtro rápido por área) ==============
function renderAreaTabs() {
  const el = document.getElementById('areaTabs');
  if (!el) return;
  const sel = state.filters.areas;
  const isAll = !sel.length;
  const single = sel.length === 1 ? sel[0] : null;
  const tabs = [`<button class="area-tab ${isAll ? 'active' : ''}" data-area="">Todas</button>`]
    .concat(AREA_KEYS.map(k =>
      `<button class="area-tab ${single === k ? 'active' : ''}" data-area="${k}">${AREA_LABELS[k]}</button>`));
  el.innerHTML = tabs.join('');
  el.querySelectorAll('.area-tab').forEach(b => {
    b.onclick = () => {
      const a = b.dataset.area;
      state.filters.areas = a ? [a] : []; // tabs = single-select; vacío = todas
      persistFilters();
      renderAreaTabs();
      renderFilters(); // mantener sincronizado el panel avanzado
      loadFirstPage();
    };
  });
}

// ============== v0.9 — SKELETONS ==============
function renderSkeletons(n) {
  const list = document.getElementById('measureList');
  if (!list) return;
  let html = '';
  for (let i = 0; i < (n || 5); i++) {
    html += `<div class="skeleton-card">
      <div class="sk-line title"></div>
      <div class="sk-line short"></div>
      <div class="sk-line"></div>
      <div class="sk-line" style="width:80%"></div>
      <div><span class="sk-line tag"></span><span class="sk-line tag"></span></div>
    </div>`;
  }
  list.innerHTML = html;
}

// ============== v0.9 — PULL-TO-REFRESH ==============
function initPullToRefresh() {
  const ptr = document.getElementById('ptr');
  if (!ptr) return;
  let startY = 0, pulling = false, dist = 0;
  const THRESH = 60;
  document.addEventListener('touchstart', (e) => {
    if (_curScreen !== 'measures' || window.scrollY > 0) { pulling = false; return; }
    startY = e.touches[0].clientY; pulling = true; dist = 0;
  }, { passive: true });
  document.addEventListener('touchmove', (e) => {
    if (!pulling) return;
    dist = e.touches[0].clientY - startY;
    if (dist <= 0 || window.scrollY > 0) { pulling = window.scrollY > 0 ? false : pulling; ptr.classList.remove('show'); return; }
    const pull = Math.min(dist, 80);
    ptr.classList.add('show');
    ptr.style.transform = `translateX(-50%) translateY(${pull}px)`;
  }, { passive: true });
  document.addEventListener('touchend', async () => {
    if (!pulling) return;
    pulling = false;
    if (dist >= THRESH && typeof window.reloadCatalog === 'function') {
      ptr.classList.add('loading');
      ptr.style.transform = 'translateX(-50%) translateY(56px)';
      try { await window.reloadCatalog(); } catch (_) {}
    }
    ptr.classList.remove('loading', 'show');
    ptr.style.transform = '';
    dist = 0;
  });
}

// Avisado por el bootstrap cuando el catálogo se recargó (pull-to-refresh).
window.onCatalogReloaded = function () {
  state.listLoaded = false;
  if (_curScreen === 'balance') renderBalance();
  else renderHome();
  showToast('Catálogo actualizado');
};

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
        persistPerfil(); // v0.8
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
  renderLastMeasureBanner(); // v0.8
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

  renderAreaTabs(); // v0.9 — tabs scrollables por área
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
  persistLastMeasure(id); // v0.8
  renderImpact();
  show('impact');
}
window.openMeasure = openMeasure;

// ============== v0.7 — FILTROS COLAPSABLES ==============
function activeFilterCount() {
  const f = state.filters;
  let n = 0;
  n += f.areas.length;     // multi-select: nada marcado = todas (sin filtro)
  n += f.estados.length;
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
  if (state.autoCloseTimer) { clearTimeout(state.autoCloseTimer); state.autoCloseTimer = null; }
  state.filters = FILTERS_DEFAULT();
  persistFilters(); // v0.8 — limpiar NO cierra el panel (queda abierto para seguir jugando)
  renderFilters();
  loadFirstPage();
}
window.clearFilters = clearFilters;

// v0.8: cierra el panel ~400ms después de APLICAR un filtro (toggle a true).
function scheduleFilterAutoClose() {
  if (state.autoCloseTimer) clearTimeout(state.autoCloseTimer);
  state.autoCloseTimer = setTimeout(() => {
    state.autoCloseTimer = null;
    state.filtersOpen = false;
    renderFilters();
  }, 400);
}

function renderFilters() {
  const el = document.getElementById('measureFilters');
  const toggle = document.getElementById('filterToggle');
  const countEl = document.getElementById('filterCount');
  const clearEl = document.getElementById('filterClear');
  if (!el) return;
  const f = state.filters;
  const n = activeFilterCount();

  if (toggle) toggle.classList.toggle('open', state.filtersOpen);
  // v0.8: la etiqueta del botón cambia según el estado.
  const labelEl = document.getElementById('filterToggleLabel');
  if (labelEl) labelEl.textContent = state.filtersOpen ? 'Cerrar filtros' : 'Filtros';
  // El badge (N) solo cuando está cerrado y hay filtros aplicados.
  if (countEl) { countEl.textContent = n; countEl.classList.toggle('on', !state.filtersOpen && n > 0); }
  if (clearEl) clearEl.style.display = n > 0 ? '' : 'none';

  el.hidden = !state.filtersOpen;
  if (!state.filtersOpen) return;

  const areaChips = AREA_KEYS.map(k =>
    `<button class="fchip ${f.areas.includes(k) ? 'sel' : ''}" data-kind="area" data-v="${k}">${AREA_LABELS[k]}</button>`).join('');
  const fechaChips = FECHA_FILTERS.map(x =>
    `<button class="fchip ${f.fecha === x.key ? 'sel' : ''}" data-kind="fecha" data-v="${x.key}">${x.label}</button>`).join('');
  // Estado: un chip por valor crudo PRESENTE en los datos (etiqueta legible).
  const estadosPresentes = [...new Set(getMeasures().map(m => m.estado).filter(Boolean))];
  const estadoList = ESTADO_ORDER.filter(e => estadosPresentes.includes(e));
  estadosPresentes.forEach(e => { if (!estadoList.includes(e)) estadoList.push(e); });
  const estadoChips = estadoList.map(e =>
    `<button class="fchip ${f.estados.includes(e) ? 'sel' : ''}" data-kind="estado" data-v="${e}">${ESTADO_LABELS[e] || e}</button>`).join('');
  const popChips = POP_FILTERS.map(x =>
    `<button class="fchip ${f.popKeys.includes(x.key) ? 'sel' : ''}" data-kind="pop" data-v="${x.key}">${x.label}</button>`).join('');

  el.innerHTML = `
    <div class="filter-group"><h4 class="filter-h">Área</h4><div class="fchips">${areaChips}</div></div>
    <div class="filter-group"><h4 class="filter-h">Fecha</h4><div class="fchips">${fechaChips}</div></div>
    <div class="filter-group"><h4 class="filter-h">Estado</h4><div class="fchips">${estadoChips}</div></div>
    <div class="filter-group"><h4 class="filter-h">Cobertura mediática</h4><div class="fchips">${popChips}</div></div>
    <div class="filter-group"><h4 class="filter-h">Buscar</h4>
      <input class="filter-search" id="filterSearch" type="text" placeholder="Título o descripción…" value="${escapeAttr(f.busqueda)}"></div>`;

  el.querySelectorAll('.fchip').forEach(b => {
    b.onclick = () => {
      const v = b.dataset.v, kind = b.dataset.kind;
      // `applied` = el toggle dejó un filtro ACTIVO (true). Solo en ese caso
      // cerramos el panel automáticamente (v0.8). Destildar lo deja abierto.
      let applied = false;
      if (kind === 'area') {
        // Multi-select: nada marcado = todas. Toggle como Estado/Cobertura.
        const had = f.areas.includes(v);
        f.areas = had ? f.areas.filter(x => x !== v) : [...f.areas, v];
        applied = !had;
      } else if (kind === 'fecha') {
        f.fecha = v; // single-select
        applied = (v !== 'todas');
      } else if (kind === 'estado') {
        const had = f.estados.includes(v);
        f.estados = had ? f.estados.filter(x => x !== v) : [...f.estados, v];
        applied = !had;
      } else if (kind === 'pop') {
        const had = f.popKeys.includes(v);
        f.popKeys = had ? f.popKeys.filter(x => x !== v) : [...f.popKeys, v];
        applied = !had;
      }
      persistFilters(); // v0.8
      renderFilters();
      loadFirstPage();
      if (applied) scheduleFilterAutoClose(); // ~400ms para que se vea el toggle
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
        persistFilters(); // v0.8 — la búsqueda NO cierra el panel
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
  if (f.areas.length) payload.areas = f.areas.slice();       // vacío = sin filtro (todas)
  if (f.estados.length) payload.estados = f.estados.slice(); // ya son valores crudos de DB
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

// v0.9 — verdict del tag-band (derivado del bucket de scoreMeasure) y etiquetas
// cortas de nivel para las impact-pills dentro de cada card.
const TAGBAND = {
  neg:     { cls: 'contra',  label: 'Te pega fuerte' },
  midneg:  { cls: 'midneg',  label: 'Te pega' },
  softneg: { cls: 'softneg', label: 'Te toca leve' },
  neutral: { cls: 'neutra',  label: 'No te toca' },
  pos:     { cls: 'favor',   label: 'Te beneficia' }
};
// v0.9.4 — unificadas al esquema simétrico de la ficha (Contra X / Favor X).
// Forma corta porque la pill ya lleva ícono + nombre de dimensión + "·".
const LEVEL_SHORT = {
  strong: 'Contra fuerte', mid: 'Contra medio', soft: 'Contra leve',
  none: 'Neutra',
  pos_soft: 'Favor leve', pos: 'Favor medio', pos_strong: 'Favor fuerte'
};

function renderMeasureCards() {
  const list = document.getElementById('measureList');
  if (!list) return;
  if (state.list.loading && !state.list.items.length) {
    renderSkeletons(5); // v0.9 — skeletons con shimmer en vez de "Cargando…"
    return;
  }
  if (!state.list.items.length) {
    list.innerHTML = '<div style="font-size:13px;color:var(--ink-mute);padding:14px 0;">No hay medidas con esos filtros.</div>';
    return;
  }
  const hasPerfil = !!state.perfil.ocupacion;
  list.innerHTML = '';
  state.list.items.forEach(m => {
    const card = document.createElement('div');
    card.className = 'card measure';
    const pop = (m.popularidad || 0);
    const cobBadge = pop >= 2 ? `<span class="cobertura-badge sm" title="Cobertura mediática">${pop}/${m.coberturaTotal || 6}</span>` : '';
    const obsIcon = (m.observaciones?.length) ? '<span class="const-icon" title="Tiene observaciones constitucionales">⚖️</span>' : '';

    // Tag-band del verdict: solo si hay perfil para calcularlo.
    let band = '';
    if (hasPerfil) {
      const tb = TAGBAND[scoreMeasure(m).bucket];
      if (tb) band = `<div class="tag-band ${tb.cls}">${tb.label}</div>`;
    }

    // Fila inferior: impact-pills por dimensión (con perfil) o tags (sin perfil).
    let bottomRow;
    if (hasPerfil && m.hasRules) {
      let dims = [];
      try { dims = m.impact(state.perfil) || []; } catch (e) { dims = []; }
      const shown = dims.filter(d => d.level && d.level !== 'none').slice(0, 3);
      if (shown.length) {
        bottomRow = '<div class="impact-row">' + shown.map(d =>
          `<span class="impact-pill ${d.level}">${dimIcon(d)} ${d.name} · ${LEVEL_SHORT[d.level] || ''}</span>`).join('') + '</div>';
      } else {
        bottomRow = '<div class="impact-row"><span class="impact-pill none">Sin impacto directo en tu perfil</span></div>';
      }
    } else {
      const tagsHtml = (m.tags || []).slice(0, 4).map(t => `<span class="measure-tag">${t}</span>`).join('');
      bottomRow = `<div class="measure-tags">${tagsHtml}</div>`;
    }

    card.innerHTML = `${band}
      <div class="measure-head"><h3>${m.title}</h3><div class="measure-flags">${cobBadge}${obsIcon}</div></div>
      <div class="meta">${m.meta}</div>
      <div class="desc">${m.desc}</div>
      ${bottomRow}
    `;
    card.onclick = () => openMeasure(m.id);
    attachLongPress(card, m); // v0.9 — long-press → bottom-sheet
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
        const tagText = { strong: "EN CONTRA FUERTE", mid: "EN CONTRA MEDIO", soft: "EN CONTRA LEVE", none: "NEUTRA", pos_soft: "A FAVOR LEVE", pos: "A FAVOR MEDIO", pos_strong: "A FAVOR FUERTE" }[d.level];
        card.innerHTML = `
          <div class="dim-head">
            <div class="dim-name"><span class="dim-icon">${dimIcon(d)}</span>${d.name}</div>
            <div class="dim-tag tag-${d.level}">${tagText}</div>
          </div>
          <div class="dim-body">${d.body}</div>
        `;
        dimList.appendChild(card);
      });
    }
  }

  renderWinnersLosers(m);
}

// ============== v0.8.3 — GANADORES Y PERDEDORES (simetría v0.9.5) ==============
// Deriva quién gana y quién pierde con la medida. Dos fuentes complementarias:
//   • Arquetipos personales (`compareProfiles`): un perfil entra en GANAN si
//     tiene ALGÚN badge positivo (pos/pos_soft/pos_strong) y en PIERDEN si tiene
//     ALGÚN badge negativo (strong/mid/soft). Un perfil con badges mixtos puede
//     aparecer en los dos lados (gana en una dimensión, pierde en otra).
//   • Ganadores externos (`compareWinners`): strings sueltos —empresas, sectores,
//     instituciones— que no son perfiles de usuario pero sí ganan con la medida.
//     Refuerzan el bloque GANAN para sostener la promesa de simetría del producto:
//     siempre alguien gana, aunque no sea un arquetipo común.
// El bloque GANAN se muestra SIEMPRE arriba de PIERDEN; si quedara vacío (ni
// arquetipos pos_* ni compareWinners) cae un placeholder discreto en gris.
const WL_WIN_LEVELS = ['pos', 'pos_soft', 'pos_strong'];
const WL_LOSE_LEVELS = ['strong', 'mid', 'soft'];
function profileHasLevel(p, levels) {
  const badges = p && p.badges ? p.badges : {};
  return Object.keys(badges).some(k => levels.includes(badges[k]));
}

function renderWinnersLosers(m) {
  const el = document.getElementById('winnersLosers');
  if (!el) return;
  const profiles = (m && Array.isArray(m.compareProfiles)) ? m.compareProfiles : [];
  const extraWinners = (m && Array.isArray(m.compareWinners)) ? m.compareWinners : [];
  // Sin base alguna (ni arquetipos ni ganadores externos) → no hay nada que afirmar.
  if (!m || (!profiles.length && !extraWinners.length)) { el.innerHTML = ''; return; }

  // GANAN = arquetipos con algún badge positivo + ganadores externos (entidades/sectores).
  const ganan = profiles.filter(p => profileHasLevel(p, WL_WIN_LEVELS)).map(p => p.name)
    .concat(extraWinners);
  // PIERDEN = arquetipos con algún badge negativo.
  const pierden = profiles.filter(p => profileHasLevel(p, WL_LOSE_LEVELS)).map(p => p.name);

  const row = (cls, ico, label, items, placeholder) => {
    let pill;
    if (items.length) pill = `<div class="wl-pill">${items.join(' · ')}</div>`;
    else if (placeholder) pill = `<div class="wl-pill wl-empty">${placeholder}</div>`;
    else return ''; // sin items y sin placeholder → se omite el sub-bloque
    return `<div class="wl-row ${cls}">
      <div class="wl-label"><span class="wl-ico ${ico}" aria-hidden="true"></span>${label}</div>
      ${pill}
    </div>`;
  };

  const rows = [
    // GANAN siempre arriba; si queda vacío, placeholder discreto (raro, por las dudas).
    row('ganan', 'up', 'Ganan', ganan, 'Sin ganadores identificados aún'),
    row('pierden', 'down', 'Pierden', pierden,
        'En esta medida no se identifican perdedores económicos directos en los perfiles analizados.')
  ].join('');

  el.innerHTML = `<div class="card wl-card">
    <div class="wl-title">Ganadores y perdedores</div>
    ${rows}
  </div>`;
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
      badges += `<span class="badge ${lvl}" title="${k} — ${LEVEL_LABEL[lvl] || ''}">${dimSigla(k)}</span>`;
    });
    row.innerHTML = `
      <div class="name">${p.name}<small>${p.sub}</small></div>
      <div class="badge-row">${badges}</div>
    `;
    list.appendChild(row);
  });
  if (!list.innerHTML) list.innerHTML = '<div style="font-size:13px;color:var(--ink-mute);">Sin comparación disponible para esta medida.</div>';
  const sig = document.getElementById('siglasCompare');
  if (sig) sig.innerHTML = siglasPanelHTML();
}

// ============== BALANCE FEATURE ==============
const LEVEL_WEIGHT = { pos_strong: 3, pos: 1, pos_soft: 1, none: 0, soft: -1, mid: -2, strong: -3 };

// Niveles "a favor" del perfil. Lo usan el balance y el agregado por dimensión
// para contar positivos vs negativos (las gradaciones pos_* cuentan como positivas).
const POS_LEVELS = new Set(["pos", "pos_strong", "pos_soft"]);
const isPos = (lvl) => POS_LEVELS.has(lvl);

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
      if (!tally[d.name]) tally[d.name] = { icon: dimIcon(d), pos: 0, neg: 0, items: 0 };
      tally[d.name].items += 1;
      if (isPos(d.level)) tally[d.name].pos += 1;
      else if (d.level !== "none") tally[d.name].neg += 1;
    });
  });
  return tally;
}

// v0.9.3 — filtro pills del listado de balance. Las claves de localStorage van
// en inglés (all/against/neutral/for) para no acoplarlas al label visible.
const BAL_FILTERS = [
  { key: 'all',     label: 'Todas' },
  { key: 'against', label: 'Te pega' },
  { key: 'neutral', label: 'Neutras' },
  { key: 'for',     label: 'Te beneficia' }
];
function getBalanceFilter() {
  try {
    const v = localStorage.getItem('ctp_balance_filter');
    return BAL_FILTERS.some(f => f.key === v) ? v : 'all';
  } catch (e) { return 'all'; }
}
function setBalanceFilter(v) {
  try { localStorage.setItem('ctp_balance_filter', v); } catch (e) {}
}

// Intensidad descendente para el filtro "Te pega": neg > midneg > softneg.
const BUCKET_INTENSITY = { neg: 0, midneg: 1, softneg: 2 };
function filterBalanceList(scored, filter) {
  const byDateDesc = (a, b) => String(b.m.date).localeCompare(String(a.m.date));
  if (filter === 'against') {
    return scored.filter(s => s.bucket === 'neg' || s.bucket === 'midneg' || s.bucket === 'softneg')
      .sort((a, b) => (BUCKET_INTENSITY[a.bucket] - BUCKET_INTENSITY[b.bucket]) || byDateDesc(a, b));
  }
  if (filter === 'neutral') {
    return scored.filter(s => s.bucket === 'neutral').sort(byDateDesc);
  }
  if (filter === 'for') {
    return scored.filter(s => s.bucket === 'pos')
      .sort((a, b) => (b.score - a.score) || byDateDesc(a, b));
  }
  return scored.slice().sort(byDateDesc);
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

  // Pills de filtro: conteos reusan contra/neutral/favor ya calculados arriba.
  const filter = getBalanceFilter();
  const counts = { all: total, against: contra, neutral: neutral, for: favor };
  const filterEl = document.getElementById('balanceFilter');
  if (filterEl) {
    filterEl.innerHTML = BAL_FILTERS.map(f =>
      `<button type="button" class="bal-filter-pill${f.key === filter ? ' active' : ''}" data-bf="${f.key}">${f.label} (${counts[f.key]})</button>`
    ).join('');
    filterEl.querySelectorAll('[data-bf]').forEach(btn => {
      btn.onclick = () => { setBalanceFilter(btn.dataset.bf); renderBalance(); };
    });
  }

  const sorted = filterBalanceList(scored, filter);
  const timeline = document.getElementById('timeline');
  timeline.innerHTML = '';
  if (!sorted.length) {
    timeline.innerHTML = '<div style="font-size:13px;color:var(--ink-mute);padding:10px 0;">No hay medidas en esta categoría.</div>';
  } else {
    sorted.forEach(s => {
      const item = document.createElement('div');
      item.className = 'tl-item ' + s.bucket;
      const label = bucketLabel(s.bucket);
      const negDims = s.dims.filter(d => d.level !== 'none' && !isPos(d.level)).map(d => d.name).slice(0, 3);
      const posDims = s.dims.filter(d => isPos(d.level)).map(d => d.name);
      let summary = '';
      if (negDims.length) summary += `Pega en: ${negDims.join(', ')}`;
      if (posDims.length) summary += (summary ? ' · ' : '') + `Beneficia: ${posDims.join(', ')}`;
      if (!summary) summary = 'Sin impacto directo en tu perfil.';
      item.innerHTML = `<div class="tl-date">${formatDate(s.m.date)}</div><div class="tl-title">${s.m.title}</div><span class="tl-pill ${s.bucket}">${label}</span><div class="tl-summary">${summary}</div>`;
      item.onclick = () => openMeasure(s.m.id);
      timeline.appendChild(item);
    });
  }

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
    { value: contra, color: '#ef4444', label: 'En contra', cls: 'contra' },
    { value: neutral, color: '#4b4b54', label: 'Neutras', cls: 'neutral' },
    { value: favor, color: '#22c55e', label: 'A favor', cls: 'favor' }
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
    <div class="bal-filter" id="balanceFilter"></div>
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
      badges += `<span class="badge ${d.level}" title="${d.name} — ${LEVEL_LABEL[d.level] || ''}">${dimSigla(d.name)}</span>`;
    });
    if (!badges) badges = '<span class="badge none" title="Sin impacto directo en este perfil">—</span>';
    row.innerHTML = `<div class="name">${c.label}<small>${c.aam} · ${c.quintil}</small></div><div class="badge-row">${badges}</div>`;
    list.appendChild(row);
  });
  const sig = document.getElementById('siglasSectores');
  if (sig) sig.innerHTML = siglasPanelHTML();
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

// ============== v0.8 — PERSISTENCIA (UI) ==============
// Banner "Última medida que viste" arriba del listado. Solo aparece si hay un
// id guardado Y esa medida sigue existiendo en los datos cargados.
function renderLastMeasureBanner() {
  const el = document.getElementById('lastMeasureBanner');
  if (!el) return;
  const id = lsGet(LS.lastMeasure);
  const m = id ? getMeasures().find(x => x.id === id) : null;
  if (!m) { el.innerHTML = ''; return; }
  el.innerHTML = `<div class="last-measure">
    <div class="last-measure-txt">
      <span class="last-measure-lbl">Última medida que viste</span>
      <span class="last-measure-title">${m.title}</span>
    </div>
    <button class="last-measure-btn" onclick="openLastMeasure()">Ver</button>
  </div>`;
}

function openLastMeasure() {
  const id = lsGet(LS.lastMeasure);
  if (id) openMeasure(id);
}
window.openLastMeasure = openLastMeasure;

// Cartel discreto en el hero cuando ya hay un perfil cargado (p. ej. tocaron back).
function renderHeroResume() {
  const el = document.getElementById('heroResume');
  if (!el) return;
  if (perfilComplete(state.perfil)) {
    el.innerHTML = `<div class="hero-resume">
      <span>Ya tenés un perfil cargado.</span>
      <div class="hero-resume-actions">
        <button class="btn-mini-primary" onclick="show('measures')">Continuar</button>
        <button class="btn-mini-ghost" onclick="nuevaPrueba()">Empezar de nuevo</button>
      </div>
    </div>`;
  } else {
    el.innerHTML = '';
  }
}

// "Empezar nueva prueba": confirma, limpia localStorage + state y vuelve al hero.
function nuevaPrueba() {
  if (!window.confirm('¿Empezar una prueba nueva? Se borra el perfil que cargaste.')) return;
  lsDel(LS.perfil); lsDel(LS.filters); lsDel(LS.lastMeasure);
  if (state.autoCloseTimer) { clearTimeout(state.autoCloseTimer); state.autoCloseTimer = null; }
  if (state.searchTimer) { clearTimeout(state.searchTimer); state.searchTimer = null; }
  state.perfil = { asistencia: [] };
  state.filters = FILTERS_DEFAULT();
  state.filtersOpen = false;
  state.measure = null;
  state.listLoaded = false;
  state.list = { items: [], total: 0, loading: false };
  document.querySelectorAll('.chips .chip').forEach(c => c.classList.remove('sel', 'sel-multi'));
  checkProfileComplete();
  updateProfileSummary();
  show('hero');
}
window.nuevaPrueba = nuevaPrueba;

// ============== INIT ==============
// Llamado por el bootstrap de módulos una vez que window.MEASURES está cargado.
function initApp() {
  injectBalanceScreen();
  wireChips();
  wireGlobalSearch();    // v0.9 — búsqueda del header
  initPullToRefresh();   // v0.9 — pull-to-refresh en el listado
  // v0.8: restaurar sesión (perfil + filtros) ANTES de decidir qué pantalla mostrar.
  const tienePerfil = restoreSession();
  checkProfileComplete();
  updateProfileSummary();

  // v0.9 — deep-link a una medida (#m=<id>) desde un link compartido.
  const hm = (location.hash.match(/[#&]m=([^&]+)/) || [])[1];
  const deepId = hm ? decodeURIComponent(hm) : null;
  if (deepId && getMeasures().find(x => x.id === deepId)) {
    openMeasure(deepId); // setea pantalla impact + bottom nav
    return;
  }

  if (tienePerfil) {
    // Perfil completo guardado → saltar el hero y entrar directo al listado.
    show('measures');
  } else {
    updateBottomNav('hero'); // oculta el bottom nav en el onboarding
    renderHeroResume();
  }
}
window.initApp = initApp;
