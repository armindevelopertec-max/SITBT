import { useEffect, useState } from 'react';
import api from '@/lib/api';

export interface ConfiguracionInstitucional {
  nombre: string;
  nombreCorto: string;
  lema: string | null;
  logoUrl: string | null;
  direccion: string | null;
  telefono: string | null;
  departamento: string | null;
  correo: string | null;
  sitioWeb: string | null;
  ciudad: string | null;
  pais: string;
  descripcion: string | null;
}

export function usarConfiguracionInstitucional() {
  const [settings, setSettings] = useState<ConfiguracionInstitucional | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/configuracion-institucional/public');
      setSettings(response.data);
    } catch (err: any) {
      console.error('Error al cargar la configuración institucional:', err);
      setError(err.response?.data?.message || 'Error al cargar configuración');
      setSettings({
        nombre: 'Instituto Tecnológico Boliviana de Tecnología',
        nombreCorto: 'SITBT',
        lema: null,
        logoUrl: null,
        direccion: null,
        telefono: null,
        departamento: null,
        correo: null,
        sitioWeb: null,
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
