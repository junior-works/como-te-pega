# Mantenimiento CTP — 1 de octubre de 2026

## Fuentes oficiales revisadas

- Decreto 1126/2026, BORA 30/09/2026, artículos 1 a 3: extiende el tramo parcial de los impuestos a los combustibles hasta el 31/10/2026 y difiere el remanente al 01/11/2026. Fuente: https://www.boletinoficial.gob.ar/detalleAviso/primera/348227/20260930
- Resolución ANSES 284/2026, BORA 23/09/2026, vigente para octubre de 2026: movilidad 1,66%; haber mínimo $435.748,51; haber máximo $2.932.174,85; PBU $199.335,05; PUAM $348.598,81. Fuente: https://www.boletinoficial.gob.ar/detalleAviso/primera/347832/20260923
- Decreto 1108/2026, BORA 28/09/2026: bono previsional de octubre de hasta $70.000. Fuente: https://www.boletinoficial.gob.ar/detalleAviso/primera/348024/20260928
- Resolución 272/2026 de la Secretaría de Energía, BORA 01/10/2026, artículos 1 a 8: para octubre fija 200 kWh mensuales de consumo base de electricidad para hogares SEF, 25% de bonificación adicional en electricidad, 50% de bonificación general en gas por redes y 24,25% adicional en gas. Vigente desde su publicación. Fuente: https://www.boletinoficial.gob.ar/detalleAviso/primera/348360/20261001

## Cambios aplicados

- Actualizada la ficha `decreto_combustibles_impuesto_693` en reglas locales y Supabase.
- Actualizada la ficha `jubilaciones` con los importes oficiales de octubre; los parámetros numéricos se guardaron en Supabase.
- Actualizada la ficha `subsidios_energeticos` con la Resolución 272/2026. La regla local solo reconoce SEF cuando el perfil lo declara expresamente; se eliminaron inferencias automáticas por tramo de ingreso y multiplicadores sin respaldo vigente. Los cuatro parámetros de octubre se guardaron en Supabase.
- Regeneradas las 89 páginas estáticas y el sitemap.
- Incrementado el caché web a `ctp-shell-v1.8.12`.

## Normas revisadas que no se incorporaron

- Decreto 1128/2026: vigente desde 01/10/2026, fija derechos de importación para determinados vehículos de movilidad sustentable. CTP no captura una intención de compra ni la posición arancelaria del vehículo, por lo que no puede modelarlo sin inventar un impacto. Fuente: https://www.boletinoficial.gob.ar/detalleAviso/primera/348228/20260930
- Resolución ANSES 283/2026: actualización mensual de asignaciones familiares. No existe una ficha específica ni datos suficientes en el perfil para atribuir un monto; no se creó una medida nueva. Fuente: https://www.boletinoficial.gob.ar/detalleAviso/primera/347831/20260923
- Resolución General ARCA 5907/2026: reglamenta la declaración y el pago del Fondo de Asistencia Laboral, pero su artículo 19 fija la entrada en vigencia para el 01/11/2026. Queda fuera de la app hasta que esté vigente. Fuente: https://www.boletinoficial.gob.ar/detalleAviso/primera/348365/20261001
- Resoluciones 269 y 270/2026 de la Secretaría de Energía: fijan precios mayoristas de biodiésel y bioetanol para octubre. No se atribuye un traslado automático al surtidor porque la norma no fija ese efecto final. Fuentes: https://www.boletinoficial.gob.ar/detalleAviso/primera/348357/20261001 y https://www.boletinoficial.gob.ar/detalleAviso/primera/348358/20261001

## Verificación

- Importación completa de `medidas-base.js`: 89 medidas y 89 identificadores únicos.
- Regresión: 10/10 pruebas aprobadas.
- Páginas estáticas: 89 generadas.
- Supabase: proyecto verificado `nqwnanfdpaesojuyaztm`; fichas y parámetros consultados después de la escritura.
- Documentación y changelog actuales de Supabase revisados antes de escribir. No hubo cambios de esquema, RLS, autenticación, claves ni permisos.
