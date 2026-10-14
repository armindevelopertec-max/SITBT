'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usarAlmacenAutenticacion } from '@/store/almacen-autenticacion';
import { AlertCircle, Lock, User } from 'lucide-react';

export default function AccederPage() {
  const [error, setError] = useState<string | null>(null);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated, _hasHydrated } = usarAlmacenAutenticacion();

  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      router.push('/panel');
    }
  }, [_hasHydrated, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      await login(nombreUsuario, contrasena);
      router.push('/panel');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciales inválidas');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-500/10 mb-4">
              <Lock className="w-8 h-8 text-primary-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-100">Acceso al Sistema</h1>
            <p className="text-gray-400 mt-2">Ingrese sus credenciales para continuar</p>
          </div>

          <div className="bg-dark-700 border border-dark-600 rounded-2xl p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Usuario
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={nombreUsuario}
                    onChange={(e) => setNombreUsuario(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                    placeholder="Ingrese su usuario"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                    placeholder="Ingrese su contraseña"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full py-3 bg-primary-500 text-dark-900 font-semibold rounded-lg hover:bg-primary-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cargando ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Iniciando sesión...
                  </span>
                ) : (
                  'Ingresar'
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            © {new Date().getFullYear()} ITBT - Todos los derechos reservados
          </p>
        </div>
      </main>
    </div>
  );
}
