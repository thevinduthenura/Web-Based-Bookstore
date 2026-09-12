'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  BookOpen, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

const PRESET_ACCOUNTS = [
  {
    name: 'Gunathilaka H.D.T.T.',
    itNumber: 'IT25101540',
    username: 'GunathilakaT1540',
    password: '1540',
    role: 'SUPER_ADMIN',
    roleLabel: 'Super Admin (Full Access)',
    badgeColor: 'bg-brand-500/20 text-brand-400 border-brand-500/30',
  },
  {
    name: 'Anaf M.K.A.S.',
    itNumber: 'IT25102345',
    username: 'AnafS2345',
    password: '2345',
    role: 'PAYMENT_ADMIN',
    roleLabel: 'Payment Admin',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    name: 'Zeen A.C.',
    itNumber: 'IT25103342',
    username: 'ZeenC3342',
    password: '3342',
    role: 'CUSTOMER_SERVICE_ADMIN',
    roleLabel: 'Customer Service Admin',
    badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  },
  {
    name: 'Dissanayake S.A.S.D.',
    itNumber: 'IT25101062',
    username: 'DissanayakeD1062',
    password: '1062',
    role: 'INVENTORY_ADMIN',
    roleLabel: 'Inventory Admin',
    badgeColor: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  },
  {
    name: 'Gayathmi P.G.R.',
    itNumber: 'IT25103013',
    username: 'GayathmiR3013',
    password: '3013',
    role: 'ACCOUNT_ADMIN',
    roleLabel: 'User Accounts Admin',
    badgeColor: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  },
  {
    name: 'Diyes C.L.',
    itNumber: 'IT25100263',
    username: 'DiyesL0263',
    password: '0263',
    role: 'ORDER_ADMIN',
    roleLabel: 'Order Admin',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await login({ username: username.trim(), password: password.trim() });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid credentials. Please check your username and password.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPreset = (acc: typeof PRESET_ACCOUNTS[0]) => {
    setUsername(acc.username);
    setPassword(acc.password);
    setError(null);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-surface p-4 sm:p-6 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-brand-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* Left info column: Branding & Preset Quick Access */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            SLIIT SE2030 • B9G2 Project
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-display tracking-tight text-white">
                  Sarasavi <span className="text-brand-400">Pages</span>
                </h1>
                <p className="text-xs text-ink-muted">Enterprise Bookstore Management Platform</p>
              </div>
            </div>
            <p className="text-sm text-ink-muted leading-relaxed">
              Role-Based Multi-Member Administration System. Each group member has dedicated access credentials to their designated module.
            </p>
          </div>

          {/* Quick Preset Selector for Easy Testing */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                Quick Demo Presets (Click to autofill)
              </span>
              <span className="text-[11px] text-brand-400 font-mono">BCrypt Ready</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => handleSelectPreset(acc)}
                  className={`text-left p-2.5 rounded-xl border transition-all duration-200 ${
                    username === acc.username
                      ? 'bg-surface-card border-brand-500 shadow-glow'
                      : 'bg-surface-card/60 border-surface-border hover:border-surface-muted hover:bg-surface-card'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white truncate max-w-[150px]">
                      {acc.name.split(' ')[0]}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${acc.badgeColor} font-mono`}>
                      {acc.role === 'SUPER_ADMIN' ? 'SUPER' : acc.role.replace('_ADMIN', '')}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-ink-muted font-mono">
                    <span>{acc.username}</span>
                    <span className="text-ink-faint">Pass: {acc.password}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Login Card */}
        <div className="lg:col-span-6">
          <div className="glass-panel rounded-2xl p-7 sm:p-9 shadow-card">
            <div className="mb-6 space-y-1">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-400" />
                Staff Sign In
              </h2>
              <p className="text-xs text-ink-muted">
                Enter your staff credentials to access your designated administration panel.
              </p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. GunathilakaT1540"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface/90 border border-surface-border text-sm text-white placeholder:text-ink-faint focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1.5">
                  Password (Last 4 digits of IT Number)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="e.g. 1540"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface/90 border border-surface-border text-sm text-white placeholder:text-ink-faint focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-brand text-white font-semibold text-sm shadow-glow hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Verifying & Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-surface-border/60 text-center">
              <p className="text-[11px] text-ink-faint">
                Protected by Sarasavi JWT Bearer Authentication & Spring Security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
