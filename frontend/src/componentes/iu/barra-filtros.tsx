'use client';

import { Search, X, ChevronDown } from 'lucide-react';
import { cn } from '@/libreria/utilidades';

export interface OpcionFiltro {
  value: string | number;
  etiqueta: string;
}

/** Altura única de todos los campos de filtro del sistema. */
const ALTURA_CAMPO = 'h-10';

/** Estilo común: mismo borde, fondo, tipografía y foco. */
const ESTILO_CAMPO =
  'w-full rounded-lg border border-border bg-card text-sm text-foreground ' +
  'transition-colors placeholder:text-muted-foreground ' +
  'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 ' +
  'dark:border-gray-600';

interface PropsCampoFiltro {
  etiqueta: string;
  value: string | number;
  onChange: (valor: string) => void;
  opciones: OpcionFiltro[];
  /** Texto de la opción vacía (por ejemplo "Todas las carreras"). */
  placeholder?: string;
  className?: string;
}

/**
 * Campo de filtro (select) con el estilo único de la aplicación.
 *
 * Todos los filtros del sistema usan este componente para que se vean
 * iguales en cualquier pantalla: misma altura, mismo borde y misma
 * tipografía que el buscador.
 */
export function CampoFiltro({
  etiqueta,
  value,
  onChange,
  opciones,
  placeholder = 'Todos',
  className,
}: PropsCampoFiltro) {
  return (
    <label className={cn('flex min-w-0 flex-col gap-1', className)}>
      <span className="text-xs font-medium text-muted-foreground">{etiqueta}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            ESTILO_CAMPO,
            ALTURA_CAMPO,
            'appearance-none py-0 pl-3 pr-9',
          )}
        >
          <option value="">{placeholder}</option>
          {opciones.map((opcion) => (
            <option
              key={opcion.value}
              value={opcion.value}
              className="bg-card text-foreground dark:bg-gray-800 dark:text-gray-100"
            >
              {opcion.etiqueta}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </span>
    </label>
  );
}

interface PropsBuscadorFiltro {
  value?: string;
  onChange?: (valor: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Buscador de texto con el estilo único de la aplicación.
 *
 * Comparte altura, borde y tipografía con `CampoFiltro`, para que una fila
 * de filtros se vea homogénea.
 */
export function BuscadorFiltro({
  value,
  onChange,
  placeholder = 'Buscar...',
  className,
}: PropsBuscadorFiltro) {
  return (
    <label className={cn('flex min-w-0 flex-col gap-1', className)}>
      <span className="text-xs font-medium text-muted-foreground">Búsqueda</span>
      <span className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={cn(
            ESTILO_CAMPO,
            ALTURA_CAMPO,
            'py-0 pl-9 pr-9',
          )}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange?.('')}
            title="Limpiar búsqueda"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </span>
    </label>
  );
}

interface PropsBarraFiltros {
  children: React.ReactNode;
  className?: string;
  /** Número de columnas en pantallas grandes. */
  columnas?: 2 | 3 | 4 | 5 | 6;
}

/**
 * Contenedor de los filtros de una lista.
 *
 * Da el mismo formato (grid responsive, separación y alineación) a todos los
 * filtros del sistema. Los campos quedan alineados por la base para que las
 * etiquetas y los campos formen filas parejas.
 */
export function BarraFiltros({
  children,
  className,
  columnas = 5,
}: PropsBarraFiltros) {
  const columnasClase = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
    5: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  }[columnas];

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-3',
        columnasClase,
        'items-end',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Fila de filtros para las cabeceras de las listas.
 *
 * Alinea los campos por la base, de modo que las etiquetas queden a la misma
 * altura y los campos de abajo en línea.
 */
export function FilaFiltros({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-end',
        className,
      )}
    >
      {children}
    </div>
  );
}
