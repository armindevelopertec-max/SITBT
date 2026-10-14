'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { publicApi } from '@/lib/api';

interface ConfiguracionInstitucional {
  nombre: string;
  nombreCorto: string;
  lema: string;
  logoUrl: string;
  direccion: string;
  telefono: string;
  correo: string;
  ciudad: string;
  pais: string;
}

interface TipoContextoInstitucional {
  institucion: ConfiguracionInstitucional | null;
  cargando: boolean;
}

const ContextoInstitucional = createContext<TipoContextoInstitucional>({
  institucion: null,
  cargando: true,
});

export function usarInstitucion() {
  return useContext(ContextoInstitucional);
}

export function ProveedorInstitucion({ children }: { children: ReactNode }) {
  const [institucion, setInstitucion] = useState<ConfiguracionInstitucional | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerInstitucion = async () => {
      try {
        const response = await publicApi.get('/configuracion-institucional/public');
        setInstitucion(response.data);
      } catch (error) {
        console.error('Error al obtener institución:', error);
      } finally {
        setCargando(false);
      }
    };
    obtenerInstitucion();
  }, []);

  return (
    <ContextoInstitucional.Provider value={{ institucion, cargando }}>
      {children}
    </ContextoInstitucional.Provider>
  );
}
