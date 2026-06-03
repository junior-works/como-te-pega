# Cómo Te Pega

Calculadora personal de impacto de medidas del **Boletín Oficial** argentino.
Cargás un perfil mínimo y ves cómo cada medida vigente te toca a vos — no solo
en el bolsillo, también en tu tiempo, tu salud, tu vivienda y tu vida.

PWA estática (HTML + JS vanilla, sin build), proyecto de **Junior Works**.

## Principio rector: objetividad

No juzgamos al gobierno, **medimos impacto**. Las mismas reglas se aplican a
cualquier gobierno; cuando un dato no es seguro, se dice.

La **clase social no la elige el usuario**: se *deriva* del ingreso del hogar,
en múltiplos de la Canasta Básica Total (CBT) del INDEC.

> El ingreso te dice dónde estás parado; la objetividad evita que la gente se
> crea de otra clase.

La derivación vive en [`js/clases-sociales.js`](js/clases-sociales.js).

## Stack

- HTML + CSS + JavaScript vanilla (un ES module: `js/clases-sociales.js`).
- PWA: `manifest.json` + `service-worker.js` (app shell con precache).
- Sin dependencias, sin bundler, sin paso de build.
- Hosting: GitHub Pages (`junior-works.github.io/como-te-pega`).

## Cómo correrlo local

No hay que instalar nada, pero **sí hay que servirlo por HTTP** (no abrir el
`index.html` directo): los ES modules y el service worker no cargan bajo
`file://`. Desde la raíz del repo:

```bash
# Python (viene con Windows si instalaste Python)
python -m http.server 8080

# o Node, si lo tenés
npx serve .
```

Después abrí `http://localhost:8080/`.

## Estado

Prototipo **v0.5** — rebrand a *Cómo Te Pega* + clase social derivada + vista
"cómo te pega por sector social". El catálogo de medidas está hardcodeado y se
va a actualizar con los datos del **BORA** (Boletín Oficial) más adelante; los
perfiles arquetípicos y los umbrales de CBT se moverán a config dinámica /
Supabase.
