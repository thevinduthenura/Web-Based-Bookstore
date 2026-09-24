'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ShieldCheck, LogOut, ArrowRight, LayoutDashboard, Users, MessageSquare, BookOpen, ShoppingBag } from 'lucide-react';

interface AdminModeBarProps {
  showOnStorefront?: boolean;
}

export default function AdminModeBar({ showOnStorefront = false }: AdminModeBarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="w-full bg-[#20231B] border-b border-[#34451D] text-xs py-2 px-4 sm:px-6 z-50 text-[#efead5] font-sans">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: ADMIN MODE Pill Badge */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-[#7F9148]/60 bg-[#34451D] text-[#B7D85A] text-[11px] font-semibold tracking-wide uppercase font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B7D85A] animate-pulse" />
            <span>ADMIN MODE</span>
          </div>

          {user && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[#CDD3B5] font-mono text-[11px]">
              <span className="text-[#596B32]">|</span>
              <span className="text-[#efead5] font-medium">{user.fullName || user.username}</span>
              <span className="text-[#AAB58A]">({user.role.replace('_', ' ')})</span>
            </span>
          )}
        </div>

        {/* Right: Navigation Links */}
        <div className="flex items-center gap-4 sm:gap-6 text-[#CDD3B5] font-normal text-xs">
          <Link
            href="/admin/dashboard"
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
              href="/admin/dashboard"
              className="inline-flex items-center gap-1 text-[#B7D85A] hover:text-[#efead5] font-medium text-xs transition-colors"
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
