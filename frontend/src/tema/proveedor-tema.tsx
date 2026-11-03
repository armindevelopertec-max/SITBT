'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Tema = 'claro' | 'oscuro' | 'sistema';

interface ContextoTema {
  tema: Tema;
  establecerTema: (tema: Tema) => void;
}

const ContextoTema = createContext<ContextoTema | undefined>(undefined);

const CLAVE_TEMA = 'sitbt-tema';
const CLAVE_COLOR_ANTERIOR = 'sitbt-color-primario';

function aplicarTema(tema: Tema) {
  if (typeof window === 'undefined') return;
  const raiz = document.documentElement;
  const esOscuro =
    tema === 'oscuro' ||
    (tema === 'sistema' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  raiz.classList.remove('claro', 'oscuro', 'dark');
  raiz.classList.add(esOscuro ? 'dark' : 'claro');
}

export function ProveedorTema({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>('claro');
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    const temaGuardado = localStorage.getItem(CLAVE_TEMA) as Tema | null;
    if (
      temaGuardado === 'claro' ||
      temaGuardado === 'oscuro' ||
      temaGuardado === 'sistema'
    ) {
      setTema(temaGuardado);
    }

    // El color principal ya no es configurable: siempre es cian.
    localStorage.removeItem(CLAVE_COLOR_ANTERIOR);
    setCargado(true);
  }, []);

  useEffect(() => {
    if (!cargado) return;
    aplicarTema(tema);
    localStorage.setItem(CLAVE_TEMA, tema);
  }, [tema, cargado]);

  useEffect(() => {
    if (tema !== 'sistema') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const actualizar = () => aplicarTema('sistema');

    mq.addEventListener('change', actualizar);
    return () => mq.removeEventListener('change', actualizar);
  }, [tema]);

  const establecerTema = (nuevoTema: Tema) => setTema(nuevoTema);

  return (
    <ContextoTema.Provider value={{ tema, establecerTema }}>
      {children}
    </ContextoTema.Provider>
  );
}

export function usarTema() {
  const contexto = useContext(ContextoTema);
  if (!contexto) throw new Error('usarTema debe usarse dentro de ProveedorTema');
  return contexto;
}
