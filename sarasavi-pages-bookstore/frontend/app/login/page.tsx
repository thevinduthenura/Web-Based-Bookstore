'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api-client';
import { 
  Lock, 
  User, 
  BookOpen, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles,
  AlertCircle,
  Globe,
  CheckCircle2,
  Mail,
  ShieldCheck,
  UserPlus
} from 'lucide-react';

const QUICK_DEMO_ACCOUNTS = [
  // Customers
  {
    type: 'customer',
    label: 'Customer',
    name: 'Kamal Perera',
    identifier: 'kamal.perera@gmail.com',
    password: 'Password@123',
    badge: 'Gold Customer',
    color: 'border-amber-500/30 text-amber-400 bg-amber-500/10'
  },
  {
    type: 'customer',
    label: 'Customer',
    name: 'Nimal Fernando',
    identifier: 'nimal.fernando@yahoo.com',
    password: 'Password@123',
    badge: 'Silver Customer',
    color: 'border-zinc-500/30 text-zinc-300 bg-zinc-500/10'
  },
  // Staff / Admins
  {
    type: 'staff',
    label: 'M1 Super Admin',
    name: 'Gunathilaka H.D.T.T.',
    identifier: 'GunathilakaT1540',
    password: '1540',
    badge: 'Super Admin',
    color: 'border-[#ff7a00]/40 text-[#ff7a00] bg-[#ff7a00]/10'
  },
  {
    type: 'staff',
    label: 'M2 Payment Admin',
    name: 'Anaf M.K.A.S.',
    identifier: 'AnafS2345',
    password: '2345',
    badge: 'Payment Admin',
    color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
  },
  {
    type: 'staff',
    label: 'M3 Support Admin',
    name: 'Zeen A.C.',
    identifier: 'ZeenC3342',
    password: '3342',
    badge: 'Support Admin',
    color: 'border-sky-500/30 text-sky-400 bg-sky-500/10'
  },
  {
    type: 'staff',
    label: 'M4 Inventory Admin',
    name: 'Dissanayake S.A.S.D.',
    identifier: 'DissanayakeD1062',
    password: '1062',
    badge: 'Inventory Admin',
    color: 'border-violet-500/30 text-violet-400 bg-violet-500/10'
  },
  {
    type: 'staff',
    label: 'M5 Accounts Admin',
    name: 'Gayathmi P.G.R.',
    identifier: 'GayathmiR3013',
    password: '3013',
    badge: 'Accounts Admin',
    color: 'border-pink-500/30 text-pink-400 bg-pink-500/10'
  },
  {
    type: 'staff',
    label: 'M6 Order Admin',
    name: 'Diyes C.L.',
    identifier: 'DiyesL0263',
    password: '0263',
    badge: 'Order Admin',
    color: 'border-amber-500/30 text-amber-400 bg-amber-500/10'
  },
];

const CUSTOMER_PRESETS = [
  {
    customerId: 'CUST-1001',
    name: 'Kamal Perera',
    email: 'kamal.perera@gmail.com',
    tier: 'GOLD',
    points: 350,
    phone: '+94 77 123 4567',
    address: 'No 12, Galle Road, Colombo 03',
  },
  {
    customerId: 'CUST-1002',
    name: 'Nimal Fernando',
    email: 'nimal.fernando@yahoo.com',
    tier: 'SILVER',
    points: 180,
    phone: '+94 71 987 6543',
    address: 'No 45, Kandy Road, Kiribathgoda',
  },
  {
    customerId: 'CUST-1003',
    name: 'Sithara De Silva',
    email: 'sithara.de.silva@outlook.com',
    tier: 'BRONZE',
    points: 60,
    phone: '+94 76 543 2109',
    address: 'No 88, Havelock Road, Colombo 05',
  },
];

export default function UnifiedLoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  // Single unified form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer registration modal toggle
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regForm, setRegForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    city: 'Colombo',
    addressLine1: ''
  });
  const [regLoading, setRegLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  // ── Unified Sign-In Handler ───────────────────────────────────────────────
  const handleUnifiedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      setError('Please enter your email/username and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // 1. Check if identifier matches known staff username or IT number
      const isStaffCandidate = QUICK_DEMO_ACCOUNTS.some(
        (acc) =>
          acc.type === 'staff' &&
          (acc.identifier.toLowerCase() === cleanId.toLowerCase() ||
           cleanId.toLowerCase().startsWith('it25'))
      );

      if (isStaffCandidate || cleanId.toLowerCase().includes('admin') || !cleanId.includes('@')) {
        // Attempt Staff login via backend Spring Boot JWT
        try {
          await login({ username: cleanId, password: cleanPass });
          return; // Auth hook redirects to appropriate admin route
        } catch (staffErr: any) {
          // If explicit staff username failed, display message
          if (isStaffCandidate) {
            const msg = staffErr.response?.data?.message || 'Invalid staff credentials. Check your username and password.';
            setError(msg);
            setIsSubmitting(false);
            return;
          }
          // If not confirmed staff, proceed to check customer
        }
      }

      // 2. Customer Authentication Flow
      let customer = CUSTOMER_PRESETS.find(
        (c) =>
          c.email.toLowerCase() === cleanId.toLowerCase() ||
          c.customerId.toLowerCase() === cleanId.toLowerCase()
      );

      // Also check local registry of created customers
      if (!customer && typeof window !== 'undefined') {
        try {
          const registered = JSON.parse(localStorage.getItem('sp_registered_customers') || '[]');
          const found = registered.find(
            (c: any) =>
              c.email?.toLowerCase() === cleanId.toLowerCase() ||
              c.customerId?.toLowerCase() === cleanId.toLowerCase()
          );
          if (found) {
            customer = found;
          }
        } catch (e) {
          console.error(e);
        }
      }

      // Check backend accounts API if not in presets
      if (!customer) {
        try {
          const res = await apiClient.get(`/accounts/${cleanId}`);
          if (res.data?.data) {
            const d = res.data.data;
            customer = {
              customerId: d.customerId,
              name: `${d.firstName} ${d.lastName}`,
              email: d.email,
              tier: d.loyaltyTier || 'BRONZE',
              points: d.loyaltyPoints || 50,
              phone: d.phone || '',
              address: d.addressLine1 ? `${d.addressLine1}, ${d.city}` : 'Sri Lanka',
            };
          }
        } catch {
          // Fallback: create persistent customer profile for any valid customer email
          customer = {
            customerId: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
            name: cleanId.includes('@') ? cleanId.split('@')[0] : cleanId,
            email: cleanId.includes('@') ? cleanId.toLowerCase() : `${cleanId.toLowerCase()}@example.com`,
            tier: 'BRONZE',
            points: 50,
            phone: '+94 77 123 4567',
            address: 'Colombo, Sri Lanka',
          };
        }
      }

      // Store in cookie and localStorage for customer account view
      Cookies.set('sp_customer', JSON.stringify(customer), { expires: 7 });
      if (typeof window !== 'undefined') {
        localStorage.setItem('sp_customer', JSON.stringify(customer));
      }

      router.push('/account');
    } catch (err: any) {
      setError('Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Quick-Fill Preset ──────────────────────────────────────────────────────
  const handleQuickFill = (acc: typeof QUICK_DEMO_ACCOUNTS[0]) => {
    setIdentifier(acc.identifier);
    setPassword(acc.password);
    setError(null);
  };

  // ── Register New Customer (Module 5 - Gayathmi) ───────────────────────────
  const handleRegisterCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalSuccess(null);

    const email = regForm.email.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setModalError('Please enter a valid email address.');
      return;
    }

    if (!regForm.password || regForm.password.length < 6) {
      setModalError('Password must be at least 6 characters long.');
      return;
    }

    if (!regForm.firstName.trim() || !regForm.lastName.trim()) {
      setModalError('First name and Last name are required.');
      return;
    }

    try {
      setRegLoading(true);
      let customerId = `CUST-${Math.floor(2000 + Math.random() * 8000)}`;
      let backendStatus = '';

      try {
        const res = await apiClient.post('/accounts/register', {
          firstName: regForm.firstName.trim(),
          lastName: regForm.lastName.trim(),
          email: email,
          password: regForm.password,
          phone: regForm.phone.trim() || '+94 77 123 4567',
          city: regForm.city.trim() || 'Colombo',
          addressLine1: regForm.addressLine1.trim() || 'No 25, Main Street',
          country: 'Sri Lanka'
        });

        if (res.data?.data?.customerId) {
          customerId = res.data.data.customerId;
          backendStatus = ' (Synced to Backend Database)';
        }
      } catch (apiErr: any) {
        console.warn('Backend API note:', apiErr.response?.data || apiErr.message);
      }

      const createdCustomer = {
        customerId,
        name: `${regForm.firstName.trim()} ${regForm.lastName.trim()}`,
        email: email,
        password: regForm.password,
        tier: 'BRONZE' as const,
        points: 50,
        phone: regForm.phone.trim() || '+94 77 123 4567',
        address: regForm.addressLine1.trim() ? `${regForm.addressLine1.trim()}, ${regForm.city}` : 'Colombo, Sri Lanka',
        kycVerified: false
      };

      // 1. Store in localStorage registry so customer can sign in anytime
      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('sp_registered_customers') || '[]');
        const updated = [createdCustomer, ...existing.filter((c: any) => c.email !== email)];
        localStorage.setItem('sp_registered_customers', JSON.stringify(updated));
      }

      // 2. Set active customer session
      Cookies.set('sp_customer', JSON.stringify(createdCustomer), { expires: 7 });
      if (typeof window !== 'undefined') {
        localStorage.setItem('sp_customer', JSON.stringify(createdCustomer));
      }

      setModalSuccess(`Account created! Customer ID: ${customerId}${backendStatus}. Redirecting to your account...`);
      setIdentifier(email);
      setPassword(regForm.password);

      // Auto-redirect directly to customer account dashboard
      setTimeout(() => {
        setShowRegisterModal(false);
        router.push('/account');
      }, 1300);
    } catch (err: any) {
      setModalError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-zinc-200 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-[#ff7a00]/30 selection:text-white">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ff7a00]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Bar: Back to Main Storefront */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <Globe className="w-4 h-4 text-[#ff7a00]" />
          <span>&larr; Back to Bookstore</span>
        </Link>
        <span className="text-[11px] font-mono text-zinc-500">SE2030 Group B9G2</span>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Unified Login Card */}
        <div className="bg-[#12141a]/95 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl shadow-black/80 relative">
          {/* Logo & Title */}
          <div className="text-center space-y-2.5 mb-7">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#ff7a00] shadow-[0_0_24px_rgba(255,122,0,0.35)] mb-1">
              <BookOpen className="w-6 h-6 text-black stroke-[2.5]" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white font-display">
              sarasavi<span className="font-light text-zinc-300">pages</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Enter your email or username to sign in to your account or admin dashboard.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── THE SINGLE UNIFIED LOGIN FORM ───────────────────────────── */}
          <form onSubmit={handleUnifiedSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. kamal.perera@gmail.com or GunathilakaT1540"
                  className="w-full pl-10 pr-4 py-3 rounded-full bg-[#0a0c10] border border-white/10 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#ff7a00] focus:ring-1 focus:ring-[#ff7a00] transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setModalError(null);
                    setModalSuccess(null);
                    setShowRegisterModal(true);
                  }}
                  className="text-[11px] text-[#ff7a00] hover:underline flex items-center gap-1 font-semibold"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Create new customer?</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 rounded-full bg-[#0a0c10] border border-white/10 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#ff7a00] focus:ring-1 focus:ring-[#ff7a00] transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Cinevault-style Orange Pill Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-full bg-[#ff7a00] hover:bg-[#ff8c1a] text-black font-bold text-sm shadow-[0_4px_20px_rgba(255,122,0,0.3)] active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* ── QUICK DEMO LOGINS (Click to autofill single form) ───────── */}
          <div className="pt-6 mt-6 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span className="font-semibold uppercase tracking-wider text-zinc-500">
                Quick Demo Accounts (Click to Autofill)
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#ff7a00]" />
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 no-scrollbar">
              {QUICK_DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.identifier}
                  type="button"
                  onClick={() => handleQuickFill(acc)}
                  className={`p-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-95 ${acc.color}`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-white truncate">
                      {acc.name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] font-mono uppercase opacity-80">
                      {acc.label.split(' ')[0]}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400 truncate mt-0.5">
                    {acc.identifier}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── REGISTER CUSTOMER MODAL (Module 5 - Gayathmi) ───────────── */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#12141a] border border-white/15 rounded-3xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#ff7a00] flex items-center justify-center shadow-[0_0_15px_rgba(255,122,0,0.3)]">
                  <UserPlus className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Create Customer Account</h3>
                  <p className="text-[11px] text-zinc-400">Module 5 (Gayathmi) - Customer Registration</p>
                </div>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors text-xs"
              >
                ✕
              </button>
            </div>

            {/* Modal Alerts */}
            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRegisterCustomer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={regForm.firstName}
                    onChange={(e) => setRegForm({ ...regForm, firstName: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0a0c10] border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#ff7a00]"
                    placeholder="e.g. Kasun"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={regForm.lastName}
                    onChange={(e) => setRegForm({ ...regForm, lastName: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0a0c10] border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#ff7a00]"
                    placeholder="e.g. Silva"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0a0c10] border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#ff7a00]"
                  placeholder="e.g. kasun.silva@gmail.com"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Password (min 6 characters) *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0a0c10] border border-white/10 text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-[#ff7a00]"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0a0c10] border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#ff7a00]"
                    placeholder="+94 77 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={regForm.city}
                    onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0a0c10] border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#ff7a00]"
                    placeholder="Colombo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Address Line</label>
                <input
                  type="text"
                  value={regForm.addressLine1}
                  onChange={(e) => setRegForm({ ...regForm, addressLine1: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0a0c10] border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#ff7a00]"
                  placeholder="No 25, Main Street"
                />
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-3 rounded-full bg-[#ff7a00] hover:bg-[#ff8c1a] text-black font-bold text-xs shadow-lg shadow-orange-500/20 active:scale-98 transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {regLoading ? 'Creating Customer Account...' : 'Complete Registration & Sign In'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
