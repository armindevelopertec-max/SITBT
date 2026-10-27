import { cn } from '@/libreria/utilidades';
import { HTMLAttributes, forwardRef } from 'react';

interface PropsTarjeta extends HTMLAttributes<HTMLDivElement> {
  variante?: 'predeterminado' | 'conBorde' | 'elevada';
}

const Tarjeta = forwardRef<HTMLDivElement, PropsTarjeta>(
  ({ className, variante = 'predeterminado', ...props }, ref) => {
    const variantes = {
      predeterminado: 'bg-card text-card-foreground',
      conBorde: 'bg-card text-card-foreground border border-border',
      elevada: 'bg-card text-card-foreground shadow-lg dark:shadow-black/40',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg overflow-hidden',
          variantes[variante],
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
    <div ref={ref} className={cn('px-6 py-4 border-b border-border', className)} {...props} />
  )
);
EncabezadoTarjeta.displayName = 'EncabezadoTarjeta';

const TituloTarjeta = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-semibold text-foreground', className)} {...props} />
  )
);
TituloTarjeta.displayName = 'TituloTarjeta';

const DescripcionTarjeta = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground mt-1', className)} {...props} />
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
    <div ref={ref} className={cn('px-6 py-4 border-t border-border bg-muted/40 dark:bg-muted/20', className)} {...props} />
  )
);
PieTarjeta.displayName = 'PieTarjeta';

export { Tarjeta, EncabezadoTarjeta, TituloTarjeta, DescripcionTarjeta, ContenidoTarjeta, PieTarjeta };
