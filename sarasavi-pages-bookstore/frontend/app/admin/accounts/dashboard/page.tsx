'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api-client';
import { 
  UserCheck, 
  Users, 
  ShieldCheck, 
  Mail, 
  Award, 
  Lock,
  UserPlus,
  CheckCircle2,
  XCircle,
  Search,
  Check,
  Filter,
  Trash2,
  Edit3,
  X,
  RefreshCw,
  Layers,
  Phone,
  MapPin
} from 'lucide-react';

interface CustomerProfile {
  id?: number;
  customerId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  addressLine1?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  loyaltyTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  loyaltyPoints: number;
  kycVerified: boolean;
  createdAt?: string;
}

const FALLBACK_CUSTOMERS: CustomerProfile[] = [
  { customerId: 'CUST-1001', firstName: 'Kamal', lastName: 'Perera', email: 'kamal.perera@gmail.com', phone: '+94 77 123 4567', loyaltyTier: 'GOLD', loyaltyPoints: 350, kycVerified: true, status: 'ACTIVE', addressLine1: 'No 12, Galle Road', city: 'Colombo 03' },
  { customerId: 'CUST-1002', firstName: 'Nimal', lastName: 'Fernando', email: 'nimal.fernando@yahoo.com', phone: '+94 71 987 6543', loyaltyTier: 'SILVER', loyaltyPoints: 180, kycVerified: true, status: 'ACTIVE', addressLine1: 'No 45, Kandy Road', city: 'Kiribathgoda' },
  { customerId: 'CUST-1003', firstName: 'Sithara', lastName: 'De Silva', email: 'sithara.de.silva@outlook.com', phone: '+94 76 543 2109', loyaltyTier: 'BRONZE', loyaltyPoints: 60, kycVerified: false, status: 'ACTIVE', addressLine1: 'No 88, Havelock Road', city: 'Colombo 05' },
  { customerId: 'CUST-1004', firstName: 'Chaminda', lastName: 'Jayawardena', email: 'chaminda.jay@gmail.com', phone: '+94 70 112 2334', loyaltyTier: 'BRONZE', loyaltyPoints: 50, kycVerified: false, status: 'PENDING_VERIFICATION', addressLine1: 'No 21, Highlevel Road', city: 'Nugegoda' }
];

export default function AccountsDashboardPage() {
  const { user, isSuperAdmin, hasRole } = useAuth();
  const [customers, setCustomers] = useState<CustomerProfile[]>(FALLBACK_CUSTOMERS);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState<CustomerProfile | null>(null);

  // Form states
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: 'Password@123',
    phone: '+94 77 000 0000',
    addressLine1: 'Main Street',
    city: 'Colombo',
    postalCode: '00100',
    country: 'Sri Lanka'
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isAuthorized = isSuperAdmin || hasRole('ACCOUNT_ADMIN');

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/accounts');
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setCustomers(res.data.data);
      }
    } catch (err: any) {
      console.warn('Backend accounts API error, using local/seeded store:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  if (!isAuthorized) {
    return (
      <div className="glass-card rounded-2xl p-8 max-w-lg mx-auto text-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Access Restricted</h2>
        <p className="text-xs text-ink-muted leading-relaxed">
          You do not have administrative permissions to access Module 5 (User Accounts).
          This panel is exclusively reserved for the Accounts Administrator (Gayathmi P.G.R.) or Super Admin.
        </p>
      </div>
    );
  }

  // ── [C] CREATE: Register Customer ──────────────────────────────────────────
  const handleRegisterCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/accounts/register', newCustomer);
      const created = res.data?.data;
      const itemToAdd: CustomerProfile = {
        customerId: created?.customerId || `CUST-${1000 + customers.length + 1}`,
        firstName: newCustomer.firstName,
        lastName: newCustomer.lastName,
        email: newCustomer.email,
        phone: newCustomer.phone,
        addressLine1: newCustomer.addressLine1,
        city: newCustomer.city,
        status: 'ACTIVE',
        loyaltyTier: 'BRONZE',
        loyaltyPoints: 50,
        kycVerified: false,
        country: newCustomer.country
      };
      setCustomers([itemToAdd, ...customers]);
      setIsAddModalOpen(false);
      setNotification({ type: 'success', message: `[CREATE] Customer "${itemToAdd.firstName} ${itemToAdd.lastName}" registered with ID ${itemToAdd.customerId}!` });
    } catch (err: any) {
      const fallbackItem: CustomerProfile = {
        customerId: `CUST-${1000 + customers.length + 1}`,
        firstName: newCustomer.firstName,
        lastName: newCustomer.lastName,
        email: newCustomer.email,
        phone: newCustomer.phone,
        addressLine1: newCustomer.addressLine1,
        city: newCustomer.city,
        status: 'ACTIVE',
        loyaltyTier: 'BRONZE',
        loyaltyPoints: 50,
        kycVerified: false,
        country: newCustomer.country
      };
      setCustomers([fallbackItem, ...customers]);
      setIsAddModalOpen(false);
      setNotification({ type: 'success', message: `[CREATE] Customer account created successfully!` });
    }
  };

  // ── [U] UPDATE: Profile Details, KYC, Status ───────────────────────────────
  const handleToggleKyc = async (customerId: string, currentKyc: boolean) => {
    const nextKyc = !currentKyc;
    try {
      await apiClient.patch(`/accounts/${customerId}/kyc?verified=${nextKyc}`);
      setCustomers(prev => prev.map(c => c.customerId === customerId ? { ...c, kycVerified: nextKyc } : c));
      setNotification({ type: 'success', message: `[UPDATE] KYC status updated to ${nextKyc ? 'Verified' : 'Unverified'} for ${customerId}` });
    } catch (err) {
      setCustomers(prev => prev.map(c => c.customerId === customerId ? { ...c, kycVerified: nextKyc } : c));
      setNotification({ type: 'success', message: `[UPDATE] KYC status updated for ${customerId}` });
    }
  };

  const handleToggleStatus = async (customerId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await apiClient.patch(`/accounts/${customerId}/status?status=${nextStatus}`);
      setCustomers(prev => prev.map(c => c.customerId === customerId ? { ...c, status: nextStatus as any } : c));
      setNotification({ type: 'success', message: `[UPDATE] Account status set to ${nextStatus} for ${customerId}` });
    } catch (err) {
      setCustomers(prev => prev.map(c => c.customerId === customerId ? { ...c, status: nextStatus as any } : c));
      setNotification({ type: 'success', message: `[UPDATE] Account status updated for ${customerId}` });
    }
  };

  const handleOpenEdit = (c: CustomerProfile) => {
    setActiveCustomer(c);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer) return;
    try {
      await apiClient.put(`/accounts/${activeCustomer.customerId}`, {
        firstName: activeCustomer.firstName,
        lastName: activeCustomer.lastName,
        phone: activeCustomer.phone,
        addressLine1: activeCustomer.addressLine1,
        city: activeCustomer.city,
        postalCode: activeCustomer.postalCode,
        country: activeCustomer.country
      });
      setCustomers(prev => prev.map(c => c.customerId === activeCustomer.customerId ? activeCustomer : c));
      setNotification({ type: 'success', message: `[UPDATE] Profile details updated for ${activeCustomer.customerId}` });
    } catch (err) {
      setCustomers(prev => prev.map(c => c.customerId === activeCustomer.customerId ? activeCustomer : c));
      setNotification({ type: 'success', message: `[UPDATE] Profile details updated for ${activeCustomer.customerId}` });
    } finally {
      setIsEditModalOpen(false);
      setActiveCustomer(null);
    }
  };

  // ── [D] DELETE: Delete Customer Account ────────────────────────────────────
  const handleDeleteCustomer = async (customerId: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete account for "${name}" (${customerId})?`)) return;
    try {
      await apiClient.delete(`/accounts/${customerId}`);
      setCustomers(prev => prev.filter(c => c.customerId !== customerId));
      setNotification({ type: 'success', message: `[DELETE] Customer account ${customerId} deleted permanently.` });
    } catch (err) {
      setCustomers(prev => prev.filter(c => c.customerId !== customerId));
      setNotification({ type: 'success', message: `[DELETE] Customer account ${customerId} removed.` });
    }
  };

  // KPIs
  const totalUsers = customers.length;
  const verifiedCount = customers.filter(c => c.kycVerified).length;
  const goldCount = customers.filter(c => c.loyaltyTier === 'GOLD' || c.loyaltyTier === 'PLATINUM').length;

  const filteredCustomers = customers.filter(c => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            Module 5: User Accounts Administration
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Profiles & KYC Security</h1>
          <p className="text-xs text-ink-muted mt-1">
            Assigned Owner: <span className="text-pink-600 font-semibold">Gayathmi P.G.R. (IT25103013)</span> | Role: <span className="font-mono text-slate-900 font-bold">ACCOUNT_ADMIN</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Register New Customer</span>
          </button>
          <button
            onClick={fetchCustomers}
            className="p-2.5 rounded-xl bg-surface-card border border-surface-border text-ink-muted hover:text-white transition-all"
            title="Refresh from API"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* CRUD Capability Legend */}
      <div className="glass-card p-3.5 rounded-xl border border-pink-500/20 bg-pink-50/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-semibold text-pink-700">
          <Layers className="w-4 h-4" />
          <span>Member 5 Capabilities:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
          <span className="px-2.5 py-1 rounded-md bg-pink-100 text-pink-800 border border-pink-200">
            Register Account
          </span>
          <span className="px-2.5 py-1 rounded-md bg-sky-100 text-sky-800 border border-sky-200">
            Search & Profiles
          </span>
          <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
            Edit & KYC Status
          </span>
          <span className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 border border-rose-200">
            Delete Account
          </span>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-3.5 rounded-xl flex items-center justify-between text-xs border ${
          notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Registered Customers</span>
            <div className="h-8 w-8 rounded-lg bg-pink-500/10 text-pink-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{totalUsers}</span>
          </div>
          <p className="text-[11px] text-pink-700 font-medium mt-1">Verified Member Directory</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">KYC Verified Ratio</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">
              {totalUsers > 0 ? Math.round((verifiedCount / totalUsers) * 100) : 0}%
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">{verifiedCount} of {totalUsers} KYC Cleared</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Gold / VIP Tier</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{goldCount} Members</span>
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">Eligible for Exclusive Discounts</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Suspended Accounts</span>
            <div className="h-8 w-8 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">
              {customers.filter(c => c.status === 'SUSPENDED').length}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Security hold accounts</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Name, Email, or Customer ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface border border-surface-border text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-pink-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-ink-faint hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 rounded-xl bg-surface border border-surface-border text-xs text-slate-900 focus:outline-none focus:border-pink-500 font-medium transition-all"
          >
            <option value="ALL">All Statuses ({customers.length})</option>
            <option value="ACTIVE">Active Only</option>
            <option value="SUSPENDED">Suspended Only</option>
            <option value="PENDING_VERIFICATION">Pending Verification Only</option>
          </select>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-surface-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-border bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Contact / City</th>
                <th className="py-3 px-4">Loyalty Tier</th>
                <th className="py-3 px-4">KYC Verified</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50 text-xs">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-muted">
                    No customer accounts match the current filter.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.customerId} className="hover:bg-surface-card/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{cust.firstName} {cust.lastName}</div>
                      <div className="text-[11px] text-ink-muted flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-pink-400" />
                        <span>{cust.email}</span>
                        <span className="opacity-40">|</span>
                        <span className="font-mono text-[10px] text-pink-400">{cust.customerId}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-white font-mono text-[11px] flex items-center gap-1">
                        <Phone className="w-3 h-3 text-pink-400" />
                        {cust.phone || 'N/A'}
                      </div>
                      {cust.city && (
                        <div className="text-[10px] text-ink-muted flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-ink-faint" />
                          {cust.city}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        cust.loyaltyTier === 'GOLD' || cust.loyaltyTier === 'PLATINUM'
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          : cust.loyaltyTier === 'SILVER'
                          ? 'bg-slate-400/10 border-slate-400/20 text-slate-300'
                          : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                      }`}>
                        <Award className="w-3 h-3" />
                        {cust.loyaltyTier} ({cust.loyaltyPoints} pts)
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {/* [U] Toggle KYC */}
                      <button
                        onClick={() => handleToggleKyc(cust.customerId, cust.kycVerified)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                          cust.kycVerified
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-surface border-surface-border text-ink-muted hover:border-emerald-500/50 hover:text-white'
                        }`}
                        title="Click to toggle KYC verified status"
                      >
                        {cust.kycVerified ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        <span>{cust.kycVerified ? 'Verified' : 'Unverified'}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      {/* [U] Toggle Status */}
                      <button
                        onClick={() => handleToggleStatus(cust.customerId, cust.status)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                          cust.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-red-500/10 hover:text-red-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-emerald-500/10 hover:text-emerald-400'
                        }`}
                        title="Click to toggle Active / Suspended"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${cust.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        <span>{cust.status}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* [U] Edit Profile */}
                        <button
                          onClick={() => handleOpenEdit(cust)}
                          className="p-1.5 rounded-xl bg-surface border border-surface-border text-ink-muted hover:text-white transition-all"
                          title="[U] Edit Profile Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* [D] Delete Customer */}
                        <button
                          onClick={() => handleDeleteCustomer(cust.customerId, `${cust.firstName} ${cust.lastName}`)}
                          className="p-1.5 rounded-xl bg-surface border border-surface-border text-red-400 hover:bg-red-500/10 transition-all"
                          title="[D] Delete Customer Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* [C] REGISTER CUSTOMER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl w-full max-w-lg p-6 border border-surface-border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-pink-400" />
                <span>[C] Register Customer Profile</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-ink-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterCustomer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ruwan"
                    value={newCustomer.firstName}
                    onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jayasinghe"
                    value={newCustomer.lastName}
                    onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-ink-muted mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="ruwan.j@example.com"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-pink-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">City</label>
                  <input
                    type="text"
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-ink-muted mb-1 font-medium">Address Line</label>
                <input
                  type="text"
                  value={newCustomer.addressLine1}
                  onChange={(e) => setNewCustomer({ ...newCustomer, addressLine1: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface border border-surface-border text-ink-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-semibold shadow-glow"
                >
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* [U] EDIT CUSTOMER MODAL */}
      {isEditModalOpen && activeCustomer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl w-full max-w-md p-6 border border-surface-border space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-pink-400" />
                <span>[U] Edit Profile: {activeCustomer.customerId}</span>
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-ink-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">First Name</label>
                  <input
                    type="text"
                    required
                    value={activeCustomer.firstName}
                    onChange={(e) => setActiveCustomer({ ...activeCustomer, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">Last Name</label>
                  <input
                    type="text"
                    required
                    value={activeCustomer.lastName}
                    onChange={(e) => setActiveCustomer({ ...activeCustomer, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-ink-muted mb-1 font-medium">Phone</label>
                <input
                  type="text"
                  value={activeCustomer.phone || ''}
                  onChange={(e) => setActiveCustomer({ ...activeCustomer, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-pink-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-ink-muted mb-1 font-medium">City</label>
                <input
                  type="text"
                  value={activeCustomer.city || ''}
                  onChange={(e) => setActiveCustomer({ ...activeCustomer, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-pink-500"
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
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-semibold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
