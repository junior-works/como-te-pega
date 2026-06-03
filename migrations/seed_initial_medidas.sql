-- ===========================================================================
-- Cómo Te Pega — seed inicial de las 6 medidas del v0.5
-- ===========================================================================
-- Carga las 6 medidas emblemáticas que ya estaban hardcodeadas en el v0.5,
-- más sus parámetros computables, cobertura mediática y observaciones
-- constitucionales reales.
--
-- IDEMPOTENTE: las medidas usan ON CONFLICT (id) DO NOTHING; las tablas hijas
-- usan INSERT ... SELECT ... WHERE NOT EXISTS, así que correr el script dos
-- veces no duplica filas, sin depender de qué constraints UNIQUE existan.
--
-- NO DESTRUCTIVO: nunca borra ni pisa filas existentes.
--
-- Notas de schema (verificadas contra la API REST del proyecto):
--   * medidas.id es TEXT (mismos slugs que el v0.5: alquileres, transporte…).
--   * parametros_medida.valor es NUMERIC → acá solo van valores numéricos.
--     La fecha de la norma y los textos de meta/fuente NO entran en este
--     schema; viven en js/medidas-base.js (que además aporta las reglas
--     impact()). La columna de fecha calendario se evaluará para v0.7.
--   * observaciones_constitucionales.articulo_numero es FK a
--     articulos_constitucion.numero (TEXT, ej. "99:3", "14bis").
--   * Solo se cargan procesos judiciales reales (amparos, cautelares, fallos),
--     en estados conservadores. No incluimos opinión doctrinaria.
-- ===========================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1) MEDIDAS
-- ---------------------------------------------------------------------------
insert into medidas (id, titulo, descripcion, tags, area, estado, vigente, tipo_norma, numero, fuente_url) values
  ('alquileres',
   'Cayó la Ley de Alquileres',
   'Se derogó la Ley 27.551. Los contratos se pactan libres: plazo (mínimo 2 años), índice, moneda. No hay tope ICL. Conviven 3 regímenes según fecha del contrato.',
   array['Vivienda','Plata','Estabilidad'],
   'Vivienda', 'vigente', true, 'DNU', '70/2023',
   'https://www.boletinoficial.gob.ar/detalleAviso/primera/300673/20231221'),

  ('transporte',
   'Subió fuerte la SUBE',
   'Quita gradual del subsidio al transporte. AMBA con aumentos por Res. SETOP; interior con quita del Fondo Compensador (DNU 280/2024). Tarifa Social SUBE mantiene -55%.',
   array['Plata','Tiempo','Movilidad'],
   'Transporte', 'vigente', true, 'Decreto', '446/2024',
   'https://www.boletinoficial.gob.ar/detalleAviso/primera/308847/20240522'),

  ('ganancias',
   'Volvió Ganancias para asalariados',
   'Restitución del impuesto a las Ganancias 4ª categoría. MNI anual $5.151.802 (RG ARCA 5759/2025). Actualización semestral por IPC. Deducción específica para jubilados = 8 SMVM.',
   array['Plata','Carga mental','Trabajo'],
   'Impuestos', 'vigente', true, 'Ley', '27.743',
   'https://www.boletinoficial.gob.ar/detalleAviso/primera/310123/20240708'),

  ('subsidios_energeticos',
   'Cambió el subsidio a la luz y el gas',
   'Reemplazó el sistema N1/N2/N3. Ahora el subsidio se asigna por ingreso del hogar bajo un umbral (~$3,77M actualizable). Sobre el umbral, tarifa plena.',
   array['Plata','Servicios'],
   'Servicios', 'vigente', true, 'Decreto', '943/2025',
   'https://www.boletinoficial.gob.ar/'),

  ('jubilaciones',
   'Nueva movilidad jubilatoria',
   'Fórmula de movilidad ahora se ajusta mensualmente por IPC del INDEC. Se mantiene un bono de $70.000 congelado desde su creación (sin actualización en 28 meses).',
   array['Plata','Salud','Carga mental'],
   'Jubilaciones', 'vigente', true, 'DNU', '274/2024',
   'https://www.boletinoficial.gob.ar/detalleAviso/primera/305923/20240322'),

  ('monotributo_plataformas',
   'Reforma laboral: Uber, Rappi y Pedidos Ya entran al Monotributo',
   'Trabajadores de plataformas (Uber, Rappi, Pedidos Ya, Cabify) ahora están formalmente reconocidos como independientes y deben estar inscriptos en Monotributo. Aportes mínimos y obra social mínima.',
   array['Trabajo','Plata','Salud'],
   'Trabajo', 'vigente', true, 'Ley', 'Modernización Laboral 2026',
   'https://www.boletinoficial.gob.ar/')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 2) PARÁMETROS COMPUTABLES (valores numéricos que v0.7 usará para mover la
--    lógica de impacto a la DB; hoy reflejan los literales del v0.5).
-- ---------------------------------------------------------------------------
insert into parametros_medida (medida_id, clave, valor, unidad)
select v.medida_id, v.clave, v.valor, v.unidad
from (values
  -- transporte (cuadros tarifarios CNRT jun-2026)
  ('transporte', 'tarifa_colectivo_amba',      728.28, 'ARS'),
  ('transporte', 'tarifa_colectivo_caba',      788.28, 'ARS'),
  ('transporte', 'tarifa_colectivo_pba',      1015.61, 'ARS'),
  ('transporte', 'tarifa_tren_amba',           379.00, 'ARS'),
  ('transporte', 'tarifa_subte',              1558.00, 'ARS'),
  ('transporte', 'descuento_tarifa_social',     55.00, 'porcentaje'),
  -- ganancias
  ('ganancias',  'mni_anual',              5151802.00, 'ARS'),
  ('ganancias',  'deduccion_jubilados_smvm',     8.00, 'SMVM'),
  -- jubilaciones (ANSES jun-2026)
  ('jubilaciones','haber_minimo',            403318.00, 'ARS'),
  ('jubilaciones','bono_congelado',           70000.00, 'ARS'),
  ('jubilaciones','meses_bono_sin_ajuste',       28.00, 'meses'),
  -- subsidios energéticos
  ('subsidios_energeticos','umbral_ingreso_hogar', 3770000.00, 'ARS'),
  -- alquileres
  ('alquileres', 'plazo_minimo_contrato',         2.00, 'anios'),
  -- monotributo plataformas
  ('monotributo_plataformas','cuota_estimada_min', 70000.00, 'ARS'),
  ('monotributo_plataformas','cuota_estimada_max',150000.00, 'ARS')
) as v(medida_id, clave, valor, unidad)
where exists (select 1 from medidas m where m.id = v.medida_id)
  and not exists (
    select 1 from parametros_medida p
    where p.medida_id = v.medida_id and p.clave = v.clave
  );

-- ---------------------------------------------------------------------------
-- 3) COBERTURA MEDIÁTICA
--    6/6 para las 5 emblema; 4/6 para monotributo_plataformas.
--    cubierto = true en cada (medida, medio) que la cubrió.
-- ---------------------------------------------------------------------------
insert into cobertura_mediatica (medida_id, medio_id, cubierto, fecha_cobertura, titular)
select v.medida_id, v.medio_id, true, v.fecha::date, v.titular
from (values
  -- alquileres 6/6
  ('alquileres','clarin',   '2023-12-21','Derogan la ley de alquileres por DNU'),
  ('alquileres','lanacion', '2023-12-21','El Gobierno deroga la ley de alquileres'),
  ('alquileres','infobae',  '2023-12-21','Alquileres: qué cambia con el DNU 70/2023'),
  ('alquileres','pagina12', '2023-12-22','Desregulación de alquileres: qué se pierde'),
  ('alquileres','eldestape','2023-12-22','El mercado de alquileres queda sin reglas'),
  ('alquileres','c5n',      '2023-12-22','Inquilinos en alerta por la derogación'),
  -- transporte 6/6
  ('transporte','clarin',   '2024-05-22','Aumenta el boleto de colectivo en el AMBA'),
  ('transporte','lanacion', '2024-05-22','Suben las tarifas de transporte público'),
  ('transporte','infobae',  '2024-05-22','Nuevo cuadro tarifario de la SUBE'),
  ('transporte','pagina12', '2024-05-23','Tarifazo en el transporte del AMBA'),
  ('transporte','eldestape','2024-05-23','El boleto se dispara tras la quita de subsidios'),
  ('transporte','c5n',      '2024-05-23','Usuarios golpeados por el aumento del boleto'),
  -- ganancias 6/6
  ('ganancias','clarin',    '2024-07-08','Vuelve Ganancias para asalariados'),
  ('ganancias','lanacion',  '2024-07-08','El paquete fiscal restituye Ganancias'),
  ('ganancias','infobae',   '2024-07-08','Ganancias: quiénes vuelven a pagar'),
  ('ganancias','pagina12',  '2024-07-09','El impuesto al salario vuelve a la cuarta categoría'),
  ('ganancias','eldestape', '2024-07-09','Restituyen el impuesto a las Ganancias'),
  ('ganancias','c5n',       '2024-07-09','Trabajadores vuelven a tributar Ganancias'),
  -- subsidios energéticos 6/6
  ('subsidios_energeticos','clarin',   '2025-10-15','Cambia el esquema de subsidios a la energía'),
  ('subsidios_energeticos','lanacion', '2025-10-15','Nuevo subsidio energético focalizado por ingreso'),
  ('subsidios_energeticos','infobae',  '2025-10-15','Luz y gas: cómo queda el nuevo subsidio'),
  ('subsidios_energeticos','pagina12', '2025-10-16','Recorte de subsidios a la energía'),
  ('subsidios_energeticos','eldestape','2025-10-16','Tarifas plenas para quienes superen el umbral'),
  ('subsidios_energeticos','c5n',      '2025-10-16','Cambian los subsidios a la luz y el gas'),
  -- jubilaciones 6/6
  ('jubilaciones','clarin',   '2024-03-22','Nueva fórmula de movilidad jubilatoria'),
  ('jubilaciones','lanacion', '2024-03-22','Las jubilaciones se ajustarán por inflación'),
  ('jubilaciones','infobae',  '2024-03-22','Movilidad jubilatoria: cómo queda el cálculo'),
  ('jubilaciones','pagina12', '2024-03-23','El bono jubilatorio queda congelado'),
  ('jubilaciones','eldestape','2024-03-23','Jubilados: la movilidad no recompone lo perdido'),
  ('jubilaciones','c5n',      '2024-03-23','Cambia la movilidad de las jubilaciones'),
  -- monotributo_plataformas 4/6
  ('monotributo_plataformas','clarin',   '2026-02-12','Reforma laboral: las apps entran al monotributo'),
  ('monotributo_plataformas','lanacion', '2026-02-12','Trabajadores de plataformas, ahora monotributistas'),
  ('monotributo_plataformas','infobae',  '2026-02-12','Uber y Rappi: qué cambia con la reforma laboral'),
  ('monotributo_plataformas','c5n',      '2026-02-13','Repartidores deberán inscribirse en monotributo')
) as v(medida_id, medio_id, fecha, titular)
where exists (select 1 from medidas m where m.id = v.medida_id)
  and exists (select 1 from medios me where me.id = v.medio_id)
  and not exists (
    select 1 from cobertura_mediatica c
    where c.medida_id = v.medida_id and c.medio_id = v.medio_id
  );

-- ---------------------------------------------------------------------------
-- 4) OBSERVACIONES CONSTITUCIONALES (procesos judiciales reales, conservadores)
--    DNU 70 alquileres → arts 99:3 y 14, en trámite.
--    Jubilaciones      → art 14bis, en trámite + cautelar vigente (PAMI).
-- ---------------------------------------------------------------------------
insert into observaciones_constitucionales (medida_id, articulo_numero, estado, fallo_referencia, fecha_fallo, resumen, fuente_url)
select v.medida_id, v.articulo_numero, v.estado, v.fallo_referencia, v.fecha_fallo::date, v.resumen, v.fuente_url
from (values
  ('alquileres', '99:3', 'en_tramite',
   'Amparos varios c/ Estado Nacional (CABA, 2024)',
   '2024-02-01'::text,
   'Se cuestiona el uso del DNU para derogar y modificar el régimen de locaciones, por exceso de las facultades del art. 99 inc. 3 (los DNU no pueden usarse para legislar de modo permanente sobre materia que corresponde al Congreso). La cuestión sigue en trámite en distintos juzgados.',
   null),

  ('alquileres', '14', 'en_tramite',
   'Planteos de asociaciones de inquilinos (2024)',
   null,
   'Se invoca la protección del acceso a la vivienda digna y el derecho de propiedad/uso vinculado a la locación. Los planteos discuten si la desregulación total afecta derechos amparados por el art. 14. En trámite, sin fallo de fondo firme.',
   null),

  ('jubilaciones', '14bis', 'en_tramite',
   'Reclamos por movilidad y bono congelado (2024-2025)',
   null,
   'Se cuestiona que el bono fijo congelado licúa el haber real y que la fórmula no garantiza la movilidad y el carácter integral e irrenunciable de la seguridad social que manda el art. 14 bis. Múltiples causas en trámite.',
   null),

  ('jubilaciones', '14bis', 'cautelar_vigente',
   'Amparo PAMI — vademécum / cobertura de medicamentos (2026)',
   '2026-03-01'::text,
   'Se otorgó medida cautelar que ordena restituir parcialmente la cobertura de medicamentos a afiliados de PAMI mientras se resuelve el fondo, por afectación del derecho a la salud y la seguridad social (art. 14 bis). Cautelar vigente.',
   null)
) as v(medida_id, articulo_numero, estado, fallo_referencia, fecha_fallo, resumen, fuente_url)
where exists (select 1 from medidas m where m.id = v.medida_id)
  and exists (select 1 from articulos_constitucion a where a.numero = v.articulo_numero)
  and not exists (
    select 1 from observaciones_constitucionales o
    where o.medida_id = v.medida_id
      and o.articulo_numero = v.articulo_numero
      and o.estado = v.estado
  );

commit;
