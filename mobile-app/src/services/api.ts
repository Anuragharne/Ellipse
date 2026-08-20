import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.103:3000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
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
  async (error) => {
    if (error.response && error.response.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
