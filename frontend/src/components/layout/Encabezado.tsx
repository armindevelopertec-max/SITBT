'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usarAlmacenAutenticacion } from '@/store/almacen-autenticacion';
import { etiquetaRol, colorRol } from '@/lib/autenticacion';
import { Bell, LogOut, User, Settings, ChevronDown, Menu } from 'lucide-react';
import { cn } from '@/lib/utilidades';

interface PropsEncabezado {
  title?: string;
  onMenuClick?: () => void;
}

export default function Encabezado({ title, onMenuClick }: PropsEncabezado) {
  const [desplegableAbierto, setDesplegableAbierto] = useState(false);
  const refDesplegable = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, logout } = usarAlmacenAutenticacion();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (refDesplegable.current && !refDesplegable.current.contains(event.target as Node)) {
        setDesplegableAbierto(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          {title && (
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="relative" ref={refDesplegable}>
            <button
              onClick={() => setDesplegableAbierto(!desplegableAbierto)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-gray-400 transition-transform hidden sm:block',
                  desplegableAbierto && 'rotate-180'
                )}
              />
            </button>

            {desplegableAbierto && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <span
                    className={cn(
                      'inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full capitalize',
                      user?.role && colorRol(user.role as any)
                    )}
                  >
                    {user?.role && etiquetaRol(user.role)}
                  </span>
                </div>

                <div className="py-1">
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Settings className="w-4 h-4" />
                    Configuración
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
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
