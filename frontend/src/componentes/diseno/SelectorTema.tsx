'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { usarTema } from '@/tema/proveedor-tema';
import { cn } from '@/libreria/utilidades';

const opcionesTema = [
  { valor: 'claro', etiqueta: 'Claro', icono: Sun },
  { valor: 'oscuro', etiqueta: 'Oscuro', icono: Moon },
  { valor: 'sistema', etiqueta: 'Sistema', icono: Monitor },
] as const;

interface PropsSelectorTema {
  /** 'panel' para el encabezado interno, 'publico' para el sitio institucional. */
  variante?: 'panel' | 'publico';
  className?: string;
}

/**
 * Selector de tema con las opciones Claro, Oscuro y Sistema.
 * Se usa en el encabezado del panel y en el sitio público.
 */
export function SelectorTema({ variante = 'panel', className }: PropsSelectorTema) {
  const { tema, establecerTema } = usarTema();

  const contenedor = cn(
    'flex items-center rounded-lg border p-0.5',
    variante === 'publico'
      ? 'border-dark-600 bg-dark-700/60'
      : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50',
    className
  );

  const activo = (esActivo: boolean) =>
    esActivo
      ? variante === 'publico'
        ? 'bg-dark-600 text-primary-400'
        : 'bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-primary-300'
      : variante === 'publico'
        ? 'text-gray-400 hover:text-primary-300'
        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200';

  return (
    <div className={contenedor} role="group" aria-label="Tema de la interfaz">
      {opcionesTema.map((opcion) => {
        const Icono = opcion.icono;
        const esActivo = tema === opcion.valor;

        return (
          <button
            key={opcion.valor}
            type="button"
            onClick={() => establecerTema(opcion.valor)}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              activo(esActivo)
            )}
            title={`Tema ${opcion.etiqueta.toLowerCase()}`}
            aria-label={`Tema ${opcion.etiqueta.toLowerCase()}`}
            aria-pressed={esActivo}
          >
            <Icono className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}
