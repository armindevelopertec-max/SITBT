'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/libreria/utilidades';
import { Search, X, ChevronDown } from 'lucide-react';

interface PropsSelectorBuscable {
  value: number | string;
  onChange: (value: string) => void;
  opciones: { value: string | number; etiqueta: string; textoBusqueda?: string }[];
  placeholder?: string;
  className?: string;
}

export function SelectorBuscable({
  value,
  onChange,
  opciones,
  placeholder = 'Buscar...',
  className,
}: PropsSelectorBuscable) {
  const [estaAbierto, setEstaAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const refEntrada = useRef<HTMLInputElement>(null);
  const refContenedor = useRef<HTMLDivElement>(null);

  const opcionSeleccionada = opciones.find(opcion => opcion.value.toString() === value.toString());

  const opcionesFiltradas = opciones.filter(opcion => {
    if (!busqueda) return true;
    const busquedaMinusculas = busqueda.toLowerCase();
    const coincideEtiqueta = opcion.etiqueta.toLowerCase().includes(busquedaMinusculas);
    const coincideBusqueda = opcion.textoBusqueda?.toLowerCase().includes(busquedaMinusculas);
    return coincideEtiqueta || coincideBusqueda;
  });

  useEffect(() => {
    const alHacerClicFuera = (evento: MouseEvent) => {
      if (refContenedor.current && !refContenedor.current.contains(evento.target as Node)) {
        setEstaAbierto(false);
        setBusqueda('');
      }
    };
    document.addEventListener('mousedown', alHacerClicFuera);
    return () => document.removeEventListener('mousedown', alHacerClicFuera);
  }, []);

  useEffect(() => {
    if (estaAbierto && refEntrada.current) {
      refEntrada.current.focus();
    }
  }, [estaAbierto]);

  const seleccionar = (valorOpcion: string | number) => {
    onChange(valorOpcion.toString());
    setEstaAbierto(false);
    setBusqueda('');
  };

  const limpiar = (evento: React.MouseEvent) => {
    evento.stopPropagation();
    onChange('');
  };

  return (
    <div ref={refContenedor} className={cn('relative w-full', className)}>
      <div
        className={cn(
          'flex items-center w-full rounded-lg border border-gray-300 bg-white px-3 py-2 cursor-pointer hover:border-gray-400 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500',
          'dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500 dark:focus-within:border-primary-400 dark:focus-within:ring-primary-400',
          estaAbierto && 'border-primary-500 ring-1 ring-primary-500 dark:border-primary-400 dark:ring-primary-400'
        )}
        onClick={() => setEstaAbierto(!estaAbierto)}
      >
        <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
        <span
          className={cn(
            'flex-1 truncate text-sm',
            !opcionSeleccionada && 'text-gray-400 dark:text-gray-500',
            opcionSeleccionada && 'text-gray-900 dark:text-gray-100',
          )}
        >
          {opcionSeleccionada?.etiqueta || placeholder}
        </span>
        {value && (
          <X
            className="w-4 h-4 text-gray-400 hover:text-gray-600 mr-1 flex-shrink-0 dark:hover:text-gray-200"
            onClick={limpiar}
          />
        )}
        <ChevronDown className={cn('w-4 h-4 text-gray-400 flex-shrink-0', estaAbierto && 'rotate-180')} />
      </div>

      {estaAbierto && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-gray-200 shadow-lg dark:bg-gray-800 dark:border-gray-700 dark:shadow-black/50">
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <input
              ref={refEntrada}
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Escribe para buscar..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary-500 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100 dark:focus:border-primary-400"
            />
          </div>

          <div className="max-h-48 overflow-y-auto scrollarea-tema">
            {opcionesFiltradas.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center dark:text-gray-400">
                No se encontraron materias
              </div>
            ) : (
              opcionesFiltradas.map((opcion) => (
                <div
                  key={opcion.value}
                  className={cn(
                    'px-4 py-2 cursor-pointer hover:bg-gray-50 text-sm text-gray-900 dark:text-gray-100 dark:hover:bg-gray-700',
                    opcion.value.toString() === value.toString() &&
                      'bg-primary-50 text-primary-600 dark:bg-primary-900/40 dark:text-primary-200'
                  )}
                  onClick={() => seleccionar(opcion.value)}
                >
                  {opcion.etiqueta}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
