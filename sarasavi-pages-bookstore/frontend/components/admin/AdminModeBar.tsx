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
    <div className="w-full bg-[#122215] border-b border-[#243d29] text-xs py-2 px-4 sm:px-6 z-50 text-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: ADMIN MODE Pill Badge */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-emerald-400/40 bg-emerald-500/20 text-emerald-300 text-[11px] font-medium tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ADMIN MODE</span>
          </div>

          {user && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[#8ca38f] font-mono text-[11px]">
              <span className="text-[#3b543e]">|</span>
              <span className="text-[#cadbc8] font-medium">{user.fullName || user.username}</span>
              <span className="text-[#7d9981]">({user.role.replace('_', ' ')})</span>
            </span>
          )}
        </div>

        {/* Right: Navigation Links */}
        <div className="flex items-center gap-4 sm:gap-6 text-[#cadbc8] font-normal text-xs">
          <Link
            href="/admin/dashboard"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span>Dashboard</span>
          </Link>

          <Link
            href="/admin/staff"
            className="hover:text-white transition-colors hidden xs:inline"
          >
            <span>Users</span>
          </Link>

          <Link
            href="/admin/customer-service/dashboard"
            className="hover:text-white transition-colors hidden md:inline"
          >
            <span>Reviews</span>
          </Link>

          <Link
            href="/admin/inventory/dashboard"
            className="hover:text-white transition-colors hidden sm:inline"
          >
            <span>Rentals</span>
          </Link>

          <Link
            href="/admin/orders/dashboard"
            className="hover:text-white transition-colors hidden lg:inline"
          >
            <span>Orders</span>
          </Link>

          {showOnStorefront && (
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200 font-medium text-xs transition-colors"
            >
              <span>Go to Admin Panel</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}

          {/* Sign out link */}
          <button
            onClick={handleSignOut}
            className="text-red-300 hover:text-red-200 font-medium transition-colors flex items-center gap-1"
            title="Sign out of admin session"
          >
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
