'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/libreria/utilidades';
import { usarAlmacenAutenticacion } from '@/almacen/almacen-autenticacion';
import { usarConfiguracionInstitucional } from '@/ganchos/usarConfiguracionInstitucional';
import { Menu, X, Home, Users, GraduationCap, UserCog, BookOpen, FolderKanban, ClipboardList, Award, CreditCard, FileText, RefreshCw, BarChart3, Shield, ShieldCheck, BookMarked, CalendarCheck, Settings, Building2, Calendar, ClipboardCheck, FileBadge, Fingerprint, LogOut } from 'lucide-react';
import { AvatarUsuario } from './AvatarUsuario';

interface ElementoMenu {
  titulo: string;
  href: string;
  icono: React.ReactNode;
  modulo: string;
  soloAdministrador?: boolean;
  sinPermiso?: boolean;
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
        modulo: 'panel',
        sinPermiso: true,
      },
    ],
  },
  {
    titulo: 'Gestion de Admisiones y Estudiantes',
    elementos: [
      
      {
        titulo: 'Admisión',
        href: '/admision-gestion',
        icono: <ClipboardCheck className="w-5 h-5" />,
        modulo: 'admision',
      },
      {
        titulo: 'Estudiantes',
        href: '/estudiantes',
        icono: <GraduationCap className="w-5 h-5" />,
        modulo: 'estudiantes',
      },
      {
        titulo: 'Preinscripcion',
        href: '/preinscripcion',
        icono: <CalendarCheck className="w-5 h-5" />,
        modulo: 'preinscripcion',
      },
      {
        titulo: 'Pagos',
        href: '/pagos',
        icono: <CreditCard className="w-5 h-5" />,
        modulo: 'pagos',
      },
    ],
  },
  {
    titulo: 'Gestion Academica',
    elementos: [
      {
        titulo: 'Materias Impartidas',
        href: '/materias-impartidas',
        icono: <ClipboardList className="w-5 h-5" />,
        modulo: 'materias_impartidas',
      },
      {
        titulo: 'Grupos',
        href: '/grupos',
        icono: <FolderKanban className="w-5 h-5" />,
        modulo: 'grupos',
      },
    ],
  },
  {
    titulo: 'Gestion del Personal',
    elementos: [
      {
        titulo: 'Personal',
        href: '/personal',
        icono: <UserCog className="w-5 h-5" />,
        modulo: 'personal',
      },
      {
        titulo: 'Asistencias',
        href: '/asistencias',
        icono: <Fingerprint className="w-5 h-5" />,
        modulo: 'asistencias',
      },
    ],
  },
  {
    titulo: 'Documentacion y Reportes',
    elementos: [
      {
        titulo: 'Certificados',
        href: '/certificados',
        icono: <Award className="w-5 h-5" />,
        modulo: 'certificados',
      },
      {
        titulo: 'Reportes',
        href: '/reportes',
        icono: <BarChart3 className="w-5 h-5" />,
        modulo: 'reportes',
      },
      // {
      //   titulo: 'Credenciales',
      //   href: '/credenciales',
      //   icono: <FileText className="w-5 h-5" />,
      //   modulo: 'credenciales',
      // },
      {
        titulo: 'Documentos',
        href: '/documentos',
        icono: <FileBadge className="w-5 h-5" />,
        modulo: 'documentos',
      }
    ],
  },
  {
    titulo: 'Administracion del Sistema',
    elementos: [
      {
        titulo: 'Usuarios',
        href: '/usuarios',
        icono: <Shield className="w-5 h-5" />,
        modulo: 'usuarios',
        soloAdministrador: true,
      },
      {
        titulo: 'Roles',
        href: '/roles',
        icono: <ShieldCheck className="w-5 h-5" />,
        modulo: 'roles',
        soloAdministrador: true,
      },
    ],
  },
];

export default function BarraLateral({ colapsada, abierta = true, alCerrar, alColapsar }: PropsBarraLateral) {
  const pathname = usePathname();
  const router = useRouter();
  const { usuario, cerrarSesion } = usarAlmacenAutenticacion();
  const rolesUsuario: string[] =
    usuario?.roles && usuario.roles.length > 0
      ? usuario.roles.map((r: any) => r.codigo || r.code || r)
      : usuario?.rol
        ? [usuario.rol]
        : [];
  const { configuracion } = usarConfiguracionInstitucional();
  const permisosUsuario: string[] = usuario?.permisos ?? [];
  const esAdministrador = rolesUsuario.includes('administrador');

  const cerrarSesionUsuario = () => {
    cerrarSesion();
    router.push('/acceder');
  };

  const seccionesFiltradas = seccionesMenu
    .map((seccion) => ({
      ...seccion,
      elementos: seccion.elementos.filter((elemento) => {
        if (!usuario) return false;
        if (elemento.sinPermiso) return true;
        if (elemento.soloAdministrador) return esAdministrador;
        return (
          esAdministrador ||
          permisosUsuario.includes(`${elemento.modulo}:leer`)
        );
      }),
    }))
    .filter((seccion) => seccion.elementos.length > 0);

  return (
    <>
      {abierta && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={alCerrar}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-white dark:bg-card border-r border-gray-200 dark:border-gray-800 transition-all duration-300',
          colapsada ? 'w-16' : 'w-64',
          !abierta ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
            {!colapsada && (
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
                  <span className="text-lg font-bold text-primary truncate">
                    {configuracion?.nombreCorto || 'SITBT'}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5" title={configuracion?.lema || ''}>
                  {configuracion?.lema || 'Instituto Tecnológico'}
                </span>
              </div>
            )}
            <button
              onClick={alColapsar}
              className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={colapsada ? 'Expandir menú' : 'Colapsar menú'}
            >
              {colapsada ? (
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            <button
              onClick={alCerrar}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto scrollarea-tema py-4 px-2">
            {seccionesFiltradas.map((seccion, indiceSeccion) => (
              <div key={seccion.titulo || indiceSeccion} className="mb-4">
                {seccion.titulo && !colapsada && (
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
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
                            ? 'bg-primary/10 text-primary'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                        )}
                      >
                        <span className={cn(pathname === elemento.href && 'text-primary')}>
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

          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <AvatarUsuario />
              {!colapsada && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {usuario?.nombreUsuario}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
                      {rolesUsuario[0]?.replace('_', ' ') || 'Usuario'}
                    </p>
                  </div>
                  <button
                    onClick={cerrarSesionUsuario}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
                    title="Cerrar sesión"
                    aria-label="Cerrar sesión"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
