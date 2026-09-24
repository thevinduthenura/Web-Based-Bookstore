'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
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
  ArrowUpRight,
  Check,
  Sparkles,
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
  tier: 'STANDARD' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  membership?: 'NONE' | 'BASIC' | 'PREMIUM' | string;
  isMember?: boolean;
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

  // ── MEMBERSHIP UPGRADE STATE & MODAL ──────────────────────────────────────
  const MEMBERSHIP_PLANS = [
    { id: 'BASIC', label: 'Reader Basic', price: 990, duration: '3 months', benefits: ['10% discount on all books', 'Free shipping on orders over LKR 2000', 'Priority customer support', 'Early access to new arrivals'] },
    { id: 'PREMIUM', label: 'Scholar Premium', price: 2490, duration: '12 months', benefits: ['20% discount on all books', 'Free islandwide shipping on all orders', 'Priority customer support', 'Exclusive author editions', 'Academic rental upgrades'] },
  ];
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [membershipStep, setMembershipStep] = useState<'select' | 'payment' | 'success'>('select');
  const [selectedPlan, setSelectedPlan] = useState(MEMBERSHIP_PLANS[0]);
  const [membershipForm, setMembershipForm] = useState({
    method: 'CREDIT_CARD' as 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER',
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: ''
  });
  const [membershipProcessing, setMembershipProcessing] = useState(false);
  const [membershipInvoice, setMembershipInvoice] = useState<{
    invoiceNo: string;
    plan: string;
    price: number;
    duration: string;
    date: string;
    customer: string;
  } | null>(null);

  const handlePurchaseMembership = async (e: React.FormEvent) => {
    e.preventDefault();
    setMembershipProcessing(true);
    await new Promise(r => setTimeout(r, 1200));
    const invNo = `MEM-INV-${Date.now().toString().slice(-8)}`;
    const inv = {
      invoiceNo: invNo,
      plan: selectedPlan.label,
      price: selectedPlan.price,
      duration: selectedPlan.duration,
      date: new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' }),
      customer: customer.name || 'Valued Reader'
    };
    setMembershipInvoice(inv);

    const updatedCust: CustomerData = {
      ...customer,
      membership: selectedPlan.id,
      isMember: true,
      tier: (selectedPlan.id === 'PREMIUM' ? 'GOLD' : 'SILVER') as any
    };
    setCustomer(updatedCust);

    if (typeof window !== 'undefined') {
      localStorage.setItem('sp_membership', selectedPlan.id);
      localStorage.setItem('sp_customer', JSON.stringify(updatedCust));
      Cookies.set('sp_customer', JSON.stringify(updatedCust), { expires: 7 });

      const savedPayments = JSON.parse(localStorage.getItem(`sp_payments_${customer.customerId}`) || '[]');
      const newPay = {
        id: Date.now(),
        reference: `TXN-MEM-${Date.now().toString().slice(-6)}`,
        invoice: invNo,
        amount: selectedPlan.price,
        method: membershipForm.method.replace(/_/g, ' '),
        status: 'PAID',
        date: 'Today, Just now'
      };
      const updatedPays = [newPay, ...savedPayments];
      localStorage.setItem(`sp_payments_${customer.customerId}`, JSON.stringify(updatedPays));
      setPayments(updatedPays);
    }
    setMembershipProcessing(false);
    setMembershipStep('success');
  };

  const handleDownloadMembershipTaxInvoice = (inv: typeof membershipInvoice) => {
    if (!inv) return;
    const content = [
      '================================================================',
      '           SARASAVI PAGES (PVT) LTD - MEMBERSHIP TAX INVOICE',
      '================================================================',
      `Invoice No      : ${inv.invoiceNo}`,
      `Date & Time     : ${inv.date}`,
      `Member Customer : ${inv.customer} (${customer.customerId})`,
      `Email Address   : ${customer.email}`,
      '----------------------------------------------------------------',
      'SUBSCRIPTION DETAILS:',
      `  Plan          : ${inv.plan}`,
      `  Validity      : ${inv.duration}`,
      `  Amount Paid   : LKR ${inv.price.toFixed(2)}`,
      `  Payment Status: COMPLETED / VERIFIED`,
      '----------------------------------------------------------------',
      'ACTIVE MEMBER PERKS:',
      inv.plan.includes('Premium')
        ? '  ✓ 20% discount on all bookstore catalog purchases\n  ✓ Free islandwide delivery\n  ✓ Priority customer support\n  ✓ Academic rental tier privileges'
        : '  ✓ 10% discount on all bookstore catalog purchases\n  ✓ Free shipping on orders over LKR 2000\n  ✓ Priority customer support',
      '================================================================',
      'Thank you for joining Sarasavi Pages Membership!',
      'Sarasavi Pages (Pvt) Ltd · Official Tax Receipt',
      '================================================================',
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${inv.invoiceNo}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    // Check if customer cookie / localStorage exists
    const raw = Cookies.get('sp_customer') || (typeof window !== 'undefined' ? localStorage.getItem('sp_customer') : null);
    if (raw) {
      try {
        const parsed: CustomerData = JSON.parse(raw);
        if (typeof window !== 'undefined') {
          const savedMembership = localStorage.getItem('sp_membership');
          if (savedMembership && (!parsed.membership || parsed.membership === 'NONE')) {
            parsed.membership = savedMembership;
            parsed.isMember = true;
          }
        }
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
    <div className="min-h-screen bg-[#F8F9F5] text-[#20231B] antialiased selection:bg-[#34451D] selection:text-white font-sans py-4">
      {/* ── Cohesive Floating Pill Header ──────────────────────────── */}
      <Navbar activeTab="about" />

      {/* ── Main Container ─────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
        {/* Customer Header Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E7D8] shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-[#34451D] flex items-center justify-center text-white font-display font-light text-2xl shadow-sm">
                {customer.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-display font-light text-[#20231B] tracking-tight">{customer.name}</h1>
                  {customer.kycVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F0F4E8] border border-[#E2E7D8] text-[#34451D] text-[11px] font-medium">
                      <ShieldCheck className="w-3 h-3 text-[#596B32]" />
                      <span>KYC Verified</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-[#E2E7D8] text-[#85887A] text-[11px] font-medium">
                      <span>Standard Free Account</span>
                    </span>
                  )}
                  {customer.membership && customer.membership !== 'NONE' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#34451D] text-[#B7D85A] text-[11px] font-medium">
                      <Award className="w-3 h-3" />
                      <span>{customer.membership === 'PREMIUM' ? '👑 Scholar Premium Member' : '⭐ Reader Basic Member'}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#85887A] mt-1 flex items-center gap-2 font-mono flex-wrap">
                  <span className="text-[#34451D] font-medium">{customer.customerId}</span>
                  <span className="opacity-40">|</span>
                  <span>{customer.email}</span>
                  <span className="opacity-40">|</span>
                  <button
                    onClick={handleLogout}
                    className="text-red-700 hover:underline font-sans text-xs font-medium cursor-pointer"
                  >
                    Sign out
                  </button>
                </p>
              </div>
            </div>

            {/* Membership / Loyalty Tier Card */}
            {customer.membership && customer.membership !== 'NONE' ? (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8] self-start sm:self-auto shadow-xs">
                <div className="h-10 w-10 rounded-xl bg-[#34451D] text-[#B7D85A] flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase text-[#596B32] font-semibold">Active Membership</div>
                  <div className="text-lg font-display font-normal text-[#20231B] flex items-center gap-2">
                    <span className="text-[#34451D]">{customer.membership === 'PREMIUM' ? 'Scholar Premium' : 'Reader Basic'}</span>
                    <span className="text-xs font-mono text-[#596B32]">({customer.membership === 'PREMIUM' ? '20% OFF' : '10% OFF'})</span>
                  </div>
                  <div className="text-[10px] text-[#596B32] font-medium">
                    {customer.membership === 'PREMIUM' ? '20% discount & free islandwide delivery active' : '10% discount on all bookstore catalog purchases active'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#E2E7D8] self-start sm:self-auto shadow-xs">
                <div className="h-10 w-10 rounded-xl bg-[#F0F4E8] text-[#596B32] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#596B32]" />
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase text-[#85887A]">Membership Status</div>
                  <div className="text-sm font-display font-medium text-[#20231B]">
                    Standard Account (Non-Member)
                  </div>
                  <Link
                    href="/membership"
                    className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#34451D] text-white text-[11px] font-medium hover:bg-[#20231B] transition-all shadow-xs"
                  >
                    <span>Upgrade to Membership (10%–20% OFF)</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="inline-flex bg-white p-1.5 rounded-2xl border border-[#E2E7D8] shadow-xs gap-1.5 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-[#34451D] text-white shadow-xs'
                : 'text-[#85887A] hover:text-[#20231B] hover:bg-[#F0F4E8]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Security</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-[#34451D] text-white shadow-xs'
                : 'text-[#85887A] hover:text-[#20231B] hover:bg-[#F0F4E8]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'tickets'
                ? 'bg-[#34451D] text-white shadow-xs'
                : 'text-[#85887A] hover:text-[#20231B] hover:bg-[#F0F4E8]'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>Support Inquiries ({tickets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'payments'
                ? 'bg-[#34451D] text-white shadow-xs'
                : 'text-[#85887A] hover:text-[#20231B] hover:bg-[#F0F4E8]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Invoices & Payments ({payments.length})</span>
          </button>
        </div>

        {/* ── TAB 1: PROFILE & DETAILS ──────────────────────────────── */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-[#E2E7D8] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E7D8] pb-3">
                <h3 className="font-display font-normal text-[#20231B] text-base">Personal & Delivery Information</h3>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] hover:bg-[#F0F4E8] text-xs font-medium shadow-xs transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#596B32]" />
                  <span>Edit Details</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#85887A] block text-[11px] mb-1">Full Name</span>
                  <p className="text-[#20231B] font-semibold">{customer.name}</p>
                </div>
                <div>
                  <span className="text-[#85887A] block text-[11px] mb-1">Customer Identifier</span>
                  <p className="text-[#34451D] font-mono font-medium">{customer.customerId}</p>
                </div>
                <div>
                  <span className="text-[#85887A] block text-[11px] mb-1">Email Address</span>
                  <p className="text-[#20231B] font-mono">{customer.email}</p>
                </div>
                <div>
                  <span className="text-[#85887A] block text-[11px] mb-1">Primary Phone</span>
                  <p className="text-[#20231B] font-mono">{customer.phone}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[#85887A] block text-[11px] mb-1">Delivery Address</span>
                  <p className="text-[#20231B] leading-relaxed">{customer.address}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E2E7D8] shadow-xs space-y-4">
              <h3 className="font-display font-normal text-[#20231B] text-base">Loyalty Perks (Module 5)</h3>
              <ul className="text-xs text-[#85887A] space-y-2.5">
                <li className="flex items-center gap-2 text-[#20231B]">
                  <CheckCircle2 className="w-4 h-4 text-[#596B32] shrink-0" />
                  <span>10% Instant Discount on Classic Literature</span>
                </li>
                <li className="flex items-center gap-2 text-[#20231B]">
                  <CheckCircle2 className="w-4 h-4 text-[#596B32] shrink-0" />
                  <span>Priority Courier Delivery via Domex</span>
                </li>
                <li className="flex items-center gap-2 text-[#20231B]">
                  <CheckCircle2 className="w-4 h-4 text-[#596B32] shrink-0" />
                  <span>Special Coupon Access (SARASAVI20)</span>
                </li>
              </ul>
              <div className="p-3 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-center">
                <span className="text-[11px] text-[#85887A] block">Next Tier Upgrade</span>
                <span className="text-xs font-medium text-[#34451D]">150 more points to PLATINUM</span>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: MY ORDERS ──────────────────────────────────────── */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white p-10 sm:p-12 rounded-3xl border border-[#E2E7D8] shadow-xs text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#F0F4E8] text-[#34451D] flex items-center justify-center mx-auto border border-[#E2E7D8] shadow-xs">
                  <Package className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-display font-normal text-[#20231B]">No orders placed yet</h4>
                  <p className="text-xs text-[#85887A] max-w-md mx-auto mt-1 leading-relaxed">
                    Your reading shelf is waiting! Browse our extensive collection of classic Sinhala literature, global fiction, and academic textbooks.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white text-xs font-medium transition-all shadow-md active:scale-95"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Explore Bookstore Catalog</span>
                  </Link>
                </div>
              </div>
            ) : (
              orders.map((ord) => (
                <div key={ord.id} className="bg-white p-6 rounded-2xl border border-[#E2E7D8] shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E7D8] pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-medium text-sm text-[#20231B]">{ord.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                        ord.status === 'DELIVERED'
                          ? 'bg-[#F0F4E8] border-[#E2E7D8] text-[#34451D]'
                          : 'bg-[#F8F9F5] border-[#E2E7D8] text-[#596B32]'
                      }`}>
                        {ord.status}
                      </span>
                    </div>
                    <span className="text-xs text-[#85887A] font-mono">{ord.date}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-[#20231B]">{ord.items}</h4>
                      <p className="text-xs text-[#85887A] mt-1 flex items-center gap-1.5 font-mono">
                        <Truck className="w-3.5 h-3.5 text-[#596B32]" />
                        <span>{ord.courier} (Tracking: {ord.tracking})</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#85887A] block">Total Paid</span>
                      <span className="text-base font-semibold font-mono text-[#20231B]">
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
              <h3 className="text-sm font-display font-normal text-[#20231B]">Your Submitted Support Inquiries</h3>
              <Link
                href="/#contact-section"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#34451D] text-white text-xs font-medium shadow-xs hover:bg-[#20231B] transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit New Ticket</span>
              </Link>
            </div>

            {tickets.length === 0 ? (
              <div className="bg-white p-10 sm:p-12 rounded-3xl border border-[#E2E7D8] shadow-xs text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#F0F4E8] text-[#34451D] flex items-center justify-center mx-auto border border-[#E2E7D8] shadow-xs">
                  <Headphones className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-display font-normal text-[#20231B]">No active support inquiries</h4>
                  <p className="text-xs text-[#85887A] max-w-md mx-auto mt-1 leading-relaxed">
                    Everything looks peaceful! If you ever need help with order dispatch, damaged books, or textbook rentals, our customer service officers are available 24/7.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/#contact-section"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white text-xs font-medium transition-all shadow-md active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Open a Support Request</span>
                  </Link>
                </div>
              </div>
            ) : (
              tickets.map((t) => (
                <div key={t.id} className="bg-white p-6 rounded-2xl border border-[#E2E7D8] shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E2E7D8] pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-medium text-xs text-[#20231B]">#{t.id}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#F0F4E8] border border-[#E2E7D8] text-[#34451D] text-[10px] font-medium">
                        {t.status}
                      </span>
                    </div>
                    <span className="text-xs text-[#85887A] font-mono">{t.date}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#20231B]">{t.subject}</h4>
                  {t.resolution && (
                    <div className="p-3.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-xs space-y-1">
                      <span className="text-[#34451D] font-medium text-[11px] block">Customer Service Response:</span>
                      <p className="text-[#20231B] leading-relaxed">{t.resolution}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TAB 4: INVOICES & RECEIPTS ────────────────────────────── */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-2xl overflow-hidden border border-[#E2E7D8] shadow-xs">
            {payments.length === 0 ? (
              <div className="p-10 sm:p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#F0F4E8] text-[#596B32] flex items-center justify-center mx-auto border border-[#E2E7D8] shadow-xs">
                  <CreditCard className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-display font-normal text-[#20231B]">No payment transactions yet</h4>
                  <p className="text-xs text-[#85887A] max-w-md mx-auto mt-1 leading-relaxed">
                    When you order books online, your automated digital invoices, receipts, and payment authorizations will be safely archived here.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white text-xs font-medium transition-all shadow-md active:scale-95"
                  >
                    <span>Browse Books</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E2E7D8] bg-[#F8F9F5] text-[11px] font-mono uppercase text-[#596B32]">
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Transaction Ref</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E7D8]">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F8F9F5]">
                        <td className="py-3.5 px-4 font-mono font-medium text-[#20231B]">{p.invoice}</td>
                        <td className="py-3.5 px-4 font-mono text-[#85887A]">{p.reference}</td>
                        <td className="py-3.5 px-4 text-[#20231B]">{p.method}</td>
                        <td className="py-3.5 px-4 font-mono font-medium text-[#20231B]">LKR {p.amount.toFixed(2)}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            p.status === 'PAID'
                              ? 'bg-[#F0F4E8] border-[#E2E7D8] text-[#34451D]'
                              : 'bg-[#F8F9F5] border-[#E2E7D8] text-[#596B32]'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDownloadInvoice(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F8F9F5] border border-[#E2E7D8] text-[#34451D] hover:bg-[#F0F4E8] text-xs font-medium transition-all shadow-xs"
                          >
                            <Download className="w-3 h-3 text-[#596B32]" />
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
          <div className="bg-white rounded-3xl w-full max-w-md p-6 border border-[#E2E7D8] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E7D8] pb-3">
              <h3 className="text-base font-display font-normal text-[#20231B] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#596B32]" />
                <span>Edit Profile Details</span>
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-[#85887A] hover:text-[#20231B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#34451D] mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[#34451D] mb-1 font-medium">Phone Number</label>
                <input
                  type="text"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white font-mono transition-all"
                />
              </div>

              <div>
                <label className="block text-[#34451D] mb-1 font-medium">Shipping Address</label>
                <textarea
                  required
                  rows={3}
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white transition-all"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E7D8]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#85887A] hover:text-[#20231B] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#34451D] hover:bg-[#20231B] text-white font-medium shadow-xs transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MEMBERSHIP PURCHASE / UPGRADE MODAL ───────────────────────── */}
      {isMembershipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-white rounded-3xl border border-[#E2E7D8] shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 sm:p-7 border-b border-[#E2E7D8]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#596B32] font-semibold tracking-wider block">
                  Sarasavi Pages Membership
                </span>
                <h3 className="font-display font-normal text-xl text-[#20231B] mt-0.5">
                  {membershipStep === 'select' ? 'Choose Your Plan' : membershipStep === 'payment' ? 'Complete Payment' : 'Membership Activated!'}
                </h3>
                {customer.membership && customer.membership !== 'NONE' && membershipStep === 'select' && (
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-[#34451D] text-[#B7D85A] text-[10px] font-mono">
                    <CheckCircle2 className="w-3 h-3" /> Current: {customer.membership === 'PREMIUM' ? 'Scholar Premium' : 'Reader Basic'}
                  </span>
                )}
              </div>
              {membershipStep !== 'success' && (
                <button
                  onClick={() => { setIsMembershipModalOpen(false); setMembershipStep('select'); }}
                  className="p-1.5 rounded-full hover:bg-[#F0F4E8] text-[#85887A]"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="p-5 sm:p-7 space-y-5">
              {membershipStep === 'select' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {MEMBERSHIP_PLANS.map((plan) => {
                      const isSelected = selectedPlan.id === plan.id;
                      return (
                        <div
                          key={plan.id}
                          onClick={() => setSelectedPlan(plan)}
                          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#34451D] bg-[#34451D] text-white'
                              : 'border-[#E2E7D8] bg-white hover:border-[#596B32]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs font-mono font-semibold ${isSelected ? 'text-[#B7D85A]' : 'text-[#596B32]'}`}>
                              {plan.duration}
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-[#B7D85A]" />}
                          </div>
                          <h4 className={`font-display text-base font-normal ${isSelected ? 'text-white' : 'text-[#20231B]'}`}>
                            {plan.label}
                          </h4>
                          <p className={`text-2xl font-light font-mono mt-1 ${isSelected ? 'text-[#B7D85A]' : 'text-[#34451D]'}`}>
                            LKR {plan.price.toFixed(0)}
                          </p>
                          <ul className={`mt-3 space-y-1.5 text-[11px] ${isSelected ? 'text-[#E2E7D8]' : 'text-[#85887A]'}`}>
                            {plan.benefits.map((b) => (
                              <li key={b} className="flex items-center gap-1.5">
                                <Check className={`w-3 h-3 shrink-0 ${isSelected ? 'text-[#B7D85A]' : 'text-[#596B32]'}`} />
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between gap-2 pt-2">
                    <button
                      onClick={() => setIsMembershipModalOpen(false)}
                      className="px-4 py-2.5 rounded-full border border-[#E2E7D8] text-[#85887A] text-xs font-medium hover:bg-[#F0F4E8]"
                    >
                      Maybe Later
                    </button>
                    <button
                      onClick={() => setMembershipStep('payment')}
                      className="px-6 py-2.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white text-xs font-medium shadow-md transition-all active:scale-95"
                    >
                      Get {selectedPlan.label} — LKR {selectedPlan.price} →
                    </button>
                  </div>
                </>
              )}

              {membershipStep === 'payment' && (
                <form onSubmit={handlePurchaseMembership} className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8] flex justify-between items-center">
                    <span className="text-[#34451D] font-medium text-xs">{selectedPlan.label} · {selectedPlan.duration}</span>
                    <span className="font-mono font-semibold text-[#20231B]">LKR {selectedPlan.price.toFixed(2)}</span>
                  </div>

                  <div>
                    <label className="block text-[#85887A] font-medium mb-2">Payment Method *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMembershipForm({ ...membershipForm, method: m })}
                          className={`p-2.5 rounded-xl border text-[11px] font-medium transition-all ${
                            membershipForm.method === m
                              ? 'border-[#34451D] bg-[#34451D] text-white'
                              : 'border-[#E2E7D8] bg-white text-[#20231B] hover:border-[#596B32]'
                          }`}
                        >
                          {m === 'CREDIT_CARD' ? '💳 Credit' : m === 'DEBIT_CARD' ? '🏧 Debit' : '🏦 Bank'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {membershipForm.method !== 'BANK_TRANSFER' ? (
                    <>
                      <div>
                        <label className="block text-[#85887A] font-medium mb-1">Card Number *</label>
                        <input
                          required
                          maxLength={19}
                          value={membershipForm.cardNumber}
                          onChange={(e) => setMembershipForm({
                            ...membershipForm,
                            cardNumber: e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim()
                          })}
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] font-mono focus:outline-none focus:border-[#596B32] focus:bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[#85887A] font-medium mb-1">Expiry *</label>
                          <input
                            required
                            maxLength={5}
                            value={membershipForm.expiry}
                            onChange={(e) => setMembershipForm({
                              ...membershipForm,
                              expiry: e.target.value.replace(/\D/g, '').replace(/(\d{2})/, '$1/').slice(0, 5)
                            })}
                            placeholder="MM/YY"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] font-mono text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[#85887A] font-medium mb-1">CVV *</label>
                          <input
                            required
                            type="password"
                            maxLength={4}
                            value={membershipForm.cvv}
                            onChange={(e) => setMembershipForm({
                              ...membershipForm,
                              cvv: e.target.value.replace(/\D/g, '')
                            })}
                            placeholder="•••"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] font-mono text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8] text-xs text-[#34451D] space-y-1">
                      <p className="font-semibold">Direct Bank Transfer (Instant Confirmation):</p>
                      <p>Commercial Bank of Ceylon · A/C: 1234567890</p>
                      <p>Branch: Colombo Fort · Account Name: Sarasavi Pages Ltd</p>
                    </div>
                  )}

                  <div className="flex justify-between gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setMembershipStep('select')}
                      className="px-4 py-2.5 rounded-full border border-[#E2E7D8] text-[#85887A] text-xs font-medium hover:bg-[#F0F4E8]"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={membershipProcessing}
                      className="px-6 py-2.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white text-xs font-medium shadow-md transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2"
                    >
                      {membershipProcessing ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          <span>Activating Membership...</span>
                        </>
                      ) : (
                        <>
                          <Award className="w-3.5 h-3.5 text-[#B7D85A]" />
                          <span>Pay LKR {selectedPlan.price.toFixed(0)} & Activate</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {membershipStep === 'success' && membershipInvoice && (
                <div className="space-y-5 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-[#34451D] flex items-center justify-center shadow-md">
                      <Award className="w-8 h-8 text-[#B7D85A]" />
                    </div>
                    <h4 className="font-display text-xl font-normal text-[#20231B]">Membership Activated!</h4>
                    <p className="text-xs text-[#85887A] max-w-sm">
                      Congratulations! You are now subscribed to <strong className="text-[#34451D]">{membershipInvoice.plan}</strong>. Member discounts apply immediately.
                    </p>
                  </div>

                  <div className="text-left p-5 rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#85887A]">Invoice No</span>
                      <span className="font-mono text-[#34451D] font-bold">{membershipInvoice.invoiceNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#85887A]">Plan</span>
                      <span className="font-medium text-[#20231B]">{membershipInvoice.plan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#85887A]">Duration</span>
                      <span className="text-[#20231B]">{membershipInvoice.duration}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-[#20231B] pt-2 border-t border-[#E2E7D8]">
                      <span>Amount Paid</span>
                      <span className="font-mono">LKR {membershipInvoice.price.toFixed(2)}</span>
                    </div>
                    <p className="text-[10px] text-[#85887A] pt-1">Issued: {membershipInvoice.date}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleDownloadMembershipTaxInvoice(membershipInvoice)}
                      className="flex-1 py-2.5 rounded-full border border-[#34451D] text-[#34451D] text-xs font-medium hover:bg-[#F0F4E8] transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Download Tax Invoice (.txt)</span>
                    </button>
                    <button
                      onClick={() => { setIsMembershipModalOpen(false); setMembershipStep('select'); }}
                      className="flex-1 py-2.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white text-xs font-medium shadow-md transition-all"
                    >
                      Close & Return to Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
