import { useState, useEffect } from 'react';
import { api, publicApi } from '@/lib/api';
import { AdmissionRequest, CreateAdmissionDto, Career } from '@/types';

export function usePublicAdmission() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPreRegistro = async (data: CreateAdmissionDto): Promise<AdmissionRequest> => {
    setLoading(true);
    setError(null);
    try {
      const response = await publicApi.post<AdmissionRequest>('/admission', data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear pre-registro');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCareers = async (): Promise<Career[]> => {
    try {
      const response = await publicApi.get<{ data: Career[] }>('/carreras?estado=activo');
      return response.data.data;
    } catch (err) {
      console.error('Error fetching careers:', err);
      return [];
    }
  };

  return {
    createPreRegistro,
    getCareers,
    loading,
    error,
  };
}

export function useAdmission() {
  const [requests, setRequests] = useState<AdmissionRequest[]>([]);
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
        data: AdmissionRequest[];
        total: number;
        page: number;
        limit: number;
      }>('/admission', { params });
      setRequests(response.data.data);
      setTotal(response.data.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const getRequest = async (id: string): Promise<AdmissionRequest> => {
    const response = await api.get<AdmissionRequest>(`/admission/${id}`);
    return response.data;
  };

  const verifyRequest = async (id: string, verificadoPor: number, observaciones?: string) => {
    const response = await api.post(`/admission/${id}/verify`, { verificadoPor, observaciones });
    return response.data;
  };

  const rejectRequest = async (id: string, verificadoPor: number, observaciones: string) => {
    const response = await api.post(`/admission/${id}/reject`, { verificadoPor, observaciones });
    return response.data;
  };

  const convertToStudent = async (id: string, admissionGestion: string) => {
    const response = await api.post(`/admission/${id}/convert-to-student`, { admissionGestion });
    return response.data;
  };

  const getStatistics = async () => {
    const response = await api.get('/admission/statistics');
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
