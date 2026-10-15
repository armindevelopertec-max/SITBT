import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function cn(...entradas: ClassValue[]) {
  return twMerge(clsx(entradas));
}

export const formatearFecha = (fecha: string | Date, formato: string = 'dd/MM/yyyy'): string => {
  if (!fecha) return '';
  const fechaObj = typeof fecha === 'string' ? parseISO(fecha) : fecha;
  return format(fechaObj, formato, { locale: es });
};

export const formatearFechaHora = (fecha: string | Date): string => {
  return formatearFecha(fecha, 'dd/MM/yyyy HH:mm');
};

export const formatearMoneda = (monto: number): string => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
  }).format(monto);
};

export const truncarTexto = (texto: string, longitudMaxima: number): string => {
  if (texto.length <= longitudMaxima) return texto;
  return texto.slice(0, longitudMaxima) + '...';
};

export const capitalizar = (texto: string): string => {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
};

export const obtenerIniciales = (nombre: string): string => {
  return nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
