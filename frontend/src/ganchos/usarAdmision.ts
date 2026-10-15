import { useState, useEffect } from 'react';
import { api, apiPublica } from '@/libreria/api';
import { SolicitudAdmision, CrearAdmisionDto, Carrera } from '@/tipos';

export function usarAdmisionPublica() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crearPreRegistro = async (datos: CrearAdmisionDto): Promise<SolicitudAdmision> => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await apiPublica.post<SolicitudAdmision>('/admision', datos);
      return respuesta.data;
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al crear pre-registro');
      throw err;
    } finally {
      setCargando(false);
    }
  };

  const obtenerCarreras = async (): Promise<Carrera[]> => {
    try {
      const respuesta = await apiPublica.get<{ datos: Carrera[] }>('/carreras?estado=activo');
      return respuesta.data.datos;
    } catch (err) {
      console.error('Error fetching carreras:', err);
      return [];
    }
  };

  return {
    crearPreRegistro,
    obtenerCarreras,
    cargando,
    error,
  };
}

export function usarAdmision() {
  const [solicitudes, setSolicitudes] = useState<SolicitudAdmision[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const obtenerSolicitudes = async (parametros?: {
    pagina?: number;
    limite?: number;
    estado?: string;
    origen?: string;
  }) => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await api.get<{
        datos: SolicitudAdmision[];
        total: number;
        pagina: number;
        limite: number;
      }>('/admision', { params: parametros });
      setSolicitudes(respuesta.data.datos);
      setTotal(respuesta.data.total);
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al obtener solicitudes');
    } finally {
      setCargando(false);
    }
  };

  const obtenerSolicitud = async (id: string): Promise<SolicitudAdmision> => {
    const respuesta = await api.get<SolicitudAdmision>(`/admision/${id}`);
    return respuesta.data;
  };

  const verificarSolicitud = async (id: string, verificadoPor: number, observaciones?: string) => {
    const respuesta = await api.post(`/admision/${id}/verificar`, { verificadoPor, observaciones });
    return respuesta.data;
  };

  const rechazarSolicitud = async (id: string, verificadoPor: number, observaciones: string) => {
    const respuesta = await api.post(`/admision/${id}/rechazar`, { verificadoPor, observaciones });
    return respuesta.data;
  };

  const convertirAEstudiante = async (id: string, gestionAdmision: string) => {
    const respuesta = await api.post(`/admision/${id}/convertir-estudiante`, { admissionGestion: gestionAdmision });
    return respuesta.data;
  };

  const obtenerEstadisticas = async () => {
    const respuesta = await api.get('/admision/estadisticas');
    return respuesta.data;
  };

  return {
    solicitudes,
    cargando,
    error,
    total,
    obtenerSolicitudes,
    obtenerSolicitud,
    verificarSolicitud,
    rechazarSolicitud,
    convertirAEstudiante,
    obtenerEstadisticas,
  };
}
