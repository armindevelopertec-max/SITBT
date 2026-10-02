'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface InstitutionSettings {
  nombre: string;
  nombre_corto: string;
  lema: string;
  logo_url: string;
  direccion: string;
  telefono: string;
  email: string;
  ciudad: string;
  pais: string;
}

interface InstitutionContextType {
  institution: InstitutionSettings | null;
  loading: boolean;
}

const InstitutionContext = createContext<InstitutionContextType>({
  institution: null,
  loading: true,
});

export function useInstitution() {
  return useContext(InstitutionContext);
}

export function InstitutionProvider({ children }: { children: ReactNode }) {
  const [institution, setInstitution] = useState<InstitutionSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstitution = async () => {
      try {
        const response = await fetch('http://localhost:4000/institution-settings/public');
        const data = await response.json();
        setInstitution(data);
      } catch (error) {
        console.error('Error fetching institution:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInstitution();
  }, []);

  return (
    <InstitutionContext.Provider value={{ institution, loading }}>
      {children}
    </InstitutionContext.Provider>
  );
}
