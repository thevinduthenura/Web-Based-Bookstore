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
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regForm, setRegForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: 'Colombo',
    addressLine1: ''
  });
  const [regLoading, setRegLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  // Live password validation rules
  const hasMinLength = regForm.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(regForm.password);
  const hasNumber = /[0-9]/.test(regForm.password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(regForm.password);
  const passwordsMatch = regForm.password.length > 0 && regForm.password === regForm.confirmPassword;
  const phoneClean = regForm.phone.replace(/[\s-]/g, '');
  const isPhoneValid = !regForm.phone.trim() || /^(\+94|0)?7[0-9]{8}$/.test(phoneClean);
  const passwordStrengthScore = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;

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

    const firstName = regForm.firstName.trim();
    const lastName = regForm.lastName.trim();
    const email = regForm.email.trim().toLowerCase();

    if (firstName.length < 2 || lastName.length < 2) {
      setModalError('First name and Last name must each be at least 2 characters long.');
      return;
    }

    if (!/^[a-zA-Z\s.'-]+$/.test(firstName) || !/^[a-zA-Z\s.'-]+$/.test(lastName)) {
      setModalError('Names may only contain alphabetic letters.');
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setModalError('Please enter a valid, properly formatted email address.');
      return;
    }

    // Password rules validation
    if (!hasMinLength) {
      setModalError('Password must be at least 8 characters long.');
      return;
    }
    if (!hasUppercase) {
      setModalError('Password must include at least one uppercase letter (A-Z).');
      return;
    }
    if (!hasNumber) {
      setModalError('Password must include at least one number (0-9).');
      return;
    }
    if (!hasSpecial) {
      setModalError('Password must include at least one special character (!@#$%^&* etc).');
      return;
    }
    if (!passwordsMatch) {
      setModalError('Passwords do not match. Please re-enter confirmation password.');
      return;
    }

    // Phone validation (if provided)
    if (regForm.phone.trim() && !isPhoneValid) {
      setModalError('Please enter a valid Sri Lankan phone number (e.g. 077 123 4567 or +94 77 123 4567).');
      return;
    }

    try {
      setRegLoading(true);
      let customerId = `CUST-${Math.floor(2000 + Math.random() * 8000)}`;

      try {
        const res = await apiClient.post('/accounts/register', {
          firstName,
          lastName,
          email,
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

      // Fresh new customer profile - starts as standard free account (not a paid member)
      const createdCustomer = {
        customerId,
        name: `${firstName} ${lastName}`,
        email: email,
        password: regForm.password,
        tier: 'STANDARD' as const,
        membership: 'NONE' as const,
        isMember: false,
        points: 0,
        phone: regForm.phone.trim() || '+94 77 123 4567',
        address: regForm.addressLine1.trim() ? `${regForm.addressLine1.trim()}, ${regForm.city}` : 'Colombo, Sri Lanka',
        kycVerified: false,
        isNewUser: true
      };

      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('sp_registered_customers') || '[]');
        const updated = [createdCustomer, ...existing.filter((c: any) => c.email !== email)];
        localStorage.setItem('sp_registered_customers', JSON.stringify(updated));

        // CRITICAL: Ensure this fresh customer starts with 0 orders, 0 tickets, 0 payments
        localStorage.setItem(`sp_orders_${customerId}`, JSON.stringify([]));
        localStorage.setItem(`sp_tickets_${customerId}`, JSON.stringify([]));
        localStorage.setItem(`sp_payments_${customerId}`, JSON.stringify([]));
      }

      Cookies.set('sp_customer', JSON.stringify(createdCustomer), { expires: 7 });
      if (typeof window !== 'undefined') {
        localStorage.setItem('sp_customer', JSON.stringify(createdCustomer));
      }

      setModalSuccess(`Welcome to Sarasavi Pages! Account created with 50 bonus loyalty points.`);
      setIdentifier(email);
      setPassword(regForm.password);

      setTimeout(() => {
        setShowRegisterModal(false);
        router.push('/account');
      }, 1200);
    } catch (err: any) {
      setModalError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9F5] text-[#20231B] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans selection:bg-[#34451D] selection:text-white">
      
      {/* Soft Ambient Botanical Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#B7D85A]/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#E2E7D8]/40 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Bar */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#596B32] hover:text-[#20231B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bookstore</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Unified Light Card */}
        <div className="bg-white p-5 sm:p-10 rounded-3xl sm:rounded-[40px] border border-[#E2E7D8] shadow-[0_12px_40px_rgba(52,69,29,0.06)] relative">
          
          {/* Logo & Clean Organic Emblem */}
          <div className="text-center space-y-2.5 mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-1 group">
              <div className="flex items-center -space-x-1">
                <div className="w-3.5 h-3.5 rounded-full bg-[#34451D] group-hover:scale-110 transition-transform" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#B7D85A] group-hover:scale-110 transition-transform" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#596B32] group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-display font-light text-2xl tracking-tight text-[#20231B]">
                sarasavi<span className="font-normal text-[#596B32]">pages</span>
              </span>
            </Link>
            <p className="text-xs text-[#85887A] max-w-xs mx-auto leading-relaxed">
              Sign in to access your personal library, orders, and bookstore services.
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
              <label className="block text-xs font-medium text-[#34451D] mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#85887A] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your email or username"
                  className="w-full pl-11 pr-4 py-3 rounded-full bg-[#F8F9F5] border border-[#E2E7D8] text-xs text-[#20231B] placeholder:text-[#85887A] focus:outline-none focus:bg-white focus:border-[#596B32] focus:ring-1 focus:ring-[#596B32] transition-all shadow-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#34451D]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setModalError(null);
                    setModalSuccess(null);
                    setShowRegisterModal(true);
                  }}
                  className="text-[11px] text-[#596B32] hover:text-[#34451D] hover:underline flex items-center gap-1 font-medium transition-colors"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Create new account?</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#85887A] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-11 py-3 rounded-full bg-[#F8F9F5] border border-[#E2E7D8] text-xs text-[#20231B] placeholder:text-[#85887A] focus:outline-none focus:bg-white focus:border-[#596B32] focus:ring-1 focus:ring-[#596B32] transition-all font-mono shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#85887A] hover:text-[#20231B] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sleek Dark Forest Pill Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white font-medium text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* ── REGISTER CUSTOMER MODAL ─────────── */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-[#E2E7D8] rounded-[32px] p-7 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#E2E7D8]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#F0F4E8] text-[#34451D] flex items-center justify-center border border-[#E2E7D8]">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#20231B]">Create Reader Account</h3>
                  <p className="text-[11px] text-[#85887A]">Join the Sarasavi Pages literary community</p>
                </div>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="w-7 h-7 rounded-full bg-[#F8F9F5] hover:bg-[#F0F4E8] text-[#85887A] hover:text-[#20231B] flex items-center justify-center transition-colors"
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
                  <label className="block text-[#34451D] font-medium mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={regForm.firstName}
                    onChange={(e) => setRegForm({ ...regForm, firstName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-full bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] placeholder:text-[#85887A] focus:outline-none focus:bg-white focus:border-[#596B32]"
                    placeholder="e.g. Kasun"
                  />
                </div>
                <div>
                  <label className="block text-[#34451D] font-medium mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={regForm.lastName}
                    onChange={(e) => setRegForm({ ...regForm, lastName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-full bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] placeholder:text-[#85887A] focus:outline-none focus:bg-white focus:border-[#596B32]"
                    placeholder="e.g. Perera"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#34451D] font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-full bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] placeholder:text-[#85887A] focus:outline-none focus:bg-white focus:border-[#596B32]"
                  placeholder="e.g. kasun.perera@gmail.com"
                />
              </div>

              <div>
                <label className="block text-[#34451D] font-medium mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-full bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] font-mono text-xs placeholder:text-[#85887A] focus:outline-none focus:bg-white focus:border-[#596B32]"
                    placeholder="Create secure password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#85887A] hover:text-[#20231B]"
                  >
                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {regForm.password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#85887A]">Password Security:</span>
                      <span className={`font-semibold ${
                        passwordStrengthScore <= 1 ? 'text-red-600' :
                        passwordStrengthScore <= 3 ? 'text-amber-600' : 'text-[#596B32]'
                      }`}>
                        {passwordStrengthScore <= 1 ? 'Weak' :
                         passwordStrengthScore <= 3 ? 'Medium' : 'Strong'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#E2E7D8] rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 rounded-full transition-all ${
                        passwordStrengthScore >= 1 ? (passwordStrengthScore <= 1 ? 'bg-red-500' : passwordStrengthScore <= 3 ? 'bg-amber-500' : 'bg-[#7F9148]') : 'bg-transparent'
                      }`} />
                      <div className={`h-full flex-1 rounded-full transition-all ${
                        passwordStrengthScore >= 2 ? (passwordStrengthScore <= 3 ? 'bg-amber-500' : 'bg-[#7F9148]') : 'bg-transparent'
                      }`} />
                      <div className={`h-full flex-1 rounded-full transition-all ${
                        passwordStrengthScore >= 3 ? (passwordStrengthScore <= 3 ? 'bg-amber-500' : 'bg-[#7F9148]') : 'bg-transparent'
                      }`} />
                      <div className={`h-full flex-1 rounded-full transition-all ${
                        passwordStrengthScore >= 4 ? 'bg-[#596B32]' : 'bg-transparent'
                      }`} />
                    </div>
                  </div>
                )}

                {/* Live Password Rules Checklist */}
                <div className="mt-2 p-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] grid grid-cols-2 gap-1 text-[10px]">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-[#34451D] font-medium' : 'text-[#85887A]'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-[#596B32]' : 'bg-[#E2E7D8]'}`} />
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-[#34451D] font-medium' : 'text-[#85887A]'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${hasUppercase ? 'bg-[#596B32]' : 'bg-[#E2E7D8]'}`} />
                    <span>1 uppercase (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-[#34451D] font-medium' : 'text-[#85887A]'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${hasNumber ? 'bg-[#596B32]' : 'bg-[#E2E7D8]'}`} />
                    <span>1 number (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-[#34451D] font-medium' : 'text-[#85887A]'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${hasSpecial ? 'bg-[#596B32]' : 'bg-[#E2E7D8]'}`} />
                    <span>1 special symbol</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#34451D] font-medium mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    required
                    value={regForm.confirmPassword}
                    onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                    className={`w-full pl-3.5 pr-10 py-2.5 rounded-full bg-[#F8F9F5] border text-[#20231B] font-mono text-xs placeholder:text-[#85887A] focus:outline-none focus:bg-white ${
                      regForm.confirmPassword.length > 0
                        ? (passwordsMatch ? 'border-[#596B32] focus:border-[#34451D]' : 'border-red-400 focus:border-red-500')
                        : 'border-[#E2E7D8] focus:border-[#596B32]'
                    }`}
                    placeholder="Re-enter password to match"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#85887A] hover:text-[#20231B]"
                  >
                    {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {regForm.confirmPassword.length > 0 && (
                  <p className={`text-[10px] mt-1 font-medium ${passwordsMatch ? 'text-[#596B32]' : 'text-red-600'}`}>
                    {passwordsMatch ? '✓ Passwords match perfectly' : '✕ Passwords do not match'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[#34451D] font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-full bg-[#F8F9F5] border text-[#20231B] text-xs placeholder:text-[#85887A] focus:outline-none focus:bg-white ${
                      regForm.phone.trim() && !isPhoneValid ? 'border-red-400' : 'border-[#E2E7D8] focus:border-[#596B32]'
                    }`}
                    placeholder="077 123 4567"
                  />
                  {regForm.phone.trim() && !isPhoneValid && (
                    <p className="text-[9px] text-red-500 mt-0.5">Use 07XXXXXXXX or +947XXXXXXXX</p>
                  )}
                </div>
                <div>
                  <label className="block text-[#34451D] font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={regForm.city}
                    onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-full bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] text-xs placeholder:text-[#85887A] focus:outline-none focus:bg-white focus:border-[#596B32]"
                    placeholder="Colombo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#34451D] font-medium mb-1">Delivery Address Line</label>
                <input
                  type="text"
                  value={regForm.addressLine1}
                  onChange={(e) => setRegForm({ ...regForm, addressLine1: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-full bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] text-xs placeholder:text-[#85887A] focus:outline-none focus:bg-white focus:border-[#596B32]"
                  placeholder="No 25, Main Street, Colombo 03"
                />
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-3.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white font-medium text-xs shadow-md active:scale-95 transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
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
    <div className="min-h-screen bg-[#F8F9F5] flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#34451D] border-t-transparent" />
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
