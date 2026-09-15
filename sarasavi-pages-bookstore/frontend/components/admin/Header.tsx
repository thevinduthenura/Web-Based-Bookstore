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
    <header className="h-16 px-6 bg-surface-card/60 backdrop-blur-md border-b border-surface-border flex items-center justify-between sticky top-0 z-30">
      {/* Search / Context Bar */}
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search system resources..."
            className="pl-9 pr-4 py-1.5 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder:text-ink-faint focus:outline-none focus:border-brand-500 w-64 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>API: Connected (Port 8080)</span>
        </div>
      </div>

      {/* User Status and Controls */}
      <div className="flex items-center gap-3">
        {/* Switch to Main Website Storefront */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface/80 hover:bg-brand-500/10 border border-surface-border hover:border-brand-500/40 text-ink-light hover:text-white text-xs font-semibold shadow-sm transition-all"
          title="Switch to Customer Storefront (Main Site)"
        >
          <Globe className="w-3.5 h-3.5 text-brand-400" />
          <span className="hidden sm:inline">View Main Site</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-white">{user.fullName}</p>
            <p className={`text-[11px] font-mono font-medium ${roleMeta.color}`}>
              {roleMeta.label}
            </p>
          </div>

          <div className="h-9 w-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-xs font-mono">
            {user.username.slice(0, 2).toUpperCase()}
          </div>
        </div>

        <div className="h-5 w-px bg-surface-border" />

        <button
          onClick={logout}
          title="Sign Out"
          className="p-2 rounded-xl text-ink-muted hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
