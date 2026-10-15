import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Usuario, EstadoAutenticacion } from '@/tipos';
import api from '@/libreria/api';

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
      usuario: null,
      tokenAcceso: null,
      estaAutenticado: false,
      cargando: false,
      _hidratado: false,

      establecerHidratado: (estado: boolean) => {
        set({ _hidratado: estado });
      },

      iniciarSesion: async (nombreUsuario: string, contrasena: string) => {
        set({ cargando: true });
        try {
          const respuesta = await api.post('/autenticacion/iniciar-sesion', {
            nombreUsuario,
            contrasena,
          });
          const { tokenAcceso, usuario } = respuesta.data;

          set({
            usuario: normalizarUsuario(usuario),
            tokenAcceso: tokenAcceso,
            estaAutenticado: true,
            cargando: false,
          });
        } catch (error) {
          set({ cargando: false });
          throw error;
        }
      },

      cerrarSesion: () => {
        set({
          usuario: null,
          tokenAcceso: null,
          estaAutenticado: false,
          cargando: false,
        });
      },

      establecerUsuario: (usuario: Usuario) => {
        set({ usuario });
      },
    }),
    {
      name: 'almacen-autenticacion',
      version: 3,
      migrate: (estadoPersistido: any) => estadoPersistido,
      merge: (estadoPersistido: any, estadoActual) => {
        const estado = { ...estadoActual, ...estadoPersistido };
        if (estado.usuario) {
          estado.usuario = normalizarUsuario(estado.usuario);
        }
        return estado;
      },
      onRehydrateStorage: () => (estado) => {
        estado?.establecerHidratado(true);
      },
    }
  )
);
