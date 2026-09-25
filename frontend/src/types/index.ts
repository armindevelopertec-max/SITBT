export type Role =
  | 'administrador'
  | 'secretaria'
  | 'director_academico'
  | 'rector'
  | 'docente'
  | 'estudiante'
  | 'apoyo';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  personId?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Person {
  id: number;
  ci: string;
  nombre: string;
  primerApellido: string;
  segundoApellido?: string;
  fechaNacimiento: string;
  genero: 'M' | 'F';
  telefono?: string;
  direccion?: string;
  email?: string;
  foto?: string;
  estadoCivil?: string;
  nacionalidad?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  id: number;
  personId: number;
  codigoEstudiante: string;
  fechaIngreso: string;
  estado: 'activo' | 'inactivo' | 'egresado' | 'suspendido';
  person?: Person;
  createdAt?: string;
  updatedAt?: string;
}

export interface Staff {
  id: number;
  personId: number;
  cargo: string;
  departamento?: string;
  fechaContratacion: string;
  tipoContrato: 'planta' | 'contrato' | 'honorarios';
  estado: 'activo' | 'inactivo';
  person?: Person;
  createdAt?: string;
  updatedAt?: string;
}

export interface Career {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  duracionSemestres: number;
  modalidad: 'presencial' | 'semipresencial' | 'distancia';
  estado: 'activo' | 'inactivo';
  createdAt?: string;
  updatedAt?: string;
}

export interface Subject {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  creditos: number;
  horasSemanales: number;
  semester: number;
  careerId: number;
  career?: Career;
  createdAt?: string;
  updatedAt?: string;
}

export interface Group {
  id: number;
  nombre: string;
  codigo: string;
  anoAcademico: number;
  periodo: number;
  careerId: number;
  docenteId?: number;
  capacidad: number;
  estado: 'activo' | 'inactivo';
  career?: Career;
  createdAt?: string;
  updatedAt?: string;
}

export interface Enrollment {
  id: number;
  studentId: number;
  groupId: number;
  fechaInscripcion: string;
  estado: 'confirmado' | 'pendiente' | 'cancelado';
  student?: Student;
  group?: Group;
  createdAt?: string;
  updatedAt?: string;
}

export interface Grade {
  id: number;
  enrollmentId: number;
  tipoEvaluacion: 'examen_parcial' | 'examen_final' | 'practica' | 'trabajo' | 'participacion';
  nota: number;
  observacion?: string;
  fechaEvaluacion: string;
  enrollment?: Enrollment;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  id: number;
  studentId: number;
  concepto: string;
  monto: number;
  fechaVencimiento: string;
  fechaPago?: string;
  estado: 'pendiente' | 'pagado' | 'vencido' | 'anulado';
  metodoPago?: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta';
  student?: Student;
  createdAt?: string;
  updatedAt?: string;
}

export interface Certificate {
  id: number;
  studentId: number;
  tipo: 'certificado_inscripcion' | 'certificado_estudios' | 'certificado_graduacion' | 'otro';
  fechaEmision: string;
  estado: 'pendiente' | 'emitido' | 'entregado' | 'anulado';
  observaciones?: string;
  student?: Student;
  createdAt?: string;
  updatedAt?: string;
}

export interface Convalidation {
  id: number;
  studentId: number;
  materiaOrigen: string;
  materiaConvalidada: string;
  institutionOrigen?: string;
  fechaConvalidation: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  observaciones?: string;
  student?: Student;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export interface MenuItem {
  title: string;
  href: string;
  icon: string;
  roles: Role[];
  children?: MenuItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
