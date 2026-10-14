import { useState, useEffect } from 'react';
import { api, publicApi } from '@/lib/api';
import { SolicitudAdmision, CrearAdmisionDto, Carrera } from '@/types';

export function usePublicAdmission() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPreRegistro = async (data: CrearAdmisionDto): Promise<SolicitudAdmision> => {
    setLoading(true);
    setError(null);
    try {
      const response = await publicApi.post<SolicitudAdmision>('/admision', data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al crear pre-registro');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCarreras = async (): Promise<Carrera[]> => {
    try {
      const response = await publicApi.get<{ datos: Carrera[] }>('/carreras?estado=activo');
      return response.data.datos;
    } catch (err) {
      console.error('Error fetching carreras:', err);
      return [];
    }
  };

  return {
    createPreRegistro,
    getCarreras,
    loading,
    error,
  };
}

export function usarAdmision() {
  const [requests, setRequests] = useState<SolicitudAdmision[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchRequests = async (params?: {
    page?: number;
    limit?: number;
    estado?: string;
    origen?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<{
        datos: SolicitudAdmision[];
        total: number;
        pagina: number;
        limite: number;
      }>('/admision', { params });
      setRequests(response.data.datos);
      setTotal(response.data.total);
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al obtener solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const getRequest = async (id: string): Promise<SolicitudAdmision> => {
    const response = await api.get<SolicitudAdmision>(`/admision/${id}`);
    return response.data;
  };

  const verifyRequest = async (id: string, verificadoPor: number, observaciones?: string) => {
    const response = await api.post(`/admision/${id}/verificar`, { verificadoPor, observaciones });
    return response.data;
  };

  const rejectRequest = async (id: string, verificadoPor: number, observaciones: string) => {
    const response = await api.post(`/admision/${id}/rechazar`, { verificadoPor, observaciones });
    return response.data;
  };

  const convertToStudent = async (id: string, admissionGestion: string) => {
    const response = await api.post(`/admision/${id}/convertir-estudiante`, { admissionGestion });
    return response.data;
  };

  const getStatistics = async () => {
    const response = await api.get('/admision/estadisticas');
    return response.data;
  };

  return {
    requests,
    loading,
    error,
    total,
    fetchRequests,
    getRequest,
    verifyRequest,
    rejectRequest,
    convertToStudent,
    getStatistics,
  };
}
