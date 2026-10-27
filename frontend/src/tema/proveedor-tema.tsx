'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Tema = 'claro' | 'oscuro' | 'sistema';
type ColorPrimario =
  | 'azul'
  | 'verde'
  | 'violeta'
  | 'rojo'
  | 'naranja'
  | 'cian'
  | 'rosa'
  | 'ambar';

interface OpcionesTema {
  tema: Tema;
  colorPrimario: ColorPrimario;
}

interface ContextoTema {
  tema: Tema;
  temaEfectivo: 'claro' | 'oscuro';
  colorPrimario: ColorPrimario;
  establecerTema: (tema: Tema) => void;
  establecerColorPrimario: (color: ColorPrimario) => void;
}

const ContextoTema = createContext<ContextoTema | undefined>(undefined);

const CLAVE_TEMA = 'sitbt-tema';
const CLAVE_COLOR = 'sitbt-color-primario';

const COLORES_PRIMARIOS: Record<ColorPrimario, { claro: string; oscuro: string }> = {
  azul: { claro: '221.2 83.2% 53.3%', oscuro: '217.2 91.2% 59.8%' },
  verde: { claro: '142.1 76.2% 36.3%', oscuro: '142.1 70.6% 45.3%' },
  violeta: { claro: '262.1 83.3% 57.8%', oscuro: '263.4 70% 65.1%' },
  rojo: { claro: '0 72.2% 50.6%', oscuro: '0 72.2% 50.6%' },
  naranja: { claro: '24.6 95% 53.1%', oscuro: '20.5 90.2% 48.2%' },
  cian: { claro: '189.5 94.5% 42.7%', oscuro: '189.5 94.5% 42.7%' },
  rosa: { claro: '346.8 77.2% 49.8%', oscuro: '346.8 77.2% 49.8%' },
  ambar: { claro: '45.4 93.4% 47.5%', oscuro: '43.3 96.4% 56.3%' },
};

function aplicarTema(tema: Tema, colorPrimario: ColorPrimario) {
  if (typeof window === 'undefined') return;
  const raiz = document.documentElement;
  const esOscuro =
    tema === 'oscuro' || (tema === 'sistema' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  raiz.classList.remove('claro', 'oscuro', 'dark');
  raiz.classList.add(esOscuro ? 'dark' : 'claro');

  const colores = COLORES_PRIMARIOS[colorPrimario];
  raiz.style.setProperty('--primary', esOscuro ? colores.oscuro : colores.claro);
  raiz.style.setProperty('--ring', esOscuro ? colores.oscuro : colores.claro);
}

export function ProveedorTema({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>('claro');
  const [colorPrimario, setColorPrimario] = useState<ColorPrimario>('azul');
  const [temaEfectivo, setTemaEfectivo] = useState<'claro' | 'oscuro'>('claro');
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    const temaGuardado = localStorage.getItem(CLAVE_TEMA) as Tema | null;
    const colorGuardado = localStorage.getItem(CLAVE_COLOR) as ColorPrimario | null;
    if (temaGuardado === 'claro' || temaGuardado === 'oscuro' || temaGuardado === 'sistema') {
      setTema(temaGuardado);
    }
    if (colorGuardado && colorGuardado in COLORES_PRIMARIOS) {
      setColorPrimario(colorGuardado);
    }
    setCargado(true);
  }, []);

  useEffect(() => {
    if (!cargado) return;
    const esOscuro =
      tema === 'oscuro' || (tema === 'sistema' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setTemaEfectivo(esOscuro ? 'oscuro' : 'claro');
    aplicarTema(tema, colorPrimario);
    localStorage.setItem(CLAVE_TEMA, tema);
    localStorage.setItem(CLAVE_COLOR, colorPrimario);
  }, [tema, colorPrimario, cargado]);

  useEffect(() => {
    if (tema !== 'sistema') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const actualizar = () => aplicarTema('sistema', colorPrimario);
    mq.addEventListener('change', actualizar);
    return () => mq.removeEventListener('change', actualizar);
  }, [tema, colorPrimario]);

  const establecerTema = (nuevoTema: Tema) => setTema(nuevoTema);
  const establecerColorPrimario = (color: ColorPrimario) => setColorPrimario(color);

  return (
    <ContextoTema.Provider value={{ tema, temaEfectivo, colorPrimario, establecerTema, establecerColorPrimario }}>
      {children}
    </ContextoTema.Provider>
  );
}

export function usarTema() {
  const contexto = useContext(ContextoTema);
  if (!contexto) throw new Error('usarTema debe usarse dentro de ProveedorTema');
  return contexto;
}

export const coloresPrimariosDisponibles: { valor: ColorPrimario; etiqueta: string }[] = [
  { valor: 'azul', etiqueta: 'Azul' },
  { valor: 'verde', etiqueta: 'Verde' },
  { valor: 'violeta', etiqueta: 'Violeta' },
  { valor: 'rojo', etiqueta: 'Rojo' },
  { valor: 'naranja', etiqueta: 'Naranja' },
  { valor: 'cian', etiqueta: 'Cian' },
  { valor: 'rosa', etiqueta: 'Rosa' },
  { valor: 'ambar', etiqueta: 'Ámbar' },
];
