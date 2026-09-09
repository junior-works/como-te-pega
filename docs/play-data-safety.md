# Google Play — Declaración de Seguridad de los datos (Data safety)

Respuestas listas para copiar en Play Console → **Política** → *Seguridad de los datos*.
Google la exige aunque la app no recolecte nada, y una declaración incompleta o
inexacta puede frenar la publicación.

> Regla que ordena todo lo de abajo: **el perfil de la persona no sale de su
> dispositivo.** Vive en `localStorage`. No viaja a Supabase, no viaja al hosting, no
> viaja a nosotros. Lo único que sale del dispositivo son pedidos de *lectura* del
> catálogo público de medidas.

## 1. Recopilación y uso de datos

| Pregunta de Play | Respuesta | Por qué |
|---|---|---|
| ¿Tu app recopila o comparte alguno de los tipos de datos requeridos? | **No** | El perfil es local. Ningún dato del usuario se transmite. |
| ¿Se cifran los datos en tránsito? | **Sí** | Todo va por HTTPS (GitHub Pages y Supabase). |
| ¿Los usuarios pueden solicitar la eliminación de sus datos? | **Sí** | Botón «Borrar mis datos de este dispositivo» en *Tus datos*. Como todo es local, el borrado es inmediato y total. |

**Ojo con la trampa habitual:** Play distingue *recopilar* (los datos salen del
dispositivo) de *acceder* (se usan solo en el aparato). Cómo Te Pega **accede** a las
respuestas del perfil para calcular el impacto, pero **no las recopila**. Por eso la
respuesta correcta es No.

## 2. Tipos de datos: ninguno para marcar

Repasado uno por uno para dejar constancia de que se miró:

- **Ubicación** — no. Se pregunta la zona (CABA, GBA Sur…) como opción de una lista;
  no se usa GPS ni IP para geolocalizar, y la respuesta no sale del dispositivo.
- **Información personal** — no. No hay nombre, mail, teléfono, dirección ni documento.
  El aporte por Cafecito o transferencia ocurre **fuera de la app**, en el navegador o
  en la app del banco.
- **Información financiera** — no. La app no procesa pagos ni guarda datos de tarjeta.
  Solo muestra un alias para transferir y links externos.
- **Salud y forma física** — no se recopila. Se pregunta cobertura (PAMI, prepaga,
  hospital público) y si hay discapacidad en la familia; es local y no sale.
- **Mensajes, fotos, archivos, contactos, calendario** — no se accede.
- **Actividad en apps** — no. Los contadores de uso (`ctp.metrics`) quedan en
  `localStorage` y no se envían a ningún servidor.
- **ID del dispositivo o identificadores** — no. No hay ID de publicidad, ni
  analytics de terceros, ni cookies de seguimiento.

## 3. Prácticas de seguridad

- Datos cifrados en tránsito: **sí** (HTTPS en todos los orígenes).
- Mecanismo para pedir la eliminación de datos: **sí** (borrado local en la app).
- La app **no** usa SDK de publicidad, ni analytics de terceros, ni redes sociales.

## 4. Enlace a la política de privacidad

`https://comotepega.com/privacy.html`

Está enlazada además desde el pie de la app.

## 5. Servicios de terceros que sí intervienen (aunque no recolecten del usuario)

Se documentan acá para que la declaración no quede incompleta si Play pregunta:

| Servicio | Para qué | Qué datos del usuario recibe |
|---|---|---|
| GitHub Pages | Hosting del sitio que la app carga | Los propios de servir una web (IP, user-agent), en sus logs. Ninguno del perfil. |
| Supabase | Catálogo público de medidas, solo lectura con clave publicable y RLS | Ninguno del perfil. La app solo hace `GET` del catálogo. |
| Cafecito / Mercado Pago | Aporte voluntario | Nada desde la app: son links y un alias. La transacción pasa por fuera. |

## 6. Antes de enviar

- [ ] Verificar que la política de privacidad esté accesible y actualizada.
- [ ] Confirmar que sigue sin haber SDK de analytics ni publicidad.
- [ ] Si algún día las métricas dejan de ser locales y se envían a un servidor,
      **esta declaración deja de ser cierta** y hay que rehacerla antes de publicar.

---

## Estado en Play Console (09/09/2026)

Verificado en *Contenido de la app*: **10 declaraciones completadas** (última
modificación 6 jun 2026), incluida **Seguridad de los datos**. La pestaña
*Requiere atención* está vacía: no hay nada pendiente.

Lo único que hubo que corregir tras mudar el dominio fue la **URL de la política
de privacidad**, que seguía apuntando a `junior-works.github.io`. Se cambió a
`https://comotepega.com/privacy.html` y se envió a revisión junto con la
versión 6 (1.6.0).

> Recordatorio para el futuro: cada vez que cambie el dominio hay que revisar
> esta URL en Play Console. No se actualiza sola y una política inaccesible es
> motivo de rechazo.
