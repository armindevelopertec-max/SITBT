import { cn } from '@/libreria/utilidades';
import { HTMLAttributes, forwardRef, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';

const Tabla = forwardRef<HTMLTableElement, TableHTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-auto">
      <table ref={ref} className={cn('w-full caption-bottom text-sm text-foreground', className)} {...props} />
    </div>
  )
);
Tabla.displayName = 'Tabla';

const EncabezadoTabla = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('bg-muted/40 dark:bg-muted/20 border-b border-border', className)} {...props} />
  )
);
EncabezadoTabla.displayName = 'EncabezadoTabla';

const CuerpoTabla = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('divide-y divide-border', className)} {...props} />
  )
);
CuerpoTabla.displayName = 'CuerpoTabla';

const FilaTabla = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn('hover:bg-muted/30 dark:hover:bg-muted/10 transition-colors', className)} {...props} />
  )
);
FilaTabla.displayName = 'FilaTabla';

const CeldaEncabezado = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  )
);
CeldaEncabezado.displayName = 'CeldaEncabezado';

const CeldaTabla = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn('p-4 align-middle text-foreground [&:has([role=checkbox])]:pr-0', className)} {...props} />
  )
);
CeldaTabla.displayName = 'CeldaTabla';

const PieTabla = forwardRef<HTMLTableCaptionElement, HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />
  )
);
PieTabla.displayName = 'PieTabla';

export { Tabla, EncabezadoTabla, CuerpoTabla, FilaTabla, CeldaEncabezado, CeldaTabla, PieTabla };
