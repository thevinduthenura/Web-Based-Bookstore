'use client';

import { useAuth } from '@/hooks/useAuth';
import { 
  ShoppingCart, 
  PackageCheck, 
  Truck, 
  Clock, 
  Lock,
  ArrowRight,
  TrendingUp,
  MapPin
} from 'lucide-react';

export default function OrdersDashboardPage() {
  const { user, isSuperAdmin, hasRole } = useAuth();

  const isAuthorized = isSuperAdmin || hasRole('ORDER_ADMIN');

  if (!isAuthorized) {
    return (
      <div className="glass-card rounded-2xl p-8 max-w-lg mx-auto text-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Access Restricted</h2>
        <p className="text-xs text-ink-muted leading-relaxed">
          You do not have administrative permissions to access Module 6 (Orders & Cart).
          This panel is exclusively reserved for the Order Administrator (Diyes C.L.) or Super Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
            <ShoppingCart className="w-3.5 h-3.5" />
            Module 6 — Orders & Cart Administration
          </div>
          <h1 className="text-2xl font-bold font-display text-white">Orders & Logistics Management</h1>
          <p className="text-xs text-ink-muted mt-1">
            Assigned Owner: <span className="text-amber-400 font-semibold">Diyes C.L. (IT25100263)</span> • Role: <span className="font-mono text-white">ORDER_ADMIN</span>
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border text-xs font-mono text-amber-400">
          <Truck className="w-4 h-4" />
          <span>Courier Integration: SL Post / Domex</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">New Orders (Today)</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">54 Orders</span>
          </div>
          <p className="text-[11px] text-amber-400 mt-1">18 In Packing Queue</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Out for Delivery</span>
            <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">32 Packages</span>
          </div>
          <p className="text-[11px] text-sky-400 mt-1">Western & Central Province</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Delivered Successfully</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">98.4%</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">On-time fulfillment rate</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Abandoned Carts</span>
            <div className="h-8 w-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">12 Carts</span>
          </div>
          <p className="text-[11px] text-ink-faint mt-1">Automated recovery emails queued</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">Latest Dispatched Orders</h2>
          <span className="text-xs text-ink-muted font-mono">Module 6 Scope</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/80 border-b border-surface-border text-ink-faint uppercase text-[10px] font-semibold">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Courier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              <tr className="hover:bg-surface/40 transition-colors">
                <td className="py-3 px-4 font-mono text-brand-400">#ORD-90211</td>
                <td className="py-3 px-4 text-white">Anura Senanayake</td>
                <td className="py-3 px-4 text-ink-muted">3 Books (Gamperaliya, +2)</td>
                <td className="py-3 px-4 font-bold text-white font-mono">LKR 3,850</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-mono">
                    Out for Delivery
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-ink-faint">Domex (DX-98210)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
