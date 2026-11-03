/** Tipos de la interfaz del estudiante. */

export interface TurnoEstudiante {
  id: number;
  codigo: string;
  nombre: string;
}

export interface PeriodoEstudiante {
  id: number;
  numero: number;
  nombre: string | null;
  gestion: number | null;
  estado: string;
}

export interface GrupoEstudiante {
  id: number;
  codigo: string;
  semestre: number;
  paralelo: string;
  turno: TurnoEstudiante | null;
  carrera: { id: number; nombre: string } | null;
  periodo: PeriodoEstudiante | null;
}

/** Calificación propia que el estudiante puede consultar (solo lectura). */
export interface CalificacionEstudiante {
  parcial1: number | null;
  parcial1Estado: string;
  parcial2: number | null;
  parcial2Estado: string;
  promedioFinal: number | null;
  observacion: string | null;
  estadoRegular: string | null;
  aptoSegundaTurno: boolean;
  estado2T: string;
  notaSegundaTurno: number | null;
  segundaTurnoAplicado: boolean;
  notaDefinitiva: number | null;
  estadoDefinitivo: string | null;
  estadoRevision: string;
  registradoEn?: string | null;
  actualizadoEn?: string | null;
}

export interface MateriaEstudiante {
  inscripcionMateriaId: number;
  materiaImpartidaId: number | null;
  estadoInscripcion: string;
  gestion: string | null;
  materia: { id: number; codigo: string; nombre: string } | null;
  grupo: GrupoEstudiante | null;
  horasSemanales: number | null;
  docente: { id: number; nombre: string; ci: string | null } | null;
  calificacion: CalificacionEstudiante | null;
}

export interface DetalleMateriaEstudiante extends MateriaEstudiante {
  estadoMateria: string | null;
  libroEstado: string;
}

export interface ResumenEstudiante {
  estudiante: {
    id: number;
    codigoInscripcion: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    carrera: { id: number; nombre: string } | null;
    semestre: number | null;
    estado: string;
    estadoMatricula: string;
  };
  materiasEnCurso: number;
  notasRegistradas: number;
  promedioGeneral: number | null;
}

/** Estado de una materia dentro de la malla curricular del estudiante. */
export type EstadoMateriaMalla =
  | 'aprobada'
  | 'cursando'
  | 'reprobada'
  | 'pendiente';

export interface MateriaMallaEstudiante {
  id: number;
  codigo: string;
  nombre: string;
  semestre: number;
  horasSemanales: number;
  estado: EstadoMateriaMalla;
  notaFinal: number | null;
  gestion: string | null;
  prerrequisito: { codigo: string; nombre: string } | null;
}

export interface SemestreMallaEstudiante {
  semestre: number;
  materias: MateriaMallaEstudiante[];
}

export interface MallaEstudiante {
  estudiante: {
    id: number;
    codigoInscripcion: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    carrera: { id: number; nombre: string } | null;
  };
  plan: {
    id: number;
    numeroRm: string;
    fechaRm: string;
    estado: string;
    carrera: { id: number; nombre: string } | null;
  } | null;
  resumen: {
    totalMaterias: number;
    aprobadas: number;
    cursando: number;
    reprobadas: number;
    pendientes: number;
    porcentajeAvance: number;
    semestreActual: number | null;
  };
  semestres: SemestreMallaEstudiante[];
}
