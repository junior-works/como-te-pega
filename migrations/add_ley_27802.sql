BEGIN;

INSERT INTO medidas (
  id, fecha_bora, tipo_norma, numero, titulo, descripcion, area, tags,
  vigente, estado, fuente_url, fuente_descripcion, analisis_listo
) VALUES (
  'ley_modernizacion_laboral_27802',
  '2026-03-06',
  'Ley',
  '27.802',
  'Ley 27.802 de Modernización Laboral',
  'Reforma la Ley de Contrato de Trabajo, el régimen de convenios colectivos y el de asociaciones sindicales. Cambia el cálculo de la indemnización por despido, crea el Fondo de Asistencia Laboral (financiado por el empleador), encuadra a los trabajadores de plataformas como independientes, simplifica la registración (centralizada en ARCA) y digitaliza recibos y certificados. Vigente y aplicándose, aunque judicialmente cuestionada. Reglamentada por el Decreto 407/2026.',
  'laboral',
  ARRAY['reforma laboral','LCT','indemnización','despido','plataformas','FAL','sindicatos','ARCA'],
  true,
  'vigente',
  'https://www.boletinoficial.gob.ar/detalleAviso/primera/339128/20260306',
  'Boletín Oficial N° 35.865 (06/03/2026); reglamentada por Decreto 407/2026 (BORA 01/06/2026)',
  true
);

INSERT INTO parametros_medida (medida_id, clave, valor, unidad, fuente, fecha_valor) VALUES
  ('ley_modernizacion_laboral_27802','indemnizacion_multiplicador_por_anio','1','meses_sueldo','BORA Ley 27.802 / Decreto 407/2026','2026-03-06'),
  ('ley_modernizacion_laboral_27802','indemnizacion_base_excluye','SAC, vacaciones, premios no mensuales',NULL,'BORA Ley 27.802 / Decreto 407/2026','2026-03-06'),
  ('ley_modernizacion_laboral_27802','indemnizacion_piso_porcentaje','67','porcentaje_remuneracion','BORA Ley 27.802 / Decreto 407/2026','2026-03-06'),
  ('ley_modernizacion_laboral_27802','preaviso_empleador_hasta_5_anios','1','meses','BORA Ley 27.802 / Decreto 407/2026','2026-03-06'),
  ('ley_modernizacion_laboral_27802','preaviso_empleador_mas_5_anios','2','meses','BORA Ley 27.802 / Decreto 407/2026','2026-03-06'),
  ('ley_modernizacion_laboral_27802','fal_aporte_trabajador','0','porcentaje','BORA Ley 27.802 / Decreto 407/2026','2026-06-01'),
  ('ley_modernizacion_laboral_27802','fal_alicuota_grandes_empresas','1','porcentaje_base_sipa','BORA Ley 27.802 / Decreto 407/2026','2026-06-01'),
  ('ley_modernizacion_laboral_27802','fal_alicuota_pymes','2.5','porcentaje_base_sipa','BORA Ley 27.802 / Decreto 407/2026','2026-06-01'),
  ('ley_modernizacion_laboral_27802','fal_antiguedad_minima_cobertura','12','meses','BORA Ley 27.802 / Decreto 407/2026','2026-06-01'),
  ('ley_modernizacion_laboral_27802','tope_retencion_salario','20','porcentaje','BORA Ley 27.802 / Decreto 407/2026','2026-03-06'),
  ('ley_modernizacion_laboral_27802','tope_cuota_sindical','2','porcentaje','BORA Ley 27.802 / Decreto 407/2026','2026-03-06'),
  ('ley_modernizacion_laboral_27802','actualizacion_creditos_laborales','IPC + 3% anual',NULL,'BORA Ley 27.802 / Decreto 407/2026','2026-03-06');

SELECT COUNT(*) AS total_medidas FROM medidas;
SELECT COUNT(*) FROM parametros_medida WHERE medida_id = 'ley_modernizacion_laboral_27802';

COMMIT;
