BEGIN;

-- =====================================================================
-- Tanda de reactivación — 6 medidas nuevas (barrido 2026-03-06 → 2026-07-24)
-- Generado desde pendientes/borradores/. total_medidas esperado tras carga: 81
-- =====================================================================

-- C-0004 · bcra_a8417_cambiario (2026-04-13)
INSERT INTO medidas (
  id, fecha_bora, tipo_norma, numero, titulo, descripcion, area, tags,
  vigente, estado, fuente_url, fuente_descripcion, analisis_listo
) VALUES (
  'bcra_a8417_cambiario',
  '2026-04-13',
  'Comunicación',
  'A 8417',
  'Flexibilización del cepo cambiario para personas',
  'El BCRA amplía el acceso de las personas humanas al mercado de cambios: elimina los límites a los adelantos en efectivo en el exterior con tarjetas emitidas localmente y extiende las excepciones para exportadores personas humanas de bienes y servicios (plazos y obligación de liquidar divisas).',
  'cambiario',
  ARRAY['cambiario','cepo','BCRA','divisas','exportación','tarjetas','viajes'],
  true,
  'vigente',
  'https://www.boletinoficial.gob.ar/detalleAviso/primera/340665/20260413',
  'Boletín Oficial (13/04/2026); Comunicación BCRA "A" 8417 del 09/04/2026',
  true
);

INSERT INTO parametros_medida (medida_id, clave, valor, unidad, fuente, fecha_valor) VALUES
  ('bcra_a8417_cambiario','retiro_efectivo_exterior','sin límite (adelantos con tarjeta local)',NULL,'BORA Com. A 8417','2026-04-13'),
  ('bcra_a8417_cambiario','exportadores_ph_servicios','excepción ampliada a todos los conceptos de servicios',NULL,'BORA Com. A 8417','2026-04-13'),
  ('bcra_a8417_cambiario','plazo_liquidacion_max','365','días (ciertos productos)','BORA Com. A 8417','2026-04-13');

-- C-0002 · decreto_formalizacion_laboral_315 (2026-05-04)
INSERT INTO medidas (
  id, fecha_bora, tipo_norma, numero, titulo, descripcion, area, tags,
  vigente, estado, fuente_url, fuente_descripcion, analisis_listo
) VALUES (
  'decreto_formalizacion_laboral_315',
  '2026-05-04',
  'Decreto',
  '315/2026',
  'Incentivo para contratar personas desempleadas (RIFL)',
  'Reglamenta el Régimen de Incentivo a la Formalización Laboral (RIFL) de la Ley 27.802. Las empresas que registren nuevas altas de personas desempleadas, ex monotributistas o ex empleados públicos pagan contribuciones patronales reducidas al 2% durante hasta 48 meses. Las altas se computan entre el 1-may-2026 y el 30-abr-2027.',
  'laboral',
  ARRAY['RIFL','formalización','contribuciones patronales','desempleo','Ley 27.802','ARCA'],
  true,
  'vigente',
  'https://www.boletinoficial.gob.ar/detalleAviso/primera/341443/20260504',
  'Boletín Oficial (04/05/2026); Decreto 315/2026, 30/04/2026; reglamenta la Ley 27.802',
  true
);

INSERT INTO parametros_medida (medida_id, clave, valor, unidad, fuente, fecha_valor) VALUES
  ('decreto_formalizacion_laboral_315','contribucion_patronal_reducida','2','porcentaje','BORA Decreto 315/2026','2026-05-04'),
  ('decreto_formalizacion_laboral_315','duracion_beneficio','48','meses','BORA Decreto 315/2026','2026-05-04'),
  ('decreto_formalizacion_laboral_315','vigencia_altas_desde','2026-05-01',NULL,'BORA Decreto 315/2026','2026-05-04'),
  ('decreto_formalizacion_laboral_315','vigencia_altas_hasta','2027-04-30',NULL,'BORA Decreto 315/2026','2026-05-04'),
  ('decreto_formalizacion_laboral_315','elegibles','desempleados, ex monotributistas, ex empleados públicos',NULL,'BORA Decreto 315/2026','2026-05-04');

-- C-0006 · res_704_privatizacion_aysa (2026-05-15)
INSERT INTO medidas (
  id, fecha_bora, tipo_norma, numero, titulo, descripcion, area, tags,
  vigente, estado, fuente_url, fuente_descripcion, analisis_listo
) VALUES (
  'res_704_privatizacion_aysa',
  '2026-05-15',
  'Resolución',
  '704/2026',
  'Venta del 90% de AySA (agua y cloacas)',
  'El Ministerio de Economía autoriza el llamado a Licitación Pública Nacional e Internacional para vender el 90% del capital de Agua y Saneamientos Argentinos (AySA). Un operador estratégico adquiriría al menos el 51%; el resto se ofrecería en bolsas y mercados. El 10% restante queda en el Programa de Propiedad Participada de los empleados. Presentación de ofertas hasta el 27-ago-2026.',
  'privatizaciones',
  ARRAY['AySA','agua','cloacas','privatización','licitación','servicios públicos'],
  true,
  'vigente',
  'https://www.boletinoficial.gob.ar/detalleAviso/primera/341989/20260515',
  'Boletín Oficial (15/05/2026); Res. 704/2026 Ministerio de Economía, 14/05/2026',
  true
);

INSERT INTO parametros_medida (medida_id, clave, valor, unidad, fuente, fecha_valor) VALUES
  ('res_704_privatizacion_aysa','porcentaje_en_venta','90','porcentaje del capital','BORA Res. 704/2026','2026-05-15'),
  ('res_704_privatizacion_aysa','operador_estrategico_minimo','51','porcentaje','BORA Res. 704/2026','2026-05-15'),
  ('res_704_privatizacion_aysa','propiedad_participada','10','porcentaje (empleados)','BORA Res. 704/2026','2026-05-15'),
  ('res_704_privatizacion_aysa','cierre_ofertas','2026-08-27',NULL,'BORA Res. 704/2026','2026-05-15'),
  ('res_704_privatizacion_aysa','area_servicio','CABA y GBA',NULL,'BORA Res. 704/2026','2026-05-15');

-- C-0003 · res_enrege_40_tarifas_gas (2026-05-29)
INSERT INTO medidas (
  id, fecha_bora, tipo_norma, numero, titulo, descripcion, area, tags,
  vigente, estado, fuente_url, fuente_descripcion, analisis_listo
) VALUES (
  'res_enrege_40_tarifas_gas',
  '2026-05-29',
  'Resolución',
  '40/2026',
  'Nuevos cuadros tarifarios de gas (Revisión Quinquenal 2025-2030)',
  'El ENReGE aprueba nuevos cuadros tarifarios de gas por red (vigencia 1-jun-2026) que incorporan un escalón de la Revisión Quinquenal de Tarifas (RQT) 2025-2030 —31 aumentos mensuales escalonados— más el Precio Anual Uniforme (PAU). Los usuarios residenciales de menores ingresos conservan la bonificación del régimen de Subsidios Energéticos Focalizados (SEF) sobre el consumo base. Esta resolución aprueba el cuadro de Distribuidora de Gas del Centro; las demás distribuidoras se aprueban por resoluciones espejo dentro del mismo esquema.',
  'energia',
  ARRAY['gas','tarifas','RQT','ENReGE','PAU','SEF','quinquenal'],
  true,
  'vigente',
  'https://www.boletinoficial.gob.ar/detalleAviso/primera/342571/20260529',
  'Boletín Oficial (29/05/2026); Res. 40/2026 ENReGE, 28/05/2026; cuadro de Distribuidora de Gas del Centro S.A.',
  true
);

INSERT INTO parametros_medida (medida_id, clave, valor, unidad, fuente, fecha_valor) VALUES
  ('res_enrege_40_tarifas_gas','marco','Revisión Quinquenal de Tarifas 2025-2030',NULL,'BORA Res. 40/2026 ENReGE','2026-05-29'),
  ('res_enrege_40_tarifas_gas','aumentos_escalonados','31','meses','BORA Res. 40/2026 ENReGE','2026-05-29'),
  ('res_enrege_40_tarifas_gas','vigencia_cuadro','2026-06-01',NULL,'BORA Res. 40/2026 ENReGE','2026-05-29'),
  ('res_enrege_40_tarifas_gas','bonificacion','SEF sobre consumo base para usuarios de menores ingresos',NULL,'BORA Res. 40/2026 ENReGE','2026-05-29'),
  ('res_enrege_40_tarifas_gas','alcance_resolucion','Distribuidora de Gas del Centro S.A.',NULL,'BORA Res. 40/2026 ENReGE','2026-05-29');

-- C-0001 · decreto_bono_previsional_399 (2026-05-29)
INSERT INTO medidas (
  id, fecha_bora, tipo_norma, numero, titulo, descripcion, area, tags,
  vigente, estado, fuente_url, fuente_descripcion, analisis_listo
) VALUES (
  'decreto_bono_previsional_399',
  '2026-05-29',
  'Decreto',
  '399/2026',
  'Bono extraordinario para jubilados y pensionados',
  'Otorga un bono extraordinario previsional de hasta $70.000 en el haber de junio de 2026, completo para quienes cobran hasta el haber mínimo y decreciente para haberes superiores. Es no remunerativo y no modifica la fórmula de movilidad de la Ley 27.609. Alcanza a prestaciones del SIPA, PUAM y pensiones no contributivas.',
  'previsional',
  ARRAY['bono','jubilaciones','pensiones','ANSES','PUAM','movilidad','Ley 27.609'],
  true,
  'vigente',
  'https://www.boletinoficial.gob.ar/detalleAviso/primera/342525/20260529',
  'Boletín Oficial (29/05/2026); Decreto 399/2026 (DECTO-2026-399-APN-PTE), 28/05/2026',
  true
);

INSERT INTO parametros_medida (medida_id, clave, valor, unidad, fuente, fecha_valor) VALUES
  ('decreto_bono_previsional_399','bono_monto_maximo','70000','pesos','BORA Decreto 399/2026','2026-05-29'),
  ('decreto_bono_previsional_399','bono_caracter','no remunerativo, sin descuentos',NULL,'BORA Decreto 399/2026','2026-05-29'),
  ('decreto_bono_previsional_399','bono_mes_pago','2026-06',NULL,'BORA Decreto 399/2026','2026-05-29'),
  ('decreto_bono_previsional_399','bono_alcance','completo hasta el haber mínimo, decreciente por encima',NULL,'BORA Decreto 399/2026','2026-05-29'),
  ('decreto_bono_previsional_399','bono_frecuencia','pago por única vez',NULL,'BORA Decreto 399/2026','2026-05-29');

-- C-0005 · decreto_retenciones_agro_423 (2026-06-03)
INSERT INTO medidas (
  id, fecha_bora, tipo_norma, numero, titulo, descripcion, area, tags,
  vigente, estado, fuente_url, fuente_descripcion, analisis_listo
) VALUES (
  'decreto_retenciones_agro_423',
  '2026-06-03',
  'Decreto',
  '423/2026',
  'Cronograma de baja de retenciones al agro',
  'Tras las bajas de julio y diciembre de 2025, fija un cronograma de reducción gradual de los derechos de exportación de la cadena de granos (soja, maíz, trigo, cebada, sorgo, girasol) y biocombustibles hasta diciembre de 2028. Trigo y cebada bajan de inmediato del 7,5% al 5,5%; la soja se mantiene en 24% en 2026 y desciende desde enero de 2027 hacia 21% (dic-2027) y 15% (dic-2028).',
  'agroindustria',
  ARRAY['retenciones','derechos de exportación','agro','soja','trigo','biocombustibles'],
  true,
  'vigente',
  'https://www.argentina.gob.ar/normativa/nacional/decreto-423-2026',
  'Decreto 423/2026, BORA 03/06/2026, vigente desde 05/06/2026',
  true
);

INSERT INTO parametros_medida (medida_id, clave, valor, unidad, fuente, fecha_valor) VALUES
  ('decreto_retenciones_agro_423','trigo_cebada','5.5','porcentaje (baja inmediata desde 7,5%)','Decreto 423/2026','2026-06-03'),
  ('decreto_retenciones_agro_423','soja_2026','24','porcentaje (sin cambio en 2026)','Decreto 423/2026','2026-06-03'),
  ('decreto_retenciones_agro_423','soja_dic_2027','21','porcentaje','Decreto 423/2026','2026-06-03'),
  ('decreto_retenciones_agro_423','soja_dic_2028','15','porcentaje','Decreto 423/2026','2026-06-03'),
  ('decreto_retenciones_agro_423','vigencia','2026-06-05',NULL,'Decreto 423/2026','2026-06-03'),
  ('decreto_retenciones_agro_423','horizonte_cronograma','2028-12',NULL,'Decreto 423/2026','2026-06-03');

SELECT COUNT(*) AS total_medidas FROM medidas;
SELECT COUNT(*) AS total_parametros_tanda FROM parametros_medida
  WHERE medida_id IN ('bcra_a8417_cambiario', 'decreto_formalizacion_laboral_315', 'res_704_privatizacion_aysa', 'res_enrege_40_tarifas_gas', 'decreto_bono_previsional_399', 'decreto_retenciones_agro_423');

COMMIT;
