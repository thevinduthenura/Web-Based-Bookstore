'use client';

import { useAuth } from '@/hooks/useAuth';
import { 
  Boxes, 
  BookOpen, 
  AlertTriangle, 
  Package, 
  Tag, 
  Lock,
  Plus,
  ArrowUpRight
} from 'lucide-react';

export default function InventoryDashboardPage() {
  const { user, isSuperAdmin, hasRole } = useAuth();

  const isAuthorized = isSuperAdmin || hasRole('INVENTORY_ADMIN');

  if (!isAuthorized) {
    return (
      <div className="glass-card rounded-2xl p-8 max-w-lg mx-auto text-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Access Restricted</h2>
        <p className="text-xs text-ink-muted leading-relaxed">
          You do not have administrative permissions to access Module 4 (Inventory & Catalog).
          This panel is exclusively reserved for the Inventory Administrator (Dissanayake S.A.S.D.) or Super Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-2">
            <Boxes className="w-3.5 h-3.5" />
            Module 4 — Inventory & Catalog
          </div>
          <h1 className="text-2xl font-bold font-display text-white">Book Catalog & Stock Control</h1>
          <p className="text-xs text-ink-muted mt-1">
            Assigned Owner: <span className="text-violet-400 font-semibold">Dissanayake S.A.S.D. (IT25101062)</span> • Role: <span className="font-mono text-white">INVENTORY_ADMIN</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 text-xs font-medium transition-all">
            <Plus className="w-4 h-4" />
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Total Titles in Catalog</span>
            <div className="h-8 w-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">1,480</span>
          </div>
          <p className="text-[11px] text-ink-faint mt-1">18 Categories</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Total Physical Stock</span>
            <div className="h-8 w-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">14,250 Units</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">Warehouses: Colombo & Kandy</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Low Stock Warnings</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">6 Titles</span>
          </div>
          <p className="text-[11px] text-amber-400 mt-1">Stock level under threshold (&lt; 5)</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Active Categories</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">24 Genres</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">Fiction, Academic, Sci-Fi, History</p>
        </div>
      </div>

      {/* Book Catalog Table */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">Featured Books & Stock Inventory</h2>
          <span className="text-xs text-ink-muted font-mono">Module 4 Scope</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/80 border-b border-surface-border text-ink-faint uppercase text-[10px] font-semibold">
              <tr>
                <th className="py-3 px-4">Title & Author</th>
                <th className="py-3 px-4">ISBN</th>
                <th className="py-3 px-4">Genre</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Available Qty</th>
                <th className="py-3 px-4">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              <tr className="hover:bg-surface/40 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-semibold text-white">Gamperaliya</div>
                  <div className="text-ink-faint text-[11px]">Martin Wickramasinghe</div>
                </td>
                <td className="py-3 px-4 font-mono text-ink-muted">978-955-0201-12-8</td>
                <td className="py-3 px-4 text-ink-muted">Sinhala Literature</td>
                <td className="py-3 px-4 font-bold text-white font-mono">LKR 950</td>
                <td className="py-3 px-4 font-mono text-white font-medium">85 Units</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                    In Stock
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-surface/40 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-semibold text-white">Madol Doova</div>
                  <div className="text-ink-faint text-[11px]">Martin Wickramasinghe</div>
                </td>
                <td className="py-3 px-4 font-mono text-ink-muted">978-955-0201-44-9</td>
                <td className="py-3 px-4 text-ink-muted">Classic Youth</td>
                <td className="py-3 px-4 font-bold text-white font-mono">LKR 750</td>
                <td className="py-3 px-4 font-mono text-amber-400 font-medium">4 Units</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono">
                    Low Stock
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
