import { useCallback, useEffect, useState } from 'react';
import api from '@/libreria/api';
import { mensajeDeError } from '@/libreria/utilidades';

export interface CargoDisponible {
  /** Código del rol: es el valor que se envía como cargo. */
  codigo: string;
  /** Nombre visible del rol. */
  nombre: string;
  descripcion?: string | null;
}

/**
 * Cargos disponibles para el personal.
 *
 * El cargo del personal ES el código de un rol activo, por eso la lista
 * viene del backend (GET /personal/cargos) y no de una lista fija en el
 * formulario. Así el administrador decide desde /roles qué cargos existen.
 */
export function usarCargosPersonal() {
  const [cargos, setCargos] = useState<CargoDisponible[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const obtenerCargos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const respuesta = await api.get('/personal/cargos');
      setCargos(Array.isArray(respuesta.data) ? respuesta.data : []);
    } catch (err: any) {
      setError(mensajeDeError(err, 'Error al cargar los cargos disponibles'));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    obtenerCargos();
  }, [obtenerCargos]);

  return {
    cargos,
    cargando,
    error,
    recargar: obtenerCargos,
  };
}
