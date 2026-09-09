/* Cómo Te Pega — generador de páginas estáticas por medida (v1.3)
 * ------------------------------------------------------------------
 * POR QUÉ EXISTE
 * La app es una SPA en hosting estático: Google ve un index.html vacío
 * y no indexa las 81 medidas. La gente no busca "Cómo Te Pega", busca
 * "bono jubilados septiembre 2026". Este script genera una página real
 * por medida — HTML servido, con su título, su resumen y su fuente —
 * que es la puerta de entrada orgánica a la app.
 *
 * NO redirige automáticamente: es contenido de verdad, con un CTA que
 * lleva a la app para ver el impacto personalizado. Nada de cloaking.
 *
 * USO (desde la raíz del repo):
 *   node tools/gen-static.mjs
 *
 * Escribe: medida/<id>/index.html, sitemap.xml, robots.txt
 * Correlo cada vez que se agregan medidas al catálogo.
 * ------------------------------------------------------------------ */
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MEASURES_BASE } from '../js/medidas-base.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://junior-works.github.io/como-te-pega';

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');
// El `desc` del catálogo puede traer <strong>/<em>: para los meta los sacamos.
const plain = (s) => String(s ?? '').replace(/<[^>]+>/g, '');
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);

const ESTADO_LABEL = {
  vigente: 'Vigente', suspendida: 'Suspendida', derogada: 'Derogada',
  parcial: 'Vigencia parcial', en_debate: 'En debate', judicializada: 'Judicializada'
};

function fechaLarga(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return '';
  const [y, m, d] = iso.split('-');
  const MES = ['enero','febrero','marzo','abril','mayo','junio','julio',
               'agosto','septiembre','octubre','noviembre','diciembre'];
  return `${Number(d)} de ${MES[Number(m) - 1]} de ${y}`;
}

function page(m) {
  const url = `${SITE}/medida/${m.id}/`;
  const title = `${plain(m.title)} — cómo te pega`;
  const desc = clip(plain(m.desc), 158);
  const tags = (m.tags || []).map(t => `<li>${esc(t)}</li>`).join('');
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: plain(m.title),
    description: plain(m.desc),
    datePublished: m.date,
    inLanguage: 'es-AR',
    isAccessibleForFree: true,
    mainEntityOfPage: url,
    about: (m.tags || []).join(', '),
    publisher: { '@type': 'Organization', name: 'Junior Works' }
  };
  return `<!DOCTYPE html>
<html lang="es-AR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#0E1B2C">
<title>${esc(title)} | Cómo Te Pega</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="icon" type="image/svg+xml" href="../../favicon.svg">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Cómo Te Pega">
<meta property="og:locale" content="es_AR">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/assets/icons/icon-512.png">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: #0E1B2C;
    background-image: radial-gradient(1100px 560px at 50% -8%, #16293F 0%, #0E1B2C 62%);
    color: #fff; font: 16px/1.6 "Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  }
  .wrap { max-width: 660px; margin: 0 auto; padding: 26px 20px 60px; }
  a { color: #F6B40E; }
  .top { display: flex; align-items: center; gap: 10px; margin-bottom: 26px; text-decoration: none; color: #fff; }
  .dot { width: 26px; height: 26px; border-radius: 50%; background: #F6B40E; flex: none; }
  .top b { font-size: 15px; letter-spacing: -.01em; }
  h1 { font-size: 27px; line-height: 1.25; letter-spacing: -.02em; margin: 0 0 12px; }
  .estado { display: inline-block; font-size: 12px; font-weight: 700; text-transform: uppercase;
            letter-spacing: .04em; color: #0E1B2C; background: #F6B40E; border-radius: 999px; padding: 3px 10px; }
  .meta { color: #93A7BD; font-size: 13.5px; margin: 12px 0 22px; }
  .desc { font-size: 17px; color: #D5E2F0; }
  .card { background: #16293F; border: 1px solid #26405C; border-radius: 16px; padding: 18px 20px; margin: 24px 0; }
  .card h2 { font-size: 15px; margin: 0 0 8px; }
  .card p { margin: 0; color: #93A7BD; font-size: 14px; }
  ul.tags { list-style: none; display: flex; flex-wrap: wrap; gap: 7px; padding: 0; margin: 18px 0 0; }
  ul.tags li { font-size: 12.5px; color: #D5E2F0; background: #1E344E; border: 1px solid #26405C; border-radius: 999px; padding: 4px 11px; }
  .cta { display: block; text-align: center; text-decoration: none; font-weight: 700; color: #0E1B2C;
         background: linear-gradient(135deg, #FFC53D 0%, #F6B40E 50%, #D69A08 100%);
         border-radius: 14px; padding: 15px 18px; margin: 26px 0 10px;
         box-shadow: 0 6px 20px rgba(246,180,14,.32); }
  .cta-sub { text-align: center; color: #93A7BD; font-size: 13px; margin: 0 0 30px; }
  footer { border-top: 1px solid #26405C; padding-top: 18px; color: #93A7BD; font-size: 12.5px; line-height: 1.7; }
</style>
</head>
<body>
<div class="wrap">
  <a class="top" href="../../"><span class="dot"></span><b>¿Cómo te pega?</b></a>

  <span class="estado">${esc(ESTADO_LABEL[m.estado] || m.estado || 'Vigente')}</span>
  <h1>${esc(plain(m.title))}</h1>
  <p class="meta">${esc(plain(m.meta))}${m.date ? ` · publicada el ${fechaLarga(m.date)}` : ''}</p>
  <p class="desc">${m.desc}</p>
  ${tags ? `<ul class="tags">${tags}</ul>` : ''}

  <a class="cta" href="../../?v=medida&amp;m=${encodeURIComponent(m.id)}">Ver cómo te pega a vos →</a>
  <p class="cta-sub">Cargás cinco datos y la app calcula el impacto en tu bolsillo, tu tiempo, tu salud y tu vivienda. Gratis, sin cuenta y sin publicidad.</p>

  <div class="card">
    <h2>Fuente</h2>
    <p>${esc(plain(m.fuente || 'Boletín Oficial de la República Argentina.'))}</p>
  </div>

  <footer>
    <strong>No juzgamos al gobierno, medimos impacto.</strong> Las mismas reglas se aplican a
    cualquier gobierno; cuando un dato no es seguro, se dice.<br>
    Proyecto independiente de Junior Works — no afiliado al Estado argentino.<br>
    <a href="../../">Todas las medidas</a> · <a href="../../privacy.html">Política de privacidad</a>
  </footer>
</div>
</body>
</html>
`;
}

// --- generar ---
const outDir = join(ROOT, 'medida');
if (existsSync(outDir)) rmSync(outDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

const medidas = [...MEASURES_BASE].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
for (const m of medidas) {
  const dir = join(outDir, m.id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), page(m), 'utf8');
}

const hoy = new Date().toISOString().slice(0, 10);
const urls = [
  `  <url><loc>${SITE}/</loc><lastmod>${hoy}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
  ...medidas.map(m =>
    `  <url><loc>${SITE}/medida/${m.id}/</loc><lastmod>${m.date || hoy}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`)
];
writeFileSync(join(ROOT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`, 'utf8');

writeFileSync(join(ROOT, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`, 'utf8');

console.log(`OK — ${medidas.length} páginas en /medida, sitemap.xml y robots.txt`);
