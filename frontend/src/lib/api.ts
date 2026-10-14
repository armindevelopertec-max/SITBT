import axios from 'axios';
import { usarAlmacenAutenticacion } from '@/store/almacen-autenticacion';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

const obtenerUrlBase = () => {
  if (API_URL) {
    return API_URL;
  }
  return `${API_BASE}/api`;
};

export const api = axios.create({
  baseURL: `${obtenerUrlBase()}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    let token = usarAlmacenAutenticacion.getState().tokenAcceso;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
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

export const publicApi = axios.create({
  baseURL: `${obtenerUrlBase()}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
