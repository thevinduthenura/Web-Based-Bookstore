'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuth } from '@/hooks/useAuth';
import { ShieldCheck, LogOut, ArrowRight, LayoutDashboard, Users, MessageSquare, BookOpen, ShoppingBag } from 'lucide-react';

interface AdminModeBarProps {
  showOnStorefront?: boolean;
}

export default function AdminModeBar({ showOnStorefront = false }: AdminModeBarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeUser, setActiveUser] = useState<any>(user);

  useEffect(() => {
    if (user) {
      setActiveUser(user);
      return;
    }
    try {
      const raw = Cookies.get('sp_user') || (typeof window !== 'undefined' ? localStorage.getItem('sp_user') : null);
      if (raw) {
        setActiveUser(JSON.parse(raw));
      } else {
        setActiveUser(null);
      }
    } catch {
      setActiveUser(null);
    }
  }, [user]);

  const handleSignOut = () => {
    logout();
    Cookies.remove('sp_user', { path: '/' });
    if (typeof window !== 'undefined') localStorage.removeItem('sp_user');
    window.dispatchEvent(new Event('sp_user_updated'));
    router.push('/login');
  };

  if (!activeUser) return null;

  return (
    <div className="w-full bg-[#20231B] border-b border-[#34451D] text-xs py-2 px-4 sm:px-6 z-50 text-[#F8F9F5] font-sans">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: ADMIN MODE Pill Badge */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-[#7F9148]/60 bg-[#34451D] text-[#B7D85A] text-[11px] font-semibold tracking-wide uppercase font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B7D85A] animate-pulse" />
            <span>ADMIN MODE</span>
          </div>

          {activeUser && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[#E2E7D8] font-mono text-[11px]">
              <span className="text-[#596B32]">|</span>
              <span className="text-white font-medium">{activeUser.fullName || activeUser.username}</span>
              <span className="text-[#AAB58A]">({(activeUser.role || 'STAFF').replace('_', ' ')})</span>
            </span>
          )}
        </div>

        {/* Right: Navigation Links */}
        <div className="flex items-center gap-4 sm:gap-6 text-[#E2E7D8] font-normal text-xs">
          <Link
            href={activeUser.dashboardPath || '/admin/dashboard'}
            className="hover:text-[#B7D85A] transition-colors flex items-center gap-1"
          >
            <span>Dashboard</span>
          </Link>

          <Link
            href="/admin/staff"
            className="hover:text-[#B7D85A] transition-colors hidden xs:inline"
          >
            <span>Users</span>
          </Link>

          <Link
            href="/admin/customer-service/dashboard"
            className="hover:text-[#B7D85A] transition-colors hidden md:inline"
          >
            <span>Reviews</span>
          </Link>

          <Link
            href="/admin/inventory/dashboard"
            className="hover:text-[#B7D85A] transition-colors hidden sm:inline"
          >
            <span>Rentals</span>
          </Link>

          <Link
            href="/admin/orders/dashboard"
            className="hover:text-[#B7D85A] transition-colors hidden lg:inline"
          >
            <span>Orders</span>
          </Link>

          {showOnStorefront && (
            <Link
              href={activeUser.dashboardPath || '/admin/dashboard'}
              className="inline-flex items-center gap-1 text-[#B7D85A] hover:text-white font-medium text-xs transition-colors"
            >
              <span>Go to Admin Panel</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}

          {/* Sign out link */}
          <button
            onClick={handleSignOut}
            className="text-red-400 hover:text-red-300 font-medium transition-colors flex items-center gap-1"
            title="Sign out of admin session"
          >
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
