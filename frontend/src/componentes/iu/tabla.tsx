import { cn } from '@/libreria/utilidades';
import { HTMLAttributes, forwardRef, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';

const Tabla = forwardRef<HTMLTableElement, TableHTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-auto">
      <table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  )
);
Tabla.displayName = 'Tabla';

const EncabezadoTabla = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('bg-gray-50 border-b border-gray-200', className)} {...props} />
  )
);
EncabezadoTabla.displayName = 'EncabezadoTabla';

const CuerpoTabla = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('divide-y divide-gray-200', className)} {...props} />
  )
);
CuerpoTabla.displayName = 'CuerpoTabla';

const FilaTabla = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn('hover:bg-gray-50 transition-colors', className)} {...props} />
  )
);
FilaTabla.displayName = 'FilaTabla';

const CeldaEncabezado = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'h-12 px-4 text-left align-middle font-medium text-gray-600 [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  )
);
CeldaEncabezado.displayName = 'CeldaEncabezado';

const CeldaTabla = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)} {...props} />
  )
);
CeldaTabla.displayName = 'CeldaTabla';

const PieTabla = forwardRef<HTMLTableCaptionElement, HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn('mt-4 text-sm text-gray-500', className)} {...props} />
  )
);
PieTabla.displayName = 'PieTabla';

export { Tabla, EncabezadoTabla, CuerpoTabla, FilaTabla, CeldaEncabezado, CeldaTabla, PieTabla };
