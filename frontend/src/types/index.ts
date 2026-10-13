export type Rol =
  | 'administrador'
  | 'secretaria'
  | 'director_academico'
  | 'rector'
  | 'docente'
  | 'estudiante'
  | 'apoyo';

export interface Usuario {
  id: number;
  nombreUsuario: string;
  email?: string;
  rol: Rol;
  personaId?: number;
  estado: string;
  created_at?: string;
  updated_at?: string;
}

export interface Persona {
  id: number;
  ci: string;
  names: string;
  lastname_paternal: string;
  lastname_maternal: string;
  birthdate: string;
  birthplace?: string;
  gender: 'M' | 'F';
  marital_status?: string;
  nationality?: string;
  dual_nationality?: string;
  passport_number?: string;
  blood_type?: string;
  disability?: string;
  military_book_number?: string;
  mother_tongue?: string;
  phone?: string;
  email?: string;
  address?: string;
  photo_url?: string;
  status?: 'activo' | 'inactivo';
  created_at?: string;
  updated_at?: string;
}

export interface Estudiante {
  id: number;
  person_id: number;
  inscription_code: string;
  admission_date: string;
  status: 'activo' | 'inactivo' | 'egresado' | 'suspendido';
  persona?: Persona;
  created_at?: string;
  updated_at?: string;
  estado_matricula?: 'pre_registro' | 'verificado' | 'matriculado' | 'egresado' | 'retirado';
  origen?: 'web' | 'secretaria';
  admission_request_id?: string;
  verificado_por?: number;
  fecha_verificacion?: string;
  fecha_pre_registro?: string;
}

export interface Personal {
  id: number;
  person_id: number;
  profession?: string;
  position: string;
  hire_date: string;
  status: 'activo' | 'inactivo' | 'licencia';
  persona?: Persona;
  created_at?: string;
  updated_at?: string;
}

export interface Carrera {
  id: number;
  code: string;
  name: string;
  area?: string;
  title?: string;
  description?: string;
  load_hours?: number;
  status: 'activo' | 'inactivo';
  created_at?: string;
  updated_at?: string;
}

export interface Materia {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  creditos: number;
  horasSemanales: number;
  semester: number;
  careerId: number;
  carrera?: Carrera;
  createdAt?: string;
  updatedAt?: string;
}

export interface Grupo {
  id: number;
  nombre: string;
  codigo: string;
  anoAcademico: number;
  periodo: number;
  careerId: number;
  docenteId?: number;
  capacidad: number;
  estado: 'activo' | 'inactivo';
  carrera?: Carrera;
  createdAt?: string;
  updatedAt?: string;
}

export interface Inscripcion {
  id: number;
  studentId: number;
  groupId: number;
  fechaInscripcion: string;
  estado: 'confirmado' | 'pendiente' | 'cancelado';
  estudiante?: Estudiante;
  grupo?: Grupo;
  createdAt?: string;
  updatedAt?: string;
}

export interface Calificacion {
  id: number;
  enrollmentId: number;
  tipoEvaluacion: 'examen_parcial' | 'examen_final' | 'practica' | 'trabajo' | 'participacion';
  nota: number;
  observacion?: string;
  fechaEvaluacion: string;
  inscripcion?: Inscripcion;
  createdAt?: string;
  updatedAt?: string;
}

export interface Pago {
  id: number;
  studentId: number;
  concepto: string;
  monto: number;
  fechaVencimiento: string;
  fechaPago?: string;
  estado: 'pendiente' | 'pagado' | 'vencido' | 'anulado';
  metodoPago?: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta';
  estudiante?: Estudiante;
  createdAt?: string;
  updatedAt?: string;
}

export interface Certificado {
  id: number;
  studentId: number;
  tipo: 'certificado_inscripcion' | 'certificado_estudios' | 'certificado_graduacion' | 'otro';
  fechaEmision: string;
  estado: 'pendiente' | 'emitido' | 'entregado' | 'anulado';
  observaciones?: string;
  estudiante?: Estudiante;
  createdAt?: string;
  updatedAt?: string;
}

export interface Convalidacion {
  id: number;
  studentId: number;
  materiaOrigen: string;
  materiaConvalidada: string;
  institucionOrigen?: string;
  fechaConvalidation: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  observaciones?: string;
  estudiante?: Estudiante;
  createdAt?: string;
  updatedAt?: string;
}

export interface EstadoAutenticacion {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: Usuario) => void;
}

export interface ElementoMenu {
  title: string;
  href: string;
  icon: string;
  roles: Rol[];
  children?: ElementoMenu[];
}

export interface ElementoMigas {
  label: string;
  href?: string;
}

export interface Periodo {
  id: number;
  gestion_id: number;
  number: string;
  name?: string;
  start_date: string;
  end_date: string;
  estado: 'abierta' | 'cerrada' | 'pendiente';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Gestion {
  id: number;
  year: string;
  period_type: 'semestral';
  estado: 'abierta' | 'cerrada' | 'pendiente';
  is_current: boolean;
  notes?: string;
  periodos?: Periodo[];
  created_at?: string;
  updated_at?: string;
}

export type EstadoAdmision = 'pendiente' | 'verificado' | 'rechazado' | 'convertido';
export type OrigenAdmision = 'web' | 'secretaria';

export interface SolicitudAdmision {
  id: string;
  nombre: string;
  ci: string;
  fechaNacimiento: string;
  telefono?: string;
  email: string;
  direccion?: string;
  nombreTutor?: string;
  ciTutor?: string;
  telefonoTutor?: string;
  genero?: 'M' | 'F';
  carrera_id?: number;
  carrera?: Carrera;
  estado: EstadoAdmision;
  observaciones?: string;
  verificado_por?: number;
  verificador?: Usuario;
  fechaVerificacion?: string;
  origen: OrigenAdmision;
  documentoCiPath?: string;
  certificadoBachillerPath?: string;
  fotoPath?: string;
  converted_student_id?: number;
  created_at?: string;
  updated_at?: string;
  birthplace?: string;
  birthplace_other?: string;
  nationality?: string;
  nationality_other?: string;
}

export interface CrearAdmisionDto {
  names: string;
  lastname_paternal?: string;
  lastname_maternal?: string;
  ci: string;
  nationality?: string;
  nationality_other?: string;
  birthdate: string;
  birthplace?: string;
  birthplace_other?: string;
  gender?: 'M' | 'F';
  marital_status?: string;
  phone?: string;
  email: string;
  address?: string;
  nombreTutor?: string;
  ciTutor?: string;
  telefonoTutor?: string;
  carrera_id?: number;
  origen?: OrigenAdmision;
}

export interface RegistroConsentimiento {
  id: string;
  estudiante_id: number;
  estudiante?: Estudiante;
  versionPolitica: string;
  fechaConsentimiento: string;
  ipConsentimiento?: string;
  nombreTutor?: string;
  ciTutor?: string;
  firmaBase64?: string;
  consentimientoTutor: boolean;
  derechoEjercido?: 'access' | 'rectification' | 'deletion';
  derechoFecha?: string;
  created_at?: string;
}

export interface EstudianteExtendido extends Estudiante {
  estado_matricula: 'pre_registro' | 'verificado' | 'matriculado' | 'egresado' | 'retirado';
  origen: 'web' | 'secretaria';
  admission_request_id?: string;
  verificado_por?: number;
  fecha_verificacion?: string;
  fecha_pre_registro?: string;
}

export type TipoEmisionCredencial = 'primera' | 'renovacion' | 'reimpresion';
export type EstadoEntregaCredencial = 'generado' | 'impreso' | 'entregado';

export interface CredencialExtendida {
  id: number;
  student_id: number;
  estudiante?: Estudiante;
  gestion: string;
  gestion_id?: number;
  semester: number;
  issued_date: string;
  valid_until: string;
  photo_url?: string;
  status: 'emitida' | 'anulada' | 'reemplazada';
  tipo_emision: TipoEmisionCredencial;
  vigencia_hasta?: string;
  qr_verificacion?: string;
  estado_entrega: EstadoEntregaCredencial;
  entregado_a?: number;
  fecha_entrega?: string;
  created_at?: string;
}
