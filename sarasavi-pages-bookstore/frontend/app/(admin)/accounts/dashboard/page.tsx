'use client';

import { useAuth } from '@/hooks/useAuth';
import { 
  UserCheck, 
  Users, 
  ShieldCheck, 
  Mail, 
  Award, 
  Lock,
  UserPlus,
  CheckCircle2
} from 'lucide-react';

export default function AccountsDashboardPage() {
  const { user, isSuperAdmin, hasRole } = useAuth();

  const isAuthorized = isSuperAdmin || hasRole('ACCOUNT_ADMIN');

  if (!isAuthorized) {
    return (
      <div className="glass-card rounded-2xl p-8 max-w-lg mx-auto text-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Access Restricted</h2>
        <p className="text-xs text-ink-muted leading-relaxed">
          You do not have administrative permissions to access Module 5 (User Accounts).
          This panel is exclusively reserved for the Accounts Administrator (Gayathmi P.G.R.) or Super Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            Module 5 — User Accounts Administration
          </div>
          <h1 className="text-2xl font-bold font-display text-white">Customer Profiles & Security</h1>
          <p className="text-xs text-ink-muted mt-1">
            Assigned Owner: <span className="text-pink-400 font-semibold">Gayathmi P.G.R. (IT25103013)</span> • Role: <span className="font-mono text-white">ACCOUNT_ADMIN</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border text-xs font-mono text-pink-400">
            Auth Provider: Native JWT
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Registered Customers</span>
            <div className="h-8 w-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">3,840</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">+120 this week</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Email Verified Rate</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">96.8%</span>
          </div>
          <p className="text-[11px] text-ink-faint mt-1">3,717 Verified Users</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Loyalty Club Members</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">845 Tier 1</span>
          </div>
          <p className="text-[11px] text-amber-400 mt-1">Sarasavi Readers Club</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">MFA Enabled</span>
            <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">42%</span>
          </div>
          <p className="text-[11px] text-sky-400 mt-1">2FA Protected Accounts</p>
        </div>
      </div>

      {/* Customer Accounts Directory Table */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">Registered Customer Profiles</h2>
          <span className="text-xs text-ink-muted font-mono">Module 5 Scope</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/80 border-b border-surface-border text-ink-faint uppercase text-[10px] font-semibold">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Loyalty Tier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              <tr className="hover:bg-surface/40 transition-colors">
                <td className="py-3 px-4 font-semibold text-white">Nuwan Fernando</td>
                <td className="py-3 px-4 font-mono text-ink-muted">nuwan.f@gmail.com</td>
                <td className="py-3 px-4 font-mono text-ink-faint">+94 77 123 4567</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono">
                    Gold Reader
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                    Active
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-ink-faint">2026-01-15</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
