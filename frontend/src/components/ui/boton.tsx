import { cn } from '@/lib/utilidades';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface PropsBoton extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'contorno' | 'fantasma' | 'destructivo';
  tamano?: 'pequeno' | 'mediano' | 'grande' | 'icono';
  cargando?: boolean;
}

const Boton = forwardRef<HTMLButtonElement, PropsBoton>(
  ({ className, variante = 'primario', tamano = 'mediano', cargando, children, disabled, onClick, type = 'button', ...props }, ref) => {
    const estilosBase = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variantes = {
      primario: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
      secundario: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 focus:ring-secondary-500',
      contorno: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
      fantasma: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      destructivo: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };

    const tamanos = {
      pequeno: 'h-8 px-3 text-sm',
      mediano: 'h-10 px-4 text-sm',
      grande: 'h-12 px-6 text-base',
      icono: 'h-10 w-10',
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(estilosBase, variantes[variante], tamanos[tamano], className)}
        disabled={disabled || cargando}
        onClick={onClick}
        {...props}
      >
        {cargando ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Cargando...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Boton.displayName = 'Boton';

export { Boton };
export type { PropsBoton };
