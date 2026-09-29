import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Role } from '@/types';

export interface UserResponse {
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

export interface CreateUserData {
  person_id: number;
  username: string;
  password: string;
  role_code?: Role;
}

export interface UpdateUserData {
  username?: string;
  status?: 'activo' | 'inactivo' | 'bloqueado';
  password?: string;
}

export interface ResetPasswordData {
  newPassword: string;
}

export function useUsers() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  const fetchUsers = useCallback(async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/usuarios?page=${page}&limit=${limit}`);
      const { data, total, page: currentPage, limit: currentLimit } = response.data;
      setUsers(data);
      setPagination({ page: currentPage, limit: currentLimit, total });
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActiveUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/usuarios/active');
      setUsers(response.data);
    } catch (err: any) {
      console.error('Error fetching active users:', err);
      setError(err.response?.data?.message || 'Error al cargar usuarios activos');
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserById = useCallback(async (id: number): Promise<UserResponse | null> => {
    try {
      const response = await api.get(`/usuarios/${id}`);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching user:', err);
      return null;
    }
  }, []);

  const getUserRoles = useCallback(async (userId: number) => {
    try {
      const response = await api.get(`/usuarios/${userId}/roles`);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching user roles:', err);
      return [];
    }
  }, []);

  const createUser = useCallback(async (userData: CreateUserData) => {
    try {
      setLoading(true);
      const response = await api.post('/usuarios', userData);
      await fetchUsers(pagination.page, pagination.limit);
      return response.data;
    } catch (err: any) {
      console.error('Error creating user:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, pagination.page, pagination.limit]);

  const updateUser = useCallback(async (id: number, userData: UpdateUserData) => {
    try {
      setLoading(true);
      const response = await api.patch(`/usuarios/${id}`, userData);
      await fetchUsers(pagination.page, pagination.limit);
      return response.data;
    } catch (err: any) {
      console.error('Error updating user:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, pagination.page, pagination.limit]);

  const deleteUser = useCallback(async (id: number) => {
    try {
      setLoading(true);
      await api.delete(`/usuarios/${id}`);
      await fetchUsers(pagination.page, pagination.limit);
    } catch (err: any) {
      console.error('Error deleting user:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, pagination.page, pagination.limit]);

  const changePassword = useCallback(async (id: number, newPassword: string) => {
    try {
      await api.post(`/usuarios/${id}/change-password`, { newPassword });
    } catch (err: any) {
      console.error('Error changing password:', err);
      throw err;
    }
  }, []);

  const assignRole = useCallback(async (userId: number, roleId: number) => {
    try {
      await api.post(`/usuarios/${userId}/assign-role/${roleId}`);
    } catch (err: any) {
      console.error('Error assigning role:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    pagination,
    refetch: () => fetchUsers(pagination.page, pagination.limit),
    fetchUsers,
    fetchActiveUsers,
    getUserById,
    getUserRoles,
    createUser,
    updateUser,
    deleteUser,
    changePassword,
    assignRole,
  };
}
