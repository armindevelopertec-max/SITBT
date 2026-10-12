import { cn } from '@/lib/utilidades';
import { HTMLAttributes, forwardRef } from 'react';

interface PropsTarjeta extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
}

const Tarjeta = forwardRef<HTMLDivElement, PropsTarjeta>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-white',
      bordered: 'bg-white border border-gray-200',
      elevated: 'bg-white shadow-lg',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg overflow-hidden',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Tarjeta.displayName = 'Tarjeta';

const EncabezadoTarjeta = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 py-4 border-b border-gray-200', className)} {...props} />
  )
);
EncabezadoTarjeta.displayName = 'EncabezadoTarjeta';

const TituloTarjeta = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-semibold text-gray-900', className)} {...props} />
  )
);
TituloTarjeta.displayName = 'TituloTarjeta';

const DescripcionTarjeta = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-gray-500 mt-1', className)} {...props} />
  )
);
DescripcionTarjeta.displayName = 'DescripcionTarjeta';

const ContenidoTarjeta = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 py-4', className)} {...props} />
  )
);
ContenidoTarjeta.displayName = 'ContenidoTarjeta';

const PieTarjeta = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 py-4 border-t border-gray-200 bg-gray-50', className)} {...props} />
  )
);
PieTarjeta.displayName = 'PieTarjeta';

export { Tarjeta, EncabezadoTarjeta, TituloTarjeta, DescripcionTarjeta, ContenidoTarjeta, PieTarjeta };
