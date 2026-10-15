'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utilidades';
import { Building2, Shield, Settings as SettingsIcon, Calendar } from 'lucide-react';

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
];

export default function DisposicionConfiguracion({ children }: PropsDisposicionConfiguracion) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
          <SettingsIcon className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-500">Administración del sistema</p>
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
                      ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <enlace.icono className="w-5 h-5" />
                  <div>
                    <p className="font-medium">{enlace.titulo}</p>
                    <p className="text-xs text-gray-400">{enlace.descripcion}</p>
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
