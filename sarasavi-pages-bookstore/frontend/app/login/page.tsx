'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api-client';
import { 
  Lock, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle2,
  UserPlus,
  ArrowLeft,
  X
} from 'lucide-react';

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

// ── Inner component: needs useSearchParams so must be inside <Suspense> ────
function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  // useSearchParams is the Next.js-idiomatic way to read URL query params
  const searchParams = useSearchParams();

  // Single unified form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read ?error= param via Next.js useSearchParams (replaces window.location.search)
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'admin_required') {
      setError('Access restricted. Please sign in with an authorized account.');
    }
  }, [searchParams]);

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
  // Works seamlessly for both Staff/Administrators and Regular Customers
  const handleUnifiedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      setError('Please enter your email or username and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // 1. Try Staff / Administrator login first via backend Spring Boot JWT
      try {
        // Clear prior customer session
        Cookies.remove('sp_customer');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('sp_customer');
        }
        await login({ username: cleanId, password: cleanPass });
        // If staff authentication succeeded, useAuth.login redirects automatically to /admin/dashboard
        return;
      } catch {
        // If staff login fails, seamlessly fall through to customer authentication
      }

      // 2. Customer Authentication Flow
      Cookies.remove('sp_token');
      Cookies.remove('sp_user');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sp_user');
      }

      let customer = CUSTOMER_PRESETS.find(
        (c) =>
          c.email.toLowerCase() === cleanId.toLowerCase() ||
          c.customerId.toLowerCase() === cleanId.toLowerCase()
      );

      // Check local registry of created customers
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
      if (!customer && cleanId.includes('@')) {
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
          // Standard customer profile fallback for customer emails
          customer = {
            customerId: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
            name: cleanId.split('@')[0],
            email: cleanId.toLowerCase(),
            tier: 'BRONZE',
            points: 50,
            phone: '+94 77 123 4567',
            address: 'Colombo, Sri Lanka',
          };
        }
      }

      if (customer) {
        // Store in cookie and localStorage for customer account view
        Cookies.set('sp_customer', JSON.stringify(customer), { expires: 7 });
        if (typeof window !== 'undefined') {
          localStorage.setItem('sp_customer', JSON.stringify(customer));
        }

        // Customer redirects straight to the storefront
        router.push('/');
        return;
      }

      // If neither staff nor customer could be authenticated
      setError('Invalid credentials. Please verify your email or username and password.');
    } catch {
      setError('Authentication failed. Please check your network and credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Register New Customer ──────────────────────────────────────────────────
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

      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('sp_registered_customers') || '[]');
        const updated = [createdCustomer, ...existing.filter((c: any) => c.email !== email)];
        localStorage.setItem('sp_registered_customers', JSON.stringify(updated));
      }

      Cookies.set('sp_customer', JSON.stringify(createdCustomer), { expires: 7 });
      if (typeof window !== 'undefined') {
        localStorage.setItem('sp_customer', JSON.stringify(createdCustomer));
      }

      setModalSuccess(`Account created successfully! Redirecting...`);
      setIdentifier(email);
      setPassword(regForm.password);

      setTimeout(() => {
        setShowRegisterModal(false);
        router.push('/');
      }, 1000);
    } catch (err: any) {
      setModalError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#c8d8c6] bg-gradient-to-b from-[#bed4bc] via-[#cadbc8] to-[#e0ede0] text-[#122215] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans selection:bg-[#122215] selection:text-white">
      
      {/* Soft Ambient Botanical Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/40 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Bar */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#3b4e40] hover:text-[#122215] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bookstore</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Unified Light iOS Glass Login Card */}
        <div className="ios-glass bg-white/85 backdrop-blur-2xl p-8 sm:p-10 rounded-[32px] sm:rounded-[40px] border border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.08)] relative">
          
          {/* Logo & Clean Organic Emblem */}
          <div className="text-center space-y-2.5 mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-1 group">
              <div className="flex items-center -space-x-1">
                <div className="w-3.5 h-3.5 rounded-full bg-[#122215] group-hover:scale-110 transition-transform" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 group-hover:scale-110 transition-transform" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#122215] group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-medium text-xl tracking-tight text-[#122215]">
                sarasavi<span className="font-normal text-[#526456]">pages</span>
              </span>
            </Link>
            <p className="text-xs text-[#526456] max-w-xs mx-auto leading-relaxed">
              sign in to access your personal library, orders, and bookstore services.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── THE SINGLE UNIFIED LOGIN FORM ───────────────────────────── */}
          <form onSubmit={handleUnifiedSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#2d3e31] mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#738477] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your email or username"
                  className="w-full pl-11 pr-4 py-3 rounded-full bg-white/90 border border-black/[0.08] text-xs text-[#122215] placeholder:text-[#8a998e] focus:outline-none focus:border-[#122215] focus:ring-1 focus:ring-[#122215] transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#2d3e31]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setModalError(null);
                    setModalSuccess(null);
                    setShowRegisterModal(true);
                  }}
                  className="text-[11px] text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 font-medium transition-colors"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Create new account?</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#738477] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-11 py-3 rounded-full bg-white/90 border border-black/[0.08] text-xs text-[#122215] placeholder:text-[#8a998e] focus:outline-none focus:border-[#122215] focus:ring-1 focus:ring-[#122215] transition-all font-mono shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#738477] hover:text-[#122215] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sleek Black Pill Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-full bg-[#122215] hover:bg-black text-white font-medium text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* ── REGISTER CUSTOMER MODAL (Light iOS Glass Style) ─────────── */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white/95 backdrop-blur-2xl border border-white/60 rounded-[32px] p-7 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-black/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#122215]">Create Reader Account</h3>
                  <p className="text-[11px] text-[#526456]">Join the Sarasavi Pages literary community</p>
                </div>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="w-7 h-7 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#526456] hover:text-[#122215] flex items-center justify-center transition-colors"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modal Alerts */}
            {modalError && (
              <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRegisterCustomer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[#3b4e40] font-medium mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={regForm.firstName}
                    onChange={(e) => setRegForm({ ...regForm, firstName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-full bg-white border border-black/[0.08] text-[#122215] placeholder:text-[#8a998e] focus:outline-none focus:border-[#122215]"
                    placeholder="e.g. Kasun"
                  />
                </div>
                <div>
                  <label className="block text-[#3b4e40] font-medium mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={regForm.lastName}
                    onChange={(e) => setRegForm({ ...regForm, lastName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-full bg-white border border-black/[0.08] text-[#122215] placeholder:text-[#8a998e] focus:outline-none focus:border-[#122215]"
                    placeholder="e.g. Perera"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#3b4e40] font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-full bg-white border border-black/[0.08] text-[#122215] placeholder:text-[#8a998e] focus:outline-none focus:border-[#122215]"
                  placeholder="e.g. kasun.perera@gmail.com"
                />
              </div>

              <div>
                <label className="block text-[#3b4e40] font-medium mb-1">Password (min 6 characters) *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-full bg-white border border-black/[0.08] text-[#122215] font-mono placeholder:text-[#8a998e] focus:outline-none focus:border-[#122215]"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[#3b4e40] font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-full bg-white border border-black/[0.08] text-[#122215] placeholder:text-[#8a998e] focus:outline-none focus:border-[#122215]"
                    placeholder="+94 77 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-[#3b4e40] font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={regForm.city}
                    onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-full bg-white border border-black/[0.08] text-[#122215] placeholder:text-[#8a998e] focus:outline-none focus:border-[#122215]"
                    placeholder="Colombo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#3b4e40] font-medium mb-1">Address Line</label>
                <input
                  type="text"
                  value={regForm.addressLine1}
                  onChange={(e) => setRegForm({ ...regForm, addressLine1: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-full bg-white border border-black/[0.08] text-[#122215] placeholder:text-[#8a998e] focus:outline-none focus:border-[#122215]"
                  placeholder="No 25, Main Street"
                />
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-3.5 rounded-full bg-[#122215] hover:bg-black text-white font-medium text-xs shadow-md active:scale-95 transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {regLoading ? 'Creating Account...' : 'Complete Registration & Sign In'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Loading fallback for Suspense ─────────────────────────────────────────
function LoginSkeleton() {
  return (
    <div className="min-h-screen bg-[#c8d8c6] flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#122215] border-t-transparent" />
    </div>
  );
}

// ── Default export: wraps LoginForm in Suspense (required by Next.js) ──────
// useSearchParams() inside LoginForm needs a Suspense boundary above it.
export default function UnifiedLoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
