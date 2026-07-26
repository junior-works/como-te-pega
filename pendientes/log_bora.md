# log_bora — registro de barridos del Boletín Oficial

Este archivo es el **estado del loop**. Dice hasta qué fecha ya se revisó el BORA,
para que el próximo barrido arranque desde ahí y no reprocese lo mismo.

- Formato de cada entrada: `- YYYY-MM-DD → YYYY-MM-DD | N candidatas | nota`
- El ciclo `ctp-semanal` **lee la última línea de estado** para saber el `desde`.
- El ciclo **añade una línea nueva al final** cuando termina (nunca borra historial).

---

## Estado actual

**procesado hasta 2026-07-27**
**última medida cargada:** `ley_modernizacion_laboral_27802`
**último aviso relevante visto:** Decreto 612/2026 (BORA 20/07/2026, actualización de la Ley 27.802)
**borradores pendientes de tu aprobación (6):** `decreto_bono_previsional_399`, `decreto_formalizacion_laboral_315`, `res_enrege_40_tarifas_gas`, `bcra_a8417_cambiario`, `decreto_retenciones_agro_423`, `res_704_privatizacion_aysa`
**candidatas anotadas sin borrador (7):** ver candidatas.md (penal juvenil, aduana factoría, Belgrano Cargas, descuentos APN, free shops, jueces Corte, ampliación presupuesto)
**criterio afinado:** revisiones tarifarias quinquenales / cuadros completos = candidatas (solo se excluyen ajustes mensuales por fórmula); licitación de venta de servicios a la gente = candidata

---

## Historial de barridos

<!-- El ciclo agrega acá una línea por ejecución. Ejemplo del formato:
- 2026-03-06 → 2026-07-24 | 3 candidatas | borradores C-0001..C-0003, notificado
-->

- 2026-03-06 → 2026-07-24 | 2 candidatas | C-0001 decreto_bono_previsional_399, C-0002 decreto_formalizacion_laboral_315; Decreto 612/2026 marcado como update de 27802; notificado por ntfy
- 2026-07-24 (suplementario) | +4 borradores +7 anotadas | criterio tarifario afinado; recuperadas del barrido manual previo: C-0003 gas RQT, C-0004 BCRA A8417, C-0005 retenciones agro, C-0006 AySA; 7 anotadas sin borrador; auditoría OK; notificado por ntfy
- 2026-07-24 (correcciones) | C-0004 area 'otros'→'cambiario' (existe en DB); C-0005 modelado alineado a las 3 fichas de retenciones existentes + area 'agroindustria'→'agro'; patron-medida.md §2 documenta front vs DB y tags sueltos; re-auditoría OK; notificado por ntfy
- 2026-07-24 (corrección final C-0005) | area revertida 'agro'→'agroindustria': las 3 fichas hermanas de retenciones usan 'agroindustria'; 'agro' lo usa solo dnu70_alquileres_tierras_rurales (otro tema). patron-medida.md §2 documenta la coexistencia agro/agroindustria

- 2026-07-24 (integración) | 6 aprobadas | fix bug asistencia-array en C-0001/C-0003 (re-auditado por comportamiento); C-0003 desc +nota distribuidoras espejo; 6 objetos integrados a js/medidas-base.js (75→81, node --check + import runtime OK, sin ids duplicados); migración única migrations/add_tanda_reactivacion.sql (6 INSERT medidas + 6 parametros + 2 SELECT COUNT, total_medidas esperado=81). SIN commit / SIN carga en Supabase todavía.
- 2026-07-25 → 2026-07-27 | 0 candidatas | ventana chica (sáb+dom sin BORA; lun 27/07 solo Decreto 615/2026 designación juez CNAT → excluido); sin borradores nuevos; notificado por ntfy

## Notas de infraestructura (android / TWA)

- **assetlinks verificado (2026-07-24):** el Digital Asset Links publicado y activo vive en el repo
  `junior-works.github.io` en la **raíz del dominio** (`https://junior-works.github.io/.well-known/assetlinks.json`),
  firmado con el **certificado de Google Play App Signing** (SHA-256 `77:4F:44:DC:…:2E:6E`) e incluye
  también `com.juniorworks.pensandote`. El `android/assetlinks.json` local era un artefacto viejo con
  la clave de **subida** (`F5:EF:7B:…:56:81`) → **eliminado** para no confundir.
- **Tarea futura:** `android/setup-twa.js` quedó SIN commitear porque hardcodea rutas absolutas
  (`C:\Users\perro\AppData\Roaming\npm\…`) e identidad de firma personal. Des-hardcodear las rutas
  (hacerlo portable) antes de versionarlo. No contiene secretos (las passwords se generan en runtime).

## Pendiente para el próximo ciclo

- **Cargar la tanda en Supabase:** pegar `migrations/add_tanda_reactivacion.sql` en el SQL Editor;
  confirmar que `total_medidas` = 81. Recién ahí: commit de medidas-base.js + migración + bump de versión.
- **Decreto 612/2026** (contribuciones sindicales): preparar el **diff de parámetros** sobre la ficha
  `ley_modernizacion_laboral_27802` (base de cálculo del aporte sindical, destino y administración de fondos).
- **7 candidatas anotadas:** en espera, NO redactar borradores todavía (decisión editorial pendiente).
