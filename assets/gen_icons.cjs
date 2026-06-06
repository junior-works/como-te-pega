/* Cómo Te Pega — generador de íconos PWA.
 *
 * Rasteriza los SVG fuente (icon.svg / icon-maskable.svg) a los PNG que
 * referencia el manifest. Usa @resvg/resvg-js (binario precompilado, sin
 * dependencias de sistema). Instalar con:  npm i @resvg/resvg-js --no-save
 *
 * Salidas (en assets/icons/):
 *   icon.svg          -> icon-192.png            (192x192)
 *   icon.svg          -> icon-512.png            (512x512)
 *   icon-maskable.svg -> icon-maskable-512.png   (512x512)
 *
 * Uso:  node assets/gen_icons.cjs   (desde la raíz del repo)
 */
const fs = require("fs");
const path = require("path");
const { Resvg } = require("@resvg/resvg-js");

const ASSETS = __dirname;
const OUT = path.join(ASSETS, "icons");

const JOBS = [
  { svg: "icon.svg",          out: "icon-192.png",          size: 192 },
  { svg: "icon.svg",          out: "icon-512.png",          size: 512 },
  { svg: "icon-maskable.svg", out: "icon-maskable-512.png", size: 512 },
];

for (const job of JOBS) {
  const svg = fs.readFileSync(path.join(ASSETS, job.svg), "utf8");
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: job.size },
    background: "#0a0a0c",
  });
  const png = resvg.render().asPng();
  fs.writeFileSync(path.join(OUT, job.out), png);
  console.log(`  ${job.svg} -> icons/${job.out} (${job.size}px, ${png.length} bytes)`);
}
console.log("OK");
