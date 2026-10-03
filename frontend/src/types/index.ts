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
  email?: string;
  role: Role;
  person_id?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Person {
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

export interface Student {
  id: number;
  person_id: number;
  inscription_code: string;
  admission_date: string;
  status: 'activo' | 'inactivo' | 'egresado' | 'suspendido';
  persona?: Person;
  created_at?: string;
  updated_at?: string;
  estado_matricula?: 'pre_registro' | 'verificado' | 'matriculado' | 'egresado' | 'retirado';
  origen?: 'web' | 'secretaria';
  admission_request_id?: string;
  verificado_por?: number;
  fecha_verificacion?: string;
  fecha_pre_registro?: string;
}

export interface Staff {
  id: number;
  person_id: number;
  profession?: string;
  position: string;
  hire_date: string;
  status: 'activo' | 'inactivo' | 'licencia';
  persona?: Person;
  created_at?: string;
  updated_at?: string;
}

export interface Career {
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
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
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

export interface Periodo {
  id: number;
  gestion_id: number;
  number: string;
  name?: string;
  start_date: string;
  end_date: string;
  status: 'abierta' | 'cerrada' | 'pendiente';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Gestion {
  id: number;
  year: string;
  period_type: 'semestral';
  status: 'abierta' | 'cerrada' | 'pendiente';
  is_current: boolean;
  notes?: string;
  periodos?: Periodo[];
  created_at?: string;
  updated_at?: string;
}

export type AdmissionStatus = 'pendiente' | 'verificado' | 'rechazado' | 'convertido';
export type AdmissionOrigin = 'web' | 'secretaria';

export interface AdmissionRequest {
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
  carrera?: Career;
  estado: AdmissionStatus;
  observaciones?: string;
  verificado_por?: number;
  verificador?: User;
  fechaVerificacion?: string;
  origen: AdmissionOrigin;
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

export interface CreateAdmissionDto {
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
  origen?: AdmissionOrigin;
}

export interface ConsentRecord {
  id: string;
  estudiante_id: number;
  estudiante?: Student;
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

export interface StudentExtended extends Student {
  estado_matricula: 'pre_registro' | 'verificado' | 'matriculado' | 'egresado' | 'retirado';
  origen: 'web' | 'secretaria';
  admission_request_id?: string;
  verificado_por?: number;
  fecha_verificacion?: string;
  fecha_pre_registro?: string;
}

export type CredentialEmissionType = 'primera' | 'renovacion' | 'reimpresion';
export type CredentialDeliveryStatus = 'generado' | 'impreso' | 'entregado';

export interface CredentialExtended {
  id: number;
  student_id: number;
  estudiante?: Student;
  gestion: string;
  gestion_id?: number;
  semester: number;
  issued_date: string;
  valid_until: string;
  photo_url?: string;
  status: 'emitida' | 'anulada' | 'reemplazada';
  tipo_emision: CredentialEmissionType;
  vigencia_hasta?: string;
  qr_verificacion?: string;
  estado_entrega: CredentialDeliveryStatus;
  entregado_a?: number;
  fecha_entrega?: string;
  created_at?: string;
}
