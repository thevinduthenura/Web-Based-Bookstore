'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  ShoppingCart, 
  PackageCheck, 
  Truck, 
  Clock, 
  Lock,
  ArrowRight,
  TrendingUp,
  MapPin,
  Layers,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  X,
  Search,
  Filter
} from 'lucide-react';
import CartManager from '@/components/orders/CartManager';

interface OrderItem {
  id: string;
  customerName: string;
  itemsSummary: string;
  totalAmount: number;
  status: 'PENDING' | 'PACKING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  courier: string;
  trackingNo: string;
  destination: string;
  createdAt: string;
}

const INITIAL_ORDERS: OrderItem[] = [
  {
    id: 'ORD-90211',
    customerName: 'Anura Senanayake',
    itemsSummary: 'Madol Doova (x2), Gamperaliya (x1)',
    totalAmount: 3850,
    status: 'OUT_FOR_DELIVERY',
    courier: 'Domex Express',
    trackingNo: 'DX-982101',
    destination: 'Kandy Road, Kiribathgoda',
    createdAt: 'Today, 09:30'
  },
  {
    id: 'ORD-90212',
    customerName: 'Malsha Rathnayake',
    itemsSummary: 'The Village in the Jungle (x1)',
    totalAmount: 1850,
    status: 'PACKING',
    courier: 'SL Post (Registered)',
    trackingNo: 'SLP-44019',
    destination: 'Galle Road, Matara',
    createdAt: 'Today, 11:15'
  },
  {
    id: 'ORD-90213',
    customerName: 'Dinesh Jayakody',
    itemsSummary: 'Designing Data-Intensive Applications (x1)',
    totalAmount: 5800,
    status: 'DELIVERED',
    courier: 'Pronto Courier',
    trackingNo: 'PR-102948',
    destination: 'Havelock Road, Colombo 05',
    createdAt: 'Yesterday, 14:00'
  },
  {
    id: 'ORD-90214',
    customerName: 'Nipuni Wickramaratne',
    itemsSummary: 'Running in the Family (x1)',
    totalAmount: 2100,
    status: 'PENDING',
    courier: 'SL Post',
    trackingNo: 'Pending',
    destination: 'Peradeniya, Kandy',
    createdAt: 'Today, 12:45'
  }
];

export default function OrdersDashboardPage() {
  const { user, isSuperAdmin, hasRole } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<OrderItem | null>(null);

  const [newOrder, setNewOrder] = useState({
    customerName: '',
    itemsSummary: '',
    totalAmount: 2500,
    courier: 'Domex Express',
    destination: 'Colombo'
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  // ── [C] CREATE: Create Order ───────────────────────────────────────────────
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const created: OrderItem = {
      id: `ORD-${Math.floor(90000 + Math.random() * 9999)}`,
      customerName: newOrder.customerName,
      itemsSummary: newOrder.itemsSummary,
      totalAmount: Number(newOrder.totalAmount),
      status: 'PENDING',
      courier: newOrder.courier,
      trackingNo: `TRK-${Math.floor(10000 + Math.random() * 90000)}`,
      destination: newOrder.destination,
      createdAt: 'Just now'
    };
    setOrders([created, ...orders]);
    setIsAddModalOpen(false);
    setNewOrder({ customerName: '', itemsSummary: '', totalAmount: 2500, courier: 'Domex Express', destination: 'Colombo' });
    setNotification({ type: 'success', message: `[CREATE] Order #${created.id} created and queued for packing!` });
  };

  // ── [U] UPDATE: Update Order Status ────────────────────────────────────────
  const handleOpenEdit = (ord: OrderItem) => {
    setActiveOrder(ord);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;
    setOrders(prev => prev.map(o => o.id === activeOrder.id ? activeOrder : o));
    setIsEditModalOpen(false);
    setNotification({ type: 'success', message: `[UPDATE] Order #${activeOrder.id} status updated to ${activeOrder.status}!` });
  };

  // ── [D] DELETE: Cancel / Delete Order ──────────────────────────────────────
  const handleDeleteOrder = (id: string) => {
    if (!confirm(`Are you sure you want to cancel and delete order #${id}?`)) return;
    setOrders(prev => prev.filter(o => o.id !== id));
    setNotification({ type: 'success', message: `[DELETE] Order #${id} cancelled and removed from dispatch queue.` });
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.itemsSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.trackingNo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-900/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>[C] Create Dispatch Order</span>
          </button>
        </div>
      </div>

      {/* CRUD Capability Legend */}
      <div className="glass-card p-3.5 rounded-xl border border-amber-500/20 bg-amber-950/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-semibold text-amber-400">
          <Layers className="w-4 h-4" />
          <span>Member 6 CRUD Operations Active:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
            [C] Add to Cart & Create Order
          </span>
          <span className="px-2.5 py-1 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30">
            [R] Live Cart & Order Feed
          </span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            [U] Qty, Promo & Status
          </span>
          <span className="px-2.5 py-1 rounded-md bg-red-500/20 text-red-300 border border-red-500/30">
            [D] Remove Item & Cancel
          </span>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-3.5 rounded-xl flex items-center justify-between text-xs border ${
          notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Total Orders (Today)</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">{orders.length} Orders</span>
          </div>
          <p className="text-[11px] text-amber-400 mt-1">{orders.filter(o => o.status === 'PACKING').length} In Packing Queue</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Out for Delivery</span>
            <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">
              {orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length} Packages
            </span>
          </div>
          <p className="text-[11px] text-sky-400 mt-1">Domex & Pronto Routes</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Delivered Successfully</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">
              {orders.filter(o => o.status === 'DELIVERED').length} Completed
            </span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">Verified with signed receipts</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Pending Dispatch</span>
            <div className="h-8 w-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">
              {orders.filter(o => o.status === 'PENDING').length} Orders
            </span>
          </div>
          <p className="text-[11px] text-ink-faint mt-1">Awaiting warehouse packaging</p>
        </div>
      </div>

      {/* Live Interactive Shopping Cart & Promotions CRUD (Member 6) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-amber-400" />
            <span>Interactive Shopping Cart & Coupon Engine (Member 6 Core)</span>
          </h2>
          <span className="text-xs text-ink-muted font-mono">[C, R, U, D Operations]</span>
        </div>
        <CartManager />
      </div>

      {/* Filter and Search Bar for Orders [R] */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="[R] Search orders by ID, customer, courier..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder:text-ink-faint focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-ink-faint hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 rounded-xl bg-surface border border-surface-border text-xs text-white focus:outline-none focus:border-amber-500 font-mono transition-all"
          >
            <option value="ALL">All Order Statuses ({orders.length})</option>
            <option value="PENDING">Pending</option>
            <option value="PACKING">Packing</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Management Table [R, U, D] */}
      <div className="glass-card rounded-2xl overflow-hidden border border-surface-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-border bg-surface-card/60 text-[11px] font-mono uppercase tracking-wider text-ink-muted">
                <th className="py-3 px-4">Order Ref / Date</th>
                <th className="py-3 px-4">Customer / Destination</th>
                <th className="py-3 px-4">Books Summary</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Courier Tracking</th>
                <th className="py-3 px-4 text-right">Actions (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-ink-muted">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-surface-card/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-amber-400">{ord.id}</span>
                      <div className="text-[10px] text-ink-muted">{ord.createdAt}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{ord.customerName}</div>
                      <div className="text-[11px] text-ink-muted flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-ink-faint" />
                        <span>{ord.destination}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-ink-light">
                      {ord.itemsSummary}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-white">
                      LKR {ord.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                        ord.status === 'DELIVERED'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : ord.status === 'OUT_FOR_DELIVERY'
                          ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                          : ord.status === 'PACKING'
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          : ord.status === 'CANCELLED'
                          ? 'bg-red-500/10 border-red-500/20 text-red-400'
                          : 'bg-surface border-surface-border text-ink-muted'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="text-white">{ord.courier}</div>
                      <div className="text-[10px] text-ink-muted">{ord.trackingNo}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* [U] Edit Status */}
                        <button
                          onClick={() => handleOpenEdit(ord)}
                          className="p-1.5 rounded-xl bg-surface border border-surface-border text-amber-400 hover:bg-amber-500/10 transition-all"
                          title="[U] Update Status & Tracking"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* [D] Cancel Order */}
                        <button
                          onClick={() => handleDeleteOrder(ord.id)}
                          className="p-1.5 rounded-xl bg-surface border border-surface-border text-red-400 hover:bg-red-500/10 transition-all"
                          title="[D] Cancel & Delete Order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* [C] CREATE ORDER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl w-full max-w-md p-6 border border-surface-border space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-400" />
                <span>[C] Create Dispatch Order</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-ink-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3 text-xs">
              <div>
                <label className="block text-ink-muted mb-1 font-medium">Customer Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Kalhara"
                  value={newOrder.customerName}
                  onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-ink-muted mb-1 font-medium">Books & Quantity Summary</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Madol Doova (x1), Gamperaliya (x2)"
                  value={newOrder.itemsSummary}
                  onChange={(e) => setNewOrder({ ...newOrder, itemsSummary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">Total Amount (LKR)</label>
                  <input
                    type="number"
                    required
                    value={newOrder.totalAmount}
                    onChange={(e) => setNewOrder({ ...newOrder, totalAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">Courier Partner</label>
                  <select
                    value={newOrder.courier}
                    onChange={(e) => setNewOrder({ ...newOrder, courier: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Domex Express">Domex Express</option>
                    <option value="Pronto Courier">Pronto Courier</option>
                    <option value="SL Post (Registered)">SL Post</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-ink-muted mb-1 font-medium">Delivery Destination / City</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Galle, Kandy, Colombo 07"
                  value={newOrder.destination}
                  onChange={(e) => setNewOrder({ ...newOrder, destination: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface border border-surface-border text-ink-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-glow"
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* [U] EDIT ORDER STATUS MODAL */}
      {isEditModalOpen && activeOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl w-full max-w-md p-6 border border-surface-border space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <span>[U] Update Order: {activeOrder.id}</span>
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-ink-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-ink-muted mb-1 font-medium">Order Status</label>
                <select
                  value={activeOrder.status}
                  onChange={(e) => setActiveOrder({ ...activeOrder, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PACKING">PACKING</option>
                  <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="block text-ink-muted mb-1 font-medium">Courier Service</label>
                <input
                  type="text"
                  value={activeOrder.courier}
                  onChange={(e) => setActiveOrder({ ...activeOrder, courier: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-ink-muted mb-1 font-medium">Tracking Number</label>
                <input
                  type="text"
                  value={activeOrder.trackingNo}
                  onChange={(e) => setActiveOrder({ ...activeOrder, trackingNo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface border border-surface-border text-ink-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold"
                >
                  Save Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
