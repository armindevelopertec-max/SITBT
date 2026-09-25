import { useEffect, useState } from 'react';
import api from '@/lib/api';

export interface InstitutionSettings {
  nombre: string;
  nombre_corto: string;
  lema: string | null;
  logo_url: string | null;
  direccion: string | null;
  telefono: string | null;
  departamento: string | null;
  email: string | null;
  website: string | null;
  ciudad: string | null;
  pais: string;
  descripcion: string | null;
}

export function useInstitutionSettings() {
  const [settings, setSettings] = useState<InstitutionSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/institution-settings/public');
      setSettings(response.data);
    } catch (err: any) {
      console.error('Error fetching institution settings:', err);
      setError(err.response?.data?.message || 'Error al cargar configuración');
      setSettings({
        nombre: 'Instituto Tecnológico Boliviana de Tecnología',
        nombre_corto: 'SITBT',
        lema: null,
        logo_url: null,
        direccion: null,
        telefono: null,
        departamento: null,
        email: null,
        website: null,
        ciudad: null,
        pais: 'Bolivia',
        descripcion: null,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
  };
}
