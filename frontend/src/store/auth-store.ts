import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState } from '@/types';
import api from '@/lib/api';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { username, password });
          const { access_token, user } = response.data;

          const roles = user.roles as any[];
          const firstRole = roles && roles.length > 0 ? roles[0].code : 'administrador';

          const transformedUser: User = {
            id: user.id,
            username: user.username,
            email: user.person?.email || '',
            role: firstRole,
            personId: user.person_id,
            isActive: true,
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

      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
