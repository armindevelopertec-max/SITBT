'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utilidades';
import { Building2, Shield, Settings as SettingsIcon, Calendar } from 'lucide-react';

interface ConfiguracionLayoutProps {
  children: ReactNode;
}

const configuracionLinks = [
  {
    title: 'Institución',
    href: '/configuracion/institucion',
    icon: Building2,
    description: 'Datos generales, contacto y logo',
  },
  {
    title: 'Gestiones',
    href: '/configuracion/gestiones',
    icon: Calendar,
    description: 'Períodos académicos y estados',
  },
];

export default function ConfiguracionLayout({ children }: ConfiguracionLayoutProps) {
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
            {configuracionLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <link.icon className="w-5 h-5" />
                  <div>
                    <p className="font-medium">{link.title}</p>
                    <p className="text-xs text-gray-400">{link.description}</p>
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
