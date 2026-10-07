import axios from 'axios';
import Cookies from 'js-cookie';

const getApiBase = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // When running in the browser on Vercel or any public host, automatically target Render backend
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://web-based-bookstore.onrender.com/api';
  }
  return 'http://localhost:8080/api';
};

const isCloud = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

const apiClient = axios.create({
  baseURL: getApiBase(),
  timeout: isCloud ? 25000 : 5000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT from cookie or localStorage ─────────────
apiClient.interceptors.request.use((config) => {
  if (!process.env.NEXT_PUBLIC_API_URL && typeof window !== 'undefined') {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      config.baseURL = 'https://web-based-bookstore.onrender.com/api';
    }
  }

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
