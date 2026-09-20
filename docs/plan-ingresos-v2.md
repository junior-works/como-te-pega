# Plan de ingresos v2 — del proyecto gratuito a los primeros €100

**Fecha:** 21 de septiembre de 2026  
**Objetivo de 30 días:** cobrar los primeros **€100 equivalentes**, sin publicidad paga y sin construir un producto nuevo.  
**Objetivo de 60 días:** llegar a **€100 mensuales recurrentes** o demostrar con pagos reales que hay que cambiar de cliente u oferta.

Este plan reemplaza la lógica de “preguntar si alguien pagaría” por una prueba más exigente: **ofrecer un piloto concreto, cobrarlo y entregarlo manualmente**. Las cifras de precios, respuestas y conversiones son hipótesis hasta que haya ventas.

---

## Estado actualizado después de la v1.8.8

El commit `5ff4dfd` completó dos activos que este plan daba por pendientes:

| Activo | Estado | Para qué sirve ahora |
|---|---|---|
| `/semanal/` con cinco ediciones | Terminado | SEO, prueba de constancia y muestra editorial |
| `/prensa/` | Terminado | Credibilidad, citas y distribución ganada |
| Sitemap de ambas secciones | Terminado | Facilitar el descubrimiento por buscadores |
| Lista y formulario de correo | **Pendiente** | Convertir lectores anónimos en audiencia propia |
| Oferta y muestra profesional | Preparada en `/profesionales/` | Convertir interés en una conversación de venta; falta publicar |
| Medición agregada | **Pendiente** | Saber qué canal y llamada convierten |

La v1.8.8 **no completa todavía la captación**. Los botones de `/semanal/` llevan a `/#newsletter`, pero el bloque no se renderiza mientras `NEWSLETTER.url` siga vacío. Para el lector, hoy esa llamada termina en un callejón sin salida.

Lo construido sí cambia el orden de trabajo: no hay que volver a crear un archivo ni un dossier de prensa. Hay que conectar la captura de correo, producir la muestra comercial y distribuir esos activos con un objetivo medible.

---

## 1. Diagnóstico: por qué todavía no entró dinero

El plan anterior acertaba en dos cosas: no depender solamente de donaciones y no construir un producto pago antes de validarlo. Pero tenía cinco problemas:

1. **Validaba opiniones, no compras.** Que cinco personas digan “sí, pagaría” no demuestra que paguen cuando reciben un enlace de cobro.
2. **El producto era demasiado grande para la primera venta.** “CTP Profesional” implicaba desarrollo antes de saber qué parte concreta ahorra tiempo.
3. **El público pago era demasiado amplio.** Contadores, sindicatos, cámaras y consultoras tienen necesidades, lenguaje y procesos de compra distintos.
4. **El precio de $10.000 era arbitrario.** No surgía de una prueba ni estaba atado al valor entregado.
5. **No existe un embudo medible.** Los eventos de la app se guardan solamente en `localStorage`; no permiten saber cuántas personas completan el perfil, leen una medida, comparten, llegan al apoyo o abandonan.

La parte editorial ya mejoró: hay **cinco ediciones reales** publicadas, una edición de referencia y una página específica para medios. Sin embargo, la newsletter sigue invisible dentro de la app porque `NEWSLETTER.url` está vacío. El contenido demuestra que el producto existe, pero todavía no puede transformar a un lector en suscriptor.

La conclusión es simple: **hoy CTP tiene producto y contenido, pero todavía no tiene sistema de adquisición, contacto ni venta**.

---

## 2. El modelo: dos motores con trabajos distintos

### Motor A — ingresos rápidos: servicio profesional manual

No se desarrolla una plataforma premium. Se vende primero un servicio acotado:

## CTP Alerta Profesional — piloto fundador de 4 semanas

Para estudios contables pequeños que pierden tiempo leyendo normas y explicando cambios a sus clientes.

Incluye:

- un resumen semanal de medidas **ya vigentes**, con fuente oficial y fecha;
- qué segmentos de sus clientes podrían verse afectados;
- una versión breve, clara y reenviable por WhatsApp o correo;
- una versión con el nombre o logotipo del estudio;
- enlaces a las fuentes para que el profesional pueda verificar todo;
- una conversación inicial de 20 minutos para elegir los segmentos relevantes.

No incluye asesoramiento contable, legal ni fiscal. CTP resume y organiza información pública; el profesional conserva la responsabilidad sobre el consejo que da a sus clientes.

La entrega inicial es manual, usando el trabajo editorial que ya existe. Si nadie compra, no se programa nada. Si compran y renuevan, recién entonces se automatiza lo repetitivo.

### Motor B — audiencia propia: newsletter pública gratuita

La newsletter no es el ingreso inmediato. Su función es:

- recuperar a quien visita la app y hoy se va sin dejar contacto;
- crear una audiencia que no dependa de Instagram o Google;
- demostrar constancia y rigor;
- llevar lectores hacia la app, los aportes voluntarios y futuras ofertas profesionales.

Para empezar sin costo, la opción recomendada es **Brevo**: su plan gratuito permite 300 envíos diarios, incluye formularios y admite doble confirmación. Es suficiente para validar los primeros cientos de registros sin asumir un gasto fijo. La afirmación anterior de que Buttondown o MailerLite eran gratuitos “hasta miles” ya no es válida: Buttondown cubre los primeros 100 suscriptores y MailerLite limita su plan gratuito a 250.

Fuentes oficiales: [plan gratuito de Brevo](https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans), [formularios de registro](https://help.brevo.com/hc/en-us/articles/208771869-Create-a-sign-up-form-in-Brevo), [doble confirmación](https://help.brevo.com/hc/en-us/articles/208733449-Double-opt-in-DOI-What-it-is-and-how-to-track-user-sign-ups), [precios de Buttondown](https://www.buttondown.com/pricing) y [precios de MailerLite](https://www.mailerlite.com/pricing).

---

## 3. La primera oferta y su precio

El precio no se presenta como definitivo. Se prueban dos niveles con la misma entrega central:

| Oferta | Hipótesis de precio | Para quién | Qué incluye |
|---|---:|---|---|
| Piloto individual | equivalente en pesos a **€15** | contador independiente | 4 entregas y versión reenviable |
| Piloto estudio | equivalente en pesos a **€30** | estudio con varios clientes | lo anterior + marca del estudio + hasta 3 segmentos |

El importe en pesos se fija al enviar la propuesta y se mantiene durante siete días. No se cambia después de que el prospecto acepta.

**Meta de primera caja:** por ejemplo, dos estudios a €30 y tres profesionales a €15 producen €105 equivalentes. No es todavía ingreso recurrente: es la prueba de que alguien paga por el resultado.

El cobro del servicio profesional debe ir a la cuenta argentina elegida y mantenerse separado del bloque de donaciones de la app. Antes de cobrar a empresas o profesionales, se debe confirmar con un contador cómo documentar correctamente la operación. Cafecito, Ko-fi y el texto de “aporte voluntario” no deben presentarse como si compraran este servicio.

---

## 4. El cliente inicial: uno solo durante 30 días

El primer segmento será:

> **Contadores independientes y estudios contables pequeños de Argentina que atienden monotributistas, comercios y PyMEs.**

Se elige porque tienen que traducir cambios públicos para varias personas y pueden ahorrar tiempo reutilizando una explicación. Esto sigue siendo una hipótesis y se valida con pagos.

Durante esta prueba no se mezcla el mensaje con sindicatos, cámaras, consultoras ni periodistas.

- **Periodistas:** distribución y credibilidad; reciben gratuitamente un resumen verificable cuando haya una medida relevante.
- **Cámaras y sindicatos:** segunda prueba posible si los contadores no compran o después de estabilizar la primera oferta.
- **Público general:** usa la app y recibe la newsletter gratis; puede apoyar voluntariamente, pero no es la fuente prevista de los primeros €100.

---

## 5. Plan de ejecución de 30 días

### Días 1 a 3 — dejar listo el camino de conversión

1. Crear la lista y el formulario en Brevo con doble confirmación.
2. Completar `NEWSLETTER.url`, regenerar `/semanal/` si hace falta y comprobar el alta completa —incluido el correo de confirmación— desde móvil y escritorio.
3. Sustituir el actual callejón `/#newsletter` por un formulario o destino que funcione incluso si el JavaScript de la app falla.
4. ~~Preparar una muestra gratuita de **CTP Alerta Profesional** a partir de una medida vigente y relevante para monotributistas o PyMEs.~~ Preparada con el Decreto 315/2026 (RIFL).
5. ~~Crear una página sencilla de la oferta, con muestra, alcance, precio del piloto, cinco cupos y un único llamado a conversar o reservar.~~ Preparada en `/profesionales/`, con pilotos de $25.000 y $50.000 ARS.
6. Publicar y comprobar `/profesionales/` en el dominio.
7. Definir el medio de cobro argentino y el comprobante correspondiente antes de enviar la primera propuesta.

Ya están terminados y no se repiten: el archivo de cinco ediciones, la corrección del dominio, las páginas indexables, el sitemap y la página de prensa.

### Días 4 a 10 — conseguir conversaciones

- Armar una lista manual de 30 prospectos reales.
- Contactar **cinco por día**, de forma personalizada; no enviar mensajes masivos idénticos.
- Priorizar perfiles con evidencia de que comunican novedades a clientes: publicaciones propias, newsletter, WhatsApp empresarial o una sección de novedades.
- Enviar la muestra en el primer contacto o cuando responden; no pedir una reunión sin mostrar valor.
- Registrar: persona, estudio, fecha, canal, respuesta, objeción, siguiente paso y resultado de cobro.

Mensaje base:

> Hola, [nombre]. Estoy probando CTP Alerta Profesional para estudios que necesitan explicar cambios vigentes sin mandarles a sus clientes un texto técnico. Te dejo una muestra hecha solamente con fuentes oficiales. Durante cuatro semanas preparo una versión semanal reenviable con tu marca y los segmentos que atendés. El piloto fundador cuesta [importe fijo] y hay cinco lugares. ¿Te sirve que te muestre en 15 minutos cómo quedaría para tus clientes?

Seguimiento, 3 o 4 días después:

> Hola, [nombre]. Te escribo una sola vez más por la muestra de CTP. Quería saber si este formato te ahorraría trabajo real al comunicar cambios a tus clientes. Si el problema no existe en tu estudio, también me sirve saberlo y no vuelvo a molestarte.

### Días 11 a 14 — cerrar, no seguir “validando” eternamente

- Ofrecer el piloto con precio y fecha de inicio concretos.
- Cobrar antes de personalizar las cuatro entregas.
- No reservar cupos sobre la base de un “más adelante”.
- Registrar las palabras exactas de cada objeción: precio, falta de necesidad, confianza, frecuencia, tema o formato.

**Semáforo correcto:**

| Resultado después de 30 contactos personalizados | Decisión |
|---|---|
| 3 o más pagos | Entregar el piloto y preparar renovación |
| 1 o 2 pagos | Entregar, entrevistar y corregir oferta o precio |
| 0 pagos pero 5+ conversaciones | Cambiar la oferta antes que el segmento |
| 0 pagos y menos de 5 conversaciones | Cambiar lista, mensaje o canal; todavía no se evaluó la demanda |

### Días 15 a 30 — entregar y convertir a mensual

- Entregar en el mismo día y formato cada semana.
- Después de la segunda entrega preguntar qué parte usó realmente el cliente.
- Pedir un testimonio únicamente si hubo uso real y con permiso explícito.
- En la cuarta semana ofrecer continuidad mensual.
- Construir software solamente para las tareas repetidas por clientes pagos.

La meta al día 30 es **€100 cobrados en pilotos**. La meta al día 60 es **€100 mensuales recurrentes**, con renovaciones reales.

---

## 6. Contenido y distribución: cada pieza tiene un destino

Instagram no se publica “para mover la cuenta”. Cada contenido debe conducir a una acción:

| Tipo de contenido | Objetivo | Llamado principal |
|---|---|---|
| Medida vigente explicada | alcance argentino cualificado | “Probá cómo te pega” |
| Caso cotidiano dentro de la app | activación | “Armá tu perfil gratis” |
| Resumen semanal | captación propia | “Recibilo por mail” |
| Método y fuentes | confianza | “Mirá cómo verificamos” |
| Detrás de una actualización | credibilidad | “Seguinos para la próxima medida” |

Distribución semanal mínima:

- 2 piezas sobre medidas vigentes y actuales;
- 1 demostración del producto en un caso concreto;
- 1 resumen o pieza de metodología;
- 5 interacciones diarias, genuinas y relevantes, con cuentas argentinas del segmento;
- contacto editorial con periodistas solamente cuando exista un dato nuevo, verificable y útil.

### Cómo usar `/prensa/` sin confundir difusión con ventas

La página de prensa es aplicable y valiosa, pero no es una campaña por sí sola. Se utiliza así:

1. elegir una medida vigente con un contraste claro entre perfiles;
2. escribir a periodistas concretos que cubren ese tema, no a redacciones genéricas;
3. abrir el mensaje con el dato o contraste, no con una presentación de CTP;
4. enlazar la ficha de la medida y `/prensa/` como respaldo metodológico;
5. identificar cada enlace con campaña y destinatario para medir visitas referidas;
6. registrar respuesta, cita publicada, enlace conseguido y suscripciones posteriores.

El ranking de “medidas que más dividen” y el ejemplo del DNU 70 son buenos ganchos periodísticos. Para vender a contadores, en cambio, conviene mostrar una norma directamente relacionada con sus clientes y el mensaje reenviable que les ahorra trabajo. El mismo activo no debe forzarse para dos públicos distintos.

La regla editorial no cambia: ninguna cifra sin fuente y fecha, ninguna estimación presentada como norma, lenguaje neutral y separación clara entre lo aprobado, lo vigente y lo estimado.

---

## 7. Donaciones: complemento, no plan de supervivencia

Los aportes voluntarios continúan, pero no deben ser el objetivo financiero del primer mes. Se mejora su conversión de tres formas:

1. pedir apoyo después de que la persona recibió un resultado útil, no antes;
2. explicar de forma concreta que el aporte sostiene la revisión, actualización y publicación gratuita;
3. mostrar primero Cafecito o transferencia a visitantes de Argentina y dejar Ko-fi como alternativa para el exterior.

No se promete contenido, prioridad ni funciones a cambio. Si hay un servicio profesional pago, se vende por un flujo distinto y con otra comunicación.

---

## 8. Medición mínima antes de escalar

Los contadores actuales de `localStorage` sirven para una persona, pero no para dirigir el proyecto. Hace falta medición agregada, mínima y sin guardar el perfil personal.

Eventos necesarios:

- visita de entrada;
- perfil iniciado y perfil completado;
- medida abierta;
- tarjeta compartida o descargada;
- clic hacia la newsletter;
- alta confirmada en la plataforma de correo;
- apoyo abierto y clic en cada medio;
- visita a la oferta profesional;
- solicitud de conversación;
- piloto cobrado y renovación.

Si se usa Supabase para los eventos, debe existir una tabla separada, sin respuestas del perfil ni correo, con RLS habilitado y una política limitada a inserciones válidas. Antes de implementarlo hay que actualizar la política de privacidad y verificar el flujo. No se expone ninguna clave privilegiada en el navegador.

Tablero semanal:

| Área | Indicador principal |
|---|---|
| Producto gratuito | perfiles completados / visitas |
| Contenido | visitas argentinas cualificadas, no reproducciones totales |
| Newsletter | altas confirmadas / clics al formulario |
| Venta | pagos / conversaciones y pagos / 30 contactos |
| Ingreso | euros equivalentes cobrados y mensualidad renovada |
| Donaciones | aportes / personas que vieron el pedido |

Las vistas, “me gusta” y seguidores son señales secundarias. No reemplazan suscriptores, uso ni pagos.

---

## 9. Activos que hay que producir, y nada más

1. Formulario de newsletter y correo de bienvenida.
2. Una muestra profesional de dos páginas.
3. Una página de venta breve para el piloto.
4. Una lista de 30 contadores o estudios pertinentes.
5. Una lista inicial de periodistas segmentados por tema, usando `/prensa/` como respaldo.
6. Un registro simple de contactos, conversaciones, menciones y cobros.
7. Un tablero de métricas agregadas.

Ya existen y se reutilizan: `/semanal/`, sus cinco ediciones y `/prensa/`.

Hasta cobrar los primeros pilotos no se crea un panel profesional, una app separada, una membresía, una automatización compleja ni publicidad paga.

---

## 10. Criterios para decidir sin autoengañarnos

- **Hay negocio inicial:** al menos 3 prospectos pagan y 2 renuevan.
- **Hay valor pero la oferta falla:** pagan 1 o 2, usan el material y describen un problema claro. Se corrige el alcance o precio.
- **No hay evidencia todavía:** nadie compra porque casi nadie respondió. Se mejora adquisición; no se concluye que el producto no sirve.
- **No hay negocio en el segmento:** hubo al menos 5 conversaciones serias después de 30 contactos pertinentes, la muestra se entendió y aun así nadie pagó. Se prueba un segundo segmento sin desarrollar software.
- **Hay crecimiento orgánico útil:** aumentan altas confirmadas, perfiles completados y tráfico argentino. El alcance extranjero o accidental no cuenta como progreso comercial.

---

## Decisión recomendada

Durante los próximos 30 días, CTP debe operar como dos productos conectados:

- **Cómo Te Pega**, público, gratuito y completo, para generar utilidad, confianza y audiencia propia.
- **CTP Alerta Profesional**, manual y pago, para demostrar que el rigor editorial también ahorra tiempo a un profesional.

La prioridad no es conseguir miles de seguidores ni programar otra función. Es conseguir **la primera persona que reciba una propuesta concreta, pague y use la entrega**. Ese pago enseña más que cien respuestas favorables y define qué vale la pena construir.
