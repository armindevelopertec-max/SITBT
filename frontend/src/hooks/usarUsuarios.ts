import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Rol } from '@/types';

export interface UsuarioRespuesta {
  id: number;
  username: string;
  status: 'activo' | 'inactivo' | 'bloqueado';
  person_id: number;
  persona?: {
    id: number;
    ci: string;
    names: string;
    lastname_paternal: string;
    lastname_maternal: string;
    email?: string;
  };
  roles?: Array<{
    id: number;
    code: string;
    name: string;
  }>;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUsuarioData {
  person_id: number;
  username: string;
  password: string;
  role_code?: Rol;
}

export interface UpdateUsuarioData {
  username?: string;
  status?: 'activo' | 'inactivo' | 'bloqueado';
  password?: string;
}

export interface DatosResetearContrasena {
  newPassword: string;
}

export function usarUsuarios() {
  const [users, setUsuarios] = useState<UsuarioRespuesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  const fetchUsuarios = useCallback(async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/usuarios?page=${page}&limit=${limit}`);
      const { data, total, page: currentPage, limit: currentLimit } = response.data;
      setUsuarios(data);
      setPagination({ page: currentPage, limit: currentLimit, total });
    } catch (err: any) {
      console.error('Error al obtener usuarios:', err);
      setError(err.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActiveUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/usuarios/active');
      setUsuarios(response.data);
    } catch (err: any) {
      console.error('Error al obtener usuarios activos:', err);
      setError(err.response?.data?.message || 'Error al cargar usuarios activos');
    } finally {
      setLoading(false);
    }
  }, []);

  const getUsuarioById = useCallback(async (id: number): Promise<UsuarioRespuesta | null> => {
    try {
      const response = await api.get(`/usuarios/${id}`);
      return response.data;
    } catch (err: any) {
      console.error('Error al obtener usuario:', err);
      return null;
    }
  }, []);

  const getUsuarioRoles = useCallback(async (userId: number) => {
    try {
      const response = await api.get(`/usuarios/${userId}/roles`);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching user roles:', err);
      return [];
    }
  }, []);

  const crearUsuario = useCallback(async (userData: CreateUsuarioData) => {
    try {
      setLoading(true);
      const response = await api.post('/usuarios', userData);
      await fetchUsuarios(pagination.page, pagination.limit);
      return response.data;
    } catch (err: any) {
      console.error('Error creating user:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsuarios, pagination.page, pagination.limit]);

  const actualizarUsuario = useCallback(async (id: number, userData: UpdateUsuarioData) => {
    try {
      setLoading(true);
      const response = await api.patch(`/usuarios/${id}`, userData);
      await fetchUsuarios(pagination.page, pagination.limit);
      return response.data;
    } catch (err: any) {
      console.error('Error updating user:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsuarios, pagination.page, pagination.limit]);

  const eliminarUsuario = useCallback(async (id: number) => {
    try {
      setLoading(true);
      await api.delete(`/usuarios/${id}`);
      await fetchUsuarios(pagination.page, pagination.limit);
    } catch (err: any) {
      console.error('Error deleting user:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsuarios, pagination.page, pagination.limit]);

  const cambiarContrasena = useCallback(async (id: number, newPassword: string) => {
    try {
      await api.post(`/usuarios/${id}/change-password`, { newPassword });
    } catch (err: any) {
      console.error('Error al cambiar contraseña:', err);
      throw err;
    }
  }, []);

  const asignarRol = useCallback(async (userId: number, roleId: number) => {
    try {
      await api.post(`/usuarios/${userId}/assign-role/${roleId}`);
    } catch (err: any) {
      console.error('Error al asignar rol:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  return {
    users,
    loading,
    error,
    pagination,
    refetch: () => fetchUsuarios(pagination.page, pagination.limit),
    fetchUsuarios,
    fetchActiveUsuarios,
    getUsuarioById,
    getUsuarioRoles,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    cambiarContrasena,
    asignarRol,
  };
}
