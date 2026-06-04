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
  }
];

// Mapa id → medida base, para que data.js mergee los datos de Supabase encima.
export const MEASURES_BASE_BY_ID = Object.fromEntries(MEASURES_BASE.map(m => [m.id, m]));
