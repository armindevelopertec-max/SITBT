import { api } from '@/libreria/api';
import { useState } from 'react';
import { RegistroConsentimiento } from '@/tipos';

export function usarConsentimiento() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registrarConsentimiento = async (datos: {
    estudianteId: number;
    versionPolitica: string;
    nombreTutor?: string;
    ciTutor?: string;
    firmaBase64?: string;
  }): Promise<RegistroConsentimiento> => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await api.post<RegistroConsentimiento>('/consentimiento', datos);
      return respuesta.data;
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al registrar consentimiento');
      throw err;
    } finally {
      setCargando(false);
    }
  };

  const obtenerConsentimientoPorEstudiante = async (estudianteId: number): Promise<RegistroConsentimiento[]> => {
    const respuesta = await api.get<RegistroConsentimiento[]>(`/consentimiento/estudiante/${estudianteId}`);
    return respuesta.data;
  };

  const obtenerUltimoConsentimiento = async (estudianteId: number): Promise<RegistroConsentimiento | null> => {
    try {
      const respuesta = await api.get<RegistroConsentimiento | null>(`/consentimiento/estudiante/${estudianteId}/ultimo`);
      return respuesta.data;
    } catch {
      return null;
    }
  };

  const tieneConsentimientoValido = async (estudianteId: number, version: string): Promise<boolean> => {
    const respuesta = await api.get<boolean>(`/consentimiento/verificar/${estudianteId}/${version}`);
    return respuesta.data;
  };

  return {
    registrarConsentimiento,
    obtenerConsentimientoPorEstudiante,
    obtenerUltimoConsentimiento,
    tieneConsentimientoValido,
    cargando,
    error,
  };
}
