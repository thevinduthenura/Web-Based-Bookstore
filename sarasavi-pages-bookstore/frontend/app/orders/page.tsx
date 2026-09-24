'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Cookies from 'js-cookie';
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
  FileText
} from 'lucide-react';

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

  useEffect(() => {
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
      const saved = localStorage.getItem(`sp_orders_${custId}`);
      if (saved !== null) {
        setOrders(JSON.parse(saved));
      } else if (custId === 'CUST-1001') {
        setOrders(PRESET_DEMO_ORDERS);
      } else {
        const allOrders = localStorage.getItem('sp_all_orders');
        if (allOrders) {
          try {
            setOrders(JSON.parse(allOrders));
          } catch (e) {
            setOrders([]);
          }
        } else {
          setOrders([]);
        }
      }
    }
    setLoading(false);
  }, []);

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch = 
      ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.items.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.tracking && ord.tracking.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ord.invoiceNo && ord.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || ord.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDownloadInvoice = (order: OrderRecord) => {
    const invoiceNo = order.invoiceNo || `INV-${order.id.replace('ORD-', '')}`;
    const lines = [
      '================================================================',
      '           SARASAVI PAGES (PVT) LTD - OFFICIAL TAX INVOICE',
      '================================================================',
      `Invoice No      : ${invoiceNo}`,
      `Order Reference : ${order.id}`,
      `Order Date      : ${order.date}`,
      `Customer Name   : ${order.customerName || customer?.name || 'Valued Customer'}`,
      `Customer ID     : ${customer?.customerId || 'GUEST'}`,
      `Shipping Dest.  : ${order.shippingAddress || customer?.address || 'Colombo, Sri Lanka'}`,
      `Courier Partner : ${order.courier || 'Domex Express'} (Tracking: ${order.tracking || 'N/A'})`,
      '----------------------------------------------------------------',
      'ORDER ITEMS:',
      order.itemDetails && order.itemDetails.length > 0
        ? order.itemDetails.map(i => `  ${i.title.padEnd(35)} x${i.qty}  LKR ${(i.price * i.qty).toFixed(2)}`).join('\n')
        : `  ${order.items}`,
      '----------------------------------------------------------------',
      `Subtotal        : LKR ${(order.subtotal || order.amount).toFixed(2)}`,
      order.discount && order.discount > 0 ? `Discount        : - LKR ${order.discount.toFixed(2)}` : '',
      `TOTAL AMOUNT    : LKR ${order.amount.toFixed(2)}`,
      `Payment Status  : PAID & VERIFIED`,
      `Delivery Status : ${order.status}`,
      '================================================================',
      'Thank you for ordering with Sarasavi Pages (Pvt) Ltd!',
      'Authentic editions · Safe deliveries across Sri Lanka',
      '================================================================',
    ].filter(Boolean).join('\n');

    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoiceNo}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
                    <div className="text-xs text-[#20231B] font-medium mb-2 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-[#596B32]" />
                      <span>Order Items:</span>
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
    </div>
  );
}
