import axios from 'axios';
import { useAuthStore } from '@/store/auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

const getBaseUrl = () => {
  if (API_URL) {
    return API_URL;
  }
  return `${API_BASE}/api`;
};

export const api = axios.create({
  baseURL: `${getBaseUrl()}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    let token = useAuthStore.getState().token;
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('token');
    }
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
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const publicApi = axios.create({
  baseURL: `${getBaseUrl()}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
