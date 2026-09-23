'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  ShieldCheck, 
  Package, 
  Headphones, 
  CreditCard, 
  Receipt, 
  LogOut, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  Truck,
  ArrowRight,
  Download,
  Plus,
  X,
  BookOpen,
  Bell,
  LayoutDashboard
} from 'lucide-react';

interface CustomerData {
  customerId: string;
  name: string;
  email: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  points: number;
  phone: string;
  address: string;
  kycVerified?: boolean;
}

const DEFAULT_CUSTOMER: CustomerData = {
  customerId: 'CUST-1001',
  name: 'Kamal Perera',
  email: 'kamal.perera@gmail.com',
  tier: 'GOLD',
  points: 350,
  phone: '+94 77 123 4567',
  address: 'No 12, Galle Road, Colombo 03',
  kycVerified: true
};

export default function CustomerAccountPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerData>(DEFAULT_CUSTOMER);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'tickets' | 'payments'>('profile');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    address: ''
  });

  // Dynamic Customer Orders (M6)
  const [orders, setOrders] = useState<any[]>([]);

  // Dynamic Customer Tickets (M3)
  const [tickets, setTickets] = useState<any[]>([]);

  // Dynamic Customer Payments (M2)
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    // Check if customer cookie / localStorage exists
    const raw = Cookies.get('sp_customer') || (typeof window !== 'undefined' ? localStorage.getItem('sp_customer') : null);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setCustomer(parsed);
        setEditForm({
          name: parsed.name || '',
          phone: parsed.phone || '',
          address: parsed.address || ''
        });

        const custId = parsed.customerId;
        if (typeof window !== 'undefined') {
          // Check for user-specific orders
          const savedOrders = localStorage.getItem(`sp_orders_${custId}`);
          if (savedOrders !== null) {
            setOrders(JSON.parse(savedOrders));
          } else if (custId === 'CUST-1001') {
            // Preset demo user sample orders
            setOrders([
              {
                id: 'ORD-90211',
                items: 'Madol Doova (x2), Gamperaliya (x1)',
                amount: 3850,
                status: 'OUT_FOR_DELIVERY',
                courier: 'Domex Express',
                tracking: 'DX-982101',
                date: 'Today, 09:30'
              },
              {
                id: 'ORD-89420',
                items: 'The Village in the Jungle (x1)',
                amount: 1850,
                status: 'DELIVERED',
                courier: 'SL Post (Registered)',
                tracking: 'SLP-44019',
                date: 'Last week'
              }
            ]);
          } else {
            // Fresh newly registered user starts with empty orders
            setOrders([]);
          }

          // Check for user-specific tickets
          const savedTickets = localStorage.getItem(`sp_tickets_${custId}`);
          if (savedTickets !== null) {
            setTickets(JSON.parse(savedTickets));
          } else if (custId === 'CUST-1001') {
            setTickets([
              {
                id: 4011,
                subject: 'Order delivery delayed past estimated date',
                status: 'IN_PROGRESS',
                date: '15 mins ago',
                resolution: 'Contacted logistics courier partner (Domex). Package scheduled for priority dispatch tomorrow morning.'
              }
            ]);
          } else {
            setTickets([]);
          }

          // Check for user-specific payments
          const savedPayments = localStorage.getItem(`sp_payments_${custId}`);
          if (savedPayments !== null) {
            setPayments(JSON.parse(savedPayments));
          } else if (custId === 'CUST-1001') {
            setPayments([
              {
                id: 1,
                reference: 'TXN-80921-VISA',
                invoice: 'INV-2026-00101',
                amount: 4200,
                method: 'CARD (Visa)',
                status: 'PAID',
                date: 'Today, 14:20'
              },
              {
                id: 2,
                reference: 'TXN-80918-STRIPE',
                invoice: 'INV-2026-00104',
                amount: 1850,
                method: 'STRIPE',
                status: 'REFUNDED',
                date: 'Yesterday, 16:30'
              }
            ]);
          } else {
            setPayments([]);
          }
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      setEditForm({
        name: DEFAULT_CUSTOMER.name,
        phone: DEFAULT_CUSTOMER.phone,
        address: DEFAULT_CUSTOMER.address
      });
      // Default guest view
      setOrders([]);
      setTickets([]);
      setPayments([]);
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove('sp_customer');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sp_customer');
    }
    router.push('/login');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...customer,
      name: editForm.name,
      phone: editForm.phone,
      address: editForm.address
    };
    setCustomer(updated);
    Cookies.set('sp_customer', JSON.stringify(updated), { expires: 7 });
    if (typeof window !== 'undefined') {
      localStorage.setItem('sp_customer', JSON.stringify(updated));
    }
    setIsEditModalOpen(false);
  };

  const handleDownloadInvoice = (item: typeof payments[0]) => {
    const content = `SARASAVI PAGES - CUSTOMER RECEIPT
===============================================
Customer: ${customer.name} (${customer.customerId})
Invoice No: ${item.invoice}
Reference: ${item.reference}
Amount: LKR ${item.amount.toFixed(2)}
Payment Method: ${item.method}
Status: ${item.status}
Date: ${item.date}
===============================================
Thank you for shopping with Sarasavi Pages!
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${item.invoice}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#c8d8c6] text-[#122215] antialiased selection:bg-[#0d110e] selection:text-white font-sans py-4">
      {/* ── Cohesive Floating Pill Header ──────────────────────────── */}
      <header className="sticky top-4 z-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div className="ios-glass bg-white/85 backdrop-blur-xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-full h-16 px-6 flex items-center justify-between gap-4 transition-all">
          {/* Left: Brand Wordmark with Organic Dots */}
          <Link href="/" className="flex items-center gap-2.5 group text-left shrink-0">
            <div className="flex items-center -space-x-1">
              <div className="w-3.5 h-3.5 rounded-full bg-[#122215] group-hover:scale-110 transition-transform" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 group-hover:scale-110 transition-transform" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#122215] group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-medium text-lg tracking-tight text-[#122215] font-sans">
              sarasavi<span className="font-normal text-[#526456]">pages</span>
            </span>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center rounded-full p-1 bg-black/[0.04] gap-1">
            {[
              { id: 'home', label: 'Home', href: '/' },
              { id: 'books', label: 'Books', href: '/#books' },
              { id: 'writers', label: 'People', href: '/#writers' },
              { id: 'dashboard', label: '• Dashboard', href: '/account' },
              { id: 'about', label: 'About', href: '/#about' },
            ].map((tab) => {
              const isActive = tab.id === 'dashboard';
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`relative px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-[#122215] shadow-xs'
                      : 'text-[#526456] hover:text-[#122215] hover:bg-white/40'
                  }`}
                >
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: User Status & Sign Out */}
          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-black/[0.06] text-[#122215] text-xs font-medium shadow-xs">
              <div className="w-4 h-4 rounded-full bg-[#122215] text-white flex items-center justify-center">
                <User className="w-2.5 h-2.5" />
              </div>
              <span className="font-medium text-[#122215] text-xs">
                {customer.email?.split('@')[0] || customer.name.split(' ')[0]}
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium text-[10px] tracking-wide uppercase">
                {customer.tier}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-full text-xs text-[#526456] hover:text-red-700 hover:bg-white/60 font-medium transition-all"
              title="Sign Out"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Container ─────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
        {/* Customer Header Banner */}
        <div className="ios-glass bg-white/85 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-[#122215] flex items-center justify-center text-white font-medium text-2xl shadow-sm">
                {customer.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-medium text-[#122215] tracking-tight">{customer.name}</h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>KYC Verified</span>
                  </span>
                </div>
                <p className="text-xs text-[#526456] mt-1 flex items-center gap-2 font-mono">
                  <span className="text-[#122215] font-medium">{customer.customerId}</span>
                  <span className="opacity-40">|</span>
                  <span>{customer.email}</span>
                </p>
              </div>
            </div>

            {/* Loyalty Points Card */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#f4f7f4] border border-[#d8e2d8] self-start sm:self-auto">
              <div className="h-10 w-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center">
                <Award className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase text-[#6b7c6f]">Sarasavi Loyalty Tier</div>
                <div className="text-lg font-medium text-[#122215] flex items-center gap-2">
                  <span className="text-amber-800">{customer.tier} TIER</span>
                  <span className="text-xs font-mono text-[#526456]">({customer.points} Points)</span>
                </div>
                <div className="text-[10px] text-emerald-700 font-medium">10% discount automatically applies at checkout</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="inline-flex bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/70 shadow-xs gap-1.5 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-[#122215] text-white shadow-xs'
                : 'text-[#526456] hover:text-[#122215] hover:bg-black/[0.03]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Security</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-[#122215] text-white shadow-xs'
                : 'text-[#526456] hover:text-[#122215] hover:bg-black/[0.03]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'tickets'
                ? 'bg-[#122215] text-white shadow-xs'
                : 'text-[#526456] hover:text-[#122215] hover:bg-black/[0.03]'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>Support Inquiries ({tickets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'payments'
                ? 'bg-[#122215] text-white shadow-xs'
                : 'text-[#526456] hover:text-[#122215] hover:bg-black/[0.03]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Invoices & Payments ({payments.length})</span>
          </button>
        </div>

        {/* ── TAB 1: PROFILE & DETAILS ──────────────────────────────── */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 ios-glass bg-white/85 backdrop-blur-xl p-6 rounded-2xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
                <h3 className="font-medium text-[#122215] text-sm">Personal & Delivery Information</h3>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/[0.08] text-[#122215] hover:bg-black/[0.02] text-xs font-medium shadow-xs transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#526456]" />
                  <span>Edit Details</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#6b7c6f] block text-[11px] mb-1">Full Name</span>
                  <p className="text-[#122215] font-medium">{customer.name}</p>
                </div>
                <div>
                  <span className="text-[#6b7c6f] block text-[11px] mb-1">Customer Identifier</span>
                  <p className="text-[#122215] font-mono font-medium">{customer.customerId}</p>
                </div>
                <div>
                  <span className="text-[#6b7c6f] block text-[11px] mb-1">Email Address</span>
                  <p className="text-[#122215] font-mono">{customer.email}</p>
                </div>
                <div>
                  <span className="text-[#6b7c6f] block text-[11px] mb-1">Primary Phone</span>
                  <p className="text-[#122215] font-mono">{customer.phone}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[#6b7c6f] block text-[11px] mb-1">Delivery Address</span>
                  <p className="text-[#122215] leading-relaxed">{customer.address}</p>
                </div>
              </div>
            </div>

            <div className="ios-glass bg-white/85 backdrop-blur-xl p-6 rounded-2xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
              <h3 className="font-medium text-[#122215] text-sm">Loyalty Perks (Module 5)</h3>
              <ul className="text-xs text-[#526456] space-y-2.5">
                <li className="flex items-center gap-2 text-[#122215]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>10% Instant Discount on Classic Literature</span>
                </li>
                <li className="flex items-center gap-2 text-[#122215]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Priority Courier Delivery via Domex</span>
                </li>
                <li className="flex items-center gap-2 text-[#122215]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Special Coupon Access (SARASAVI20)</span>
                </li>
              </ul>
              <div className="p-3 rounded-xl bg-[#f4f7f4] border border-[#d8e2d8] text-center">
                <span className="text-[11px] text-[#6b7c6f] block">Next Tier Upgrade</span>
                <span className="text-xs font-medium text-emerald-800">150 more points to PLATINUM</span>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: MY ORDERS ──────────────────────────────────────── */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="ios-glass bg-white/85 backdrop-blur-xl p-10 sm:p-12 rounded-3xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
                  <Package className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-medium text-[#122215]">No orders placed yet</h4>
                  <p className="text-xs text-[#526456] max-w-md mx-auto mt-1 leading-relaxed">
                    Your reading shelf is waiting! Browse our extensive collection of classic Sinhala literature, global fiction, and academic textbooks.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#122215] hover:bg-black text-white text-xs font-medium transition-all shadow-md active:scale-95"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Explore Bookstore Catalog</span>
                  </Link>
                </div>
              </div>
            ) : (
              orders.map((ord) => (
                <div key={ord.id} className="ios-glass bg-white/85 backdrop-blur-xl p-6 rounded-2xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/[0.06] pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-medium text-sm text-[#122215]">{ord.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                        ord.status === 'DELIVERED'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-sky-50 border-sky-200 text-sky-700'
                      }`}>
                        {ord.status}
                      </span>
                    </div>
                    <span className="text-xs text-[#6b7c6f] font-mono">{ord.date}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-[#122215]">{ord.items}</h4>
                      <p className="text-xs text-[#526456] mt-1 flex items-center gap-1.5 font-mono">
                        <Truck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{ord.courier} (Tracking: {ord.tracking})</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#6b7c6f] block">Total Paid</span>
                      <span className="text-base font-medium font-mono text-[#122215]">
                        LKR {ord.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TAB 3: SUPPORT TICKETS ────────────────────────────────── */}
        {activeTab === 'tickets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-[#122215]">Your Submitted Support Inquiries</h3>
              <Link
                href="/#contact-section"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#122215] text-white text-xs font-medium shadow-xs hover:bg-black transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit New Ticket</span>
              </Link>
            </div>

            {tickets.length === 0 ? (
              <div className="ios-glass bg-white/85 backdrop-blur-xl p-10 sm:p-12 rounded-3xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center mx-auto border border-sky-100 shadow-xs">
                  <Headphones className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-medium text-[#122215]">No active support inquiries</h4>
                  <p className="text-xs text-[#526456] max-w-md mx-auto mt-1 leading-relaxed">
                    Everything looks peaceful! If you ever need help with order dispatch, damaged books, or textbook rentals, our customer service officers are available 24/7.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/#contact-section"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-sky-700 hover:bg-sky-800 text-white text-xs font-medium transition-all shadow-md active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Open a Support Request</span>
                  </Link>
                </div>
              </div>
            ) : (
              tickets.map((t) => (
                <div key={t.id} className="ios-glass bg-white/85 backdrop-blur-xl p-6 rounded-2xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
                  <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-medium text-xs text-[#122215]">#{t.id}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-[10px] font-medium">
                        {t.status}
                      </span>
                    </div>
                    <span className="text-xs text-[#6b7c6f] font-mono">{t.date}</span>
                  </div>
                  <h4 className="text-sm font-medium text-[#122215]">{t.subject}</h4>
                  {t.resolution && (
                    <div className="p-3.5 rounded-xl bg-[#f4f7f4] border border-[#d8e2d8] text-xs space-y-1">
                      <span className="text-emerald-800 font-medium text-[11px] block">Customer Service Response:</span>
                      <p className="text-[#334237] leading-relaxed">{t.resolution}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TAB 4: INVOICES & RECEIPTS ────────────────────────────── */}
        {activeTab === 'payments' && (
          <div className="ios-glass bg-white/85 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            {payments.length === 0 ? (
              <div className="p-10 sm:p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-600 flex items-center justify-center mx-auto border border-stone-200 shadow-xs">
                  <CreditCard className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-medium text-[#122215]">No payment transactions yet</h4>
                  <p className="text-xs text-[#526456] max-w-md mx-auto mt-1 leading-relaxed">
                    When you order books online, your automated digital invoices, receipts, and payment authorizations will be safely archived here.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#122215] hover:bg-black text-white text-xs font-medium transition-all shadow-md active:scale-95"
                  >
                    <span>Browse Books</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-black/[0.06] bg-[#f4f7f4] text-[11px] font-mono uppercase text-[#6b7c6f]">
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Transaction Ref</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04]">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-black/[0.01]">
                        <td className="py-3.5 px-4 font-mono font-medium text-[#122215]">{p.invoice}</td>
                        <td className="py-3.5 px-4 font-mono text-[#6b7c6f]">{p.reference}</td>
                        <td className="py-3.5 px-4 text-[#334237]">{p.method}</td>
                        <td className="py-3.5 px-4 font-mono font-medium text-[#122215]">LKR {p.amount.toFixed(2)}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            p.status === 'PAID'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-sky-50 border-sky-200 text-sky-700'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDownloadInvoice(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-black/[0.08] text-emerald-800 hover:bg-emerald-50 text-xs font-medium transition-all shadow-xs"
                          >
                            <Download className="w-3 h-3 text-emerald-700" />
                            <span>Receipt</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── EDIT PROFILE MODAL ────────────────────────────────────── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="ios-glass bg-white/95 rounded-3xl w-full max-w-md p-6 border border-white/90 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <h3 className="text-base font-medium text-[#122215] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-700" />
                <span>Edit Profile Details</span>
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-[#6b7c6f] hover:text-[#122215]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#526456] mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f4f7f4] border border-[#d8e2d8] text-[#122215] focus:outline-none focus:border-[#122215] transition-all"
                />
              </div>

              <div>
                <label className="block text-[#526456] mb-1 font-medium">Phone Number</label>
                <input
                  type="text"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f4f7f4] border border-[#d8e2d8] text-[#122215] focus:outline-none focus:border-[#122215] font-mono transition-all"
                />
              </div>

              <div>
                <label className="block text-[#526456] mb-1 font-medium">Shipping Address</label>
                <textarea
                  required
                  rows={3}
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f4f7f4] border border-[#d8e2d8] text-[#122215] focus:outline-none focus:border-[#122215] transition-all"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-black/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-black/[0.08] text-[#526456] hover:text-[#122215] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#122215] hover:bg-black text-white font-medium shadow-xs transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
