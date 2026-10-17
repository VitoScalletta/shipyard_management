import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

// NestJS Backend adresimiz (.env'de yoksa varsayılan olarak localhost:3000/api kullanır)
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Her istekte AuthStore'daki token'ı otomatik olarak Header'a ekle
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});