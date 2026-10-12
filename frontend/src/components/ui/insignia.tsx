import { cn } from '@/lib/utilidades';
import { HTMLAttributes, forwardRef } from 'react';

type VarianteInsignia = 'default' | 'primary' | 'secondary' | 'exito' | 'advertencia' | 'error' | 'outline';

interface PropsInsignia extends HTMLAttributes<HTMLSpanElement> {
  variant?: VarianteInsignia;
}

const Insignia = forwardRef<HTMLSpanElement, PropsInsignia>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants: Record<VarianteInsignia, string> = {
      default: 'bg-gray-100 text-gray-800',
      primary: 'bg-primary-100 text-primary-800',
      secondary: 'bg-secondary-100 text-secondary-800',
      exito: 'bg-green-100 text-green-800',
      advertencia: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      outline: 'border border-gray-300 text-gray-700',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          variants[variant],
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
