'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api-client';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  BookOpen, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles,
  AlertCircle,
  Globe,
  UserCheck,
  CheckCircle2,
  Mail,
  Award,
  Layers
} from 'lucide-react';

const STAFF_ACCOUNTS = [
  {
    name: 'Gunathilaka H.D.T.T.',
    itNumber: 'IT25101540',
    username: 'GunathilakaT1540',
    password: '1540',
    role: 'SUPER_ADMIN',
    roleLabel: 'M1: Super Admin (Full Access)',
    badgeColor: 'bg-brand-500/20 text-brand-400 border-brand-500/30',
  },
  {
    name: 'Anaf M.K.A.S.',
    itNumber: 'IT25102345',
    username: 'AnafS2345',
    password: '2345',
    role: 'PAYMENT_ADMIN',
    roleLabel: 'M2: Payment Admin',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    name: 'Zeen A.C.',
    itNumber: 'IT25103342',
    username: 'ZeenC3342',
    password: '3342',
    role: 'CUSTOMER_SERVICE_ADMIN',
    roleLabel: 'M3: Support Admin',
    badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  },
  {
    name: 'Dissanayake S.A.S.D.',
    itNumber: 'IT25101062',
    username: 'DissanayakeD1062',
    password: '1062',
    role: 'INVENTORY_ADMIN',
    roleLabel: 'M4: Inventory Admin',
    badgeColor: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  },
  {
    name: 'Gayathmi P.G.R.',
    itNumber: 'IT25103013',
    username: 'GayathmiR3013',
    password: '3013',
    role: 'ACCOUNT_ADMIN',
    roleLabel: 'M5: Accounts Admin',
    badgeColor: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  },
  {
    name: 'Diyes C.L.',
    itNumber: 'IT25100263',
    username: 'DiyesL0263',
    password: '0263',
    role: 'ORDER_ADMIN',
    roleLabel: 'M6: Order Admin',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
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

  // Active Login Mode: 'customer' | 'staff'
  const [loginMode, setLoginMode] = useState<'customer' | 'staff'>('customer');

  // Staff form state
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [showStaffPassword, setShowStaffPassword] = useState(false);

  // Customer form state
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [showCustPassword, setShowCustPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Handle Staff / Admin Login ──────────────────────────────────────────────
  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffUsername.trim() || !staffPassword.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await login({ username: staffUsername.trim(), password: staffPassword.trim() });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid staff credentials. Check username & password.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Handle Customer Login ───────────────────────────────────────────────────
  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail.trim()) {
      setError('Please enter your customer email address or Customer ID.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Try looking up customer from existing presets or backend accounts
      let matchedCust = CUSTOMER_PRESETS.find(
        (c) =>
          c.email.toLowerCase() === customerEmail.trim().toLowerCase() ||
          c.customerId.toLowerCase() === customerEmail.trim().toLowerCase()
      );

      if (!matchedCust) {
        // Fallback: create dynamic customer object
        matchedCust = {
          customerId: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
          name: customerEmail.split('@')[0],
          email: customerEmail.trim().toLowerCase(),
          tier: 'BRONZE',
          points: 50,
          phone: '+94 77 000 0000',
          address: 'Colombo, Sri Lanka',
        };
      }

      // Store in cookie and localStorage for account view
      Cookies.set('sp_customer', JSON.stringify(matchedCust), { expires: 7 });
      if (typeof window !== 'undefined') {
        localStorage.setItem('sp_customer', JSON.stringify(matchedCust));
      }

      router.push('/account');
    } catch (err: any) {
      setError('Could not complete customer sign-in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectCustomerPreset = (preset: typeof CUSTOMER_PRESETS[0]) => {
    setCustomerEmail(preset.email);
    setCustomerPassword('Customer@123');
    setError(null);
  };

  const selectStaffPreset = (preset: typeof STAFF_ACCOUNTS[0]) => {
    setStaffUsername(preset.username);
    setStaffPassword(preset.password);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] bg-radial-gradient flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Back to Storefront */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted hover:text-white transition-colors"
        >
          <Globe className="w-4 h-4 text-brand-400" />
          <span>&larr; Back to Bookstore (Main Site)</span>
        </Link>
        <span className="text-[11px] font-mono text-ink-faint">SE2030 Group B9G2</span>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="glass-card p-8 rounded-3xl border border-surface-border shadow-2xl relative">
          {/* Brand Logo & Title */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-brand shadow-glow mb-1">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold font-display tracking-tight text-white">
              Sarasavi Pages Portal
            </h2>
            <p className="text-xs text-ink-muted">
              Unified Sign-In for Customers and Staff Administrators
            </p>
          </div>

          {/* Unified Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-surface border border-surface-border mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginMode('customer');
                setError(null);
              }}
              className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                loginMode === 'customer'
                  ? 'bg-brand-500 text-white shadow-glow'
                  : 'text-ink-muted hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginMode('staff');
                setError(null);
              }}
              className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                loginMode === 'staff'
                  ? 'bg-brand-500 text-white shadow-glow'
                  : 'text-ink-muted hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Staff & Admin</span>
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── TAB 1: CUSTOMER LOGIN FORM ─────────────────────────────── */}
          {loginMode === 'customer' && (
            <div className="space-y-5">
              <form onSubmit={handleCustomerSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-ink-light mb-1.5">
                    Customer Email or Customer ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. kamal.perera@gmail.com or CUST-1001"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder:text-ink-faint focus:outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-light mb-1.5">
                    Account Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showCustPassword ? 'text' : 'password'}
                      value={customerPassword}
                      onChange={(e) => setCustomerPassword(e.target.value)}
                      placeholder="Enter customer password"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder:text-ink-faint focus:outline-none focus:border-brand-500 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCustPassword(!showCustPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-white"
                    >
                      {showCustPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-brand text-white font-semibold text-xs shadow-glow hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Signing In...' : 'Sign In to Customer Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Sample Customer Quick-Fill */}
              <div className="pt-3 border-t border-surface-border space-y-2">
                <span className="text-[11px] font-mono text-ink-muted uppercase block text-center">
                  Quick-Fill Test Customer Profiles:
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {CUSTOMER_PRESETS.map((cust) => (
                    <button
                      key={cust.customerId}
                      type="button"
                      onClick={() => selectCustomerPreset(cust)}
                      className="p-2 rounded-xl bg-surface/60 hover:bg-surface border border-surface-border text-left flex items-center justify-between transition-all group"
                    >
                      <div>
                        <span className="text-xs font-semibold text-white group-hover:text-brand-400">
                          {cust.name}
                        </span>
                        <div className="text-[10px] text-ink-muted">{cust.email}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono">
                        {cust.tier} ({cust.points} pts)
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: STAFF & ADMIN LOGIN FORM ────────────────────────── */}
          {loginMode === 'staff' && (
            <div className="space-y-5">
              <form onSubmit={handleStaffSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-ink-light mb-1.5">
                    Staff Username (or IT Number)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={staffUsername}
                      onChange={(e) => setStaffUsername(e.target.value)}
                      placeholder="e.g. GunathilakaT1540"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder:text-ink-faint focus:outline-none focus:border-brand-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-light mb-1.5">
                    Staff Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showStaffPassword ? 'text' : 'password'}
                      required
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      placeholder="e.g. 1540"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder:text-ink-faint focus:outline-none focus:border-brand-500 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStaffPassword(!showStaffPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-white"
                    >
                      {showStaffPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-brand text-white font-semibold text-xs shadow-glow hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Admin Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Fill All 6 Member Admin Accounts */}
              <div className="pt-3 border-t border-surface-border space-y-2">
                <span className="text-[11px] font-mono text-ink-muted uppercase block text-center">
                  Quick-Fill Member Accounts (Click to Fill):
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {STAFF_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.username}
                      type="button"
                      onClick={() => selectStaffPreset(acc)}
                      className="p-2 rounded-xl bg-surface/60 hover:bg-surface border border-surface-border text-left transition-all group"
                    >
                      <div className="text-[11px] font-semibold text-white group-hover:text-brand-400 truncate">
                        {acc.name.split(' ')[0]}
                      </div>
                      <div className="text-[10px] font-mono text-brand-400 mt-0.5">
                        {acc.username} / {acc.password}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
