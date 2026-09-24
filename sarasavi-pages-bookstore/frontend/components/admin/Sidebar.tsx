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
  Globe,
  X
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

interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isMobileOpen = false, onClose }: SidebarProps = {}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  // Filter navigation items accessible to the current logged-in role
  const visibleNav = NAV_ITEMS.filter((item) => item.allowedRoles.includes(user.role));

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-[#20231B]/50 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#efead5] border-r border-[#CDD3B5] flex flex-col justify-between h-full shadow-2xl transition-transform duration-300 ease-in-out font-sans
        lg:static lg:w-64 lg:h-screen lg:sticky lg:top-0 lg:shadow-sm lg:translate-x-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div>
          <div className="p-4 sm:p-5 border-b border-[#CDD3B5] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[#34451D] flex items-center justify-center text-[#efead5] flex-shrink-0 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B7D85A]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7F9148]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#efead5]" />
                </div>
              </div>
              <div>
                <span className="text-base text-[#20231B] tracking-tight block font-display font-light leading-none">
                  sarasavi <span className="text-[#596B32] font-normal">pages</span>
                </span>
                <span className="text-[11px] text-[#85887A] font-medium mt-1 block">Admin Control Hub</span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#85887A] hover:text-[#20231B] hover:bg-[#E4E7D2] lg:hidden"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        {/* User Role Banner */}
        <div className="px-4 py-3 mx-3 my-3 rounded-2xl bg-[#efead5] border border-[#CDD3B5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-[#85887A] font-mono">
              Current Access
            </span>
            <span className={`text-[10px] font-sans px-2 py-0.5 rounded-full font-bold ${
              user.role === 'SUPER_ADMIN' 
                ? 'bg-[#E4E7D2] text-[#34451D] border border-[#CDD3B5]' 
                : 'bg-[#CDD3B5] text-[#20231B]'
            }`}>
              {user.role === 'SUPER_ADMIN' ? 'FULL ACCESS' : 'LIMITED'}
            </span>
          </div>
          <p className="text-xs font-semibold text-[#20231B] mt-1.5 truncate">{user.fullName}</p>
          <p className="text-xs text-[#596B32] font-semibold font-sans mt-0.5">{user.role}</p>
        </div>

        {/* Navigation links */}
        <nav className="px-3 space-y-1 mt-2">
          <div className="px-3 py-1.5 text-[11px] uppercase font-semibold tracking-wider text-[#85887A] font-mono">
            {user.role === 'SUPER_ADMIN' ? 'All Systems' : 'Your Module Access'}
          </div>

          {visibleNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-[#34451D] text-[#efead5] shadow-sm font-semibold'
                    : 'text-[#20231B] hover:text-[#34451D] hover:bg-[#efead5] font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#B7D85A]' : 'text-[#85887A] group-hover:text-[#596B32]'
                  }`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                    isActive
                      ? 'bg-[#596B32]/40 text-[#B7D85A] border border-[#7F9148]/50'
                      : 'bg-[#efead5] text-[#34451D] border border-[#CDD3B5]'
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
      <div className="p-3 border-t border-[#CDD3B5] space-y-1">
        <Link
          href="/"
          onClick={handleLinkClick}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#20231B] hover:text-[#34451D] hover:bg-[#efead5] transition-all"
        >
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-[#596B32]" />
            <span>Customer Storefront</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#85887A]" />
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
    </>
  );
}
