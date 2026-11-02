/**
 * Planes de estudio VARIANTES y sus materias.
 *
 * Cada variante mantiene exactamente la misma cantidad de materias por
 * semestre y las mismas horas semanales (30 h por semestre) que el plan
 * base de su carrera, pero con materias propias:
 *
 *   Autotrónica (base 6-7-6-6-7-7)
 *     - Autotrónica Electrónica  : más electrónica, programación y redes.
 *     - Autotrónica Híbridos    : más vehículos eléctricos e híbridos.
 *
 *   Mecánica Automotriz (base 7-6-6-6-7-8)
 *     - Mecánica Diesel          : más motores diésel e inyección.
 *     - Mecánica Servicio        : más taller, mantenimiento y soldadura.
 *
 * Las materias nuevas llevan sufijo de variante en el código (por ejemplo
 * `EMC-100-A`) para no chocar con el catálogo del respaldo.
 */

export interface MateriaVariante {
  codigo: string;
  nombre: string;
}

export interface MateriaPlanVariante {
  /** Nombre del plan de estudio al que pertenece. */
  plan: string;
  codigo: string;
  semestre: number;
  horasSemanales: number;
  /** Código de la materia prerrequisito (si existe). */
  prerrequisito?: string;
}

export interface PlanVariante {
  /** Nombre de la variante (coincide con `plan` en las materias). */
  nombre: string;
  /** Carrera a la que pertenece. */
  carrera: string;
  /** Número de resolución de referencia del plan. */
  numeroRm: string;
  fechaRm: string;
  notas: string;
  /** Estado del plan: 'vigente' u 'historico'. */
  estado: 'vigente' | 'historico';
}

// ---------------------------------------------------------------------------
// Planes
// ---------------------------------------------------------------------------

export const PLANES_VARIANTES: PlanVariante[] = [
  {
    nombre: 'Autotrónica Electrónica',
    carrera: 'Autotrónica',
    numeroRm: '1049/2023-A',
    fechaRm: '2023-01-01',
    notas: 'Plan AUT-A - Autotrónica Electrónica (variante)',
    estado: 'vigente',
  },
  {
    nombre: 'Autotrónica Híbridos',
    carrera: 'Autotrónica',
    numeroRm: '1049/2023-B',
    fechaRm: '2023-01-01',
    notas: 'Plan AUT-B - Autotrónica Híbridos (variante)',
    estado: 'vigente',
  },
  {
    nombre: 'Mecánica Automotriz Diesel',
    carrera: 'Mecánica Automotriz',
    numeroRm: '0210/2023-A',
    fechaRm: '2023-01-01',
    notas: 'Plan MEC-A - Mecánica Automotriz Diesel (variante)',
    estado: 'vigente',
  },
  {
    nombre: 'Mecánica Automotriz Servicio',
    carrera: 'Mecánica Automotriz',
    numeroRm: '0210/2023-B',
    fechaRm: '2023-01-01',
    notas: 'Plan MEC-B - Mecánica Automotriz Servicio (variante)',
    estado: 'vigente',
  },
];

// ---------------------------------------------------------------------------
// Materias nuevas de las variantes
// ---------------------------------------------------------------------------

export const MATERIAS_VARIANTES: MateriaVariante[] = [
  // --- Autotrónica Electrónica ---
  { codigo: 'EMC-100-A', nombre: 'Electricidad del Motor y Carrocería I - Enfoque Electrónico' },
  { codigo: 'MAA-100-A', nombre: 'Matemática Aplicada con Cálculo Vectorial' },
  { codigo: 'MEA-100-A', nombre: 'Metrología Electrónica Automotriz' },
  { codigo: 'MGD-100-A', nombre: 'Motores a Gasolina y Diésel I - Control Electrónico' },
  { codigo: 'SOM-100-A', nombre: 'Seguridad Ocupacional y Medio Ambiente - Riesgo Eléctrico' },
  { codigo: 'TRA-100-A', nombre: 'Transmisiones y Tren de Potencia' },
  { codigo: 'CIF-200-A', nombre: 'Circuitos de Fluidos y Refrigeración' },
  { codigo: 'DIT-200-A', nombre: 'Dibujo Técnico Asistido por Computadora' },
  { codigo: 'EMC-200-A', nombre: 'Electricidad del Motor y Carrocería II - Electrónica' },
  { codigo: 'FIS-200-A', nombre: 'Física Aplicada a Circuitos' },
  { codigo: 'INT-200-A', nombre: 'Inglés Técnico - Lectura de Manuales' },
  { codigo: 'MGD-200-A', nombre: 'Motores a Gasolina y Diésel II - Inyección Electrónica' },
  { codigo: 'SIA-200-A', nombre: 'Sistema de Iluminación Automotriz LED' },
  { codigo: 'AUT-300-A', nombre: 'Autotrónica I - Electrónica Automotriz' },
  { codigo: 'CAC-300-A', nombre: 'Circuitos de Arranque y Carga - Batteries' },
  { codigo: 'IGA-300-A', nombre: 'Inyección a Gasolina Electrónica' },
  { codigo: 'PRO-300-A', nombre: 'Programación de Unidades Electrónicas' },
  { codigo: 'SIM-300-A', nombre: 'Sistema del Motor - Diagnóstico por Red' },
  { codigo: 'VHE-300-A', nombre: 'Vehículos Híbridos y Eléctricos - Primeros Sistemas' },
  { codigo: 'AUT-400-A', nombre: 'Autotrónica II - Electrónica Aplicada' },
  { codigo: 'EAA-400-A', nombre: 'Electrónica Analógica del Automóvil' },
  { codigo: 'EDA-400-A', nombre: 'Electrónica Digital del Automóvil' },
  { codigo: 'MAN-400-A', nombre: 'Mantenimiento del Automóvil - Componentes Electrónicos' },
  { codigo: 'MIC-400-A', nombre: 'Microcontroladores Aplicados al Automóvil' },
  { codigo: 'RMD-400-A', nombre: 'Reparación de Motores a Diésel Electrónicos' },
  { codigo: 'ATM-500-A', nombre: 'Automatización de Procesos Automotrices' },
  { codigo: 'EMP-500-A', nombre: 'Emprendimiento Productivo - Taller Tecnológico' },
  { codigo: 'IEG-500-A', nombre: 'Inyección Electrónica a Gasolina' },
  { codigo: 'LAU-500-A', nombre: 'Laboratorio Autotrónica Electrónica I' },
  { codigo: 'RMP-500-A', nombre: 'Redes Multiplexadas y Protocolos Automotrices' },
  { codigo: 'RSA-500-A', nombre: 'Reparación de Caja Automática Electrónica' },
  { codigo: 'TMG-500-A', nombre: 'Taller de Modalidad de Graduación I - Electrónica' },
  { codigo: 'ENE-600-A', nombre: 'Electroneumática Aplicada' },
  { codigo: 'IED-600-A', nombre: 'Inyección Electrónica a Diésel' },
  { codigo: 'LAU-600-A', nombre: 'Laboratorio Autotrónica Electrónica II' },
  { codigo: 'PMI-600-A', nombre: 'Potenciamiento del Motor a Inyección Electrónica' },
  { codigo: 'SCO-600-A', nombre: 'Seguridad y Confort Electrónico' },
  { codigo: 'SHI-600-A', nombre: 'Sistemas Híbridos de Alto Voltaje' },
  { codigo: 'TMG-600-A', nombre: 'Taller de Modalidad de Graduación II - Electrónica' },

  // --- Autotrónica Híbridos ---
  { codigo: 'EMC-100-B', nombre: 'Electricidad del Motor y Carrocería I - Sistemas de Alto Voltaje' },
  { codigo: 'MAA-100-B', nombre: 'Matemática Aplicada - Energías y Potencia' },
  { codigo: 'MEA-100-B', nombre: 'Metrología de Baterías y Alto Voltaje' },
  { codigo: 'MGD-100-B', nombre: 'Motores a Gasolina y Diésel I - Intro a Híbridos' },
  { codigo: 'SOM-100-B', nombre: 'Seguridad Ocupacional y Medio Ambiente - Baterías' },
  { codigo: 'TRA-100-B', nombre: 'Transmisiones en Vehículos Híbridos' },
  { codigo: 'CIF-200-B', nombre: 'Circuitos de Fluidos y Refrigeración de Baterías' },
  { codigo: 'DIT-200-B', nombre: 'Dibujo Técnico de Conjuntos Híbridos' },
  { codigo: 'EMC-200-B', nombre: 'Electricidad del Motor y Carrocería II - Híbridos' },
  { codigo: 'FIS-200-B', nombre: 'Física Aplicada a Sistemas Híbridos' },
  { codigo: 'INT-200-B', nombre: 'Inglés Técnico - Documentación de Baterías' },
  { codigo: 'MGD-200-B', nombre: 'Motores a Gasolina y Diésel II - Acoplamiento Híbrido' },
  { codigo: 'SIA-200-B', nombre: 'Sistema de Iluminación y Señalización Inteligente' },
  { codigo: 'AUT-300-B', nombre: 'Autotrónica I - Híbridos' },
  { codigo: 'CAC-300-B', nombre: 'Circuitos de Arranque y Carga - Sistemas Híbridos' },
  { codigo: 'IGA-300-B', nombre: 'Inyección a Gasolina en Vehículos Híbridos' },
  { codigo: 'PRO-300-B', nombre: 'Programación de Controladores Híbridos' },
  { codigo: 'SIM-300-B', nombre: 'Sistema del Motor - Architecture Híbrida' },
  { codigo: 'VHE-300-B', nombre: 'Vehículos Híbridos y Eléctricos' },
  { codigo: 'AUT-400-B', nombre: 'Autotrónica II - Híbridos' },
  { codigo: 'EAA-400-B', nombre: 'Electrónica Analógica de Potencia' },
  { codigo: 'EDA-400-B', nombre: 'Electrónica Digital del Automóvil - BMS' },
  { codigo: 'MAN-400-B', nombre: 'Mantenimiento de Vehículos Híbridos' },
  { codigo: 'MIC-400-B', nombre: 'Microcontroladores de Gestión de Baterías' },
  { codigo: 'RMD-400-B', nombre: 'Reparación de Motores a Diésel en Híbridos' },
  { codigo: 'ATM-500-B', nombre: 'Automatización - Control de Potencia' },
  { codigo: 'EMP-500-B', nombre: 'Emprendimiento Productivo - Mobility Eléctrica' },
  { codigo: 'IEG-500-B', nombre: 'Inyección Electrónica a Gasolina en Híbridos' },
  { codigo: 'LAU-500-B', nombre: 'Laboratorio Autotrónica Híbridos I' },
  { codigo: 'RMP-500-B', nombre: 'Redes Multiplexadas en Vehículos Híbridos' },
  { codigo: 'RSA-500-B', nombre: 'Reparación de Cajas Automáticas Híbridas' },
  { codigo: 'TMG-500-B', nombre: 'Taller de Modalidad de Graduación I - Híbridos' },
  { codigo: 'ENE-600-B', nombre: 'Electroneumática y Accionadores Híbridos' },
  { codigo: 'IED-600-B', nombre: 'Inyección Electrónica a Diésel' },
  { codigo: 'LAU-600-B', nombre: 'Laboratorio Autotrónica Híbridos II' },
  { codigo: 'PMI-600-B', nombre: 'Potenciamiento del Motor en Vehículos Híbridos' },
  { codigo: 'SCO-600-B', nombre: 'Seguridad y Confort en Vehículos Híbridos' },
  { codigo: 'SHI-600-B', nombre: 'Sistemas Híbridos - Recuperación Energética' },
  { codigo: 'TMG-600-B', nombre: 'Taller de Modalidad de Graduación II - Híbridos' },

  // --- Mecánica Automotriz Diesel ---
  { codigo: 'DTA-100-A', nombre: 'Dibujo Técnico Automotriz I - Conjuntos de Motores' },
  { codigo: 'ELA-100-A', nombre: 'Electricidad Automotriz I - Electrónica de Motor Diesel' },
  { codigo: 'MAA-100-A', nombre: 'Matemática Aplicada - Termodinámica' },
  { codigo: 'MEA-100-A', nombre: 'Metrología de Sistemas de Inyección Diesel' },
  { codigo: 'MOG-100-A', nombre: 'Motores a Gasolina I - Fundamentos Diesel' },
  { codigo: 'QUA-100-A', nombre: 'Química Automotriz - Combustibles y Lubricantes' },
  { codigo: 'SOM-100-A', nombre: 'Seguridad Ocupacional y Medio Ambiente - Riesgos de Hidrocarburo' },
  { codigo: 'CHS-200-A', nombre: 'Chapería y Soldadura - Estructuras Reforzada' },
  { codigo: 'DTA-200-A', nombre: 'Dibujo Técnico Automotriz II - Circuitos de Diesel' },
  { codigo: 'ELA-200-A', nombre: 'Electricidad Automotriz II - Controlador Diesel' },
  { codigo: 'FIS-200-A', nombre: 'Física Aplicada a Motores Térmicos' },
  { codigo: 'INT-200-A', nombre: 'Inglés Técnico - Manuales de Diesel' },
  { codigo: 'MOG-200-A', nombre: 'Motores a Gasolina II - Conversión a Diesel' },
  { codigo: 'ETA-300-A', nombre: 'Electrónica Automotriz I - Sensores de Presión' },
  { codigo: 'ELA-300-A', nombre: 'Electricidad Automotriz III - Diagnóstico Eléctrico' },
  { codigo: 'MOD-300-A', nombre: 'Motores Diésel I - Sistema de Inyección' },
  { codigo: 'MOG-300-A', nombre: 'Motores a Gasolina III - Performance' },
  { codigo: 'TER-300-A', nombre: 'Termodinámica de Motores Diesel' },
  { codigo: 'TRA-300-A', nombre: 'Transmisiones I - Cajas de Vehículos Diésel' },
  { codigo: 'EMP-400-A', nombre: 'Emprendimiento Productivo - Taller Diesel' },
  { codigo: 'ETA-400-A', nombre: 'Electrónica Automotriz II - Control Electrónico Diesel' },
  { codigo: 'IAG-400-A', nombre: 'Inyección a Gasolina I - Comparación con Diesel' },
  { codigo: 'MOD-400-A', nombre: 'Motores Diésel II - Sobrealimentación' },
  { codigo: 'MOG-400-A', nombre: 'Motores a Gasolina IV - Diagnóstico Comparativo' },
  { codigo: 'TRA-400-A', nombre: 'Transmisiones II' },
  { codigo: 'ETA-500-A', nombre: 'Electrónica Automotriz III - Diagnóstico con Osciloscopio' },
  { codigo: 'IAG-500-A', nombre: 'Inyección a Gasolina II - Diagnóstico de Diesel' },
  { codigo: 'IED-500-A', nombre: 'Inyección Electrónica Diesel I' },
  { codigo: 'LAD-500-A', nombre: 'Laboratorio Diesel I' },
  { codigo: 'NEU-500-A', nombre: 'Neumática - Sistemas de Inyección' },
  { codigo: 'TMG-500-A', nombre: 'Taller de Modalidad de Graduación I - Diesel' },
  { codigo: 'TRA-500-A', nombre: 'Transmisiones III - Embragues de Alta Carga' },
  { codigo: 'DAU-600-A', nombre: 'Diagnóstico del Automóvil - Escáner Diesel' },
  { codigo: 'HID-600-A', nombre: 'Hidráulica - Bombas de Inyección' },
  { codigo: 'IAG-600-A', nombre: 'Inyección a Gasolina III - Simulación' },
  { codigo: 'IED-600-A', nombre: 'Inyección Electrónica a Diésel' },
  { codigo: 'LAD-600-A', nombre: 'Laboratorio Diesel II' },
  { codigo: 'MAP-600-A', nombre: 'Maquinaria Agrícola - Motores Diesel' },
  { codigo: 'TMG-600-A', nombre: 'Taller de Modalidad de Graduación II - Diesel' },
  { codigo: 'TRA-600-A', nombre: 'Transmisiones IV' },

  // --- Mecánica Automotriz Servicio ---
  { codigo: 'DTA-100-B', nombre: 'Dibujo Técnico Automotriz I - Piezas de Servicio' },
  { codigo: 'ELA-100-B', nombre: 'Electricidad Automotriz I - Diagnóstico en Taller' },
  { codigo: 'MAA-100-B', nombre: 'Matemática Aplicada - Cálculo de Refrigeración' },
  { codigo: 'MEA-100-B', nombre: 'Metrología de Refrigeración y Frenos' },
  { codigo: 'MOG-100-B', nombre: 'Motores a Gasolina I - Diagnóstico de Taller' },
  { codigo: 'QUA-100-B', nombre: 'Química Automotriz - Refrigerantes y Lubricantes' },
  { codigo: 'SOM-100-B', nombre: 'Seguridad Ocupacional y Medio Ambiente - Taller' },
  { codigo: 'CHS-200-B', nombre: 'Chapería y Soldadura - Soldadura MIG' },
  { codigo: 'DTA-200-B', nombre: 'Dibujo Técnico Automotriz II - Ensamblaje' },
  { codigo: 'ELA-200-B', nombre: 'Electricidad Automotriz II - Circuitos de Taller' },
  { codigo: 'FIS-200-B', nombre: 'Física Aplicada a Refrigeración' },
  { codigo: 'INT-200-B', nombre: 'Inglés Técnico - Atención al Cliente' },
  { codigo: 'MOG-200-B', nombre: 'Motores a Gasolina II - Ajuste de Taller' },
  { codigo: 'ETA-300-B', nombre: 'Electrónica Automotriz I - Equipos de Taller' },
  { codigo: 'ELA-300-B', nombre: 'Electricidad Automotriz III - Herramientas de Taller' },
  { codigo: 'MOD-300-B', nombre: 'Motores Diésel I en Taller' },
  { codigo: 'MOG-300-B', nombre: 'Motores a Gasolina III - Preparación de Taller' },
  { codigo: 'TER-300-B', nombre: 'Termodinámica Aplicada al Servicio' },
  { codigo: 'TRA-300-B', nombre: 'Transmisiones I - Diagnóstico en Taller' },
  { codigo: 'EMP-400-B', nombre: 'Emprendimiento Productivo - Taller de Servicio' },
  { codigo: 'ETA-400-B', nombre: 'Electrónica Automotriz II - Diagnóstico de Servicio' },
  { codigo: 'IAG-400-B', nombre: 'Inyección a Gasolina I - Diagnóstico' },
  { codigo: 'MOD-400-B', nombre: 'Motores Diésel II - Ajuste de Taller' },
  { codigo: 'MOG-400-B', nombre: 'Motores a Gasolina IV - Diagnóstico Avanzado' },
  { codigo: 'TRA-400-B', nombre: 'Transmisiones II - Cajas de Servicio' },
  { codigo: 'ETA-500-B', nombre: 'Electrónica Automotriz III - Herramientas de Diagnóstico' },
  { codigo: 'IAG-500-B', nombre: 'Inyección a Gasolina II - Service' },
  { codigo: 'IED-500-B', nombre: 'Inyección Electrónica Diesel I - Taller' },
  { codigo: 'LAD-500-B', nombre: 'Laboratorio de Taller I' },
  { codigo: 'NEU-500-B', nombre: 'Neumática - Herramientas Neumáticas' },
  { codigo: 'TMG-500-B', nombre: 'Taller de Modalidad de Graduación I - Servicio' },
  { codigo: 'TRA-500-B', nombre: 'Transmisiones III - Ajuste' },
  { codigo: 'DAU-600-B', nombre: 'Diagnóstico del Automóvil - Servicio General' },
  { codigo: 'HID-600-B', nombre: 'Hidráulica - Equipos de Taller' },
  { codigo: 'IAG-600-B', nombre: 'Inyección a Gasolina III - Service' },
  { codigo: 'IED-600-B', nombre: 'Inyección Electrónica a Diésel - Servicio' },
  { codigo: 'LAD-600-B', nombre: 'Laboratorio de Taller II' },
  { codigo: 'MAP-600-B', nombre: 'Maquinaria Agrícola - Mantenimiento' },
  { codigo: 'TMG-600-B', nombre: 'Taller de Modalidad de Graduación II - Servicio' },
  { codigo: 'TRA-600-B', nombre: 'Transmisiones IV - Ajuste Final' },
];

// ---------------------------------------------------------------------------
// Asignación de materias a los planes variantes
// (misma cantidad por semestre y mismas horas que el plan base)
// ---------------------------------------------------------------------------

export const MATERIAS_VARIANTES_POR_PLAN: MateriaPlanVariante[] = [
  // ===================== Autotrónica Electrónica (6-7-6-6-7-7) =============
  { plan: 'Autotrónica Electrónica', codigo: 'EMC-100-A', semestre: 1, horasSemanales: 4 },
  { plan: 'Autotrónica Electrónica', codigo: 'MAA-100-A', semestre: 1, horasSemanales: 4 },
  { plan: 'Autotrónica Electrónica', codigo: 'MEA-100-A', semestre: 1, horasSemanales: 6 },
  { plan: 'Autotrónica Electrónica', codigo: 'MGD-100-A', semestre: 1, horasSemanales: 6 },
  { plan: 'Autotrónica Electrónica', codigo: 'SOM-100-A', semestre: 1, horasSemanales: 4 },
  { plan: 'Autotrónica Electrónica', codigo: 'TRA-100-A', semestre: 1, horasSemanales: 6 },
  { plan: 'Autotrónica Electrónica', codigo: 'CIF-200-A', semestre: 2, horasSemanales: 6 },
  { plan: 'Autotrónica Electrónica', codigo: 'DIT-200-A', semestre: 2, horasSemanales: 2 },
  { plan: 'Autotrónica Electrónica', codigo: 'EMC-200-A', semestre: 2, horasSemanales: 4, prerrequisito: 'EMC-100-A' },
  { plan: 'Autotrónica Electrónica', codigo: 'FIS-200-A', semestre: 2, horasSemanales: 4, prerrequisito: 'MAA-100-A' },
  { plan: 'Autotrónica Electrónica', codigo: 'INT-200-A', semestre: 2, horasSemanales: 4 },
  { plan: 'Autotrónica Electrónica', codigo: 'MGD-200-A', semestre: 2, horasSemanales: 6, prerrequisito: 'MGD-100-A' },
  { plan: 'Autotrónica Electrónica', codigo: 'SIA-200-A', semestre: 2, horasSemanales: 4 },
  { plan: 'Autotrónica Electrónica', codigo: 'AUT-300-A', semestre: 3, horasSemanales: 4 },
  { plan: 'Autotrónica Electrónica', codigo: 'CAC-300-A', semestre: 3, horasSemanales: 6, prerrequisito: 'SIA-200-A' },
  { plan: 'Autotrónica Electrónica', codigo: 'IGA-300-A', semestre: 3, horasSemanales: 4, prerrequisito: 'MGD-200-A' },
  { plan: 'Autotrónica Electrónica', codigo: 'PRO-300-A', semestre: 3, horasSemanales: 4 },
  { plan: 'Autotrónica Electrónica', codigo: 'SIM-300-A', semestre: 3, horasSemanales: 6, prerrequisito: 'MGD-200-A' },
  { plan: 'Autotrónica Electrónica', codigo: 'VHE-300-A', semestre: 3, horasSemanales: 6 },
  { plan: 'Autotrónica Electrónica', codigo: 'AUT-400-A', semestre: 4, horasSemanales: 4, prerrequisito: 'AUT-300-A' },
  { plan: 'Autotrónica Electrónica', codigo: 'EAA-400-A', semestre: 4, horasSemanales: 6 },
  { plan: 'Autotrónica Electrónica', codigo: 'EDA-400-A', semestre: 4, horasSemanales: 6 },
  { plan: 'Autotrónica Electrónica', codigo: 'MAN-400-A', semestre: 4, horasSemanales: 4 },
  { plan: 'Autotrónica Electrónica', codigo: 'MIC-400-A', semestre: 4, horasSemanales: 6, prerrequisito: 'PRO-300-A' },
  { plan: 'Autotrónica Electrónica', codigo: 'RMD-400-A', semestre: 4, horasSemanales: 4 },
  { plan: 'Autotrónica Electrónica', codigo: 'ATM-500-A', semestre: 5, horasSemanales: 4 },
  { plan: 'Autotrónica Electrónica', codigo: 'EMP-500-A', semestre: 5, horasSemanales: 4 },
  { plan: 'Autotrónica Electrónica', codigo: 'IEG-500-A', semestre: 5, horasSemanales: 4 },
  { plan: 'Autotrónica Electrónica', codigo: 'LAU-500-A', semestre: 5, horasSemanales: 4, prerrequisito: 'AUT-400-A' },
  { plan: 'Autotrónica Electrónica', codigo: 'RMP-500-A', semestre: 5, horasSemanales: 6, prerrequisito: 'MIC-400-A' },
  { plan: 'Autotrónica Electrónica', codigo: 'RSA-500-A', semestre: 5, horasSemanales: 4, prerrequisito: 'MAN-400-A' },
  { plan: 'Autotrónica Electrónica', codigo: 'TMG-500-A', semestre: 5, horasSemanales: 4 },
  { plan: 'Autotrónica Electrónica', codigo: 'ENE-600-A', semestre: 6, horasSemanales: 2 },
  { plan: 'Autotrónica Electrónica', codigo: 'IED-600-A', semestre: 6, horasSemanales: 6 },
  { plan: 'Autotrónica Electrónica', codigo: 'LAU-600-A', semestre: 6, horasSemanales: 4, prerrequisito: 'LAU-500-A' },
  { plan: 'Autotrónica Electrónica', codigo: 'PMI-600-A', semestre: 6, horasSemanales: 4 },
  { plan: 'Autotrónica Electrónica', codigo: 'SCO-600-A', semestre: 6, horasSemanales: 6 },
  { plan: 'Autotrónica Electrónica', codigo: 'SHI-600-A', semestre: 6, horasSemanales: 4 },
  { plan: 'Autotrónica Electrónica', codigo: 'TMG-600-A', semestre: 6, horasSemanales: 4, prerrequisito: 'TMG-500-A' },

  // ===================== Autotrónica Híbridos (6-7-6-6-7-7) =================
  { plan: 'Autotrónica Híbridos', codigo: 'EMC-100-B', semestre: 1, horasSemanales: 4 },
  { plan: 'Autotrónica Híbridos', codigo: 'MAA-100-B', semestre: 1, horasSemanales: 4 },
  { plan: 'Autotrónica Híbridos', codigo: 'MEA-100-B', semestre: 1, horasSemanales: 6 },
  { plan: 'Autotrónica Híbridos', codigo: 'MGD-100-B', semestre: 1, horasSemanales: 6 },
  { plan: 'Autotrónica Híbridos', codigo: 'SOM-100-B', semestre: 1, horasSemanales: 4 },
  { plan: 'Autotrónica Híbridos', codigo: 'TRA-100-B', semestre: 1, horasSemanales: 6 },
  { plan: 'Autotrónica Híbridos', codigo: 'CIF-200-B', semestre: 2, horasSemanales: 6 },
  { plan: 'Autotrónica Híbridos', codigo: 'DIT-200-B', semestre: 2, horasSemanales: 2 },
  { plan: 'Autotrónica Híbridos', codigo: 'EMC-200-B', semestre: 2, horasSemanales: 4, prerrequisito: 'EMC-100-B' },
  { plan: 'Autotrónica Híbridos', codigo: 'FIS-200-B', semestre: 2, horasSemanales: 4, prerrequisito: 'MAA-100-B' },
  { plan: 'Autotrónica Híbridos', codigo: 'INT-200-B', semestre: 2, horasSemanales: 4 },
  { plan: 'Autotrónica Híbridos', codigo: 'MGD-200-B', semestre: 2, horasSemanales: 6, prerrequisito: 'MGD-100-B' },
  { plan: 'Autotrónica Híbridos', codigo: 'SIA-200-B', semestre: 2, horasSemanales: 4 },
  { plan: 'Autotrónica Híbridos', codigo: 'AUT-300-B', semestre: 3, horasSemanales: 4 },
  { plan: 'Autotrónica Híbridos', codigo: 'CAC-300-B', semestre: 3, horasSemanales: 6, prerrequisito: 'SIA-200-B' },
  { plan: 'Autotrónica Híbridos', codigo: 'IGA-300-B', semestre: 3, horasSemanales: 4, prerrequisito: 'MGD-200-B' },
  { plan: 'Autotrónica Híbridos', codigo: 'PRO-300-B', semestre: 3, horasSemanales: 4 },
  { plan: 'Autotrónica Híbridos', codigo: 'SIM-300-B', semestre: 3, horasSemanales: 6, prerrequisito: 'MGD-200-B' },
  { plan: 'Autotrónica Híbridos', codigo: 'VHE-300-B', semestre: 3, horasSemanales: 6 },
  { plan: 'Autotrónica Híbridos', codigo: 'AUT-400-B', semestre: 4, horasSemanales: 4, prerrequisito: 'AUT-300-B' },
  { plan: 'Autotrónica Híbridos', codigo: 'EAA-400-B', semestre: 4, horasSemanales: 6 },
  { plan: 'Autotrónica Híbridos', codigo: 'EDA-400-B', semestre: 4, horasSemanales: 6 },
  { plan: 'Autotrónica Híbridos', codigo: 'MAN-400-B', semestre: 4, horasSemanales: 4 },
  { plan: 'Autotrónica Híbridos', codigo: 'MIC-400-B', semestre: 4, horasSemanales: 6, prerrequisito: 'PRO-300-B' },
  { plan: 'Autotrónica Híbridos', codigo: 'RMD-400-B', semestre: 4, horasSemanales: 4 },
  { plan: 'Autotrónica Híbridos', codigo: 'ATM-500-B', semestre: 5, horasSemanales: 4 },
  { plan: 'Autotrónica Híbridos', codigo: 'EMP-500-B', semestre: 5, horasSemanales: 4 },
  { plan: 'Autotrónica Híbridos', codigo: 'IEG-500-B', semestre: 5, horasSemanales: 4 },
  { plan: 'Autotrónica Híbridos', codigo: 'LAU-500-B', semestre: 5, horasSemanales: 4, prerrequisito: 'AUT-400-B' },
  { plan: 'Autotrónica Híbridos', codigo: 'RMP-500-B', semestre: 5, horasSemanales: 6, prerrequisito: 'MIC-400-B' },
  { plan: 'Autotrónica Híbridos', codigo: 'RSA-500-B', semestre: 5, horasSemanales: 4, prerrequisito: 'MAN-400-B' },
  { plan: 'Autotrónica Híbridos', codigo: 'TMG-500-B', semestre: 5, horasSemanales: 4 },
  { plan: 'Autotrónica Híbridos', codigo: 'ENE-600-B', semestre: 6, horasSemanales: 2 },
  { plan: 'Autotrónica Híbridos', codigo: 'IED-600-B', semestre: 6, horasSemanales: 6 },
  { plan: 'Autotrónica Híbridos', codigo: 'LAU-600-B', semestre: 6, horasSemanales: 4, prerrequisito: 'LAU-500-B' },
  { plan: 'Autotrónica Híbridos', codigo: 'PMI-600-B', semestre: 6, horasSemanales: 4 },
  { plan: 'Autotrónica Híbridos', codigo: 'SCO-600-B', semestre: 6, horasSemanales: 6 },
  { plan: 'Autotrónica Híbridos', codigo: 'SHI-600-B', semestre: 6, horasSemanales: 4 },
  { plan: 'Autotrónica Híbridos', codigo: 'TMG-600-B', semestre: 6, horasSemanales: 4, prerrequisito: 'TMG-500-B' },

  // ===================== Mecánica Automotriz Diesel (7-6-6-6-7-8) ========
  { plan: 'Mecánica Automotriz Diesel', codigo: 'DTA-100-A', semestre: 1, horasSemanales: 2 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'ELA-100-A', semestre: 1, horasSemanales: 6 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'MAA-100-A', semestre: 1, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'MEA-100-A', semestre: 1, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'MOG-100-A', semestre: 1, horasSemanales: 6 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'QUA-100-A', semestre: 1, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'SOM-100-A', semestre: 1, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'CHS-200-A', semestre: 2, horasSemanales: 6 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'DTA-200-A', semestre: 2, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'ELA-200-A', semestre: 2, horasSemanales: 6 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'FIS-200-A', semestre: 2, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'INT-200-A', semestre: 2, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'MOG-200-A', semestre: 2, horasSemanales: 6 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'ELA-300-A', semestre: 3, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'ETA-300-A', semestre: 3, horasSemanales: 6 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'MOD-300-A', semestre: 3, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'MOG-300-A', semestre: 3, horasSemanales: 6 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'TER-300-A', semestre: 3, horasSemanales: 2 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'TRA-300-A', semestre: 3, horasSemanales: 8 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'EMP-400-A', semestre: 4, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'ETA-400-A', semestre: 4, horasSemanales: 6 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'IAG-400-A', semestre: 4, horasSemanales: 6 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'MOD-400-A', semestre: 4, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'MOG-400-A', semestre: 4, horasSemanales: 6 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'TRA-400-A', semestre: 4, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'ETA-500-A', semestre: 5, horasSemanales: 6 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'IAG-500-A', semestre: 5, horasSemanales: 6 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'IED-500-A', semestre: 5, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'LAD-500-A', semestre: 5, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'NEU-500-A', semestre: 5, horasSemanales: 2 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'TMG-500-A', semestre: 5, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'TRA-500-A', semestre: 5, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'DAU-600-A', semestre: 6, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'HID-600-A', semestre: 6, horasSemanales: 2 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'IAG-600-A', semestre: 6, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'IED-600-A', semestre: 6, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'LAD-600-A', semestre: 6, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'MAP-600-A', semestre: 6, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'TMG-600-A', semestre: 6, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Diesel', codigo: 'TRA-600-A', semestre: 6, horasSemanales: 4 },

  // ===================== Mecánica Automotriz Servicio (7-6-6-6-7-8) ======
  { plan: 'Mecánica Automotriz Servicio', codigo: 'DTA-100-B', semestre: 1, horasSemanales: 2 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'ELA-100-B', semestre: 1, horasSemanales: 6 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'MAA-100-B', semestre: 1, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'MEA-100-B', semestre: 1, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'MOG-100-B', semestre: 1, horasSemanales: 6 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'QUA-100-B', semestre: 1, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'SOM-100-B', semestre: 1, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'CHS-200-B', semestre: 2, horasSemanales: 6 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'DTA-200-B', semestre: 2, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'ELA-200-B', semestre: 2, horasSemanales: 6 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'FIS-200-B', semestre: 2, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'INT-200-B', semestre: 2, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'MOG-200-B', semestre: 2, horasSemanales: 6 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'ELA-300-B', semestre: 3, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'ETA-300-B', semestre: 3, horasSemanales: 6 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'MOD-300-B', semestre: 3, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'MOG-300-B', semestre: 3, horasSemanales: 6 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'TER-300-B', semestre: 3, horasSemanales: 2 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'TRA-300-B', semestre: 3, horasSemanales: 8 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'EMP-400-B', semestre: 4, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'ETA-400-B', semestre: 4, horasSemanales: 6 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'IAG-400-B', semestre: 4, horasSemanales: 6 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'MOD-400-B', semestre: 4, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'MOG-400-B', semestre: 4, horasSemanales: 6 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'TRA-400-B', semestre: 4, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'ETA-500-B', semestre: 5, horasSemanales: 6 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'IAG-500-B', semestre: 5, horasSemanales: 6 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'IED-500-B', semestre: 5, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'LAD-500-B', semestre: 5, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'NEU-500-B', semestre: 5, horasSemanales: 2 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'TMG-500-B', semestre: 5, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'TRA-500-B', semestre: 5, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'DAU-600-B', semestre: 6, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'HID-600-B', semestre: 6, horasSemanales: 2 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'IAG-600-B', semestre: 6, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'IED-600-B', semestre: 6, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'LAD-600-B', semestre: 6, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'MAP-600-B', semestre: 6, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'TMG-600-B', semestre: 6, horasSemanales: 4 },
  { plan: 'Mecánica Automotriz Servicio', codigo: 'TRA-600-B', semestre: 6, horasSemanales: 4 },
];
