/* Cómo Te Pega — Service Worker (v0.6.0)
 *
 * Estrategia (estilo Pensándote):
 *   - App shell (HTML, JS, JSON):   NETWORK-FIRST con `cache:'no-store'`
 *     en el fetch interno, así un deploy nuevo se ve sin quedar pegado al
 *     HTTP cache del navegador (GitHub Pages manda max-age=600).
 *   - Estáticos (PNG/JPG/SVG/ICO/WEBP/WOFF): CACHE-FIRST. Cambian poco.
 *   - skipWaiting + clients.claim para que un SW nuevo tome el control sin
 *     esperar a que el usuario cierre todas las tabs.
 *   - Borrado de caches viejos en `activate`.
 *
 * Si rompemos algo del shell, BUMPEAR CACHE_NAME.
 *
 * Scope: el SW vive en el mismo directorio que index.html (subpath
 * /como-te-pega/ en GitHub Pages, raíz en dev local). Como se registra
 * con path relativo (`./service-worker.js`), el scope se deriva solo.
 */

const CACHE_NAME = "ctp-shell-v0.6.0";

const SHELL_FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./config.js",
    "./js/clases-sociales.js",
    "./js/medidas-base.js",
    "./js/data.js",
    "./js/render.js"
];

const STATIC_EXT = /\.(?:png|jpg|jpeg|svg|ico|webp|gif|woff2?|ttf)$/i;

// ---------------------------------------------------------------------------
// install: precache best-effort + skipWaiting
// ---------------------------------------------------------------------------
self.addEventListener("install", (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        // cache.add por archivo (no addAll) — si uno falla, los demás siguen.
        await Promise.all(SHELL_FILES.map(f =>
            cache.add(new Request(f, { cache: "no-store" }))
                 .catch(err => console.warn("[sw] no precache:", f, err?.message || err))
        ));
        await self.skipWaiting();
    })());
});

// ---------------------------------------------------------------------------
// activate: limpiar caches viejos + tomar control de los clients abiertos
// ---------------------------------------------------------------------------
self.addEventListener("activate", (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(
            keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
        );
        await self.clients.claim();
    })());
});

// ---------------------------------------------------------------------------
// fetch: network-first para shell, cache-first para estáticos
// ---------------------------------------------------------------------------
self.addEventListener("fetch", (event) => {
    const { request } = event;
    if (request.method !== "GET") return;

    const url = new URL(request.url);
    // Cross-origin (fonts, futuros Supabase, etc.): dejar pasar sin tocar.
    if (url.origin !== self.location.origin) return;

    if (STATIC_EXT.test(url.pathname)) {
        event.respondWith(cacheFirst(request));
    } else {
        event.respondWith(networkFirst(request));
    }
});

// Network-first: fuerza bypass del HTTP cache del navegador con
// `cache: 'no-store'`. Si la red falla, cae al cache; si es una
// navegación y tampoco hay cache, sirve el index.html offline.
async function networkFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    try {
        const fresh = await fetch(request, { cache: "no-store" });
        if (fresh && fresh.ok && fresh.type !== "opaque") {
            cache.put(request, fresh.clone()).catch(() => {});
        }
        return fresh;
    } catch (_) {
        const hit = await cache.match(request);
        if (hit) return hit;
        if (request.mode === "navigate") {
            const idx = await cache.match("./index.html");
            if (idx) return idx;
        }
        throw _;
    }
}

async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const hit = await cache.match(request);
    if (hit) return hit;
    const fresh = await fetch(request);
    if (fresh && fresh.ok && fresh.type !== "opaque") {
        cache.put(request, fresh.clone()).catch(() => {});
    }
    return fresh;
}

// Permite forzar la transición de SW desde el front con
// postMessage('skipWaiting'). Aún no lo usamos, pero queda listo.
self.addEventListener("message", (event) => {
    if (event.data === "skipWaiting") self.skipWaiting();
});
