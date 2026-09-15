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
  ArrowUpRight,
  RefreshCw,
  TrendingDown
} from 'lucide-react';
import { useState } from 'react';

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

  const [stockItems, setStockItems] = useState([
    { id: 1, title: 'Madol Doova', author: 'Martin Wickramasinghe', isbn: '978-955-0201-12-1', category: 'Classic Fiction', price: 1250, qty: 45, status: 'IN_STOCK' },
    { id: 2, title: 'Gamperaliya', author: 'Martin Wickramasinghe', isbn: '978-955-0201-15-2', category: 'Classic Fiction', price: 1450, qty: 30, status: 'IN_STOCK' },
    { id: 3, title: 'The Village in the Jungle', author: 'Leonard Woolf', isbn: '978-955-0201-88-0', category: 'Historical', price: 1850, qty: 25, status: 'IN_STOCK' },
    { id: 4, title: 'Running in the Family', author: 'Michael Ondaatje', isbn: '978-067-9746-69-0', category: 'Memoir', price: 2100, qty: 8, status: 'LOW_STOCK' },
    { id: 5, title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', isbn: '978-144-9373-32-0', category: 'Technology', price: 5800, qty: 4, status: 'LOW_STOCK' }
  ]);

  const handleRestock = (id: number, addQty: number) => {
    setStockItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + addQty;
        return {
          ...item,
          qty: newQty,
          status: newQty > 10 ? 'IN_STOCK' : 'LOW_STOCK'
        };
      }
      return item;
    }));
  };

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
          <button 
            onClick={() => alert("Open Add New Book to Warehouse Catalog Modal (UC-INV-01)")}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 text-xs font-medium transition-all"
          >
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
            <span className="text-xs font-medium text-ink-muted">Stock Units Available</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">
              {stockItems.reduce((acc, i) => acc + i.qty, 0).toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">Across 3 Warehouses</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Low Stock Alerts</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">
              {stockItems.filter(i => i.status === 'LOW_STOCK').length} Items
            </span>
          </div>
          <p className="text-[11px] text-amber-400 mt-1">Below safety threshold</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Active Categories</span>
            <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">18</span>
          </div>
          <p className="text-[11px] text-ink-faint mt-1">Fiction, Academic, Tech</p>
        </div>
      </div>

      {/* Inventory Stock Table */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Live Stock Inventory & Warehouse Control</h2>
            <p className="text-xs text-ink-muted mt-0.5">Real-time stock tracking with restock triggers</p>
          </div>
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
                <th className="py-3 px-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              {stockItems.map(item => (
                <tr key={item.id} className="hover:bg-surface/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{item.title}</div>
                    <div className="text-ink-faint text-[11px]">{item.author}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-ink-muted">{item.isbn}</td>
                  <td className="py-3 px-4 text-ink-muted">{item.category}</td>
                  <td className="py-3 px-4 font-bold text-white font-mono">LKR {item.price.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono font-medium">
                    <span className={item.status === 'LOW_STOCK' ? 'text-amber-400 font-bold' : 'text-white'}>
                      {item.qty} Units
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                      item.status === 'LOW_STOCK' 
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {item.status === 'LOW_STOCK' ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleRestock(item.id, 10)}
                        className="px-2 py-1 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-400 text-[11px] font-medium transition-all"
                      >
                        +10 Units
                      </button>
                      <button
                        onClick={() => handleRestock(item.id, 25)}
                        className="px-2 py-1 rounded-lg bg-surface hover:bg-surface/80 border border-surface-border text-ink-muted hover:text-white text-[11px] transition-all"
                      >
                        +25
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
