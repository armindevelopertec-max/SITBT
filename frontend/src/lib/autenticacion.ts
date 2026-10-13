import { Usuario, Rol } from '@/types';

export const ROLES: Record<Rol, { label: string; color: string }> = {
  administrador: { label: 'Administrador', color: 'bg-red-100 text-red-800' },
  secretaria: { label: 'Secretaria', color: 'bg-pink-100 text-pink-800' },
  director_academico: { label: 'Director Académico', color: 'bg-purple-100 text-purple-800' },
  rector: { label: 'Rector', color: 'bg-indigo-100 text-indigo-800' },
  docente: { label: 'Docente', color: 'bg-blue-100 text-blue-800' },
  estudiante: { label: 'Estudiante', color: 'bg-green-100 text-green-800' },
  apoyo: { label: 'Apoyo', color: 'bg-gray-100 text-gray-800' },
};

export const etiquetaRol = (rol: Rol): string => {
  return ROLES[rol]?.label || rol;
};

export const colorRol = (rol: Rol): string => {
  return ROLES[rol]?.color || 'bg-gray-100 text-gray-800';
};

export const formatearNombreRol = (usuario: Usuario): string => {
  return etiquetaRol(usuario.rol);
};
