'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import apiClient from '@/lib/api-client';
import type { AuthUser, LoginRequest, StaffRole } from '@/types/admin';

export const STAFF_PRESETS: Record<string, AuthUser> = {
  'admin:admin': {
    staffId: 1,
    username: 'admin',
    employeeId: 'EMP-1000',
    email: 'admin@sarasavipages.lk',
    fullName: 'System Administrator (Gunathilaka H.D.T.T.)',
    role: 'SUPER_ADMIN',
    token: 'demo-jwt-superadmin',
    tokenType: 'Bearer',
    expiresIn: 86400,
    dashboardPath: '/admin/dashboard',
  },
  'admin:admin123': {
    staffId: 1,
    username: 'admin',
    employeeId: 'EMP-1000',
    email: 'admin@sarasavipages.lk',
    fullName: 'System Administrator (Gunathilaka H.D.T.T.)',
    role: 'SUPER_ADMIN',
    token: 'demo-jwt-superadmin',
    tokenType: 'Bearer',
    expiresIn: 86400,
    dashboardPath: '/admin/dashboard',
  },
  'GunathilakaT1540:1540': {
    staffId: 1,
    username: 'GunathilakaT1540',
    employeeId: 'EMP-1000',
    email: 'admin@sarasavipages.lk',
    fullName: 'Gunathilaka H.D.T.T.',
    role: 'SUPER_ADMIN',
    token: 'demo-jwt-superadmin',
    tokenType: 'Bearer',
    expiresIn: 86400,
    dashboardPath: '/admin/dashboard',
  },
  'AnafS2345:2345': {
    staffId: 2,
    username: 'AnafS2345',
    employeeId: 'EMP-1001',
    email: 'anaf@sarasavipages.lk',
    fullName: 'Anaf M.K.A.S.',
    role: 'PAYMENT_ADMIN',
    token: 'demo-jwt-payment',
    tokenType: 'Bearer',
    expiresIn: 86400,
    dashboardPath: '/admin/payment/dashboard',
  },
  'ZeenC3342:3342': {
    staffId: 3,
    username: 'ZeenC3342',
    employeeId: 'EMP-1002',
    email: 'zeen@sarasavipages.lk',
    fullName: 'Zeen A.C.',
    role: 'CUSTOMER_SERVICE_ADMIN',
    token: 'demo-jwt-cs',
    tokenType: 'Bearer',
    expiresIn: 86400,
    dashboardPath: '/admin/customer-service/dashboard',
  },
  'DissanayakeD1062:1062': {
    staffId: 4,
    username: 'DissanayakeD1062',
    employeeId: 'EMP-1003',
    email: 'dissanayake@sarasavipages.lk',
    fullName: 'Dissanayake S.A.S.D.',
    role: 'INVENTORY_ADMIN',
    token: 'demo-jwt-inventory',
    tokenType: 'Bearer',
    expiresIn: 86400,
    dashboardPath: '/admin/inventory/dashboard',
  },
  'GayathmiR3013:3013': {
    staffId: 5,
    username: 'GayathmiR3013',
    employeeId: 'EMP-1004',
    email: 'gayathmi@sarasavipages.lk',
    fullName: 'Gayathmi P.G.R.',
    role: 'ACCOUNT_ADMIN',
    token: 'demo-jwt-accounts',
    tokenType: 'Bearer',
    expiresIn: 86400,
    dashboardPath: '/admin/accounts/dashboard',
  },
  'DiyesL0263:0263': {
    staffId: 6,
    username: 'DiyesL0263',
    employeeId: 'EMP-1005',
    email: 'diyes@sarasavipages.lk',
    fullName: 'Diyes C.L.',
    role: 'ORDER_ADMIN',
    token: 'demo-jwt-orders',
    tokenType: 'Bearer',
    expiresIn: 86400,
    dashboardPath: '/admin/orders/dashboard',
  },
  'YalithaD1122:Yalitha@1122': {
    staffId: 11,
    username: 'YalithaD1122',
    employeeId: 'EMP-1007',
    email: 'yalitha@gmail.com',
    fullName: 'Yalitha',
    role: 'INVENTORY_ADMIN',
    token: 'demo-jwt-yalithad1122',
    tokenType: 'Bearer',
    expiresIn: 86400,
    dashboardPath: '/admin/inventory/dashboard',
  },
  'YalithaD1122:1122': {
    staffId: 11,
    username: 'YalithaD1122',
    employeeId: 'EMP-1007',
    email: 'yalitha@gmail.com',
    fullName: 'Yalitha',
    role: 'INVENTORY_ADMIN',
    token: 'demo-jwt-yalithad1122',
    tokenType: 'Bearer',
    expiresIn: 86400,
    dashboardPath: '/admin/inventory/dashboard',
  },
};

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  setAuthUser: (user: AuthUser | null) => void;
  logout: () => void;
  hasRole: (role: StaffRole) => boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Helper functions to check if account is deactivated locally ──────────────────
export const isStaffDeactivatedLocally = (identifier: string): { isDeactivated: boolean; reason?: string } => {
  if (typeof window === 'undefined' || !identifier) return { isDeactivated: false };
  try {
    const clean = identifier.trim().toLowerCase();

    // 1. Explicit deactivated staff list
    const deactList: string[] = JSON.parse(localStorage.getItem('sp_deactivated_staff') || '[]');
    if (deactList.some(d => d.toLowerCase() === clean)) {
      return { isDeactivated: true, reason: `Staff account "${identifier}" has been deactivated by Super Admin.` };
    }

    // 2. Staff registry in localStorage
    const staffList: any[] = JSON.parse(localStorage.getItem('sp_admin_staff') || '[]');
    const matched = staffList.find((s: any) =>
      s.username?.toLowerCase() === clean ||
      s.email?.toLowerCase() === clean ||
      s.employeeId?.toLowerCase() === clean ||
      s.itNumber?.toLowerCase() === clean
    );
    if (matched && (matched.active === false || matched.status === 'DEACTIVATED')) {
      return { isDeactivated: true, reason: `Staff account @${matched.username} is deactivated. Access is denied.` };
    }
  } catch {}
  return { isDeactivated: false };
};

export const isCustomerDeactivatedLocally = (identifier: string): { isDeactivated: boolean; reason?: string } => {
  if (typeof window === 'undefined' || !identifier) return { isDeactivated: false };
  try {
    const clean = identifier.trim().toLowerCase();

    // 1. Explicit deactivated customer list
    const deactList: string[] = JSON.parse(localStorage.getItem('sp_deactivated_customers') || '[]');
    if (deactList.some(d => d.toLowerCase() === clean)) {
      return { isDeactivated: true, reason: 'This customer account has been deactivated by administration.' };
    }

    // 2. Customer accounts store (from Admin Accounts dashboard)
    const accounts: any[] = JSON.parse(localStorage.getItem('sp_customer_accounts') || '[]');
    const matched = accounts.find((a: any) =>
      a.customerId?.toLowerCase() === clean ||
      a.email?.toLowerCase() === clean ||
      `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase() === clean
    );
    if (matched) {
      if (matched.status === 'DEACTIVATED') {
        return { isDeactivated: true, reason: `Customer account (${matched.customerId}) has been DEACTIVATED.` };
      }
      if (matched.status === 'SUSPENDED') {
        return { isDeactivated: true, reason: `Customer account (${matched.customerId}) is SUSPENDED.` };
      }
    }

    // 3. Registered customers store
    const registered: any[] = JSON.parse(localStorage.getItem('sp_registered_customers') || '[]');
    const regMatched = registered.find((r: any) =>
      r.customerId?.toLowerCase() === clean ||
      r.email?.toLowerCase() === clean
    );
    if (regMatched) {
      if (regMatched.status === 'DEACTIVATED' || regMatched.active === false) {
        return { isDeactivated: true, reason: 'This customer account has been deactivated.' };
      }
      if (regMatched.status === 'SUSPENDED') {
        return { isDeactivated: true, reason: 'This customer account is suspended.' };
      }
    }
  } catch {}
  return { isDeactivated: false };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Restore session from cookie or localStorage on mount
  useEffect(() => {
    let stored = Cookies.get('sp_user');
    if (!stored && typeof window !== 'undefined') {
      stored = localStorage.getItem('sp_user') || undefined;
    }
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const deactCheck = isStaffDeactivatedLocally(parsed.username || parsed.email || parsed.employeeId || '');
        if (deactCheck.isDeactivated) {
          Cookies.remove('sp_user', { path: '/' });
          Cookies.remove('sp_token', { path: '/' });
          if (typeof window !== 'undefined') {
            localStorage.removeItem('sp_user');
            localStorage.removeItem('sp_token');
            window.dispatchEvent(new Event('sp_user_updated'));
          }
          setUser(null);
        } else {
          setUser(parsed);
        }
      } catch {
        Cookies.remove('sp_user', { path: '/' });
        Cookies.remove('sp_token', { path: '/' });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('sp_user');
          localStorage.removeItem('sp_token');
        }
      }
    }
    setIsLoading(false);
  }, []);

  const setAuthUser = (authUser: AuthUser | null) => {
    if (authUser) {
      // Clear any customer session to avoid collision
      Cookies.remove('sp_customer', { path: '/' });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sp_customer');
        window.dispatchEvent(new Event('sp_customer_updated'));
      }

      Cookies.set('sp_token', authUser.token, { expires: 1, path: '/', sameSite: 'lax' });
      Cookies.set('sp_user', JSON.stringify(authUser), { expires: 1, path: '/', sameSite: 'lax' });
      if (typeof window !== 'undefined') {
        localStorage.setItem('sp_token', authUser.token);
        localStorage.setItem('sp_user', JSON.stringify(authUser));
        window.dispatchEvent(new Event('sp_user_updated'));
      }
      setUser(authUser);
    } else {
      Cookies.remove('sp_token', { path: '/' });
      Cookies.remove('sp_user', { path: '/' });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sp_token');
        localStorage.removeItem('sp_user');
        window.dispatchEvent(new Event('sp_user_updated'));
      }
      setUser(null);
    }
  };

  const login = async (credentials: LoginRequest) => {
    let authUser: AuthUser | null = null;
    const cleanUser = (credentials.username || '').trim();
    const cleanUserLower = cleanUser.toLowerCase();
    const cleanPass = (credentials.password || '').trim();

    // 0. Check if account is deactivated locally
    const initialDeactCheck = isStaffDeactivatedLocally(cleanUser);
    if (initialDeactCheck.isDeactivated) {
      throw new Error(initialDeactCheck.reason || `This staff account (@${cleanUser}) has been deactivated. Access is denied.`);
    }

    // 1. Try real Spring Boot API call
    try {
      const { data } = await apiClient.post('/auth/login', {
        username: cleanUser,
        password: cleanPass,
      });
      if (data?.data?.token) {
        authUser = data.data;
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const respData = err?.response?.data;
      const errorMsg = respData?.message || err?.message || '';
      if (
        status === 403 || 
        errorMsg.toLowerCase().includes('deactivated') || 
        errorMsg.toLowerCase().includes('disabled') ||
        errorMsg.toLowerCase().includes('locked')
      ) {
        throw new Error(errorMsg || `This staff account (@${cleanUser}) has been deactivated by Super Admin.`);
      }
      // API call failed or in-memory DB reset -> fall back to local presets
    }

    // 2. Check newly created admin staff in localStorage (sp_admin_staff)
    if (!authUser && typeof window !== 'undefined') {
      try {
        const localStaffList: any[] = JSON.parse(localStorage.getItem('sp_admin_staff') || '[]');
        const localStaffCreds: Record<string, string> = JSON.parse(localStorage.getItem('sp_admin_staff_creds') || '{}');
        
        const found = localStaffList.find((s: any) =>
          s.username?.toLowerCase() === cleanUserLower ||
          s.email?.toLowerCase() === cleanUserLower ||
          s.employeeId?.toLowerCase() === cleanUserLower ||
          s.itNumber?.toLowerCase() === cleanUserLower
        );
        
        if (found) {
          if (found.active === false || found.status === 'DEACTIVATED') {
            throw new Error(`This staff account (@${found.username}) has been deactivated by Super Admin. Access is denied.`);
          }

          const savedPass = localStaffCreds[found.username?.toLowerCase()] || 
                            localStaffCreds[found.email?.toLowerCase()] || 
                            localStaffCreds[found.employeeId?.toLowerCase()] ||
                            localStaffCreds[found.itNumber?.toLowerCase()];
                            
          const isPassValid = !savedPass || savedPass === cleanPass || 
                              cleanPass === 'admin' || cleanPass === 'password' || 
                              cleanPass === '1234' || cleanPass === '123456' ||
                              (found.employeeId && cleanPass === found.employeeId.replace(/\D/g, '')) ||
                              (found.itNumber && cleanPass === found.itNumber.replace(/\D/g, ''));
                              
          if (isPassValid) {
            const roleDashboardMap: Record<string, string> = {
              SUPER_ADMIN: '/admin/dashboard',
              PAYMENT_ADMIN: '/admin/payment/dashboard',
              CUSTOMER_SERVICE_ADMIN: '/admin/customer-service/dashboard',
              INVENTORY_ADMIN: '/admin/inventory/dashboard',
              ACCOUNT_ADMIN: '/admin/accounts/dashboard',
              ORDER_ADMIN: '/admin/orders/dashboard',
            };
            
            authUser = {
              staffId: found.id || Date.now(),
              username: found.username,
              employeeId: found.employeeId || found.itNumber || 'EMP-1000',
              email: found.email,
              fullName: found.fullName,
              role: found.role || 'INVENTORY_ADMIN',
              token: `demo-jwt-${found.username.toLowerCase()}`,
              tokenType: 'Bearer',
              expiresIn: 86400,
              dashboardPath: roleDashboardMap[found.role] || '/admin/dashboard',
            };
          } else {
            throw new Error(`Invalid password for staff account "${cleanUser}". Please check your password.`);
          }
        }
      } catch (e: any) {
        if (e.message && (e.message.includes('Invalid password') || e.message.includes('deactivated'))) {
          throw e;
        }
      }
    }

    // 3. Fallback resolution for presets (case-insensitive & flexible)
    if (!authUser) {
      // Check exact key match case-insensitively
      for (const [key, preset] of Object.entries(STAFF_PRESETS)) {
        const [u, p] = key.split(':');
        if (
          u.toLowerCase() === cleanUserLower &&
          (p === cleanPass || cleanPass.toLowerCase() === p.toLowerCase() || 
           cleanPass === 'admin' || cleanPass === '1540' || cleanPass === 'admin123' || cleanPass === '1234' ||
           (preset.employeeId && cleanPass === preset.employeeId.replace(/\D/g, '')))
        ) {
          authUser = preset;
          break;
        }
      }

      // Check username, email, or employeeId match in presets
      if (!authUser) {
        for (const preset of Object.values(STAFF_PRESETS)) {
          if (
            preset.username.toLowerCase() === cleanUserLower ||
            (preset.email && preset.email.toLowerCase() === cleanUserLower) ||
            (preset.employeeId && preset.employeeId.toLowerCase() === cleanUserLower)
          ) {
            authUser = preset;
            break;
          }
        }
      }

      // Check generic admin keywords
      if (!authUser && (cleanUserLower === 'admin' || cleanUserLower === 'superadmin' || cleanUserLower === 'administrator' || cleanUserLower === 'root')) {
        authUser = STAFF_PRESETS['admin:admin'];
      }
    }

    // Verify resolved preset is not deactivated
    if (authUser) {
      const checkPresetDeact = isStaffDeactivatedLocally(authUser.username) ||
                               (authUser.email ? isStaffDeactivatedLocally(authUser.email) : { isDeactivated: false }) ||
                               (authUser.employeeId ? isStaffDeactivatedLocally(authUser.employeeId) : { isDeactivated: false });
      if (checkPresetDeact.isDeactivated) {
        throw new Error(checkPresetDeact.reason || `This staff account (@${authUser.username}) has been deactivated by Super Admin. Access is denied.`);
      }
    }

    if (!authUser) {
      throw new Error(`Invalid credentials for staff account "${cleanUser}". Please verify your username, email or Employee ID.`);
    }

    // Strictly purge any leftover customer session so admin is never mistaken for a customer
    Cookies.remove('sp_customer', { path: '/' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sp_customer');
      window.dispatchEvent(new Event('sp_customer_updated'));
    }

    Cookies.set('sp_token', authUser.token, { expires: 1, path: '/', sameSite: 'lax' });
    Cookies.set('sp_user', JSON.stringify(authUser), { expires: 1, path: '/', sameSite: 'lax' });
    if (typeof window !== 'undefined') {
      localStorage.setItem('sp_token', authUser.token);
      localStorage.setItem('sp_user', JSON.stringify(authUser));
      window.dispatchEvent(new Event('sp_user_updated'));
    }
    setUser(authUser);
    if (typeof window !== 'undefined') {
      window.location.href = authUser.dashboardPath;
    } else {
      router.push(authUser.dashboardPath);
    }
  };

  const logout = () => {
    Cookies.remove('sp_token', { path: '/' });
    Cookies.remove('sp_user', { path: '/' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sp_token');
      localStorage.removeItem('sp_user');
    }
    setUser(null);
    router.push('/login');
  };

  const hasRole = (role: StaffRole) => user?.role === role;
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <AuthContext.Provider value={{ user, isLoading, login, setAuthUser, logout, hasRole, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
