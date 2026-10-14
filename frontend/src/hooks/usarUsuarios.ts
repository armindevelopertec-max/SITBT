import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Rol } from '@/types';

export interface UsuarioRespuesta {
  id: number;
  nombreUsuario: string;
  estado: 'activo' | 'inactivo' | 'bloqueado';
  personaId: number;
  persona?: {
    id: number;
    ci: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    correo?: string;
  };
  roles?: Array<{
    id: number;
    codigo: string;
    nombre: string;
  }>;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface CrearUsuarioDatos {
  personaId: number;
  nombreUsuario: string;
  contrasena: string;
  codigoRol?: Rol;
}

export interface ActualizarUsuarioDatos {
  nombreUsuario?: string;
  estado?: 'activo' | 'inactivo' | 'bloqueado';
  contrasena?: string;
}

export interface DatosResetearContrasena {
  nuevaContrasena: string;
}

export function usarUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioRespuesta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginacion, setPaginacion] = useState({ pagina: 1, limite: 20, total: 0 });

  const obtenerUsuarios = useCallback(async (pagina = 1, limite = 20) => {
    try {
      setCargando(true);
      setError(null);
      const respuesta = await api.get(`/usuarios?pagina=${pagina}&limite=${limite}`);
      const { data, total, pagina: paginaActual, limite: limiteActual } = respuesta.data;
      setUsuarios(data);
      setPaginacion({ pagina: paginaActual, limite: limiteActual, total });
    } catch (err: any) {
      console.error('Error al obtener usuarios:', err);
      setError(err.response?.data?.mensaje || 'Error al cargar usuarios');
    } finally {
      setCargando(false);
    }
  }, []);

  const obtenerUsuariosActivos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const respuesta = await api.get('/usuarios/activos');
      setUsuarios(respuesta.data);
    } catch (err: any) {
      console.error('Error al obtener usuarios activos:', err);
      setError(err.response?.data?.mensaje || 'Error al cargar usuarios activos');
    } finally {
      setCargando(false);
    }
  }, []);

  const obtenerUsuarioPorId = useCallback(async (id: number): Promise<UsuarioRespuesta | null> => {
    try {
      const respuesta = await api.get(`/usuarios/${id}`);
      return respuesta.data;
    } catch (err: any) {
      console.error('Error al obtener usuario:', err);
      return null;
    }
  }, []);

  const obtenerRolesUsuario = useCallback(async (usuarioId: number) => {
    try {
      const respuesta = await api.get(`/usuarios/${usuarioId}/roles`);
      return respuesta.data;
    } catch (err: any) {
      console.error('Error al obtener roles del usuario:', err);
      return [];
    }
  }, []);

  const crearUsuario = useCallback(async (datosUsuario: CrearUsuarioDatos) => {
    try {
      setCargando(true);
      const respuesta = await api.post('/usuarios', datosUsuario);
      await obtenerUsuarios(paginacion.pagina, paginacion.limite);
      return respuesta.data;
    } catch (err: any) {
      console.error('Error al crear usuario:', err);
      throw err;
    } finally {
      setCargando(false);
    }
  }, [obtenerUsuarios, paginacion.pagina, paginacion.limite]);

  const actualizarUsuario = useCallback(async (id: number, datosUsuario: ActualizarUsuarioDatos) => {
    try {
      setCargando(true);
      const respuesta = await api.patch(`/usuarios/${id}`, datosUsuario);
      await obtenerUsuarios(paginacion.pagina, paginacion.limite);
      return respuesta.data;
    } catch (err: any) {
      console.error('Error al actualizar usuario:', err);
      throw err;
    } finally {
      setCargando(false);
    }
  }, [obtenerUsuarios, paginacion.pagina, paginacion.limite]);

  const eliminarUsuario = useCallback(async (id: number) => {
    try {
      setCargando(true);
      await api.delete(`/usuarios/${id}`);
      await obtenerUsuarios(paginacion.pagina, paginacion.limite);
    } catch (err: any) {
      console.error('Error al eliminar usuario:', err);
      throw err;
    } finally {
      setCargando(false);
    }
  }, [obtenerUsuarios, paginacion.pagina, paginacion.limite]);

  const cambiarContrasena = useCallback(async (id: number, nuevaContrasena: string) => {
    try {
      await api.post(`/usuarios/${id}/cambiar-contrasena`, { nuevaContrasena });
    } catch (err: any) {
      console.error('Error al cambiar contraseña:', err);
      throw err;
    }
  }, []);

  const asignarRol = useCallback(async (usuarioId: number, rolId: number) => {
    try {
      await api.post(`/usuarios/${usuarioId}/asignar-rol/${rolId}`);
    } catch (err: any) {
      console.error('Error al asignar rol:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    obtenerUsuarios();
  }, [obtenerUsuarios]);

  return {
    usuarios,
    cargando,
    error,
    paginacion,
    recargar: () => obtenerUsuarios(paginacion.pagina, paginacion.limite),
    obtenerUsuarios,
    obtenerUsuariosActivos,
    obtenerUsuarioPorId,
    obtenerRolesUsuario,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    cambiarContrasena,
    asignarRol,
  };
}
