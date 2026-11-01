import { useCallback, useEffect, useState } from 'react';
import api from '@/libreria/api';
import { mensajeDeError } from '@/libreria/utilidades';
import { RolSistema } from '@/tipos';

export interface CrearRolDatos {
  codigo: string;
  nombre: string;
  descripcion?: string;
  estado?: 'activo' | 'inactivo';
}

export type ActualizarRolDatos = Partial<Omit<CrearRolDatos, 'codigo'>>;

export function usarRoles() {
  const [roles, setRoles] = useState<RolSistema[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const obtenerRoles = useCallback(async (silencioso = false) => {
    try {
      if (!silencioso) {
        setCargando(true);
      }
      setError(null);
      const respuesta = await api.get('/roles', {
        params: { pagina: 1, limite: 200 },
      });
      setRoles(respuesta.data?.datos ?? []);
    } catch (err: any) {
      setError(mensajeDeError(err, 'Error al cargar los roles'));
    } finally {
      if (!silencioso) {
        setCargando(false);
      }
    }
  }, []);

  useEffect(() => {
    obtenerRoles();
  }, [obtenerRoles]);

  const crearRol = useCallback(
    async (datos: CrearRolDatos) => {
      const respuesta = await api.post('/roles', datos);
      await obtenerRoles(true);
      return respuesta.data as RolSistema;
    },
    [obtenerRoles],
  );

  const actualizarRol = useCallback(
    async (id: number, datos: ActualizarRolDatos) => {
      const respuesta = await api.patch(`/roles/${id}`, datos);
      await obtenerRoles(true);
      return respuesta.data as RolSistema;
    },
    [obtenerRoles],
  );

  const eliminarRol = useCallback(
    async (id: number) => {
      await api.delete(`/roles/${id}`);
      await obtenerRoles(true);
    },
    [obtenerRoles],
  );

  return {
    roles,
    cargando,
    error,
    recargar: obtenerRoles,
    crearRol,
    actualizarRol,
    eliminarRol,
  };
}
