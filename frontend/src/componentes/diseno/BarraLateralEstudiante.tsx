'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/libreria/utilidades';
import { usarAlmacenAutenticacion } from '@/almacen/almacen-autenticacion';
import { usarConfiguracionInstitucional } from '@/ganchos/usarConfiguracionInstitucional';
import { primerNombreUsuario } from '@/libreria/autenticacion';
import { BookOpen, GraduationCap, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { AvatarUsuario } from './AvatarUsuario';

interface PropsBarraLateralEstudiante {
  colapsada: boolean;
  abierta?: boolean;
  alCerrar?: () => void;
  alColapsar?: () => void;
}

const enlaces = [
  {
    titulo: 'Mi Panel',
    href: '/estudiante',
    icono: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    titulo: 'Mis Materias',
    href: '/estudiante/materias',
    icono: <BookOpen className="w-5 h-5" />,
  },
  {
    titulo: 'Mi Malla Curricular',
    href: '/estudiante/malla',
    icono: <GraduationCap className="w-5 h-5" />,
  },
];

/** Menú exclusivo de la interfaz del estudiante. */
export default function BarraLateralEstudiante({
  colapsada,
  abierta = true,
  alCerrar,
  alColapsar,
}: PropsBarraLateralEstudiante) {
  const pathname = usePathname();
  const router = useRouter();
  const { usuario, cerrarSesion } = usarAlmacenAutenticacion();
  const { configuracion } = usarConfiguracionInstitucional();
  const nombreVisible = primerNombreUsuario(usuario);

  const cerrarSesionUsuario = () => {
    cerrarSesion();
    router.push('/acceder');
  };

  const esActivo = (href: string) =>
    href === '/estudiante' ? pathname === href : pathname.startsWith(href);

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
          abierta ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
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
              {!colapsada && (
                <div className="min-w-0">
                  <span className="text-lg font-bold text-primary truncate block">
                    {configuracion?.nombreCorto || 'SITBT'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate block">
                    Mi Espacio
                  </span>
                </div>
              )}
            </div>
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
            <ul className="space-y-1">
              {enlaces.map((enlace) => {
                const activo = esActivo(enlace.href);
                return (
                  <li key={enlace.href}>
                    <Link
                      href={enlace.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                        activo
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800',
                      )}
                    >
                      <span className={cn(activo && 'text-primary')}>
                        {enlace.icono}
                      </span>
                      {!colapsada && (
                        <span className="font-medium">{enlace.titulo}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <AvatarUsuario />
              {!colapsada && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {nombreVisible}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    Estudiante
                  </p>
                </div>
              )}
              {!colapsada && (
                <button
                  onClick={cerrarSesionUsuario}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
