/** Tipos de la interfaz del docente. */

export interface TurnoDocente {
  id: number;
  codigo: string;
  nombre: string;
}

export interface GrupoDocente {
  id: number;
  codigo: string;
  semestre: number;
  paralelo: string;
  turno: TurnoDocente | null;
  carrera: { id: number; nombre: string } | null;
  periodo: { id: number; numero: number; gestion: number | null } | null;
}

export interface MateriaDocente {
  asignacionId: number;
  materiaImpartidaId: number;
  cargaHoraria: number | null;
  fechaInicio: string | null;
  gestion: string;
  materia: { id: number; codigo: string; nombre: string } | null;
  grupo: GrupoDocente | null;
  inscritos: number;
}

export interface ResumenDocente {
  totalMaterias: number;
  totalEstudiantes: number;
  totalGrupos: number;
  cargaHoraria: number;
}
