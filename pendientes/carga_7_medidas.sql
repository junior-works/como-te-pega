-- Cómo Te Pega — carga de 7 medidas nuevas (jul–sep 2026)
-- Generado 2026-09-09. Idempotente: si la medida ya existe, no la duplica.

BEGIN;

-- ================= decreto_bono_previsional_agosto_686 =================
INSERT INTO medidas (
  id, fecha_bora, tipo_norma, numero, titulo, descripcion, area, tags,
  vigente, estado, fuente_url, fuente_descripcion, analisis_listo
) VALUES (
  'decreto_bono_previsional_agosto_686',
  '2026-07-30',
  'Decreto',
  '686/2026',
  'Bono extraordinario para jubilados y pensionados (agosto 2026)',
  'Otorga un bono extraordinario previsional de hasta $70.000 en el haber de agosto de 2026, completo para quienes cobran hasta el haber mínimo garantizado y decreciente para haberes superiores hasta el tope haber mínimo + $70.000. Es no remunerativo, no se le hacen descuentos y no modifica la fórmula de movilidad de la Ley 27.609. Alcanza a prestaciones del SIPA (Ley 24.241), PUAM y pensiones no contributivas por vejez, invalidez y madres de 7+ hijos.',
  'previsional',
  ARRAY['bono','jubilaciones','pensiones','ANSES','PUAM','movilidad','Ley 27.609'],
  true,
  'vigente',
  'https://www.boletinoficial.gob.ar/detalleAviso/primera/345137/20260730',
  'Boletín Oficial (30/07/2026); Decreto 686/2026 (DECTO-2026-686-APN-PTE), 29/07/2026',
  true
)
ON CONFLICT (id) DO NOTHING;
INSERT INTO parametros_medida (medida_id, clave, valor, unidad, fuente, fecha_valor) VALUES
  ('decreto_bono_previsional_agosto_686','bono_monto_maximo','70000','pesos','BORA Decreto 686/2026','2026-07-30'),
  ('decreto_bono_previsional_agosto_686','bono_caracter','no remunerativo, sin descuentos, no computable',NULL,'BORA Decreto 686/2026','2026-07-30'),
  ('decreto_bono_previsional_agosto_686','bono_mes_pago','2026-08',NULL,'BORA Decreto 686/2026','2026-07-30'),
  ('decreto_bono_previsional_agosto_686','bono_alcance','completo hasta el haber mínimo, decreciente hasta tope mínimo + 70000',NULL,'BORA Decreto 686/2026','2026-07-30'),
  ('decreto_bono_previsional_agosto_686','bono_frecuencia','pago por única vez',NULL,'BORA Decreto 686/2026','2026-07-30'),
  ('decreto_bono_previsional_agosto_686','beneficiarios','SIPA (Ley 24.241), PUAM, PNC (vejez, invalidez, madre 7+)',NULL,'BORA Decreto 686/2026','2026-07-30')
ON CONFLICT DO NOTHING;

-- ================= decreto_combustibles_impuesto_693 =================
INSERT INTO medidas (
  id, fecha_bora, tipo_norma, numero, titulo, descripcion, area, tags,
  vigente, estado, fuente_url, fuente_descripcion, analisis_listo
) VALUES (
  'decreto_combustibles_impuesto_693',
  '2026-07-31',
  'Decreto',
  '693/2026',
  'Impuestos a los combustibles: aumento parcial en agosto, resto en septiembre',
  'Modifica el Decreto 617/2025 y difiere parcialmente los incrementos del Impuesto sobre los Combustibles Líquidos (ICL) y del Impuesto al Dióxido de Carbono. Para hechos imponibles del 1 al 31 de agosto de 2026 se aplican incrementos parciales por litro (Nafta ICL $10,572 + CO₂ $0,648; Gasoil ICL $9,511 + CO₂ $1,084; diferencial Patagonia gasoil $5,150). Los efectos completos remanentes rigen desde 1-sep-2026. No alcanza al GNC.',
  'fiscal',
  ARRAY['combustibles','ICL','impuesto CO2','naftas','gasoil','Decreto 617/2025','Patagonia'],
  true,
  'vigente',
  'https://www.boletinoficial.gob.ar/detalleAviso/primera/345226/20260731',
  'Boletín Oficial (31/07/2026); Decreto 693/2026, modifica Decreto 617/2025',
  true
)
ON CONFLICT (id) DO NOTHING;
INSERT INTO parametros_medida (medida_id, clave, valor, unidad, fuente, fecha_valor) VALUES
  ('decreto_combustibles_impuesto_693','icl_nafta_agosto','10.572','pesos por litro','BORA Decreto 693/2026','2026-07-31'),
  ('decreto_combustibles_impuesto_693','co2_nafta_agosto','0.648','pesos por litro','BORA Decreto 693/2026','2026-07-31'),
  ('decreto_combustibles_impuesto_693','icl_gasoil_agosto','9.511','pesos por litro','BORA Decreto 693/2026','2026-07-31'),
  ('decreto_combustibles_impuesto_693','co2_gasoil_agosto','1.084','pesos por litro','BORA Decreto 693/2026','2026-07-31'),
  ('decreto_combustibles_impuesto_693','diferencial_gasoil_patagonia','5.150','pesos por litro','BORA Decreto 693/2026','2026-07-31'),
  ('decreto_combustibles_impuesto_693','vigencia_parcial','2026-08-01 a 2026-08-31',NULL,'BORA Decreto 693/2026','2026-07-31'),
  ('decreto_combustibles_impuesto_693','vigencia_completa','desde 2026-09-01',NULL,'BORA Decreto 693/2026','2026-07-31'),
  ('decreto_combustibles_impuesto_693','norma_modificada','Decreto 617/2025',NULL,'BORA Decreto 693/2026','2026-07-31')
ON CONFLICT DO NOTHING;

-- ================= res_enrege_374_tarifas_electricidad_agosto =================
INSERT INTO medidas (
  id, fecha_bora, tipo_norma, numero, titulo, descripcion, area, tags,
  vigente, estado, fuente_url, fuente_descripcion, analisis_listo
) VALUES (
  'res_enrege_374_tarifas_electricidad_agosto',
  '2026-07-31',
  'Resolución',
  '374/2026',
  'Nuevos cuadros tarifarios de electricidad (EDESUR / EDENOR, agosto 2026)',
  'El ENReGE aprueba nuevos cuadros tarifarios de distribución eléctrica de EDESUR (Res. 374/2026) y EDENOR (Res. 375/2026) con vigencia desde el 1-ago-2026. Incremento del CPD del 1,71% (0,36% base mensual + 1,35% por índices IPIM 67% + IPC 33%) respecto de julio 2026. Traslado del costo MEM de junio ($0,307/kWh) y VAD medio $63,540. Bonificación extraordinaria adicional del 16,59% para agosto para usuarios beneficiarios del régimen SEF. Aplica en el área de concesión AMBA.',
  'energia',
  ARRAY['electricidad','tarifas','EDESUR','EDENOR','ENReGE','CPD','SEF','AMBA','MEM'],
  true,
  'vigente',
  'https://www.boletinoficial.gob.ar/detalleAviso/primera/345270/20260731',
  'Boletín Oficial (31/07/2026); Res. 374/2026 ENReGE (EDESUR) y Res. 375/2026 ENReGE (EDENOR)',
  true
)
ON CONFLICT (id) DO NOTHING;
INSERT INTO parametros_medida (medida_id, clave, valor, unidad, fuente, fecha_valor) VALUES
  ('res_enrege_374_tarifas_electricidad_agosto','cpd_incremento_total','1.71','porcentaje','BORA Res. 374/2026 ENReGE','2026-07-31'),
  ('res_enrege_374_tarifas_electricidad_agosto','cpd_incremento_base','0.36','porcentaje','BORA Res. 374/2026 ENReGE','2026-07-31'),
  ('res_enrege_374_tarifas_electricidad_agosto','cpd_actualizacion_indices','1.35','porcentaje','BORA Res. 374/2026 ENReGE','2026-07-31'),
  ('res_enrege_374_tarifas_electricidad_agosto','indices_composicion','IPIM 67% + IPC 33%',NULL,'BORA Res. 374/2026 ENReGE','2026-07-31'),
  ('res_enrege_374_tarifas_electricidad_agosto','traslado_mem_junio','0.307','pesos por kWh','BORA Res. 374/2026 ENReGE','2026-07-31'),
  ('res_enrege_374_tarifas_electricidad_agosto','vad_medio','63.540','pesos','BORA Res. 374/2026 ENReGE','2026-07-31'),
  ('res_enrege_374_tarifas_electricidad_agosto','bonif_extraordinaria_sef_agosto','16.59','porcentaje','BORA Res. 374/2026 ENReGE','2026-07-31'),
  ('res_enrege_374_tarifas_electricidad_agosto','bonif_extraordinaria_tope_anual_2026','25','porcentaje','BORA Res. 374/2026 ENReGE','2026-07-31'),
  ('res_enrege_374_tarifas_electricidad_agosto','fnee','2508','pesos por MWh','BORA Res. 374/2026 ENReGE','2026-07-31'),
  ('res_enrege_374_tarifas_electricidad_agosto','vigencia_cuadro','2026-08-01',NULL,'BORA Res. 374/2026 ENReGE','2026-07-31'),
  ('res_enrege_374_tarifas_electricidad_agosto','area_concesion','AMBA (EDESUR + EDENOR)',NULL,'BORA Res. 374/2026 ENReGE','2026-07-31'),
  ('res_enrege_374_tarifas_electricidad_agosto','resolucion_espejo','Res. 375/2026 ENReGE (EDENOR)',NULL,'BORA Res. 375/2026 ENReGE','2026-07-31')
ON CONFLICT DO NOTHING;

-- ================= res_ms_cobro_extranjeros_1066 =================
INSERT INTO medidas (
  id, fecha_bora, tipo_norma, numero, titulo, descripcion, area, tags,
  vigente, estado, fuente_url, fuente_descripcion, analisis_listo
) VALUES (
  'res_ms_cobro_extranjeros_1066',
  '2026-08-11',
  'Resolución',
  '1066/2026',
  'Cobro a extranjeros no residentes por atención en hospitales nacionales',
  'Aprueba el procedimiento operativo para la atención de personas extranjeras en establecimientos sanitarios administrados por el Estado Nacional. La atención de emergencia queda garantizada sin restricción; los residentes permanentes acceden en igualdad con ciudadanos argentinos; los extranjeros sin residencia permanente deben presentar seguro de salud o abonar previamente la prestación no urgente. El profesional de salud clasifica cada caso como emergencia o atención habitual. Dos circuitos de cobro: recupero a la aseguradora (con seguro) o presupuesto y pago previo (sin seguro). Alcanza sólo a establecimientos del Estado nacional. Reglamenta el DNU 366/2025 (modif. art. 8° Ley 25.871 de Migraciones).',
  'salud',
  ARRAY['salud','hospitales','extranjeros','migraciones','DNU 366/2025','Ley 25.871'],
  true,
  'vigente',
  'https://www.boletinoficial.gob.ar/detalleAviso/primera/345792/20260811',
  'Boletín Oficial (11/08/2026); RESOL-2026-1066-APN-MS, firmada 10/08/2026 por Mario Iván Lugones (Ministro de Salud)',
  true
)
ON CONFLICT (id) DO NOTHING;
INSERT INTO parametros_medida (medida_id, clave, valor, unidad, fuente, fecha_valor) VALUES
  ('res_ms_cobro_extranjeros_1066','norma_reglamentada','DNU 366/2025 (modif. art. 8° Ley 25.871)',NULL,'BORA Res. 1066/2026 MS','2026-08-11'),
  ('res_ms_cobro_extranjeros_1066','alcance_establecimientos','establecimientos sanitarios administrados por el Estado Nacional',NULL,'BORA Res. 1066/2026 MS','2026-08-11'),
  ('res_ms_cobro_extranjeros_1066','clasificacion_urgencia','profesional de salud responsable de la atención',NULL,'BORA Res. 1066/2026 MS','2026-08-11'),
  ('res_ms_cobro_extranjeros_1066','circuito_con_seguro','notificación a aseguradora dentro de 24h + factura electrónica de recupero',NULL,'BORA Res. 1066/2026 MS','2026-08-11'),
  ('res_ms_cobro_extranjeros_1066','circuito_sin_seguro','presupuesto previo y pago antes de la prestación',NULL,'BORA Res. 1066/2026 MS','2026-08-11'),
  ('res_ms_cobro_extranjeros_1066','exentos','atención de emergencia (todos) y residentes permanentes',NULL,'BORA Res. 1066/2026 MS','2026-08-11'),
  ('res_ms_cobro_extranjeros_1066','aranceles','no definidos en la resolución (los fija cada hospital)',NULL,'BORA Res. 1066/2026 MS','2026-08-11')
ON CONFLICT DO NOTHING;

-- ================= res_educacion_vouchers_505 =================
INSERT INTO medidas (
  id, fecha_bora, tipo_norma, numero, titulo, descripcion, area, tags,
  vigente, estado, fuente_url, fuente_descripcion, analisis_listo
) VALUES (
  'res_educacion_vouchers_505',
  '2026-08-13',
  'Resolución',
  '505/2026',
  'Vouchers Educativos: suspende control mensual y cese del beneficio durante 2026',
  'Suspende durante 2026 los artículos 14 (certificaciones mensuales que las instituciones educativas debían realizar sobre los beneficiarios) y 21 inciso e) (causal de cese de la prestación) del Reglamento General del Programa Vouchers Educativos aprobado por Res. 205/2026 de la Secretaría de Educación. El objetivo declarado es no interrumpir la trayectoria educativa de los beneficiarios durante el ciclo lectivo en curso. El programa alcanza a familias con hijos de hasta 18 años en instituciones de gestión privada con al menos 75% de financiamiento estatal e ingresos familiares no superiores a 7 SMVM. No modifica los requisitos de ingreso ni el monto del voucher.',
  'educacion',
  ARRAY['educación','vouchers educativos','subsidio escolar','Secretaría de Educación','Res. 205/2026','ciclo lectivo'],
  true,
  'vigente',
  'https://www.boletinoficial.gob.ar/detalleAviso/primera/345883/20260813',
  'Boletín Oficial (13/08/2026); RESOL-2026-505-APN-SE#MCH, firmada 11/08/2026 por Carlos Horacio Torrendell (Secretario de Educación, Ministerio de Capital Humano)',
  true
)
ON CONFLICT (id) DO NOTHING;
INSERT INTO parametros_medida (medida_id, clave, valor, unidad, fuente, fecha_valor) VALUES
  ('res_educacion_vouchers_505','norma_afectada','Reglamento General aprobado por Res. 205/2026 (07/04/2026)',NULL,'BORA Res. 505/2026 SE','2026-08-13'),
  ('res_educacion_vouchers_505','articulos_suspendidos','art. 14 (certificaciones mensuales) y art. 21 inc. e) (cese)',NULL,'BORA Res. 505/2026 SE','2026-08-13'),
  ('res_educacion_vouchers_505','duracion_suspension','año 2026',NULL,'BORA Res. 505/2026 SE','2026-08-13'),
  ('res_educacion_vouchers_505','beneficiarios_edad','hasta 18 años',NULL,'Reglamento Vouchers Educativos','2026-08-13'),
  ('res_educacion_vouchers_505','beneficiarios_tipo_escuela','gestión privada con financiamiento estatal ≥75%',NULL,'Reglamento Vouchers Educativos','2026-08-13'),
  ('res_educacion_vouchers_505','tope_ingresos_familiares','7 SMVM','salarios mínimos vitales y móviles','Reglamento Vouchers Educativos','2026-08-13'),
  ('res_educacion_vouchers_505','motivo_declarado','no interrumpir trayectorias educativas durante el ciclo lectivo en curso',NULL,'Considerandos Res. 505/2026','2026-08-13')
ON CONFLICT DO NOTHING;

-- ================= decreto_bono_previsional_septiembre_824 =================
INSERT INTO medidas (
  id, fecha_bora, tipo_norma, numero, titulo, descripcion, area, tags,
  vigente, estado, fuente_url, fuente_descripcion, analisis_listo
) VALUES (
  'decreto_bono_previsional_septiembre_824',
  '2026-08-31',
  'Decreto',
  '824/2026',
  'Bono extraordinario para jubilados y pensionados (septiembre 2026)',
  'Otorga un bono extraordinario previsional de hasta $70.000 en el haber de septiembre de 2026, completo para quienes cobran hasta el haber mínimo garantizado y decreciente para haberes superiores hasta el tope haber mínimo + $70.000. Es no remunerativo, no se le hacen descuentos y no modifica la fórmula de movilidad de la Ley 27.609. Alcanza a prestaciones del SIPA (Ley 24.241), PUAM y pensiones no contributivas por vejez, invalidez, madres de 7+ hijos y pensiones graciables.',
  'previsional',
  ARRAY['bono','jubilaciones','pensiones','ANSES','PUAM','movilidad','Ley 27.609'],
  true,
  'vigente',
  'https://www.boletinoficial.gob.ar/detalleAviso/primera/346555/20260831',
  'Boletín Oficial (31/08/2026); Decreto 824/2026, firmado el 28/08/2026',
  true
)
ON CONFLICT (id) DO NOTHING;
INSERT INTO parametros_medida (medida_id, clave, valor, unidad, fuente, fecha_valor) VALUES
  ('decreto_bono_previsional_septiembre_824','bono_monto_maximo','70000','pesos','BORA Decreto 824/2026','2026-08-31'),
  ('decreto_bono_previsional_septiembre_824','bono_caracter','no remunerativo, sin descuentos, no computable',NULL,'BORA Decreto 824/2026','2026-08-31'),
  ('decreto_bono_previsional_septiembre_824','bono_mes_pago','2026-09',NULL,'BORA Decreto 824/2026','2026-08-31'),
  ('decreto_bono_previsional_septiembre_824','bono_alcance','completo hasta el haber mínimo, decreciente hasta tope mínimo + 70000',NULL,'BORA Decreto 824/2026','2026-08-31'),
  ('decreto_bono_previsional_septiembre_824','bono_frecuencia','pago por única vez',NULL,'BORA Decreto 824/2026','2026-08-31'),
  ('decreto_bono_previsional_septiembre_824','beneficiarios','SIPA (Ley 24.241), PUAM, PNC (vejez, invalidez, madre 7+), pensiones graciables',NULL,'BORA Decreto 824/2026','2026-08-31')
ON CONFLICT DO NOTHING;

-- ================= ley_penal_juvenil_27801 =================
INSERT INTO medidas (
  id, fecha_bora, tipo_norma, numero, titulo, descripcion, area, tags,
  vigente, estado, fuente_url, fuente_descripcion, analisis_listo
) VALUES (
  'ley_penal_juvenil_27801',
  '2026-03-09',
  'Ley',
  '27.801',
  'Nuevo régimen penal juvenil (edad de imputabilidad desde 14 años)',
  'Establece el régimen penal aplicable a personas adolescentes desde los 14 hasta los 18 años cuando fueran imputadas por un hecho tipificado como delito. Deroga la Ley 22.278. Introduce la figura del supervisor especializado, medidas socioeducativas y penas alternativas articuladas con los sistemas de salud, educación y protección, y tutela con asistencia especializada a víctimas. Aplica a la justicia nacional y federal; invita a provincias y CABA a adaptar su legislación. Entró en vigencia a los 180 días de su publicación (05/09/2026). La reglamentación se aprobó por Decreto 875/2026 (BORA 07/09/2026) y crea el Registro de Supervisores, un Comité Interministerial y una Mesa Federal.',
  'otros',
  ARRAY['régimen penal juvenil','imputabilidad','adolescentes','justicia federal','justicia nacional','supervisor','medidas socioeducativas','víctimas','Ley 22.278','Decreto 875/2026'],
  true,
  'vigente',
  'https://www.boletinoficial.gob.ar/detalleAviso/primera/339193/20260309',
  'Boletín Oficial (09/03/2026); Ley 27.801 sancionada el 27/02/2026, promulgada por Decreto 138/2026; vigente a los 180 días de la publicación (05/09/2026); reglamentada por Decreto 875/2026 (BORA 07/09/2026)',
  true
)
ON CONFLICT (id) DO NOTHING;
INSERT INTO parametros_medida (medida_id, clave, valor, unidad, fuente, fecha_valor) VALUES
  ('ley_penal_juvenil_27801','edad_imputabilidad_desde','14','años','BORA Ley 27.801','2026-03-09'),
  ('ley_penal_juvenil_27801','edad_imputabilidad_hasta','18','años','BORA Ley 27.801','2026-03-09'),
  ('ley_penal_juvenil_27801','fecha_vigencia','2026-09-05',NULL,'BORA Ley 27.801 (art. de vigencia a 180 días de la publicación)','2026-03-09'),
  ('ley_penal_juvenil_27801','ley_derogada','Ley 22.278',NULL,'BORA Ley 27.801','2026-03-09'),
  ('ley_penal_juvenil_27801','ambito_aplicacion','justicia nacional y federal',NULL,'BORA Ley 27.801','2026-03-09'),
  ('ley_penal_juvenil_27801','adhesion_provincial','invita a provincias y CABA a adaptar legislación',NULL,'BORA Ley 27.801','2026-03-09'),
  ('ley_penal_juvenil_27801','reglamentacion','Decreto 875/2026 (BORA 07/09/2026)',NULL,'BORA Decreto 875/2026','2026-09-07'),
  ('ley_penal_juvenil_27801','organos_reglamentarios','Registro de Supervisores, Comité Interministerial, Mesa Federal',NULL,'BORA Decreto 875/2026','2026-09-07')
ON CONFLICT DO NOTHING;

-- verificación
SELECT COUNT(*) AS total_medidas FROM medidas;
SELECT id, fecha_bora, titulo FROM medidas ORDER BY fecha_bora DESC LIMIT 8;

COMMIT;