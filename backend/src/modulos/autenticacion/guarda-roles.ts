import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AccionPermiso } from '../../entidades/permiso.entidad';

/**
 * Autoriza las peticiones autenticadas según los permisos por módulo y
 * acción que el administrador asigna a cada rol.
 *
 * El rol `administrador` conserva acceso total. Los módulos de gestión de
 * usuarios, roles, permisos, auditoría y configuración institucional siguen
 * siendo exclusivos del administrador para evitar escaladas de privilegios.
 *
 * Debe usarse siempre después de GuardaJwt:
 *
 *   @UseGuards(GuardaJwt, GuardaRoles)
 */
@Injectable()
export class GuardaRoles implements CanActivate {
  private static readonly PREFIJOS_SOLO_ADMIN = new Set([
    'usuarios',
    'roles',
    'permisos',
    'auditoria',
    'configuracion-institucional',
  ]);

  private static readonly MODULOS_POR_RUTA: Record<string, string> = {
    admision: 'admision',
    estudiantes: 'estudiantes',
    preinscripcion: 'preinscripcion',
    pagos: 'pagos',
    'conceptos-pago': 'pagos',
    'materias-impartidas': 'materias_impartidas',
    'asignaciones-docentes': 'materias_impartidas',
    grupos: 'grupos',
    turnos: 'grupos',
    personal: 'personal',
    'asistencias-personal': 'asistencias',
    'huellas-personal': 'asistencias',
    certificados: 'certificados',
    documentos: 'documentos',
    credenciales: 'credenciales',
    personas: 'personas',
    materias: 'materias',
    carreras: 'carreras',
    gestiones: 'gestiones',
    inscripciones: 'inscripciones',
    'planes-estudio': 'planes_estudio',
    convalidaciones: 'convalidaciones',
    'convalidaciones-planes': 'convalidaciones',
    notificaciones: 'notificaciones',
    consentimiento: 'consentimiento',
    almacenamiento: 'almacenamiento',
  };

  private static readonly ACCION_POR_METODO: Record<string, AccionPermiso> = {
    GET: AccionPermiso.LEER,
    HEAD: AccionPermiso.LEER,
    OPTIONS: AccionPermiso.LEER,
    POST: AccionPermiso.CREAR,
    PATCH: AccionPermiso.ACTUALIZAR,
    PUT: AccionPermiso.ACTUALIZAR,
    DELETE: AccionPermiso.ELIMINAR,
  };

  canActivate(contexto: ExecutionContext): boolean {
    const peticion = contexto.switchToHttp().getRequest();
    const rolesUsuario: string[] = peticion.user?.roles ?? [];

    if (rolesUsuario.includes('administrador')) {
      return true;
    }

    const segmentos = this.obtenerSegmentos(peticion.path ?? peticion.url ?? '');
    const prefijo = segmentos[0] ?? '';
    const resto = segmentos.slice(1);

    if (prefijo === 'autenticacion' && resto[0] === 'registrar') {
      throw new ForbiddenException(
        'Solo el administrador puede registrar usuarios',
      );
    }

    if (GuardaRoles.PREFIJOS_SOLO_ADMIN.has(prefijo)) {
      throw new ForbiddenException(
        'Esta sección es exclusiva del administrador',
      );
    }

    const modulo = GuardaRoles.MODULOS_POR_RUTA[prefijo] ?? prefijo.replace(/-/g, '_');
    const metodo = String(peticion.method ?? 'GET').toUpperCase();
    let accion = GuardaRoles.ACCION_POR_METODO[metodo] ?? AccionPermiso.LEER;

    // Los POST sobre un recurso concreto (por ejemplo /admision/5/verificar)
    // se consideran actualizaciones y no creaciones.
    if (metodo === 'POST' && resto.length > 0 && /^\d+$/.test(resto[0])) {
      accion = AccionPermiso.ACTUALIZAR;
    }

    const permisosUsuario: string[] = peticion.user?.permisos ?? [];
    const clave = `${modulo}:${accion}`;

    if (!permisosUsuario.includes(clave)) {
      throw new ForbiddenException(
        `No tienes el permiso "${clave}" para realizar esta acción`,
      );
    }

    return true;
  }

  private obtenerSegmentos(ruta: string): string[] {
    return ruta
      .replace(/^\/api(?:\/|$)/, '')
      .split('/')
      .filter(Boolean);
  }
}
