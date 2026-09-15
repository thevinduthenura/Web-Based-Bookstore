'use client';

import { useAuth } from '@/hooks/useAuth';
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
  Check
} from 'lucide-react';
import { useState } from 'react';

export default function AccountsDashboardPage() {
  const { user, isSuperAdmin, hasRole } = useAuth();

  const isAuthorized = isSuperAdmin || hasRole('ACCOUNT_ADMIN');

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

  const [customers, setCustomers] = useState([
    { id: 'CUST-1001', name: 'Kamal Perera', email: 'kamal.perera@gmail.com', phone: '+94 77 123 4567', tier: 'GOLD', points: 350, kyc: true, status: 'ACTIVE', joined: '2026-01-15' },
    { id: 'CUST-1002', name: 'Nimal Fernando', email: 'nimal.fernando@yahoo.com', phone: '+94 71 987 6543', tier: 'SILVER', points: 180, kyc: true, status: 'ACTIVE', joined: '2026-02-01' },
    { id: 'CUST-1003', name: 'Sithara De Silva', email: 'sithara.de.silva@outlook.com', phone: '+94 76 543 2109', tier: 'BRONZE', points: 60, kyc: false, status: 'ACTIVE', joined: '2026-02-18' },
    { id: 'CUST-1004', name: 'Chaminda Jayawardena', email: 'chaminda.jay@gmail.com', phone: '+94 70 112 2334', tier: 'BRONZE', points: 50, kyc: false, status: 'PENDING_VERIFICATION', joined: '2026-03-02' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const toggleKyc = (id: string) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, kyc: !c.kyc } : c));
  };

  const toggleStatus = (id: string) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: c.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
        };
      }
      return c;
    }));
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            Module 5 — User Accounts Administration
          </div>
          <h1 className="text-2xl font-bold font-display text-white">Customer Profiles & Security</h1>
          <p className="text-xs text-ink-muted mt-1">
            Assigned Owner: <span className="text-pink-400 font-semibold">Gayathmi P.G.R. (IT25103013)</span> • Role: <span className="font-mono text-white">ACCOUNT_ADMIN</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border text-xs font-mono text-pink-400">
            Auth Provider: Native JWT
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Registered Customers</span>
            <div className="h-8 w-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">{customers.length}</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">Active customer directory</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">KYC Verified Rate</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">
              {Math.round((customers.filter(c => c.kyc).length / customers.length) * 100)}%
            </span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">Document compliance rate</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Loyalty Members</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">
              {customers.filter(c => c.tier !== 'BRONZE').length} Readers
            </span>
          </div>
          <p className="text-[11px] text-amber-400 mt-1">Silver & Gold tier readers</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Pending Verification</span>
            <div className="h-8 w-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">
              {customers.filter(c => !c.kyc).length} Accounts
            </span>
          </div>
          <p className="text-[11px] text-ink-faint mt-1">Pending KYC documentation</p>
        </div>
      </div>

      {/* Customer Accounts Directory Table */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Registered Customer Profiles & KYC Directory</h2>
            <p className="text-xs text-ink-muted mt-0.5">Manage customer account status and compliance (UC-UAP-01)</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user or email..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-surface border border-surface-border text-xs text-white focus:outline-none focus:border-pink-500/50 w-48"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/80 border-b border-surface-border text-ink-faint uppercase text-[10px] font-semibold">
              <tr>
                <th className="py-3 px-4">User ID & Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Loyalty Tier</th>
                <th className="py-3 px-4">KYC Status</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              {filteredCustomers.map(c => (
                <tr key={c.id} className="hover:bg-surface/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{c.name}</div>
                    <div className="text-ink-faint text-[10px] font-mono">{c.id}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-ink-muted">{c.email}</td>
                  <td className="py-3 px-4 font-mono text-ink-faint">{c.phone}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                      c.tier === 'GOLD'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : c.tier === 'SILVER'
                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                        : 'bg-surface text-ink-muted border-surface-border'
                    }`}>
                      {c.tier} ({c.points} pts)
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleKyc(c.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border transition-all ${
                        c.kyc 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                      }`}
                    >
                      {c.kyc ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {c.kyc ? 'Verified' : 'Unverified'}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                      c.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => toggleStatus(c.id)}
                      className="px-2.5 py-1 rounded-lg bg-surface border border-surface-border text-ink-muted hover:text-white text-[11px] font-medium transition-all"
                    >
                      {c.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
