export type Rol =
  | 'administrador'
  | 'secretaria'
  | 'director_academico'
  | 'rector'
  | 'docente'
  | 'estudiante'
  | 'apoyo';

export interface RolSistema {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  estado?: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface Persona {
  id: number;
  ci: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  lugarNacimiento?: string | null;
  lugarNacimientoOtro?: string | null;
  genero: 'M' | 'F';
  estadoCivil?: string | null;
  nacionalidad?: string | null;
  nacionalidadOtra?: string | null;
  dobleNacionalidad?: string | null;
  numeroPasaporte?: string | null;
  tipoSangre?: string | null;
  discapacidad?: string | null;
  numeroLibretaMilitar?: string | null;
  lenguaMaterna?: string | null;
  telefono?: string | null;
  correo?: string | null;
  direccion?: string | null;
  fotoUrl?: string | null;
  estado?: 'activo' | 'inactivo';
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface Usuario {
  id: number;
  nombreUsuario: string;
  correo?: string;
  rol: Rol;
  roles?: RolSistema[];
  personaId?: number;
  persona?: Persona;
  estado: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface Carrera {
  id: number;
  codigo: string;
  nombre: string;
  area?: string | null;
  titulo: string;
  descripcion?: string | null;
  horasCarga: number;
  estado: 'activo' | 'inactivo';
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface Materia {
  id: number;
  codigo: string;
  nombre: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface PlanEstudio {
  id: number;
  carreraId: number;
  numeroRm: string;
  fechaRm: string;
  estado: string;
  notas?: string | null;
  carrera?: Carrera;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface Turno {
  id: number;
  codigo: string;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface Estudiante {
  id: number;
  personaId: number;
  persona?: Persona;
  numeroTituloBachiller?: string | null;
  fechaTituloBachiller?: string | null;
  gestionAdmision?: string | null;
  numeroFolder?: string | null;
  codigoInscripcion: string;
  codigoFormulario01?: string | null;
  carreraId: number;
  carrera?: Carrera;
  planEstudioId?: number;
  fechaAdmision: string;
  estado: 'activo' | 'egresado' | 'titulado' | 'congelado' | 'baja';
  estadoMatricula?: 'pre_registro' | 'verificado' | 'matriculado' | 'egresado' | 'retirado';
  origen?: 'web' | 'secretaria';
  solicitudAdmisionId?: string | null;
  verificadoPor?: number | null;
  fechaVerificacion?: string | null;
  fechaPreRegistro?: string | null;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface Personal {
  id: number;
  personaId: number;
  persona?: Persona;
  profesion?: string | null;
  cargo: string;
  fechaContrato: string;
  estado: 'activo' | 'inactivo' | 'licencia';
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface Grupo {
  id: number;
  codigo: string;
  carreraId: number;
  planEstudioId?: number | null;
  materiaId: number;
  semestre: number;
  turnoId?: number | null;
  paralelo?: string | null;
  gestion: string;
  periodo?: string | null;
  capacidad: number;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface Inscripcion {
  id: number;
  estudianteId: number;
  materiaId: number;
  materiaPlanId?: number | null;
  grupoId?: number | null;
  gestion: string;
  semestre: number;
  estado: string;
  notaFinal?: number | null;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface Calificacion {
  id: number;
  inscripcionId: number;
  parcial1?: number | null;
  parcial2?: number | null;
  promedioFinal?: number | null;
  observacion?: string | null;
  estadoRegular?: string | null;
  aptoSegundaTurno?: boolean | null;
  notaSegundaTurno?: number | null;
  segundaTurnoAplicado?: boolean | null;
  estado2T?: string | null;
  notaDefinitiva?: number | null;
  estadoDefinitivo?: string | null;
  registradoPor?: number | null;
  registradoEn?: string;
  actualizadoEn?: string;
}

export interface Pago {
  id: number;
  estudianteId: number;
  conceptoId?: number | null;
  gestion: string;
  monto: number;
  fechaPago?: string | null;
  metodoPago?: string | null;
  numeroRecibo?: string | null;
  recibidoPor?: number | null;
  estado: string;
  notas?: string | null;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface Certificado {
  id: number;
  estudianteId: number;
  tipo: string;
  fecha: string;
  codigo: string;
  emitidoPor?: number | null;
  creadoEn?: string;
}

export interface Convalidacion {
  id: number;
  estudianteId: number;
  equivalenciaId?: number | null;
  materiaDestinoId: number;
  tipo?: string | null;
  numeroResolucion?: string | null;
  fechaResolucion?: string | null;
  estado: string;
  aprobadoPor?: number | null;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface Gestion {
  id: number;
  anio: string;
  tipoPeriodo: string;
  estado: 'abierta' | 'cerrada' | 'pendiente';
  esActual: boolean;
  notas?: string | null;
  periodos?: Periodo[];
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface Periodo {
  id: number;
  gestionId: number;
  numero: string;
  nombre?: string | null;
  fechaInicio: string;
  fechaFin: string;
  estado: 'abierta' | 'cerrada' | 'pendiente';
  notas?: string | null;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface EstadoAutenticacion {
  usuario: Usuario | null;
  tokenAcceso: string | null;
  estaAutenticado: boolean;
  cargando: boolean;
  _hidratado: boolean;
  establecerHidratado: (estado: boolean) => void;
  iniciarSesion: (nombreUsuario: string, contrasena: string) => Promise<void>;
  cerrarSesion: () => void;
  establecerUsuario: (usuario: Usuario) => void;
}

export interface ElementoMenu {
  titulo: string;
  href: string;
  icono: string;
  roles: Rol[];
  hijos?: ElementoMenu[];
}

export interface ElementoMigas {
  etiqueta: string;
  href?: string;
}

export type EstadoAdmision = 'pendiente' | 'verificado' | 'rechazado' | 'convertido';
export type OrigenAdmision = 'web' | 'secretaria';

export interface SolicitudAdmision {
  id: string;
  nombre: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  ci: string;
  fechaNacimiento: string;
  lugarNacimiento?: string;
  lugarNacimientoOtro?: string;
  genero?: 'M' | 'F';
  estadoCivil?: string;
  nacionalidad?: string;
  nacionalidadOtra?: string;
  telefono?: string;
  correo: string;
  direccion?: string;
  nombreTutor?: string;
  ciTutor?: string;
  telefonoTutor?: string;
  carreraId?: number;
  carrera?: Carrera;
  estado: EstadoAdmision;
  observaciones?: string;
  verificadoPor?: number;
  verificador?: Usuario;
  fechaVerificacion?: string;
  origen: OrigenAdmision;
  documentoCiRuta?: string;
  certificadoBachillerRuta?: string;
  fotoRuta?: string;
  estudianteConvertidoId?: number;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface CrearAdmisionDto {
  nombre: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  ci: string;
  nacionalidad?: string;
  nacionalidadOtra?: string;
  fechaNacimiento: string;
  lugarNacimiento?: string;
  lugarNacimientoOtro?: string;
  genero?: 'M' | 'F';
  estadoCivil?: string;
  telefono?: string;
  correo: string;
  direccion?: string;
  nombreTutor?: string;
  ciTutor?: string;
  telefonoTutor?: string;
  carreraId?: number;
  origen?: OrigenAdmision;
}

export interface RegistroConsentimiento {
  id: string;
  estudianteId: number;
  estudiante?: Estudiante;
  versionPolitica: string;
  fechaConsentimiento: string;
  ipConsentimiento?: string;
  nombreTutor?: string;
  ciTutor?: string;
  firmaBase64?: string;
  consentimientoTutor: boolean;
  derechoEjercido?: 'acceso' | 'rectificacion' | 'eliminacion';
  derechoFecha?: string;
  creadoEn?: string;
}

export type TipoEmisionCredencial = 'primera' | 'renovacion' | 'reimpresion';
export type EstadoEntregaCredencial = 'generado' | 'impreso' | 'entregado';

export interface CredencialExtendida {
  id: number;
  estudianteId: number;
  estudiante?: Estudiante;
  gestion: string;
  gestionId?: number;
  semestre: number;
  fechaEmision: string;
  validoHasta: string;
  fotoUrl?: string;
  estado: string;
  tipoEmision: TipoEmisionCredencial;
  vigenciaHasta?: string;
  qrVerificacion?: string;
  estadoEntrega: EstadoEntregaCredencial;
  entregadoA?: number;
  fechaEntrega?: string;
  creadoEn?: string;
}
