import { cn } from '@/lib/utilidades';
import { HTMLAttributes, forwardRef } from 'react';

type VarianteInsignia = 'predeterminado' | 'primario' | 'secundario' | 'exito' | 'advertencia' | 'error' | 'contorno';

interface PropsInsignia extends HTMLAttributes<HTMLSpanElement> {
  variante?: VarianteInsignia;
}

const Insignia = forwardRef<HTMLSpanElement, PropsInsignia>(
  ({ className, variante = 'predeterminado', ...props }, ref) => {
    const variantes: Record<VarianteInsignia, string> = {
      predeterminado: 'bg-gray-100 text-gray-800',
      primario: 'bg-primary-100 text-primary-800',
      secundario: 'bg-secondary-100 text-secondary-800',
      exito: 'bg-green-100 text-green-800',
      advertencia: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      contorno: 'border border-gray-300 text-gray-700',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          variantes[variante],
          className
        )}
        {...props}
      />
    );
  }
);

Insignia.displayName = 'Insignia';

export { Insignia };
export type { PropsInsignia, VarianteInsignia };
