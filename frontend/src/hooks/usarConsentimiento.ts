import { api } from '@/lib/api';
import { useState } from 'react';
import { RegistroConsentimiento } from '@/types';

export function usarConsentimiento() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createConsent = async (data: {
    estudianteId: number;
    versionPolitica: string;
    nombreTutor?: string;
    ciTutor?: string;
    firmaBase64?: string;
  }): Promise<RegistroConsentimiento> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<RegistroConsentimiento>('/consentimiento', data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar consentimiento');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getConsentByStudent = async (estudianteId: number): Promise<RegistroConsentimiento[]> => {
    const response = await api.get<RegistroConsentimiento[]>(`/consentimiento/student/${estudianteId}`);
    return response.data;
  };

  const getLatestConsent = async (estudianteId: number): Promise<RegistroConsentimiento | null> => {
    try {
      const response = await api.get<RegistroConsentimiento | null>(`/consentimiento/student/${estudianteId}/latest`);
      return response.data;
    } catch {
      return null;
    }
  };

  const hasValidConsent = async (estudianteId: number, version: string): Promise<boolean> => {
    const response = await api.get<boolean>(`/consentimiento/check/${estudianteId}/${version}`);
    return response.data;
  };

  return {
    createConsent,
    getConsentByStudent,
    getLatestConsent,
    hasValidConsent,
    loading,
    error,
  };
}
