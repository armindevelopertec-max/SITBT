import { api } from '@/lib/api';
import { useState } from 'react';
import { ConsentRecord } from '@/types';

export function useConsent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createConsent = async (data: {
    estudiante_id: number;
    versionPolitica: string;
    nombreTutor?: string;
    ciTutor?: string;
    firmaBase64?: string;
  }): Promise<ConsentRecord> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<ConsentRecord>('/consent', data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar consentimiento');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getConsentByStudent = async (estudianteId: number): Promise<ConsentRecord[]> => {
    const response = await api.get<ConsentRecord[]>(`/consent/student/${estudianteId}`);
    return response.data;
  };

  const getLatestConsent = async (estudianteId: number): Promise<ConsentRecord | null> => {
    try {
      const response = await api.get<ConsentRecord | null>(`/consent/student/${estudianteId}/latest`);
      return response.data;
    } catch {
      return null;
    }
  };

  const hasValidConsent = async (estudianteId: number, version: string): Promise<boolean> => {
    const response = await api.get<boolean>(`/consent/check/${estudianteId}/${version}`);
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
