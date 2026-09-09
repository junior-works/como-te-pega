# Monetización — cómo está armado y qué falta hacer

> Regla de oro del proyecto: **el apoyo es una donación voluntaria**. No compra
> nada, no desbloquea nada, no da beneficios, prioridad ni contenido extra.
> Todo lo que sigue depende de eso. Si algún día se ofrece algo a cambio, hay que
> rever este documento entero antes de publicar en Google Play.

## 1. Por qué así (la pregunta de la facturación)

La obligación de usar la **facturación de Google Play** —y su comisión— aplica a
la *venta de bienes y servicios digitales dentro de la app*: desbloquear
funciones, contenido, quitar publicidad, niveles "premium". Google además excluye
explícitamente de su sistema de pagos los pagos punto a punto y las donaciones.

Cómo Te Pega no vende nada: todo el contenido es público y gratuito, no hay
publicidad que quitar y quien aporta no recibe absolutamente nada distinto de
quien no aporta. Por eso **no corresponde facturación de Google Play, y no hay
comisión de Google**.

Lo que sostiene esa afirmación no es un texto legal: es el diseño. Por eso:

- El vocabulario de la app **evita a propósito** las palabras *membresía*,
  *suscripción*, *socio*, *premium*, *plan* y *beneficios*. Decimos **aporte**
  (puntual o mensual). Un revisor automático que lee "suscripción" en una app
  puede clasificarla como producto digital; "aporte voluntario" no.
- No hay ninguna función condicionada al aporte. Ninguna. Nunca.
- El copy dice explícitamente *"Es voluntario: no compra ni desbloquea nada"*.

Si Play alguna vez objetara algo, hay un interruptor listo: `APOYO.enAndroid = false`
en `config.js`. Dentro de la app Android pasa a mostrarse **solo el alias para
transferir**, sin links de cobro externos. En la web no cambia nada.

## 2. Y la otra facturación (ARCA)

Distinto tema, y tampoco hay que emitir nada por ahora:

- **Cafecito** actúa como plataforma: cobra, retiene lo suyo y liquida a la cuenta
  del proyecto con su propia documentación. La cuenta de Mercado Pago vinculada a
  Cafecito es la del titular en Argentina, así que el dinero entra directo ahí.
- **Transferencia directa** al alias/CBU es una transferencia entre personas, y es
  la vía con 0% de comisión: llega completo.

*Esto no es asesoramiento contable. Si el ingreso mensual empieza a ser
significativo, conviene consultarlo con un contador.*

## 3. El aporte mensual: por qué todavía no está

Se investigó a fondo el 09-09-2026. Estado real:

### Cafecito NO sirve para lo recurrente

Se probó creando un plan: Cafecito lo marca **"PAGO ÚNICO — no se renueva
mensualmente"**. Su propia documentación lo confirma: *"Los planes no son débitos
mensuales automáticos: elegís y pagás el plazo que querés adquirir."* Además los
planes de Cafecito están pensados para dar acceso a contenido exclusivo, que es
justamente lo que este proyecto no ofrece. El plan de prueba se borró.

**Cafecito queda solo para el aporte puntual**, que funciona perfecto: el cafecito
está a $1.000 con atajos de 3, 5 y 10.

### Mercado Pago SÍ sirve, pero necesita al titular

Mercado Pago permite crear planes de suscripción con débito automático real y
compartirlos por enlace, sin integración técnica. El obstáculo es de acceso: la
cuenta es del titular en Argentina y hay que iniciar sesión en ella para crear el
plan.

**Es fricción de una sola vez, no algo que el titular tenga que sostener después.**
Con veinte minutos —presencial o por videollamada, guiándolo dónde tocar— el plan
queda creado y andando solo. Es el camino que mantiene el dinero yendo directo a
su cuenta.

### RESUELTO (10-09-2026): va por Ko-fi

Se descartó esperar al Mercado Pago del padre por una razón práctica: el acceso
a esa cuenta es difícil de coordinar. La decisión la tomó Charly.

**Cuenta: `ko-fi.com/juniorworks`** (ya existía desde junio 2026, registrada con
`perrosdelaislapalma@gmail.com`).

Configuración que importa:

- Modo de membresía: **"Simple monthly tips (no tiers)"**. Sin niveles, sin
  recompensas, sin contenido exclusivo. Es la única configuración compatible con
  la regla de oro de este documento: quien aporta **no recibe nada distinto**.
  **No pasar a modo "tiers" nunca**, salvo que se rehaga todo este análisis.
- Comisión Ko-fi: **0% en aportes puntuales, 5% en mensuales** (plan gratuito).
- Liquida a PayPal o Stripe.

#### PayPal directo: descartado, y por qué

1. **El botón de donaciones de PayPal exige ser ONG registrada.** Un particular
   no puede usarlo.
2. **Lo recurrente requiere cuenta Business** y no da enlace mensual listo:
   empuja a integración.

#### LO QUE HAY QUE SABER: el mensual es caro para el donante argentino

Ko-fi cobra **en dólares desde el exterior**. Para una tarjeta argentina eso
significa dólar oficial **+ 30% de percepción de Ganancias** (el Impuesto PAÍS
se eliminó, así que bajó ~50% respecto de antes, pero la percepción sigue).
Es recuperable ante ARCA, pero es trámite.

**Ko-fi resuelve el acceso, no el costo.** La única vía que evita ese 30% sigue
siendo **Mercado Pago con la cuenta del titular en Argentina**. Si alguna vez se
puede coordinar esa sesión de veinte minutos, conviene migrar el mensual allá y
dejar Ko-fi como opción para gente de afuera.

Mientras tanto: **Cafecito sigue siendo la vía barata para el aporte puntual**
(en pesos, sin recargo) y es la que hay que seguir empujando para el público
argentino.

#### Detalle de UX ya contemplado

El link `ko-fi.com/juniorworks` abre la pestaña **"One time"**, no la mensual, y
no existe URL que abra directo en "Monthly". Por eso el botón de la app dice:

```
🌱 Un aporte por mes
   En Ko-fi elegí «Monthly» · lo cortás cuando quieras
```

#### Bloqueo inicial (resolver una sola vez)

Ko-fi mostraba *"Please confirm your location to continue accepting payments"*.
Es un diálogo con el país preseleccionado (Spain) y un botón Save. **Hasta que
eso se confirme, Ko-fi no cobra.**

## 3 bis. Qué falta hacer cuando se destrabe

Cuando exista el plan mensual (Mercado Pago, idealmente), es pegar un link:

```js
export const APOYO = {
  mensual: "https://…",   // ← acá
  ...
};
```

Si queda vacío, la opción mensual no aparece y la app funciona igual. Lo mismo con
el newsletter:

```js
export const NEWSLETTER = { url: "https://…", ... };
```

El newsletter es **gratis** y va **aparte del perfil**: el mail nunca se cruza con
las respuestas personales de nadie. Eso está dicho en el copy y hay que mantenerlo.

## 4. Dónde aparece cada cosa

| Bloque | Dónde | Por qué ahí |
|---|---|---|
| Apoyo | Final de la ficha de una medida | La persona ya vio cómo le pega: recién ahí hay valor demostrado |
| Apoyo | Final del balance histórico | El otro momento donde la app ya dio algo concreto |
| Newsletter | Final del listado de medidas y del balance | Momento de exploración, no de decisión |
| Apoyo | ~~Pantalla de perfil~~ | **Se sacó de ahí en v1.3**: pedía antes de dar |

## 5. Cómo saber si funciona

`window.ctpMetrics()` en la consola devuelve el embudo contado **en ese
dispositivo** (no se envía nada a ningún servidor):

```
visita → perfil_completado → medida_abierta → share_medida
       → apoyo_abierto:<origen> → apoyo_click:<via>:<origen>
       → newsletter_click:<origen>
```

Si `visita` es alto y `perfil_completado` bajo, el problema es el perfil.
Si `perfil_completado` es alto y `apoyo_abierto` bajo, el problema es el pedido.
Si todo es bajo, el problema es alcance — y ahí el que trabaja es el SEO
(`tools/gen-static.mjs`), no el botón de apoyo.
