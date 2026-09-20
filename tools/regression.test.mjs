// Run with: node tools/regression.test.mjs (also supports node --test).
// Exercise actual classic-script functions in isolation, without a browser or network.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../js/render.js', import.meta.url), 'utf8');
function section(start, end) {
  const a = source.indexOf(start);
  const b = source.indexOf(end, a);
  assert.ok(a >= 0 && b > a, `Missing source markers: ${start}`);
  return source.slice(a, b);
}
const labels = section('const FIELD_LABELS =', '// Estilo visual de cada medio');
const imports = section('function validarPerfilImportado(', 'window.importPerfil =');
const router = section('const ROUTE_FOR =', "window.addEventListener('popstate'");
const plain = value => JSON.parse(JSON.stringify(value));
const payload = (perfil = {}, guardadas = []) => ({ app: 'como-te-pega', formato: 1, perfil, guardadas });
function harness() {
  const writes = [];
  const messages = [];
  const state = { perfil: { ocupacion: 'empleado_priv', asistencia: [] }, measure: null };
  const context = vm.createContext({
    URLSearchParams, state, location: { pathname: '/', search: '', hash: '' },
    getMeasures: () => [{ id: 'medida-prueba' }], renderImpact() {},
    show: screen => writes.push(['screen', screen]), updateSeo() {},
    persistPerfil: () => writes.push(['perfil', plain(state.perfil)]),
    lsSet: (key, value) => writes.push([key, plain(value)]), LS_SAVED: 'saved',
    restoreChipSelections() {}, checkProfileComplete() {}, updateProfileSummary() {},
    updateTuneCount() {}, ctpTrack() {}, navTo: screen => writes.push(['nav', screen]),
    perfilComplete: perfil => !!perfil.ocupacion,
    showToast: message => messages.push(message),
    FileReader: class {
      readAsText(file) {
        if (file.error) { this.onerror(); return; }
        this.result = file.text;
        this.onload();
      }
    }
  });
  vm.runInContext(labels + imports + router, context);
  return { context, writes, messages, state };
}

test('all selectable profile values survive import validation', () => {
  const { context } = harness();
  const fields = vm.runInContext('FIELD_LABELS', context);
  for (const [field, values] of Object.entries(fields)) {
    for (const value of Object.keys(values)) {
      const perfil = { [field]: field === 'asistencia' ? [value] : value };
      const result = plain(context.validarPerfilImportado(payload(perfil)));
      assert.deepEqual(result.perfil[field], perfil[field]);
    }
  }
});

test('empty and partial exports are supported; unknown properties are not copied', () => {
  const { context } = harness();
  assert.deepEqual(plain(context.validarPerfilImportado(payload()).perfil), { asistencia: [] });
  const perfil = JSON.parse('{"ocupacion":"pyme","zona":null,"ingreso":"","__proto__":{"polluted":true},"unrecognized":1}');
  assert.deepEqual(plain(context.validarPerfilImportado(payload(perfil)).perfil), { asistencia: [], ocupacion: 'pyme' });
});

test('deduplicates saved measures and assistance without discarding unknown valid IDs', () => {
  const { context } = harness();
  const result = plain(context.validarPerfilImportado(payload({ asistencia: ['auh', 'auh'] }, ['future-id', 'future-id'])));
  assert.deepEqual(result, { perfil: { asistencia: ['auh'] }, guardadas: ['future-id'] });
});

test('invalid files never replace profile or saved data', () => {
  const bad = [null, [], {}, { ...payload(), formato: 2 }, { ...payload(), perfil: [] },
    payload({ ocupacion: 'constructor' }), payload({ hijos: 1 }),
    payload({ asistencia: 'auh' }), payload({ asistencia: ['ninguno', 'auh'] }),
    payload({ asistencia: [null] }), payload({}, [null]), payload({}, ['<script>'])];
  for (const text of ['{broken', ...bad.map(value => JSON.stringify(value))]) {
    const { context, writes, state } = harness();
    const before = plain(state);
    context.importPerfil({ files: [{ size: text.length, text }], value: 'file' });
    assert.deepEqual(state, before);
    assert.deepEqual(writes, []);
  }
});

test('read errors and oversized files preserve current data', () => {
  for (const file of [{ size: 1024 * 1024 + 1 }, { size: 1, error: true }]) {
    const { context, writes, messages } = harness();
    context.importPerfil({ files: [file], value: 'file' });
    assert.equal(writes.length, 0);
    assert.equal(messages.length, 1);
  }
});

test('successful import persists profile and saved IDs; omitted IDs preserve existing ones', () => {
  for (const guardadas of [undefined, [], ['medida-prueba']]) {
    const { context, writes, state } = harness();
    const data = payload({ ocupacion: 'pyme' });
    data.guardadas = guardadas;
    context.importPerfil({ files: [{ size: 100, text: JSON.stringify(data) }], value: 'file' });
    assert.equal(state.perfil.ocupacion, 'pyme');
    assert.equal(writes.some(([key]) => key === 'perfil'), true);
    assert.deepEqual(writes.filter(([key]) => key === 'saved'), guardadas === undefined ? [] : [['saved', guardadas]]);
  }
});

test('new and legacy measure links remain compatible', () => {
  for (const [search, hash] of [['?v=medida&m=medida-prueba', ''], ['', '#m=medida%2Dprueba']]) {
    const { context } = harness();
    Object.assign(context.location, { search, hash });
    assert.deepEqual(plain(context.parseRoute()), { screen: 'impact', m: 'medida-prueba' });
  }
});

test('malformed legacy links and unknown routes do not crash or resolve inherited properties', () => {
  for (const [search, hash] of [['', '#m=%E0%A4%A'], ['?v=__proto__', ''], ['?v=constructor', '']]) {
    const { context, writes } = harness();
    Object.assign(context.location, { search, hash });
    context.applyRoute(context.parseRoute(), { silent: true });
    assert.deepEqual(writes, [['screen', 'hero']]);
  }
});

test('detail screens without a valid measure fall back to the list, including stale state', () => {
  for (const screen of ['impact', 'compare', 'sectores']) {
    for (const m of [null, 'missing']) {
      const { context, state, writes } = harness();
      state.measure = { id: 'old-measure' };
      context.applyRoute({ screen, m }, { silent: true });
      assert.deepEqual(writes, [['screen', 'measures']]);
    }
  }
});

test('valid routes and profile-required guards still work', () => {
  const { context, state, writes } = harness();
  context.applyRoute({ screen: 'compare', m: 'medida-prueba' }, { silent: true });
  assert.equal(writes.at(-1)[1], 'compare');
  state.perfil = {};
  context.applyRoute({ screen: 'compare', m: 'medida-prueba' }, { silent: true });
  assert.equal(writes.at(-1)[1], 'impact');
  context.applyRoute({ screen: 'balance' }, { silent: true });
  assert.equal(writes.at(-1)[1], 'profile');
  assert.equal(context.routeUrl('impact', 'medida-prueba'), '/?v=medida&m=medida-prueba');
});
