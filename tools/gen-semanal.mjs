/* Cómo Te Pega — archivo público de la newsletter semanal
 * ------------------------------------------------------------------
 * POR QUÉ EXISTE (20-09-2026)
 * Hace más de un mes que se escribe una edición semanal en
 * pendientes/newsletter/ y no estaba publicada en ningún lado. Eso
 * desperdiciaba tres cosas: contenido indexable por Google (una página
 * por semana, con las medidas de esa semana), la prueba de que el
 * producto existe y es constante —lo primero que mira alguien antes de
 * suscribirse o de pagar— y el lugar natural para pedir el mail.
 *
 * USO:  node tools/gen-semanal.mjs
 * Lee:  pendientes/newsletter/edicion-YYYY-MM-DD.md
 * Escribe: semanal/index.html y semanal/<YYYY-MM-DD>/index.html
 * ------------------------------------------------------------------ */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = join(ROOT, 'pendientes', 'newsletter');
const OUT  = join(ROOT, 'semanal');
const SITE = 'https://comotepega.com';

const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const MES = ['enero','febrero','marzo','abril','mayo','junio','julio',
             'agosto','septiembre','octubre','noviembre','diciembre'];
function fechaLarga(iso){
  const [y,m,d] = iso.split('-');
  return `${Number(d)} de ${MES[Number(m)-1]} de ${y}`;
}

/* Markdown mínimo: solo lo que usan las ediciones. */
function inline(t){
  return esc(t)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
}

function parseEdicion(md){
  const lineas = md.split('\n');
  let asunto = '';
  const cuerpo = [];
  let enCabecera = true;

  for (let i = 0; i < lineas.length; i++){
    const l = lineas[i].trim();
    if (!asunto && /^\*\*Asunto propuesto:\*\*/.test(l)){
      asunto = l.replace(/^\*\*Asunto propuesto:\*\*\s*/,'').trim();
      continue;
    }
    // La cabecera del mail (marca, línea "Edición del…") no se repite en la web.
    if (enCabecera){
      if (/^\*\*CÓMO TE PEGA SEMANAL\*\*$/.test(l)) continue;
      if (/^Edición del/.test(l)) { enCabecera = false; continue; }
      if (l === '---' || l === '') continue;
      continue;
    }
    // El pie del mail (CTA, suscripción, firma) tampoco: la web tiene el suyo.
    if (/^👉/.test(l) || /Suscribite acá/.test(l) || /^Este resumen no opina/.test(l)
        || /^El equipo de Cómo Te Pega/.test(l) || /^¿Te lo reenviaron/.test(l)) continue;
    cuerpo.push(lineas[i]);
  }

  // Agrupar en bloques: separadores, títulos con emoji, párrafos.
  const html = [];
  let parrafo = [];
  const cerrar = () => {
    if (!parrafo.length) return;
    html.push(`<p>${inline(parrafo.join(' ').trim())}</p>`);
    parrafo = [];
  };
  for (const raw of cuerpo){
    const l = raw.trim();
    if (l === '---'){ cerrar(); html.push('<hr class="ed-sep">'); continue; }
    if (l === ''){ cerrar(); continue; }
    // Título de bloque: empieza con emoji y tiene **negrita**
    const mt = l.match(/^([^\w\s*][^\s*]*)\s+\*\*(.+?)\*\*\s*(.*)$/u);
    if (mt){
      cerrar();
      html.push(`<h2 class="ed-h"><span class="ed-emoji">${esc(mt[1])}</span>${inline(mt[2])}` +
                `${mt[3] ? ` <span class="ed-norma">${inline(mt[3])}</span>` : ''}</h2>`);
      continue;
    }
    parrafo.push(l);
  }
  cerrar();
  return { asunto, html: html.join('\n      ') };
}

const CSS = `
  :root{--bg-0:#0a0a0c;--text-0:#f5f1e6;--text-1:#cfc8b8;--text-2:#8a8478;
    --gold-1:#fbd24a;--brown-1:#c47a2c;--border-soft:#26262e;
    --grad-gold:linear-gradient(135deg,#fbd24a 0%,#f59e0b 50%,#d4831a 100%);}
  *{box-sizing:border-box}
  body{margin:0;font-family:'Plus Jakarta Sans',system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
    background:radial-gradient(900px 600px at 50% -260px,rgba(245,158,11,.10),transparent 70%),
               radial-gradient(700px 520px at 12% 4%,rgba(123,63,14,.08),transparent 70%),var(--bg-0);
    background-attachment:fixed;color:var(--text-0);font-size:16px;line-height:1.65;-webkit-font-smoothing:antialiased}
  .wrap{max-width:700px;margin:0 auto;padding:26px 22px 90px}
  .topbar{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:26px}
  .marca{display:inline-flex;align-items:center;gap:8px;text-decoration:none;color:var(--text-0);font-weight:800;font-size:15px}
  .marca .dot{width:24px;height:24px;border-radius:50%;background:var(--grad-gold);flex:none}
  .back-pill{display:inline-flex;align-items:center;gap:6px;background:var(--grad-gold);color:#1a0e02;
    font-weight:700;font-size:13.5px;text-decoration:none;padding:8px 15px;border-radius:999px;white-space:nowrap}
  h1{margin:0 0 10px;font-size:30px;font-weight:800;letter-spacing:-.7px;line-height:1.2;
    background:var(--grad-gold);-webkit-background-clip:text;background-clip:text;
    -webkit-text-fill-color:transparent;color:var(--gold-1)}
  .sub{margin:0 0 4px;color:var(--text-2);font-size:14px;font-weight:500}
  .lede{color:var(--text-1);font-size:17px;margin:16px 0 0}
  hr.ed-sep{border:0;border-top:1px solid var(--border-soft);margin:28px 0}
  .ed-h{font-size:19px;font-weight:700;color:var(--gold-1);margin:30px 0 10px;
    letter-spacing:-.2px;line-height:1.35}
  .ed-emoji{font-size:20px;margin-right:9px}
  .ed-norma{display:block;font-size:13px;font-weight:600;color:var(--text-2);margin-top:4px}
  p{color:var(--text-1);margin:0 0 14px}
  strong{color:#fffdf7;font-weight:700}
  a{color:var(--gold-1);text-decoration:none;border-bottom:1px solid rgba(251,210,74,.35)}
  .card{background:rgba(255,255,255,.028);border:1px solid var(--border-soft);border-radius:16px;padding:20px;margin:0 0 16px}
  .card.gold{border-color:rgba(251,210,74,.34);background:rgba(251,210,74,.05)}
  .card h3{margin:0 0 8px;font-size:17px;color:var(--gold-1);font-weight:700}
  .card p{margin:0 0 10px;font-size:15px}
  .card p:last-child{margin:0}
  ul.eds{list-style:none;padding:0;margin:0}
  ul.eds li{border-bottom:1px solid var(--border-soft)}
  ul.eds li:last-child{border-bottom:0}
  ul.eds a{display:block;padding:16px 4px;border-bottom:0}
  ul.eds .f{display:block;font-size:12.5px;color:var(--text-2);margin-bottom:3px;letter-spacing:.02em}
  ul.eds .t{display:block;font-size:16px;font-weight:600;color:var(--text-0);line-height:1.45}
  .nav-ed{display:flex;justify-content:space-between;gap:12px;margin-top:34px;
    padding-top:18px;border-top:1px solid var(--border-soft);font-size:14px}
  .foot-note{margin-top:40px;padding-top:18px;border-top:1px solid var(--border-soft);
    color:var(--text-2);font-size:13px;line-height:1.7}
  @media(max-width:520px){h1{font-size:25px}.wrap{padding:20px 16px 70px}.ed-h{font-size:17px}}
`;

function pagina({ title, desc, canonical, body }){
  return `<!DOCTYPE html>
<html lang="es-AR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#0a0a0c">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Cómo Te Pega">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head>
<body>
<div class="wrap">
  <div class="topbar">
    <a class="marca" href="/"><span class="dot"></span>¿Cómo te pega?</a>
    <a class="back-pill" href="/">Ver cómo te pega a vos →</a>
  </div>
${body}
  <p class="foot-note">
    <strong>No juzgamos al gobierno, medimos impacto.</strong> Las mismas reglas se aplican
    a cualquier gobierno; cuando un dato no es seguro, se dice.<br>
    <a href="/metodologia/">Cómo se calcula esto</a> · <a href="/semanal/">Todas las ediciones</a> ·
    <a href="/privacy.html">Privacidad</a><br>
    Proyecto independiente de Junior Works — no afiliado al Estado argentino.
  </p>
</div>
</body>
</html>
`;
}

// ---- generar ----
const archivos = readdirSync(SRC).filter(f => /^edicion-\d{4}-\d{2}-\d{2}\.md$/.test(f)).sort().reverse();
// No se borra la carpeta: se sobreescribe. Borrar exige permisos que no
// siempre hay, y una edición vieja que quede no rompe nada.
mkdirSync(OUT, { recursive: true });

const eds = archivos.map(f => {
  const fecha = f.slice(8, 18);
  const { asunto, html } = parseEdicion(readFileSync(join(SRC, f), 'utf8'));
  return { fecha, asunto, html };
});

eds.forEach((ed, i) => {
  const ant = eds[i + 1], sig = eds[i - 1];
  const url = `${SITE}/semanal/${ed.fecha}/`;
  const body = `  <p class="sub">Edición del ${fechaLarga(ed.fecha)}</p>
  <h1>${esc(ed.asunto)}</h1>
  <p class="lede">El resumen de lo que el Boletín Oficial te cambió esta semana, sin vueltas.</p>
  <hr class="ed-sep">
      ${ed.html}
  <div class="card gold">
    <h3>Te llega todos los domingos</h3>
    <p>Una vez por semana, qué se publicó en el Boletín Oficial y a quién le pega. Es gratis,
    y tu mail nunca se cruza con tu perfil de la app.</p>
    <p><a href="/#newsletter">Suscribirme al resumen semanal →</a></p>
  </div>
  <div class="nav-ed">
    <span>${ant ? `<a href="/semanal/${ant.fecha}/">← ${fechaLarga(ant.fecha)}</a>` : ''}</span>
    <span>${sig ? `<a href="/semanal/${sig.fecha}/">${fechaLarga(sig.fecha)} →</a>` : ''}</span>
  </div>`;
  mkdirSync(join(OUT, ed.fecha), { recursive: true });
  writeFileSync(join(OUT, ed.fecha, 'index.html'),
    pagina({ title: `${ed.asunto} | Cómo Te Pega`,
             desc: `Edición del ${fechaLarga(ed.fecha)} del resumen semanal del Boletín Oficial: qué cambió y a quién le pega.`,
             canonical: url, body }), 'utf8');
});

const lista = eds.map(ed =>
  `<li><a href="/semanal/${ed.fecha}/"><span class="f">${fechaLarga(ed.fecha).toUpperCase()}</span>` +
  `<span class="t">${esc(ed.asunto)}</span></a></li>`).join('\n      ');

writeFileSync(join(OUT, 'index.html'), pagina({
  title: 'El resumen semanal del Boletín Oficial | Cómo Te Pega',
  desc: 'Cada semana, qué se publicó en el Boletín Oficial y a quién le pega. Con fuente oficial y sin opinar. Gratis.',
  canonical: `${SITE}/semanal/`,
  body: `  <h1>El resumen semanal</h1>
  <p class="lede">Cada semana, qué se publicó en el Boletín Oficial y a quién le pega.
  Con la fuente de cada norma y sin opinar sobre si está bien o mal.</p>
  <div class="card gold">
    <h3>Recibilo por mail</h3>
    <p>Es gratis y tu correo nunca se cruza con tu perfil de la app: son dos cosas separadas.</p>
    <p><a href="/#newsletter">Suscribirme →</a></p>
  </div>
  <hr class="ed-sep">
  <ul class="eds">
      ${lista}
  </ul>`
}), 'utf8');

console.log(`OK — ${eds.length} ediciones en /semanal`);
