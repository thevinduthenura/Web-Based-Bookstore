import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT from cookie ───────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('sp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 → redirect to login ─────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('sp_token');
      Cookies.remove('sp_user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
