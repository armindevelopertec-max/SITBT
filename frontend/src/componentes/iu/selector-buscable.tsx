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
          estaAbierto && 'border-primary-500 ring-1 ring-primary-500'
        )}
        onClick={() => setEstaAbierto(!estaAbierto)}
      >
        <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
        <span className={cn('flex-1 truncate text-sm', !opcionSeleccionada && 'text-gray-400')}>
          {opcionSeleccionada?.etiqueta || placeholder}
        </span>
        {value && (
          <X
            className="w-4 h-4 text-gray-400 hover:text-gray-600 mr-1 flex-shrink-0"
            onClick={limpiar}
          />
        )}
        <ChevronDown className={cn('w-4 h-4 text-gray-400 flex-shrink-0', estaAbierto && 'rotate-180')} />
      </div>

      {estaAbierto && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-gray-200 shadow-lg">
          <div className="p-2 border-b border-gray-100">
            <input
              ref={refEntrada}
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Escribe para buscar..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="max-h-48 overflow-y-auto">
            {opcionesFiltradas.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No se encontraron materias
              </div>
            ) : (
              opcionesFiltradas.map((opcion) => (
                <div
                  key={opcion.value}
                  className={cn(
                    'px-4 py-2 cursor-pointer hover:bg-gray-50 text-sm',
                    opcion.value.toString() === value.toString() && 'bg-primary-50 text-primary-600'
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
