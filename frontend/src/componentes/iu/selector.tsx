import { cn } from '@/libreria/utilidades';
import { SelectHTMLAttributes, forwardRef } from 'react';

interface PropsSelector extends SelectHTMLAttributes<HTMLSelectElement> {
  etiqueta?: string;
  error?: string;
  opciones: { value: string | number; etiqueta: string }[];
  placeholder?: string;
}

const Selector = forwardRef<HTMLSelectElement, PropsSelector>(
  ({ className, etiqueta, error, opciones, placeholder, id, ...props }, ref) => {
    const idSelector = id || etiqueta?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {etiqueta && (
          <label htmlFor={idSelector} className="block text-sm font-medium text-gray-700 mb-1">
            {etiqueta}
          </label>
        )}
        <select
          ref={ref}
          id={idSelector}
          className={cn(
            'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {opciones.map((opcion) => (
            <option key={opcion.value} value={opcion.value}>
              {opcion.etiqueta}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Selector.displayName = 'Selector';

export { Selector };
export type { PropsSelector };
