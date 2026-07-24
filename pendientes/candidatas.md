# candidatas — medidas detectadas pendientes de tu decisión editorial

Cada fila es una medida que el barrido detectó como relevante para la ciudadanía.
El loop **nunca decide por vos**: solo detecta, redacta el borrador y lo deja acá
listo para que vos apruebes, edites o descartes.

## Estados de una candidata

| Estado        | Significado                                                        |
|---------------|-------------------------------------------------------------------|
| `borrador`    | Detectada + ficha redactada + auditoría OK. Esperando tu revisión. |
| `aprobada`    | Vos la revisaste y la querés publicar (lo hacés vos, no el loop).  |
| `descartada`  | Vos decidiste que no va (con motivo).                              |
| `dudosa`      | Detectada pero la auditoría falló o falta info. No hay borrador.   |

## Cómo trabajás esto

1. Abrís el borrador en `pendientes/borradores/<id>.md`.
2. Si te sirve → aplicás vos el objeto JS a `js/medidas-base.js` y corrés el SQL.
3. Marcás la fila como `aprobada` o `descartada` acá.

---

## Candidatas

> **Estado tanda 2026-07-24:** las 6 (C-0001…C-0006) fueron **APROBADAS** e integradas:
> objetos agregados a `js/medidas-base.js` (81 medidas, node --check OK) + migración única
> `migrations/add_tanda_reactivacion.sql` lista para pegar en el SQL Editor de Supabase
> (`total_medidas` esperado = 81). **Falta:** correr el SQL en Supabase y recién ahí commitear + bumpear versión.

| # | id propuesto | título | area | fecha BORA | estado | borrador |
|---|--------------|--------|------|-----------|--------|----------|
| C-0001 | `decreto_bono_previsional_399` | Bono extraordinario jubilados/pensionados (Decreto 399/2026) | previsional | 2026-05-29 | aprobada | [decreto_bono_previsional_399.md](borradores/decreto_bono_previsional_399.md) |
| C-0002 | `decreto_formalizacion_laboral_315` | Incentivo a contratar desempleados — RIFL (Decreto 315/2026) | laboral | 2026-05-04 | aprobada | [decreto_formalizacion_laboral_315.md](borradores/decreto_formalizacion_laboral_315.md) |
| C-0003 | `res_enrege_40_tarifas_gas` | Cuadros tarifarios de gas — RQT 2025-2030 (Res. 40/2026 ENReGE) | energia | 2026-05-29 | aprobada | [res_enrege_40_tarifas_gas.md](borradores/res_enrege_40_tarifas_gas.md) |
| C-0004 | `bcra_a8417_cambiario` | Flexibilización cambiaria personas humanas (Com. BCRA "A" 8417) | cambiario | 2026-04-13 | aprobada | [bcra_a8417_cambiario.md](borradores/bcra_a8417_cambiario.md) |
| C-0005 | `decreto_retenciones_agro_423` | Cronograma de baja de retenciones al agro (Decreto 423/2026) | agroindustria | 2026-06-03 | aprobada | [decreto_retenciones_agro_423.md](borradores/decreto_retenciones_agro_423.md) |
| C-0006 | `res_704_privatizacion_aysa` | Venta del 90% de AySA (Res. 704/2026 Economía) | privatizaciones | 2026-05-15 | aprobada | [res_704_privatizacion_aysa.md](borradores/res_704_privatizacion_aysa.md) |

### Candidatas anotadas (verificadas en barrido manual previo — sin borrador todavía)

Pendientes de priorización tuya para redactar ficha en un próximo ciclo:

| id sugerido | medida | area | fecha BORA |
|---|---|---|---|
| `ley_penal_juvenil_27801` | Ley 27.801 — régimen penal juvenil | otros | 2026-03-09 |
| `dnu_252_aduana_factoria` | DNU 252/2026 — régimen de aduana en factoría | comercio_exterior | 2026-04-17 |
| `decreto_282_belgrano_cargas` | Decreto 282/2026 — Belgrano Cargas (ferrocarril) | transporte | 2026-04-28 |
| `decreto_352_descuentos_apn` | Decreto 352/2026 — descuentos en la Administración Pública Nacional | otros | 2026-05-15 |
| `decreto_438_free_shops_frontera` | Decreto 438/2026 — free shops en frontera | comercio_exterior | 2026-06-10 |
| `decreto_467_seleccion_jueces_corte` | Decreto 467/2026 — selección de jueces de la Corte | otros | 2026-06-16 |
| `decreto_594_ampliacion_presupuesto` | Decreto 594/2026 — ampliación presupuestaria | fiscal | 2026-07-16 |

> ⚠️ Las áreas sugeridas para las anotadas son tentativas y deben confirmarse contra el
> vocabulario cerrado (§2 del patrón) al redactar. `ley_penal_juvenil` y `selección de jueces`
> no encajan claramente en las 14 áreas → probablemente `otros`, revisar al hacer la ficha.

### Notas del barrido 2026-03-06 → 2026-07-24

- **Decreto 612/2026** (BORA 20/07, contribuciones sindicales) → **no es ficha nueva**: reglamenta
  la Ley 27.802 ya cargada. Sugerido como *actualización de parámetros* de `ley_modernizacion_laboral_27802`
  (base de cálculo del aporte sindical, destino y administración de fondos). Pendiente de tu decisión.
- **Resolución 26/2026 Transporte** (BORA 11/05) → excluida: es apertura de participación ciudadana
  para *futuros* cuadros tarifarios, no un cambio de tarifa. Revisar si sale la resolución tarifaria definitiva.
- **Resoluciones ENRE/ENARGAS** (varias, mar–jul 2026) → ajustes tarifarios mensuales de rutina;
  no ameritan ficha propia salvo cambio estructural. Vigilar.
- **Ciudadanía por inversión** (Decretos 366/2025 y 524/2025) → fuera de ventana (2025).
