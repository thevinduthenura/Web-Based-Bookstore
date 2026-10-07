'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Cookies from 'js-cookie';
import { printOrderInvoice } from '@/lib/invoice-pdf';
import { 
  Package, 
  Truck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowRight, 
  BookOpen, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  User, 
  Receipt,
  FileText,
  Edit3,
  Trash2,
  ShieldCheck,
  Eye,
  X,
  Check
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface OrderItem {
  title: string;
  qty: number;
  price: number;
  coverImage?: string;
}

interface OrderRecord {
  id: string;
  invoiceNo?: string;
  items: string;
  itemDetails?: OrderItem[];
  amount: number;
  subtotal?: number;
  discount?: number;
  status: 'PENDING' | 'PROCESSING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  courier?: string;
  tracking?: string;
  date: string;
  shippingAddress?: string;
  customerName?: string;
  email?: string;
}

const PRESET_DEMO_ORDERS: OrderRecord[] = [
  {
    id: 'ORD-90211',
    invoiceNo: 'INV-2026-00101',
    items: 'Madol Doova (x2), Gamperaliya (x1)',
    itemDetails: [
      { title: 'Madol Doova', qty: 2, price: 1000, coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600' },
      { title: 'Gamperaliya', qty: 1, price: 1850, coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600' }
    ],
    amount: 3850,
    subtotal: 3850,
    discount: 0,
    status: 'OUT_FOR_DELIVERY',
    courier: 'Domex Express',
    tracking: 'DX-982101',
    date: 'Today, 09:30 AM',
    shippingAddress: 'No 12, Galle Road, Colombo 03',
    customerName: 'Kamal Perera',
    email: 'kamal.perera@gmail.com'
  },
  {
    id: 'ORD-89420',
    invoiceNo: 'INV-2026-00089',
    items: 'The Village in the Jungle (x1)',
    itemDetails: [
      { title: 'The Village in the Jungle', qty: 1, price: 1850, coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600' }
    ],
    amount: 1850,
    subtotal: 1850,
    discount: 0,
    status: 'DELIVERED',
    courier: 'SL Post (Registered)',
    tracking: 'SLP-44019',
    date: 'Sep 18, 2026',
    shippingAddress: 'No 12, Galle Road, Colombo 03',
    customerName: 'Kamal Perera',
    email: 'kamal.perera@gmail.com'
  }
];

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Admin authentication state & permissions
  const { user: authUser, isSuperAdmin, hasRole } = useAuth();
  const [adminUser, setAdminUser] = useState<any>(authUser);
  const [adminViewMode, setAdminViewMode] = useState<'all' | 'my'>('all');
  const [orderToast, setOrderToast] = useState<string | null>(null);

  useEffect(() => {
    if (authUser) {
      setAdminUser(authUser);
    } else {
      try {
        const staffRaw = Cookies.get('sp_user') || (typeof window !== 'undefined' ? localStorage.getItem('sp_user') : null);
        if (staffRaw) setAdminUser(JSON.parse(staffRaw));
        else setAdminUser(null);
      } catch {
        setAdminUser(null);
      }
    }
  }, [authUser]);

  // Order & Payment management roles:
  // - SUPER_ADMIN
  // - ORDER_ADMIN (Diyes C.L.)
  // - PAYMENT_ADMIN (Anaf M.K.A.S.)
  const canManageOrders = Boolean(
    (isSuperAdmin || hasRole?.('SUPER_ADMIN')) ||
    hasRole?.('ORDER_ADMIN') ||
    hasRole?.('PAYMENT_ADMIN') ||
    (adminUser && (
      adminUser.role === 'SUPER_ADMIN' ||
      adminUser.role === 'ORDER_ADMIN' ||
      adminUser.role === 'PAYMENT_ADMIN' ||
      adminUser.username === 'GunathilakaT1540' ||
      adminUser.username === 'DiyesL0263' ||
      adminUser.username === 'AnafS2345' ||
      adminUser.username === 'admin'
    ))
  );

  const loadOrdersData = () => {
    const custRaw = Cookies.get('sp_customer') || (typeof window !== 'undefined' ? localStorage.getItem('sp_customer') : null);
    let custId = 'CUST-GUEST';
    if (custRaw) {
      try {
        const parsed = JSON.parse(custRaw);
        setCustomer(parsed);
        custId = parsed.customerId || 'CUST-GUEST';
      } catch (e) {}
    }

    if (typeof window !== 'undefined') {
      const allOrdersRaw = localStorage.getItem('sp_all_orders');
      let allOrders: OrderRecord[] = [];
      if (allOrdersRaw) {
        try { allOrders = JSON.parse(allOrdersRaw); } catch {}
      }

      const userOrdersRaw = localStorage.getItem(`sp_orders_${custId}`);
      let userOrders: OrderRecord[] = [];
      if (userOrdersRaw) {
        try { userOrders = JSON.parse(userOrdersRaw); } catch {}
      } else if (custId === 'CUST-1001' || (customer && customer.email === 'kamal.perera@gmail.com')) {
        userOrders = PRESET_DEMO_ORDERS;
      }

      if (canManageOrders && adminViewMode === 'all') {
        // Staff/Admin view: show all bookstore orders
        const list = allOrders.length > 0 ? allOrders : PRESET_DEMO_ORDERS;
        setOrders(list);
      } else {
        // Reader view: show ONLY this customer's orders (fresh users start with 0 orders)
        if (custId === 'CUST-1001' || (customer && customer.email === 'kamal.perera@gmail.com')) {
          setOrders(userOrders.length > 0 ? userOrders : PRESET_DEMO_ORDERS);
        } else {
          setOrders(userOrders);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrdersData();
  }, [canManageOrders, adminViewMode]);

  // Admin: Live update order status
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderRecord['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    if (typeof window !== 'undefined') {
      try {
        // Update all orders
        const allRaw = localStorage.getItem('sp_all_orders');
        let allList: OrderRecord[] = allRaw ? JSON.parse(allRaw) : [...PRESET_DEMO_ORDERS];
        const idx = allList.findIndex(o => o.id === orderId);
        if (idx >= 0) {
          allList[idx].status = newStatus;
        } else {
          allList.push({ ...orders.find(o => o.id === orderId)!, status: newStatus });
        }
        localStorage.setItem('sp_all_orders', JSON.stringify(allList));

        // Update customer orders if present
        const custId = customer?.customerId || 'CUST-GUEST';
        const userRaw = localStorage.getItem(`sp_orders_${custId}`);
        if (userRaw) {
          let userList: OrderRecord[] = JSON.parse(userRaw);
          const uIdx = userList.findIndex(o => o.id === orderId);
          if (uIdx >= 0) {
            userList[uIdx].status = newStatus;
            localStorage.setItem(`sp_orders_${custId}`, JSON.stringify(userList));
          }
        }
      } catch (err) {
        console.error('Failed to update order status:', err);
      }
    }

    setOrderToast(`Order ${orderId} updated to "${newStatus.replace(/_/g, ' ')}"`);
    setTimeout(() => setOrderToast(null), 3500);
  };

  // Admin: Delete order
  const handleDeleteOrder = (orderId: string) => {
    if (!window.confirm(`Are you sure you want to cancel and remove order ${orderId}?`)) return;

    setOrders(prev => prev.filter(o => o.id !== orderId));

    if (typeof window !== 'undefined') {
      try {
        const allRaw = localStorage.getItem('sp_all_orders');
        if (allRaw) {
          const list: OrderRecord[] = JSON.parse(allRaw);
          localStorage.setItem('sp_all_orders', JSON.stringify(list.filter(o => o.id !== orderId)));
        }
        const custId = customer?.customerId || 'CUST-GUEST';
        const userRaw = localStorage.getItem(`sp_orders_${custId}`);
        if (userRaw) {
          const uList: OrderRecord[] = JSON.parse(userRaw);
          localStorage.setItem(`sp_orders_${custId}`, JSON.stringify(uList.filter(o => o.id !== orderId)));
        }
      } catch (err) {
        console.error('Failed to delete order:', err);
      }
    }

    setOrderToast(`Order ${orderId} removed from registry.`);
    setTimeout(() => setOrderToast(null), 3500);
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch = 
      ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.items.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.tracking && ord.tracking.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ord.invoiceNo && ord.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ord.customerName && ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || ord.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDownloadInvoice = (order: OrderRecord) => {
    const invoiceNo = order.invoiceNo || `INV-${order.id.replace('ORD-', '')}`;
    const items = order.itemDetails && order.itemDetails.length > 0
      ? order.itemDetails.map(i => ({ title: i.title, qty: i.qty, price: i.price }))
      : [{ title: order.items || 'Book Order Item(s)', qty: 1, price: order.amount }];

    printOrderInvoice({
      invoiceNo,
      orderId: order.id,
      date: order.date,
      customer: order.customerName || customer?.name || 'Valued Customer',
      email: customer?.email,
      phone: customer?.phone,
      address: order.shippingAddress || customer?.address || 'Colombo, Sri Lanka',
      courier: order.courier,
      tracking: order.tracking,
      items,
      subtotal: order.subtotal || order.amount,
      discount: order.discount || 0,
      total: order.amount,
      paymentMethod: 'Paid Online',
      status: order.status,
    });
  };

  const getStatusBadge = (status: OrderRecord['status']) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F4E8] text-[#34451D] text-xs font-medium border border-[#E2E7D8]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#596B32]" />
            <span>Delivered</span>
          </span>
        );
      case 'OUT_FOR_DELIVERY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#34451D] text-[#B7D85A] text-xs font-medium shadow-xs">
            <Truck className="w-3.5 h-3.5" />
            <span>Out for Delivery</span>
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F4E8] text-[#34451D] text-xs font-medium border border-[#34451D]">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Processing Order</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9F5] text-[#20231B] antialiased selection:bg-[#34451D] selection:text-white font-sans py-4">
      {/* ── Cohesive Floating Pill Header ──────────────────────────── */}
      <Navbar activeTab="orders" />

      {/* ── Main Container ─────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
        {/* ── Admin Storefront Orders Live Management Bar ── */}
        {canManageOrders && (
          <div className="bg-[#20231B] border border-[#34451D] p-4 sm:p-5 rounded-3xl shadow-md text-[#F8F9F5]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#34451D] border border-[#596B32] flex items-center justify-center text-[#B7D85A] shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-[#B7D85A] tracking-wider uppercase">
                      Live Storefront Orders CRUD
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#34451D] text-[#E2E7D8] text-[10px] font-mono border border-[#596B32]">
                      {adminUser?.role?.replace('_', ' ') || 'ORDER ADMIN'}
                    </span>
                  </div>
                  <p className="text-xs text-[#AAB58A] mt-0.5 font-light">
                    Manage customer orders, adjust dispatch statuses, and monitor book deliveries live.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#AAB58A] font-mono mr-1">View:</span>
                <button
                  type="button"
                  onClick={() => setAdminViewMode('all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${
                    adminViewMode === 'all'
                      ? 'bg-[#B7D85A] text-[#20231B] font-semibold shadow-xs'
                      : 'bg-white/10 text-[#E2E7D8] hover:bg-white/20'
                  }`}
                >
                  All Customer Orders ({orders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAdminViewMode('my')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${
                    adminViewMode === 'my'
                      ? 'bg-[#B7D85A] text-[#20231B] font-semibold shadow-xs'
                      : 'bg-white/10 text-[#E2E7D8] hover:bg-white/20'
                  }`}
                >
                  My Orders
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Banner with Deep Editorial Contrast */}
        <div className="bg-gradient-to-br from-[#243314] via-[#2F401A] to-[#1C2611] text-[#F7F5EC] p-6 sm:p-8 rounded-3xl border border-[#485B28] shadow-[0_16px_40px_rgba(28,38,17,0.16)] relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#B7D85A] font-semibold">
              Delivery & Order Tracking
            </span>
            <h1 className="font-display font-light text-2xl sm:text-3xl text-[#F7F5EC] tracking-tight">
              My Orders & Tax Receipts
            </h1>
            <p className="text-xs text-[#E2E7D8] font-light">
              Track your book dispatches and download official tax receipts anytime.
            </p>
          </div>

          <Link
            href="/catalog"
            className="self-start sm:self-auto px-5 py-2.5 rounded-full bg-[#B7D85A] hover:bg-white text-[#1C2611] text-xs font-semibold shadow-sm transition-all flex items-center gap-2 relative z-10 active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            <span>Browse Bookstore Catalog</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-3xl border border-[#E2E7D8] shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#85887A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, Title or Tracking..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-[#F8F9F5] border border-[#E2E7D8] text-xs text-[#20231B] placeholder:text-[#85887A] focus:outline-none focus:border-[#34451D] focus:bg-white transition-all shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
            {['ALL', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all text-xs ${
                  statusFilter === st
                    ? 'bg-[#34451D] text-white font-medium shadow-xs'
                    : 'bg-[#F0F4E8] text-[#596B32] border border-[#E2E7D8] hover:bg-white hover:text-[#20231B]'
                }`}
              >
                {st === 'ALL' ? 'All Orders' : st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#34451D]/30 border-t-[#34451D] rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#85887A] font-mono">Loading order records...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-[#E2E7D8] text-center space-y-4 shadow-sm">
            <Package className="w-12 h-12 text-[#85887A] mx-auto opacity-40" />
            <div className="space-y-1">
              <h3 className="font-display font-light text-xl text-[#20231B]">No orders found</h3>
              <p className="text-xs text-[#85887A] max-w-sm mx-auto">
                You haven't placed any orders yet, or no orders match your search criteria.
              </p>
            </div>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white text-xs font-medium shadow-md transition-all active:scale-95"
            >
              <span>Explore Books & Place an Order</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-[#E2E7D8] shadow-xs hover:shadow-md overflow-hidden transition-all duration-200"
                >
                  {/* Order Header Row */}
                  <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E7D8]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-semibold text-[#34451D]">{order.id}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xs text-[#85887A]">
                        Placed on {order.date} · Courier: <strong className="text-[#20231B]">{order.courier || 'Domex Express'}</strong>
                        {order.tracking && (
                          <span className="font-mono ml-1 text-[#34451D]">({order.tracking})</span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-[#85887A] block font-mono">Total Paid</span>
                        <span className="font-mono text-lg font-medium text-[#20231B]">
                          LKR {order.amount.toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDownloadInvoice(order)}
                        className="px-3.5 py-2 rounded-full border border-[#34451D] text-[#34451D] text-xs font-medium hover:bg-[#F0F4E8] transition-all flex items-center gap-1.5 shadow-2xs"
                        title="Download Tax Receipt"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Tax Invoice</span>
                      </button>

                      <button
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="p-2 rounded-full bg-white border border-[#E2E7D8] text-[#85887A] hover:text-[#20231B] transition-all"
                        aria-label="Toggle details"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-5 sm:p-6 bg-[#F8F9F5]">
                    <div className="text-xs text-[#20231B] font-medium mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-[#596B32]" />
                        <span>Order Items:</span>
                      </div>
                      {order.customerName && canManageOrders && (
                        <span className="text-[11px] font-mono text-[#596B32]">
                          Customer: <strong className="text-[#20231B]">{order.customerName}</strong> ({order.email || 'N/A'})
                        </span>
                      )}
                    </div>

                    {order.itemDetails && order.itemDetails.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {order.itemDetails.map((item, idx) => (
                          <div key={idx} className="p-3 rounded-2xl bg-white border border-[#E2E7D8] shadow-2xs flex items-center gap-3">
                            <div className="w-10 h-12 rounded-lg bg-[#F8F9F5] overflow-hidden shrink-0 border border-[#E2E7D8]">
                              <img
                                src={item.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600'}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="truncate text-xs">
                              <h5 className="font-display font-medium text-[#20231B] truncate">{item.title}</h5>
                              <p className="text-[#85887A] font-mono mt-0.5">
                                Qty: {item.qty} · LKR {item.price.toFixed(0)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#85887A] bg-white p-3 rounded-xl border border-[#E2E7D8]">
                        {order.items}
                      </p>
                    )}

                    {/* Admin Live In-Place Status Control Bar */}
                    {canManageOrders && (
                      <div className="mt-4 pt-3 border-t border-[#E2E7D8] flex flex-wrap items-center justify-between gap-3 bg-[#F0F4E8]/80 p-3 rounded-2xl border border-[#D5DEC4]">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-mono text-[#34451D] font-semibold">
                            Admin Status Transition:
                          </span>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                            className="text-xs font-mono py-1.5 px-3 rounded-xl border border-[#B7D85A] bg-white text-[#20231B] font-medium focus:outline-none focus:border-[#34451D] cursor-pointer shadow-xs"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(order.id)}
                            className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95"
                            title="Cancel and remove order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Cancel & Remove</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expanded Delivery Timeline */}
                  {isExpanded && (
                    <div className="p-5 sm:p-6 border-t border-[#E2E7D8] bg-[#F8F9F5] space-y-4 text-xs animate-in fade-in duration-200">
                      <h4 className="font-display font-medium text-sm text-[#20231B]">
                        Live Dispatch Timeline
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                        <div className="p-3 rounded-xl bg-[#F0F4E8] border border-[#E2E7D8]">
                          <CheckCircle2 className="w-4 h-4 text-[#596B32] mx-auto mb-1" />
                          <span className="font-semibold text-[#34451D] block">1. Order Placed</span>
                          <span className="text-[10px] text-[#85887A]">{order.date}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#F0F4E8] border border-[#E2E7D8]">
                          <CheckCircle2 className="w-4 h-4 text-[#596B32] mx-auto mb-1" />
                          <span className="font-semibold text-[#34451D] block">2. Payment Verified</span>
                          <span className="text-[10px] text-[#85887A]">Instant Bank Gateway</span>
                        </div>
                        <div className={`p-3 rounded-xl border ${
                          order.status === 'OUT_FOR_DELIVERY' || order.status === 'DELIVERED'
                            ? 'bg-[#F0F4E8] border-[#E2E7D8]'
                            : 'bg-white/80 border-[#E2E7D8] opacity-60'
                        }`}>
                          <Truck className="w-4 h-4 text-[#596B32] mx-auto mb-1" />
                          <span className="font-semibold text-[#34451D] block">3. Courier Dispatched</span>
                          <span className="text-[10px] text-[#85887A]">{order.courier || 'Domex Express'}</span>
                        </div>
                        <div className={`p-3 rounded-xl border ${
                          order.status === 'DELIVERED'
                            ? 'bg-[#34451D] text-white border-[#34451D]'
                            : 'bg-white/80 border-[#E2E7D8] opacity-60'
                        }`}>
                          <CheckCircle2 className={`w-4 h-4 mx-auto mb-1 ${order.status === 'DELIVERED' ? 'text-[#B7D85A]' : 'text-[#85887A]'}`} />
                          <span className="font-semibold block">4. Delivered</span>
                          <span className="text-[10px] opacity-80">{order.status === 'DELIVERED' ? 'Successfully Received' : 'Estimated 1–2 days'}</span>
                        </div>
                      </div>

                      {order.shippingAddress && (
                        <div className="pt-2 flex items-center justify-between text-[11px] text-[#85887A] border-t border-[#E2E7D8]">
                          <span>Shipping to: <strong className="text-[#20231B]">{order.shippingAddress}</strong></span>
                          <span>Recipient: <strong className="text-[#20231B]">{order.customerName || customer?.name || 'Customer'}</strong></span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Order Admin Toast Feedback ── */}
      {orderToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#20231B] text-[#F8F9F5] border border-[#34451D] px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-[#B7D85A] shrink-0" />
          <span className="text-xs font-medium">{orderToast}</span>
          <button
            type="button"
            onClick={() => setOrderToast(null)}
            className="text-[#AAB58A] hover:text-white ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
