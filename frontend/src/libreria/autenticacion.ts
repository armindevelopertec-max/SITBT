import { Usuario, Rol } from '@/tipos';

/**
 * Etiquetas y colores sugeridos para los roles conocidos del sistema.
 * Los roles son configurables desde /roles: si un rol no está en esta tabla
 * se muestra su código con el estilo por defecto.
 */
export const ROLES: Record<string, { etiqueta: string; color: string }> = {
  administrador: { etiqueta: 'Administrador', color: 'bg-red-100 text-red-800' },
  secretaria: { etiqueta: 'Secretaria', color: 'bg-pink-100 text-pink-800' },
  director_academico: { etiqueta: 'Director Académico', color: 'bg-purple-100 text-purple-800' },
  rector: { etiqueta: 'Rector', color: 'bg-indigo-100 text-indigo-800' },
  docente: { etiqueta: 'Docente', color: 'bg-blue-100 text-blue-800' },
  estudiante: { etiqueta: 'Estudiante', color: 'bg-green-100 text-green-800' },
  apoyo: { etiqueta: 'Apoyo', color: 'bg-gray-100 text-gray-800' },
};

export const etiquetaRol = (rol: Rol): string => {
  return ROLES[rol]?.etiqueta || rol;
};

export const colorRol = (rol: Rol): string => {
  return ROLES[rol]?.color || 'bg-gray-100 text-gray-800';
};

export const formatearNombreRol = (usuario: Usuario): string => {
  return etiquetaRol(usuario.rol);
};

/** Códigos de rol del usuario, contemplando el rol principal y la lista. */
export const codigosRol = (usuario?: Usuario | null): string[] => {
  if (!usuario) return [];
  if (usuario.roles && usuario.roles.length > 0) {
    return usuario.roles.map((rol: any) => rol.codigo || rol);
  }
  return usuario.rol ? [usuario.rol] : [];
};

/**
 * Un docente "puro" es quien tiene el rol docente y no es administrador.
 * Solo ese perfil entra a la interfaz /docente.
 */
export const esDocentePuro = (usuario?: Usuario | null): boolean => {
  const roles = codigosRol(usuario);
  return roles.includes('docente') && !roles.includes('administrador');
};

/** Roles que pertenecen al panel administrativo o a la docencia. */
const ROLES_INTERNOS = [
  'administrador',
  'secretaria',
  'director_academico',
  'rector',
  'docente',
  'apoyo',
];

/**
 * Un estudiante "puro" es quien tiene el rol estudiante y ningún rol interno.
 * Solo ese perfil entra a la interfaz /estudiante.
 */
export const esEstudiantePuro = (usuario?: Usuario | null): boolean => {
  const roles = codigosRol(usuario);
  return (
    roles.includes('estudiante') &&
    !roles.some((rol) => ROLES_INTERNOS.includes(rol))
  );
};

/** Indica si el usuario tiene una interfaz propia distinta al panel. */
export const tienePortalPropio = (usuario?: Usuario | null): boolean => {
  return esDocentePuro(usuario) || esEstudiantePuro(usuario);
};

/** Ruta de inicio según el perfil del usuario. */
export const rutaInicio = (usuario?: Usuario | null): string => {
  if (esDocentePuro(usuario)) return '/docente';
  if (esEstudiantePuro(usuario)) return '/estudiante';
  return '/panel';
};
