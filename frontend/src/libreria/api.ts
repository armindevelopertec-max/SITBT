import axios from 'axios';
import { usarAlmacenAutenticacion } from '@/almacen/almacen-autenticacion';

const URL_API = process.env.NEXT_PUBLIC_API_URL;
const BASE_API = process.env.NEXT_PUBLIC_API_BASE || '';

const obtenerUrlBase = () => {
  if (URL_API) {
    return URL_API;
  }
  return `${BASE_API}/api`;
};

export const api = axios.create({
  baseURL: `${obtenerUrlBase()}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (configuracion) => {
    const tokenAcceso = usarAlmacenAutenticacion.getState().tokenAcceso;
    if (tokenAcceso) {
      configuracion.headers.Authorization = `Bearer ${tokenAcceso}`;
    }
    return configuracion;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (error.response?.status === 401) {
      usarAlmacenAutenticacion.getState().cerrarSesion();
      if (typeof window !== 'undefined') {
        window.location.href = '/acceder';
      }
    }
    return Promise.reject(error);
  }
);

export const apiPublica = axios.create({
  baseURL: `${obtenerUrlBase()}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
