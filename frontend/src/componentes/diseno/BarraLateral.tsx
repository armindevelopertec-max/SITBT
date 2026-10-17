'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/libreria/utilidades';
import { usarAlmacenAutenticacion } from '@/almacen/almacen-autenticacion';
import { usarConfiguracionInstitucional } from '@/ganchos/usarConfiguracionInstitucional';
import { Menu, X, Home, Users, GraduationCap, UserCog, BookOpen, FolderKanban, ClipboardList, Award, CreditCard, FileText, RefreshCw, BarChart3, Shield, User, BookMarked, CalendarCheck, Settings, Building2, Calendar, ClipboardCheck, FileBadge, Fingerprint } from 'lucide-react';
import { Rol } from '@/tipos';

interface ElementoMenu {
  titulo: string;
  href: string;
  icono: React.ReactNode;
  roles: Rol[];
}

interface SeccionMenu {
  titulo?: string;
  elementos: ElementoMenu[];
}

interface PropsBarraLateral {
  colapsada: boolean;
  abierta?: boolean;
  alCerrar?: () => void;
  alColapsar?: () => void;
}

const seccionesMenu: SeccionMenu[] = [
  {
    elementos: [
      {
        titulo: 'Panel Principal',
        href: '/panel',
        icono: <Home className="w-5 h-5" />,
        roles: ['administrador', 'secretaria', 'director_academico', 'rector', 'docente', 'estudiante', 'apoyo'],
      },
      {
        titulo: 'Admisión',
        href: '/panel/admision',
        icono: <ClipboardCheck className="w-5 h-5" />,
        roles: ['administrador', 'secretaria'],
      },
      {
        titulo: 'Estudiantes',
        href: '/estudiantes',
        icono: <GraduationCap className="w-5 h-5" />,
        roles: ['administrador', 'secretaria', 'director_academico', 'rector', 'docente'],
      },
      {
        titulo: 'Personal',
        href: '/personal',
        icono: <UserCog className="w-5 h-5" />,
        roles: ['administrador', 'secretaria', 'director_academico', 'rector'],
      },
      {
        titulo: 'Asistencias',
        href: '/asistencias',
        icono: <Fingerprint className="w-5 h-5" />,
        roles: ['administrador', 'secretaria', 'director_academico', 'rector', 'apoyo'],
      },
      {
        titulo: 'Carreras',
        href: '/panel/carreras',
        icono: <BookOpen className="w-5 h-5" />,
        roles: ['administrador', 'secretaria', 'director_academico', 'rector'],
      },
      {
        titulo: 'Materias',
        href: '/materias',
        icono: <BookMarked className="w-5 h-5" />,
        roles: ['administrador', 'secretaria', 'director_academico', 'rector', 'docente'],
      },
      {
        titulo: 'Grupos',
        href: '/grupos',
        icono: <FolderKanban className="w-5 h-5" />,
        roles: ['administrador', 'secretaria', 'director_academico', 'rector', 'docente'],
      },
      {
        titulo: 'Preinscripcion',
        href: '/preinscripcion',
        icono: <CalendarCheck className="w-5 h-5" />,
        roles: ['administrador', 'secretaria', 'director_academico'],
      },
      {
        titulo: 'Materias Impartidas',
        href: '/materias-impartidas',
        icono: <ClipboardList className="w-5 h-5" />,
        roles: ['administrador', 'secretaria', 'director_academico', 'docente'],
      },
      {
        titulo: 'Pagos',
        href: '/pagos',
        icono: <CreditCard className="w-5 h-5" />,
        roles: ['administrador', 'secretaria', 'rector'],
      },
      {
        titulo: 'Certificados',
        href: '/certificados',
        icono: <Award className="w-5 h-5" />,
        roles: ['administrador', 'secretaria', 'director_academico'],
      },
      {
        titulo: 'Convalidaciones',
        href: '/convalidaciones',
        icono: <RefreshCw className="w-5 h-5" />,
        roles: ['administrador', 'secretaria', 'director_academico'],
      },
      {
        titulo: 'Reportes',
        href: '/reportes',
        icono: <BarChart3 className="w-5 h-5" />,
        roles: ['administrador', 'director_academico', 'rector'],
      },
    ],
  },
  {
    titulo: 'Administración',
    elementos: [
      {
        titulo: 'Usuarios',
        href: '/usuarios',
        icono: <Shield className="w-5 h-5" />,
        roles: ['administrador'],
      },
      {
        titulo: 'Credenciales',
        href: '/credenciales',
        icono: <FileText className="w-5 h-5" />,
        roles: ['administrador', 'secretaria'],
      },
      {
        titulo: 'Documentos',
        href: '/documentos',
        icono: <FileBadge className="w-5 h-5" />,
        roles: ['administrador', 'secretaria'],
      },
    ],
  },
  {
    titulo: 'Configuración',
    elementos: [
      {
        titulo: 'Institución',
        href: '/configuracion/institucion',
        icono: <Building2 className="w-5 h-5" />,
        roles: ['administrador'],
      },
      {
        titulo: 'Gestiones',
        href: '/configuracion/gestiones',
        icono: <Calendar className="w-5 h-5" />,
        roles: ['administrador'],
      },
      {
        titulo: 'Planes de Estudio',
        href: '/planes-estudio',
        icono: <BookOpen className="w-5 h-5" />,
        roles: ['administrador'],
      },
    ],
  },
];

export default function BarraLateral({ colapsada, abierta = true, alCerrar, alColapsar }: PropsBarraLateral) {
  const pathname = usePathname();
  const { usuario } = usarAlmacenAutenticacion();
  const rolesUsuario: string[] =
    usuario?.roles && usuario.roles.length > 0
      ? usuario.roles.map((r: any) => r.codigo || r.code || r)
      : usuario?.rol
        ? [usuario.rol]
        : [];
  const { configuracion } = usarConfiguracionInstitucional();

  const seccionesFiltradas = seccionesMenu
    .map((seccion) => ({
      ...seccion,
      elementos: seccion.elementos.filter((elemento) => {
        if (!usuario) return false;
        return elemento.roles.some((r) => rolesUsuario.includes(r));
      }),
    }))
    .filter((seccion) => seccion.elementos.length > 0);

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
                {configuracion?.logoUrl ? (
                  <img
                    src={configuracion.logoUrl}
                    alt="Logo"
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-600">
                      {configuracion?.nombreCorto?.charAt(0) || 'S'}
                    </span>
                  </div>
                )}
                <span className="text-lg font-bold text-primary-600 truncate">
                  {configuracion?.nombreCorto || 'SITBT'}
                </span>
              </div>
              <span className="text-xs text-gray-500 truncate mt-0.5" title={configuracion?.lema || ''}>
                {configuracion?.lema || 'Instituto Tecnológico'}
              </span>
            </div>
          ) : (
            configuracion?.logoUrl ? (
              <img
                src={configuracion.logoUrl}
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-bold text-primary-600">
                  {configuracion?.nombreCorto?.charAt(0) || 'S'}
                </span>
              </div>
            )
          )}
          <button
            onClick={alColapsar}
            className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {colapsada ? (
              <Menu className="w-5 h-5 text-gray-600" />
            ) : (
              <X className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <button
            onClick={alCerrar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {seccionesFiltradas.map((seccion, indiceSeccion) => (
            <div key={seccion.titulo || indiceSeccion} className="mb-4">
              {seccion.titulo && !colapsada && (
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {seccion.titulo}
                </div>
              )}
              <ul className="space-y-1">
                {seccion.elementos.map((elemento) => (
                  <li key={elemento.titulo}>
                    <Link
                      href={elemento.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                        pathname === elemento.href
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      <span className={cn(pathname === elemento.href && 'text-primary-600')}>
                        {elemento.icono}
                      </span>
                      {!colapsada && (
                        <span className="font-medium">{elemento.titulo}</span>
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
                  {usuario?.nombreUsuario}
                </p>
                <p className="text-xs text-gray-500 truncate capitalize">
                  {rolesUsuario[0]?.replace('_', ' ') || 'Usuario'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
