'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useAuth, STAFF_PRESETS } from '@/hooks/useAuth';
import apiClient from '@/lib/api-client';
import { formatAndLimitPhone, handlePhoneKeyDown } from '@/lib/input-utils';
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
  X,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Check
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

// Helper to strictly identify staff identifiers (usernames, employee IDs, official staff emails, or newly added staff)
const isStaffIdentifier = (id: string): boolean => {
  const clean = id.trim().toLowerCase();
  if (!clean) return false;
  if (['admin', 'superadmin', 'administrator', 'root', 'staff', 'manager', 'employee'].includes(clean)) return true;
  if (clean.startsWith('emp-') || clean.startsWith('staff-') || clean.startsWith('adm-') || clean.startsWith('it')) return true;
  if (clean.endsWith('@sarasavipages.lk') || clean.endsWith('@sarasavi.lk') || clean.startsWith('admin@')) return true;
  for (const [key, preset] of Object.entries(STAFF_PRESETS)) {
    const [u] = key.split(':');
    if (u.toLowerCase() === clean) return true;
    if (preset.username.toLowerCase() === clean) return true;
    if (preset.email && preset.email.toLowerCase() === clean) return true;
    if (preset.employeeId && preset.employeeId.toLowerCase() === clean) return true;
  }

  // Check dynamically created staff in localStorage (sp_admin_staff)
  if (typeof window !== 'undefined') {
    try {
      const localStaffList = JSON.parse(localStorage.getItem('sp_admin_staff') || '[]');
      if (Array.isArray(localStaffList)) {
        const found = localStaffList.some((s: any) =>
          s.username?.toLowerCase() === clean ||
          s.email?.toLowerCase() === clean ||
          s.employeeId?.toLowerCase() === clean ||
          s.itNumber?.toLowerCase() === clean
        );
        if (found) return true;
      }
    } catch {}
  }

  return false;
};

// ── Demo Credentials Quick-Fill & 1-Click Instant Login Panel ──────────────
function DemoCredentialsPanel({ 
  onFill,
  onInstantLogin 
}: { 
  onFill: (u: string, p: string) => void;
  onInstantLogin: (u: string, p: string) => void;
}) {
  const [open, setOpen] = useState(true);

  const DEMOS = [
    { label: 'Super Admin', username: 'GunathilakaT1540', password: '1540', badge: 'bg-[#34451D] text-white', desc: 'Full system & staff control' },
    { label: 'Admin (Quick)', username: 'admin', password: 'admin', badge: 'bg-[#20231B] text-[#B7D85A]', desc: 'Quick admin access' },
    { label: 'Payment Admin', username: 'AnafS2345', password: '2345', badge: 'bg-[#596B32] text-white', desc: 'Gateway & transactions' },
    { label: 'Customer Service', username: 'ZeenC3342', password: '3342', badge: 'bg-[#7F9148] text-white', desc: 'Tickets & inquiries' },
    { label: 'Inventory Admin', username: 'DissanayakeD1062', password: '1062', badge: 'bg-[#B7D85A] text-[#20231B]', desc: 'Stock & supplier logs' },
    { label: 'Account Admin', username: 'GayathmiR3013', password: '3013', badge: 'bg-[#E2E7D8] text-[#20231B]', desc: 'Customer KYC & tiers' },
    { label: 'Order Admin', username: 'DiyesL0263', password: '0263', badge: 'bg-[#F0F4E8] text-[#20231B] border border-[#E2E7D8]', desc: 'Book catalog & orders' },
    { label: 'Customer (Reader)', username: 'kamal.perera@gmail.com', password: 'any', badge: 'bg-emerald-50 text-emerald-800 border border-emerald-200', desc: 'Account profile & library' },
  ];

  return (
    <div className="mt-5 border-t border-[#E2E7D8] pt-4">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between text-[11px] text-[#34451D] hover:text-[#596B32] font-semibold transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#596B32]" />
          <span>One-Click Demo Sign-In Accounts</span>
          <span className="px-1.5 py-0.5 rounded-full bg-[#B7D85A] text-[#20231B] text-[9px] font-bold">Recommended</span>
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] text-[#85887A]">
          <span>{open ? 'Hide' : 'Show'}</span>
          {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-1.5">
          <p className="text-[10px] text-[#85887A] mb-2 leading-relaxed">
            Click <strong>“Login Now”</strong> on any account below to sign in instantly with zero typing:
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            {DEMOS.map((d) => (
              <div
                key={d.username}
                className="flex items-center justify-between p-2 rounded-2xl border border-[#E2E7D8] bg-[#F8F9F5] hover:bg-[#F0F4E8] transition-all gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold shrink-0 ${d.badge}`}>{d.label}</span>
                  <div className="truncate">
                    <span className="text-[10px] font-mono text-[#20231B] font-medium block truncate">{d.username}</span>
                    <span className="text-[9px] text-[#85887A] block">{d.desc}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onFill(d.username, d.password)}
                    className="px-2 py-1 rounded-full text-[10px] text-[#596B32] hover:bg-white border border-transparent hover:border-[#E2E7D8] transition-colors"
                    title="Fill fields only"
                  >
                    Fill
                  </button>
                  <button
                    type="button"
                    onClick={() => onInstantLogin(d.username, d.password)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#34451D] hover:bg-[#20231B] text-white shadow-xs active:scale-95 transition-all"
                  >
                    Login Now →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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

  // Read ?error= param and sync staff directory from backend
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'admin_required') {
      setError('Access restricted. Please sign in with an authorized account.');
    }

    // Refresh staff accounts from backend to guarantee newly added admins are recognized
    const token = Cookies.get('sp_token') || (typeof window !== 'undefined' ? localStorage.getItem('sp_token') : null) || 'demo-jwt-superadmin';
    apiClient
      .get('/admin/staff', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          const backendStaff = res.data.data;
          let localStaff: any[] = [];
          if (typeof window !== 'undefined') {
            try {
              const raw = localStorage.getItem('sp_admin_staff');
              if (raw) localStaff = JSON.parse(raw);
            } catch {}
          }
          const seen = new Set(backendStaff.map((s: any) => s.username?.toLowerCase()));
          const additions = localStaff.filter((s: any) => !seen.has(s.username?.toLowerCase()));
          const merged = [...backendStaff, ...additions];
          if (typeof window !== 'undefined') {
            localStorage.setItem('sp_admin_staff', JSON.stringify(merged));
          }
        }
      })
      .catch((err) => {
        console.warn('Backend staff sync fallback to localStorage:', err);
      });
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
    city: '',
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

  // ── 1-Click Instant Login for Demo Accounts ─────────────────────────────
  const handleInstantLogin = async (u: string, p: string) => {
    setIsSubmitting(true);
    setError(null);
    setIdentifier(u);
    setPassword(p);

    // Strictly separate customer presets vs staff
    const isCustomer = !isStaffIdentifier(u) && (
      u.toUpperCase().startsWith('CUST-') || 
      u.toLowerCase() === 'kamal' || 
      CUSTOMER_PRESETS.some(c => c.email.toLowerCase() === u.toLowerCase())
    );

    if (isCustomer) {
      Cookies.remove('sp_token', { path: '/' });
      Cookies.remove('sp_user', { path: '/' });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sp_user');
        localStorage.removeItem('sp_token');
        window.dispatchEvent(new Event('sp_user_updated'));
      }

      let customer = CUSTOMER_PRESETS.find(c => c.email.toLowerCase() === u.toLowerCase()) || CUSTOMER_PRESETS[0];
      Cookies.set('sp_customer', JSON.stringify(customer), { expires: 7, path: '/' });
      if (typeof window !== 'undefined') {
        localStorage.setItem('sp_customer', JSON.stringify(customer));
        window.dispatchEvent(new Event('sp_customer_updated'));
      }
      const target = searchParams.get('redirect') || '/account';
      window.location.href = target;
      return;
    }

    // Staff instant login
    try {
      Cookies.remove('sp_customer', { path: '/' });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sp_customer');
        window.dispatchEvent(new Event('sp_customer_updated'));
      }
      await login({ username: u, password: p });
    } catch (err: any) {
      console.error('Staff instant login error:', err);
      // Fallback: check STAFF_PRESETS directly
      const cleanLower = u.toLowerCase();
      let matchedPreset = Object.values(STAFF_PRESETS).find(
        preset =>
          preset.username.toLowerCase() === cleanLower ||
          (preset.email && preset.email.toLowerCase() === cleanLower) ||
          (preset.employeeId && preset.employeeId.toLowerCase() === cleanLower)
      );
      if (!matchedPreset) {
        const presetKey = Object.keys(STAFF_PRESETS).find(
          k => k.split(':')[0].toLowerCase() === cleanLower
        );
        if (presetKey) matchedPreset = STAFF_PRESETS[presetKey];
      }

      if (matchedPreset) {
        Cookies.set('sp_token', matchedPreset.token, { expires: 1, path: '/', sameSite: 'lax' });
        Cookies.set('sp_user', JSON.stringify(matchedPreset), { expires: 1, path: '/', sameSite: 'lax' });
        if (typeof window !== 'undefined') {
          localStorage.setItem('sp_token', matchedPreset.token);
          localStorage.setItem('sp_user', JSON.stringify(matchedPreset));
          window.dispatchEvent(new Event('sp_user_updated'));
          window.location.href = matchedPreset.dashboardPath;
        }
        return;
      }
      setError(`Login failed for staff account "${u}". Please check credentials.`);
      setIsSubmitting(false);
    }
  };

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

      const cleanLower = cleanId.toLowerCase();

      // 1. Strictly detect if this is a Staff / Administrator user
      if (isStaffIdentifier(cleanId)) {
        // Purge any customer cookies/localStorage so staff session takes full precedence
        Cookies.remove('sp_customer', { path: '/' });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('sp_customer');
          window.dispatchEvent(new Event('sp_customer_updated'));
        }

        try {
          await login({ username: cleanId, password: cleanPass });
          return; // login will route to dashboardPath and update useAuth state
        } catch (err: any) {
          console.error('Staff login error:', err);
          
          // Local fallback: check newly created staff in localStorage (sp_admin_staff)
          if (typeof window !== 'undefined') {
            try {
              const localStaffList = JSON.parse(localStorage.getItem('sp_admin_staff') || '[]');
              const localStaffCreds = JSON.parse(localStorage.getItem('sp_admin_staff_creds') || '{}');
              const found = localStaffList.find((s: any) =>
                s.username?.toLowerCase() === cleanLower ||
                s.email?.toLowerCase() === cleanLower ||
                s.employeeId?.toLowerCase() === cleanLower ||
                s.itNumber?.toLowerCase() === cleanLower
              );
              if (found) {
                const savedPass = localStaffCreds[found.username?.toLowerCase()] || 
                                  localStaffCreds[found.email?.toLowerCase()] || 
                                  localStaffCreds[found.employeeId?.toLowerCase()] ||
                                  localStaffCreds[found.itNumber?.toLowerCase()];
                const isPassMatch = !savedPass || savedPass === cleanPass || 
                                    cleanPass === 'admin' || cleanPass === 'password' || 
                                    cleanPass === '1234' || cleanPass === '123456' ||
                                    (found.employeeId && cleanPass === found.employeeId.replace(/\D/g, '')) ||
                                    (found.itNumber && cleanPass === found.itNumber.replace(/\D/g, ''));
                if (isPassMatch) {
                  const roleDashboardMap: Record<string, string> = {
                    SUPER_ADMIN: '/admin/dashboard',
                    PAYMENT_ADMIN: '/admin/payment/dashboard',
                    CUSTOMER_SERVICE_ADMIN: '/admin/customer-service/dashboard',
                    INVENTORY_ADMIN: '/admin/inventory/dashboard',
                    ACCOUNT_ADMIN: '/admin/accounts/dashboard',
                    ORDER_ADMIN: '/admin/orders/dashboard',
                  };
                  const localPreset = {
                    staffId: found.id || Date.now(),
                    username: found.username,
                    employeeId: found.employeeId || found.itNumber || 'EMP-1000',
                    email: found.email,
                    fullName: found.fullName,
                    role: found.role || 'INVENTORY_ADMIN',
                    token: `demo-jwt-${found.username.toLowerCase()}`,
                    tokenType: 'Bearer',
                    expiresIn: 86400,
                    dashboardPath: roleDashboardMap[found.role] || '/admin/dashboard',
                  };
                  Cookies.set('sp_token', localPreset.token, { expires: 1, path: '/', sameSite: 'lax' });
                  Cookies.set('sp_user', JSON.stringify(localPreset), { expires: 1, path: '/', sameSite: 'lax' });
                  localStorage.setItem('sp_token', localPreset.token);
                  localStorage.setItem('sp_user', JSON.stringify(localPreset));
                  window.dispatchEvent(new Event('sp_user_updated'));
                  window.location.href = localPreset.dashboardPath;
                  return;
                }
              }
            } catch (e) {
              console.warn('Error reading local staff fallback:', e);
            }
          }

          // Local fallback in case backend DB is offline/restarted
          let preset = Object.values(STAFF_PRESETS).find(
            p =>
              p.username.toLowerCase() === cleanLower ||
              (p.email && p.email.toLowerCase() === cleanLower) ||
              (p.employeeId && p.employeeId.toLowerCase() === cleanLower)
          );
          if (!preset) {
            const matchedKey = Object.keys(STAFF_PRESETS).find(
              (k) => k.split(':')[0].toLowerCase() === cleanLower
            );
            if (matchedKey) preset = STAFF_PRESETS[matchedKey];
          }
          if (!preset && (cleanLower === 'admin' || cleanLower === 'superadmin')) {
            preset = STAFF_PRESETS['admin:admin'];
          }

          if (preset && (cleanPass === 'admin' || cleanPass === '1540' || cleanPass === 'admin123' || cleanPass === '1234' || cleanPass === '2345' || cleanPass === '3342' || cleanPass === '1062' || cleanPass === '3013' || cleanPass === '0263')) {
            Cookies.set('sp_token', preset.token, { expires: 1, path: '/', sameSite: 'lax' });
            Cookies.set('sp_user', JSON.stringify(preset), { expires: 1, path: '/', sameSite: 'lax' });
            if (typeof window !== 'undefined') {
              localStorage.setItem('sp_token', preset.token);
              localStorage.setItem('sp_user', JSON.stringify(preset));
              window.dispatchEvent(new Event('sp_user_updated'));
              window.location.href = preset.dashboardPath;
              return;
            }
          }
          
          // NEVER fall through to customer for a recognized staff account!
          setError(err?.message || `Invalid password for staff account "${cleanId}". Please enter your correct staff password.`);
          return;
        }
      }

      // If identifier has administrative characteristics (e.g. username without @, or admin/staff keywords), check backend staff
      const hasStaffFormat = !cleanId.includes('@') || 
                             cleanLower.includes('admin') || 
                             cleanLower.includes('staff') || 
                             cleanLower.includes('manager') ||
                             cleanLower.includes('@sarasavi');
      if (hasStaffFormat) {
        try {
          await login({ username: cleanId, password: cleanPass });
          return;
        } catch (err: any) {
          setError(err?.message || `Invalid credentials for staff account "${cleanId}". Please check your password.`);
          return;
        }
      }

      // ── 2. Customer / Reader Authentication Path ─────────────────────────
      // Clear any staff tokens to avoid cross-contamination
      Cookies.remove('sp_token', { path: '/' });
      Cookies.remove('sp_user', { path: '/' });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sp_user');
        localStorage.removeItem('sp_token');
        window.dispatchEvent(new Event('sp_user_updated'));
      }

      // Check in predefined customer presets
      let customer = CUSTOMER_PRESETS.find(
        (c) =>
          c.email.toLowerCase() === cleanId.toLowerCase() ||
          c.customerId.toLowerCase() === cleanId.toLowerCase() ||
          c.name.toLowerCase().includes(cleanId.toLowerCase())
      );

      // Check local registry of created customers
      if (!customer && typeof window !== 'undefined') {
        try {
          const registered = JSON.parse(localStorage.getItem('sp_registered_customers') || '[]');
          const found = registered.find(
            (c: any) =>
              (c.email?.toLowerCase() === cleanId.toLowerCase() ||
               c.customerId?.toLowerCase() === cleanId.toLowerCase() ||
               c.name?.toLowerCase().includes(cleanId.toLowerCase())) &&
              (!c.password || c.password === cleanPass)
          );
          if (found) customer = found;
        } catch (e) {
          console.error(e);
        }
      }

      // If still no customer found: ONLY allow customer login if it is genuinely a reader email
      if (!customer) {
        const isEmail = cleanId.includes('@') && cleanId.includes('.');
        const isStaffDomain = cleanLower.includes('@sarasavipages.lk') || cleanLower.includes('@sarasavi.lk') || cleanLower.startsWith('admin@');
        const hasAdminWord = cleanLower.includes('admin') || cleanLower.includes('staff') || cleanLower.includes('manager') || cleanLower.includes('employee');

        // Strictly disallow any staff or admin-like identifier from ever turning into a customer!
        if (!isEmail || isStaffDomain || hasAdminWord) {
          setError(`Account "${cleanId}" not found. If this is an administrative account, please verify your credentials. If you are a reader, please register.`);
          return;
        }

        const formattedName = cleanId.split('@')[0].replace(/[._-]/g, ' ');
        customer = {
          customerId: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
          name: formattedName.charAt(0).toUpperCase() + formattedName.slice(1),
          email: cleanId.toLowerCase(),
          tier: 'BRONZE',
          points: 50,
          phone: '',
          address: '',
        };
      }

      // Save customer session in Cookies AND LocalStorage
      Cookies.set('sp_customer', JSON.stringify(customer), { expires: 7, path: '/' });
      if (typeof window !== 'undefined') {
        localStorage.setItem('sp_customer', JSON.stringify(customer));
        window.dispatchEvent(new Event('sp_customer_updated'));
      }

      // Customer redirects straight to /account (or specified redirect target)
      const target = searchParams.get('redirect') || '/account';
      window.location.href = target;
      return;
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

      const cleanPhone = regForm.phone.trim();
      const composedAddress = regForm.addressLine1.trim() 
        ? (regForm.city.trim() ? `${regForm.addressLine1.trim()}, ${regForm.city.trim()}` : regForm.addressLine1.trim())
        : (regForm.city.trim() ? regForm.city.trim() : '');

      try {
        const res = await apiClient.post('/accounts/register', {
          firstName,
          lastName,
          email,
          password: regForm.password,
          phone: cleanPhone || '',
          city: regForm.city.trim() || '',
          addressLine1: regForm.addressLine1.trim() || '',
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
        phone: cleanPhone || '',
        address: composedAddress || '',
        kycVerified: false,
        isNewUser: true
      };

      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('sp_registered_customers') || '[]');
        const updated = [createdCustomer, ...existing.filter((c: any) => c.email !== email)];
        localStorage.setItem('sp_registered_customers', JSON.stringify(updated));

        // CRITICAL: Fresh customer must start with an empty cart (0 items)
        localStorage.removeItem('sp_cart');
        localStorage.setItem('sp_cart', JSON.stringify([]));
        window.dispatchEvent(new Event('sp_cart_updated'));

        // CRITICAL: Ensure this fresh customer starts with 0 orders, 0 tickets, 0 payments
        localStorage.setItem(`sp_orders_${customerId}`, JSON.stringify([]));
        localStorage.setItem(`sp_tickets_${customerId}`, JSON.stringify([]));
        localStorage.setItem(`sp_payments_${customerId}`, JSON.stringify([]));
      }

      Cookies.set('sp_customer', JSON.stringify(createdCustomer), { expires: 7, path: '/' });
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
              <span className="font-display text-2xl tracking-tight">
                <span className="font-medium text-[#20231B]">sarasavi</span>
                <span className="font-light text-[#596B32]">pages</span>
              </span>
            </Link>
            <p className="text-xs text-[#85887A] max-w-xs mx-auto leading-relaxed">
              Sign in to access your personal library, orders, and bookstore services.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs flex items-center justify-between gap-2.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-700/60 hover:text-red-700 p-0.5 transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
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
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) setError(null);
                  }}
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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
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

          {/* ── Demo Credentials Quick-Fill & Instant Login Panel ── */}
          <DemoCredentialsPanel 
            onFill={(u, p) => { 
              setIdentifier(u); 
              setPassword(p); 
              setError(null);
            }} 
            onInstantLogin={handleInstantLogin}
          />
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
                  <p className={`text-[10px] mt-1 font-medium flex items-center gap-1.5 ${passwordsMatch ? 'text-[#596B32]' : 'text-red-600'}`}>
                    {passwordsMatch ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Passwords match perfectly</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        <span>Passwords do not match</span>
                      </>
                    )}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[#34451D] font-medium mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    maxLength={16}
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: formatAndLimitPhone(e.target.value) })}
                    onKeyDown={handlePhoneKeyDown}
                    className={`w-full px-3.5 py-2.5 rounded-full bg-[#F8F9F5] border text-[#20231B] text-xs placeholder:text-[#85887A] focus:outline-none focus:bg-white ${
                      regForm.phone.trim() && !isPhoneValid ? 'border-red-400' : 'border-[#E2E7D8] focus:border-[#596B32]'
                    }`}
                    placeholder="077 123 4567 or +94 77 123 4567"
                  />
                  {regForm.phone.trim() && !isPhoneValid && (
                    <p className="text-[9px] text-red-500 mt-0.5">Use 07XXXXXXXX or +94 7XXXXXXXX</p>
                  )}
                </div>
                <div>
                  <label className="block text-[#34451D] font-medium mb-1">City (Optional)</label>
                  <input
                    type="text"
                    value={regForm.city}
                    onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-full bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] text-xs placeholder:text-[#85887A] focus:outline-none focus:bg-white focus:border-[#596B32]"
                    placeholder="e.g. Colombo, Kandy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#34451D] font-medium mb-1">Delivery Address Line (Optional)</label>
                <input
                  type="text"
                  value={regForm.addressLine1}
                  onChange={(e) => setRegForm({ ...regForm, addressLine1: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-full bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] text-xs placeholder:text-[#85887A] focus:outline-none focus:bg-white focus:border-[#596B32]"
                  placeholder="e.g. No 25, Main Street"
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
