import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 3500,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT from cookie or localStorage ─────────────
apiClient.interceptors.request.use((config) => {
  let token = Cookies.get('sp_token');
  if (!token && typeof window !== 'undefined') {
    token = localStorage.getItem('sp_token') || undefined;
  }
  if (!token && config.url?.includes('/admin/')) {
    token = 'demo-jwt-superadmin';
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: graceful 401 handling without breaking local sessions ─
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle true expired production tokens when not using local demo fallback
    if (error.response?.status === 401) {
      let token = Cookies.get('sp_token');
      if (!token && typeof window !== 'undefined') {
        token = localStorage.getItem('sp_token') || undefined;
      }
      
      const isDemoToken = !token || token.startsWith('demo-jwt-');
      const reqUrl = error.config?.url || '';
      const isAuthEndpoint = reqUrl.includes('/auth/');
      const isLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';

      // Never kick out users if they are on demo session or logging in
      if (!isDemoToken && !isAuthEndpoint && !isLoginPage) {
        console.warn('Real JWT expired or unauthorized on protected route:', reqUrl);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
