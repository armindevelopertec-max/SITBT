import { cn } from '@/libreria/utilidades';
import { HTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

interface PropsEntrada extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta?: string;
  error?: string;
  textoAyuda?: string;
}

const Entrada = forwardRef<HTMLInputElement, PropsEntrada>(
  ({ className, etiqueta, error, textoAyuda, type = 'text', id, ...props }, ref) => {
    const idEntrada = id || etiqueta?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {etiqueta && (
          <label htmlFor={idEntrada} className="block text-sm font-medium text-gray-700 mb-1">
            {etiqueta}
          </label>
        )}
        <input
          ref={ref}
          id={idEntrada}
          type={type}
          className={cn(
            'block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {textoAyuda && !error && <p className="mt-1 text-sm text-gray-500">{textoAyuda}</p>}
      </div>
    );
  }
);

Entrada.displayName = 'Entrada';

const AreaTexto = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm',
          className
        )}
        {...props}
      />
    );
  }
);

AreaTexto.displayName = 'AreaTexto';

export { Entrada, AreaTexto };
export type { PropsEntrada };
