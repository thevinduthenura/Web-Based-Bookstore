'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ShieldCheck, LogOut, Bell, Search, ExternalLink, Globe } from 'lucide-react';
import { ROLE_META } from '@/types/admin';

export default function Header() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const roleMeta = ROLE_META[user.role] ?? {
    label: user.role,
    color: 'text-brand-400',
    module: 'Admin',
  };

  return (
    <header className="h-16 px-6 bg-[#efead5]/95 backdrop-blur-xl border-b border-[#CDD3B5] flex items-center justify-between sticky top-0 z-30 text-[#20231B] shadow-xs font-sans">
      {/* Search / Context Bar */}
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-[#85887A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search system resources..."
            className="pl-9 pr-4 py-1.5 rounded-full bg-[#efead5] border border-[#CDD3B5] text-xs text-[#20231B] placeholder:text-[#85887A] focus:outline-none focus:border-[#596B32] focus:bg-[#efead5] w-64 transition-all shadow-xs font-medium"
          />
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#E4E7D2] text-[#34451D] border border-[#CDD3B5] text-[11px] font-mono font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#596B32] animate-pulse" />
          <span>API: Connected (Port 8080)</span>
        </div>
      </div>

      {/* User Status and Controls */}
      <div className="flex items-center gap-3">
        {/* Switch to Main Website Storefront */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#efead5] hover:bg-[#E4E7D2] border border-[#CDD3B5] text-[#20231B] text-xs font-medium shadow-xs transition-all"
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

          <div className="h-9 w-9 rounded-2xl bg-[#34451D] text-[#efead5] flex items-center justify-center font-semibold text-xs font-display shadow-xs">
            {user.username.slice(0, 2).toUpperCase()}
          </div>
        </div>

        <div className="h-5 w-px bg-[#CDD3B5]" />

        <button
          onClick={logout}
          title="Sign Out"
          className="p-2 rounded-xl text-[#85887A] hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
