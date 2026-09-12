'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CreditCard, 
  Headphones, 
  Boxes, 
  UserCheck, 
  ShoppingCart,
  BookOpen,
  LogOut,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import type { StaffRole } from '@/types/admin';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  allowedRoles: StaffRole[];
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  // Super Admin core management
  {
    label: 'Overview',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    allowedRoles: ['SUPER_ADMIN'],
  },
  {
    label: 'Staff Management',
    href: '/admin/staff',
    icon: Users,
    allowedRoles: ['SUPER_ADMIN'],
    badge: 'M1',
  },
  {
    label: 'Audit Trail',
    href: '/admin/audit-logs',
    icon: FileText,
    allowedRoles: ['SUPER_ADMIN'],
    badge: 'M1',
  },
  // Member module sections
  {
    label: 'Payment System',
    href: '/admin/payment/dashboard',
    icon: CreditCard,
    allowedRoles: ['SUPER_ADMIN', 'PAYMENT_ADMIN'],
    badge: 'M2',
  },
  {
    label: 'Customer Service',
    href: '/admin/customer-service/dashboard',
    icon: Headphones,
    allowedRoles: ['SUPER_ADMIN', 'CUSTOMER_SERVICE_ADMIN'],
    badge: 'M3',
  },
  {
    label: 'Inventory & Books',
    href: '/admin/inventory/dashboard',
    icon: Boxes,
    allowedRoles: ['SUPER_ADMIN', 'INVENTORY_ADMIN'],
    badge: 'M4',
  },
  {
    label: 'User Accounts',
    href: '/admin/accounts/dashboard',
    icon: UserCheck,
    allowedRoles: ['SUPER_ADMIN', 'ACCOUNT_ADMIN'],
    badge: 'M5',
  },
  {
    label: 'Orders & Cart',
    href: '/admin/orders/dashboard',
    icon: ShoppingCart,
    allowedRoles: ['SUPER_ADMIN', 'ORDER_ADMIN'],
    badge: 'M6',
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  // Filter navigation items accessible to the current logged-in role
  const visibleNav = NAV_ITEMS.filter((item) => item.allowedRoles.includes(user.role));

  return (
    <aside className="w-64 flex-shrink-0 bg-surface-card border-r border-surface-border flex flex-col justify-between h-screen sticky top-0">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-surface-border flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow flex-shrink-0">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-base text-white tracking-tight font-display block">
              Sarasavi <span className="text-brand-400">Pages</span>
            </span>
            <span className="text-[11px] text-ink-muted">Admin Control Hub</span>
          </div>
        </div>

        {/* User Role Banner */}
        <div className="px-4 py-3 mx-3 my-3 rounded-xl bg-surface border border-surface-border">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-ink-faint">
              Current Access
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
              user.role === 'SUPER_ADMIN' 
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' 
                : 'bg-surface-muted text-ink-muted'
            }`}>
              {user.role === 'SUPER_ADMIN' ? 'FULL ACCESS' : 'LIMITED'}
            </span>
          </div>
          <p className="text-xs font-semibold text-white mt-1 truncate">{user.fullName}</p>
          <p className="text-[11px] text-brand-400 font-mono">{user.role}</p>
        </div>

        {/* Navigation links */}
        <nav className="px-3 space-y-1 mt-2">
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-ink-faint">
            {user.role === 'SUPER_ADMIN' ? 'All Systems' : 'Your Module Access'}
          </div>

          {visibleNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-sm'
                    : 'text-ink-muted hover:text-white hover:bg-surface/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-brand-400' : 'text-ink-faint group-hover:text-white'
                  }`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive
                      ? 'bg-brand-500/20 text-brand-400'
                      : 'bg-surface-border text-ink-faint'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer logout / user profile button */}
      <div className="p-3 border-t border-surface-border">
        <button
          onClick={logout}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-ink-muted hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
        >
          <div className="flex items-center gap-2.5">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-ink-faint" />
        </button>
      </div>
    </aside>
  );
}
