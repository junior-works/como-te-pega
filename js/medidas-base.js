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
  }
];

// Mapa id → medida base, para que data.js mergee los datos de Supabase encima.
export const MEASURES_BASE_BY_ID = Object.fromEntries(MEASURES_BASE.map(m => [m.id, m]));
