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
    <header className="h-16 px-6 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 flex items-center justify-between sticky top-0 z-30 text-slate-900 shadow-xs">
      {/* Search / Context Bar */}
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search system resources..."
            className="pl-9 pr-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white w-64 transition-all shadow-xs font-medium"
          />
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-sans font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          <span>API: Connected (Port 8080)</span>
        </div>
      </div>

      {/* User Status and Controls */}
      <div className="flex items-center gap-3">
        {/* Switch to Main Website Storefront */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-semibold shadow-xs transition-all"
          title="Switch to Customer Storefront (Main Site)"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-700" />
          <span className="hidden sm:inline">View Main Site</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900">{user.fullName}</p>
            <p className="text-xs font-sans font-bold text-emerald-800">
              {roleMeta.label}
            </p>
          </div>

          <div className="h-9 w-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-sans shadow-xs">
            {user.username.slice(0, 2).toUpperCase()}
          </div>
        </div>

        <div className="h-5 w-px bg-slate-200" />

        <button
          onClick={logout}
          title="Sign Out"
          className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
