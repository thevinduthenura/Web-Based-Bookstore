'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api-client';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Power, 
  Lock, 
  Mail, 
  AlertCircle,
  X
} from 'lucide-react';
import type { StaffMember, StaffRole } from '@/types/admin';

const ROLES: { value: StaffRole; label: string }[] = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'PAYMENT_ADMIN', label: 'Payment Admin' },
  { value: 'CUSTOMER_SERVICE_ADMIN', label: 'Customer Service Admin' },
  { value: 'INVENTORY_ADMIN', label: 'Inventory Admin' },
  { value: 'ACCOUNT_ADMIN', label: 'Account Admin' },
  { value: 'ORDER_ADMIN', label: 'Order Admin' },
];

export default function StaffManagementPage() {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    itNumber: '',
    username: '',
    password: '',
    role: 'INVENTORY_ADMIN' as StaffRole,
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/admin/staff');
      if (res.data?.data) {
        setStaffList(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch staff list', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Filter staff based on search and role
  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.itNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRoleFilter === 'ALL' || s.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      await apiClient.post('/admin/staff', formData);
      setFeedback({ type: 'success', message: `Staff member ${formData.fullName} created successfully!` });
      setIsAddModalOpen(false);
      setFormData({
        fullName: '',
        email: '',
        itNumber: '',
        username: '',
        password: '',
        role: 'INVENTORY_ADMIN',
      });
      fetchStaff();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create staff member.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setIsSubmitting(true);
    setFormError(null);

    try {
      await apiClient.put(`/admin/staff/${selectedStaff.id}`, {
        fullName: selectedStaff.fullName,
        role: selectedStaff.role,
        active: selectedStaff.active,
      });
      setFeedback({ type: 'success', message: `Staff updated successfully!` });
      setIsEditModalOpen(false);
      fetchStaff();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update staff.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (staff: StaffMember) => {
    if (staff.username === user?.username) {
      alert('You cannot deactivate your own account.');
      return;
    }

    const action = staff.active ? 'deactivate' : 'reactivate';
    if (!confirm(`Are you sure you want to ${action} ${staff.fullName}?`)) return;

    try {
      if (staff.active) {
        await apiClient.delete(`/admin/staff/${staff.id}`);
      } else {
        await apiClient.put(`/admin/staff/${staff.id}`, {
          fullName: staff.fullName,
          role: staff.role,
          active: true,
        });
      }
      setFeedback({ type: 'success', message: `Staff member ${staff.fullName} was ${action}d.` });
      fetchStaff();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-brand-400" />
            Staff & RBAC Management
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Create, view, update roles, and manage permissions for all bookstore administrative accounts.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-brand text-white font-medium text-xs shadow-glow hover:brightness-110 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Staff</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl flex items-center justify-between text-xs border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, username, IT number..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder:text-ink-faint focus:outline-none focus:border-brand-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-ink-faint hidden sm:block" />
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 rounded-xl bg-surface border border-surface-border text-xs text-white focus:outline-none focus:border-brand-500 font-mono transition-all"
          >
            <option value="ALL">All Roles ({staffList.length})</option>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-surface-border">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-ink-muted">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mx-auto mb-2" />
            Loading staff directory...
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="py-12 text-center text-xs text-ink-muted">
            No staff members found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface/80 border-b border-surface-border text-ink-faint uppercase tracking-wider text-[10px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Username & IT</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-surface/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{staff.fullName}</div>
                      <div className="text-[11px] text-ink-faint">ID: #{staff.id}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-brand-400 font-medium">{staff.username}</div>
                      <div className="text-ink-faint text-[11px]">{staff.itNumber}</div>
                    </td>

                    <td className="py-3.5 px-4 text-ink-muted font-mono">{staff.email}</td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded border text-[11px] font-mono font-medium ${
                          staff.role === 'SUPER_ADMIN'
                            ? 'bg-brand-500/20 text-brand-400 border-brand-500/30 font-bold'
                            : 'bg-surface border-surface-border text-ink'
                        }`}
                      >
                        {staff.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {staff.active ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-medium font-mono">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-medium font-mono">
                          <XCircle className="w-3 h-3" /> Deactivated
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-ink-faint">
                      {new Date(staff.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedStaff({ ...staff });
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-surface border border-surface-border text-ink-muted hover:text-white hover:border-brand-500 transition-all"
                          title="Edit Role / Info"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(staff)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            staff.active
                              ? 'bg-surface border-surface-border text-red-400 hover:bg-red-500/10 hover:border-red-500/30'
                              : 'bg-surface border-surface-border text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30'
                          }`}
                          title={staff.active ? 'Deactivate Account' : 'Reactivate Account'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add New Staff */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 shadow-card border border-surface-border">
            <div className="flex items-center justify-between pb-4 border-b border-surface-border">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-brand-400" />
                Create New Staff Member
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-ink-faint hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder:text-ink-faint focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-ink-muted mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="john@sarasavipages.lk"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder:text-ink-faint focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-muted mb-1">IT Number</label>
                  <input
                    type="text"
                    required
                    placeholder="IT25109999"
                    value={formData.itNumber}
                    onChange={(e) => setFormData({ ...formData, itNumber: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder:text-ink-faint focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-ink-muted mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="DoeJ9999"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder:text-ink-faint focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-muted mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="e.g. 9999"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder:text-ink-faint focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1">Role / Module Authority</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-surface-border text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label} ({r.value})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface border border-surface-border text-xs text-ink-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-brand text-white font-medium text-xs shadow-glow hover:brightness-110 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Staff */}
      {isEditModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 shadow-card border border-surface-border">
            <div className="flex items-center justify-between pb-4 border-b border-surface-border">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand-400" />
                Edit Staff: {selectedStaff.username}
              </h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-ink-faint hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateRole} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={selectedStaff.fullName}
                  onChange={(e) => setSelectedStaff({ ...selectedStaff, fullName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-surface-border text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1">Role / Access Level</label>
                <select
                  value={selectedStaff.role}
                  onChange={(e) => setSelectedStaff({ ...selectedStaff, role: e.target.value as StaffRole })}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-surface-border text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface border border-surface-border text-xs text-ink-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-brand text-white font-medium text-xs shadow-glow hover:brightness-110 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Update Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
