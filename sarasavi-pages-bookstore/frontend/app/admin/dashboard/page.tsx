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
  Sparkles,
  Globe,
  Database,
  Terminal,
  Server
} from 'lucide-react';
import type { AuditLogEntry } from '@/types/admin';

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
    badgeColor: 'border-emerald-300 text-emerald-950 bg-emerald-100 font-semibold',
    icon: Users,
    isSuper: true,
    description: 'System-wide RBAC governance, staff onboarding & unified security audit logging.',
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
    badgeColor: 'border-teal-300 text-teal-950 bg-teal-100 font-semibold',
    icon: CreditCard,
    description: 'Multi-gateway checkout settlement, transactions verification & refund auditing.',
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
    badgeColor: 'border-sky-300 text-sky-950 bg-sky-100 font-semibold',
    icon: Headphones,
    description: 'Helpdesk ticket resolution, dispute escalation & satisfaction SLA tracking.',
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
    badgeColor: 'border-purple-300 text-purple-950 bg-purple-100 font-semibold',
    icon: Boxes,
    description: 'Stock intake, safety thresholds, reorder level alerts & warehouse logistics.',
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
    badgeColor: 'border-rose-300 text-rose-950 bg-rose-100 font-semibold',
    icon: UserCheck,
    description: 'Customer profiles, KYC identity verification & loyalty tier points allocation.',
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
    badgeColor: 'border-amber-300 text-amber-950 bg-amber-100 font-semibold',
    icon: ShoppingCart,
    description: 'Cart processing, promo discount vouchers, order dispatch & fulfillment states.',
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
          apiClient.get('/admin/audit-logs?size=6').catch(() => null),
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
    <div className="space-y-8 pb-12 selection:bg-emerald-900 selection:text-white">
      {/* ── TOP HERO HEADER ────────────────────────────────────── */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Super Administrator Enterprise Control Center</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              welcome back, <span className="text-emerald-800 font-bold">{user?.fullName || 'Administrator'}</span>
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-normal leading-relaxed">
              Sarasavi Pages central management system. Orchestrating all 6 micro-modules, group member RBAC roles, inventory thresholds, and customer storefront operations.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs shadow-xs transition-all"
              title="Open public customer storefront"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-700" />
              <span>Live Storefront</span>
            </Link>

            <Link
              href="/admin/staff"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-emerald-900 text-white font-semibold text-xs shadow-sm transition-all active:scale-95"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Manage Staff</span>
            </Link>

            <Link
              href="/admin/audit-logs"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold transition-all text-xs shadow-xs"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-700" />
              <span>Audit Trail</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── HIGH-IMPACT STATS KPI GRID ──────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200/90 hover:border-emerald-400 p-5 rounded-2xl transition-all shadow-xs group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Registered Staff</span>
            <div className="h-9 w-9 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-900 border border-emerald-300 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4 text-emerald-700" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{staffCount}</span>
            <span className="text-[11px] text-emerald-900 font-sans font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> All 6 Active
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-normal">1 Super Admin + 5 Module Admins</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200/90 hover:border-teal-400 p-5 rounded-2xl transition-all shadow-xs group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Active Business Modules</span>
            <div className="h-9 w-9 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-900 border border-teal-300 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4 text-teal-700" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">6 / 6</span>
            <span className="text-[11px] text-teal-900 font-sans font-semibold">100% Configured</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-normal">M1 through M6 fully integrated</p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200/90 hover:border-sky-400 p-5 rounded-2xl transition-all shadow-xs group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Security & Auditing</span>
            <div className="h-9 w-9 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-900 border border-sky-300 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4 h-4 text-sky-700" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">Live Protection</span>
            <span className="text-[11px] text-sky-900 font-sans font-semibold">Real-time</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-normal">Automated DB action audit logging</p>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200/90 hover:border-purple-400 p-5 rounded-2xl transition-all shadow-xs group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Backend API Services</span>
            <div className="h-9 w-9 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-900 border border-purple-300 group-hover:scale-105 transition-transform">
              <Server className="w-4 h-4 text-purple-700" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">Spring Boot</span>
            <span className="text-[11px] text-emerald-800 font-sans font-semibold">Port 8080</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-normal">PostgreSQL 16 · Flyway Migrations</p>
        </div>
      </div>

      {/* ── PROJECT MEMBERS & CORE MODULE ACCESS ALLOCATION ─────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Group Project Members & Module Allocation
            </h2>
            <p className="text-xs text-slate-600 mt-0.5 font-normal">
              Role-Based Access Control matrix for all 6 SE2030 group members with dedicated sub-module portals.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-sans text-emerald-950 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 self-start sm:self-auto font-bold">
            <Terminal className="w-3 h-3 text-emerald-700" />
            <span>SE2030 · Batch 9 · Group 2</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEAM_MEMBERS.map((member) => {
            const Icon = member.icon;
            return (
              <div
                key={member.id}
                className={`bg-white p-5 rounded-2xl flex flex-col justify-between border transition-all hover:scale-[1.01] hover:border-emerald-500 shadow-xs ${
                  member.isSuper 
                    ? 'border-emerald-300 bg-gradient-to-b from-white to-emerald-50/30' 
                    : 'border-slate-200/90 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-sans font-semibold px-2.5 py-0.5 rounded-full border ${member.badgeColor}`}>
                      {member.roleBadge}
                    </span>
                    <span className="text-[10px] text-emerald-800 font-sans font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      Active
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shadow-xs">
                      <Icon className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{member.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{member.itNumber}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed font-normal">
                    {member.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Module Scope:</span>
                      <span className="font-bold text-slate-900">{member.module.split(':')[0]}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Username:</span>
                      <span className="font-semibold text-emerald-800">@{member.username}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <Link
                    href={member.path}
                    className="flex items-center justify-between text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors group"
                  >
                    <span>Open Module Portal</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RECENT SECURITY & ACTIVITY AUDIT TRAIL ─────────────────── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Clock className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Security & Activity Audits</h2>
              <p className="text-xs text-slate-500 font-normal">Immutable ledger tracking administrative updates across all modules.</p>
            </div>
          </div>
          <Link
            href="/admin/audit-logs"
            className="text-xs text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View Full Trail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoadingLogs ? (
          <div className="py-10 text-center text-xs text-slate-600">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent mx-auto mb-2" />
            Loading real-time audit ledger...
          </div>
        ) : recentLogs.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-600 font-medium">
            No audit records found. Initializing backend event listeners...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="pb-3 px-2">Timestamp</th>
                  <th className="pb-3 px-2">Action</th>
                  <th className="pb-3 px-2">Actor</th>
                  <th className="pb-3 px-2">Target</th>
                  <th className="pb-3 px-2">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-2 text-slate-600 whitespace-nowrap text-xs font-medium">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 text-[11px] font-semibold font-sans">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-bold text-slate-900">{log.performedBy}</td>
                    <td className="py-3 px-2 text-slate-700 font-medium">{log.targetUsername || '-'}</td>
                    <td className="py-3 px-2 text-slate-600 max-w-sm truncate text-xs">
                      {log.description}
                    </td>
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
