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
  ChevronRight,
  Globe
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
    <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200/90 flex flex-col justify-between h-screen sticky top-0 text-slate-900 shadow-sm z-20">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <div className="flex gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
          <div>
            <span className="text-base text-slate-900 tracking-tight block font-bold leading-none">
              sarasavi <span className="text-emerald-700">pages</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">Admin Control Hub</span>
          </div>
        </div>

        {/* User Role Banner */}
        <div className="px-4 py-3 mx-3 my-3 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Current Access
            </span>
            <span className={`text-[10px] font-sans px-2 py-0.5 rounded-full font-bold ${
              user.role === 'SUPER_ADMIN' 
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                : 'bg-slate-200 text-slate-800'
            }`}>
              {user.role === 'SUPER_ADMIN' ? 'FULL ACCESS' : 'LIMITED'}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-900 mt-1.5 truncate">{user.fullName}</p>
          <p className="text-xs text-emerald-800 font-bold font-sans mt-0.5">{user.role}</p>
        </div>

        {/* Navigation links */}
        <nav className="px-3 space-y-1 mt-2">
          <div className="px-3 py-1.5 text-[11px] uppercase font-bold tracking-wider text-slate-500">
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
                    ? 'bg-slate-900 text-white shadow-sm font-semibold'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-700'
                  }`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-bold ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
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
      <div className="p-3 border-t border-slate-200/80 space-y-1">
        <Link
          href="/"
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-emerald-700" />
            <span>Customer Storefront</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>

        <button
          onClick={logout}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:text-rose-800 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-200"
        >
          <div className="flex items-center gap-2.5">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-rose-400" />
        </button>
      </div>
    </aside>
  );
}
