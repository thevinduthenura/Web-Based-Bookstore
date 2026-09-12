'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api-client';
import { 
  Users, 
  ShieldCheck, 
  Activity, 
  Layers, 
  CreditCard, 
  Headphones, 
  Boxes, 
  UserCheck, 
  ShoppingCart,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import type { AuditLogEntry, StaffMember } from '@/types/admin';

const TEAM_MEMBERS = [
  {
    id: 1,
    name: 'Gunathilaka H.D.T.T.',
    itNumber: 'IT25101540',
    username: 'GunathilakaT1540',
    module: 'M1: Admin & Staff Management',
    role: 'SUPER_ADMIN',
    roleBadge: 'Super Admin',
    path: '/admin/staff',
    badgeColor: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
    isSuper: true,
  },
  {
    id: 2,
    name: 'Anaf M.K.A.S.',
    itNumber: 'IT25102345',
    username: 'AnafS2345',
    module: 'M2: Payment Management',
    role: 'PAYMENT_ADMIN',
    roleBadge: 'Payment Admin',
    path: '/admin/payment/dashboard',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  {
    id: 3,
    name: 'Zeen A.C.',
    itNumber: 'IT25103342',
    username: 'ZeenC3342',
    module: 'M3: Customer Service & Tickets',
    role: 'CUSTOMER_SERVICE_ADMIN',
    roleBadge: 'Customer Service Admin',
    path: '/admin/customer-service/dashboard',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  },
  {
    id: 4,
    name: 'Dissanayake S.A.S.D.',
    itNumber: 'IT25101062',
    username: 'DissanayakeD1062',
    module: 'M4: Inventory & Catalog',
    role: 'INVENTORY_ADMIN',
    roleBadge: 'Inventory Admin',
    path: '/admin/inventory/dashboard',
    badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  },
  {
    id: 5,
    name: 'Gayathmi P.G.R.',
    itNumber: 'IT25103013',
    username: 'GayathmiR3013',
    module: 'M5: User Accounts & Profiles',
    role: 'ACCOUNT_ADMIN',
    roleBadge: 'Account Admin',
    path: '/admin/accounts/dashboard',
    badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  },
  {
    id: 6,
    name: 'Diyes C.L.',
    itNumber: 'IT25100263',
    username: 'DiyesL0263',
    module: 'M6: Orders & Shopping Cart',
    role: 'ORDER_ADMIN',
    roleBadge: 'Order Admin',
    path: '/admin/orders/dashboard',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [staffCount, setStaffCount] = useState<number>(6);
  const [recentLogs, setRecentLogs] = useState<AuditLogEntry[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [staffRes, logsRes] = await Promise.all([
          apiClient.get('/admin/staff').catch(() => null),
          apiClient.get('/admin/audit-logs?size=5').catch(() => null),
        ]);

        if (staffRes?.data?.data) {
          setStaffCount(staffRes.data.data.length);
        }
        if (logsRes?.data?.data?.content) {
          setRecentLogs(logsRes.data.data.content);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setIsLoadingLogs(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Super Administrator Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Welcome back, <span className="text-brand-400">{user?.fullName || 'Administrator'}</span>
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Sarasavi Pages enterprise bookstore control center. Managing all 6 core business modules and staff RBAC accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/staff"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-brand text-white font-medium text-xs shadow-glow hover:brightness-110 transition-all"
          >
            <Users className="w-4 h-4" />
            <span>Manage Staff</span>
          </Link>
          <Link
            href="/admin/audit-logs"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-card border border-surface-border text-ink hover:text-white hover:border-surface-muted transition-all text-xs font-medium"
          >
            <Activity className="w-4 h-4" />
            <span>Audit Trail</span>
          </Link>
        </div>
      </div>

      {/* Stats KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Registered Staff</span>
            <div className="h-8 w-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-display">{staffCount}</span>
            <span className="text-[11px] text-emerald-400 font-medium">All 6 Active</span>
          </div>
          <p className="text-[11px] text-ink-faint mt-1">1 Super Admin + 5 Module Admins</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Active Modules</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-display">6 / 6</span>
            <span className="text-[11px] text-emerald-400 font-medium">100% Configured</span>
          </div>
          <p className="text-[11px] text-ink-faint mt-1">M1 through M6 fully integrated</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Security Auditing</span>
            <div className="h-8 w-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-display">Enabled</span>
            <span className="text-[11px] text-sky-400 font-medium">Real-time</span>
          </div>
          <p className="text-[11px] text-ink-faint mt-1">Automatic action logging & timestamping</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Backend Service</span>
            <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-display">Spring Boot</span>
            <span className="text-[11px] text-emerald-400 font-medium font-mono">v3.3.4</span>
          </div>
          <p className="text-[11px] text-ink-faint mt-1">PostgreSQL 16 + JWT Bearer</p>
        </div>
      </div>

      {/* Member Allocation & Access Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Project Members & Access Allocation</h2>
            <p className="text-xs text-ink-muted">
              Pre-configured accounts for all 6 group members with role-based dashboard segregation.
            </p>
          </div>
          <span className="text-[11px] font-mono text-brand-400 px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
            SE2030 Batch 9 Group 2
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEAM_MEMBERS.map((member) => (
            <div
              key={member.id}
              className={`glass-card p-5 rounded-2xl flex flex-col justify-between border transition-all hover:border-brand-500/30 ${
                member.isSuper ? 'border-brand-500/30 bg-surface-card/90 shadow-glow' : 'border-surface-border'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${member.badgeColor}`}>
                    {member.roleBadge}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">{member.name}</h3>
                <p className="text-xs text-brand-400 font-mono mt-0.5">{member.itNumber}</p>

                <div className="mt-4 pt-3 border-t border-surface-border/60 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-ink-muted">
                    <span>Module Scope:</span>
                    <span className="font-semibold text-white">{member.module}</span>
                  </div>
                  <div className="flex items-center justify-between text-ink-muted">
                    <span>Username:</span>
                    <span className="font-mono text-ink-muted">{member.username}</span>
                  </div>
                  <div className="flex items-center justify-between text-ink-muted">
                    <span>Access Level:</span>
                    <span className={`font-mono ${member.isSuper ? 'text-brand-400 font-bold' : 'text-ink-faint'}`}>
                      {member.isSuper ? 'Full System' : 'Module Gated'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-surface-border/40">
                <Link
                  href={member.path}
                  className="flex items-center justify-between text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors group"
                >
                  <span>Open Module View</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Log Preview */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-brand-400" />
            <h2 className="text-base font-bold text-white">Recent Security & Activity Audits</h2>
          </div>
          <Link
            href="/admin/audit-logs"
            className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1"
          >
            <span>View Full Trail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoadingLogs ? (
          <div className="py-8 text-center text-xs text-ink-muted">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mx-auto mb-2" />
            Loading recent logs...
          </div>
        ) : recentLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-ink-muted">
            No audit logs available yet. Activity will appear here automatically.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-surface-border text-ink-faint font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Actor</th>
                  <th className="pb-3">Target</th>
                  <th className="pb-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                {recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3 font-mono text-ink-muted whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-surface border border-surface-border font-mono text-[11px] text-brand-400">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-medium text-white">{log.performedBy}</td>
                    <td className="py-3 font-mono text-ink-muted">{log.targetUsername || '—'}</td>
                    <td className="py-3 text-ink-muted max-w-xs truncate">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
