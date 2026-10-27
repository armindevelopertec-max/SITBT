'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usarAlmacenAutenticacion } from '@/almacen/almacen-autenticacion';
import { etiquetaRol, colorRol } from '@/libreria/autenticacion';
import { Bell, LogOut, User, Settings, ChevronDown, Menu, UserCircle, Palette } from 'lucide-react';
import { cn } from '@/libreria/utilidades';

interface PropsEncabezado {
  titulo?: string;
  alHacerClicMenu?: () => void;
}

export default function Encabezado({ titulo, alHacerClicMenu }: PropsEncabezado) {
  const [desplegableAbierto, setDesplegableAbierto] = useState(false);
  const refDesplegable = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { usuario, cerrarSesion } = usarAlmacenAutenticacion();

  useEffect(() => {
    const alHacerClicFuera = (evento: MouseEvent) => {
      if (refDesplegable.current && !refDesplegable.current.contains(evento.target as Node)) {
        setDesplegableAbierto(false);
      }
    };

    document.addEventListener('mousedown', alHacerClicFuera);
    return () => document.removeEventListener('mousedown', alHacerClicFuera);
  }, []);

  const cerrarSesionUsuario = () => {
    cerrarSesion();
    router.push('/acceder');
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-card border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={alHacerClicMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          {titulo && (
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{titulo}</h1>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="relative" ref={refDesplegable}>
            <button
              onClick={() => setDesplegableAbierto(!desplegableAbierto)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{usuario?.nombreUsuario}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{usuario?.correo}</p>
              </div>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-gray-400 transition-transform hidden sm:block',
                  desplegableAbierto && 'rotate-180'
                )}
              />
            </button>

            {desplegableAbierto && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-card rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{usuario?.nombreUsuario}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{usuario?.correo}</p>
                  <span
                    className={cn(
                      'inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full capitalize',
                      usuario?.rol && colorRol(usuario.rol as any)
                    )}
                  >
                    {usuario?.rol && etiquetaRol(usuario.rol)}
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    href="/perfil"
                    onClick={() => setDesplegableAbierto(false)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <UserCircle className="w-4 h-4" />
                    Mi perfil
                  </Link>
                  <Link
                    href="/configuracion/apariencia"
                    onClick={() => setDesplegableAbierto(false)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Palette className="w-4 h-4" />
                    Apariencia
                  </Link>
                  <Link
                    href="/configuracion/institucion"
                    onClick={() => setDesplegableAbierto(false)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Settings className="w-4 h-4" />
                    Configuración
                  </Link>
                  <button
                    onClick={cerrarSesionUsuario}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
