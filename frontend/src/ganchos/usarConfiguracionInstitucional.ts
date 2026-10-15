import { useEffect, useState } from 'react';
import api from '@/libreria/api';

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
  const [configuracion, setConfiguracion] = useState<ConfiguracionInstitucional | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const obtenerConfiguracion = async () => {
    try {
      setCargando(true);
      setError(null);
      const respuesta = await api.get('/configuracion-institucional/publico');
      setConfiguracion(respuesta.data);
    } catch (err: any) {
      console.error('Error al cargar la configuración institucional:', err);
      setError(err.response?.data?.mensaje || 'Error al cargar configuración');
      setConfiguracion({
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
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerConfiguracion();
  }, []);

  return {
    configuracion,
    cargando,
    error,
    recargar: obtenerConfiguracion,
  };
}
