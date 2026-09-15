// TypeScript types for the Admin & Staff Management module (M1)
// Owner: Gunathilaka H.D.T.T. (IT25101540)

export type StaffRole =
  | 'SUPER_ADMIN'
  | 'PAYMENT_ADMIN'
  | 'CUSTOMER_SERVICE_ADMIN'
  | 'INVENTORY_ADMIN'
  | 'ACCOUNT_ADMIN'
  | 'ORDER_ADMIN';

export interface StaffMember {
  id: number;
  username: string;
  fullName: string;
  email: string;
  itNumber: string;
  role: StaffRole;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
  lastLoginAt: string | null;
}

export interface AuditLogEntry {
  id: number;
  performedBy: string;
  action: AuditAction;
  targetUsername: string | null;
  description: string;
  timestamp: string;
}

export type AuditAction =
  | 'STAFF_CREATED'
  | 'STAFF_UPDATED'
  | 'STAFF_DEACTIVATED'
  | 'STAFF_ACTIVATED'
  | 'STAFF_LOGIN'
  | 'STAFF_ROLE_CHANGED'
  | 'STAFF_PASSWORD_RESET'
  | 'STAFF_DELETED';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthUser {
  staffId: number;
  username: string;
  fullName: string;
  role: StaffRole;
  token: string;
  tokenType: string;
  expiresIn: number;
  dashboardPath: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// Role display metadata for UI
export const ROLE_META: Record<StaffRole, { label: string; color: string; module: string; path: string }> = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    color: 'text-brand-400',
    module: 'All Modules',
    path: '/admin/dashboard',
  },
  PAYMENT_ADMIN: {
    label: 'Payment Admin',
    color: 'text-emerald-400',
    module: 'Payment',
    path: '/admin/payment/dashboard',
  },
  CUSTOMER_SERVICE_ADMIN: {
    label: 'Customer Service Admin',
    color: 'text-sky-400',
    module: 'Customer Service',
    path: '/admin/customer-service/dashboard',
  },
  INVENTORY_ADMIN: {
    label: 'Inventory Admin',
    color: 'text-violet-400',
    module: 'Inventory & Catalog',
    path: '/admin/inventory/dashboard',
  },
  ACCOUNT_ADMIN: {
    label: 'Account Admin',
    color: 'text-pink-400',
    module: 'User Accounts',
    path: '/admin/accounts/dashboard',
  },
  ORDER_ADMIN: {
    label: 'Order Admin',
    color: 'text-amber-400',
    module: 'Orders & Cart',
    path: '/admin/orders/dashboard',
  },
};
