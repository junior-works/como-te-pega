/* Cómo Te Pega — catálogo base de medidas (lógica + fallback offline)
 * ------------------------------------------------------------------
 * Este módulo cumple DOS funciones:
 *
 *   1. Es la fuente de la LÓGICA DE IMPACTO. Las reglas `impact(perfil)` y
 *      los `compareProfiles` no se pueden serializar en la DB todavía, así
 *      que viven acá (migran a `reglas_impacto` en v0.7).
 *
 *   2. Es el FALLBACK OFFLINE. Si el fetch a Supabase falla (sin red, primer
 *      load sin cache), la app corre 100% con estos datos del v0.5.
 *
 * En runtime, `js/data.js` mergea los datos de Supabase ENCIMA de este base:
 * de la DB vienen titulo/descripcion/tags/area/estado/popularidad + cobertura
 * y observaciones constitucionales; de acá vienen las reglas impact(), los
 * compareProfiles y los campos que el schema actual no guarda (fecha de la
 * norma, meta legible y texto de fuente).
 *
 * La fecha (`date`) se conserva acá porque la tabla `medidas` no tiene una
 * columna de fecha calendario; es lo que ordena el historial cronológico.
 * ------------------------------------------------------------------ */

/* DIM_ICONS — catálogo canónico de dimensiones → ícono.
 * ------------------------------------------------------------------
 * Fuente única de verdad para el emoji de cada dimensión. Las reglas
 * impact() siguen pudiendo pasar el ícono inline (`dims.push({ icon })`),
 * pero si lo omiten, render.js lo resuelve desde acá por `name`. Así una
 * medida nueva puede hacer `{ name: "Ahorro", level: "pos", body: ... }`
 * sin repetir el emoji. Mantené las claves EXACTAS a los `name` de las dims.
 * "Servicios" y "Calidad de servicios" comparten 🔌 a propósito.
 * ------------------------------------------------------------------ */
export const DIM_ICONS = {
  "Plata": "💰",
  "Vivienda": "🏠",
  "Trabajo": "🛠️",
  "Salud": "❤️",
  "Carga mental": "🧠",
  "Tiempo": "⏰",
  "Estabilidad": "🛡️",
  "Servicios": "🔌",
  "Calidad de servicios": "🔌",
  "Movilidad": "♿",
  "Movilidad social": "🛤️",
  "Vida familiar / ocio": "👨‍👩‍👧",
  "Vida familiar": "👨‍👩‍👧",
  "Educación": "📚",
  "País / Equilibrio institucional": "🏛️",
  // Disponibles para medidas futuras (paritarias, jubilaciones, ley de
  // vacaciones, jornada laboral, etc.). Todavía sin medida que las use.
  "Ahorro": "🐷",
  "Vacaciones": "🏖️",
  "Ocio": "🎭"
};

export const MEASURES_BASE = [
  {
    id: "alquileres",
    date: "2023-12-21",
    title: "Cayó la Ley de Alquileres",
    meta: "DNU 70/2023 · arts. 249-251 · 21-dic-2023 · ratificado por Ley Bases 27.742",
    desc: "Se derogó la Ley 27.551. Los contratos se pactan libres: plazo (mínimo 2 años), índice, moneda. No hay tope ICL. Conviven 3 regímenes según fecha del contrato.",
    tags: ["Vivienda", "Plata", "Estabilidad"],
    area: "Vivienda",
    estado: "vigente",
    fuente: "Boletín Oficial — DNU 70/2023 arts. 249-251. Ratificación parcial Ley 27.742. Datos de mercado: Reporte Inmobiliario, Inquilinos Agrupados, CESO 2025.",
    impact: function(p) {
      const dims = [];
      const inUrban = ["caba","gba_norte","gba_sur","gba_oeste","laplata","cba_cap","rosario","mendoza","tucuman"].includes(p.zona);
      const isInquilino = p.vivienda === "alquila";
      const isRentista = p.vivienda === "alquila_renta";
      const isInformal = p.vivienda === "ocupada";

      if (isInquilino) {
        if (p.zona === "caba" || p.zona === "gba_norte") {
          dims.push({ name: "Vivienda", icon: "🏠", level: "strong",
            body: "En CABA/GBA Norte la mediana del alquiler supera el <strong>50% del ingreso</strong> (CESO 2025). Renovás sin tope, con ajuste IPC <em>trimestral</em> en la mayoría de los contratos nuevos. La oferta de alquileres subió +150% (Reporte Inmobiliario 2024), pero el costo inicial también." });
        } else if (inUrban) {
          dims.push({ name: "Vivienda", icon: "🏠", level: "mid",
            body: "Mercado urbano grande: contratos 2 años, ajuste trimestral o cuatrimestral. La incidencia sobre el ingreso ronda <strong>25-40%</strong>." });
        } else {
          dims.push({ name: "Vivienda", icon: "🏠", level: "soft",
            body: "En ciudades chicas / interior la oferta es mayor y los aumentos más moderados, pero igualmente firmás sin tope ICL." });
        }
      } else if (isRentista) {
        dims.push({ name: "Vivienda", icon: "🏠", level: "pos",
          body: "Como propietario ganaste flexibilidad: pactás índice, plazo, moneda. La renta real probablemente subió. Si también alquilás, te aplica lo del inquilino." });
      } else if (isInformal) {
        dims.push({ name: "Vivienda", icon: "🏠", level: "strong",
          body: "Tu situación habitacional queda fuera del régimen formal de alquileres. No estás protegido y, si te formalizás, entrás al mercado caótico." });
      } else {
        dims.push({ name: "Vivienda", icon: "🏠", level: "none",
          body: "Por ahora no te toca directamente. Si te mudás a alquilar en los próximos 12 meses, el mercado es más caro y volátil que en 2023." });
      }

      if (isInquilino) {
        let porc = "30-45%";
        if (p.ingreso === "hasta_700k") porc = "más del 60%";
        else if (p.ingreso === "700k_1.5m") porc = "40-55%";
        else if (p.ingreso === "6m_15m" || p.ingreso === "mas_15m") porc = "10-20%";
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: `El alquiler se come <strong>${porc}</strong> de un ingreso del hogar como el tuyo en zona urbana. Sin tope, el ajuste tiende a ir más rápido que las paritarias.` });
      }

      if (isInquilino) {
        dims.push({ name: "Carga mental", icon: "🧠", level: "strong",
          body: "Inquilinos Agrupados (2025): <strong>57% de inquilinos reportan alta ansiedad financiera</strong> asociada a la renovación. Ajuste trimestral = revisás presupuesto 4 veces por año." });
        dims.push({ name: "Tiempo", icon: "⏰", level: "soft",
          body: "Tiempo en buscar / comparar / renegociar es mayor que con la ley anterior: 8-15 horas extra al año si renovás o cambiás." });
      }

      if (isInquilino && (p.hijos === "1" || p.hijos === "2" || p.hijos === "3mas")) {
        dims.push({ name: "Vida familiar / ocio", icon: "👨‍👩‍👧", level: "mid",
          body: "Con hijos en colegio/club, mudarse es más costoso. El nuevo régimen aumenta la rotación. Vacaciones y salidas suelen ser lo primero que se recorta cuando sube el alquiler." });
      }

      if (isInquilino && p.discapacidad !== "no" && p.discapacidad) {
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "strong",
          body: "Con un miembro con discapacidad la mudanza es más compleja (adaptación, accesibilidad, redes locales de salud). La rotación habitacional impone un costo emocional y operativo mayor." });
      }

      if (isInquilino && (p.ingreso === "hasta_700k" || p.ingreso === "700k_1.5m") && p.salud === "hosp_pub") {
        dims.push({ name: "Salud", icon: "❤️", level: "soft",
          body: "La inestabilidad habitacional se asocia a peor sueño y más estrés crónico. Evidencia indirecta — pero presente." });
      }

      return dims;
    },
    compareProfiles: [
      { name: "Inquilino joven CABA, $1,8M, soltero", sub: "Empleado privado, alquila, sin hijos", badges: { Vivienda: "strong", Plata: "strong", Tiempo: "soft", "Carga mental": "strong", Familia: "soft", Salud: "soft" } },
      { name: "Familia inquilina Tucumán, 2 hijos", sub: "Empleado público provincial + monotributo, $2,2M", badges: { Vivienda: "mid", Plata: "mid", Tiempo: "soft", "Carga mental": "mid", Familia: "mid", Salud: "soft" } },
      { name: "Propietario PyME mendocino, 3 deptos renta", sub: "Empresario, alquila + renta", badges: { Vivienda: "pos", Plata: "pos", Tiempo: "none", "Carga mental": "soft", Familia: "none", Salud: "none" } },
      { name: "Jubilada mínima CABA, casa propia", sub: "Jubilada mínima, propio, sin hijos a cargo", badges: { Vivienda: "none", Plata: "none", Tiempo: "none", "Carga mental": "none", Familia: "none", Salud: "none" } },
      { name: "Estudiante GBA, pensión compartida", sub: "Estudiante, alquila, sin ingresos fijos", badges: { Vivienda: "mid", Plata: "strong", Tiempo: "soft", "Carga mental": "mid", Familia: "soft", Salud: "soft" } },
      { name: "Familia con hijo con CUD, alquila", sub: "Empleados, 1 hijo con discap., $2M", badges: { Vivienda: "strong", Plata: "strong", Tiempo: "mid", "Carga mental": "strong", Familia: "strong", Salud: "mid" } }
    ]
  },

  {
    id: "transporte",
    date: "2024-05-22",
    title: "Subió fuerte la SUBE",
    meta: "Decretos 446/2024, 280/2024 + Resoluciones SETOP · vigente",
    desc: "Quita gradual del subsidio al transporte. AMBA con aumentos por Res. SETOP; interior con quita del Fondo Compensador (DNU 280/2024). Tarifa Social SUBE mantiene -55%.",
    tags: ["Plata", "Tiempo", "Movilidad"],
    area: "Transporte",
    estado: "vigente",
    fuente: "Boletín Oficial — Decreto 446/2024, DNU 280/2024, Resoluciones SETOP 2024-2026. Cuadros tarifarios CNRT junio 2026: colectivo nacional AMBA $728,28 | CABA exclusiva $788,28 | PBA $1.015,61 | tren AMBA $379 | subte $1.558.",
    impact: function(p) {
      const dims = [];
      const inAMBA = ["caba","gba_norte","gba_sur","gba_oeste","laplata"].includes(p.zona);
      const tieneTarifaSocial = (p.asistencia || []).includes("tarifa_sube");

      if (inAMBA && (p.transporte === "2colectivos" || p.transporte === "combinacion")) {
        const viajes = p.transporte === "combinacion" ? 88 : 44;
        const tarifaUnit = tieneTarifaSocial ? 328 : 728;
        const tarifaAntes = tieneTarifaSocial ? 35 : 76;
        const gastoHoy = viajes * tarifaUnit;
        const gastoAntes = viajes * tarifaAntes;
        const dif = gastoHoy - gastoAntes;
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: `Hacés ~${viajes} viajes/mes. ${tieneTarifaSocial ? "<em>Con Tarifa Social SUBE</em>, " : ""}gastás <strong>$${gastoHoy.toLocaleString('es-AR')}</strong> vs <strong>$${gastoAntes.toLocaleString('es-AR')}</strong> en dic-23. Diferencia: <strong>+$${dif.toLocaleString('es-AR')}/mes</strong>.` });
      } else if (inAMBA && p.transporte === "tren") {
        dims.push({ name: "Plata", icon: "💰", level: "mid",
          body: "Tren AMBA SUBE registrada ~$379. Subió respecto de 2023 pero menos que el colectivo." });
      } else if (inAMBA && p.transporte === "auto") {
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "Sin SUBE, pero el combustible también subió por quita de subsidios y devaluación. Peajes urbanos también ajustaron." });
      } else if (p.transporte === "cerca") {
        dims.push({ name: "Plata", icon: "💰", level: "pos",
          body: "Andás cerca: el aumento casi no te toca. Posición fuerte en este escenario." });
      }

      if (!inAMBA && (p.transporte === "2colectivos" || p.transporte === "combinacion" || p.transporte === "tren")) {
        dims.push({ name: "Plata", icon: "💰", level: "mid",
          body: "Tu provincia, con la quita del Fondo Compensador (DNU 280/2024), recibe menos subsidio nacional. Los aumentos varían por jurisdicción pero todos suben." });
      }

      if (inAMBA && (p.transporte === "2colectivos" || p.transporte === "combinacion")) {
        dims.push({ name: "Tiempo", icon: "⏰", level: "mid",
          body: "Encuestas 2024-25: muchos usuarios cambiaron a recorridos más largos pero más baratos (1 colectivo en vez de 2). Suma <strong>20-40 min/día</strong> = ~10 hs/mes." });
      }

      if (p.extra === "plataforma") {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
          body: "Hacés Uber/Rappi: el combustible es tu insumo principal, subió fuerte (quita subsidio + devaluación). La Reforma Laboral 2026 te formalizó como monotributista — ahora tenés aportes pero ganás cobertura mínima." });
      }

      if (inAMBA && (p.transporte === "2colectivos" || p.transporte === "combinacion") && (p.hijos === "1" || p.hijos === "2" || p.hijos === "3mas")) {
        dims.push({ name: "Vida familiar / ocio", icon: "👨‍👩‍👧", level: "mid",
          body: "Encuesta UCA 2024-25: hogares vulnerables redujeron -22% la movilidad recreativa. Salidas con hijos a CABA caen primero." });
      }

      if (inAMBA && (p.ocupacion === "jubilado_min" || p.ocupacion === "pensionado") && (p.transporte === "2colectivos" || p.transporte === "combinacion")) {
        dims.push({ name: "Salud", icon: "❤️", level: "mid",
          body: "Hay reportes de adultos mayores postergando turnos médicos por el costo del viaje. Si tenés Tarifa Social SUBE el golpe es menor, pero igual subió de imperceptible a 3-4% del haber." });
      }

      if (p.discapacidad === "propia_cud" || p.discapacidad === "familiar_cud") {
        dims.push({ name: "Movilidad", icon: "♿", level: "soft",
          body: "Con CUD podés acceder a Pase Libre de Transporte (gratuito en líneas autorizadas). Verificá que tu CUD esté vigente y los recorridos cubiertos." });
      }

      return dims;
    },
    compareProfiles: [
      { name: "Empleado Lanús, 2 colectivos + tren", sub: "Empleado privado, GBA, $1,5M", badges: { Plata: "strong", Tiempo: "mid", Familia: "mid", Salud: "soft" } },
      { name: "Jubilada CABA con Tarifa Social SUBE", sub: "Jubilada mínima, 2 colectivos/sem al médico", badges: { Plata: "mid", Tiempo: "soft", Familia: "soft", Salud: "mid" } },
      { name: "Monotributista Caballito + Uber noche", sub: "Monotributista, auto, plataforma", badges: { Plata: "mid", Tiempo: "soft", Familia: "soft", Trabajo: "mid" } },
      { name: "Familia interior Salta, 2 hijos", sub: "Empleado público + ama de casa", badges: { Plata: "mid", Tiempo: "soft", Familia: "soft", Salud: "soft" } },
      { name: "Estudiante GBA con SUBE estudiantil", sub: "Estudiante, combinación, GBA", badges: { Plata: "mid", Tiempo: "mid", Familia: "soft", Salud: "none" } },
      { name: "Empresario PyME interior, auto", sub: "PyME, Córdoba, auto particular", badges: { Plata: "soft", Tiempo: "none", Familia: "none", Trabajo: "soft" } }
    ]
  },

  {
    id: "ganancias",
    date: "2024-07-08",
    title: "Volvió Ganancias para asalariados",
    meta: "Ley 27.743 · Título V · 8-jul-2024 · vigente",
    desc: "Restitución del impuesto a las Ganancias 4ª categoría. MNI anual $5.151.802 (RG ARCA 5759/2025). Actualización semestral por IPC. Deducción específica para jubilados = 8 SMVM.",
    tags: ["Plata", "Carga mental", "Trabajo"],
    area: "Impuestos",
    estado: "vigente",
    fuente: "Boletín Oficial — Ley 27.743 (08-jul-2024) Título V. RG ARCA 5759/2025. AFIP/ARCA escalas y deducciones (Dto 953/2024 creó ARCA).",
    impact: function(p) {
      const dims = [];

      if (p.ocupacion === "empleado_priv" || p.ocupacion === "empleado_pub") {
        if (p.ingreso === "3m_6m") {
          const conHijos = (p.hijos === "1" || p.hijos === "2" || p.hijos === "3mas");
          dims.push({ name: "Plata", icon: "💰", level: "strong",
            body: `Estás en zona alcanzada. ${conHijos ? "Con hijos a cargo el MNI sube y la mordida es algo menor." : "Soltero/a sin hijos, el descuento mensual ronda $200k-$500k según escala."} Indexación IPC semestral.` });
        } else if (p.ingreso === "6m_15m" || p.ingreso === "mas_15m") {
          dims.push({ name: "Plata", icon: "💰", level: "strong",
            body: "Estás claramente alcanzado. Descuento mensual estimado: $500k-$1,5M+ según escala y deducciones. Representa 15-25% del bruto." });
        } else if (p.ingreso === "1.5m_3m") {
          dims.push({ name: "Plata", icon: "💰", level: "soft",
            body: "Estás en el filo. Si sos soltero/a y tu bruto supera ~$3M empezás a tributar; con hijos o pareja sin trabajo el MNI sube y probablemente no te alcanza todavía." });
        } else {
          dims.push({ name: "Plata", icon: "💰", level: "none",
            body: "Tu ingreso está por debajo del MNI. No te toca este impuesto." });
        }
      } else if (p.ocupacion === "jubilado_med") {
        dims.push({ name: "Plata", icon: "💰", level: "mid",
          body: "Haberes altos pueden quedar alcanzados, pero la <strong>deducción específica para jubilados (8 SMVM, ~$2,86M/mes a abr-26)</strong> tapa la mayoría. Si tenés rentas adicionales (alquiler, dividendos), perdés esa específica y entrás a la escala general." });
      } else if (p.ocupacion === "monotrib" || p.ocupacion === "autonomo") {
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "Monotributo puro no toca esta cuarta categoría. Si cruzaste el tope K ($108,3M/año en 2025) y pasaste a régimen general, la carga sube ~30-40 puntos." });
      } else {
        dims.push({ name: "Plata", icon: "💰", level: "none",
          body: "Por tu ocupación, este impuesto no te alcanza." });
      }

      if ((p.ocupacion === "empleado_priv" || p.ocupacion === "empleado_pub") &&
          (p.ingreso === "3m_6m" || p.ingreso === "6m_15m" || p.ingreso === "mas_15m" || p.ingreso === "1.5m_3m")) {
        dims.push({ name: "Carga mental", icon: "🧠", level: "mid",
          body: "Volvés a armar deducciones por SiRADIG: alquiler (10%), prepaga, hijos, cónyuge, empleada doméstica, servicio doméstico. Si sos pluri-empleado o tenés extras, declarás vos." });
        dims.push({ name: "Tiempo", icon: "⏰", level: "soft",
          body: "Declaración SiRADIG + revisión anual: 3-5 hs/año (más si tu situación es compleja). En 2023 con MNI alto no era necesario para la mayoría." });
      }

      if (p.extra === "plataforma" || p.extra === "segundo" || p.extra === "renta") {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
          body: "Con ingresos extra el cálculo se complica: tenés que sumar todo para declarar Ganancias bien. Pluri-empleo = pluri-retención = pluri-trámite." });
      }

      return dims;
    },
    compareProfiles: [
      { name: "Empleado priv $1M soltero", sub: "Empleado privado, $700k-1,5M, sin hijos", badges: { Plata: "none", "Carga mental": "none", Tiempo: "none", Trabajo: "none" } },
      { name: "Empleado priv $2M con 2 hijos", sub: "Empleado privado, $1,5M-3M, 2 hijos", badges: { Plata: "soft", "Carga mental": "soft", Tiempo: "soft", Trabajo: "none" } },
      { name: "Empleado priv $4M soltero", sub: "Empleado privado, $3M-6M, sin hijos", badges: { Plata: "strong", "Carga mental": "mid", Tiempo: "soft", Trabajo: "soft" } },
      { name: "Empleado público $2M", sub: "Empleado público, 1 hijo, $1,5M-3M", badges: { Plata: "soft", "Carga mental": "mid", Tiempo: "soft", Trabajo: "none" } },
      { name: "Jubilado haber medio + renta", sub: "Jubilado media-alta, renta", badges: { Plata: "mid", "Carga mental": "mid", Tiempo: "soft", Trabajo: "soft" } },
      { name: "Monotributista que cruzó tope K", sub: "Autónomo régimen general", badges: { Plata: "strong", "Carga mental": "strong", Tiempo: "mid", Trabajo: "strong" } }
    ]
  },

  {
    id: "subsidios_energeticos",
    date: "2025-10-15",
    title: "Cambió el subsidio a la luz y el gas",
    meta: "Decreto 943/2025 · Subsidio Energético Focalizado · vigente",
    desc: "Reemplazó el sistema N1/N2/N3. Ahora el subsidio se asigna por ingreso del hogar bajo un umbral (~$3,77M actualizable). Sobre el umbral, tarifa plena.",
    tags: ["Plata", "Servicios"],
    area: "Servicios",
    estado: "vigente",
    fuente: "Boletín Oficial — Decreto 943/2025. ENRE / ENARGAS cuadros tarifarios 2025-2026. Padrón RASE.",
    impact: function(p) {
      const dims = [];
      const tieneSEF = (p.asistencia || []).includes("sef");
      const umbralIngreso = ["hasta_700k","700k_1.5m","1.5m_3m"].includes(p.ingreso);

      if (tieneSEF || umbralIngreso) {
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "Por ingresos, probablemente mantengás el SEF (factura subsidiada). El subsidio cubre los primeros consumos esenciales — el excedente paga tarifa plena. Estimar tu factura completa según consumo mensual." });
      } else {
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "Por nivel de ingresos quedás fuera del SEF. La factura plena de luz puede ser <strong>2-4x mayor</strong> que con N1/N2 anterior. Gas natural: ajustes ENARGAS." });
      }

      if (p.discapacidad !== "no" && p.discapacidad) {
        dims.push({ name: "Servicios", icon: "🔌", level: "soft",
          body: "Hogares con CUD pueden acceder a regímenes especiales tarifarios (electrodependientes con certificación, tarifa diferencial). Verificá en EDENOR/EDESUR o tu distribuidora." });
      }

      if (p.ocupacion === "jubilado_min" || p.ocupacion === "pensionado") {
        dims.push({ name: "Plata", icon: "💰", level: "pos",
          body: "Jubilación mínima y pensiones quedan bajo el umbral de SEF — mantenés el subsidio. Aplica también si tu hogar suma poco más allá del haber." });
      }

      if ((p.hijos === "2" || p.hijos === "3mas") && (p.ingreso === "hasta_700k" || p.ingreso === "700k_1.5m")) {
        dims.push({ name: "Carga mental", icon: "🧠", level: "soft",
          body: "Hogares con muchos hijos consumen más luz / gas. Aún con SEF, el excedente sobre el consumo cubierto pega fuerte en invierno." });
      }

      if (p.vivienda === "ocupada") {
        dims.push({ name: "Servicios", icon: "🔌", level: "strong",
          body: "Vivienda informal suele tener conexiones irregulares de servicios. El cambio normativo no te afecta directamente, pero si vas a regularizar te encontrás con tarifas plenas." });
      }

      return dims;
    },
    compareProfiles: [
      { name: "Familia clase media CABA, $4M, sin SEF", sub: "Empleados, hijos, propia", badges: { Plata: "strong", Servicios: "soft", "Carga mental": "soft" } },
      { name: "Jubilada mínima CABA con SEF", sub: "Jubilada mínima, propia", badges: { Plata: "pos", Servicios: "none", "Carga mental": "none" } },
      { name: "Familia GBA con AUH y SEF", sub: "Cuidadora hogar, 2 hijos, $1M", badges: { Plata: "soft", Servicios: "soft", "Carga mental": "soft" } },
      { name: "Empresario PyME, sin SEF", sub: "PyME, ingreso alto", badges: { Plata: "mid", Servicios: "soft", "Carga mental": "none" } },
      { name: "Hogar con electrodependiente (CUD)", sub: "Familia, hijo con discapacidad", badges: { Plata: "soft", Servicios: "pos", "Carga mental": "mid" } }
    ]
  },

  {
    id: "jubilaciones",
    date: "2024-03-22",
    title: "Nueva movilidad jubilatoria",
    meta: "Decreto 274/2024 + Ley 27.756 vetada · vigente",
    desc: "Fórmula de movilidad ahora se ajusta mensualmente por IPC del INDEC. Se mantiene un bono de $70.000 congelado desde su creación (sin actualización en 28 meses).",
    tags: ["Plata", "Salud", "Carga mental"],
    area: "Jubilaciones",
    estado: "vigente",
    fuente: "Boletín Oficial — DNU 274/2024. Ley 27.756 vetada por el PEN. ANSES — Haber mínimo jun-2026: $403.318 + bono $70.000 = $473.318.",
    impact: function(p) {
      const dims = [];

      if (p.ocupacion === "jubilado_min") {
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: `<strong>Haber jun-2026: $403.318 + bono congelado $70.000 = $473.318</strong>. El bono no se actualiza desde su creación (28 meses): perdió ~70% de poder de compra. La movilidad mensual sigue el IPC pero <em>siempre con un mes de delay</em>.` });
        dims.push({ name: "Salud", icon: "❤️", level: "strong",
          body: "PAMI con vademécum reducido (restitución parcial vía amparo mar-2026). Adherencia a medicamentos cae cuando el copago supera el 4% del haber." });
        dims.push({ name: "Carga mental", icon: "🧠", level: "mid",
          body: "Defensoría 2025: <strong>14% de jubilados</strong> no completaron trámites por dificultades digitales (renovación Subsidio Social PAMI, etc.)." });
      } else if (p.ocupacion === "jubilado_med") {
        dims.push({ name: "Plata", icon: "💰", level: "mid",
          body: "Haberes medios-altos: ajuste IPC mensual mantiene poder de compra mejor que el haber mínimo, pero el bono sigue siendo cero (sin bono para haberes por encima del mínimo)." });
      } else if (p.ocupacion === "pensionado") {
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "Las pensiones no contributivas siguen el régimen pero <em>quedan más rezagadas</em> en revalorización efectiva. Suelen sufrir más cuando se demoran las altas (auditoría de padrones 2024-25)." });
      }

      if (p.salud === "pami" && (p.ocupacion === "jubilado_min" || p.ocupacion === "pensionado")) {
        dims.push({ name: "Salud", icon: "❤️", level: "mid",
          body: "PAMI tuvo restitución parcial del vademécum tras amparos. El acceso depende del centro médico y de tener Subsidio Social tramitado." });
      }

      if (p.adultos === "1" || p.adultos === "2mas") {
        dims.push({ name: "Vida familiar", icon: "👨‍👩‍👧", level: "mid",
          body: "Si tenés adultos mayores a cargo, la caída real del haber mínimo + bono congelado se traduce en mayor presión económica sobre vos. Suelen aparecer ayudas extra del entorno." });
      }

      return dims;
    },
    compareProfiles: [
      { name: "Jubilada mínima CABA, sin obra social privada", sub: "Solo PAMI, propia", badges: { Plata: "strong", Salud: "strong", "Carga mental": "mid", Familia: "soft" } },
      { name: "Jubilado haber medio, prepaga", sub: "PAMI + prepaga, $1,5M", badges: { Plata: "mid", Salud: "soft", "Carga mental": "soft", Familia: "none" } },
      { name: "Pensión no contributiva por discapacidad", sub: "Pensionado PNC, familiar a cargo", badges: { Plata: "strong", Salud: "strong", "Carga mental": "mid", Familia: "mid" } },
      { name: "Hijo/a sostiene a padre jubilado mínima", sub: "Empleado priv + adulto a cargo", badges: { Plata: "mid", Salud: "soft", "Carga mental": "mid", Familia: "strong" } },
      { name: "Pareja jubilada (ambos mínima)", sub: "Dos haberes mínimos + 2 bonos", badges: { Plata: "strong", Salud: "strong", "Carga mental": "mid", Familia: "none" } }
    ]
  },

  {
    id: "monotributo_plataformas",
    date: "2026-02-12",
    title: "Reforma laboral: Uber, Rappi y Pedidos Ya entran al Monotributo",
    meta: "Ley de Modernización Laboral · feb-2026 · vigente",
    desc: "Trabajadores de plataformas (Uber, Rappi, Pedidos Ya, Cabify) ahora están formalmente reconocidos como independientes y deben estar inscriptos en Monotributo. Aportes mínimos y obra social mínima.",
    tags: ["Trabajo", "Plata", "Salud"],
    area: "Trabajo",
    estado: "vigente",
    fuente: "Boletín Oficial — Ley de Modernización Laboral feb-2026. ARCA — categorías Monotributo 2026.",
    impact: function(p) {
      const dims = [];

      if (p.extra === "plataforma") {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
          body: "Tu actividad ahora es formal: necesitás inscripción Monotributo activa. Las plataformas verifican CUIT. Ganaste cobertura mínima (jubilación, obra social), pero te impacta el costo de la cuota." });
        dims.push({ name: "Plata", icon: "💰", level: "mid",
          body: "Cuota Monotributo (categoría más común para plataformas): ~$70-150k/mes según escala. Si ya pagabas Monotributo como actividad principal, la suma de ingresos te puede empujar a categoría superior." });
        dims.push({ name: "Salud", icon: "❤️", level: "pos",
          body: "Ahora accedés a obra social vía Monotributo. Cobertura limitada pero existe — antes era cobertura cero." });
        dims.push({ name: "Carga mental", icon: "🧠", level: "mid",
          body: "Tenés que recategorizar cada 6 meses según facturación. Si combinás otro Monotributo o sueldo, el cálculo se complica." });
      }

      if (p.ocupacion === "monotrib" && p.extra === "plataforma") {
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "soft",
          body: "Como ya estabas en el sistema, la Reforma te formaliza el ingreso adicional. Riesgo: si tu cat. principal está cerca del tope, el ingreso plataforma te empuja arriba." });
      }

      if (p.ocupacion === "trab_informal" && p.extra === "plataforma") {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "strong",
          body: "Si tu única actividad es plataforma y estabas en negro, ahora la formalización es obligatoria. Es un cambio fuerte: requiere AFIP/ARCA, alta, monotributo. La obra social compensa, el costo administrativo no." });
      }

      if (p.extra !== "plataforma" && p.ocupacion !== "monotrib") {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "none",
          body: "Por ahora no te toca. Si en el futuro complementás con Uber/Rappi, la formalización ya es ley." });
      }

      return dims;
    },
    compareProfiles: [
      { name: "Conductor Uber full-time, antes informal", sub: "Trab. informal → monotrib obligatorio", badges: { Trabajo: "strong", Plata: "mid", Salud: "pos", "Carga mental": "mid" } },
      { name: "Monotrib + Uber complemento", sub: "Monotributista cat D + plataforma", badges: { Trabajo: "mid", Plata: "soft", Salud: "pos", "Carga mental": "mid" } },
      { name: "Empleado privado que hace Rappi finde", sub: "Empleado + plataforma part-time", badges: { Trabajo: "mid", Plata: "soft", Salud: "soft", "Carga mental": "soft" } },
      { name: "Repartidor Rappi solo, sin otro ingreso", sub: "Único ingreso plataforma", badges: { Trabajo: "strong", Plata: "mid", Salud: "pos", "Carga mental": "strong" } },
      { name: "Estudiante que hace Pedidos Ya algunas horas", sub: "Estudiante + plataforma", badges: { Trabajo: "mid", Plata: "soft", Salud: "soft", "Carga mental": "mid" } }
    ]
  },

  {
    id: "veto_financiamiento_universitario_2025",
    date: "2025-10-02",
    title: "Veto rechazado del Financiamiento Universitario",
    meta: "Ley 27.795 · veto rechazado por Congreso (Dto 647/2025) · vigente",
    desc: "El Ejecutivo vetó la Ley 27.795 de Financiamiento Universitario por Decreto 647/2025. Diputados (181-60-1 el 17-sep-2025) y Senado (58-7-4 el 02-oct-2025) ratificaron la ley con los 2/3 constitucionales. La ley quedó promulgada por insistencia.",
    tags: ["Educación", "Salud", "País"],
    area: "Educación",
    estado: "vigente",
    fuente: "Boletín Oficial · Ley 27.795 · Decreto 647/2025 · Diario de Sesiones HCDN 17-sep-2025 · HSN 02-oct-2025",
    impact: function(p) {
      const dims = [];

      // BRANCH 1 — Estudiante (cualquier ingreso/ubicación)
      if (p.ocupacion === 'estudiante') {
        dims.push({ name: "Educación", icon: "📚", level: "pos_strong",
          body: "Garantiza continuidad de cursada sin aranceles encubiertos y restaura el fondo de becas. Si cursás en universidad nacional, tu carrera sigue en pie." });
        dims.push({ name: "Plata", icon: "💰", level: "pos",
          body: "Becas restituidas (Progresar y otras) con ajuste mensual que recupera el poder de compra perdido durante el congelamiento previo." });
        dims.push({ name: "Movilidad social", icon: "🛤️", level: "pos_soft",
          body: "La universidad pública sigue siendo vía concreta de progreso para sectores medios y bajos." });
        dims.push({ name: "Carga mental", icon: "🧠", level: "pos_soft",
          body: "Menor incertidumbre sobre el futuro de tu carrera." });
      }

      // BRANCH 2 — Cualquier perfil con hijos a cargo (no estudiante)
      const tieneHijos = p.hijos === '1' || p.hijos === '2' || p.hijos === '3mas';
      if (tieneHijos && p.ocupacion !== 'estudiante') {
        dims.push({ name: "Educación", icon: "📚", level: "pos_strong",
          body: "Continuidad del sistema donde tus hijos van o pueden ir a estudiar." });
        dims.push({ name: "Plata", icon: "💰", level: "pos_soft",
          body: "No tenés que cubrir aranceles privados ni becas perdidas." });
        dims.push({ name: "Vida familiar / ocio", icon: "👨‍👩‍👧", level: "pos_soft",
          body: "Menos estrés económico extra alrededor de la carrera de tus hijos." });
      }

      // BRANCH 3 — Empleado público (cualquier nivel)
      if (p.ocupacion === 'empleado_pub') {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "pos",
          body: "Si trabajás en el sector universitario, recomposición salarial garantizada. Si trabajás en otro sector público, sienta precedente: el Ejecutivo no puede recortar partidas que el Congreso votó." });
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "pos_soft",
          body: "La defensa de partidas votadas refuerza el rol del sector público." });
      }

      // BRANCH 4 — Jubilado / Pensionado / Cuidado hogar / desempleado / trabajador informal sin hijos
      const sinHijos = !tieneHijos;
      const perfilSistemico = ['jubilado_min','jubilado_med','pensionado','ama_casa','desempleado','trab_informal','domestica_reg','domestica_no_reg'].includes(p.ocupacion);
      if (perfilSistemico && sinHijos) {
        dims.push({ name: "Salud", icon: "❤️", level: "pos_soft",
          body: "La universidad pública es la fábrica de médicos, enfermeros y kinesiólogos que vas a necesitar los próximos años. Defenderla = más profesionales formados disponibles a futuro." });
        dims.push({ name: "Calidad de servicios", icon: "🔌", level: "pos_soft",
          body: "Misma lógica para abogados, contadores, ingenieros, agrónomos. La calidad futura de los servicios que vos consumís depende de quién se forma hoy." });
        dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "pos",
          body: "El rechazo del veto por los 2/3 demuestra que el Congreso ejerce su rol constitucional sobre el presupuesto (art. 75:8 CN). Refuerza el equilibrio de poderes que la Constitución diseña." });
      }

      // BRANCH 5 — Empleado privado / autónomo / monotrib / PyME sin hijos (impacto sistémico futuro)
      const perfilProductivo = ['empleado_priv','autonomo','monotrib','pyme'].includes(p.ocupacion);
      if (perfilProductivo && sinHijos) {
        dims.push({ name: "Educación", icon: "📚", level: "pos_soft",
          body: "Si en el futuro vos o tu familia quieren cursar, el sistema sigue disponible. Es una opción concreta para movilidad social." });
        dims.push({ name: "Calidad de servicios", icon: "🔌", level: "pos_soft",
          body: "Profesionales calificados disponibles a futuro para tu vida y trabajo." });
        if (p.ocupacion === 'pyme') {
          dims.push({ name: "Trabajo", icon: "🛠️", level: "pos_soft",
            body: "RRHH calificado (ingenieros, contadores, profesionales) disponibles a futuro para contratar." });
        }
      }

      return dims;
    },
    compareProfiles: [
      { name: "Estudiante UBA, alquila CABA", sub: "Estudiante, alquila, sin hijos, hasta $700k", badges: { Educación: "pos_strong", Plata: "pos", Movilidad: "pos_soft", "Carga mental": "pos_soft" } },
      { name: "Empleado privado con 2 hijos en universidad", sub: "Empleado privado, propio, 2 hijos, $1,5M-3M", badges: { Educación: "pos_strong", Plata: "pos_soft", Familia: "pos_soft" } },
      { name: "Empleado público (sector universitario)", sub: "Empleado público, alquila, 1 hijo, $700k-1,5M", badges: { Educación: "pos_strong", Plata: "pos_soft", Familia: "pos_soft", Trabajo: "pos", Estabilidad: "pos_soft" } },
      { name: "Jubilado mínima sin familia en universidad", sub: "Jubilado mínima, propio, sin hijos, hasta $700k", badges: { Salud: "pos_soft", Servicios: "pos_soft", País: "pos" } },
      { name: "Monotributista sin hijos", sub: "Monotributista, propio, sin hijos, $700k-1,5M", badges: { Educación: "pos_soft", Servicios: "pos_soft" } },
      { name: "PyME del interior", sub: "PyME, propio, sin hijos, $3M-6M", badges: { Educación: "pos_soft", Servicios: "pos_soft", Trabajo: "pos_soft" } }
    ]
  },

  {
    id: "telam_cierre_ape",
    title: "Cierre de Télam y transformación en APE",
    date: "2024-07-01",
    meta: "DNU 538/2024 · jul-2024 · vigente",
    desc: "Cierre de la Agencia Télam (creada en 1945, principal agencia nacional de noticias) y reconversión en Agencia de Publicidad del Estado. ~700+ empleados afectados (despedidos, indemnizados o reubicados).",
    tags: ["Trabajo","País","Comunicaciones"],
    fuente: "Boletín Oficial — DNU 538/2024. Amparos sindicales SiPreBA, FATPREN (rechazados en Cámara).",
    impact: function(p) {
      const dims = [];
      // Empleado público
      if (p.ocupacion === 'empleado_pub') {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "strong",
          body: "700+ puestos del sector público de comunicación cerrados. Sienta precedente directo de que el Ejecutivo puede cerrar agencias públicas por decreto. Vos no necesariamente perdés tu puesto, pero el lugar donde trabajás es más vulnerable." });
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "mid",
          body: "Reducción del aparato estatal de información sin reemplazo equivalente." });
      }
      // Empleado privado del sector medios (proxy: empleado_priv + zona caba/gba)
      const enAMBA = p.zona === 'caba' || p.zona === 'gba_norte' || p.zona === 'gba_sur' || p.zona === 'gba_oeste';
      if (p.ocupacion === 'empleado_priv' && enAMBA) {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "soft",
          body: "Saturación del mercado laboral de periodistas y técnicos del sector medios. Caída de demanda en cobertura nacional. Si trabajás en prensa privada, hay más competencia por menos puestos." });
      }
      // Sociedad en general (perfiles sin conexión laboral directa)
      const noEsEmpleadoPub = p.ocupacion !== 'empleado_pub';
      const noEsMedios = !(p.ocupacion === 'empleado_priv' && enAMBA);
      if (noEsEmpleadoPub && noEsMedios) {
        dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
          body: "Menos pluralidad en producción de noticias estatales. Las provincias y los medios alternativos pierden una fuente histórica de información gratuita y federal." });
        dims.push({ name: "Calidad de servicios", icon: "🔌", level: "soft",
          body: "Cobertura de eventos provinciales y regionales se reduce. Las noticias del interior tienden a estar más concentradas en menos medios comerciales con sede en CABA." });
      }
      // Empresario PyME / Gran empresario sector publicidad y medios privados
      if (p.ocupacion === 'pyme') {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "pos_soft",
          body: "La APE redirecciona pauta oficial: los medios privados pueden recibir más pauta directa al no competir con producción estatal." });
      }
      // Estudiante / impacto educativo leve
      if (p.ocupacion === 'estudiante') {
        dims.push({ name: "Educación", icon: "📚", level: "soft",
          body: "Menos fuentes públicas de información para investigación y trabajos académicos. Los archivos históricos de Télam están en proceso de migración con calidad incierta." });
      }
      return dims;
    },
    compareProfiles: [
      { name: "Empleado público nacional sector medios", sub: "Estatal · Comunicación", badges: { Trabajo: "strong", Estabilidad: "mid", "País / Equilibrio institucional": "soft" } },
      { name: "Periodista freelance CABA", sub: "Empleado privado · Medios", badges: { Trabajo: "soft", "País / Equilibrio institucional": "soft" } },
      { name: "Ciudadano del interior", sub: "Jubilado · Interior", badges: { "País / Equilibrio institucional": "soft", "Calidad de servicios": "soft" } },
      { name: "PyME publicidad sector medios privados", sub: "Empresario PyME · CABA", badges: { Trabajo: "pos_soft", "Calidad de servicios": "none" } },
      { name: "Estudiante de comunicación", sub: "Estudiante · CABA", badges: { Educación: "soft", "País / Equilibrio institucional": "soft" } }
    ]
  },

  {
    id: "ley_bases_rigi",
    title: "RIGI — Régimen de Incentivo para Grandes Inversiones",
    date: "2024-07-08",
    meta: "Ley 27.742 Título VII · Dto 749/2024 · vigente",
    desc: "Para proyectos USD 200M+ en minería, hidrocarburos, energía, infraestructura, agroindustria y forestal. Beneficios por 30 años: Ganancias 18,75% (vs 25%), estabilidad fiscal y cambiaria, libre disponibilidad de dividendos, sin retenciones a exportaciones. ~USD 25.500M aprobados a jun-2026.",
    tags: ["Plata","Trabajo","País"],
    fuente: "Boletín Oficial — Ley 27.742 · Dto 749/2024 reglamentación · RG ARCA importaciones. Informes CGERA, IPA, UIA, Aviacionline.",
    impact: function(p) {
      const dims = [];
      const enZonaRIGI = p.zona === 'mendoza' || p.zona === 'noa' || p.zona === 'cuyo' || p.zona === 'patagonia';
      // PyME (sin distinción sector — el front no tiene perfil de sector productivo específico)
      if (p.ocupacion === 'pyme') {
        if (enZonaRIGI) {
          dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
            body: "Si tu sector entra en RIGI (minería, energía, infraestructura, agroindustria, forestal), competís contra proyectos que importan bienes de capital sin aranceles. Tus costos en pesos son 25-40% más altos por el mismo equipamiento. La obligación de 20% de compre local existe en el papel pero NO tiene sanción por incumplimiento — en la práctica es letra muerta." });
          dims.push({ name: "Plata", icon: "💰", level: "mid",
            body: "Competís con proyectos que tienen estabilidad cambiaria a 30 años y alícuotas Ganancias 18,75% vs tu 25%. La asimetría tributaria afecta tu margen." });
          dims.push({ name: "Estabilidad", icon: "🛡️", level: "mid",
            body: "Vos no tenés blindaje a 30 años; ellos sí. Te quedás expuesto a cambios normativos mientras la inversión grande tiene garantía." });
        } else {
          dims.push({ name: "Plata", icon: "💰", level: "soft",
            body: "La merma fiscal del RIGI se compensa con impuestos generales que vos sí pagás (Ganancias, IVA, contribuciones). Carga indirecta." });
        }
      }
      // Empleado privado / autónomo / monotributista
      const esTrabajadorComun = p.ocupacion === 'empleado_priv' || p.ocupacion === 'autonomo' || p.ocupacion === 'monotrib';
      if (esTrabajadorComun) {
        if (enZonaRIGI) {
          dims.push({ name: "Trabajo", icon: "🛠️", level: "pos",
            body: "Más empleo formal en proyectos RIGI en tu provincia (Vaca Muerta, litio del NOA, Mendoza minera, etc.). Salarios pueden subir en zonas con boom de inversión." });
          dims.push({ name: "Plata", icon: "💰", level: "pos_soft",
            body: "Mejores condiciones salariales locales en regiones con proyecto activo." });
        } else {
          dims.push({ name: "Plata", icon: "💰", level: "soft",
            body: "La pérdida de recaudación del RIGI se compensa indirectamente con impuestos generales que pagás (Ganancias, IVA)." });
        }
      }
      // Empleado público
      if (p.ocupacion === 'empleado_pub') {
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "La merma fiscal del RIGI presiona el presupuesto general, lo que puede afectar las partidas que financian tu sector." });
      }
      // Jubilado / Pensionado
      if (p.ocupacion === 'jubilado_min' || p.ocupacion === 'jubilado_med' || p.ocupacion === 'pensionado') {
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "Presión fiscal a mediano plazo puede impactar fondos previsionales." });
        dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "mid",
          body: "Los proyectos RIGI tienen jurisdicción internacional para disputas (CIADI). Compromiso a 30 años por encima del ciclo electoral. Debate constitucional sobre soberanía en proyectos en territorio argentino." });
      }
      // Estudiante / informal / cuidado hogar / desempleado
      const perfilSocial = p.ocupacion === 'estudiante' || p.ocupacion === 'trab_informal' || p.ocupacion === 'ama_casa' || p.ocupacion === 'desempleado';
      if (perfilSocial) {
        if (enZonaRIGI) {
          dims.push({ name: "Movilidad social", icon: "🛤️", level: "pos_soft",
            body: "Más oportunidad de empleo formal a futuro en sector beneficiado por la inversión." });
        }
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "Carga fiscal general que termina pagando todo contribuyente." });
      }
      return dims;
    },
    compareProfiles: [
      { name: "Gran empresario sector RIGI", sub: "Empresario · USD 200M+", badges: { Plata: "pos_strong", Trabajo: "pos", Estabilidad: "pos_strong" } },
      { name: "PyME zona RIGI sector competidor", sub: "Empresario PyME · NOA", badges: { Plata: "mid", Trabajo: "mid", Estabilidad: "mid" } },
      { name: "Empleado Vaca Muerta", sub: "Empleado privado · Patagonia", badges: { Trabajo: "pos", Plata: "pos_soft" } },
      { name: "Empleado privado CABA sin sector RIGI", sub: "Empleado privado · CABA", badges: { Plata: "soft", Trabajo: "none" } },
      { name: "Jubilado mínima CABA", sub: "Jubilado · No zona RIGI", badges: { Plata: "soft", "País / Equilibrio institucional": "mid" } },
      { name: "PyME no RIGI interior", sub: "Empresario PyME · Sector ajeno", badges: { Plata: "soft", Trabajo: "none" } }
    ]
  },

  {
    id: "aerolineas_argentinas_sujeta_privatizacion",
    title: "Aerolíneas Argentinas — sujeta a privatización",
    date: "2024-10-02",
    meta: "Decreto 873/2024 · Ley 27.742 · empresa aún estatal",
    desc: "Declaración formal de Aerolíneas Argentinas como 'sujeta a privatización'. Cierre de rutas no rentables (NY, La Habana). Programa 'Conectividad Sustentable' (rutas a provincias con coparticipación provincial). 2024: primer EBIT positivo USD 56,6M. 2025: primer año sin aporte del Tesoro. Privatización efectiva no concretada — reenvío al Congreso previsto feb-mar 2026.",
    tags: ["Trabajo","Movilidad","Plata"],
    fuente: "Boletín Oficial — Dto 873/2024 · Ley 27.742. Aerolíneas Argentinas reporte 2024. Infobae, Ámbito, El Cronista, Aviacionline.",
    impact: function(p) {
      const dims = [];
      const enInterior = !['caba','gba_norte','gba_sur','gba_oeste','laplata'].includes(p.zona);
      const enProvinciaInternacionalNueva = p.zona === 'mendoza' || p.zona === 'noa' || p.zona === 'cuyo' || p.zona === 'patagonia';
      const enZonaConectividadDebil = p.zona === 'nea' || p.zona === 'noa' || p.zona === 'cuyo' || p.zona === 'patagonia' || p.zona === 'pueblo';
      // Empleado de AA (proxy: empleado_priv en transporte/comunicaciones — el front no lo distingue, no aplico directo)
      // Habitante de provincia con ruta no troncal
      if (enZonaConectividadDebil && p.transporte !== 'cerca' && p.transporte !== 'solo_finde') {
        dims.push({ name: "Movilidad", icon: "🛤️", level: "strong",
          body: "Tu ciudad puede quedar sin vuelo si tu provincia/municipio no firma el Programa Conectividad Sustentable. Sin vuelo, la alternativa es 600-1.200 km en auto o tren si existe. Es desconexión real." });
        dims.push({ name: "Vacaciones", icon: "🏖️", level: "mid",
          body: "Familia se mueve menos. Tarifas más altas en lo que queda." });
        dims.push({ name: "Salud", icon: "❤️", level: "mid",
          body: "Si necesitás derivación médica a CABA o Córdoba para tratamiento especializado, sin vuelo el traslado es complicación seria. Pacientes oncológicos, trasplantados, dialisados: el tiempo cuenta." });
      }
      // Habitante de provincia con NUEVA ruta internacional
      if (enProvinciaInternacionalNueva) {
        dims.push({ name: "Movilidad", icon: "🛤️", level: "pos_soft",
          body: "15 nuevas rutas internacionales directas desde provincias en 2025 (Mendoza-Madrid, Bariloche-Santiago, Salta-Lima, etc.). Si vivís en NOA, Cuyo o Patagonia turística, más opciones de vuelo directo al exterior." });
        dims.push({ name: "Vacaciones", icon: "🏖️", level: "pos_soft",
          body: "Si vivís en provincia y querés viajar al exterior, los nuevos vuelos directos ahorran tiempo y dinero." });
      }
      // Jubilado / Pensionado
      if (p.ocupacion === 'jubilado_min' || p.ocupacion === 'jubilado_med' || p.ocupacion === 'pensionado') {
        dims.push({ name: "Vacaciones", icon: "🏖️", level: "mid",
          body: "Pérdida de descuentos especiales para jubilados/mayores en AA. Si tenés familia en otra provincia y dependías del descuento, ahora pagás tarifa común." });
        dims.push({ name: "Vida familiar / ocio", icon: "👨‍👩‍👧", level: "mid",
          body: "Si tu familia vive a más de 1.000 km, visitar cuesta más." });
      }
      // PyME del interior turismo
      if (p.ocupacion === 'pyme' && enInterior) {
        if (enProvinciaInternacionalNueva) {
          dims.push({ name: "Trabajo", icon: "🛠️", level: "pos_soft",
            body: "Más turismo entrante a tu provincia gracias a nuevas rutas internacionales directas." });
        } else if (enZonaConectividadDebil) {
          dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
            body: "Si tu provincia perdió frecuencia y no firmó Conectividad Sustentable, el turismo aéreo a tu ciudad se contrae. Hotelería, gastronomía, transporte regional sufren." });
        }
      }
      // Estudiante del interior cursando en otra provincia (proxy: estudiante en interior)
      if (p.ocupacion === 'estudiante' && enInterior) {
        dims.push({ name: "Educación", icon: "📚", level: "soft",
          body: "Si cursás en universidad de otra provincia (UBA, UNC, UNR), volver a tu casa cuesta más. En el extremo, no podés ir." });
        dims.push({ name: "Vida familiar / ocio", icon: "👨‍👩‍👧", level: "soft",
          body: "Menos visitas a tu familia." });
      }
      // Pasajero rutas troncales (CABA/AMBA)
      if (!enInterior && p.transporte !== 'cerca') {
        dims.push({ name: "Vacaciones", icon: "🏖️", level: "soft",
          body: "Tarifas subieron en 2024-2025. Descuentos especiales se redujeron. Las rutas troncales siguen con frecuencias estables (69 vuelos/semana a Córdoba, 63 a Bariloche)." });
      }
      // Trabajador del ecosistema indirecto (proxy: empleado_priv + zona aeroportuaria)
      const enZonaAeroportuaria = enInterior || ['caba','gba_norte'].includes(p.zona);
      if (p.ocupacion === 'empleado_priv' && enZonaAeroportuaria) {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "soft",
          body: "El ecosistema indirecto de Aerolíneas (handlers, agencias de viajes, hotelería de hub, transporte terrestre) emplea 3-4x la plantilla directa. Si AA reduce frecuencias en tu ciudad, los puestos indirectos también caen." });
      }
      // Contribuyente argentino (ganador objetivo)
      if (!['empleado_pub','trab_informal','desempleado'].includes(p.ocupacion)) {
        dims.push({ name: "Plata", icon: "💰", level: "pos_soft",
          body: "Ahorro fiscal real USD 400M/año en subsidios al Tesoro Nacional. AA no recibió aporte del Tesoro en 2025 por primera vez desde 2008." });
      }
      return dims;
    },
    compareProfiles: [
      { name: "Habitante Resistencia / Posadas", sub: "Provincia ruta no troncal", badges: { Movilidad: "strong", Vacaciones: "mid", Salud: "mid" } },
      { name: "Habitante Mendoza / Bariloche", sub: "Provincia con nueva ruta internacional", badges: { Movilidad: "pos_soft", Vacaciones: "pos_soft" } },
      { name: "Jubilado con hijos lejos", sub: "Jubilado · Familia interprovincial", badges: { Vacaciones: "mid", "Vida familiar / ocio": "mid" } },
      { name: "PyME hotelera Bariloche", sub: "PyME · Provincia con ruta nueva", badges: { Trabajo: "pos_soft" } },
      { name: "PyME hotelera ciudad chica NEA", sub: "PyME · Conectividad débil", badges: { Trabajo: "mid" } },
      { name: "Empleado CABA aeropuerto / handler", sub: "Ecosistema indirecto", badges: { Trabajo: "soft" } },
      { name: "Contribuyente sin viajes aéreos", sub: "Empleado priv. CABA · No vuela", badges: { Vacaciones: "soft", Plata: "pos_soft" } }
    ]
  },

  {
    id: "pami_vademecum_reducido",
    title: "PAMI restringe medicamentos al 100%",
    date: "2024-11-29",
    meta: "Resoluciones 2431/2024 y 2537/2024 · cautelar parcial activa",
    desc: "PAMI endureció el subsidio social: umbral pasó de 5% a 15% del ingreso en medicamentos, no tener auto < 15 años (antes 10), reclasificación de medicamentos comunes como 'eventuales' (paracetamol, omeprazol, loratadina, etc.). 850.000 afiliados afectados. Cautelar Mendoza oct-2025 restituyó parcialmente; Res. 428/2026 restauró parcialmente cobertura.",
    tags: ["Salud","Plata","Carga mental"],
    fuente: "Boletín Oficial — Resoluciones PAMI 2431/2024, 2537/2024, 428/2026. Cautelar Juzgado Federal N°2 Mendoza (Quirós) 29-oct-2025. Defensoría Adultos Mayores 2025.",
    impact: function(p) {
      const dims = [];
      // Jubilado mínima
      if (p.ocupacion === 'jubilado_min') {
        dims.push({ name: "Salud", icon: "❤️", level: "strong",
          body: "Si tomás 3-4 medicamentos crónicos que quedaron fuera del 100% (omeprazol, losartán, paracetamol, vitaminas), gastás de bolsillo $25-60k/mes (5-15% del haber). Defensoría 2025: cuando el costo supera el 4% del haber, la adherencia farmacológica cae 12-15%. Eso es más descompensaciones, más internaciones." });
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "Sobre un haber de $473k, $48k/mes en medicamentos es 10% del bolsillo solo en farmacia." });
        dims.push({ name: "Carga mental", icon: "🧠", level: "mid",
          body: "Renovar el Subsidio Social cada año, juntar facturas, pelear con farmacia. Defensoría 2025: 14% de jubilados no completaron el trámite por dificultad digital o burocrática." });
        dims.push({ name: "Vida familiar / ocio", icon: "👨‍👩‍👧", level: "soft",
          body: "Recortás otras cosas para cubrir farmacia. Salidas, visitas, gastos chicos que daban placer." });
      }
      // Jubilado medio
      if (p.ocupacion === 'jubilado_med') {
        dims.push({ name: "Salud", icon: "❤️", level: "mid",
          body: "La prepaga puede tapar algo, pero los pisos de cobertura también se redujeron. Pagás más coseguros que antes." });
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "Impacto relativo menor sobre tu ingreso, pero cualquier crónico extra sin cobertura te toca." });
      }
      // Pensionado (PNC)
      if (p.ocupacion === 'pensionado') {
        dims.push({ name: "Salud", icon: "❤️", level: "strong",
          body: "Misma lógica que jubilado mínima, agravada si la pensión es por discapacidad y requiere medicación específica." });
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "Haberes PNC son aún más bajos que jubilación mínima. La proporción del bolsillo en farmacia es mayor." });
      }
      // Hijo/familiar con adultos a cargo
      const adultosCargo = p.adultos === '1' || p.adultos === '2mas';
      if (adultosCargo && p.ocupacion !== 'jubilado_min' && p.ocupacion !== 'jubilado_med' && p.ocupacion !== 'pensionado') {
        dims.push({ name: "Plata", icon: "💰", level: "mid",
          body: "Le cubrís $30-60k/mes de medicamentos a tu padre/madre que antes era gratis. Si tenés más de un mayor a cargo, se duplica." });
        dims.push({ name: "Carga mental", icon: "🧠", level: "mid",
          body: "Te ocupás del trámite de Subsidio Social, llamás al PAMI, pedís recetas, vas a la farmacia. Tiempo y energía que sumás a tu vida." });
        dims.push({ name: "Tiempo", icon: "⏰", level: "soft",
          body: "Trámites, esperas en farmacia, llamadas: 4-6 horas extra al mes." });
      }
      // Sociedad en general (sin adultos a cargo, no jubilado)
      const noJubilado = p.ocupacion !== 'jubilado_min' && p.ocupacion !== 'jubilado_med' && p.ocupacion !== 'pensionado';
      const sinAdultosCargo = !adultosCargo;
      if (noJubilado && sinAdultosCargo) {
        dims.push({ name: "Salud", icon: "❤️", level: "soft",
          body: "El sistema de salud pública se llena con casos que podrían haberse evitado con medicación a tiempo. Hospitales reportan más complicaciones por hipertensión y diabetes mal controladas." });
        dims.push({ name: "Calidad de servicios", icon: "🔌", level: "soft",
          body: "Más espera en hospitales públicos, menos turnos disponibles." });
        dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
          body: "La cautelar judicial sigue abierta y PAMI apeló. Debate sobre si una resolución administrativa puede modificar coberturas que el régimen estableció." });
      }
      return dims;
    },
    compareProfiles: [
      { name: "Jubilada mínima sin prepaga", sub: "Jubilado mín. · PAMI sola", badges: { Salud: "strong", Plata: "strong", "Carga mental": "mid", "Vida familiar / ocio": "soft" } },
      { name: "Jubilado medio con prepaga", sub: "Jubilado med. · Mixta", badges: { Salud: "mid", Plata: "soft" } },
      { name: "Pensión no contributiva discapacidad", sub: "Pensionado · PNC", badges: { Salud: "strong", Plata: "strong" } },
      { name: "Empleado priv. con padre jubilado a cargo", sub: "Empleado · Adulto a cargo", badges: { Plata: "mid", "Carga mental": "mid", Tiempo: "soft" } },
      { name: "Adulto joven sin familia mayor", sub: "Empleado · Sin adultos a cargo", badges: { Salud: "soft", "Calidad de servicios": "soft", "País / Equilibrio institucional": "soft" } }
    ]
  },

  {
    id: "reorganizacion_ministerios_8_2023",
    title: "Reorganización de Ministerios — Ley de Ministerios",
    date: "2023-12-11",
    meta: "Decreto 8/2023 · vigente · 60.494 desvinculaciones a nov-2025",
    desc: "Reducción de 18 a 8 ministerios. Creación del Ministerio de Capital Humano (absorbe Educación + Salud + Trabajo + Desarrollo Social). 60.494 despidos en sector público dic-23/nov-25 (9,6% del plantel). USD 1.885M ahorro fiscal anual estimado.",
    tags: ["Trabajo","Servicios","Plata"],
    fuente: "Boletín Oficial — Decreto 8/2023 + sucesivos. SIPA, INDEC, Ministerio Capital Humano (datos plantel). Perfil, Ámbito, El Cronista (despidos).",
    impact: function(p) {
      const dims = [];
      // Empleado público
      if (p.ocupacion === 'empleado_pub') {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "strong",
          body: "60.494 desvinculaciones en 2 años = ~10% del plantel total nacional. Si seguís en tu puesto, la rotación a tu alrededor es masiva. Capital Humano perdió 6.111 personas — compañeros despedidos, equipos desarmados, funciones redistribuidas sobre menos gente." });
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "strong",
          body: "Régimen de no renovación masiva. Tu continuidad depende de evaluaciones discrecionales." });
        dims.push({ name: "Carga mental", icon: "🧠", level: "strong",
          body: "Incertidumbre constante: ¿me toca a mí el próximo trimestre? UMET 2025 documentó picos de ansiedad en empleados públicos nacionales por encima del promedio." });
        dims.push({ name: "Plata", icon: "💰", level: "mid",
          body: "Salarios congelados o ajustados por debajo de la inflación en 2024. Si te despiden: indemnización + pérdida de cobertura/obra social mientras buscás trabajo." });
        dims.push({ name: "Tiempo", icon: "⏰", level: "soft",
          body: "Sobrecarga: mismo volumen de trabajo administrado por menos personas." });
      }
      // Jubilado / Pensionado (depende de ANSES, PAMI)
      if (p.ocupacion === 'jubilado_min' || p.ocupacion === 'jubilado_med' || p.ocupacion === 'pensionado') {
        dims.push({ name: "Calidad de servicios", icon: "🔌", level: "mid",
          body: "Atención de ANSES con menos personal. Esperas pasaron de 2-3 a 5-7 días para trámites comunes. Líneas telefónicas saturadas." });
        dims.push({ name: "Tiempo", icon: "⏰", level: "mid",
          body: "Trámites de PAMI o ANSES más lentos. Defensoría 2025: 14% de trámites no completados por dificultad digital o burocrática." });
      }
      // Empleado privado / Autónomo / Monotributista (hace trámites con Estado)
      const esTrabajadorComun = p.ocupacion === 'empleado_priv' || p.ocupacion === 'autonomo' || p.ocupacion === 'monotrib';
      if (esTrabajadorComun) {
        dims.push({ name: "Tiempo", icon: "⏰", level: "mid",
          body: "Trámites con ARCA, IGJ, ANSES patronal más lentos. Lo que tardaba 1 semana puede tardar 3-4." });
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "Costo de oportunidad por trámites demorados. Si estás haciendo una compraventa, una sucesión, una baja, los tiempos extra cuestan." });
      }
      // PyME / Empresario
      if (p.ocupacion === 'pyme') {
        dims.push({ name: "Plata", icon: "💰", level: "pos_soft",
          body: "Menos peso del aparato estatal sobre tu actividad implica menos presión regulatoria a futuro (efecto teórico, depende del sector)." });
        dims.push({ name: "Tiempo", icon: "⏰", level: "mid",
          body: "Trámites más lentos en volúmenes altos por la pérdida de personal estatal." });
      }
      // Estudiante (becario)
      if (p.ocupacion === 'estudiante') {
        dims.push({ name: "Educación", icon: "📚", level: "soft",
          body: "Becas Progresar administradas por Capital Humano (área con más despidos). Demoras de pago, problemas de actualización. Coordinación con sistema universitario más fragmentada." });
      }
      // Trabajo informal / desempleado / cuidado hogar (con planes sociales)
      const perfilVulnerable = p.ocupacion === 'trab_informal' || p.ocupacion === 'desempleado' || p.ocupacion === 'ama_casa';
      if (perfilVulnerable) {
        dims.push({ name: "Calidad de servicios", icon: "🔌", level: "mid",
          body: "Si dependés de algún programa del Estado (empleo, alimentar, AUH), la calidad de atención cayó. Renovaciones se demoran, errores tardan más en resolverse." });
        dims.push({ name: "Movilidad social", icon: "🛤️", level: "soft",
          body: "Programas de capacitación y empleo administrados con menos personal y seguimiento." });
      }
      // Ganador objetivo: contribuyente
      if (!['empleado_pub','trab_informal','desempleado'].includes(p.ocupacion)) {
        dims.push({ name: "Plata", icon: "💰", level: "pos_soft",
          body: "Ahorro fiscal de USD 1.885M anuales. En teoría se traduce en menos presión tributaria a mediano plazo. La realidad depende de cómo se redistribuya ese ahorro." });
      }
      return dims;
    },
    compareProfiles: [
      { name: "Empleado público nacional", sub: "Estatal · Cualquier sector", badges: { Trabajo: "strong", Estabilidad: "strong", "Carga mental": "strong", Plata: "mid", Tiempo: "soft" } },
      { name: "Jubilado dependiente ANSES/PAMI", sub: "Jubilado · Trámites mensuales", badges: { "Calidad de servicios": "mid", Tiempo: "mid" } },
      { name: "Monotributista con trámites ARCA", sub: "Monotributista · CABA", badges: { Tiempo: "mid", Plata: "soft" } },
      { name: "PyME", sub: "Empresario PyME", badges: { Plata: "pos_soft", Tiempo: "mid" } },
      { name: "Estudiante becario Progresar", sub: "Estudiante · CABA", badges: { Educación: "soft" } },
      { name: "Trabajador informal con AUH", sub: "Cuidado hogar · AUH/Alimentar", badges: { "Calidad de servicios": "mid", "Movilidad social": "soft" } }
    ]
  },

  {
    id: "dnu70_reforma_laboral",
    title: "DNU 70 Reforma Laboral (Título IV)",
    date: "2023-12-21",
    meta: "DNU 70/2023 · Título IV (arts. 53-97) · CNAT declaró inconstitucional · Ley Bases reincorporó parcialmente",
    desc: "Reforma laboral por DNU: período de prueba 3 → 8 meses, sistema privado de capitalización de despido, restricción a derecho de huelga (75% prestación en 'servicios esenciales'), bloqueos/tomas como 'injuria grave' (despido sin indemnización), cuotas sindicales solidarias eliminadas, tope a indemnización por antigüedad. ADEMÁS DEROGÓ MÚLTIPLES MULTAS al empleador: multas Ley 24.013 por trabajo no registrado, doble indemnización Ley 25.323 art. 1, multa 50% por demora art. 25.323 art. 2, Ley 25.345 antievasión, multa 3 salarios art. 80 LCT por no entregar certificado, multa retención aportes art. 132 bis LCT. CNAT Sala Feria 30-ene-2024 declaró inconstitucionalidad Título IV completo (art. 99:3 CN). CNAT Sala II abril 2024 confirmó. Bloque suspendido judicialmente, sin recurso a CSJN. Ley Bases (jul-2024) reincorporó parte en su Título de Modernización Laboral.",
    tags: ["Trabajo","Estabilidad","Plata"],
    fuente: "Boletín Oficial — DNU 70/2023 Título IV. Fallos CNAT 30-ene-2024 y abril 2024. Doctrina laboral AADTYSS, CAM, MyA Abogados.",
    impact: function(p) {
      const dims = [];
      // Empleado privado / Autónomo / Monotributista
      const esTrabajadorDependiente = p.ocupacion === 'empleado_priv' || p.ocupacion === 'autonomo' || p.ocupacion === 'monotrib';
      if (esTrabajadorDependiente) {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "strong",
          body: "Si te contratan bajo este régimen, durante los primeros 8 meses te pueden despedir sin causa y sin indemnización. Si participás en un paro o bloqueo, 'injuria grave' = despido sin pago. La Justicia laboral mantiene la inconstitucionalidad, pero en sectores donde el patrón aplica el DNU, la práctica precarizadora ya rige." });
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "strong",
          body: "Si te despiden, hay sistema de capitalización privado (seguro de despido) que puede sustituir la indemnización tradicional. Eso introduce incertidumbre sobre cuánto vas a cobrar y de quién." });
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "El DNU derogó MÚLTIPLES MULTAS al empleador (Ley 24.013, 25.323, 25.345, art. 80 y 132 bis LCT) que eran lo que te protegía si te tenían en negro o no te pagaban en tiempo. Sin esas multas, si te despiden y no pagan a tiempo ya no podés reclamar el 50% extra (Ley 25.323 art. 2). Si no te dan certificado de trabajo, ya no son 3 salarios de multa. Si estás en negro y peleás en juicio, perdiste la duplicación de Ley 25.323 art. 1. El 'techo' de lo que podés recuperar bajó 40-60%." });
        dims.push({ name: "Carga mental", icon: "🧠", level: "mid",
          body: "Saber que durante 8 meses no tenés protección plena cambia la relación con tu trabajo. En sectores donde se aplica, los nuevos contratos están más expuestos." });
      }
      // Empleado público
      if (p.ocupacion === 'empleado_pub') {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "strong",
          body: "Si tu sector entra en 'servicios esenciales' (salud, educación, justicia, transporte), tu derecho de huelga se restringe: 75% de prestación obligatoria durante un paro. Combinado con la reorganización ministerial y los despidos, es ambiente muy adverso." });
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "strong",
          body: "Marco general más débil. Menos respaldo colectivo en disputas individuales." });
      }
      // Trabajador informal
      if (p.ocupacion === 'trab_informal') {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
          body: "Las multas derogadas eran lo que hacía que conviniera al empleador formalizarte. Sin ellas, no hay incentivo económico para blanquearte. Tu empleador puede mantenerte en negro indefinidamente con muy poco riesgo. Si te despiden y vas a juicio, lo que vas a cobrar bajó significativamente." });
        dims.push({ name: "Plata", icon: "💰", level: "mid",
          body: "Tu margen de negociación en un eventual juicio cayó. Antes podías reclamar 4-6 salarios extra por irregularidad; ahora muchos menos." });
      }
      // Empresario PyME / Gran empresario
      if (p.ocupacion === 'pyme') {
        dims.push({ name: "Plata", icon: "💰", level: "pos_strong",
          body: "Las multas derogadas representaban hasta 4-6 salarios brutos en costo evitable por irregularidad. Si tenés trabajadores en negro o registrados mal, el costo de 'que te denuncien' cayó dramáticamente. Si demorás indemnizaciones ya no pagás el 50% extra. Si no das certificado de trabajo, ya no son 3 salarios de multa." });
        dims.push({ name: "Trabajo", icon: "🛠️", level: "pos",
          body: "Período de prueba de 8 meses + sin multas por trabajo no registrado = combo que reduce significativamente el costo de mantener una plantilla flexible." });
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "pos",
          body: "Tu exposición legal cae. Sistema de capitalización privado te da previsibilidad." });
      }
      // Estudiante / Desempleado buscando primer empleo
      if (p.ocupacion === 'estudiante' || p.ocupacion === 'desempleado') {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
          body: "Tu primer empleo formal arranca con 8 meses sin protección y sin las multas que históricamente te protegían si te registraban mal. Riesgo alto de empezar en gris (registrado por menos sueldo del que cobrás real)." });
        dims.push({ name: "Movilidad social", icon: "🛤️", level: "mid",
          body: "Trabajo formal con menos garantías cambia el perfil de 'estabilidad' que históricamente permitía planificar (crédito hipotecario, alquiler con garantía, formar familia). Menos seguridad = menos planificación." });
      }
      // Empleada doméstica registrada (relación laboral)
      if (p.ocupacion === 'domestica_reg' || p.ocupacion === 'domestica_no_reg') {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
          body: "Marco general más débil. Si trabajás en negro, tu empleador tiene menos riesgo de tenerte así. Si te despiden, lo que podés recuperar en juicio cayó." });
      }
      // Sociedad en general
      if (true) {
        dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "strong",
          body: "La CNAT declaró inconstitucional el Título IV completo por violación del art. 99:3 CN (régimen de DNU). El bloque sigue suspendido. Es uno de los conflictos constitucionales más fuertes del período. El gobierno no presentó recurso extraordinario a la CSJN: no se va a última instancia, se aplica por Ley Bases en su lugar." });
      }
      return dims;
    },
    compareProfiles: [
      { name: "Empleado privado relación nueva", sub: "Empleado · Primer trabajo", badges: { Trabajo: "strong", Estabilidad: "strong", Plata: "strong", "Carga mental": "mid" } },
      { name: "Empleado público sector esencial", sub: "Empleado público · Salud/Educación", badges: { Trabajo: "strong", Estabilidad: "strong", "País / Equilibrio institucional": "strong" } },
      { name: "Trabajador informal", sub: "Trabajo informal · Sin registración", badges: { Trabajo: "mid", Plata: "mid" } },
      { name: "PyME contratante", sub: "Empresario PyME", badges: { Plata: "pos_strong", Trabajo: "pos", Estabilidad: "pos" } },
      { name: "Estudiante buscando primer empleo", sub: "Estudiante · CABA", badges: { Trabajo: "mid", "Movilidad social": "mid", "País / Equilibrio institucional": "strong" } },
      { name: "Doméstica no registrada", sub: "Doméstica · En negro", badges: { Trabajo: "mid", Plata: "mid" } }
    ]
  },

  {
    id: "protocolo_antipiquetes",
    title: "Protocolo Antipiquetes",
    date: "2023-12-14",
    meta: "Resolución 943/2023 Min. Seguridad · cautelar nulidad suspendida en apelación · vigente",
    desc: "Habilita a fuerzas de seguridad a intervenir en protestas SIN orden judicial previa. Permite identificar, filmar y recolectar datos de manifestantes aunque no haya actos violentos. Cobro a manifestantes y organizaciones por costo del operativo. Sanciones administrativas a beneficiarios de planes sociales que protesten (potencial suspensión de AUH, Potenciar Trabajo, PNC). Aplica a cortes, marchas, concentraciones. Juez CAF 11 (Cormick) 29-dic-2025 declaró nulidad en 38 pp. por exceso de competencia del PEN (art. 75:12 CN) y restricción de derechos del art. 14 CN sin ley del Congreso. Cormick suspendió efectos de su propia sentencia ante apelación. Sigue vigente. Combinado con espionaje interno por SIDE (denuncias documentadas por CELS, ICSI) prohibido por Ley 25.520.",
    tags: ["País","Trabajo","Carga mental"],
    fuente: "Boletín Oficial — Resolución 943/2023 Min. Seguridad. Fallo Cormick CAF 11 dic-2025. CELS, Plan de Inteligencia 2024 (Caputo), Comisión Bicameral del Congreso.",
    impact: function(p) {
      const dims = [];
      // Beneficiario de plan social
      const tieneAsistencia = Array.isArray(p.asistencia) && p.asistencia.length > 0 && !p.asistencia.includes('ninguno');
      if (tieneAsistencia) {
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "El protocolo habilita expresamente suspender tu beneficio si participás en protestas. AUH = $107k/hijo/mes, Tarjeta Alimentar = $45-80k, PNC = ~$300k. Si te dan de baja, perdés tu ingreso principal o secundario." });
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "strong",
          body: "Tu sustento depende ahora de no manifestarte, aunque la protesta sea por demandas legítimas (educación, salud, hambre). Restricción real al ejercicio de un derecho constitucional." });
        dims.push({ name: "Carga mental", icon: "🧠", level: "strong",
          body: "Tenés que medir si participás o no, sabiendo que estás filmada/o e identificada/o. Tu vinculación a la organización social queda registrada y afecta tu acceso futuro a otros programas, becas, créditos." });
      }
      // Sindicalista / Delegado (proxy: empleado público o empleado privado con afiliación sindical activa — el front no distingue afiliación, usamos los perfiles más expuestos)
      if (p.ocupacion === 'empleado_pub') {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "strong",
          body: "La herramienta del paro y la movilización es central en las relaciones laborales del sector público. El protocolo la restringe seriamente. Si tu sector es 'servicio esencial' la huelga ya está restringida (DNU 70). Si organizás un corte de calle, podés ser identificado/multado/llevado a juicio." });
        dims.push({ name: "Carga mental", icon: "🧠", level: "strong",
          body: "Si sos delegado o referente, tu legajo personal queda en bases de la SIDE, que después puede ser usado para presión silenciosa: rumores en tu lugar de trabajo, vigilancia de tus contactos, eventual filtración a medios afines. Práctica documentada por CELS, ICSI y Comisión Bicameral." });
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "strong",
          body: "Hay casos documentados de delegados despedidos después de movilizaciones, donde la información de sus actividades extraempresa estaba previamente recolectada." });
      }
      // Activista (proxy: jubilado, estudiante, ama de casa con activismo — el front no lo distingue. Aplicamos al jubilado por el ejemplo de organizaciones de jubilados)
      if (p.ocupacion === 'jubilado_min' || p.ocupacion === 'jubilado_med' || p.ocupacion === 'pensionado') {
        dims.push({ name: "Carga mental", icon: "🧠", level: "strong",
          body: "Las marchas de jubilados (miércoles del Congreso, otras movilizaciones) están sujetas al protocolo. Hay denuncias documentadas de espionaje específico a organizaciones de jubilados: personas mayores ejerciendo el derecho a peticionar mejores haberes, sospechadas y vigiladas como amenazas a la seguridad nacional." });
      }
      // Estudiante con movilización
      if (p.ocupacion === 'estudiante') {
        dims.push({ name: "Carga mental", icon: "🧠", level: "mid",
          body: "Las movilizaciones estudiantiles son históricas en Argentina. Ahora pueden cobrarte el operativo o identificarte." });
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "Si tenés Beca Progresar, podés perderla por participar en una marcha estudiantil." });
        dims.push({ name: "Movilidad social", icon: "🛤️", level: "soft",
          body: "Restricción de la organización colectiva afecta la capacidad de pelear por mejoras del sistema educativo." });
      }
      // Empresario PyME en zona con cortes habituales (CABA, AMBA centrales)
      const enCentroProtestas = p.zona === 'caba' || p.zona === 'gba_norte' || p.zona === 'gba_sur';
      if (p.ocupacion === 'pyme' && enCentroProtestas) {
        dims.push({ name: "Plata", icon: "💰", level: "pos",
          body: "Si tu comercio o local está en zona donde los cortes te dejaban sin clientes (Plaza de Mayo, Av. 9 de Julio, accesos a oficinas), menos cortes = más operatividad." });
        dims.push({ name: "Trabajo", icon: "🛠️", level: "pos_soft",
          body: "Más previsibilidad para tu negocio." });
      }
      // Conductor / transportista (proxy: transporte=auto o moto)
      if ((p.transporte === 'auto' || p.transporte === 'moto') && enCentroProtestas) {
        dims.push({ name: "Tiempo", icon: "⏰", level: "pos",
          body: "Menos demoras en avenidas, accesos y zonas con cortes habituales." });
        dims.push({ name: "Plata", icon: "💰", level: "pos_soft",
          body: "Menos viajes interrumpidos = más rentabilidad si tu actividad depende del movimiento." });
      }
      // Persona común en AMBA que no protesta ni vive del transporte (transporte=cerca o solo_finde)
      if (enCentroProtestas && (p.transporte === 'cerca' || p.transporte === 'solo_finde')) {
        dims.push({ name: "Tiempo", icon: "⏰", level: "pos_soft",
          body: "Menos demoras puntuales por cortes." });
      }
      // Sociedad en general — todos los perfiles reciben este punto
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "strong",
        body: "Tres elementos combinados sin ley del Congreso: (1) restricción al derecho de reunión (art. 14 CN) por resolución administrativa; (2) habilitación de identificación/filmación sin orden judicial; (3) procesamiento de esa información por SIDE pese a prohibición expresa de Ley 25.520. La Justicia Federal CAF declaró nulidad por exceso de competencia. Comisión Bicameral del Senado investigando. Como ciudadano, vos también podrías necesitar manifestarte mañana — el marco que rige es contestado por la Justicia." });
      return dims;
    },
    compareProfiles: [
      { name: "Beneficiaria AUH que protesta", sub: "Cuidado hogar · 2 hijos · AUH", badges: { Plata: "strong", Estabilidad: "strong", "Carga mental": "strong" } },
      { name: "Delegado sindical sector público", sub: "Empleado público · Activo", badges: { Trabajo: "strong", "Carga mental": "strong", Estabilidad: "strong" } },
      { name: "Jubilada activista de los miércoles", sub: "Jubilada mínima · CABA", badges: { "Carga mental": "strong", "País / Equilibrio institucional": "strong" } },
      { name: "Estudiante con movilización", sub: "Estudiante · UBA/UNC", badges: { "Carga mental": "mid", Plata: "soft", "Movilidad social": "soft" } },
      { name: "Comerciante CABA en zona de cortes", sub: "PyME · Microcentro/Congreso", badges: { Plata: "pos", Trabajo: "pos_soft" } },
      { name: "Conductor profesional AMBA", sub: "Empleado priv. · Auto", badges: { Tiempo: "pos", Plata: "pos_soft" } }
    ]
  },

  {
    id: "banco_nacion_sociedad_anonima",
    title: "Banco Nación → Sociedad Anónima",
    date: "2025-02-19",
    meta: "Decreto 116/2025 · cautelar vigente · Cámara Federal La Plata confirmó · prorrogada hasta sep-2026",
    desc: "Decreto 116/2025 transformó al BNA de Sociedad del Estado a Sociedad Anónima — paso intermedio típico antes de privatización. BNA: 100% capital estatal, mayor banco del país, más sucursales que cualquier otro, 17.400 empleados, función social explícita en carta orgánica (PyMEs, agropecuario chico-mediano, economías regionales, jubilados con préstamo Previsional). Juez Federal Dolores (Ramos Padilla) 13-mar-2025 cautelar 6 meses; Cámara Federal La Plata 05-jun-2025 confirmó; 10-mar-2026 prórroga hasta sep-2026. Razón: Ley Bases EXCLUYÓ EXPRESAMENTE al BNA del capítulo de privatización; el PEN excedió atribuciones (art. 76 CN).",
    tags: ["Trabajo","País","Plata"],
    fuente: "Boletín Oficial — Decreto 116/2025. Fallos Ramos Padilla 13-mar-2025 y 10-mar-2026. Cámara Federal La Plata 05-jun-2025. La Bancaria, Infobae, La Nación, Perfil.",
    impact: function(p) {
      const dims = [];
      const enInteriorChico = p.zona === 'pueblo' || p.zona === 'cba_int' || p.zona === 'santafe_int' || p.zona === 'nea' || p.zona === 'noa' || p.zona === 'cuyo' || p.zona === 'patagonia';
      // PyME
      if (p.ocupacion === 'pyme') {
        dims.push({ name: "Plata", icon: "💰", level: "mid",
          body: "El BNA tiene función social explícita en su carta orgánica: financiar PyMEs en condiciones que el sector privado no replica (tasas más bajas, garantías más flexibles, plazos más largos). Si pasa a SA con orientación de rentabilidad, esa función se diluye. Tu acceso al crédito cae o se encarece." });
        dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
          body: "Si dependés del crédito BNA para capital de trabajo, una transformación a SA cambia tus condiciones de financiamiento." });
        // PyME del interior + agropecuario: el front no distingue sector, pero el impacto agropecuario es más fuerte
        if (enInteriorChico) {
          dims.push({ name: "Estabilidad", icon: "🛡️", level: "mid",
            body: "Si sos productor agropecuario chico-mediano o de economía regional (vid, citrus, yerba, ovino, tabaco), el BNA es el principal banco de crédito para tu segmento. La banca privada no ofrece líneas equivalentes. Tu modelo productivo depende del crédito BNA." });
        }
      }
      // Jubilado / Pensionado
      if (p.ocupacion === 'jubilado_min' || p.ocupacion === 'jubilado_med' || p.ocupacion === 'pensionado') {
        dims.push({ name: "Plata", icon: "💰", level: "mid",
          body: "El préstamo Previsional BNA (hasta $50M, cuota 35% del haber, sin garantía adicional) es producto específico de banca pública. La banca privada para jubilados ofrece menos monto, más tasa, coseguros adicionales. Si BNA pasa a SA, esta línea puede dejar de existir o encarecerse." });
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "soft",
          body: "Si BNA es tu cuenta sueldo y se reorganiza, podés enfrentar cambios de costos o canales." });
      }
      // Habitante interior / pueblo donde BNA es único banco
      if (enInteriorChico) {
        dims.push({ name: "Calidad de servicios", icon: "🔌", level: "strong",
          body: "En cientos de localidades del interior, el BNA es el único banco. SA implica orientación a rentabilidad → cierre de sucursales no rentables. Si te cierran la del pueblo, viajás 50-150 km al banco más cercano." });
        dims.push({ name: "Tiempo", icon: "⏰", level: "mid",
          body: "Trámites bancarios pasan a requerir desplazamientos largos." });
        dims.push({ name: "Plata", icon: "💰", level: "mid",
          body: "Costos de transporte + comisiones más altas del sistema privado." });
      }
      // Empleado privado / Monotributo / Autónomo
      const esTrabajadorComun = p.ocupacion === 'empleado_priv' || p.ocupacion === 'autonomo' || p.ocupacion === 'monotrib';
      if (esTrabajadorComun) {
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "Las comisiones BNA históricamente son las más bajas del sistema. Si pasa a SA con orientación a rentabilidad, comisiones suben gradualmente." });
      }
      // Beneficiario de plan social
      const tieneAsistencia = Array.isArray(p.asistencia) && p.asistencia.length > 0 && !p.asistencia.includes('ninguno');
      if (tieneAsistencia) {
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "BNA tiene costos mínimos en cuentas para beneficiarios de planes sociales. SA introduce eventual privatización progresiva de estos servicios." });
        dims.push({ name: "Calidad de servicios", icon: "🔌", level: "mid",
          body: "Riesgo de menor atención en sucursales no rentables (interior)." });
      }
      // Sociedad en general
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "strong",
        body: "El Congreso EXCLUYÓ expresamente al BNA del capítulo de privatización de la Ley Bases. El Ejecutivo, por decreto, intentó hacer lo que el Congreso le negó. La Justicia (Ramos Padilla + Cámara Federal La Plata) viene confirmando la cautelar porque entiende que es exceso de atribuciones delegadas (art. 76 CN)." });
      return dims;
    },
    compareProfiles: [
      { name: "Productor agropecuario chico interior", sub: "PyME · NEA/NOA/Cuyo", badges: { Plata: "mid", Trabajo: "mid", Estabilidad: "mid" } },
      { name: "PyME industrial CABA", sub: "Empresario PyME · CABA", badges: { Plata: "mid", Trabajo: "mid" } },
      { name: "Jubilada con préstamo Previsional BNA", sub: "Jubilada · Cuenta BNA", badges: { Plata: "mid", Estabilidad: "soft" } },
      { name: "Habitante pueblo interior con BNA único", sub: "Trabajo informal · Pueblo", badges: { "Calidad de servicios": "strong", Tiempo: "mid", Plata: "mid" } },
      { name: "Empleado BNA / Bancaria", sub: "Empleado · 17.400 plantel", badges: { Trabajo: "strong", Estabilidad: "strong" } },
      { name: "Beneficiaria AUH con cuenta BNA", sub: "Cuidado hogar · AUH/Alimentar", badges: { Plata: "soft", "Calidad de servicios": "mid" } }
    ]
  },

  {
    id: "ley_emergencia_discapacidad",
    title: "Ley de Emergencia en Discapacidad",
    date: "2025-09-22",
    meta: "Ley 27.793 · vetada · veto rechazado por Congreso · suspensión Dto 681/2025 declarada nula · vigente",
    desc: "Declara emergencia nacional en discapacidad hasta dic-2026 (prorrogable). Compensación de emergencia a prestadores (terapeutas, transportistas adaptados, centros, talleres, hogares) por diferencia entre aumentos de aranceles 2023-2024 vs IPC. Financiamiento adecuado y sostenible de PNC por discapacidad. Régimen de regularización tributaria para prestadores. Jefatura de Gabinete debe asignar partidas sin reducir crédito del área Social. Vetada por PEN 04-ago-2025; veto rechazado por Diputados y Senado con 2/3 (sep-2025); Decreto 681/2025 promulgó pero suspendió ejecución; Juez Federal Campana (González Charbay) 12-dic-2025 declaró nulo art. II del Decreto 681 por 'veto encubierto' y violación a división de poderes. Impacto fiscal estimado OPC: 0,22-0,42% PBI. Afecta a ~1,6M con CUD + ~1,1M con PNC + ~50.000 prestadores + ~5M familiares directos.",
    tags: ["Salud","Plata","País"],
    fuente: "Boletín Oficial — Ley 27.793 + Decreto 681/2025 + Decreto 84/2026 reglamentación. Fallo Juzgado Federal Campana 12-dic-2025. Oficina de Presupuesto del Congreso.",
    impact: function(p) {
      const dims = [];
      // Persona con discapacidad propia con CUD
      if (p.discapacidad === 'propia_cud') {
        dims.push({ name: "Salud", icon: "❤️", level: "pos_strong",
          body: "Garantía de continuidad de tus terapias (kinesiología, fonoaudiología, psicología, terapia ocupacional, hidroterapia) que estaban al borde por colapso de prestadores. La compensación de emergencia evita que tu terapeuta cierre el consultorio." });
        dims.push({ name: "Plata", icon: "💰", level: "pos_strong",
          body: "Si cobrás PNC por invalidez, la ley garantiza financiamiento sostenible. El haber venía perdiendo contra inflación. Recomposición prevista." });
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "pos_strong",
          body: "Tu Centro de Día, Hogar, Taller Protegido tiene continuidad asegurada. Sin la ley, riesgo concreto de cierre." });
        dims.push({ name: "Movilidad social", icon: "🛤️", level: "pos",
          body: "Los talleres protegidos y servicios de rehabilitación son tu vía a participar productivamente. Su continuidad refuerza tu autonomía." });
      }
      // Persona con discapacidad propia sin CUD (similar pero leve menor)
      if (p.discapacidad === 'propia_sin_cud') {
        dims.push({ name: "Salud", icon: "❤️", level: "pos",
          body: "La ley refuerza el sistema general de discapacidad. Si todavía no tenés CUD, la ley puede facilitar el acceso por reorientación de presupuestos del área Social." });
      }
      // Familiar a cargo con CUD
      if (p.discapacidad === 'familiar_cud') {
        dims.push({ name: "Plata", icon: "💰", level: "pos_strong",
          body: "Antes de la ley, tenías que cubrir de tu bolsillo la diferencia que las obras sociales/prepagas no pagaban a los prestadores (aranceles oficiales congelados, terapeutas pedían 'plus'). Con la compensación de emergencia, esa presión se reduce." });
        dims.push({ name: "Salud", icon: "❤️", level: "pos",
          body: "Tu propio bienestar mejora cuando tu hijo/madre/hermano tiene atención garantizada. El estrés del 'no hay terapeuta disponible' baja." });
        dims.push({ name: "Vida familiar / ocio", icon: "👨‍👩‍👧", level: "pos",
          body: "La crisis del sistema de discapacidad implica que la familia carga lo que el Estado no provee. Si los prestadores funcionan, vos respirás." });
        dims.push({ name: "Carga mental", icon: "🧠", level: "pos",
          body: "Menos preocupación cotidiana sobre la continuidad de los servicios." });
      }
      // Familiar a cargo sin CUD
      if (p.discapacidad === 'familiar_sin_cud') {
        dims.push({ name: "Plata", icon: "💰", level: "pos",
          body: "El refuerzo presupuestario al sistema puede facilitar acceso al CUD y a coberturas." });
      }
      // Contribuyente general (perfiles sin conexión directa con discapacidad)
      if (!p.discapacidad || p.discapacidad === 'no') {
        // Solo el impacto fiscal indirecto
        const noEsVulnerable = !['trab_informal','desempleado'].includes(p.ocupacion);
        if (noEsVulnerable) {
          dims.push({ name: "Plata", icon: "💰", level: "soft",
            body: "Impacto fiscal estimado (Oficina Presupuesto del Congreso): 0,22-0,42% del PBI. Se financia con recursos generales del Tesoro, lo que indirectamente toca a contribuyentes. Es el costo de garantizar derechos consagrados en la Convención Internacional de Derechos de Personas con Discapacidad." });
        }
        dims.push({ name: "Salud", icon: "❤️", level: "pos_soft",
          body: "Sostener un sistema de discapacidad que funciona ahorra al sistema de salud general (los problemas no atendidos terminan en hospitales públicos)." });
      }
      // Sociedad en general
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "pos",
        body: "Rechazo del veto por 2/3 + fallo Campana contra el 'veto encubierto' del Decreto 681 = ejercicio claro de los poderes constitucionales. Congreso y Justicia ejerciendo su rol frente al Ejecutivo. Buena salud institucional." });
      return dims;
    },
    compareProfiles: [
      { name: "Persona con CUD que usa terapias", sub: "Discapacidad propia c/CUD", badges: { Salud: "pos_strong", Plata: "pos_strong", Estabilidad: "pos_strong", "Movilidad social": "pos" } },
      { name: "Familia con hijo con CUD", sub: "Empleado priv. · Hijo c/CUD", badges: { Plata: "pos_strong", Salud: "pos", "Vida familiar / ocio": "pos", "Carga mental": "pos" } },
      { name: "Pensión no contributiva discapacidad", sub: "Pensionado · PNC discap.", badges: { Plata: "pos_strong", Salud: "pos_strong", Estabilidad: "pos_strong" } },
      { name: "Empleado público sector ANDIS", sub: "Empleado público · Discapacidad", badges: { "País / Equilibrio institucional": "pos" } },
      { name: "Contribuyente sin discapacidad familiar", sub: "Empleado priv. · Sin CUD", badges: { Plata: "soft", Salud: "pos_soft", "País / Equilibrio institucional": "pos" } }
    ]
  },

  {
    id: "eliminacion_impuestos_internos_lujo",
    title: "Eliminación de Impuestos Internos a bienes de lujo",
    date: "2026-02-15",
    meta: "Ley de Modernización Laboral art. 192 · feb-2026 · vigente",
    desc: "Eliminó Impuestos Internos a autos de gama media-alta (escala 1: 20% — $41-75M) y de lujo (escala 2: 35% — $75M+), motos cilindrada media-alta ($15-23M), embarcaciones, aeronaves, objetos suntuarios (joyería, perfumería premium), seguros generales, telefonía celular y satelital. Implementación gradual feb-2025 (suspensión escala 1) → 2025 (escala 2 baja a 18%) → feb-2026 (eliminación completa). Rebajas en autos premium 10-15%, hasta USD 26.000 por unidad en top gama. Modelos afectados arrancan en USD 70.000.",
    tags: ["Plata","Fiscal","Lujo"],
    fuente: "Boletín Oficial — Ley de Modernización Laboral art. 192 (feb-2026). Infobae, El Economista, El Cronista, Chequeado.",
    impact: function(p) {
      const dims = [];
      // Comprador potencial de bienes premium (proxy: ingreso muy alto)
      const ingresoMuyAlto = p.ingreso === 'mas_6m' || p.ingreso === '6m_15m' || p.ingreso === 'mas_15m';
      if (ingresoMuyAlto || p.ocupacion === 'pyme') {
        dims.push({ name: "Plata", icon: "💰", level: "pos_strong",
          body: "Si comprás auto premium (BMW Serie 3, Audi A4 o equivalente): ahorrás 10-15% del precio (USD 6-12k en autos de USD 60-80k). En top gama (Porsche, M5, AMG), ahorrás hasta USD 26.000 por unidad." });
        dims.push({ name: "Movilidad", icon: "🛤️", level: "pos",
          body: "Acceso a vehículos premium que antes estaban encarecidos." });
      }
      // Empleado privado / Autónomo / Monotributista con ingreso medio o bajo
      const ingresoMedioBajo = p.ingreso === 'hasta_700k' || p.ingreso === '700k_1.5m' || p.ingreso === '1.5m_3m';
      const esTrabajadorComun = p.ocupacion === 'empleado_priv' || p.ocupacion === 'autonomo' || p.ocupacion === 'monotrib';
      if (esTrabajadorComun && ingresoMedioBajo) {
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "Recaudación perdida del Estado se compensa de dos formas que sí te tocan: (a) más presión sobre IVA, Ganancias y aportes que vos sí pagás, o (b) reducción de gasto público en áreas que vos sí usás (salud pública, ANSES, educación)." });
      }
      // Jubilado / Pensionado
      if (p.ocupacion === 'jubilado_min' || p.ocupacion === 'jubilado_med' || p.ocupacion === 'pensionado') {
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "La merma recaudatoria presiona presupuestos sociales a mediano plazo. ANSES, PAMI, planes sociales pueden verse afectados." });
      }
      // Empleado público
      if (p.ocupacion === 'empleado_pub') {
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "Presión presupuestaria sobre el aparato estatal que financia tu trabajo." });
      }
      // Persona con discapacidad
      if (p.discapacidad && p.discapacidad !== 'no') {
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "Las partidas de PNC y prestadores de discapacidad compiten con otras prioridades del presupuesto. Menor recaudación = más presión sobre prioridades sociales." });
      }
      // Estudiante / Trabajador informal / Cuidado hogar / Desempleado
      const perfilVulnerable = p.ocupacion === 'estudiante' || p.ocupacion === 'trab_informal' || p.ocupacion === 'ama_casa' || p.ocupacion === 'desempleado';
      if (perfilVulnerable) {
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "Disminución de base recaudatoria afecta indirectamente planes que vos sí podés usar (Progresar, AUH, Tarjeta Alimentar)." });
        dims.push({ name: "Movilidad social", icon: "🛤️", level: "soft",
          body: "Política fiscal que beneficia consumos de élite y no a la base productiva ni a la formación." });
      }
      // Sociedad en general
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
        body: "Es decisión política de qué consumos premiar. Reducir impuesto a un BMW vs. mantener impuestos a productos masivos cambia la distribución del peso tributario. El argumento del gobierno es 'simplificación + más volumen = más recaudación a futuro'. El argumento opositor es 'regresividad fiscal: el que más tiene paga menos'. El dato objetivo es que la base recaudatoria del Estado se redujo en el corto plazo." });
      return dims;
    },
    compareProfiles: [
      { name: "Empresario que compra auto premium", sub: "Empresario · USD 60-80k", badges: { Plata: "pos_strong", Movilidad: "pos" } },
      { name: "Comprador top gama (Porsche, M5)", sub: "Gran empresario · USD 100k+", badges: { Plata: "pos_strong", Movilidad: "pos" } },
      { name: "Empleado privado ingreso medio", sub: "Empleado · $1,5M-3M", badges: { Plata: "soft" } },
      { name: "Jubilado mínima sin discapacidad", sub: "Jubilado · Sin compra premium", badges: { Plata: "soft", "País / Equilibrio institucional": "soft" } },
      { name: "Empleado público nacional", sub: "Empleado público · Cualquier sector", badges: { Plata: "soft" } },
      { name: "Familia con CUD y trabajadora informal", sub: "Trabajo informal · Familiar c/CUD", badges: { Plata: "soft", "Movilidad social": "soft" } }
    ]
  },
  {
    id: "aranceles_textiles_calzado",
    title: "Reducción de aranceles para textiles, calzado e hilados",
    date: "2025-03-31",
    meta: "Decreto 236/2025 · vigente · vuelve a niveles pre-2007",
    desc: "Reducción de aranceles a importación: ropa y calzado 35%→20%, telas 26%→18%, hilados 18%→12-16%. Justificación oficial: Argentina con indumentaria más cara de la región (remera 310% más cara que España). Impacto verificado a abr-2026: 20.700 puestos perdidos en cadena textil/indumentaria/cuero/calzado, 17% caída empleo registrado, 380 empresas cerradas (Pro Tejer), 33% caída de producción, 6-7 de cada 10 máquinas paradas. Importaciones prendas terminadas +129% en cantidad. Casos: Textilana suspensiones 175 personas, VVC Catamarca paros. Sin observación constitucional firme (es facultad propia del PEN ajustar aranceles).",
    tags: ["Trabajo","Plata","Industria"],
    fuente: "Boletín Oficial — Decreto 236/2025. Pro Tejer, CIAI, SIPA, Infobae, El Cronista.",
    impact: function(p) {
      const dims = [];
      const esTrabajador = p.ocupacion === 'empleado_priv' || p.ocupacion === 'autonomo' || p.ocupacion === 'monotrib';
      const enPoloTextil = p.zona === 'noa' || p.zona === 'nea' || p.zona === 'cuyo' || p.zona === 'gba_oeste' || p.zona === 'gba_sur' || p.zona === 'cba_int' || p.zona === 'santafe_int';
      if (esTrabajador && enPoloTextil) {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "strong",
          body: "Si trabajás en cadena textil/indumentaria/calzado, tu sector perdió 20.700 puestos en 2 años (17% del empleo registrado). Suspensiones masivas (Textilana 175 personas) son la nueva normalidad. Efecto cascada toca a proveedores: logística, packaging, transporte." });
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "strong",
          body: "380 empresas cerradas + 7 de cada 10 máquinas paradas = riesgo concreto de tu lugar de trabajo." });
        dims.push({ name: "Plata", icon: "💰", level: "mid",
          body: "Salarios reales del sector cayeron + riesgo de despido + indemnización con tope (DNU 70)." });
      }
      if (p.ocupacion === 'pyme' && enPoloTextil) {
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "Competís con ropa importada que entra al 20% de arancel (era 35%), sin tasa de estadística. Tu costo local en pesos es 25-40% más alto que la mercadería china que entra al puerto. Los márgenes desaparecieron." });
        dims.push({ name: "Trabajo", icon: "🛠️", level: "strong",
          body: "Si lograste sostener empleados, lo estás haciendo a costa de tu capital de trabajo. La mayoría tuvo que despedir o suspender." });
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "strong",
          body: "380 PyMEs textiles cerraron. Si seguís abierto, vivís al día." });
      }
      if (p.ocupacion === 'trab_informal' || p.ocupacion === 'ama_casa') {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
          body: "Toda la cadena de subcontratación informal (talleres clandestinos, costureras domiciliarias) cae junto con la industria formal. Menos trabajo, menos paga por prenda." });
        dims.push({ name: "Plata", icon: "💰", level: "mid",
          body: "Mercado de subcontratación se contrae." });
      }
      const ingresoMedioBajo = p.ingreso === 'hasta_700k' || p.ingreso === '700k_1.5m' || p.ingreso === '1.5m_3m';
      if (ingresoMedioBajo) {
        dims.push({ name: "Plata", icon: "💰", level: "pos_soft",
          body: "Ropa y calzado importados bajaron 8-15% en precio final. Si comprás en fast fashion (Falabella, Zara, mercado de Once, ferias americanas), notás la diferencia. Tu hijo va al colegio con zapatillas que antes costaban el doble." });
        dims.push({ name: "Movilidad social", icon: "🛤️", level: "pos_soft",
          body: "Acceso a marcas que antes eran inalcanzables." });
      }
      const ingresoAlto = p.ingreso === 'mas_6m' || p.ingreso === '6m_15m' || p.ingreso === 'mas_15m';
      if (ingresoAlto) {
        dims.push({ name: "Plata", icon: "💰", level: "pos_soft",
          body: "Marcas internacionales (Nike, Adidas, Tommy, Polo) bajaron 10-15%. Si comprás regularmente, ahorro real." });
      }
      if (enPoloTextil && (p.ocupacion === 'estudiante' || p.ocupacion === 'desempleado')) {
        dims.push({ name: "Movilidad social", icon: "🛤️", level: "mid",
          body: "En provincias con monocultivo industrial, las opciones de empleo alternativo son limitadas. Si la textil cierra, no hay otra fábrica." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
        body: "Decisión de desindustrializar sin política industrial complementaria. Argentina no es Brasil (que sigue protegiendo industria) ni Vietnam (que produce con escala). El modelo elegido implica importar lo que antes hacíamos." });
      return dims;
    },
    compareProfiles: [
      { name: "Operaria textil Catamarca", sub: "Empleada priv. · NOA · Polo textil", badges: { Trabajo: "strong", Estabilidad: "strong", Plata: "mid" } },
      { name: "PyME confección Conurbano", sub: "Empresario PyME · GBA Oeste", badges: { Plata: "strong", Trabajo: "strong", Estabilidad: "strong" } },
      { name: "Costurera domiciliaria informal", sub: "Cuidado hogar · Subcontratación", badges: { Trabajo: "mid", Plata: "mid" } },
      { name: "Consumidor ingreso bajo CABA", sub: "Empleado priv. · ≤$1,5M", badges: { Plata: "pos_soft", "Movilidad social": "pos_soft" } },
      { name: "Consumidor de marcas premium", sub: "Empresario · +$6M", badges: { Plata: "pos_soft" } },
      { name: "Estudiante en polo textil", sub: "Estudiante · Provincia industrial", badges: { "Movilidad social": "mid" } }
    ]
  },
  {
    id: "eliminacion_fondo_compensador_transporte_dnu_280",
    title: "Eliminación del Fondo Compensador del Transporte del Interior",
    date: "2024-03-24",
    meta: "DNU 280/2024 · vigente · cautelares provinciales en curso",
    desc: "Dispone que arts. 81, 92, 93 y 94 de Ley 27.701 (Presupuesto 2023) NO se prorrogan a 2024. El art. 81 fijaba piso de $85.000M para el Fondo Compensador del Transporte del Interior, que subsidiaba boleto de colectivos urbanos e interurbanos fuera del AMBA. Resultado: provincias del interior sin aporte nacional (AMBA siguió con subsidios). Cobertura previa del FCI: Rosario 27% subsidios, Córdoba 28%, Bariloche 35%, Río Gallegos 40%. Tarifas pasaron de media $252 (ene-2024) a $607 (abr-2024) → $1.720-1.895 a jun-2026. Interior paga casi el triple que AMBA. Cautelares Chubut (fallo Sastre, Rawson feb-2024), Cámara Federal Rosario, Santa Fe, Córdoba. Nación incumplió parcialmente el fallo Sastre.",
    tags: ["Plata","Movilidad","Transporte"],
    fuente: "Boletín Oficial — DNU 280/2024. Fallo Sastre Federal Rawson feb-2024. Chequeado, Cenital, La Nación.",
    impact: function(p) {
      const dims = [];
      const enInterior = !['caba','gba_norte','gba_sur','gba_oeste','laplata'].includes(p.zona);
      const usaTransportePublico = p.transporte === '2colectivos' || p.transporte === 'combinacion' || p.transporte === 'tren';
      if (enInterior && usaTransportePublico) {
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "Si en una ciudad como Rosario tomás 2 colectivos al día x 22 días = 44 viajes/mes. Antes (ene-2024): 44 × $252 = $11.088. Hoy (jun-2026): 44 × $1.720 = $75.680/mes. Diferencia: $64.592 más por mes en transporte sobre un sueldo del interior. Para ingresos ≤$1,5M, eso es 4-7% del sueldo solo en transporte al trabajo." });
        dims.push({ name: "Movilidad", icon: "🛤️", level: "strong",
          body: "Tu acceso a la ciudad se encareció dramáticamente. Trámites, estudios, visitar familia, salir a comer ahora exige cálculo." });
        dims.push({ name: "Tiempo", icon: "⏰", level: "mid",
          body: "Muchas líneas redujeron frecuencias. Algunas rutas se eliminaron." });
      }
      if (enInterior && (p.ocupacion === 'jubilado_min' || p.ocupacion === 'jubilado_med' || p.ocupacion === 'pensionado')) {
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "Si tomás colectivo para ir al médico, hacer trámite ANSES o PAMI, visitar familia: 8 boletos/mes a $1.720 = $13.760 fijos. Sobre haber mínimo de $473k = 3% solo en transporte al hospital. Tarifa Social SUBE no aplica fuera de AMBA." });
        dims.push({ name: "Salud", icon: "❤️", level: "mid",
          body: "Postergación de turnos médicos por costo de traslado. Defensoría provincias 2025: 10-15% de jubilados del interior reducen frecuencia de consultas por costo de transporte." });
      }
      if (enInterior && p.ocupacion === 'estudiante') {
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "Beca Progresar = $35.000/mes. Si vas a clase en colectivo 4 días por semana = 32 viajes/mes = $55.040. La beca no cubre el transporte. Te tenés que arreglar con familia." });
        dims.push({ name: "Educación", icon: "📚", level: "mid",
          body: "Asistencia a clase se ve afectada por el costo. UNL, UNR, UNC reportan aumento de 'abandono por costo de transporte' en 2024-2025." });
        dims.push({ name: "Movilidad social", icon: "🛤️", level: "mid",
          body: "Barrera de acceso a estudios superiores creció si vivís lejos de la facultad." });
      }
      if (enInterior && (p.ocupacion === 'trab_informal' || p.ocupacion === 'ama_casa')) {
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "Si tu jornal es $20-30k y el transporte para llegar al trabajo cuesta $3.500-5.500 ida y vuelta, perdés 15-25% del jornal. Algunos trabajos ya no son rentables por costo de viajar." });
        dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
          body: "Menos margen para aceptar trabajos lejos. Reducción de búsquedas a 'lo que esté cerca'." });
      }
      if (enInterior && p.ocupacion === 'pyme') {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
          body: "Tus empleados gastan más en llegar. Algunos rechazan trabajos lejos. Si tu negocio depende de clientes que se mueven en transporte público, tu afluencia cae." });
      }
      const noEsEmpleadoPub = p.ocupacion !== 'empleado_pub';
      if (noEsEmpleadoPub) {
        dims.push({ name: "Plata", icon: "💰", level: "pos_soft",
          body: "Ahorro fiscal real del Tesoro Nacional (los $85.000M que no se transfirieron). En teoría redirigido a otros usos o menor presión tributaria — depende de la redistribución." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "mid",
        body: "Asimetría federal: AMBA sigue con subsidio nacional, interior no. Y desobediencia documentada al fallo Sastre (Rawson, feb-2024) que ordenaba mantener subsidios — Nación cumplió parcialmente para 2023 y luego dictó el DNU 280 que lo desoyó." });
      return dims;
    },
    compareProfiles: [
      { name: "Empleado Rosario · 2 colectivos/día", sub: "Empleado priv. · Santa Fe int.", badges: { Plata: "strong", Movilidad: "strong", Tiempo: "mid" } },
      { name: "Jubilada Bariloche al hospital", sub: "Jubilada · Patagonia · Combinación", badges: { Plata: "strong", Salud: "mid" } },
      { name: "Estudiante UNC · Beca Progresar", sub: "Estudiante · Córdoba · Combinación", badges: { Plata: "strong", Educación: "mid", "Movilidad social": "mid" } },
      { name: "Trabajadora informal Mendoza", sub: "Trabajo informal · Cuyo", badges: { Plata: "strong", Trabajo: "mid" } },
      { name: "PyME hotelera Salta", sub: "PyME · NOA", badges: { Trabajo: "mid" } },
      { name: "Habitante AMBA con auto", sub: "Empleado priv. · CABA · Auto", badges: { Plata: "pos_soft" } }
    ]
  },
  {
    id: "dnu70_prepagas",
    title: "DNU 70 — Desregulación de medicina prepaga",
    date: "2023-12-21",
    meta: "DNU 70/2023 · deroga arts. de Ley 26.682 · jurisprudencia federal limita aumentos",
    desc: "Deroga incisos g y m del art. 5, los arts. 6, 18, 19, 25 inc. a y 27 de la Ley 26.682 de Marco Regulatorio de la Medicina Prepaga. Quita facultades a Ministerio de Salud y Superintendencia de Servicios de Salud de autorizar y revisar valores de cuotas. Habilita libre fijación de precios. Suprime modelos de contrato entre prepagas y prestadores. Aumentos acumulados >100% en pocos meses durante 2024; a jun-2026 acumulan 350-450% según plan vs IPC ~280%. Cautelares individuales y colectivas. Jurisprudencia federal consolidada (CAF Sala III, Sala V): aumentos deben ser razonables con IPC como parámetro; derecho a la salud (tratados art. 75:22 CN) prima sobre lógica de mercado. 26-may-2025 Justicia anuló retroactivamente aumentos.",
    tags: ["Salud","Plata","Carga mental"],
    fuente: "Boletín Oficial — DNU 70/2023 (arts. derogadores de Ley 26.682). Microjuris, Infobae, CELS, CADIME.",
    impact: function(p) {
      const dims = [];
      if (p.salud === 'prepaga') {
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "Cuota se duplicó o triplicó en términos reales contra inflación. Si gastabas $80k/mes en cobertura familiar, ahora es $250-350k. Si tu sueldo no creció en la misma proporción, perdiste poder de compra de muchas otras cosas para sostener la cobertura." });
        dims.push({ name: "Salud", icon: "❤️", level: "mid",
          body: "Para sostener la cuota, mucha gente migra a planes inferiores con peor cobertura (más coseguros, menor cartilla, copagos en estudios). Menor calidad efectiva por la misma plata." });
      }
      if (p.salud === 'prepaga_aporte') {
        dims.push({ name: "Plata", icon: "💰", level: "mid",
          body: "Tu aporte de obra social cubre parte; el 'plus' de prepaga te lo pagás vos. Ese plus se disparó. Te toca pagar un excedente cada vez más alto." });
      }
      const esJubiladoPensionado = p.ocupacion === 'jubilado_min' || p.ocupacion === 'jubilado_med' || p.ocupacion === 'pensionado';
      if (esJubiladoPensionado && (p.salud === 'prepaga' || p.salud === 'mixta')) {
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "Sos el perfil más expuesto: no podés cambiar de cobertura por edad (otras prepagas no aceptan), no podés volver a PAMI sin perder cuota acumulada. La cuota se come hasta 30-40% de tu haber." });
        dims.push({ name: "Salud", icon: "❤️", level: "strong",
          body: "Estás en la edad donde MÁS necesitás cobertura, con la cuota más alta de tu vida y sin alternativa equivalente." });
        dims.push({ name: "Carga mental", icon: "🧠", level: "mid",
          body: "Vivir con la cuota colgando del calendario, judicializaciones, recursos administrativos." });
      }
      if (p.salud === 'mixta') {
        dims.push({ name: "Plata", icon: "💰", level: "mid",
          body: "El componente prepaga se encareció. El plan total te sale más." });
      }
      if (p.salud === 'hosp_pub') {
        dims.push({ name: "Salud", icon: "❤️", level: "mid",
          body: "La migración de afiliados que abandonan prepaga aumenta la demanda en hospitales públicos. Esperas más largas para turnos de especialistas. Saturación de guardias." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "mid",
        body: "Jurisprudencia federal consolidada limita lo que el DNU autoriza. El derecho a la salud con jerarquía constitucional (tratados internacionales) recorta la libre fijación. El argumento 'desregular para que la competencia baje precios' no se cumplió empíricamente: precios subieron 350-450%, no bajaron. Mercado oligopólico (Swiss Medical, OSDE, Medifé, Galeno) generó alza coordinada." });
      return dims;
    },
    compareProfiles: [
      { name: "Jubilado mínima con prepaga vitalicia", sub: "Jubilado mín. · Prepaga bolsillo", badges: { Plata: "strong", Salud: "strong", "Carga mental": "mid" } },
      { name: "Familia con cobertura familiar", sub: "Empleado priv. · Prepaga bolsillo · Hijos", badges: { Plata: "strong", Salud: "mid" } },
      { name: "Empleado con aporte OS + plus", sub: "Empleado priv. · Prepaga c/aporte OS", badges: { Plata: "mid" } },
      { name: "Usuario hospital público", sub: "Trabajo informal · Hospital público", badges: { Salud: "mid" } },
      { name: "Adulto joven con cobertura mixta", sub: "Empleado priv. · Mixta · CABA", badges: { Plata: "mid" } }
    ]
  },
  {
    id: "despidos_hospital_posadas",
    title: "Reorganización del Hospital Posadas",
    date: "2024-03-22",
    meta: "Decreto 270/2024 + DDAA 215, 264, 418, 601, 602, 892/2024 · vigente",
    desc: "Decreto 270/2024 (22-mar-2024) reorganizó la jurisdicción del Hospital Posadas (oeste GBA, referencia para 6 millones de habitantes) bajo la Subsecretaría de Institutos y Fiscalización del Min. de Salud. Decisiones Administrativas posteriores (DA 215, 264, 418, 601, 602, 892 de 2024) reorganizaron estructura y plantas. Consecuencias documentadas (CICOP, prensa, Justicia): ~90 desvinculaciones jun-2024, +110 en jun-2025, total 200-250 trabajadores. Casos de despido a personal reinstalado por Justicia (re-despido). Casos a delegados sindicales con tutela activa (kinesiólogo CICOP). CICOP litiga colectivamente; órdenes individuales de reinstalación firmes.",
    tags: ["Trabajo","Salud","País"],
    fuente: "Boletín Oficial — Decreto 270/2024 + Decisiones Administrativas 215, 264, 418, 601, 602, 892/2024. CICOP, Página 12, Perfil, Infobae.",
    impact: function(p) {
      const dims = [];
      if (p.ocupacion === 'empleado_pub') {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "strong",
          body: "Si trabajás en hospital público nacional, el caso Posadas marca el precedente: cualquier reorganización administrativa habilita despidos. Riesgo de no renovación de contrato + despidos con efecto retroactivo." });
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "strong",
          body: "Las garantías sindicales (delegado/CICOP) NO frenan la decisión administrativa de despedir, aunque después la Justicia ordene reinstalación." });
        dims.push({ name: "Carga mental", icon: "🧠", level: "mid",
          body: "Incertidumbre operativa. Equipos desarmados, compañeros despedidos, sobrecarga sobre quien queda." });
      }
      const enZonaPosadas = p.zona === 'gba_oeste' || p.zona === 'gba_sur' || p.zona === 'caba';
      if (enZonaPosadas && (p.salud === 'hosp_pub' || p.salud === 'mixta' || p.salud === 'os_sindical')) {
        dims.push({ name: "Salud", icon: "❤️", level: "mid",
          body: "Posadas es referencia para 6 millones del oeste/sur GBA. Servicios de oncología, neonatología, trauma se debilitan. Tiempos de espera para turnos aumentan. Derivaciones a centros privados se demoran." });
        dims.push({ name: "Calidad de servicios", icon: "🔌", level: "mid",
          body: "Atención hospitalaria queda con menos personal por turno." });
      }
      const tieneHijos = p.hijos === '1' || p.hijos === '2' || p.hijos === '3mas';
      if (enZonaPosadas && tieneHijos && p.salud === 'hosp_pub') {
        dims.push({ name: "Salud", icon: "❤️", level: "strong",
          body: "Si tu hijo/a tiene patología crónica (oncológica, neonatal, trasplante) atendida en Posadas, la continuidad de tratamiento depende de equipos que pueden ser desarmados. Si tu médica de cabecera fue despedida, te toca recomenzar relación o ir al privado." });
        dims.push({ name: "Carga mental", icon: "🧠", level: "mid",
          body: "Inestabilidad del equipo asistencial es estrés agregado." });
      }
      const noEsEmpleadoPub = p.ocupacion !== 'empleado_pub';
      if (noEsEmpleadoPub) {
        dims.push({ name: "Plata", icon: "💰", level: "pos_soft",
          body: "Ahorro fiscal por reducción de masa salarial." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "mid",
        body: "El incumplimiento de órdenes judiciales de reinstalación (re-despido) es punto institucional concreto. La Justicia ordena, el gobierno vuelve a despedir. Casos de despido a delegados con tutela sindical activa también." });
      return dims;
    },
    compareProfiles: [
      { name: "Médica del Posadas oncología", sub: "Empleada pública · Salud", badges: { Trabajo: "strong", Estabilidad: "strong", "Carga mental": "mid" } },
      { name: "Familia con hijo oncológico GBA Oeste", sub: "Empleado priv. · 2 hijos · Hosp. público", badges: { Salud: "strong", "Carga mental": "mid" } },
      { name: "Habitante oeste GBA con AUH", sub: "Cuidado hogar · GBA Oeste · Hosp. público", badges: { Salud: "mid", "Calidad de servicios": "mid" } },
      { name: "Delegado sindical sector público", sub: "Empleado público · Tutela CICOP", badges: { Trabajo: "strong", Estabilidad: "strong" } },
      { name: "Empleada privada CABA con prepaga", sub: "Empleada priv. · CABA · Prepaga", badges: { Plata: "pos_soft" } }
    ]
  },
  {
    id: "ley_emergencia_pediatrica_garrahan",
    title: "Ley de Emergencia Pediátrica — veto rechazado",
    date: "2025-10-02",
    meta: "Ley Emergencia Pediátrica · Dto 651/2025 veto · Diputados 17-sep-2025 (181-60-1) · Senado 02-oct-2025 (59-7-3) · vigente",
    desc: "Ley sancionada 22-ago-2025 declara emergencia sanitaria pediátrica por 2 años. Recomposición salarial inmediata para residentes y profesionales del Hospital Garrahan, Notti (Mendoza), Sor María Ludovica (La Plata). Asignación urgente de recursos para insumos críticos. Deroga Resolución 2109/2025 (que había congelado partidas para residencias). Veto total del PEN por Decreto 651/2025 (11-sep-2025). Veto rechazado por Diputados 17-sep-2025 (181-60-1) y Senado 02-oct-2025 (59-7-3) — alcanzaron 2/3 en ambas cámaras. Ley vigente; implementación efectiva disputada. Contexto: 70% pacientes Garrahan del interior. Salarios residentes: $800k → $1.3M (suba unilateral parcial jul-2025). Carga 70 hs/semana con guardias 24 hs.",
    tags: ["Salud","Plata","País"],
    fuente: "Boletín Oficial — Ley de Emergencia Pediátrica + Decreto 651/2025 (veto) + Actas Diputados 17-sep-2025 + Senado 02-oct-2025. Infobae, Perfil, Palabras del Derecho.",
    impact: function(p) {
      const dims = [];
      if (p.ocupacion === 'empleado_pub') {
        dims.push({ name: "Plata", icon: "💰", level: "pos_strong",
          body: "Si sos residente o profesional de planta de hospital pediátrico de referencia, la ley garantiza recomposición salarial inmediata. Aunque la implementación es disputada, hay piso legal a la negociación." });
        dims.push({ name: "Trabajo", icon: "🛠️", level: "pos",
          body: "Marco legal de emergencia para tu sector. Insumos críticos garantizados." });
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "pos",
          body: "Ley vigente es respaldo institucional para tu rol." });
      }
      const tieneHijos = p.hijos === '1' || p.hijos === '2' || p.hijos === '3mas';
      const enInterior = !['caba','gba_norte','gba_sur','gba_oeste','laplata'].includes(p.zona);
      if (tieneHijos) {
        dims.push({ name: "Salud", icon: "❤️", level: "pos_strong",
          body: "Continuidad de tratamientos pediátricos especializados (oncología, cardiología, trasplante, enfermedades raras) que estaban en riesgo. La ley asigna recursos urgentes." });
        dims.push({ name: "Carga mental", icon: "🧠", level: "pos",
          body: "Menor incertidumbre sobre la disponibilidad de profesionales que atienden a tu hijo." });
      }
      if (tieneHijos && enInterior) {
        dims.push({ name: "Salud", icon: "❤️", level: "pos_strong",
          body: "Sin Garrahan en condiciones, la pediatría especializada no tiene equivalente en muchas provincias. La ley defiende ese sistema de derivación nacional del que dependés." });
        dims.push({ name: "Movilidad", icon: "🛤️", level: "pos_soft",
          body: "Tu acceso a cobertura federal pediátrica es real." });
      }
      const noEsEmpleadoPub = p.ocupacion !== 'empleado_pub';
      if (noEsEmpleadoPub) {
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "Impacto fiscal real (asignación adicional al presupuesto Salud). Es difuso para vos pero está." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "pos",
        body: "Veto del PEN rechazado con 2/3 en ambas cámaras. Congreso ejerciendo facultades constitucionales. Buena salud institucional independiente de la posición sobre la política específica." });
      dims.push({ name: "Salud", icon: "❤️", level: "pos_soft",
        body: "Sistema pediátrico federal sostenido. Beneficio sistémico para la sociedad." });
      return dims;
    },
    compareProfiles: [
      { name: "Residente médica del Garrahan", sub: "Empleada pública · Salud", badges: { Plata: "pos_strong", Trabajo: "pos", Estabilidad: "pos" } },
      { name: "Familia del interior con hijo oncológico", sub: "Empleado priv. · NOA · 2 hijos", badges: { Salud: "pos_strong", "Carga mental": "pos", Movilidad: "pos_soft" } },
      { name: "Familia CABA con hijo en Garrahan", sub: "Empleado priv. · CABA · 1 hijo", badges: { Salud: "pos_strong", "Carga mental": "pos" } },
      { name: "Empleado público sector salud", sub: "Empleado público · Hosp. nacional", badges: { Trabajo: "pos", "País / Equilibrio institucional": "pos" } },
      { name: "Contribuyente sin hijos pequeños", sub: "Monotributista · Sin hijos", badges: { Plata: "soft", "País / Equilibrio institucional": "pos" } }
    ]
  },
  {
    id: "devaluacion_diciembre_2023",
    title: "Devaluación inicial diciembre 2023",
    date: "2023-12-13",
    meta: "Comunicación BCRA 'A' 7917 · vigente",
    desc: "Modificación del régimen cambiario. Tipo de cambio mayorista pasó de $367 a $799,97 (+118% en un día; BCRA la mide 54,2% por matemática del cambio inverso). Inflación dic-2023: 25,5% mensual, 211,4% anual (peor en 32 años). Salario real privado -20% en 2 meses. Indigencia: 9,6% → 15% (sumó 2,5M personas). Pobreza: 44,7% → 57,4% (sumó 5,7M personas). Canasta básica +72,9% en Q4 2023.",
    tags: ["Plata","Cambiario","Pobreza"],
    fuente: "BCRA — Comunicación A 7917. INDEC, Infobae, Ámbito.",
    impact: function(p) {
      const dims = [];
      const esAsalariado = p.ocupacion === 'empleado_priv' || p.ocupacion === 'empleado_pub' || p.ocupacion === 'autonomo' || p.ocupacion === 'monotrib' || p.ocupacion === 'domestica_reg' || p.ocupacion === 'domestica_no_reg';
      if (esAsalariado) {
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "Tu sueldo en pesos perdió 20% real en 2 meses. Si ganabas $500k reales (lo que comprabas) en nov-2023, en feb-2024 comprabas $400k con el mismo nominal aumentado a $700k. Pérdida documentada por INDEC." });
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "mid",
          body: "Incertidumbre + congelamiento real de poder adquisitivo afecta planificación familiar." });
      }
      if (p.ocupacion === 'jubilado_min' || p.ocupacion === 'jubilado_med' || p.ocupacion === 'pensionado') {
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "Haberes en pesos con fórmula de movilidad rezagada vs devaluación. Bono fijo $70k congelado desde su creación = mes a mes vale menos. La pérdida real fue mayor que en privados porque la actualización tardaba meses." });
        dims.push({ name: "Salud", icon: "❤️", level: "mid",
          body: "Insumos y medicamentos importados subieron de inmediato. Sin actualización paralela del haber, postergación de tratamientos." });
      }
      if (p.ocupacion === 'trab_informal' || p.ocupacion === 'ama_casa' || p.ocupacion === 'desempleado') {
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "Sin paritarias ni mecanismos de actualización, perdiste poder de compra completo en 2 meses. Canasta básica +73% en un trimestre. La indigencia subió del 9,6% al 15% en 90 días." });
      }
      const tieneAsistencia = Array.isArray(p.asistencia) && p.asistencia.length > 0 && !p.asistencia.includes('ninguno');
      if (tieneAsistencia) {
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "Los planes con monto en pesos sin actualización inmediata: AUH valía 30% menos después de la devaluación. Recomposiciones llegaron en cuotas." });
      }
      if (p.ocupacion === 'pyme') {
        dims.push({ name: "Plata", icon: "💰", level: "mid",
          body: "Si tu PyME usa insumos importados, tus costos en pesos se duplicaron. Si tus precios estaban con margen ajustado, dejaste de ser rentable hasta poder ajustar." });
        dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
          body: "Reducción de plantilla por margen achicado." });
      }
      const ingresoMuyAlto = p.ingreso === 'mas_6m' || p.ingreso === '6m_15m' || p.ingreso === 'mas_15m';
      if (ingresoMuyAlto) {
        dims.push({ name: "Plata", icon: "💰", level: "pos",
          body: "Si tenés ahorros en dólares: tu pesos-equivalente se duplicó. Comprar inmuebles, auto, viajar: mejor momento del año. Si exportás o tu ingreso depende de USD, margen explota a favor." });
      }
      return dims;
    },
    compareProfiles: [
      { name: "Asalariada privada", sub: "Empleada · ≤$1,5M", badges: { Plata: "strong", Estabilidad: "mid" } },
      { name: "Jubilada mínima sola", sub: "Jubilada · PAMI · CABA", badges: { Plata: "strong", Salud: "mid" } },
      { name: "Beneficiaria AUH con 2 hijos", sub: "Cuidado hogar · AUH/Alimentar", badges: { Plata: "strong" } },
      { name: "PyME industrial con insumos", sub: "Empresario PyME · Importa partes", badges: { Plata: "mid", Trabajo: "mid" } },
      { name: "Exportador agropecuario", sub: "PyME · Agro · USD", badges: { Plata: "pos" } },
      { name: "Empresario con ahorro en USD", sub: "Empresario · +$6M", badges: { Plata: "pos" } }
    ]
  },
  {
    id: "blanqueo_capitales_2024",
    title: "Blanqueo de capitales 2024 (Régimen de Regularización de Activos)",
    date: "2024-07-08",
    meta: "Ley 27.743 Tit. II · Dto 608/2024 · RG ARCA 5528 · USD 31.252M reportados blanqueados",
    desc: "Régimen de Regularización de Activos. Alícuotas escalonadas 5% (hasta 30-sep-2024) / 10% (oct-dic 2024) / 15% (ene-mar 2025). USD 100k umbral exento. Mediante Cuenta Especial de Regularización (CERA) en banco argentino con inmovilización hasta 31-ene-2025: alícuota 0%. Exonera Bienes Personales hasta 31-dic-2023 sobre lo blanqueado. Adhesión hasta 31-mar-2025. Excluidos: funcionarios públicos y sus familias.",
    tags: ["Plata","Fiscal"],
    fuente: "Boletín Oficial — Ley 27.743 Tit. II + Decreto 608/2024 + RG ARCA 5528. Chequeado, Tributum.",
    impact: function(p) {
      const dims = [];
      const ingresoMuyAlto = p.ingreso === 'mas_6m' || p.ingreso === '6m_15m' || p.ingreso === 'mas_15m';
      if (ingresoMuyAlto || p.ocupacion === 'pyme') {
        dims.push({ name: "Plata", icon: "💰", level: "pos_strong",
          body: "Por una alícuota baja (5% en la primera etapa, 10-15% en posteriores) regularizás patrimonio histórico que estaba en negro. Si depositabas en una Cuenta Especial de Regularización (CERA) en banco argentino y dejabas inmovilizado hasta 31-ene-2025: 0%, exento. La operatoria normal de blanquear en mercado paralelo costaba 30-50% más. Adicionalmente exonera Bienes Personales hasta 2023." });
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "pos",
          body: "Tu patrimonio entra al sistema formal: podés comprar, vender, heredar sin riesgo de penalización por origen." });
      }
      const esTrabajadorTransparente = p.ocupacion === 'empleado_priv' || p.ocupacion === 'empleado_pub' || p.ocupacion === 'monotrib' || p.ocupacion === 'autonomo';
      const ingresoMedioBajo = p.ingreso === 'hasta_700k' || p.ingreso === '700k_1.5m' || p.ingreso === '1.5m_3m';
      if (esTrabajadorTransparente && ingresoMedioBajo) {
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "Asimetría real: vos pagaste IVA, Ganancias e impuestos todos los años a tasa plena. El que evadió ahora regularizó con 5%. La merma fiscal del blanqueo (Bienes Personales exonerado por 5 años) se compensa con presión sobre los que ya estaban en el sistema." });
      }
      if (p.ocupacion === 'jubilado_min' || p.ocupacion === 'jubilado_med' || p.ocupacion === 'pensionado') {
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "Costo fiscal indirecto: la merma recaudatoria del blanqueo presiona partidas que financian ANSES, PAMI, planes sociales." });
      }
      if (p.ocupacion === 'trab_informal' || p.ocupacion === 'ama_casa' || p.ocupacion === 'desempleado') {
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "Costo fiscal indirecto sobre tu vida cotidiana vía servicios públicos, ANSES, planes sociales." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "mid",
        body: "Es el tercer blanqueo del siglo XXI (Macri 2017, Massa 2022/2023, Milei 2024). Cultura del 'esperar el próximo blanqueo' como estrategia tributaria. Erosiona la cultura de cumplimiento." });
      return dims;
    },
    compareProfiles: [
      { name: "Profesional con USD en exterior", sub: "Autónomo · USD no declarados", badges: { Plata: "pos_strong", Estabilidad: "pos" } },
      { name: "Empresa exportadora", sub: "PyME · Exportador · USD", badges: { Plata: "pos_strong", Estabilidad: "pos" } },
      { name: "Asalariado cumplidor", sub: "Empleado · Siempre pagó", badges: { Plata: "soft" } },
      { name: "Jubilado dependiente ANSES", sub: "Jubilado mín. · Sin patrimonio", badges: { Plata: "soft" } },
      { name: "Trabajadora informal AUH", sub: "Cuidado hogar · AUH", badges: { Plata: "soft" } }
    ]
  },
  {
    id: "bienes_personales_reforma_2024",
    title: "Reforma del Impuesto sobre Bienes Personales",
    date: "2024-07-08",
    meta: "Ley 27.743 Tit. III · Dto 608/2024 · vigente",
    desc: "MNI sube de $27M a $100M. Mínimo casa habitación: $137M → $350M. Alícuotas bajan escalonadas hacia 2027 (proporcional única). REIBP: pago adelantado por 5 años (0,45% no regularizado, 0,50% blanqueado). Contribuyentes cumplidores (declararon 2020-2022 + no blanquearon): 0,375% por 2023-2025.",
    tags: ["Plata","Fiscal"],
    fuente: "Boletín Oficial — Ley 27.743 Tit. III + Decreto 608/2024. Chequeado.",
    impact: function(p) {
      const dims = [];
      const ingresoAlto = p.ingreso === '3m_6m' || p.ingreso === 'mas_6m' || p.ingreso === '6m_15m' || p.ingreso === 'mas_15m';
      if (ingresoAlto) {
        dims.push({ name: "Plata", icon: "💰", level: "pos_strong",
          body: "Mínimo no imponible más alto + alícuotas menores. Si tenías que pagar $50M de Bienes Personales en 2023, ahora pagás $20-30M. Reducción real del orden del 40-60% según patrimonio." });
      }
      if (p.ocupacion === 'pyme' && !ingresoAlto) {
        dims.push({ name: "Plata", icon: "💰", level: "pos",
          body: "Si tu patrimonio está entre $27M-$100M (depto + auto + plazo fijo): antes pagabas Bienes Personales; ahora no pagás nada." });
      }
      const ingresoMedioBajo = p.ingreso === 'hasta_700k' || p.ingreso === '700k_1.5m' || p.ingreso === '1.5m_3m';
      const esTrabajador = p.ocupacion === 'empleado_priv' || p.ocupacion === 'empleado_pub' || p.ocupacion === 'monotrib' || p.ocupacion === 'autonomo';
      if (esTrabajador && ingresoMedioBajo) {
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "Nunca pagaste Bienes Personales. La reforma no te toca directamente, pero la recaudación patrimonial que cayó se compensa con IVA y Ganancias que sí pagás." });
      }
      if (p.ocupacion === 'jubilado_min' || p.ocupacion === 'jubilado_med' || p.ocupacion === 'pensionado') {
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "Merma recaudatoria presiona presupuestos sociales." });
      }
      if (p.ocupacion === 'trab_informal' || p.ocupacion === 'ama_casa' || p.ocupacion === 'desempleado') {
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "Costo fiscal indirecto: el sistema tributario se vuelve más regresivo (más peso de IVA, menos peso de impuestos patrimoniales)." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "mid",
        body: "Se alivia el impuesto patrimonial (progresivo) y se mantiene la carga sobre IVA y Ganancias (regresivos en la práctica). El sistema fiscal argentino se vuelve más regresivo en el corto plazo." });
      return dims;
    },
    compareProfiles: [
      { name: "Gran empresario con patrimonio +$500M", sub: "Empresario · Patrimonio alto", badges: { Plata: "pos_strong" } },
      { name: "Profesional con depto + auto + plazo fijo", sub: "Autónomo · Patrimonio $50-100M", badges: { Plata: "pos" } },
      { name: "Asalariada de ingresos medios", sub: "Empleada priv. · $700k-1,5M", badges: { Plata: "soft" } },
      { name: "Jubilada mínima sin patrimonio", sub: "Jubilada · Casa propia chica", badges: { Plata: "soft" } },
      { name: "Trabajadora informal", sub: "Cuidado hogar · AUH", badges: { Plata: "soft" } }
    ]
  },
  {
    id: "eliminacion_sira_creacion_sedi",
    title: "Eliminación SIRA → SEDI → eliminación SEDI",
    date: "2023-12-26",
    meta: "RGC 5466/2023 + RGC 5651/2025 + Comunicación BCRA 'A' 7917 · vigente",
    desc: "Resolución General Conjunta 5466/2023 (27-dic-2023) derogó SIRA, creó SEDI + Padrón de Deuda Comercial. Resolución General Conjunta 5651/2025 (24-feb-2025) derogó SEDI: importaciones quedan libres de control previo. Importaciones de bienes terminados +129% en cantidad. Sectores sustitutivos afectados: Tierra del Fuego electrónica (Mirgor 760 despidos + Newsan 1000 suspensiones, >15% de los 13.000 metalúrgicos provinciales), textil/calzado (20.700 puestos perdidos), electrodomésticos.",
    tags: ["Trabajo","Importaciones","Industria"],
    fuente: "Boletín Oficial — RGC 5466/2023 + RGC 5651/2025. Comunicación BCRA A 7917. AIERA, La Nación, ANRed.",
    impact: function(p) {
      const dims = [];
      const esPymeIndustrial = p.ocupacion === 'pyme';
      if (esPymeIndustrial) {
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "Tu producto compite ahora con importaciones que entran sin restricción. Si producís electrodomésticos, electrónica, textil o calzado, te cae demanda. Cadenas grandes prefieren importar directo." });
        dims.push({ name: "Trabajo", icon: "🛠️", level: "strong",
          body: "Reducción de plantilla para sostenerse. Sectores con cierre de líneas documentado." });
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "mid",
          body: "Riesgo concreto de cierre si no podés competir en costo." });
      }
      const esTrabajadorIndustrial = p.ocupacion === 'empleado_priv';
      const enZonaIndustrial = p.zona === 'patagonia' || p.zona === 'gba_oeste' || p.zona === 'gba_sur' || p.zona === 'cba_int' || p.zona === 'santafe_int' || p.zona === 'noa' || p.zona === 'nea';
      if (esTrabajadorIndustrial && enZonaIndustrial) {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "strong",
          body: "Sin SIRA/SEDI las importaciones entran sin control. Tierra del Fuego electrónica: Mirgor 760 despidos + Newsan 1000 suspensiones + Radio Victoria 130 = >15% de los 13.000 metalúrgicos provinciales afectados. Conurbano industrial: efecto cascada. El golpe específico vino después con decretos sectoriales (textil 236/2025, celulares 333/2025) pero el SIRA/SEDI fue la habilitación general." });
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "strong",
          body: "Tu sector tiene horizonte incierto." });
      }
      const ingresoMedioAlto = p.ingreso === '1.5m_3m' || p.ingreso === '3m_6m' || p.ingreso === 'mas_6m' || p.ingreso === '6m_15m' || p.ingreso === 'mas_15m';
      if (ingresoMedioAlto) {
        dims.push({ name: "Plata", icon: "💰", level: "pos_soft",
          body: "Más oferta y mejor disponibilidad de productos importados. Electrónica, indumentaria, electrodomésticos, vehículos." });
        dims.push({ name: "Movilidad", icon: "🛤️", level: "pos_soft",
          body: "Acceso a productos premium que antes estaban limitados." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "mid",
        body: "Decisión de desindustrializar sin política industrial complementaria. El argumento 'el SIRA era ineficiente y corrupto' es válido; el 'barrer todo el control sin reemplazar con criterio productivo' es otra discusión." });
      return dims;
    },
    compareProfiles: [
      { name: "Operario electrónica Tierra del Fuego", sub: "Empleado priv. · Patagonia · Mirgor/Newsan", badges: { Trabajo: "strong", Estabilidad: "strong" } },
      { name: "PyME textil Catamarca", sub: "Empresario PyME · NOA", badges: { Plata: "strong", Trabajo: "strong", Estabilidad: "mid" } },
      { name: "Importador formal CABA", sub: "Empresario · CABA · Retail", badges: { Plata: "pos_strong", Trabajo: "pos" } },
      { name: "Consumidor ingreso medio", sub: "Empleado priv. · $1,5-3M", badges: { Plata: "pos_soft", Movilidad: "pos_soft" } },
      { name: "Productor de partes electrónicas continente", sub: "PyME · CABA · Proveedor", badges: { Trabajo: "mid" } }
    ]
  },
  {
    id: "transformacion_inta_inti",
    title: "Transformación de INTA, INTI y disolución INASE/INAFCI",
    date: "2025-07-08",
    meta: "Decreto 462/2025 · facultades delegadas Ley Bases · vigente",
    desc: "INTA pasa de organismo descentralizado autárquico a desconcentrado bajo Sec. Bioeconomía del Min. Economía: pierde autonomía institucional y financiera, presidente unipersonal designado por PEN. INTI pierde autonomía: depende de Sec. Industria y Comercio. INASE (semillas) disuelto. INAFCI (agricultura familiar) disuelto. INTA: 75 años, ~6.000 trabajadores, 53 estaciones experimentales. INTI: ~3.000 trabajadores, certificaciones técnicas. INAFCI canalizaba programas para ~250.000 productores familiares.",
    tags: ["Trabajo","Salud","País"],
    fuente: "Boletín Oficial — Decreto 462/2025. CARBAP, Infobae, La Nación, Motivar.",
    impact: function(p) {
      const dims = [];
      const enZonaAgro = p.zona === 'nea' || p.zona === 'noa' || p.zona === 'cuyo' || p.zona === 'patagonia' || p.zona === 'pueblo' || p.zona === 'cba_int' || p.zona === 'santafe_int';
      if (p.ocupacion === 'pyme' && enZonaAgro) {
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "Sin asistencia técnica gratuita del INTA, los productores chicos pierden la herramienta que les permitía competir tecnológicamente con productores grandes. Tenés que contratar consultor privado (caro) o adoptar paquetes tecnológicos comerciales (con sesgo al producto del proveedor)." });
        dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
          body: "Tu modelo productivo depende del know-how que el INTA aportaba." });
      }
      if (p.ocupacion === 'pyme' && !enZonaAgro) {
        dims.push({ name: "Plata", icon: "💰", level: "mid",
          body: "Sin certificaciones INTI accesibles, tenés que ir a laboratorios privados (más caros). Afecta sectores con normativas técnicas (alimentos, juguetes, materiales constructivos, eléctrico)." });
      }
      if (p.ocupacion === 'trab_informal' && enZonaAgro) {
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "El INAFCI canalizaba programas específicos para tu sector (~250.000 productores familiares). Su disolución elimina la única ventanilla específica nacional para vos." });
        dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
          body: "Asesoramiento técnico, microcréditos, capacitación quedan sin marco institucional federal." });
        dims.push({ name: "Movilidad social", icon: "🛤️", level: "mid",
          body: "Tu transición de productor familiar a formalizado dependía de programas que ahora se diluyen." });
      }
      if (p.ocupacion === 'empleado_pub') {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "strong",
          body: "Si trabajás en INTA/INTI/INASE/INAFCI: riesgo concreto de no renovación, reorganización con pérdida de cargo, mudanza forzosa. Trabajadores con 20-30 años de carrera ven incierto su futuro." });
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "strong",
          body: "Pérdida de autonomía institucional implica que las decisiones sobre tu cargo dependen ahora de prioridades del Min. Economía." });
      }
      if (p.zona === 'pueblo') {
        dims.push({ name: "Calidad de servicios", icon: "🔌", level: "mid",
          body: "Muchas estaciones experimentales del INTA eran motor productivo y social de pueblos chicos. Su debilitamiento afecta la economía local." });
      }
      dims.push({ name: "Salud", icon: "❤️", level: "mid",
        body: "INTI hacía certificaciones de seguridad alimentaria, ensayos de productos para el hogar (juguetes, biberones, electrodomésticos, materiales constructivos), equipamiento médico hospitalario y calidad de agua. Sin autonomía técnica, esa función pasa al Min. Economía bajo Sec. Industria y Comercio — riesgo concreto de que productos defectuosos lleguen al mercado, especialmente importaciones aceleradas sin filtro. Casos históricos cuando ANMAT/INTI bajaron capacidad: medicamentos adulterados, agua contaminada, juguetes con plomo." });
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "strong",
        body: "Eliminación de autonomías institucionales construidas en 75 años (INTA es de 1956). Centralización del poder técnico en el Min. Economía. Pérdida de capacidad de investigación pública aplicada con criterio territorial. Argentina queda como caso atípico vs Brasil (EMBRAPA fortalecida), Chile (INIA con autonomía), Uruguay (INIA con presupuesto creciente)." });
      return dims;
    },
    compareProfiles: [
      { name: "Productor agropecuario chico NOA", sub: "PyME · Agricultura familiar", badges: { Plata: "strong", Trabajo: "mid" } },
      { name: "Productor familiar campesino", sub: "Trabajo informal · NEA · INAFCI", badges: { Plata: "strong", Trabajo: "mid", "Movilidad social": "mid" } },
      { name: "Trabajador INTA estación experimental", sub: "Empleado público · INTA", badges: { Trabajo: "strong", Estabilidad: "strong" } },
      { name: "PyME industrial con certificaciones", sub: "Empresario PyME · CABA · INTI cliente", badges: { Plata: "mid" } },
      { name: "Habitante pueblo con estación INTA", sub: "Cualquier ocupación · Pueblo", badges: { "Calidad de servicios": "mid", Salud: "mid" } },
      { name: "Consumidor de productos para el hogar", sub: "Empleado priv. · CABA · Familia", badges: { Salud: "mid" } }
    ]
  },
  {
    id: "aranceles_celulares_electronicos",
    title: "Aranceles celulares y electrónicos — Decreto 333/2025",
    date: "2025-05-20",
    meta: "Decreto 333/2025 · arancel celulares 16% → 8% → 0% (15-ene-2026) · vigente",
    desc: "Decreto 333/2025: arancel de importación de celulares 16% → 8% → 0% (15-ene-2026). Mismo esquema para consolas de videojuegos, televisores, monitores y aires acondicionados. Impuestos internos: 17% → 9,5% importados; 0% para fabricados en Tierra del Fuego bajo Ley 19.640. Tierra del Fuego: 190.000 habitantes, 13.000 metalúrgicos directos + 40-50k indirectos. Mirgor 760 despidos + Newsan 1.000 suspensiones + Radio Victoria 130. BGH+NewSan+Mirgor presentaron plan que arriesga 50% de los puestos. 6.000 empleos en riesgo concreto.",
    tags: ["Trabajo","Plata","Industria"],
    fuente: "Boletín Oficial — Decreto 333/2025. Infobae, ADNSUR, Beccar Varela, Fundar.",
    impact: function(p) {
      const dims = [];
      if (p.zona === 'patagonia' && (p.ocupacion === 'empleado_priv' || p.ocupacion === 'pyme' || p.ocupacion === 'trab_informal')) {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "strong",
          body: "El sector electrónica fueguino perdió capacidad competitiva. Si trabajás en Mirgor, Newsan, BGH, IATEC: tu trabajo está en la lista de los 6.000 puestos en riesgo. Suspensiones sin paga, despidos por tandas, plan empresarial que admite el 50% de los puestos como sacrificables." });
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "strong",
          body: "Sin marco temporal claro de protección a la industria fueguina. La Ley 19.640 sigue formalmente pero queda vaciada." });
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "Suspensiones sin paga + indemnizaciones con tope DNU 70 = pérdida real de ingreso para sostener una familia en una provincia con costo de vida 30-40% más alto que el promedio nacional." });
        dims.push({ name: "Movilidad social", icon: "🛤️", level: "strong",
          body: "La provincia se construyó con migración promovida por la Ley 19.640. Si la industria se vacía, se invierte la migración. Familias enteras vuelven al continente, escuelas con menos alumnos, comercios cerrando." });
        dims.push({ name: "Vivienda", icon: "🏠", level: "mid",
          body: "Mercado inmobiliario de TDF se derrumba: propietarios vendieron al 40-50% del valor 2023; quienes alquilaban perdieron inquilinos." });
      }
      if (p.zona === 'patagonia') {
        dims.push({ name: "Calidad de servicios", icon: "🔌", level: "mid",
          body: "Provincia con menos recaudación = menos inversión municipal y provincial. Servicios públicos (recolección, transporte urbano, salud, escuelas) sufren al achicarse la base económica." });
      }
      const ingresoMedioBajo = p.ingreso === 'hasta_700k' || p.ingreso === '700k_1.5m' || p.ingreso === '1.5m_3m';
      const ingresoAlto = p.ingreso === '3m_6m' || p.ingreso === 'mas_6m' || p.ingreso === '6m_15m' || p.ingreso === 'mas_15m';
      if (ingresoMedioBajo || ingresoAlto) {
        dims.push({ name: "Plata", icon: "💰", level: "pos",
          body: "Celulares bajaron 25-40% en precio final en pesos durante 2025-2026. Modelos premium de USD 1.500 ahora rondan USD 900-1.000. Smart TVs grandes -30-35%. Acceso a tecnología que para muchas familias era inalcanzable." });
      }
      if (p.ocupacion === 'estudiante' || p.ocupacion === 'trab_informal' || p.ocupacion === 'ama_casa') {
        dims.push({ name: "Movilidad social", icon: "🛤️", level: "pos_soft",
          body: "Acceso a herramientas digitales (celular, monitor) que sirven para estudiar, trabajar, hacer trámites." });
      }
      if (p.ocupacion === 'pyme' && p.zona !== 'patagonia') {
        dims.push({ name: "Plata", icon: "💰", level: "pos",
          body: "Si sos importador formal o cadena retail electrónica, mejor margen + más rotación. Cadenas grandes (Frávega, Garbarino, Mercado Libre): ganadores estructurales." });
      }
      dims.push({ name: "Salud", icon: "❤️", level: "soft",
        body: "Productos electrónicos importados sin filtro completo (combinación de eliminación SIRA/SEDI + reducción capacidad INTI + arancel cero): riesgo concreto de productos con baterías defectuosas, cargadores no homologados, materiales con compuestos no permitidos. Importaciones de marcas no consolidadas crecieron 200%+ en 2024-2025." });
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "mid",
        body: "Decisión de abandonar el régimen industrial fueguino sin política de transición ni reconversión. Argentina sale del segmento de ensamblaje electrónico nacional. Brasil y México mantienen sus equivalentes; nosotros perdimos." });
      return dims;
    },
    compareProfiles: [
      { name: "Operario Mirgor / Newsan TDF", sub: "Empleado priv. · Patagonia", badges: { Trabajo: "strong", Estabilidad: "strong", Plata: "strong" } },
      { name: "Comerciante en Río Grande / Ushuaia", sub: "PyME · Patagonia · Local", badges: { Trabajo: "strong", "Movilidad social": "strong" } },
      { name: "Habitante TDF con familia metalúrgica", sub: "Cuidado hogar · Patagonia", badges: { Vivienda: "mid", "Calidad de servicios": "mid" } },
      { name: "Estudiante CABA que compra celular", sub: "Estudiante · CABA · Tecnología", badges: { Plata: "pos", "Movilidad social": "pos_soft" } },
      { name: "Comerciante de electrónica continente", sub: "PyME · CABA · Retail", badges: { Plata: "pos" } },
      { name: "Consumidor familiar ingreso medio", sub: "Empleado priv. · $1,5-3M · Hijos", badges: { Plata: "pos", Salud: "soft" } }
    ]
  },
  {
    id: "cepo_cambiario_levantamiento",
    title: "Se levantó el cepo al dólar (Fase 3)",
    date: "2025-04-14",
    meta: "Comunicaciones BCRA \"A\" 8226 y \"A\" 8227 · 14-abr-2025 · vigente",
    desc: "El 14-abr-2025 el Banco Central terminó con el cepo para las personas: cayó el límite de USD 200 por mes y podés comprar dólares libremente. El dólar pasó a flotar dentro de una banda de $1.000 a $1.400 (que se mueve 1% por mes). Las empresas pueden volver a girar ganancias al exterior por los ejercicios desde 2025 y se eliminó el dólar 'blend' que beneficiaba al agro (liquidaban 20% al dólar paralelo). Todo bajo un nuevo acuerdo con el FMI por USD 20.000 millones.",
    tags: ["Plata", "Cambiario", "País"],
    fuente: "Boletín Oficial / BCRA — Comunicaciones \"A\" 8226 y \"A\" 8227 (14-abr-2025), Programa de Estabilización Fase 3. Acuerdo EFF FMI USD 20.000M. Ámbito, Infobae, BCRA.gob.ar.",
    impact: function(p) {
      const dims = [];
      const ingresoMedioAlto = p.ingreso === '1.5m_3m' || p.ingreso === '3m_6m' || p.ingreso === '6m_15m' || p.ingreso === 'mas_15m';
      const ingresoAlto = p.ingreso === '3m_6m' || p.ingreso === '6m_15m' || p.ingreso === 'mas_15m';
      const ingresoBajo = p.ingreso === 'hasta_700k' || p.ingreso === '700k_1.5m';
      if (ingresoMedioAlto) {
        dims.push({ name: "Ahorro", icon: "🐷", level: "pos",
          body: "Si tenías pesos para ahorrar, ahora podés comprar dólares sin el tope de USD 200 mensuales y sin el recargo del 30% que tenía el dólar ahorro. Por primera vez en años el dólar al que comprás es básicamente el mismo que ves en la pantalla, sin desdoblamientos." });
      }
      if (ingresoAlto) {
        dims.push({ name: "Plata", icon: "💰", level: "pos_strong",
          body: "Sos el perfil que más gana con la apertura: dolarizás ahorros sin límite, comprás afuera con tarjeta a un tipo de cambio más barato y, si tenés acciones o empresa, podés mover capital al exterior sin pedir permiso. La brecha entre dólar oficial y paralelo se achicó de ~50% a casi cero." });
      }
      if (p.ocupacion === 'pyme') {
        dims.push({ name: "Plata", icon: "💰", level: "pos",
          body: "Las PyMEs pueden pagar importaciones desde el despacho de origen (antes esperabas hasta 4 cuotas a 30/60/90/120 días). Acceso al dólar para insumos sin la cola del SIRA. Las empresas con socios del exterior vuelven a poder girarles dividendos por los balances desde 1-ene-2025." });
      }
      if (p.zona === 'nea' || p.zona === 'noa' || p.zona === 'cba_int' || p.zona === 'santafe_int' || p.zona === 'pueblo' || p.zona === 'cuyo') {
        if (p.ocupacion === 'pyme' || p.ocupacion === 'autonomo') {
          dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
            body: "Si tu ingreso depende del campo, perdés: al eliminarse el dólar 'blend' (liquidaban 80% oficial / 20% paralelo) el exportador agro cobra menos pesos por la misma cosecha. Es una quita de competitividad de hasta 20% sobre la parte que antes liquidaban al dólar más alto." });
        }
      }
      if (ingresoBajo) {
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "Si vivís al día y tu plata es toda en pesos, la apertura cambiaria casi no te suma: no tenés excedente para dolarizar. Y quedás expuesto del lado malo: si el dólar se va al techo de la banda ($1.400), arrastra los precios de la góndola. El beneficio directo del fin del cepo es para quien ya podía ahorrar en dólares." });
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "soft",
          body: "Tu ingreso es 100% en pesos, así que cualquier salto del dólar dentro de la banda te golpea sin colchón. La previsibilidad para importar y producir es buena para la economía, pero a vos te llega recién si baja la inflación." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
        body: "El esquema descansa en los USD 20.000M del FMI y en que el dólar se quede dentro de la banda. Da previsibilidad para importar y para invertir, pero deja al Banco Central más expuesto: si hay una corrida hacia el techo, tiene que vender reservas para defender los $1.400." });
      return dims;
    },
    compareProfiles: [
      { name: "Ahorrista que compraba dólar blue", sub: "Empleado priv. · $3-6M · CABA", badges: { Plata: "pos_strong", Ahorro: "pos" } },
      { name: "Inversor con acciones / empresa", sub: "Autónomo · +$15M", badges: { Plata: "pos_strong", Ahorro: "pos" } },
      { name: "PyME que importa insumos", sub: "PyME · Santa Fe int.", badges: { Plata: "pos" } },
      { name: "Productor agroexportador", sub: "PyME · Córdoba int. · Campo", badges: { Trabajo: "mid" } },
      { name: "Familia que vive al día en pesos", sub: "Trabajo informal · ≤$700k", badges: { Estabilidad: "soft" } }
    ]
  },
  {
    id: "monotributo_actualizacion_27743",
    title: "Reforma del Monotributo: subieron mucho los topes",
    date: "2024-07-08",
    meta: "Ley 27.743 Título IV · BORA 8-jul-2024 · reglam. Decreto 593/2024 · vigente 1-ene-2024",
    desc: "La Ley 27.743 (paquete fiscal) subió los topes de facturación del monotributo entre 300% y 330%, retroactivo a enero 2024. La categoría más chica (A) pasó a $6,45M anuales y la más alta (K) a $68M. El precio máximo por producto subió a $385.000. Lo más importante: ahora los que prestan servicios (profesionales, freelancers, trabajadores de apps) también pueden llegar a la categoría K; antes su tope era la H. Sirve para no quedar expulsado del régimen simple solo porque la inflación te infló la facturación.",
    tags: ["Plata", "Trabajo", "Impuestos"],
    fuente: "Boletín Oficial — Ley 27.743 Título IV (8-jul-2024), Decreto reglamentario 593/2024. AFIP/ARCA, La Nación, Infobae.",
    impact: function(p) {
      const dims = [];
      if (p.ocupacion === 'monotrib') {
        dims.push({ name: "Plata", icon: "💰", level: "pos",
          body: "Tus topes subieron 300-330% de golpe: la facturación que antes te echaba del monotributo (y te mandaba al régimen general, con IVA y Ganancias) ahora entra cómoda. Concretamente, podés facturar hasta $68M al año y seguir siendo monotributista pleno." });
        dims.push({ name: "Trabajo", icon: "🛠️", level: "pos",
          body: "Si prestás servicios (diseñador, programador, kinesiólogo, contador chico), antes tu techo era la categoría H. Ahora podés llegar hasta la K igual que un comerciante. Dejás de tener que partir tu facturación o pasarte a un régimen mucho más caro para crecer." });
        if (p.ingreso === 'hasta_700k' || p.ingreso === '700k_1.5m') {
          dims.push({ name: "Estabilidad", icon: "🛡️", level: "pos_soft",
            body: "Para el monotributista chico, el alivio es no caer en recategorizaciones que te suban la cuota por encima de lo que ganás. La recategorización pasó a ser semestral (agosto y febrero), lo que da algo más de previsibilidad." });
        }
      }
      if (p.ocupacion === 'autonomo') {
        dims.push({ name: "Plata", icon: "💰", level: "pos_soft",
          body: "Con los topes más altos, a muchos autónomos del régimen general les vuelve a convenir el monotributo: pagás una cuota fija en vez de IVA + Ganancias + autónomos. Conviene rehacer el número con un contador." });
      }
      if (p.ocupacion === 'trab_informal' && (p.extra === 'plataforma' || p.extra === 'changas')) {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "pos_soft",
          body: "Si laburás en apps (Uber, Rappi, PedidosYa) o de changas, el monotributo más amplio te permite formalizarte sin que el primer mes de buena facturación te tire a una categoría impagable. Con monotributo tenés aporte jubilatorio y obra social." });
      }
      if (p.ocupacion === 'pyme') {
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "Si sos PyME del régimen general competís con monotributistas que ahora facturan hasta $68M sin pagar IVA. Es una desventaja de costos frente a quien presta el mismo servicio bajo el régimen simple." });
      }
      return dims;
    },
    compareProfiles: [
      { name: "Freelance de servicios que crecía", sub: "Monotributista · $1,5-3M", badges: { Plata: "pos", Trabajo: "pos" } },
      { name: "Profesional independiente", sub: "Monotributista · $3-6M · CABA", badges: { Plata: "pos", Trabajo: "pos" } },
      { name: "Repartidor de apps que se formaliza", sub: "Trabajo informal · Plataforma", badges: { Trabajo: "pos_soft" } },
      { name: "Autónomo del régimen general", sub: "Autónomo · $1,5-3M", badges: { Plata: "pos_soft" } },
      { name: "PyME formal que paga IVA", sub: "PyME · $6-15M", badges: { Plata: "soft" } }
    ]
  },
  {
    id: "impuesto_pais_fin_diciembre_2024",
    title: "Se terminó el Impuesto PAÍS",
    date: "2024-12-23",
    meta: "Ley 27.541 · venció 22-dic-2024 sin prórroga del Congreso · RG ARCA 5602/2024",
    desc: "El Impuesto PAÍS, que cobraba hasta 17,5% sobre importaciones y encarecía el dólar de viajes y servicios del exterior, venció el 22-dic-2024 y el Gobierno no lo prorrogó. Resultado: importar bienes salió 7,5% a 17,5% más barato; el dólar tarjeta para turismo y compras en el exterior bajó del 60% al 30% de recargo (solo quedó el 30% a cuenta de Ganancias); y servicios como Netflix o Spotify dejaron de pagar ese impuesto. Para el Estado es una pérdida grande: equivale a 1,1% del PBI (unos $5,4 billones según el Presupuesto 2025).",
    tags: ["Plata", "Impuestos", "País", "Cambiario"],
    fuente: "Boletín Oficial — Ley 27.541 (vencimiento sin prórroga, 22-dic-2024). RG ARCA 5602/2024 (eliminó pago a cuenta 95% de importaciones, 25-nov-2024). Presupuesto 2025. Infobae, Ámbito.",
    impact: function(p) {
      const dims = [];
      const ingresoMedioAlto = p.ingreso === '1.5m_3m' || p.ingreso === '3m_6m' || p.ingreso === '6m_15m' || p.ingreso === 'mas_15m';
      dims.push({ name: "Plata", icon: "💰", level: "pos",
        body: "Todo lo importado bajó entre 7,5% y 17,5% por el solo hecho de que ese impuesto dejó de cobrarse. Lo notás en electrónica, repuestos, insumos y productos que vienen de afuera. Es una baja directa de precios, sin trámite." });
      if (ingresoMedioAlto) {
        dims.push({ name: "Vacaciones", icon: "🏖️", level: "pos",
          body: "Viajar al exterior con tarjeta es bastante más barato: el recargo total bajó del 60% al 30%. Si planeabas un viaje o comprás afuera con tarjeta, pagás 30 puntos menos sobre el gasto en dólares." });
      }
      dims.push({ name: "Ocio", icon: "🎭", level: "pos_soft",
        body: "Netflix, Spotify, Steam, apps y suscripciones del exterior dejaron de pagar el Impuesto PAÍS. La factura mensual de esos servicios baja sin que hagas nada." });
      if (p.ocupacion === 'pyme') {
        dims.push({ name: "Plata", icon: "💰", level: "pos",
          body: "Si importás insumos o mercadería, el costo de reposición bajó de entrada. Antes el Impuesto PAÍS se sumaba a todo lo que traías de afuera; ahora ese sobrecosto no está." });
        dims.push({ name: "Trabajo", icon: "🛠️", level: "soft",
          body: "Si tu PyME fabrica algo que compite con lo importado, perdés: el producto de afuera ahora llega más barato y te aprieta el margen. La baja de costos importadores es buena para el que compra y mala para el que produce localmente." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "mid",
        body: "El Tesoro resigna ingresos por 1,1% del PBI (unos $5,4 billones). Es una baja de impuestos real, pero implica que esa plata tiene que salir de otro lado: más ajuste de gasto o más presión sobre otros tributos." });
      return dims;
    },
    compareProfiles: [
      { name: "Familia que viaja al exterior", sub: "Empleado priv. · $3-6M", badges: { Plata: "pos", Vacaciones: "pos", Ocio: "pos_soft" } },
      { name: "Comprador de electrónica importada", sub: "Empleado priv. · $1,5-3M", badges: { Plata: "pos", Ocio: "pos_soft" } },
      { name: "Importador / comercio", sub: "PyME · CABA · Importa", badges: { Plata: "pos" } },
      { name: "PyME que compite con importados", sub: "PyME · Santa Fe int. · Fabrica", badges: { Trabajo: "soft" } },
      { name: "Suscriptor de streaming", sub: "Estudiante · ≤$700k", badges: { Ocio: "pos_soft" } }
    ]
  },
  {
    id: "dnu70_cuotas_sindicales_solidarias",
    title: "Cuota sindical: ahora hay que autorizarla por escrito",
    date: "2023-12-21",
    meta: "DNU 70/2023 arts. 73 y 86 · BORA 21-dic-2023 · con fallos de inconstitucionalidad",
    desc: "Los artículos 73 y 86 del DNU 70/2023 establecieron que para descontarte del sueldo la cuota sindical o la 'cuota solidaria' tenés que firmar una autorización expresa. Antes, la cuota solidaria se le descontaba a todos los trabajadores del convenio —afiliados o no— como aporte al sindicato que negoció el acuerdo. Ahora solo te la pueden descontar si firmaste. Está judicializado: el Juzgado Federal N°2 de Azul (juez Martín Bava) declaró inconstitucionales esos artículos, y hay otras cautelares; por eso la aplicación es parcial según jurisdicción y convenio.",
    tags: ["Trabajo", "Plata", "Estabilidad"],
    fuente: "Boletín Oficial — DNU 70/2023 arts. 73 y 86 (21-dic-2023). Fallo Juzgado Federal N°2 de Azul (juez Bava, 2025) y cautelares varias. Palabras del Derecho, Microjuris.",
    impact: function(p) {
      const dims = [];
      const esAsalariado = p.ocupacion === 'empleado_priv' || p.ocupacion === 'empleado_pub' || p.ocupacion === 'domestica_reg';
      if (esAsalariado) {
        dims.push({ name: "Plata", icon: "💰", level: "pos_soft",
          body: "Si estás bajo convenio pero no estás afiliado, dejaron de poder descontarte automáticamente la cuota solidaria. Eso te devuelve entre 1% y 3% del básico por mes (lo que antes se iba al sindicato sin que lo hayas autorizado)." });
        dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
          body: "El otro lado de la moneda: tu sindicato se queda con menos recursos. Algunos gremios reportan caídas de 40% a 70% de los aportes. Eso debilita la capacidad de negociar paritarias, sostener la obra social sindical y bancar conflictos. Si dependés de esa obra social o de la fuerza del gremio, te afecta indirectamente." });
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "soft",
          body: "La situación es jurídicamente incierta: hay fallos que declararon inconstitucionales los artículos. Según tu provincia y tu convenio, te pueden seguir descontando o no. Conviene revisar el recibo de sueldo." });
      }
      return dims;
    },
    compareProfiles: [
      { name: "Trabajador no afiliado bajo convenio", sub: "Empleado priv. · $1,5-3M", badges: { Plata: "pos_soft", Estabilidad: "soft" } },
      { name: "Afiliado que usa la obra social sindical", sub: "Empleado priv. · $700k-1,5M", badges: { Trabajo: "mid", Salud: "soft" } },
      { name: "Delegado / activista gremial", sub: "Empleado pub. · $1,5-3M", badges: { Trabajo: "mid" } },
      { name: "Empleado público de convenio", sub: "Empleado pub. · $1,5-3M", badges: { Plata: "pos_soft", Trabajo: "mid" } }
    ]
  },
  {
    id: "dnu70_alquileres_tierras_rurales",
    title: "Cayó el límite a extranjeros sobre tierras rurales",
    date: "2023-12-21",
    meta: "DNU 70/2023 · BORA 21-dic-2023 · derogó la Ley 26.737 de Tierras Rurales",
    desc: "El DNU 70/2023 derogó la Ley 26.737 (de 2011), que protegía la propiedad nacional sobre el suelo rural. Con esa derogación cayó el tope del 15% de tierras rurales que podían estar en manos extranjeras, el límite de 1.000 hectáreas continuas por persona extranjera y la prohibición de que extranjeros fueran dueños de campos con cuerpos de agua importantes. También perdió fuerza el Registro Nacional de Tierras Rurales como herramienta de control. Para las locaciones rurales en general: sin plazo mínimo obligatorio, se puede pactar en dólares y sin índice fijo de ajuste.",
    tags: ["Trabajo", "Estabilidad", "Vivienda", "País"],
    fuente: "Boletín Oficial — DNU 70/2023 (21-dic-2023), derogación de la Ley 26.737 (Régimen de Protección al Dominio Nacional sobre Tierras Rurales). También derogó la Ley 27.551 de locaciones.",
    impact: function(p) {
      const dims = [];
      const zonaRural = p.zona === 'nea' || p.zona === 'noa' || p.zona === 'cba_int' || p.zona === 'santafe_int' || p.zona === 'pueblo' || p.zona === 'cuyo' || p.zona === 'patagonia';
      if (zonaRural && (p.ocupacion === 'trab_informal' || p.ocupacion === 'autonomo' || p.ocupacion === 'pyme')) {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
          body: "Si arrendás campo para producir (agricultura familiar, chacra, tambo chico), ahora firmás sin plazo mínimo, sin techo de ajuste y eventualmente en dólares. Quedás más expuesto a que te suban el arrendamiento o no te renueven, porque el dueño tiene total libertad contractual." });
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "mid",
          body: "Sin la Ley 26.737, los fondos de inversión y compradores extranjeros pueden quedarse con grandes extensiones sin el tope de 1.000 hectáreas ni el límite del 15%. Eso presiona el precio de la tierra hacia arriba y empuja al productor chico al desplazamiento." });
      }
      if (zonaRural && p.vivienda === 'alquila') {
        dims.push({ name: "Vivienda", icon: "🏠", level: "soft",
          body: "En el ámbito rural el alquiler de la vivienda asociada al campo también quedó sin las protecciones de la ley derogada: sin plazo mínimo garantizado y con ajuste libre." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "mid",
        body: "Cae el control estatal sobre quién es dueño del suelo rural, incluso en zonas de frontera y con recursos hídricos estratégicos. Es una ganancia de libertad para invertir, pero una pérdida de herramientas de soberanía territorial sobre tierra y agua." });
      if ((p.ingreso === '6m_15m' || p.ingreso === 'mas_15m') && (p.ocupacion === 'pyme' || p.ocupacion === 'autonomo')) {
        dims.push({ name: "Plata", icon: "💰", level: "pos_soft",
          body: "Si sos gran propietario rural o inversor agro/forestal, ganás libertad: podés vender o arrendar a quien quieras, en la moneda que quieras y sin el tope de hectáreas. La tierra como activo se vuelve más líquida y revalorizable." });
      }
      return dims;
    },
    compareProfiles: [
      { name: "Arrendatario chico / agricultura familiar", sub: "Trabajo informal · NEA · Campo", badges: { Trabajo: "mid", Estabilidad: "mid" } },
      { name: "Productor que alquila campo", sub: "PyME · Córdoba int.", badges: { Trabajo: "mid", Vivienda: "soft" } },
      { name: "Gran propietario / inversor agro", sub: "PyME · +$15M · Campo", badges: { Plata: "pos_soft" } },
      { name: "Habitante de zona de frontera", sub: "Autónomo · Patagonia", badges: { Estabilidad: "mid" } }
    ]
  },
  {
    id: "impsa_venta_arc_energy",
    title: "Privatización de IMPSA (turbinas, Mendoza)",
    date: "2025-02-11",
    meta: "Ley 27.742 art. 7° inc. b · BORA 8-jul-2024 · adjudicación a ARC Energy, traspaso 11-feb-2025",
    desc: "IMPSA (Industrias Metalúrgicas Pescarmona, Mendoza) fabrica turbinas hidroeléctricas y aerogeneradores: es un proveedor estratégico de energía. La Ley Bases 27.742 la puso en la lista de empresas a privatizar; el 11-feb-2025 se traspasaron las acciones al grupo estadounidense ARC Energy por unos USD 27 millones (quedó con el 84,9% de las acciones clase C). Era 21% del Estado Nacional, 21% de Mendoza y 58% de acreedores, y emplea alrededor de 650-700 personas. Fue la primera privatización concretada de la gestión Milei. El comprador se comprometió a mantener los puestos, pero queda el riesgo de reestructuración.",
    tags: ["Trabajo", "Estabilidad", "País"],
    fuente: "Boletín Oficial — Ley 27.742 (Ley Bases) art. 7° inc. b (8-jul-2024). Adjudicación y traspaso de acciones a ARC Energy (11-feb-2025), USD 27M. Infobae, Los Andes, El Economista.",
    impact: function(p) {
      const dims = [];
      const enMendoza = p.zona === 'mendoza' || p.zona === 'cuyo';
      if (enMendoza && (p.ocupacion === 'empleado_priv' || p.ocupacion === 'pyme' || p.ocupacion === 'trab_informal')) {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
          body: "Si trabajás en IMPSA o le proveés (metalúrgicas, talleres, logística mendocina), el cambio de dueño abre incertidumbre. El comprador prometió mantener los ~650 puestos, pero una empresa que venía deficitaria y con USD 576M de deuda en renegociación suele entrar en reestructuración. La cadena de proveedores locales depende de que la planta siga activa." });
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "mid",
          body: "Pasás de tener al Estado (Nación + Mendoza tenían 42%) como socio que sostenía el empleo por motivos estratégicos, a un dueño privado extranjero que decide por rentabilidad. Más eficiencia posible, menos red de contención si las cosas se complican." });
      }
      if (enMendoza) {
        dims.push({ name: "Movilidad social", icon: "🛤️", level: "soft",
          body: "Mendoza pierde una palanca de desarrollo industrial propia. IMPSA daba trabajo calificado (ingeniería, metalurgia) que sostiene movilidad ascendente en la provincia. Su futuro pasa a depender de decisiones tomadas afuera." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
        body: "El Estado deja de controlar un fabricante estratégico de equipos de energía (turbinas para represas, aerogeneradores). El Tesoro cobra el precio de venta y se saca de encima una empresa deficitaria, pero el país resigna capacidad tecnológica soberana en un sector clave." });
      return dims;
    },
    compareProfiles: [
      { name: "Operario / técnico de IMPSA", sub: "Empleado priv. · Mendoza", badges: { Trabajo: "mid", Estabilidad: "mid" } },
      { name: "Proveedor metalúrgico mendocino", sub: "PyME · Mendoza", badges: { Trabajo: "mid", "Movilidad social": "soft" } },
      { name: "Habitante de Mendoza", sub: "Empleado pub. · Mendoza", badges: { "Movilidad social": "soft" } },
      { name: "Contribuyente que mira las cuentas", sub: "Autónomo · CABA", badges: { "País / Equilibrio institucional": "soft" } }
    ]
  },
  {
    id: "cierre_inadi",
    title: "Cerró el INADI",
    date: "2024-08-06",
    meta: "Decreto 696/2024 · BORA 6-ago-2024 · funciones a la Subsecretaría de DDHH",
    desc: "El Decreto 696/2024 disolvió el INADI (Instituto Nacional contra la Discriminación, la Xenofobia y el Racismo). Sus funciones pasaron a la Subsecretaría de Derechos Humanos del Ministerio de Justicia, una estructura mucho más chica. Trabajaban allí cerca de 400 personas. En la práctica desaparece la vía administrativa específica y rápida para tramitar una denuncia por discriminación: ahora la víctima tiene que ir a la Justicia o a la órbita reducida de DDHH del Ministerio.",
    tags: ["Estabilidad", "País", "Salud"],
    fuente: "Boletín Oficial — Decreto 696/2024 (6-ago-2024), disolución del INADI. Chequeado, El Litoral, Argentina.gob.ar.",
    impact: function(p) {
      const dims = [];
      const tieneDiscap = p.discapacidad && p.discapacidad !== 'no';
      if (tieneDiscap) {
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "mid",
          body: "Las personas con discapacidad eran de las que más usaban el INADI para denunciar discriminación (en el trabajo, en el acceso a servicios, en la cobertura de salud). Perdés esa vía administrativa rápida y gratuita: ahora el reclamo va a la Justicia, que es más lenta y costosa." });
      }
      if (p.ocupacion === 'empleado_pub') {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "soft",
          body: "Si trabajabas en el INADI, tu puesto está en riesgo: el cierre afectó a cerca de 400 trabajadores estatales, con funciones absorbidas por una estructura más chica que no necesita la misma dotación." });
      }
      dims.push({ name: "Estabilidad", icon: "🛡️", level: "soft",
        body: "Para cualquiera que sufra discriminación (por origen, identidad, religión, condición de salud), se pierde el organismo que tramitaba esas denuncias de forma específica y orientaba a la víctima. Queda la Justicia o una oficina de DDHH mucho más reducida." });
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
        body: "El ahorro fiscal es marginal (del orden de $5.000M anuales). El efecto concreto es menos capacidad estatal especializada para atender discriminación: las funciones siguen formalmente, pero con mucha menos estructura para ejecutarlas." });
      return dims;
    },
    compareProfiles: [
      { name: "Persona con discapacidad y CUD", sub: "Empleado priv. · Discap. propia", badges: { Estabilidad: "mid" } },
      { name: "Trabajador del INADI", sub: "Empleado pub. · CABA", badges: { Trabajo: "soft", Estabilidad: "soft" } },
      { name: "Persona migrante", sub: "Trabajo informal · GBA Sur", badges: { Estabilidad: "soft" } },
      { name: "Contribuyente que mira el gasto", sub: "Autónomo · CABA", badges: { "País / Equilibrio institucional": "soft" } }
    ]
  },
  {
    id: "eliminacion_fonid",
    title: "Se eliminó el FONID (incentivo docente)",
    date: "2024-03-27",
    meta: "DNU 280/2024 · BORA mar-2024 · sacó del Presupuesto los fondos del FONID",
    desc: "El FONID (Fondo Nacional de Incentivo Docente, creado por la Ley 25.053 en 1998) era una suma fija que la Nación sumaba al sueldo de TODOS los docentes del país. Venció en enero de 2024 y el Gobierno no lo prorrogó: el DNU 280/2024 sacó del Presupuesto los recursos previstos para pagarlo ($276.262 millones del Presupuesto 2023 prorrogado). Resultado: los docentes pierden el incentivo nacional (en promedio ~10% del sueldo de bolsillo) salvo que su provincia lo absorba. Las provincias más pobres no pueden absorberlo.",
    tags: ["Trabajo", "Plata", "Estabilidad"],
    fuente: "Boletín Oficial — DNU 280/2024 (mar-2024), elimina del Presupuesto los fondos del FONID (Ley 25.053). Chequeado, DIB, Tiempo Argentino.",
    impact: function(p) {
      const dims = [];
      const esDocente = p.ocupacion === 'empleado_pub';
      if (esDocente) {
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "Si sos docente, perdés el FONID: en promedio cae cerca del 10% de tu sueldo de bolsillo (la cifra exacta varía por provincia). Es plata que recibías todos los meses y que la Nación dejó de mandar. Para que no la pierdas, tu provincia tiene que ponerla de su bolsillo." });
        dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
          body: "Afecta a más de 1,2 millones de docentes en todo el país. El reclamo se trasladó a las provincias, que en muchos casos no tienen plata para reemplazarlo, lo que alimenta conflictos salariales y paros." });
        if (p.zona === 'nea' || p.zona === 'noa') {
          dims.push({ name: "Estabilidad", icon: "🛡️", level: "strong",
            body: "En el NEA y el NOA el golpe es mayor: son provincias con menos recursos propios, que no pueden absorber el FONID. Ahí la pérdida del incentivo se siente entera en el sueldo y deja el salario docente expuesto a la inflación sin colchón nacional." });
        }
      }
      if (p.hijos && p.hijos !== '0' && (p.ingreso === 'hasta_700k' || p.ingreso === '700k_1.5m')) {
        dims.push({ name: "Educación", icon: "📚", level: "soft",
          body: "Si tus hijos van a la escuela pública, el conflicto docente derivado de la quita del FONID se traduce en paros, rotación de maestros y menos previsibilidad en el ciclo lectivo. La calidad educativa se resiente cuando el salario docente queda golpeado." });
      }
      return dims;
    },
    compareProfiles: [
      { name: "Docente de provincia pobre", sub: "Empleado pub. · NOA", badges: { Plata: "strong", Estabilidad: "strong", Trabajo: "mid" } },
      { name: "Docente de provincia rica", sub: "Empleado pub. · CABA", badges: { Plata: "strong", Trabajo: "mid" } },
      { name: "Familia con hijos en escuela pública", sub: "Trabajo informal · ≤$700k · Hijos", badges: { Educación: "soft" } },
      { name: "Contribuyente que mira el ajuste", sub: "Autónomo · CABA", badges: { "País / Equilibrio institucional": "soft" } }
    ]
  },
  {
    id: "regimen_penal_tributario_reforma",
    title: "Reforma penal tributaria: subieron los pisos para que evadir sea delito",
    date: "2024-07-08",
    meta: "Ley 27.743 Título III · BORA 8-jul-2024 · reglam. Decreto 608/2024",
    desc: "La Ley 27.743 subió fuerte los montos a partir de los cuales evadir impuestos se vuelve un delito penal (no solo una infracción administrativa). La evasión simple pasó de $1.500.000 a $100.000.000 por tributo y por año; la evasión agravada saltó a unos $1.000.000.000. Son aumentos de hasta 67 veces. En la práctica, mucha evasión que antes podía terminar en una causa penal ahora solo genera reclamo administrativo de ARCA. Beneficia a contribuyentes medianos y grandes; debilita el efecto disuasorio para el mediano plazo.",
    tags: ["Plata", "Impuestos", "Estabilidad"],
    fuente: "Boletín Oficial — Ley 27.743 Título III (Régimen Penal Tributario, 8-jul-2024), modifica la Ley 27.430 / 24.769. Reglam. Decreto 608/2024. Derecho Penal Online, UCIP.",
    impact: function(p) {
      const dims = [];
      const ingresoAlto = p.ingreso === '6m_15m' || p.ingreso === 'mas_15m';
      const ingresoMedioAlto = p.ingreso === '3m_6m';
      if ((p.ocupacion === 'pyme' || p.ocupacion === 'autonomo' || p.ocupacion === 'monotrib') && (ingresoAlto || ingresoMedioAlto)) {
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "pos",
          body: "Si tenés un negocio o facturás fuerte, baja muchísimo el riesgo penal: hace falta evadir más de $100M (antes $1,5M) para que sea delito. Una diferencia con ARCA que antes te podía abrir una causa penal ahora, en general, se resuelve pagando en el plano administrativo." });
      }
      if (ingresoAlto && (p.ocupacion === 'pyme' || p.ocupacion === 'autonomo')) {
        dims.push({ name: "Plata", icon: "💰", level: "pos_soft",
          body: "Menos exposición penal también significa menos costo en defensa legal y más margen de maniobra para los grandes contribuyentes que estaban en la 'zona gris' con los montos viejos, ya licuados por la inflación." });
      }
      if (p.ocupacion === 'empleado_priv' || p.ocupacion === 'empleado_pub' || p.ocupacion === 'monotrib') {
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "soft",
          body: "Si sos asalariado o monotributista chico que cumple, esto te toca indirecto: el Estado pierde una herramienta para disuadir a los grandes evasores, lo que a mediano plazo significa menos recaudación y una competencia más desleal frente al que ahora puede evadir sin riesgo penal." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
        body: "Actualizar montos congelados desde 2017 era razonable por la inflación, pero el salto (hasta 67x) deja sin amenaza penal a una franja amplia de evasión mediana. Menos miedo a la cárcel puede traducirse en más evasión y menos recaudación con el tiempo." });
      return dims;
    },
    compareProfiles: [
      { name: "Empresario / gran contribuyente", sub: "PyME · +$15M", badges: { Estabilidad: "pos", Plata: "pos_soft" } },
      { name: "Profesional de altos ingresos", sub: "Autónomo · $6-15M", badges: { Estabilidad: "pos", Plata: "pos_soft" } },
      { name: "Comercio mediano", sub: "PyME · $3-6M", badges: { Estabilidad: "pos" } },
      { name: "Asalariado que cumple", sub: "Empleado priv. · $1,5-3M", badges: { Estabilidad: "soft" } },
      { name: "Monotributista chico", sub: "Monotributista · ≤$700k", badges: { Estabilidad: "soft" } }
    ]
  },
  {
    id: "subsidios_energeticos_reduccion_adicional",
    title: "Más quita de subsidios: la luz y el gas suben",
    date: "2024-06-01",
    meta: "Resoluciones SE 90/2024 (electricidad) y 91/2024 (gas) · jun-2024 · sobre segmentación N1/N2/N3",
    desc: "Sobre la segmentación de subsidios (N1 ingresos altos, N2 bajos, N3 medios), el Gobierno profundizó la quita. Los N1 pasaron a pagar el 100% del costo de la energía. A los N2 (ingresos bajos) les subsidian solo los primeros tramos de consumo y el resto va a precio pleno; a los N3 (medios) les achicaron el tope subsidiado (de 400 a 250 kWh de electricidad por mes). Con los reajustes mensuales atados a la inflación y al precio mayorista, las boletas acumularon subas reales muy fuertes en 2024-2025, sobre todo para N1 y parte de N3.",
    tags: ["Plata", "Vivienda", "Calidad de servicios"],
    fuente: "Boletín Oficial — Resoluciones Secretaría de Energía 90/2024 (electricidad) y 91/2024 (gas), jun-2024, sobre la segmentación del Decreto 332/22. Chequeado, Ámbito, EconoJournal.",
    impact: function(p) {
      const dims = [];
      const ingresoAlto = p.ingreso === '3m_6m' || p.ingreso === '6m_15m' || p.ingreso === 'mas_15m';
      const ingresoMedio = p.ingreso === '1.5m_3m';
      const ingresoBajo = p.ingreso === 'hasta_700k' || p.ingreso === '700k_1.5m';
      const usaSubsidio = Array.isArray(p.asistencia) && (p.asistencia.includes('sef') || p.asistencia.includes('tarifa_sube'));
      if (ingresoAlto) {
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "Si tu hogar quedó como N1 (ingresos altos), pagás el 100% del costo de la energía, sin subsidio. La boleta de luz subió entre 200% y 400% en términos reales en el acumulado 2024-2025. Es uno de los gastos fijos que más se te disparó." });
      }
      if (ingresoMedio) {
        dims.push({ name: "Plata", icon: "💰", level: "mid",
          body: "Como hogar N3 (ingresos medios) te recortaron el tope subsidiado: la electricidad ahora se subsidia solo hasta 250 kWh por mes (antes 400) y el resto lo pagás a precio pleno. Si tu casa consume más que eso (aire, electrodomésticos, familia grande), la boleta pega un salto." });
        dims.push({ name: "Vivienda", icon: "🏠", level: "soft",
          body: "El costo de mantener la casa (luz + gas) creció muy por encima de los sueldos. Para la clase media urbana de CABA y GBA, donde el shock tarifario fue mayor, las expensas y servicios se comen una porción creciente del ingreso." });
      }
      if (ingresoBajo && !usaSubsidio) {
        dims.push({ name: "Plata", icon: "💰", level: "mid",
          body: "Aunque seas N2 (ingresos bajos) y conserves subsidio sobre los primeros tramos, todo lo que consumas por encima va a precio pleno. Si no te reinscribiste en el registro (RASE) a tiempo, podés haber perdido el beneficio y estar pagando de más." });
      }
      if (ingresoBajo && usaSubsidio) {
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "Mantenés subsidio sobre los primeros tramos de consumo (la base subsidiada para N2), pero el excedente lo pagás pleno. El alivio existe solo si cuidás el consumo dentro del tope." });
      }
      if (p.ocupacion === 'jubilado_min' || p.ocupacion === 'jubilado_med' || p.ocupacion === 'pensionado') {
        dims.push({ name: "Calidad de servicios", icon: "🔌", level: "mid",
          body: "Muchos jubilados quedaron sin calificar como N2 por superar apenas el umbral de ingreso, y enfrentan boletas a precio cada vez más cercano al costo pleno con un haber que no acompaña. El servicio es el mismo, pero pesa mucho más en el bolsillo." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
        body: "El objetivo fiscal es real: los subsidios energéticos bajaron de ~2,3% a cerca de 0,5% del PBI. Eso ordena las cuentas del Estado, pero traslada el costo a las boletas de los hogares, sobre todo a la clase media urbana." });
      return dims;
    },
    compareProfiles: [
      { name: "Hogar de ingresos altos (N1)", sub: "Empleado priv. · $6-15M · CABA", badges: { Plata: "strong" } },
      { name: "Familia de clase media (N3)", sub: "Empleado priv. · $1,5-3M · CABA", badges: { Plata: "mid", Vivienda: "soft" } },
      { name: "Jubilado que no califica N2", sub: "Jubilado media-alta · GBA Norte", badges: { "Calidad de servicios": "mid", Plata: "mid" } },
      { name: "Hogar de ingresos bajos con subsidio", sub: "Trabajo informal · ≤$700k · SEF", badges: { Plata: "soft" } },
      { name: "Hogar bajo que perdió el beneficio", sub: "Trabajo informal · $700k-1,5M", badges: { Plata: "mid" } }
    ]
  },

  {
    id: "disolucion_afip_creacion_arca",
    date: "2024-10-25",
    title: "Se disolvió la AFIP y nació ARCA",
    meta: "Decreto 953/2024 · BORA 25-oct-2024 · disuelve la AFIP y crea ARCA (Agencia de Recaudación y Control Aduanero)",
    desc: "La AFIP dejó de existir como ente y fue reemplazada por ARCA, ente autárquico en la órbita del Ministerio de Economía, con un Director Ejecutivo designado por el Presidente por 4 años, más la DGI (impositiva) y la DGA (aduana). El decreto recortó cerca del 45% de las autoridades superiores y 31% de los niveles inferiores. ARCA es la sucesora legal de la AFIP: las claves, CUIT y obligaciones de los contribuyentes siguen vigentes.",
    tags: ["Trabajo", "Impuestos", "Estabilidad"],
    fuente: "Boletín Oficial — Decreto 953/2024 (25-oct-2024). Datos de estructura: Argentina.gob.ar (resumen oficial), El Economista, Consejo Profesional de Ciencias Económicas.",
    impact: function(p) {
      const dims = [];
      if (p.ocupacion === 'empleado_pub') {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
          body: "La disolución de la AFIP recortó cerca del <strong>45% de las autoridades superiores y el 31% de los niveles inferiores</strong> al crear ARCA. Si trabajás en el Estado, y más aún en el área de recaudación, el mensaje es de reestructuración: alrededor de 1.500 cargos jerárquicos quedaron expuestos entre despidos y retiros." });
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "mid",
          body: "ARCA tiene un Director Ejecutivo designado directamente por el Presidente por 4 años. Para el empleado público significa una estructura más controlable desde la política y con menos capas intermedias que antes daban estabilidad de carrera." });
      }
      if (p.ocupacion === 'monotrib' || p.ocupacion === 'autonomo' || p.ocupacion === 'pyme') {
        dims.push({ name: "Tiempo", icon: "⏰", level: "soft",
          body: "ARCA es la sucesora legal de la AFIP: tu CUIT, tus claves y tus obligaciones siguen igual. Pero todo cambio de organismo trae demoras de transición (sistemas, nombres, ventanillas). Si tenés un trámite en curso conviene seguirlo de cerca durante el traspaso." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
        body: "El ahorro presupuestario salarial es real y el Estado se saca de encima una estructura sobredimensionada. El riesgo de corto plazo es la capacidad de fiscalizar y de controlar la aduana: menos personal jerárquico en frontera y la curva de aprendizaje del nuevo organismo pueden dejar baches mientras se reordena." });
      return dims;
    },
    compareProfiles: [
      { name: "Empleado jerárquico de AFIP/ARCA", sub: "Empleado pub. · CABA", badges: { Trabajo: "mid", Estabilidad: "mid" } },
      { name: "Monotributista con trámites en curso", sub: "Monotrib. · interior", badges: { Tiempo: "soft" } },
      { name: "PyME que opera con la aduana", sub: "Empresario PyME · CABA", badges: { Tiempo: "soft", "País / Equilibrio institucional": "soft" } },
      { name: "Contribuyente que mira las cuentas", sub: "Autónomo · CABA", badges: { "País / Equilibrio institucional": "soft" } }
    ]
  },

  {
    id: "reforma_migratoria_dnu_366",
    date: "2025-05-29",
    title: "Reforma migratoria y deportación exprés",
    meta: "DNU 366/2025 · BORA 29-may-2025 · modifica la Ley 25.871 (Migraciones) y la Ley 346 (Ciudadanía)",
    desc: "El DNU endurece la política migratoria: habilita expulsar a extranjeros con antecedentes penales antes de sentencia firme (delitos con pena menor a 5 años bastan para denegar ingreso o deportar), prohíbe el reingreso por 5 años (o de forma permanente en delitos graves), exige 2 años continuos de residencia sin salidas para regularizarse y habilita arancelar la salud y la educación pública para no residentes. El ingreso y egreso solo puede hacerse por pasos habilitados.",
    tags: ["Estabilidad", "Trabajo", "Salud", "País"],
    fuente: "Boletín Oficial — DNU 366/2025 (29-may-2025), modifica Ley 25.871 y Ley 346. Análisis: EY Argentina, La Causa Laboral, El Diario de San Luis.",
    impact: function(p) {
      const dims = [];
      const frontera = ['nea', 'noa', 'cuyo'].includes(p.zona);
      dims.push({ name: "Estabilidad", icon: "🛡️", level: "pos_soft",
        body: "Si valorás que un extranjero con antecedentes penales graves sea expulsado rápido, el DNU lo habilita: permite deportar antes de la sentencia firme. Tiene base real, antes una expulsión podía demorar de 3 a 5 años con apelaciones. Para vos es percepción de mayor orden." });
      if (frontera) {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
          body: "En provincias de frontera (NEA, NOA, Cuyo) el trabajo y la vida social están entrelazados con el cruce de personas. El nuevo requisito de <strong>2 años continuos sin salidas</strong> para regularizar la residencia es difícil de cumplir para quien trabaja cerca del límite o tiene familia del otro lado. Cambia la dinámica laboral de toda la zona." });
      }
      if (p.salud === 'hosp_pub') {
        dims.push({ name: "Salud", icon: "❤️", level: "mid",
          body: "El DNU habilita arancelar la salud pública para no residentes. Si tu hospital de referencia atiende a población migrante de frontera, la reglamentación puede sumar controles de DNI y residencia en la ventanilla que terminan demorando la atención de todos, incluido vos." });
      }
      if (p.hijos && p.hijos !== '0') {
        dims.push({ name: "Vida familiar / ocio", icon: "👨‍👩‍👧", level: "soft",
          body: "En familias mixtas (un hijo argentino con padre o madre extranjero deportable) la expulsión antes de sentencia firme puede separar a la familia. Choca con el interés superior del niño de la Convención de los Derechos del Niño, que en Argentina tiene rango constitucional." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
        body: "El debate de fondo es el debido proceso: deportar antes de una condena firme, y por delitos con pena menor a 5 años, reduce garantías que la Constitución reconoce a toda persona, no solo a los ciudadanos. Es una medida con respaldo de parte de la sociedad y con objeciones serias de organismos de derechos humanos." });
      return dims;
    },
    compareProfiles: [
      { name: "Ciudadano que pide más orden", sub: "Empleado priv. · CABA", badges: { Estabilidad: "pos_soft", "País / Equilibrio institucional": "soft" } },
      { name: "Trabajador de provincia de frontera", sub: "Empleado priv. · NEA", badges: { Trabajo: "mid", Estabilidad: "pos_soft" } },
      { name: "Familia mixta con hijo argentino", sub: "Trabajo informal · NEA · con hijos", badges: { "Vida familiar / ocio": "soft", "País / Equilibrio institucional": "soft" } },
      { name: "Paciente de hospital público de frontera", sub: "Hosp. público · NOA", badges: { Salud: "mid" } }
    ]
  },

  {
    id: "belgrano_cargas_privatizacion",
    date: "2025-02-10",
    title: "Privatización del Belgrano Cargas",
    meta: "Decreto 67/2025 · BORA 10-feb-2025 · Ley Bases 27.742 art. 7° · privatización total de Belgrano Cargas y Logística",
    desc: "El decreto autorizó la privatización total de Belgrano Cargas y Logística S.A. mediante desintegración vertical: remate público del material rodante (vagones y locomotoras) y concesión de obra pública para las vías, inmuebles y talleres. La empresa opera las líneas General Belgrano, San Martín y Urquiza, mueve unos 6 millones de toneladas al año (granos y minerales del NOA hacia los puertos) y tiene alrededor de 5.000 empleados.",
    tags: ["Trabajo", "Estabilidad", "País"],
    fuente: "Boletín Oficial — Decreto 67/2025 (10-feb-2025), bajo Ley 27.742 art. 7°. Datos operativos: Abogados.com.ar, Perfil, Palabras del Derecho.",
    impact: function(p) {
      const dims = [];
      const traza = ['noa', 'nea', 'santafe_int', 'cba_int', 'rosario', 'tucuman'].includes(p.zona);
      if ((p.ocupacion === 'empleado_priv' || p.ocupacion === 'trab_informal' || p.ocupacion === 'empleado_pub') && traza) {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
          body: "Belgrano Cargas tiene cerca de <strong>5.000 empleados</strong> y mueve unos 6 millones de toneladas por año (granos y minerales del NOA). La privatización es <em>total y por desintegración vertical</em>: remate del material rodante y concesión de las vías. Un proceso así casi siempre arranca con reestructuración de planteles. Los gremios (La Fraternidad, Unión Ferroviaria, APDFA) están en conflicto." });
      }
      if (traza) {
        dims.push({ name: "Movilidad social", icon: "🛤️", level: "soft",
          body: "Los pueblos sobre la traza ferroviaria dependen del tren para mover su producción y, a veces, para conectarse. Si el privado prioriza solo los tramos rentables (los centrales hacia Rosario y Buenos Aires), ramales y estaciones de zonas chicas pueden quedar sin servicio." });
      }
      if ((p.ocupacion === 'pyme' || p.extra === 'renta') && traza) {
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "pos_soft",
          body: "Si tu actividad es agro o logística en el NOA, una operadora privada que invierta puede mejorar la eficiencia de la bajada al puerto y bajar tu costo de flete. Es un beneficio condicional: depende de que el concesionario invierta de verdad en la red y no solo la explote." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
        body: "El Tesoro cobra el precio de venta y deja de subsidiar una operadora deficitaria. A cambio, un insumo logístico crítico para sacar los granos del país queda en manos privadas: si la red se fragmenta entre lo rentable y lo que no lo es, el costo recae sobre las regiones que menos pesan comercialmente." });
      return dims;
    },
    compareProfiles: [
      { name: "Ferroviario del Belgrano Cargas", sub: "Empleado priv. · NOA", badges: { Trabajo: "mid", "Movilidad social": "soft" } },
      { name: "Pueblo sobre la traza ferroviaria", sub: "Trabajo informal · NOA", badges: { "Movilidad social": "soft" } },
      { name: "Productor agro del NOA", sub: "Empresario PyME · NOA", badges: { Estabilidad: "pos_soft", "País / Equilibrio institucional": "soft" } },
      { name: "Contribuyente que mira las cuentas", sub: "Autónomo · CABA", badges: { "País / Equilibrio institucional": "soft" } }
    ]
  },

  {
    id: "enarsa_hidroelectricas_privatizacion",
    date: "2025-08-19",
    title: "Venta de las hidroeléctricas del Comahue (ENARSA)",
    meta: "Decreto 590/2025 · BORA 19-ago-2025 · escisión y venta de los activos hidroeléctricos de ENARSA",
    desc: "El decreto autorizó vender, por concurso público nacional e internacional y sin precio base, las cuatro represas del Comahue que ENARSA y NASA reorganizaron en sociedades anónimas: Alicurá, El Chocón, Cerros Colorados y Piedra del Águila (98% ENARSA, 2% NASA). Generan cerca del 15% de la electricidad del país. El decreto reemplazó al 564/2025, anulado por defectos formales en el informe que avalaba la privatización.",
    tags: ["Plata", "Vivienda", "País", "Calidad de servicios"],
    fuente: "Boletín Oficial — Decreto 590/2025 (19-ago-2025), deja sin efecto el Decreto 564/2025. Activos y proceso: Barreiro Abogados, Perfil, NODAL.",
    impact: function(p) {
      const dims = [];
      if (p.zona === 'patagonia') {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
          body: "Las cuatro represas (Alicurá, El Chocón, Cerros Colorados y Piedra del Águila) están sobre los ríos del Comahue, en tu región. Sus planteles y el royalty hidroeléctrico que cobran las provincias quedan atados a lo que decida el nuevo dueño privado. Para Neuquén y Río Negro es renta y empleo que pasan a manos externas." });
      }
      dims.push({ name: "Plata", icon: "💰", level: "soft",
        body: "Las represas del Comahue generan cerca del <strong>15% de la electricidad del país</strong> y son la fuente más barata (una vez construida, el agua no se paga). El Estado las vende por concurso <em>sin base</em>, es decir sin precio mínimo. Si el privado captura esa renta barata, a mediano plazo hay menos margen para contener tu boleta de luz." });
      dims.push({ name: "Calidad de servicios", icon: "🔌", level: "soft",
        body: "La generación hidro es la que estabiliza el sistema en los picos de demanda. Que pase a privados no cambia tu luz mañana, pero sí quién decide cuándo y cómo se genera la energía más barata del país, algo que repercute en el precio mayorista que termina en tu factura." });
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "mid",
        body: "El Tesoro cobra el precio de venta, pero el país resigna control sobre su generación eléctrica más eficiente. Este decreto reemplazó al 564/2025, anulado por defectos formales en el informe que avalaba la privatización: la operación arrastra cuestionamientos de procedimiento." });
      return dims;
    },
    compareProfiles: [
      { name: "Habitante del Comahue", sub: "Empleado pub. · Patagonia", badges: { Trabajo: "mid", Plata: "soft" } },
      { name: "Usuario eléctrico común", sub: "Empleado priv. · CABA", badges: { Plata: "soft", "Calidad de servicios": "soft" } },
      { name: "Familia que mira la boleta de luz", sub: "Trabajo informal · $700k-1,5M", badges: { Plata: "soft" } },
      { name: "Contribuyente que mira soberanía", sub: "Autónomo · CABA", badges: { "País / Equilibrio institucional": "mid" } }
    ]
  },

  {
    id: "aysa_licitacion_privatizacion",
    date: "2025-07-22",
    title: "Privatización de AySA (agua y cloacas del AMBA)",
    meta: "Decreto 494/2025 · BORA 22-jul-2025 + Resolución MEcon 704/2026 (BORA 15-may-2026) · venta del 90% de AySA",
    desc: "Se declaró a AySA sujeta a privatización y se lanzó la licitación pública nacional e internacional para vender el 90% del capital (primero al menos el 51% a un operador estratégico, el resto en bolsa); el 10% queda para los trabajadores vía Programa de Propiedad Participada. AySA presta agua potable y cloacas a unos 14 millones de personas en CABA y 26 partidos del GBA. La presentación de ofertas se previó hasta el 27-ago-2026.",
    tags: ["Plata", "Vivienda", "Calidad de servicios", "Salud"],
    fuente: "Boletín Oficial — Decreto 494/2025 (22-jul-2025) y Resolución Ministerio de Economía 704/2026 (15-may-2026). Esquema de venta: Ámbito, iAgua, AySA (sección Privatización).",
    impact: function(p) {
      const dims = [];
      const amba = ['caba', 'gba_norte', 'gba_sur', 'gba_oeste'].includes(p.zona);
      if (amba) {
        dims.push({ name: "Plata", icon: "💰", level: "mid",
          body: "AySA da agua potable y cloacas a <strong>14 millones de personas</strong> en CABA y 26 partidos del GBA. Se privatiza el 90% (primero el 51% a un operador estratégico). La referencia histórica preocupa: con la concesión anterior (Aguas Argentinas/Suez, 1993-2006) la tarifa real se multiplicó varias veces antes de la rescisión. Tu boleta de agua probablemente sube." });
        dims.push({ name: "Calidad de servicios", icon: "🔌", level: "soft",
          body: "Una operadora privada puede mejorar el servicio si invierte, pero también tiende a priorizar las zonas más rentables. Si vivís en un barrio con red en buen estado el cambio se nota menos; si la red de tu zona es vieja, la inversión puede tardar en llegar." });
      }
      if (amba && (p.ingreso === 'hasta_700k' || p.ingreso === '700k_1.5m')) {
        dims.push({ name: "Salud", icon: "❤️", level: "mid",
          body: "En barrios populares del GBA, donde la red de agua y cloacas todavía es precaria, que el privado priorice rentabilidad puede dejar postergada la extensión de cañerías. Agua segura y cloacas son salud directa: su demora se mide en enfermedades evitables." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
        body: "El Estado deja de poner subsidios y cobra el precio de venta; el 10% de las acciones queda para los trabajadores (Programa de Propiedad Participada). El punto en discusión es quién regula, y con qué fuerza, la tarifa y la calidad de un servicio esencial y monopólico como el agua." });
      return dims;
    },
    compareProfiles: [
      { name: "Familia del GBA usuaria de AySA", sub: "Empleado priv. · GBA Sur", badges: { Plata: "mid", "Calidad de servicios": "soft" } },
      { name: "Hogar de barrio popular sin cloacas", sub: "Trabajo informal · ≤$700k · GBA", badges: { Salud: "mid", Plata: "mid" } },
      { name: "Usuario de CABA", sub: "Empleado priv. · CABA", badges: { Plata: "mid", "Calidad de servicios": "soft" } },
      { name: "Contribuyente que mira las cuentas", sub: "Autónomo · CABA", badges: { "País / Equilibrio institucional": "soft" } }
    ]
  },

  {
    id: "ley_movilidad_jubilatoria_vetada",
    date: "2024-09-02",
    title: "Veto a la nueva movilidad jubilatoria",
    meta: "Ley 27.756 (sancionada ago-2024) vetada por Decreto 782/2024 · BORA 2-sep-2024 · veto sostenido",
    desc: "El Congreso sancionó la Ley 27.756, que daba a los jubilados una recomposición del 8,1% para reparar el salto de inflación de comienzos de 2024 que la nueva fórmula no trasladó al haber, más un bono en el cálculo. El Poder Ejecutivo la vetó en forma total por el Decreto 782/2024 y el veto se sostuvo porque en el Congreso no se reunió la mayoría especial para insistir.",
    tags: ["Plata", "Jubilación", "Estabilidad"],
    fuente: "Boletín Oficial — Decreto 782/2024 (veto, 2-sep-2024) sobre Ley 27.756. Datos: SAIJ, La Nación, Infobae, Centro CEPA.",
    impact: function(p) {
      const dims = [];
      if (p.ocupacion === 'jubilado_min') {
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "La Ley 27.756 te habría dado una recomposición del <strong>8,1%</strong> para reparar el salto de inflación de comienzos de 2024 que la nueva fórmula no trasladó al haber. El veto la dejó sin efecto. Como cobrás el mínimo, lo único que compensa es el bono fijo congelado en $70.000, que no alcanza a cubrir ese 8,1% perdido." });
      } else if (p.ocupacion === 'jubilado_med') {
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "Sos el caso más golpeado por el veto: la Ley 27.756 te daba el <strong>8,1%</strong> de recomposición, pero como tu haber supera el mínimo <em>no cobrás el bono</em> que sí reciben los de la mínima. Resultado: perdés todo ese 8,1% sin ninguna compensación." });
      } else if (p.ocupacion === 'pensionado') {
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "Las pensiones también quedaron sin la recomposición del 8,1% que traía la ley vetada. Con haberes ya bajos, y a veces con demoras en altas y auditorías de padrones, cada punto que no se recompone se siente entero." });
      }
      if (p.ocupacion === 'jubilado_min' || p.ocupacion === 'jubilado_med' || p.ocupacion === 'pensionado') {
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "mid",
          body: "El veto se sostuvo porque en el Congreso no se juntó la mayoría especial para insistir. Para vos significa que la recomposición no vuelve por esta vía: el haber queda atado a la fórmula del Gobierno, sin el piso que el Congreso había intentado garantizar por ley." });
      }
      if (p.adultos === '1' || p.adultos === '2mas') {
        dims.push({ name: "Vida familiar", icon: "👨‍👩‍👧", level: "soft",
          body: "Si tenés un adulto mayor a cargo, el 8,1% que no se recompuso es plata que sale de tu bolsillo para sostenerlo. El veto traslada parte del costo del ajuste previsional a las familias que ayudan a sus jubilados." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
        body: "El objetivo fiscal es explícito: el Gobierno estimó que aplicar la ley costaba el equivalente a cerca de medio punto del PBI por año y lo usó como argumento del veto para sostener el superávit. El ahorro del Tesoro es real; lo paga el poder de compra de 7,2 millones de jubilados." });
      return dims;
    },
    compareProfiles: [
      { name: "Jubilado de la mínima", sub: "Jubilado mínima · CABA", badges: { Plata: "strong", Estabilidad: "mid" } },
      { name: "Jubilado de haber medio (sin bono)", sub: "Jubilado media-alta · CABA", badges: { Plata: "strong", Estabilidad: "mid" } },
      { name: "Pensión no contributiva", sub: "Pensionado · GBA", badges: { Plata: "strong", Estabilidad: "mid" } },
      { name: "Hijo/a que sostiene a un jubilado", sub: "Empleado priv. · adulto a cargo", badges: { "Vida familiar": "soft" } }
    ]
  },

  {
    id: "bono_jubilatorio_congelado_70000",
    date: "2024-03-25",
    title: "El bono jubilatorio, congelado en $70.000",
    meta: "Decreto 274/2024 (mar-2024) + prórrogas mensuales (Decretos 440/2024, 552/2024, 783/2024, 47/2025 y sucesivos) · bono sin actualizar",
    desc: "Junto con la nueva fórmula de movilidad mensual atada a la inflación, el Gobierno fijó un bono de refuerzo de $70.000 para quienes cobran el haber mínimo y lo fue prorrogando mes a mes sin actualizarlo nunca. Desde marzo de 2024 el bono perdió cerca del 49% de su poder de compra: representaba alrededor del 30% del ingreso de un jubilado de la mínima y hoy pesa apenas un 12-13%.",
    tags: ["Plata", "Jubilación", "Vivienda", "Salud"],
    fuente: "Boletín Oficial — Decreto 274/2024 y decretos de prórroga del refuerzo previsional (440/2024, 552/2024, 783/2024, 47/2025 y sucesivos). Datos de licuación: Chequeado, Infobae, Zona Norte Hoy.",
    impact: function(p) {
      const dims = [];
      const cobraBono = p.ocupacion === 'jubilado_min' || p.ocupacion === 'pensionado';
      if (p.ocupacion === 'jubilado_min') {
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "El bono de refuerzo de <strong>$70.000</strong> para haberes mínimos está congelado desde marzo de 2024: no se actualiza por inflación ni por la fórmula. Entonces era cerca del 30% de tu ingreso mensual; hoy pesa apenas un 12-13% y perdió alrededor del <strong>49% de su poder de compra</strong>. Es plata que valía mucho más y se fue licuando sola." });
      } else if (p.ocupacion === 'pensionado') {
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "Si cobrás una pensión equivalente al haber mínimo, el bono de $70.000 también te alcanza, y también está congelado desde marzo de 2024. Perdió cerca del 49% de su valor real: el complemento que más pesaba en tu ingreso es justo el que no se actualiza." });
      }
      const urbanoCaro = ['caba', 'gba_norte', 'gba_sur', 'gba_oeste', 'laplata', 'cba_cap', 'rosario'].includes(p.zona);
      if (cobraBono && urbanoCaro) {
        dims.push({ name: "Vivienda", icon: "🏠", level: "mid",
          body: "En CABA y el GBA, donde alquiler, expensas y servicios sin subsidio son más caros, ese bono congelado se evapora en pocas semanas. La parte fija de tu costo de vivir creció muy por encima de los $70.000 que no se mueven desde 2024." });
      }
      if (p.salud === 'pami' && cobraBono) {
        dims.push({ name: "Salud", icon: "❤️", level: "mid",
          body: "Con PAMI y vademécum recortado, los medicamentos que antes cubría el bono ahora compiten con la comida y los servicios. Para un adulto mayor con tratamiento crónico, $70.000 que valen la mitad que en 2024 significan menos adherencia al tratamiento." });
      }
      if ((p.asistencia || []).includes('sub_pami') && cobraBono) {
        dims.push({ name: "Carga mental", icon: "🧠", level: "soft",
          body: "Mantener el Subsidio Social PAMI exige renovar trámites; sumado a un bono que pierde valor cada mes, la planificación del gasto se vuelve un cálculo permanente de qué se puede pagar y qué no." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
        body: "Congelar el bono en lugar de actualizarlo es una forma silenciosa de ajuste: se licúa solo con la inflación, sin necesidad de un decreto que lo recorte. El Tesoro ahorra alrededor de medio punto del PBI; lo pagan 4,5 millones de jubilados de la mínima." });
      return dims;
    },
    compareProfiles: [
      { name: "Jubilada de la mínima en CABA", sub: "Jubilado mínima · CABA · PAMI", badges: { Plata: "strong", Vivienda: "mid", Salud: "mid" } },
      { name: "Jubilado de la mínima en el interior", sub: "Jubilado mínima · pueblo", badges: { Plata: "strong" } },
      { name: "Pensionado de la mínima en el GBA", sub: "Pensionado · GBA Sur", badges: { Plata: "strong", Vivienda: "mid" } },
      { name: "Jubilado de la mínima con tratamiento", sub: "Jubilado mínima · PAMI · Subsidio Social", badges: { Plata: "strong", Salud: "mid", "Carga mental": "soft" } }
    ]
  },

  {
    id: "dnu70_reforma_medios",
    date: "2023-12-21",
    title: "Desregulación de medios y comunicaciones (DNU 70)",
    meta: "DNU 70/2023 · BORA 21-dic-2023 · modifica la Ley 26.522 (Servicios de Comunicación Audiovisual) y la Ley 27.078 (Argentina Digital)",
    desc: "El DNU desreguló el sector audiovisual: cayó el tope a la cantidad de licencias que un mismo dueño puede tener a nivel nacional, se habilitó que servicios de TV paga e internet satelital (DirecTV, Claro, Starlink) operen sin las restricciones cruzadas anteriores, se reclasificó la TV por internet y los servicios satelitales bajo el marco más laxo de Argentina Digital, y cayó el piso obligatorio de contenido nacional, independiente y local en TV y radio.",
    tags: ["Trabajo", "País", "Calidad de servicios"],
    fuente: "Boletín Oficial — DNU 70/2023 (21-dic-2023), capítulo de desregulación que modifica Ley 26.522 y Ley 27.078. Concentración del mercado: informes sectoriales y gremiales (SiPreBA, FATPREN, SATSAID).",
    impact: function(p) {
      const dims = [];
      const interior = ['nea', 'noa', 'cuyo', 'patagonia', 'pueblo', 'cba_int', 'santafe_int', 'tucuman'].includes(p.zona);
      if (interior) {
        dims.push({ name: "Calidad de servicios", icon: "🔌", level: "mid",
          body: "Cae el tope que impedía a un mismo dueño acumular licencias en todo el país. La radio o el canal de tu zona puede ser comprado por una red nacional y pasar a emitir desde Buenos Aires: menos noticias del pueblo, menos voz local. En Argentina ya hay alta concentración: cerca de 3 grupos manejan alrededor del 80% del mercado de medios pagos." });
        dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "mid",
          body: "Sin el piso de producción local y con el tope de licencias caído, la pluralidad informativa en el interior se debilita. La contracara concreta: los servicios satelitales (Starlink, DirecTV) entran sin restricciones cruzadas y pueden llevar internet a zonas rurales que no lo tenían, aunque a un costo (equipo más abono en dólares) que no es accesible para todos." });
      }
      if ((p.ocupacion === 'monotrib' || p.ocupacion === 'autonomo' || p.ocupacion === 'trab_informal') && interior) {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
          body: "Si trabajás en medios o producción audiovisual (periodista, técnico, locutor, productora), cae el piso obligatorio de contenido nacional e independiente que rondaba el 60% en TV. El mercado de producción local puede achicarse entre un 30 y un 50% si la concentración avanza, y con él tus changas o contratos." });
      } else if (interior) {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "soft",
          body: "La caída del piso de producción nacional e independiente golpea al trabajo audiovisual y periodístico local (gremios SiPreBA, FATPREN, SATSAID). Aunque no trabajes en el sector, tu pueblo pierde empleo calificado y voces propias." });
      }
      if (!interior) {
        dims.push({ name: "Calidad de servicios", icon: "🔌", level: "soft",
          body: "En las grandes ciudades hay más oferta, así que la concentración se nota menos en lo inmediato. Pero la caída del tope de licencias y del piso de producción nacional empuja a un mercado con menos voces independientes y posibilidad de empaquetar de forma obligatoria TV paga más internet." });
      }
      return dims;
    },
    compareProfiles: [
      { name: "Periodista o técnico de medios del interior", sub: "Monotrib. · NEA", badges: { Trabajo: "mid", "Calidad de servicios": "mid", "País / Equilibrio institucional": "mid" } },
      { name: "Familia de pueblo chico", sub: "Trabajo informal · pueblo", badges: { "Calidad de servicios": "mid", "País / Equilibrio institucional": "mid" } },
      { name: "Usuario rural sin internet (Starlink)", sub: "Autónomo · Patagonia", badges: { "Calidad de servicios": "mid", "País / Equilibrio institucional": "mid" } },
      { name: "Usuario de medios en CABA", sub: "Empleado priv. · CABA", badges: { "Calidad de servicios": "soft" } }
    ]
  },

  {
    id: "dnu70_gondolas",
    date: "2023-12-21",
    title: "Derogación de la Ley de Góndolas (DNU 70)",
    meta: "DNU 70/2023 · BORA 21-dic-2023 · deroga la Ley 27.545 de Góndolas",
    desc: "El DNU derogó la Ley de Góndolas, que obligaba a los supermercados a reservar el 25% del espacio para PyMEs, prohibía que un mismo grupo económico ocupara más del 30% de la góndola, garantizaba precios visibles y comparables y prohibía cobros por exhibición. Sin esas reglas, las cadenas vuelven a negociar libremente con las marcas, sin techo de espacio ni obligación de informar su estructura de costos.",
    tags: ["Plata", "Trabajo", "Calidad de servicios"],
    fuente: "Boletín Oficial — DNU 70/2023 (21-dic-2023), deroga Ley 27.545. Alcance de la ley derogada: Comercio y Justicia, WSC Legal, PAGBAM Abogados.",
    impact: function(p) {
      const dims = [];
      if (p.ocupacion === 'pyme' || p.ocupacion === 'monotrib') {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
          body: "La Ley de Góndolas obligaba a los súper a reservar el <strong>25% del espacio para PyMEs</strong> y prohibía que un mismo grupo ocupara más del 30%. Derogada, si producís alimentos, bebidas o limpieza a escala chica (cervezas regionales, lácteos, panificados), perdés el acceso garantizado a la góndola: competís contra las marcas líderes por lugar y volvés a pagar por exhibición." });
      }
      const pocaCompetencia = ['pueblo', 'nea', 'noa', 'cuyo', 'patagonia', 'cba_int', 'santafe_int'].includes(p.zona);
      if (pocaCompetencia) {
        dims.push({ name: "Calidad de servicios", icon: "🔌", level: "soft",
          body: "En pueblos o zonas con una sola cadena, sin la regla de góndola la cadena prioriza las marcas grandes que le dejan más margen. Tenés menos variedad real: productos regionales y de cooperativas pueden desaparecer del estante." });
      }
      const granUrbano = ['caba', 'gba_norte', 'gba_sur', 'gba_oeste', 'laplata', 'cba_cap', 'rosario', 'mendoza'].includes(p.zona);
      if (granUrbano) {
        dims.push({ name: "Plata", icon: "💰", level: "pos_soft",
          body: "Si comprás en grandes ciudades con varias cadenas, en lo inmediato podés ver más promociones de marcas líderes (descuentos cruzados por exclusividad). Es un beneficio acotado: la contracara es menos competencia de marcas chicas que solían presionar los precios hacia abajo." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
        body: "El Gobierno deja de intervenir en cómo se ordena la góndola y las empresas no tienen que informar su estructura de costos. Ganan las grandes cadenas (Coto, Carrefour, Día, Cencosud) y las marcas líderes (Arcor, Molinos, Mastellone, Unilever); pierden las PyMEs alimenticias y la política de variedad local." });
      return dims;
    },
    compareProfiles: [
      { name: "PyME alimenticia regional", sub: "Empresario PyME · interior", badges: { Trabajo: "mid", "País / Equilibrio institucional": "soft" } },
      { name: "Consumidor de pueblo con una sola cadena", sub: "Trabajo informal · pueblo", badges: { "Calidad de servicios": "soft" } },
      { name: "Consumidor de gran ciudad", sub: "Empleado priv. · CABA", badges: { Plata: "pos_soft" } },
      { name: "Productor cooperativo", sub: "Monotrib. · interior", badges: { Trabajo: "mid" } }
    ]
  },

  {
    id: "eliminacion_retenciones_carne_vacuna",
    date: "2024-08-06",
    title: "Quita de retenciones a la carne vacuna",
    meta: "Decreto 697/2024 · BORA 6-ago-2024 · elimina derechos de exportación a la carne de vaca (cat. A-E) y baja al resto",
    desc: "El decreto llevó a 0% los derechos de exportación (retenciones) para el producto de la faena de vaca (categorías A, B, C, D y E), bajó el resto de la carne vacuna al 6,75% y las menudencias al 3,75%, dentro de una reducción general del 25% a las proteínas animales; también eliminó retenciones a la cadena porcina y láctea. Al hacer más atractivo exportar, presiona el precio interno hacia arriba. El costo fiscal de toda la baja agroindustrial se estimó en unos USD 130 millones.",
    tags: ["Plata", "Calidad de servicios"],
    fuente: "Boletín Oficial — Decreto 697/2024 (6-ago-2024). Detalle de alícuotas y costo fiscal: Valor Carne, El Rural, Infocampo, Tristán y Asociados.",
    impact: function(p) {
      const dims = [];
      const ingresoBajoMedio = ['hasta_700k', '700k_1.5m', '1.5m_3m'].includes(p.ingreso);
      if (ingresoBajoMedio) {
        dims.push({ name: "Plata", icon: "💰", level: "mid",
          body: "El decreto llevó a 0% las retenciones a la carne de vaca (categorías A a E) y bajó el resto de la carne vacuna al 6,75%. Cuando exportar rinde más, parte de la producción se va afuera y eso presiona el precio interno hacia arriba. Para un hogar de ingresos como el tuyo, donde la carne es central en la dieta, el costo del asado y de los cortes de consumo masivo siente esa suba (estimaciones de +5 a +12%)." });
        dims.push({ name: "Calidad de servicios", icon: "🔌", level: "soft",
          body: "No es que falte carne: es que la misma carne compite ahora con un mercado externo que paga en dólares. Tu poder de compra de proteína animal cae aunque el sueldo no cambie." });
      } else {
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "La eliminación de retenciones a la carne de vaca (a 0%) y la baja del resto al 6,75% tiende a empujar el precio interno al alza porque mejora el atractivo de exportar. Con ingresos más altos lo absorbés mejor, pero igual lo ves en la carnicería." });
      }
      if ((p.ocupacion === 'pyme' || p.extra === 'renta') && ['noa', 'nea', 'cba_int', 'santafe_int', 'pueblo', 'patagonia'].includes(p.zona)) {
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "pos_soft",
          body: "Si tu actividad está ligada a la ganadería o a los frigoríficos, la quita de retenciones mejora el margen por kilo exportado y se traslada en parte al precio que recibe el productor. Es un beneficio real para la cadena cárnica, sobre todo la exportadora." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
        body: "El Tesoro resigna recaudación (el costo fiscal de toda la baja agroindustrial se estimó en unos USD 130 millones sobre lo tributado en 2023) a cambio de competitividad exportadora y divisas. El precio de la mesa argentina queda más atado al valor internacional de la carne." });
      return dims;
    },
    compareProfiles: [
      { name: "Familia que vive del asado", sub: "Empleado priv. · ≤$1,5M", badges: { Plata: "mid", "Calidad de servicios": "soft" } },
      { name: "Hogar de ingresos altos", sub: "Empleado priv. · $6-15M", badges: { Plata: "soft" } },
      { name: "Productor ganadero / frigorífico", sub: "Empresario PyME · interior", badges: { Estabilidad: "pos_soft", "País / Equilibrio institucional": "soft" } },
      { name: "Contribuyente que mira la recaudación", sub: "Autónomo · CABA", badges: { "País / Equilibrio institucional": "soft" } }
    ]
  },

  {
    id: "rta_prorroga_intervencion_2026",
    date: "2026-02-02",
    title: "Tercera prórroga de la intervención de los medios públicos",
    meta: "Decreto 79/2026 · BORA 2-feb-2026 · prorroga hasta el 1-feb-2027 la intervención de Radio y Televisión Argentina SAU y Contenidos Artísticos e Informativos SAU (sustento: art. 48 DNU 70/2023)",
    desc: "El Ejecutivo prorrogó por tercera vez consecutiva la intervención de Radio y Televisión Argentina SAU (TV Pública, Radio Nacional, Encuentro, Pakapaka) y de Contenidos Artísticos e Informativos SAU, ahora desde el 2 de febrero de 2026 hasta el 1 de febrero de 2027, y ratificó como interventor a Carlos María Curci González. La intervención reemplaza al directorio independiente que preveía la ley: el interventor lo designa y responde al Poder Ejecutivo. En paralelo, la gestión busca unas 600 salidas por retiros en los medios públicos.",
    tags: ["Trabajo", "País", "Calidad de servicios"],
    fuente: "Boletín Oficial — Decreto 79/2026 (2-feb-2026), prórroga de la intervención dispuesta originalmente por Decisión Administrativa y sostenida en el art. 48 del DNU 70/2023. Retiros y plan de salidas: El Economista, Infobae, Ámbito, BAE Negocios.",
    impact: function(p) {
      const dims = [];
      const interior = ['nea', 'noa', 'cuyo', 'patagonia', 'pueblo', 'cba_int', 'santafe_int', 'tucuman'].includes(p.zona);
      if (p.ocupacion === 'empleado_pub') {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
          body: "Si trabajás en los medios públicos (Radio Nacional, TV Pública, Encuentro, Pakapaka), la tercera prórroga de la intervención mantiene la incertidumbre: la gestión busca cerca de <strong>600 salidas por retiros</strong> y la estructura sigue sin un directorio estable que garantice tu continuidad ni la paritaria del convenio. El interventor puede reorganizar áreas y dotación con amplias facultades." });
      } else if (['monotrib', 'autonomo', 'trab_informal'].includes(p.ocupacion)) {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "soft",
          body: "Si producís contenido audiovisual o periodístico que la TV o la radio pública compraba (productoras chicas, técnicos, documentalistas), una emisora intervenida y en achique encarga menos producción externa. El recorte de los medios públicos baja la demanda de trabajo independiente del sector." });
      }
      if (interior) {
        dims.push({ name: "Calidad de servicios", icon: "🔌", level: "mid",
          body: "En pueblos y zonas rurales, Radio Nacional y la TV Pública suelen ser de las pocas señales que llegan <strong>gratis por aire</strong>, sin abono. Una estructura intervenida y achicada año tras año debilita esa cobertura: menos repetidoras, menos noticias locales y menos alternativa pública donde el privado no llega." });
      }
      if (p.hijos === '1' || p.hijos === '2' || p.hijos === '3mas') {
        dims.push({ name: "Vida familiar", icon: "👨‍👩‍👧", level: "soft",
          body: "Pakapaka y Encuentro son señales públicas de contenido educativo y cultural infantil, gratuitas y sin publicidad. Cada prórroga sin definir su futuro institucional pone en riesgo esa producción: para una familia con chicos es contenido al que hoy se accede sin pagar." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
        body: "Es la <strong>tercera prórroga consecutiva</strong> sin definir el destino de los medios públicos. Un interventor designado por el Ejecutivo, en lugar de un directorio plural, concentra la línea editorial en el Gobierno de turno. Gana el control político directo y el ahorro de una estructura más chica; pierde la pluralidad informativa y la audiencia que solo llega a la TV pública por aire." });
      return dims;
    },
    compareProfiles: [
      { name: "Trabajador/a de los medios públicos", sub: "Empleado púb. · CABA", badges: { Trabajo: "mid", "País / Equilibrio institucional": "soft" } },
      { name: "Familia rural que ve la TV pública por aire", sub: "Trabajo informal · pueblo · con hijos", badges: { "Calidad de servicios": "mid", "Vida familiar": "soft", "País / Equilibrio institucional": "soft" } },
      { name: "Productora audiovisual independiente", sub: "Monotrib. · interior", badges: { Trabajo: "soft", "País / Equilibrio institucional": "soft" } },
      { name: "Audiencia urbana de noticias", sub: "Empleado priv. · CABA", badges: { "País / Equilibrio institucional": "soft" } }
    ]
  },

  {
    id: "baja_retenciones_diciembre_2025",
    date: "2025-12-12",
    title: "Segunda baja permanente de retenciones a los granos",
    meta: "Decreto 877/2025 · BORA 12-dic-2025 · segunda reducción permanente de derechos de exportación a granos y subproductos (no incluye carnes)",
    desc: "Sobre la baja de julio, el decreto recortó otra vez las retenciones de la cadena de granos: soja del 26% al 24% (subproductos del 24,5% al 22,5%), trigo y cebada del 9,5% al 7,5%, maíz y sorgo del 9,5% al 8,5%, y girasol del 5,5% al 4,5%. Es una reducción permanente, vigente desde su publicación, que mejora el precio que recibe el exportador. No tocó las carnes (eso fue un decreto aparte).",
    tags: ["Plata", "País", "Trabajo"],
    fuente: "Boletín Oficial — Decreto 877/2025 (12-dic-2025). Detalle de alícuotas: Ámbito, La Nación, Revista Chacra, Economis, Contadores en Red.",
    impact: function(p) {
      const dims = [];
      const interior = ['nea', 'noa', 'cuyo', 'patagonia', 'pueblo', 'cba_int', 'santafe_int'].includes(p.zona);
      const esAgro = ((p.ocupacion === 'pyme' || p.ocupacion === 'autonomo') && interior) || p.extra === 'renta';
      const ingresoBajoMedio = ['hasta_700k', '700k_1.5m', '1.5m_3m'].includes(p.ingreso);
      if (esAgro) {
        dims.push({ name: "Plata", icon: "💰", level: "pos",
          body: "Si vivís de la producción agrícola, este segundo recorte suma al de julio: la soja queda en <strong>24%</strong> (venía del 26%) y el resto de los granos baja 1 a 2 puntos más. Cada punto de retención que se saca es plata que vuelve al precio que cobrás por tu cosecha; el efecto es menor que la primera baja, pero va en la misma dirección." });
        dims.push({ name: "Trabajo", icon: "🛠️", level: "pos_soft",
          body: "Mejor margen exportador tiende a sostener la actividad de la cadena agroindustrial (acopio, transporte, servicios rurales, plantas aceiteras), de la que dependen muchos puestos en el interior productivo." });
      }
      if (ingresoBajoMedio && !esAgro) {
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "Cuando exportar rinde más, el precio interno de lo que sale de esos granos (harina, aceite, fideos, pan, alimento para animales) tiende a acompañar el valor internacional. Para un hogar de ingresos como el tuyo, donde esos productos pesan en la canasta, es una presión suave pero real hacia arriba en la góndola." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
        body: "El Tesoro resigna otra porción de recaudación de derechos de exportación a cambio de más liquidación de divisas y competitividad del agro. Ganan exportadores y productores; el costo fiscal lo absorbe el resto del presupuesto y, por la vía del precio, el consumidor de alimentos." });
      return dims;
    },
    compareProfiles: [
      { name: "Productor agrícola del interior", sub: "Empresario PyME · NEA", badges: { Plata: "pos", Trabajo: "pos_soft", "País / Equilibrio institucional": "soft" } },
      { name: "Familia que compra harina, aceite y pan", sub: "Empleado priv. · ≤$1,5M", badges: { Plata: "soft", "País / Equilibrio institucional": "soft" } },
      { name: "Rentista del campo (arrienda hectáreas)", sub: "Renta · interior", badges: { Plata: "pos", Trabajo: "pos_soft" } },
      { name: "Contribuyente que mira la recaudación", sub: "Autónomo · CABA", badges: { "País / Equilibrio institucional": "soft" } }
    ]
  },

  {
    id: "aranceles_bienes_capital",
    date: "2025-07-29",
    title: "Baja de aranceles a bienes de capital industriales",
    meta: "Decreto 513/2025 · BORA 29-jul-2025 · 27 bienes de capital pasan de 20-35% a 12,6% de arancel de importación (modifica el Decreto 557/2023)",
    desc: "El decreto bajó a 12,6% el arancel de importación de 27 bienes de capital que antes pagaban entre 20% y 35%: máquinas de corte láser, plegadoras, prensas, depuradores de gases para la industria petrolera, ascensores, ventiladores industriales, equipos para heladería y panadería, bombas centrífugas y acumuladores de ion-litio. Abarata renovar maquinaria importada; en contrapartida, los fabricantes locales de esos mismos equipos compiten ahora contra importados más baratos.",
    tags: ["Plata", "Trabajo", "Estabilidad"],
    fuente: "Boletín Oficial — Decreto 513/2025 (29-jul-2025), modifica el Decreto 557/2023. Detalle de posiciones y alcance: CDA, CICAE, Ámbito, Cámara de Importadores (CIRA).",
    impact: function(p) {
      const dims = [];
      const interiorIndustrial = ['cba_int', 'santafe_int', 'mendoza', 'rosario', 'cba_cap'].includes(p.zona);
      if (p.ocupacion === 'pyme') {
        dims.push({ name: "Plata", icon: "💰", level: "pos_soft",
          body: "Si tu PyME necesita renovar equipo importado (una plegadora, una prensa, un horno industrial, bombas, un ascensor), el arancel cae de 20-35% a <strong>12,6%</strong>: son entre 7 y 22 puntos menos sobre el valor del bien. Para una inversión de capital, ese ahorro es directo y mejora la ecuación de modernizarte." });
      }
      if ((p.ocupacion === 'empleado_priv' || p.ocupacion === 'trab_informal') && interiorIndustrial) {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "soft",
          body: "Si trabajás en una metalúrgica o fábrica local de bienes de capital (turbinas, máquinas, equipos industriales), el bien importado más barato le compite directo a lo que produce tu empresa. En un sector que ya viene perdiendo empleo, abaratar el importado presiona sobre puestos y horas en los polos industriales de Córdoba, Santa Fe y Mendoza." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
        body: "Hay una tensión real: abaratar la maquinaria importada ayuda a la PyME que la usa, pero golpea a la que la fabrica acá. Los bienes de capital son cerca del 20% de las importaciones argentinas y más de 14.000 empresas los importaron en 2024. Gana quien moderniza con equipo importado; pierde la cadena metalúrgica nacional y el Tesoro resigna recaudación arancelaria." });
      return dims;
    },
    compareProfiles: [
      { name: "PyME que renueva maquinaria importada", sub: "Empresario PyME · interior", badges: { Plata: "pos_soft", "País / Equilibrio institucional": "soft" } },
      { name: "Operario metalúrgico de fábrica local", sub: "Empleado priv. · Córdoba interior", badges: { Trabajo: "soft", "País / Equilibrio institucional": "soft" } },
      { name: "Panadería o heladería que compra equipo", sub: "Monotrib. · CABA", badges: { Plata: "pos_soft" } },
      { name: "Contribuyente que mira la recaudación", sub: "Autónomo · CABA", badges: { "País / Equilibrio institucional": "soft" } }
    ]
  },

  {
    id: "baja_retenciones_granos_julio_2025",
    date: "2025-07-31",
    title: "Primera baja permanente de retenciones a granos y carnes",
    meta: "Decreto 526/2025 · BORA 31-jul-2025 · vigencia 1-ago-2025 · baja permanente de derechos de exportación (cadena de granos -20%, cadena cárnica -26%)",
    desc: "El decreto bajó de forma permanente las retenciones: soja del 33% al 26%, maíz y sorgo del 12% al 9,5%, girasol al 5,5% el grano (4% los derivados), y carnes bovina y aviar del 6,75% al 5%, además de recortes en trigo y cebada. Mejora el precio que recibe el exportador y al productor; en el mercado interno, cuando exportar rinde más, el precio de los alimentos derivados tiende a acompañar el valor internacional.",
    tags: ["Plata", "País"],
    fuente: "Boletín Oficial — Decreto 526/2025 (31-jul-2025), vigencia 1-ago-2025. Alícuotas y costo fiscal: Infobae, Ámbito, Agrositio, El Cronista.",
    impact: function(p) {
      const dims = [];
      const interior = ['nea', 'noa', 'cuyo', 'patagonia', 'pueblo', 'cba_int', 'santafe_int'].includes(p.zona);
      const esAgro = ((p.ocupacion === 'pyme' || p.ocupacion === 'autonomo') && interior) || p.extra === 'renta';
      const ingresoBajoMedio = ['hasta_700k', '700k_1.5m', '1.5m_3m'].includes(p.ingreso);
      if (esAgro) {
        dims.push({ name: "Plata", icon: "💰", level: "pos_strong",
          body: "Es la baja más fuerte para vos: la soja pasó del <strong>33% al 26%</strong> (7 puntos), el maíz y el sorgo del 12% al 9,5%, y de forma permanente. Sobre el grueso de tu facturación, esos puntos que dejás de pagar de retención van directo al precio neto que cobrás por la cosecha. Para un productor es una mejora de margen contante y verificable." });
        dims.push({ name: "Trabajo", icon: "🛠️", level: "pos",
          body: "Mejor rentabilidad del campo sostiene y reactiva trabajo en toda la cadena: contratistas de cosecha, transporte de granos, acopios, plantas aceiteras y servicios rurales. En el interior productivo, el margen del productor se traduce en horas y puestos." });
      }
      if (ingresoBajoMedio && !esAgro) {
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "La baja también alcanzó la carne (del 6,75% al 5%) y los granos que terminan en harina, aceite y alimento balanceado. Cuando exportar paga más, el precio interno de esos productos tiende a acompañar el valor en dólares. Para un hogar de ingresos como el tuyo es una presión suave hacia arriba en la canasta básica." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
        body: "El Tesoro resigna recaudación (las estimaciones del paquete rondaban entre USD 800 y 1.500 millones anuales) a cambio de más liquidación de divisas y competitividad exportadora. Ganan exportadores y productores agropecuarios; el costo lo reparten el resto del presupuesto y el precio interno de los alimentos." });
      return dims;
    },
    compareProfiles: [
      { name: "Productor sojero del interior", sub: "Empresario PyME · interior", badges: { Plata: "pos_strong", Trabajo: "pos", "País / Equilibrio institucional": "soft" } },
      { name: "Contratista y transporte de granos", sub: "Autónomo · interior", badges: { Plata: "pos_strong", Trabajo: "pos" } },
      { name: "Familia que compra carne y harina", sub: "Empleado priv. · ≤$1,5M", badges: { Plata: "soft", "País / Equilibrio institucional": "soft" } },
      { name: "Contribuyente que mira la recaudación", sub: "Autónomo · CABA", badges: { "País / Equilibrio institucional": "soft" } }
    ]
  },

  {
    id: "reforma_mem_normalizacion",
    date: "2025-10-21",
    title: "Normalización del Mercado Eléctrico Mayorista",
    meta: "Resolución SE 400/2025 · BORA 21-oct-2025 · vigencia 1-nov-2025 · reglamenta el Decreto 450/2025 (4-jul-2025): transición de 24 meses de un MEM administrado a un MEM competitivo",
    desc: "Las nuevas reglas arrancan una transición de 24 meses desde el MEM administrado por CAMMESA hacia un mercado más competitivo, con señales de precio marginal. CAMMESA deja de concentrar la compra de combustible (vuelve a las generadoras térmicas) y se habilita la transferencia gradual de contratos de compra de energía a la demanda. Mantiene su rol de despacho y de proveedor de última instancia, pero pierde peso como intermediario único.",
    tags: ["Plata", "Calidad de servicios", "País"],
    fuente: "Boletín Oficial — Resolución SE 400/2025 (21-oct-2025), que reglamenta los arts. 3 y 4 del Decreto 450/2025 (4-jul-2025). En la base de Supabase figuraba la Res 24/2025 SE (lineamientos preliminares de enero 2025), pero la norma efectiva es el Decreto 450/2025 + la Resolución SE 400/2025. Análisis: Abogados.com.ar, TRSyM, FETERA/CTA.",
    impact: function(p) {
      const dims = [];
      const interior = ['nea', 'noa', 'cuyo', 'patagonia', 'pueblo', 'cba_int', 'santafe_int'].includes(p.zona);
      const ingresoBajoMedio = ['hasta_700k', '700k_1.5m', '1.5m_3m'].includes(p.ingreso);
      if (ingresoBajoMedio) {
        dims.push({ name: "Plata", icon: "💰", level: "mid",
          body: "CAMMESA funcionaba como amortiguador: compraba la energía en bloque y morigeraba los picos de precio del mercado mayorista antes de que llegaran a la tarifa. Con la transición a un mercado competitivo de precio marginal, esa mediación se diluye y los picos mayoristas se trasladan más directo a lo que pagás de luz. Para un hogar de ingresos ajustados, cada salto de tarifa pesa entero." });
      } else {
        dims.push({ name: "Plata", icon: "💰", level: "soft",
          body: "Con la salida gradual del esquema administrado por CAMMESA, el precio mayorista de la energía llega más directo a la tarifa. Lo absorbés mejor que un hogar de bajos ingresos, pero la cuenta de luz queda más expuesta a la volatilidad del mercado." });
      }
      if (interior) {
        dims.push({ name: "Calidad de servicios", icon: "🔌", level: "soft",
          body: "Las distribuidoras provinciales chicas negocian peor que las grandes en un mercado liberalizado: menos volumen, menos poder de compra. Si tu cooperativa o distribuidora local consigue peores condiciones que una gran eléctrica, eso termina apareciendo en tu factura o en la calidad del suministro." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
        body: "El Estado se corre de administrar el mercado eléctrico y deja que generadoras y distribuidoras negocien entre sí. Ganan las grandes generadoras (mejor remuneración y libertad de contratos) y los inversores en capacidad nueva; el riesgo lo corren los usuarios cuando se debilitan los subsidios cruzados que la intermediación de CAMMESA permitía sostener." });
      return dims;
    },
    compareProfiles: [
      { name: "Hogar de ingresos ajustados", sub: "Empleado priv. · ≤$1,5M", badges: { Plata: "mid", "País / Equilibrio institucional": "soft" } },
      { name: "Usuario de cooperativa eléctrica del interior", sub: "Trabajo informal · pueblo", badges: { Plata: "mid", "Calidad de servicios": "soft", "País / Equilibrio institucional": "soft" } },
      { name: "Hogar de ingresos altos", sub: "Empleado priv. · $6-15M", badges: { Plata: "soft" } },
      { name: "Ciudadano que mira el modelo energético", sub: "Autónomo · CABA", badges: { "País / Equilibrio institucional": "soft" } }
    ]
  },

  {
    id: "courier_franquicia_3000",
    date: "2024-12-02",
    title: "Régimen courier: franquicia de USD 400 y tope de USD 3.000",
    meta: "Decreto 1065/2024 + RG ARCA 5608/2024 · BORA 2-dic-2024 · franquicia de USD 400 por envío (hasta 5 al año, sin aranceles) y tope del régimen elevado a USD 3.000",
    desc: "El régimen de envíos por courier quedó así: cada compra de hasta USD 400 entra sin derecho de importación ni tasa estadística (solo paga IVA), hasta 5 envíos al año por persona; y el tope total del régimen, hasta donde se puede usar el trámite simplificado puerta a puerta, subió de USD 1.000 a USD 3.000 por envío. Abarata y simplifica comprar tecnología, indumentaria y libros en el exterior.",
    tags: ["Plata", "Trabajo", "Calidad de servicios"],
    fuente: "Boletín Oficial — Decreto 1065/2024 y RG ARCA 5608/2024 (2-dic-2024). Aclaración: los USD 3.000 son el tope del régimen, no la franquicia; la franquicia sin aranceles es de USD 400. Fuentes: Infobae, SICEX, Mallea Abogados, Blog del Contador.",
    impact: function(p) {
      const dims = [];
      const granUrbano = ['caba', 'gba_norte', 'gba_sur', 'gba_oeste', 'laplata', 'cba_cap', 'rosario', 'mendoza', 'tucuman'].includes(p.zona);
      if (granUrbano) {
        dims.push({ name: "Plata", icon: "💰", level: "pos",
          body: "Si comprás tecnología, indumentaria o libros en el exterior, la franquicia de <strong>USD 400 sin aranceles</strong> (solo IVA) y el trámite puerta a puerta simplificado pueden significar un ahorro del 35-50% frente al precio del retail local, donde el mismo producto carga impuestos y márgenes. Para un consumidor urbano que compra online, es plata directa en el bolsillo." });
      } else {
        dims.push({ name: "Plata", icon: "💰", level: "pos_soft",
          body: "La franquicia de USD 400 sin aranceles abarata comprar afuera lo que localmente sale más caro o no se consigue. Lejos de los grandes centros el courier llega con más demora y costo de logística, pero el ahorro frente al retail sigue estando." });
      }
      if (['monotrib', 'pyme', 'autonomo'].includes(p.ocupacion)) {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "soft",
          body: "Depende de tu rubro: si vendés servicios, esto no te toca o hasta te conviene como comprador. Pero si tenés un comercio minorista de indumentaria, tecnología o juguetes, ahora competís contra envíos de USD 400 que entran sin aranceles. La industria textil nacional, que perdió decenas de miles de empleos, y el comercio de cercanía son los más expuestos." });
      }
      dims.push({ name: "Calidad de servicios", icon: "🔌", level: "pos_soft",
        body: "Como contracara del comercio local, ganás acceso: productos que acá no se venden o llegan tarde, ahora se compran directo. Más opciones reales para el consumidor, sobre todo en tecnología y libros importados." });
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
        body: "El Estado resigna recaudación arancelaria y expone al comercio y la industria local a la competencia importada, a cambio de precios más bajos para el consumidor. Ganan los consumidores urbanos y las plataformas (Amazon, AliExpress) y couriers; pierden el comercio minorista, la industria textil y la aduana comercial." });
      return dims;
    },
    compareProfiles: [
      { name: "Consumidor urbano que compra online afuera", sub: "Empleado priv. · CABA", badges: { Plata: "pos", "Calidad de servicios": "pos_soft" } },
      { name: "Comerciante minorista de indumentaria", sub: "Monotrib. · CABA", badges: { Plata: "pos", Trabajo: "soft", "Calidad de servicios": "pos_soft" } },
      { name: "Comprador del interior", sub: "Empleado priv. · pueblo", badges: { Plata: "pos_soft", "Calidad de servicios": "pos_soft" } },
      { name: "Trabajador/a textil nacional", sub: "Empleado priv. · GBA", badges: { Trabajo: "soft", "País / Equilibrio institucional": "soft" } }
    ]
  },

  {
    id: "fna_reestructuracion",
    date: "2024-11-22",
    title: "Reestructuración del Fondo Nacional de las Artes",
    meta: "Decreto 1029/2024 · BORA 22-nov-2024 · vigencia plena 1-abr-2025 · reorienta el FNA de becas y subsidios a créditos en UVA, vuelve ad honorem al directorio y reduce el personal un 25%",
    desc: "El decreto reformuló el Fondo Nacional de las Artes, el organismo de fomento a artistas. El uso central de los fondos pasa a ser el otorgamiento de créditos en UVA; las becas y subsidios quedan limitados a financiarse con donaciones privadas y las ganancias financieras de esos créditos. El directorio de 14 personas pasa a ser ad honorem (sin sueldo) y la planta de personal se reduce un 25%. El argumento oficial: el FNA gastaba el 72% de su presupuesto 2023 en gastos operativos.",
    tags: ["Trabajo", "Plata", "Calidad de servicios"],
    fuente: "Boletín Oficial — Decreto 1029/2024 (22-nov-2024), vigencia plena 1-abr-2025. Contenido y declaraciones de Sturzenegger: La Nación, Ámbito, Perfil, SAIJ.",
    impact: function(p) {
      const dims = [];
      const interior = ['nea', 'noa', 'cuyo', 'patagonia', 'pueblo', 'cba_int', 'santafe_int', 'tucuman'].includes(p.zona);
      const esArtista = ['monotrib', 'autonomo', 'trab_informal'].includes(p.ocupacion);
      if (esArtista) {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
          body: "Si sos artista (música, literatura, plástica, danza, audiovisual), el FNA dejó de fomentar con becas y subsidios a fondo perdido y pasó a un modelo de <strong>créditos en UVA</strong> que hay que devolver. Las becas que sobrevivan dependen ahora de donaciones privadas y de las ganancias de esos créditos, no de recursos propios garantizados. Para quien dependía del fomento directo, es menos plata accesible y con obligación de repago." });
      }
      if (interior) {
        dims.push({ name: "Calidad de servicios", icon: "🔌", level: "soft",
          body: "El FNA llegaba con becas y premios a zonas donde el mecenazgo privado casi no existe (NOA, NEA, pueblos del interior). Si el fomento depende ahora de donaciones privadas, esas se concentran donde hay plata: el interior cultural, que más necesitaba el apoyo público, es el que más lo pierde." });
      }
      if (p.ocupacion === 'estudiante') {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "soft",
          body: "Si estudiás una carrera artística y contabas con una beca del FNA para sostenerte, el viraje a créditos en UVA cambia el tablero: en vez de un apoyo que no se devuelve, una deuda indexada. Para quien recién empieza y no tiene ingresos propios, ese cambio puede ser la diferencia entre seguir o dejar." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
        body: "El Tesoro ahorra: directorio ad honorem, 25% menos de personal y fin del fomento a fondo perdido financiado con recursos propios. El argumento (72% del presupuesto en gastos operativos) es atendible; la contracara es que el Estado se retira del fomento cultural directo y lo deja atado a donaciones privadas, que no llegan parejo a todo el país." });
      return dims;
    },
    compareProfiles: [
      { name: "Músico o escritor/a que vivía de becas", sub: "Monotrib. · CABA", badges: { Trabajo: "mid", "País / Equilibrio institucional": "soft" } },
      { name: "Artista del interior", sub: "Autónomo · NOA", badges: { Trabajo: "mid", "Calidad de servicios": "soft", "País / Equilibrio institucional": "soft" } },
      { name: "Estudiante de carrera artística", sub: "Estudiante · interior", badges: { Trabajo: "soft", "Calidad de servicios": "soft" } },
      { name: "Contribuyente que mira el gasto", sub: "Autónomo · CABA", badges: { "País / Equilibrio institucional": "soft" } }
    ]
  },

  {
    id: "casa_moneda_sociedad_anonima",
    date: "2024-10-31",
    title: "Casa de Moneda: intervención y paso a Sociedad Anónima",
    meta: "Decreto 964/2024 · BORA 31-oct-2024 · interviene la Casa de Moneda 180 días (interventor Pedro Cavagnaro) y delinea su transformación en SAU (Asamblea 20-dic-2024; ratificada por Dec 295/2025 y prorrogada por Dec 615/2025)",
    desc: "El decreto intervino la Sociedad del Estado Casa de Moneda por 180 días desde el 1-nov-2024, con Pedro Cavagnaro como interventor y facultades para transferir personal, activos, marcas y licencias y revisar el convenio colectivo. En diciembre, una Asamblea Extraordinaria la transformó en Casa de Moneda SAU bajo la Ley General de Sociedades; los Decretos 295/2025 y 615/2025 ratificaron la transformación y prorrogaron la intervención. El cambio habilita asociar o vender la empresa con privados sin pasar por el Congreso.",
    tags: ["Trabajo", "Estabilidad", "País"],
    fuente: "Boletín Oficial — Decreto 964/2024 (31-oct-2024), Decreto 295/2025 (30-abr-2025) y Decreto 615/2025 (28-ago-2025). Transformación en SAU y prórrogas de la intervención: Infobae, MDZ, ADNSUR, InfoLeg.",
    impact: function(p) {
      const dims = [];
      if (p.ocupacion === 'empleado_pub') {
        dims.push({ name: "Trabajo", icon: "🛠️", level: "mid",
          body: "Si trabajás en la Casa de Moneda, el interventor quedó facultado para <strong>transferir personal, activos y licencias</strong> y para revisar el convenio colectivo. En una empresa con cerca de 700 a 1.000 trabajadores y con el BCRA usando cada vez menos billete físico, eso se traduce en riesgo concreto de retiros, despidos y cambios en las condiciones de tu CCT." });
      }
      dims.push({ name: "Estabilidad", icon: "🛡️", level: "soft",
        body: "El paso de Sociedad del Estado a Sociedad Anónima Unipersonal cambia el marco legal: la empresa pasa a regirse por la Ley General de Sociedades, lo que habilita asociarla o venderla a privados sin pasar por el Congreso. Para sus trabajadores y para el servicio, es un futuro institucional más incierto." });
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
        body: "La Casa de Moneda imprime billetes, pasaportes y documentos de seguridad: capacidades de soberanía estatal. Transformarla en SAU y dejar abierta su venta o asociación con privados ahorra al Tesoro un déficit operativo, pero pone en discusión quién controla la impresión de moneda y documentos nacionales. Gana la narrativa del Estado más chico; pierden los trabajadores y la soberanía sobre esas capacidades." });
      return dims;
    },
    compareProfiles: [
      { name: "Trabajador/a de la Casa de Moneda", sub: "Empleado púb. · CABA", badges: { Trabajo: "mid", Estabilidad: "soft", "País / Equilibrio institucional": "soft" } },
      { name: "Gremio de artes gráficas", sub: "Empleado priv. · GBA", badges: { Estabilidad: "soft", "País / Equilibrio institucional": "soft" } },
      { name: "Proveedor nacional de insumos de seguridad", sub: "Empresario PyME · GBA", badges: { Estabilidad: "soft" } },
      { name: "Ciudadano que mira la soberanía estatal", sub: "Autónomo · CABA", badges: { "País / Equilibrio institucional": "soft" } }
    ]
  },

  {
    id: "veto_financiamiento_universitario_2024",
    date: "2024-10-03",
    title: "Veto a la Ley de Financiamiento Universitario (2024)",
    meta: "Decreto 879/2024 · BORA 3-oct-2024 · veto total a la Ley 27.757; el 9-oct-2024 Diputados no reunió los 2/3 y el veto quedó firme (la ley cayó)",
    desc: "El Congreso había sancionado la Ley 27.757, que actualizaba por inflación los gastos de funcionamiento de las universidades nacionales y recomponía los salarios docentes y no docentes. El Ejecutivo la vetó en forma total por el Decreto 879/2024, argumentando que no preveía la fuente de financiamiento. El 9 de octubre de 2024 Diputados intentó insistir pero no reunió los dos tercios: el veto quedó firme y la ley no entró en vigencia. (Distinto del veto de 2025 a la Ley 27.795, que el Congreso sí rechazó.)",
    tags: ["Plata", "Trabajo", "Estabilidad"],
    fuente: "Boletín Oficial — Decreto 879/2024 (3-oct-2024), veto total a la Ley 27.757. Insistencia fallida en Diputados (9-oct-2024): Infobae, El Cronista, SAIJ, Wikipedia (Ley de Financiamiento Universitario).",
    impact: function(p) {
      const dims = [];
      const interior = ['nea', 'noa', 'cuyo', 'patagonia', 'pueblo', 'cba_int', 'santafe_int', 'tucuman'].includes(p.zona);
      if (p.ocupacion === 'empleado_pub') {
        dims.push({ name: "Plata", icon: "💰", level: "mid",
          body: "Si sos docente o no docente de una universidad nacional, la Ley 27.757 te daba una recomposición salarial que el veto dejó sin efecto. Durante 2024 el salario universitario perdió en términos reales en torno al <strong>35%</strong> frente a la inflación. El veto sostenido significó que esa recomposición no llegó por esta vía hasta bien entrado 2025." });
      }
      if (p.ocupacion === 'estudiante') {
        dims.push({ name: "Educación", icon: "📚", level: "mid",
          body: "El veto frenó la actualización por inflación de los gastos de funcionamiento de las universidades: luz, limpieza, mantenimiento, becas, insumos de laboratorio. Para un estudiante eso se traduce en cursadas más precarias, edificios sin mantenimiento y menos becas en el sistema que sostiene a 2 millones de estudiantes." });
        dims.push({ name: "Movilidad social", icon: "🛤️", level: "soft",
          body: "La universidad pública gratuita es la principal vía de ascenso para familias de ingresos medios y bajos. Cuando se le frena el presupuesto, la calidad cae y el acceso real se complica: el ascensor social funciona peor." });
      }
      if (interior && p.ocupacion !== 'empleado_pub' && p.ocupacion !== 'estudiante') {
        dims.push({ name: "Educación", icon: "📚", level: "soft",
          body: "Las universidades del interior dependen casi por entero del presupuesto nacional, sin la base privada de las grandes ciudades. Frenar la actualización golpea más fuerte a la universidad de tu provincia, que muchas veces es la única opción de educación superior cerca." });
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
        body: "El veto se sostuvo porque en Diputados no se reunieron los dos tercios para insistir. El ahorro fiscal fue el argumento central (del orden del 0,14% del PBI); el costo lo pagaron el salario de 200.000 docentes y no docentes y la calidad del sistema que estudian 2 millones de personas, hasta que en 2025 una nueva ley reabrió la discusión." });
      return dims;
    },
    compareProfiles: [
      { name: "Docente universitario/a", sub: "Empleado púb. · CABA", badges: { Plata: "mid", "País / Equilibrio institucional": "soft" } },
      { name: "Estudiante de universidad pública", sub: "Estudiante · GBA", badges: { Educación: "mid", "Movilidad social": "soft", "País / Equilibrio institucional": "soft" } },
      { name: "Familia del interior con un hijo en la universidad", sub: "Empleado priv. · NOA", badges: { Educación: "soft", "País / Equilibrio institucional": "soft" } },
      { name: "Contribuyente que mira el déficit", sub: "Autónomo · CABA", badges: { "País / Equilibrio institucional": "soft" } }
    ]
  },

  {
    id: "aumentos_decreto_empleados_publicos",
    date: "2024-09-19",
    title: "Paritaria estatal cerrada por decreto",
    meta: "Decreto 837/2024 · BORA 19-sep-2024 · homologa el acta paritaria del 30-ago-2024 firmada solo con UPCN (2% en septiembre + 1% en octubre); ATE la rechazó",
    desc: "El Gobierno homologó por decreto la paritaria de la administración pública nacional con un aumento del 2% en septiembre y 1% en octubre, además de componentes como viáticos y adicionales. El acuerdo lo firmó solo UPCN; ATE lo rechazó por considerarlo muy por debajo de la inflación. Cubre a todo el personal permanente y no permanente.",
    tags: ["Plata", "Trabajo", "Estabilidad"],
    fuente: "Boletín Oficial — Decreto 837/2024 (19-sep-2024), homologa el Acta Acuerdo del 30-ago-2024 de la Comisión Negociadora del Convenio Colectivo General. Posiciones sindicales y pérdida salarial: La Nación, El Cronista, Página 12, Mundo Gremial.",
    impact: function(p) {
      const dims = [];
      if (p.ocupacion === 'empleado_pub') {
        dims.push({ name: "Plata", icon: "💰", level: "strong",
          body: "Tu paritaria se cerró con <strong>2% en septiembre y 1% en octubre</strong>, muy por debajo de una inflación que en 2024 superó el 100%. El resultado es una pérdida de poder adquisitivo cercana al <strong>30%</strong> en el año: con el mismo cargo, tu sueldo compra bastante menos que antes." });
        dims.push({ name: "Estabilidad", icon: "🛡️", level: "mid",
          body: "El acuerdo se homologó por decreto firmando solo con UPCN; ATE lo rechazó. Cerrar la paritaria por decreto con el gremio que acepta fija un techo a la negociación: la paritaria libre, donde se discute de verdad cuánto recompone el salario, queda vaciada como herramienta. Para vos significa menos margen para pelear una mejora." });
        if (['hasta_700k', '700k_1.5m'].includes(p.ingreso)) {
          dims.push({ name: "Carga mental", icon: "🧠", level: "soft",
            body: "Si además sos contratado o estás en los escalafones más bajos, sos el eslabón más expuesto: sin la estructura de los cargos de planta, un aumento por decreto del 1% mensual te deja corriendo de atrás a la inflación todos los meses, con la incertidumbre de la renovación del contrato encima." });
        }
      }
      dims.push({ name: "País / Equilibrio institucional", icon: "🏛️", level: "soft",
        body: "Cerrar la paritaria estatal por decreto, con el gremio que acompaña y sobre el rechazo del otro, le permite al Tesoro un acuerdo barato y sin conflicto formal. El ahorro es real; lo paga el salario de unos 400.000 estatales nacionales y el instituto de la paritaria libre como mecanismo de negociación." });
      return dims;
    },
    compareProfiles: [
      { name: "Estatal nacional de planta", sub: "Empleado púb. · ≤$1,5M · interior", badges: { Plata: "strong", Estabilidad: "mid", "Carga mental": "soft" } },
      { name: "Estatal de ingreso medio", sub: "Empleado púb. · $1,5-3M", badges: { Plata: "strong", Estabilidad: "mid" } },
      { name: "Contratado precario del Estado", sub: "Empleado púb. · ≤$700k", badges: { Plata: "strong", Estabilidad: "mid", "Carga mental": "soft" } },
      { name: "Contribuyente que mira el gasto", sub: "Autónomo · CABA", badges: { "País / Equilibrio institucional": "soft" } }
    ]
  }
];

// Mapa id → medida base, para que data.js mergee los datos de Supabase encima.
export const MEASURES_BASE_BY_ID = Object.fromEntries(MEASURES_BASE.map(m => [m.id, m]));
