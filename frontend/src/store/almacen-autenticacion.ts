import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Usuario, EstadoAutenticacion } from '@/types';
import api from '@/lib/api';

export const usarAlmacenAutenticacion = create<EstadoAutenticacion>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      login: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/autenticacion/login', { username, password });
          const { access_token, user } = response.data;

          const roles = (user.roles || []) as Array<{ id: number; codigo: string; nombre: string }>;
          const firstRole = roles.length > 0 ? roles[0].codigo : 'administrador';

          const transformedUser: Usuario = {
            id: user.id,
            nombreUsuario: user.nombreUsuario ?? user.nombreUsuario,
            correo: user.person?.correo || '',
            rol: firstRole as any,
            roles: roles,
            personaId: user.personaId ?? user.persona_id,
            estado: 'activo',
          };

          set({
            user: transformedUser,
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

      setUser: (user: Usuario) => {
        set({ user });
      },
    }),
    {
      name: 'almacen-autenticacion',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
