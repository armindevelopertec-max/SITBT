import { AccionPermiso } from '../../entidades/permiso.entidad';

export interface ModuloPermiso {
  modulo: string;
  nombre: string;
  descripcion: string;
  grupo: string;
  acciones: AccionPermiso[];
}

const CRUD: AccionPermiso[] = [
  AccionPermiso.LEER,
  AccionPermiso.CREAR,
  AccionPermiso.ACTUALIZAR,
  AccionPermiso.ELIMINAR,
];

/**
 * Catálogo de módulos y acciones que el administrador puede asignar a los
 * roles desde la interfaz. Cada clave `modulo` debe coincidir con el mapa de
 * rutas que usa GuardaRoles para autorizar las peticiones.
 */
export const CATALOGO_PERMISOS: ModuloPermiso[] = [
  {
    modulo: 'admision',
    nombre: 'Admisión',
    descripcion: 'Solicitudes, verificación y conversión a estudiantes',
    grupo: 'Admisiones y estudiantes',
    acciones: CRUD,
  },
  {
    modulo: 'preinscripcion',
    nombre: 'Preinscripción',
    descripcion: 'Registro y seguimiento de preinscripciones',
    grupo: 'Admisiones y estudiantes',
    acciones: CRUD,
  },
  {
    modulo: 'estudiantes',
    nombre: 'Estudiantes',
    descripcion: 'Datos, estadísticas e inscripción de estudiantes',
    grupo: 'Admisiones y estudiantes',
    acciones: CRUD,
  },
  {
    modulo: 'personas',
    nombre: 'Personas',
    descripcion: 'Datos personales usados por estudiantes y personal',
    grupo: 'Admisiones y estudiantes',
    acciones: CRUD,
  },
  {
    modulo: 'inscripciones',
    nombre: 'Inscripciones',
    descripcion: 'Inscripción de estudiantes a materias y grupos',
    grupo: 'Admisiones y estudiantes',
    acciones: CRUD,
  },
  {
    modulo: 'pagos',
    nombre: 'Pagos',
    descripcion: 'Pagos, conceptos y confirmación de cobros',
    grupo: 'Admisiones y estudiantes',
    acciones: CRUD,
  },
  {
    modulo: 'gestiones',
    nombre: 'Gestiones',
    descripcion: 'Periodos académicos y su apertura o cierre',
    grupo: 'Admisiones y estudiantes',
    acciones: CRUD,
  },
  {
    modulo: 'carreras',
    nombre: 'Carreras',
    descripcion: 'Catálogo de carreras del instituto',
    grupo: 'Admisiones y estudiantes',
    acciones: CRUD,
  },
  {
    modulo: 'materias',
    nombre: 'Materias',
    descripcion: 'Catálogo de materias y sus planes de estudio',
    grupo: 'Gestión académica',
    acciones: CRUD,
  },
  {
    modulo: 'planes_estudio',
    nombre: 'Planes de estudio',
    descripcion: 'Planes, niveles y materias por carrera',
    grupo: 'Gestión académica',
    acciones: CRUD,
  },
  {
    modulo: 'materias_impartidas',
    nombre: 'Materias impartidas',
    descripcion: 'Materias abiertas y asignación de docentes',
    grupo: 'Gestión académica',
    acciones: CRUD,
  },
  {
    modulo: 'grupos',
    nombre: 'Grupos y turnos',
    descripcion: 'Grupos, turnos y horarios académicos',
    grupo: 'Gestión académica',
    acciones: CRUD,
  },
  {
    modulo: 'convalidaciones',
    nombre: 'Convalidaciones',
    descripcion: 'Solicitudes y procesos de convalidación',
    grupo: 'Gestión académica',
    acciones: CRUD,
  },
  {
    modulo: 'personal',
    nombre: 'Personal',
    descripcion: 'Datos del personal docente y administrativo',
    grupo: 'Personal',
    acciones: CRUD,
  },
  {
    modulo: 'asistencias',
    nombre: 'Asistencias',
    descripcion: 'Marcaciones, historial y huellas del personal',
    grupo: 'Personal',
    acciones: CRUD,
  },
  {
    modulo: 'certificados',
    nombre: 'Certificados',
    descripcion: 'Emisión, consulta y verificación de certificados',
    grupo: 'Documentación y reportes',
    acciones: CRUD,
  },
  {
    modulo: 'documentos',
    nombre: 'Documentos',
    descripcion: 'Documentos institucionales y de estudiantes',
    grupo: 'Documentación y reportes',
    acciones: CRUD,
  },
  {
    modulo: 'credenciales',
    nombre: 'Credenciales',
    descripcion: 'Emisión de credenciales de estudiantes y personal',
    grupo: 'Documentación y reportes',
    acciones: CRUD,
  },
  {
    modulo: 'reportes',
    nombre: 'Reportes',
    descripcion: 'Acceso a los reportes y estadísticas del sistema',
    grupo: 'Documentación y reportes',
    acciones: [AccionPermiso.LEER],
  },
  {
    modulo: 'notificaciones',
    nombre: 'Notificaciones',
    descripcion: 'Avisos y notificaciones internas',
    grupo: 'Documentación y reportes',
    acciones: [AccionPermiso.LEER, AccionPermiso.CREAR],
  },
  {
    modulo: 'consentimiento',
    nombre: 'Consentimientos',
    descripcion: 'Consentimientos informados de personas',
    grupo: 'Documentación y reportes',
    acciones: [AccionPermiso.LEER, AccionPermiso.CREAR],
  },
  {
    modulo: 'almacenamiento',
    nombre: 'Archivos',
    descripcion: 'Subida, consulta y eliminación de archivos',
    grupo: 'Sistema',
    acciones: [AccionPermiso.LEER, AccionPermiso.CREAR, AccionPermiso.ELIMINAR],
  },
];

/**
 * Devuelve las acciones permitidas para un módulo del catálogo.
 */
export function accionesDelModulo(modulo: string): AccionPermiso[] | null {
  const encontrado = CATALOGO_PERMISOS.find((item) => item.modulo === modulo);
  return encontrado ? encontrado.acciones : null;
}
