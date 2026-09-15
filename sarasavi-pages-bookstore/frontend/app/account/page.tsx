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
  ShoppingCart, 
  Package, 
  Headphones, 
  CreditCard, 
  Receipt, 
  LogOut, 
  Globe, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  Truck,
  ArrowRight,
  Download,
  Plus,
  X
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

  // Sample Customer Orders (M6)
  const [orders, setOrders] = useState([
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

  // Sample Customer Tickets (M3)
  const [tickets, setTickets] = useState([
    {
      id: 4011,
      subject: 'Order delivery delayed past estimated date',
      status: 'IN_PROGRESS',
      date: '15 mins ago',
      resolution: 'Contacted logistics courier partner (Pronto). Package scheduled for priority dispatch tomorrow morning.'
    }
  ]);

  // Sample Customer Payments (M2)
  const [payments, setPayments] = useState([
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
      } catch (e) {
        console.error(e);
      }
    } else {
      setEditForm({
        name: DEFAULT_CUSTOMER.name,
        phone: DEFAULT_CUSTOMER.phone,
        address: DEFAULT_CUSTOMER.address
      });
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
    <div className="min-h-screen bg-[#0a0c10] text-ink selection:bg-brand-500/20 selection:text-brand-300">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#0a0c10]/80 backdrop-blur-md border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight">
                <span className="font-display font-bold text-sm tracking-tight text-white group-hover:text-brand-400 transition-colors">
                  Sarasavi Pages
                </span>
                <span className="block text-[10px] text-ink-muted">Customer Dashboard</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-surface-border hover:border-brand-500/40 text-xs font-semibold text-ink-light hover:text-white transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-brand-400" />
              <span>Back to Storefront</span>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-semibold text-red-400 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Customer Header Banner */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-surface-border relative overflow-hidden bg-gradient-to-r from-surface-card via-surface-card to-brand-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-brand flex items-center justify-center text-white font-display text-2xl font-bold shadow-glow">
                {customer.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold font-display text-white">{customer.name}</h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>KYC Verified</span>
                  </span>
                </div>
                <p className="text-xs text-ink-muted mt-1 flex items-center gap-2">
                  <span className="font-mono text-brand-400 font-semibold">{customer.customerId}</span>
                  <span>•</span>
                  <span>{customer.email}</span>
                </p>
              </div>
            </div>

            {/* Loyalty Points Card (Module 5) */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface/60 border border-surface-border self-start sm:self-auto">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase text-ink-muted">Sarasavi Loyalty Tier</div>
                <div className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-amber-400">{customer.tier} TIER</span>
                  <span className="text-xs font-mono text-ink-muted">({customer.points} Points)</span>
                </div>
                <div className="text-[10px] text-emerald-400">10% discount automatically applies at checkout</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-surface-border space-x-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-ink-muted hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Security</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-ink-muted hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'tickets'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-ink-muted hover:text-white'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>Support Inquiries ({tickets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'payments'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-ink-muted hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Invoices & Payments ({payments.length})</span>
          </button>
        </div>

        {/* ── TAB 1: PROFILE & DETAILS ──────────────────────────────── */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 glass-card p-6 rounded-2xl border border-surface-border space-y-4">
              <div className="flex items-center justify-between border-b border-surface-border/60 pb-3">
                <h3 className="font-bold text-white text-sm">Personal & Delivery Information</h3>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-surface-border text-brand-400 hover:text-white text-xs font-semibold transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-ink-muted block text-[11px] mb-1">Full Name</span>
                  <p className="text-white font-semibold">{customer.name}</p>
                </div>
                <div>
                  <span className="text-ink-muted block text-[11px] mb-1">Customer Identifier</span>
                  <p className="text-brand-400 font-mono font-semibold">{customer.customerId}</p>
                </div>
                <div>
                  <span className="text-ink-muted block text-[11px] mb-1">Email Address</span>
                  <p className="text-white font-mono">{customer.email}</p>
                </div>
                <div>
                  <span className="text-ink-muted block text-[11px] mb-1">Primary Phone</span>
                  <p className="text-white font-mono">{customer.phone}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-ink-muted block text-[11px] mb-1">Delivery Address</span>
                  <p className="text-white">{customer.address}</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-surface-border space-y-4">
              <h3 className="font-bold text-white text-sm">Loyalty Perks (Module 5)</h3>
              <ul className="text-xs text-ink-muted space-y-2.5">
                <li className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>10% Instant Discount on Classic Literature</span>
                </li>
                <li className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Priority Courier Delivery via Domex</span>
                </li>
                <li className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Special Coupon Access (SARASAVI20)</span>
                </li>
              </ul>
              <div className="p-3 rounded-xl bg-surface border border-surface-border text-center">
                <span className="text-[11px] text-ink-muted block">Next Tier Upgrade</span>
                <span className="text-xs font-bold text-brand-400">150 more points to PLATINUM</span>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: MY ORDERS ──────────────────────────────────────── */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.map((ord) => (
              <div key={ord.id} className="glass-card p-6 rounded-2xl border border-surface-border space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border/60 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-brand-400">{ord.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      ord.status === 'DELIVERED'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                    }`}>
                      {ord.status}
                    </span>
                  </div>
                  <span className="text-xs text-ink-muted font-mono">{ord.date}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{ord.items}</h4>
                    <p className="text-xs text-ink-muted mt-1 flex items-center gap-1.5 font-mono">
                      <Truck className="w-3.5 h-3.5 text-sky-400" />
                      <span>{ord.courier} (Tracking: {ord.tracking})</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-ink-muted block">Total Paid</span>
                    <span className="text-base font-bold font-mono text-white">
                      LKR {ord.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB 3: SUPPORT TICKETS ────────────────────────────────── */}
        {activeTab === 'tickets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Your Submitted Support Inquiries</h3>
              <Link
                href="/#contact-section"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-500/20 border border-brand-500/30 text-brand-400 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit New Ticket</span>
              </Link>
            </div>

            {tickets.map((t) => (
              <div key={t.id} className="glass-card p-6 rounded-2xl border border-surface-border space-y-3">
                <div className="flex items-center justify-between border-b border-surface-border/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs text-sky-400">#{t.id}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-semibold">
                      {t.status}
                    </span>
                  </div>
                  <span className="text-xs text-ink-muted font-mono">{t.date}</span>
                </div>
                <h4 className="text-sm font-semibold text-white">{t.subject}</h4>
                {t.resolution && (
                  <div className="p-3 rounded-xl bg-surface/60 border border-emerald-500/20 text-xs space-y-1">
                    <span className="text-emerald-400 font-semibold text-[11px] block">Customer Service Response:</span>
                    <p className="text-ink-light leading-relaxed">{t.resolution}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── TAB 4: INVOICES & RECEIPTS ────────────────────────────── */}
        {activeTab === 'payments' && (
          <div className="glass-card rounded-2xl overflow-hidden border border-surface-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-card/60 text-[11px] font-mono uppercase text-ink-muted">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Transaction Ref</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/50">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-surface/30">
                      <td className="py-3.5 px-4 font-mono font-semibold text-white">{p.invoice}</td>
                      <td className="py-3.5 px-4 font-mono text-ink-muted">{p.reference}</td>
                      <td className="py-3.5 px-4">{p.method}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white">LKR {p.amount.toFixed(2)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          p.status === 'PAID'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDownloadInvoice(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border border-surface-border text-emerald-400 hover:bg-emerald-500/10 text-xs"
                        >
                          <Download className="w-3 h-3" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl w-full max-w-md p-6 border border-surface-border space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-brand-400" />
                <span>Edit Profile Details</span>
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-ink-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block text-ink-muted mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-ink-muted mb-1 font-medium">Phone Number</label>
                <input
                  type="text"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-ink-muted mb-1 font-medium">Shipping Address</label>
                <textarea
                  required
                  rows={3}
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand-500"
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
                  className="px-4 py-2 rounded-xl bg-gradient-brand text-white font-semibold shadow-glow"
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
