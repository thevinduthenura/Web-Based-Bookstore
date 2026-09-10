'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import apiClient from '@/lib/api-client';
import type { AuthUser, LoginRequest, StaffRole } from '@/types/admin';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  hasRole: (role: StaffRole) => boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Restore session from cookie on mount
  useEffect(() => {
    const stored = Cookies.get('sp_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        Cookies.remove('sp_user');
        Cookies.remove('sp_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    const { data } = await apiClient.post('/auth/login', credentials);
    const authUser: AuthUser = data.data;

    // Persist in cookies (expires in 1 day)
    Cookies.set('sp_token', authUser.token, { expires: 1, sameSite: 'strict' });
    Cookies.set('sp_user', JSON.stringify(authUser), { expires: 1, sameSite: 'strict' });

    setUser(authUser);
    router.push(authUser.dashboardPath);
  };

  const logout = () => {
    Cookies.remove('sp_token');
    Cookies.remove('sp_user');
    setUser(null);
    router.push('/login');
  };

  const hasRole = (role: StaffRole) => user?.role === role;
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasRole, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
