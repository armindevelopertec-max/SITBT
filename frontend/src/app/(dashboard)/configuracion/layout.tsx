'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/libreria/utilidades';
import { Building2, Settings as SettingsIcon, Calendar, BookOpen, BookMarked, GraduationCap, Palette, GitCompare } from 'lucide-react';

interface PropsDisposicionConfiguracion {
  children: ReactNode;
}

const enlacesConfiguracion = [
  {
    titulo: 'Institución',
    href: '/configuracion/institucion',
    icono: Building2,
    descripcion: 'Datos generales, contacto y logo',
  },
  {
    titulo: 'Gestiones',
    href: '/configuracion/gestiones',
    icono: Calendar,
    descripcion: 'Períodos académicos y estados',
  },
  {
    titulo: 'Carreras',
    href: '/configuracion/carreras',
    icono: BookOpen,
    descripcion: 'Catálogo de carreras',
  },
  {
    titulo: 'Materias',
    href: '/configuracion/materias',
    icono: BookMarked,
    descripcion: 'Catálogo de materias',
  },
  {
    titulo: 'Planes de Estudio',
    href: '/configuracion/planes-estudio',
    icono: GraduationCap,
    descripcion: 'Planes, asignaturas y prerrequisitos',
  },
  {
    titulo: 'Convalidaciones',
    href: '/configuracion/convalidaciones',
    icono: GitCompare,
    descripcion: 'Equivalencias entre planes RM',
  },
  {
    titulo: 'Apariencia',
    href: '/configuracion/apariencia',
    icono: Palette,
    descripcion: 'Tema oscuro y color principal',
  },
];

export default function DisposicionConfiguracion({ children }: PropsDisposicionConfiguracion) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <SettingsIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground dark:text-gray-100">Configuración</h1>
          <p className="text-muted-foreground dark:text-muted-foreground">Administración del sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {enlacesConfiguracion.map((enlace) => {
              const esActivo = pathname === enlace.href;
              return (
                <Link
                  key={enlace.href}
                  href={enlace.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    esActivo
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-l-4 border-primary-600'
                      : 'text-muted-foreground hover:bg-muted/40'
                  )}
                >
                  <enlace.icono className="w-5 h-5" />
                  <div>
                    <p className="font-medium">{enlace.titulo}</p>
                    <p className="text-xs text-muted-foreground">{enlace.descripcion}</p>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="lg:col-span-3">
          {children}
        </div>
      </div>
    </div>
  );
}
