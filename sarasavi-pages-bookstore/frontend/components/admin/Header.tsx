'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ShieldCheck, LogOut, Bell, Search, ExternalLink, Globe, Menu } from 'lucide-react';
import { ROLE_META } from '@/types/admin';

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
}

export default function Header({ onToggleMobileSidebar }: HeaderProps = {}) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const roleMeta = ROLE_META[user.role] ?? {
    label: user.role,
    color: 'text-brand-400',
    module: 'Admin',
  };

  return (
    <header className="h-16 px-4 sm:px-6 bg-[#FFFFFF]/95 backdrop-blur-xl border-b border-[#E2E7D8] flex items-center justify-between sticky top-0 z-30 text-[#20231B] shadow-xs font-sans">
      {/* Mobile Hamburger & Search / Context Bar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 -ml-1 rounded-xl text-[#34451D] hover:bg-[#F0F4E8] border border-transparent hover:border-[#E2E7D8] lg:hidden transition-all active:scale-95"
          aria-label="Open Admin Menu"
        >
          <Menu className="w-5 h-5 text-[#34451D]" />
        </button>

        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-[#707365] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search system resources..."
            className="pl-9 pr-4 py-1.5 rounded-full bg-[#F8F9F5] border border-[#E2E7D8] text-xs text-[#20231B] placeholder:text-[#707365] focus:outline-none focus:border-[#596B32] focus:bg-[#FFFFFF] w-64 transition-all shadow-xs font-medium"
          />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-[#EBF0E4] text-[#34451D] border border-[#DCE3D2] text-[10px] sm:text-[11px] font-mono font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#596B32] animate-pulse" />
          <span className="hidden sm:inline">API: Connected (Port 8080)</span>
          <span className="sm:hidden">Port 8080</span>
        </div>
      </div>

      {/* User Status and Controls */}
      <div className="flex items-center gap-3">
        {/* Switch to Main Website Storefront */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] hover:bg-[#F0F4E8] border border-[#E2E7D8] text-[#20231B] text-xs font-medium shadow-xs transition-all"
          title="Switch to Customer Storefront (Main Site)"
        >
          <Globe className="w-3.5 h-3.5 text-[#596B32]" />
          <span className="hidden sm:inline">View Main Site</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-[#20231B]">{user.fullName}</p>
            <p className="text-xs font-mono font-semibold text-[#596B32]">
              {roleMeta.label}
            </p>
          </div>

          <div className="h-9 w-9 rounded-2xl bg-[#34451D] text-white flex items-center justify-center font-semibold text-xs font-display shadow-xs">
            {user.username.slice(0, 2).toUpperCase()}
          </div>
        </div>

        <div className="h-5 w-px bg-[#E2E7D8]" />

        <button
          onClick={logout}
          title="Sign Out"
          className="p-2 rounded-xl text-[#707365] hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
