'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utilidades';
import { usarAlmacenAutenticacion } from '@/store/almacen-autenticacion';
import { usarConfiguracionInstitucional } from '@/hooks/usarConfiguracionInstitucional';
import { Menu, X, Home, Users, GraduationCap, UserCog, BookOpen, FolderKanban, ClipboardList, Award, CreditCard, FileText, RefreshCw, BarChart3, Shield, User, BookMarked, CalendarCheck, Settings, Building2, Calendar, ClipboardCheck, FileBadge } from 'lucide-react';
import { Rol } from '@/types';

interface ElementoMenu {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles: Rol[];
}

interface SeccionMenu {
  title?: string;
  items: ElementoMenu[];
}

interface PropsBarraLateral {
  colapsada: boolean;
  abierta?: boolean;
  onCerrar?: () => void;
  onColapsar?: () => void;
}

const seccionesMenu: SeccionMenu[] = [
  {
    items: [
      {
        title: 'Panel Principal',
        href: '/panel',
        icon: <Home className="w-5 h-5" />,
        roles: ['administrador', 'secretaria', 'director_academico', 'rector', 'docente', 'estudiante', 'apoyo'],
      },
      {
        title: 'Admisión',
        href: '/panel/admision',
        icon: <ClipboardCheck className="w-5 h-5" />,
        roles: ['administrador', 'secretaria'],
      },
      {
        title: 'Estudiantes',
        href: '/estudiantes',
        icon: <GraduationCap className="w-5 h-5" />,
        roles: ['administrador', 'secretaria', 'director_academico', 'rector', 'docente'],
      },
      {
        title: 'Personal',
        href: '/personal',
        icon: <UserCog className="w-5 h-5" />,
        roles: ['administrador', 'secretaria', 'director_academico', 'rector'],
      },
      {
        title: 'Carreras',
        href: '/panel/carreras',
        icon: <BookOpen className="w-5 h-5" />,
        roles: ['administrador', 'secretaria', 'director_academico', 'rector'],
      },
      {
        title: 'Materias',
        href: '/materias',
        icon: <BookMarked className="w-5 h-5" />,
        roles: ['administrador', 'secretaria', 'director_academico', 'rector', 'docente'],
      },
      {
        title: 'Grupos',
        href: '/grupos',
        icon: <FolderKanban className="w-5 h-5" />,
        roles: ['administrador', 'secretaria', 'director_academico', 'rector', 'docente'],
      },
      {
        title: 'Preinscripcion',
        href: '/preinscripcion',
        icon: <CalendarCheck className="w-5 h-5" />,
        roles: ['administrador', 'secretaria', 'director_academico'],
      },
      {
        title: 'Calificaciones',
        href: '/calificaciones',
        icon: <ClipboardList className="w-5 h-5" />,
        roles: ['administrador', 'secretaria', 'director_academico', 'docente'],
      },
      {
        title: 'Pagos *',
        href: '/pagos',
        icon: <CreditCard className="w-5 h-5" />,
        roles: ['administrador', 'secretaria', 'rector'],
      },
      {
        title: 'Certificados',
        href: '/certificados',
        icon: <Award className="w-5 h-5" />,
        roles: ['administrador', 'secretaria', 'director_academico'],
      },
      {
        title: 'Convalidaciones',
        href: '/convalidaciones',
        icon: <RefreshCw className="w-5 h-5" />,
        roles: ['administrador', 'secretaria', 'director_academico'],
      },
      {
        title: 'Reportes',
        href: '/reportes',
        icon: <BarChart3 className="w-5 h-5" />,
        roles: ['administrador', 'director_academico', 'rector'],
      },
    ],
  },
  {
    title: 'Administración',
    items: [
      {
        title: 'Usuarios',
        href: '/usuarios',
        icon: <Shield className="w-5 h-5" />,
        roles: ['administrador'],
      },
      {
        title: 'Credenciales',
        href: '/credenciales',
        icon: <FileText className="w-5 h-5" />,
        roles: ['administrador', 'secretaria'],
      },
      {
        title: 'Documentos',
        href: '/documentos',
        icon: <FileBadge className="w-5 h-5" />,
        roles: ['administrador', 'secretaria'],
      },
    ],
  },
  {
    title: 'Configuración',
    items: [
      {
        title: 'Institución',
        href: '/configuracion/institucion',
        icon: <Building2 className="w-5 h-5" />,
        roles: ['administrador'],
      },
      {
        title: 'Gestiones',
        href: '/configuracion/gestiones',
        icon: <Calendar className="w-5 h-5" />,
        roles: ['administrador'],
      },
      {
        title: 'Planes de Estudio',
        href: '/planes-estudio',
        icon: <BookOpen className="w-5 h-5" />,
        roles: ['administrador'],
      },
    ],
  },
];

export default function BarraLateral({ colapsada, abierta = true, onCerrar, onColapsar }: PropsBarraLateral) {
  const pathname = usePathname();
  const { user } = usarAlmacenAutenticacion();
  const userRoles = user?.roles?.map((r: any) => r.codigo || r.code || r) || [];
  const { settings } = usarConfiguracionInstitucional();

  const filteredSections = seccionesMenu
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!user) return false;
        const userRoles = user.roles?.map((r: any) => r.codigo || r.code || r) || [];
        return item.roles.some((r) => userRoles.includes(r));
      }),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300',
        colapsada ? 'w-16' : 'w-64',
        !abierta ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-20 px-4 border-b border-gray-200">
          {!colapsada ? (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                {settings?.logo_url ? (
                  <img
                    src={settings.logo_url}
                    alt="Logo"
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-600">
                      {settings?.nombre_corto?.charAt(0) || 'S'}
                    </span>
                  </div>
                )}
                <span className="text-lg font-bold text-primary-600 truncate">
                  {settings?.nombre_corto || 'SITBT'}
                </span>
              </div>
              <span className="text-xs text-gray-500 truncate mt-0.5" title={settings?.lema || ''}>
                {settings?.lema || 'Instituto Tecnológico'}
              </span>
            </div>
          ) : (
            settings?.logo_url ? (
              <img
                src={settings.logo_url}
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-bold text-primary-600">
                  {settings?.nombre_corto?.charAt(0) || 'S'}
                </span>
              </div>
            )
          )}
          <button
            onClick={onColapsar}
            className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {colapsada ? (
              <Menu className="w-5 h-5 text-gray-600" />
            ) : (
              <X className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <button
            onClick={onCerrar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {filteredSections.map((section, sectionIndex) => (
            <div key={section.title || sectionIndex} className="mb-4">
              {section.title && !colapsada && (
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {section.title}
                </div>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.title}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                        pathname === item.href
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      <span className={cn(pathname === item.href && 'text-primary-600')}>
                        {item.icon}
                      </span>
                      {!colapsada && (
                        <span className="font-medium">{item.title}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {!colapsada && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.nombreUsuario}
                </p>
                <p className="text-xs text-gray-500 truncate capitalize">
                  {userRoles[0]?.replace('_', ' ') || 'Usuario'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
