import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Usuario, EstadoAutenticacion } from '@/types';
import api from '@/lib/api';

// Normaliza el objeto de usuario que devuelve la API (campos en español)
function normalizarUsuario(usuarioApi: any): Usuario {
  const roles = (usuarioApi?.roles || []) as Array<{ id: number; codigo: string; nombre: string }>;
  const rolPrincipal = roles.length > 0 ? roles[0].codigo : 'administrador';

  return {
    id: usuarioApi.id,
    nombreUsuario: usuarioApi.nombreUsuario ?? usuarioApi.username ?? '',
    correo: usuarioApi.persona?.correo || usuarioApi.correo || '',
    rol: rolPrincipal as any,
    roles,
    personaId: usuarioApi.personaId ?? usuarioApi.person_id,
    estado: usuarioApi.estado || 'activo',
    persona: usuarioApi.persona,
  } as Usuario;
}

export const usarAlmacenAutenticacion = create<EstadoAutenticacion>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false,

      setHasHydrated: (estado: boolean) => {
        set({ _hasHydrated: estado });
      },

      login: async (nombreUsuario: string, contrasena: string) => {
        set({ isLoading: true });
        try {
          const respuesta = await api.post('/autenticacion/login', {
            nombreUsuario,
            contrasena,
          });
          const { access_token, user } = respuesta.data;

          set({
            user: normalizarUsuario(user),
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setUser: (usuario: Usuario) => {
        set({ user: usuario });
      },
    }),
    {
      name: 'almacen-autenticacion',
      version: 2,
      migrate: (estadoPersistido: any) => estadoPersistido,
      merge: (estadoPersistido: any, estadoActual) => {
        const estado = { ...estadoActual, ...estadoPersistido };
        if (estado.user) {
          estado.user = normalizarUsuario(estado.user);
        }
        return estado;
      },
      onRehydrateStorage: () => (estado) => {
        estado?.setHasHydrated(true);
      },
    }
  )
);
