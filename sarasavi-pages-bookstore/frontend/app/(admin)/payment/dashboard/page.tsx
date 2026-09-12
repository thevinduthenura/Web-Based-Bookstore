'use client';

import { useAuth } from '@/hooks/useAuth';
import { 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  ShieldCheck, 
  Lock,
  ArrowUpRight,
  TrendingUp,
  Receipt
} from 'lucide-react';

export default function PaymentDashboardPage() {
  const { user, isSuperAdmin, hasRole } = useAuth();

  const isAuthorized = isSuperAdmin || hasRole('PAYMENT_ADMIN');

  if (!isAuthorized) {
    return (
      <div className="glass-card rounded-2xl p-8 max-w-lg mx-auto text-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Access Restricted</h2>
        <p className="text-xs text-ink-muted leading-relaxed">
          You do not have administrative permissions to access Module 2 (Payment Management).
          This panel is exclusively reserved for the Payment Administrator (Anaf M.K.A.S.) or Super Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            Module 2 — Payment Administration
          </div>
          <h1 className="text-2xl font-bold font-display text-white">Payment & Gateway Operations</h1>
          <p className="text-xs text-ink-muted mt-1">
            Assigned Owner: <span className="text-emerald-400 font-semibold">Anaf M.K.A.S. (IT25102345)</span> • Role: <span className="font-mono text-white">PAYMENT_ADMIN</span>
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border text-xs font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Gateway: Mock Gateway Active</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Total Revenue (Today)</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">LKR 148,500</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
            <TrendingUp className="w-3 h-3" /> +14.2% vs yesterday
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Processed Payments</span>
            <div className="h-8 w-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">42 Orders</span>
          </div>
          <p className="text-[11px] text-ink-faint mt-1">Visa, MasterCard, Koko, Bank Transfer</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Pending Verifications</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">3 Slips</span>
          </div>
          <p className="text-[11px] text-amber-400 mt-1">Awaiting cashier slip check</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Gateway Health</span>
            <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">99.9%</span>
          </div>
          <p className="text-[11px] text-sky-400 mt-1">0 Failed Transactions</p>
        </div>
      </div>

      {/* Transaction Records Placeholder */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">Recent Payment Transactions</h2>
          <span className="text-xs text-ink-muted font-mono">Module 2 Scope</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/80 border-b border-surface-border text-ink-faint uppercase text-[10px] font-semibold">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              <tr className="hover:bg-surface/40 transition-colors">
                <td className="py-3 px-4 font-mono text-brand-400">#TXN-80921</td>
                <td className="py-3 px-4 text-white">Kavindu Perera</td>
                <td className="py-3 px-4 font-bold text-white font-mono">LKR 4,200</td>
                <td className="py-3 px-4 font-mono text-ink-muted">Credit Card (Visa)</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                    Success
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-ink-faint">Today, 14:20</td>
              </tr>
              <tr className="hover:bg-surface/40 transition-colors">
                <td className="py-3 px-4 font-mono text-brand-400">#TXN-80920</td>
                <td className="py-3 px-4 text-white">Nimesha Silva</td>
                <td className="py-3 px-4 font-bold text-white font-mono">LKR 8,900</td>
                <td className="py-3 px-4 font-mono text-ink-muted">Koko Pay (3 Installments)</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                    Success
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-ink-faint">Today, 13:45</td>
              </tr>
              <tr className="hover:bg-surface/40 transition-colors">
                <td className="py-3 px-4 font-mono text-brand-400">#TXN-80919</td>
                <td className="py-3 px-4 text-white">Dilshan Jayasuriya</td>
                <td className="py-3 px-4 font-bold text-white font-mono">LKR 2,450</td>
                <td className="py-3 px-4 font-mono text-ink-muted">Bank Slip Upload</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono">
                    Pending Verification
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-ink-faint">Today, 12:10</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
