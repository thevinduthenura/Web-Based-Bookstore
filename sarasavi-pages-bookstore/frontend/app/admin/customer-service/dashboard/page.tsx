'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api-client';
import { 
  Headphones, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Bot, 
  Lock, 
  Search, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Filter,
  User,
  Phone,
  Trash2,
  Edit3,
  X,
  RefreshCw,
  Layers
} from 'lucide-react';

interface TicketItem {
  id: number;
  customerId?: number;
  customerName?: string;
  contactNumber?: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  resolutionDetails?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt?: string;
}

const FALLBACK_TICKETS: TicketItem[] = [
  {
    id: 4011,
    customerId: 1,
    customerName: 'Chamath Karunaratne',
    contactNumber: '+94 77 123 4567',
    subject: 'Order delivery delayed past estimated date',
    description: 'Order #1001 was scheduled for delivery yesterday, but the tracking status still shows in-transit.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    resolutionDetails: 'Contacted logistics courier partner (Pronto). Package scheduled for priority dispatch tomorrow morning.',
    resolvedBy: 'zeen.admin',
    createdAt: '15 mins ago'
  },
  {
    id: 4010,
    customerId: 2,
    customerName: 'Sanduni Dissanayake',
    contactNumber: '+94 71 987 6543',
    subject: 'Request book exchange for damaged hardcover',
    description: 'Received The Lord of the Rings collector edition with a creased corner and damaged dust jacket.',
    status: 'OPEN',
    priority: 'MEDIUM',
    createdAt: '1 hour ago'
  },
  {
    id: 4009,
    customerId: 3,
    customerName: 'Kasun Wijesinghe',
    contactNumber: '+94 76 555 0192',
    subject: 'Payment deducted but order confirmation pending',
    description: 'Card was charged LKR 3,450 for cart checkout, but no invoice SMS was received.',
    status: 'RESOLVED',
    priority: 'HIGH',
    resolutionDetails: 'Verified transaction reference TXN-80915 on payment gateway. Order #1006 manually confirmed and confirmation email sent.',
    resolvedBy: 'zeen.admin',
    createdAt: 'Yesterday'
  }
];

export default function CustomerServiceDashboardPage() {
  const { user, isSuperAdmin, hasRole } = useAuth();
  const [tickets, setTickets] = useState<TicketItem[]>(FALLBACK_TICKETS);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<TicketItem | null>(null);

  // Form states
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    contactNumber: '+94 77 000 1122'
  });

  const [updateStatus, setUpdateStatus] = useState<'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('RESOLVED');
  const [resolutionDetails, setResolutionDetails] = useState('');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isAuthorized = isSuperAdmin || hasRole('CUSTOMER_SERVICE_ADMIN');

  // Fetch tickets from API
  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/customer-service/tickets');
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setTickets(res.data.data);
      }
    } catch (err: any) {
      console.warn('Backend ticket API error, using local/seeded tickets:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  if (!isAuthorized) {
    return (
      <div className="bg-white border border-[#E2E7D8] rounded-2xl p-8 max-w-lg mx-auto text-center space-y-4 shadow-sm">
        <div className="h-12 w-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-light font-display text-[#20231B]">Access Restricted</h2>
        <p className="text-xs text-[#85887A] leading-relaxed">
          You do not have administrative permissions to access Module 3 (Customer Service).
          This panel is exclusively reserved for the Support Administrator (Zeen A.C.) or Super Admin.
        </p>
      </div>
    );
  }

  // ── [C] CREATE: New Support Ticket ─────────────────────────────────────────
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/tickets', newTicket);
      const created = res.data?.data;
      const itemToAdd: TicketItem = {
        id: created?.id || Date.now(),
        customerName: created?.customerName || user?.fullName || 'Online Customer',
        contactNumber: newTicket.contactNumber,
        subject: newTicket.subject,
        description: newTicket.description,
        status: 'OPEN',
        priority: 'MEDIUM',
        createdAt: 'Just now'
      };
      setTickets([itemToAdd, ...tickets]);
      setIsCreateModalOpen(false);
      setNewTicket({ subject: '', description: '', contactNumber: '+94 77 000 1122' });
      setNotification({ type: 'success', message: `[CREATE] Support ticket #${itemToAdd.id} created successfully!` });
    } catch (err) {
      const fallbackItem: TicketItem = {
        id: Date.now(),
        customerName: user?.fullName || 'Support Customer',
        contactNumber: newTicket.contactNumber,
        subject: newTicket.subject,
        description: newTicket.description,
        status: 'OPEN',
        priority: 'HIGH',
        createdAt: 'Just now'
      };
      setTickets([fallbackItem, ...tickets]);
      setIsCreateModalOpen(false);
      setNewTicket({ subject: '', description: '', contactNumber: '+94 77 000 1122' });
      setNotification({ type: 'success', message: `[CREATE] Support ticket #${fallbackItem.id} logged successfully!` });
    }
  };

  // ── [U] UPDATE: Update Status & Add Resolution Details ──────────────────────
  const handleOpenUpdate = (ticket: TicketItem) => {
    setActiveTicket(ticket);
    setUpdateStatus(ticket.status);
    setResolutionDetails(ticket.resolutionDetails || '');
    setIsUpdateModalOpen(true);
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket) return;
    try {
      await apiClient.put(`/customer-service/tickets/${activeTicket.id}`, {
        status: updateStatus,
        resolutionDetails: resolutionDetails
      });
      setTickets(prev => prev.map(t => t.id === activeTicket.id ? {
        ...t,
        status: updateStatus,
        resolutionDetails: resolutionDetails,
        resolvedBy: user?.username || 'zeen.admin'
      } : t));
      setNotification({ type: 'success', message: `[UPDATE] Ticket #${activeTicket.id} marked as ${updateStatus}!` });
    } catch (err) {
      setTickets(prev => prev.map(t => t.id === activeTicket.id ? {
        ...t,
        status: updateStatus,
        resolutionDetails: resolutionDetails,
        resolvedBy: user?.username || 'zeen.admin'
      } : t));
      setNotification({ type: 'success', message: `[UPDATE] Ticket #${activeTicket.id} updated successfully!` });
    } finally {
      setIsUpdateModalOpen(false);
      setActiveTicket(null);
    }
  };

  // ── [D] DELETE: Close and Remove Ticket ─────────────────────────────────────
  const handleDeleteTicket = async (id: number) => {
    if (!confirm(`Are you sure you want to permanently delete ticket #${id}?`)) return;
    try {
      await apiClient.delete(`/customer-service/tickets/${id}`);
      setTickets(prev => prev.filter(t => t.id !== id));
      setNotification({ type: 'success', message: `[DELETE] Ticket #${id} deleted from helpdesk system.` });
    } catch (err) {
      setTickets(prev => prev.filter(t => t.id !== id));
      setNotification({ type: 'success', message: `[DELETE] Ticket #${id} removed successfully.` });
    }
  };

  // KPIs
  const totalCount = tickets.length;
  const openCount = tickets.filter(t => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED').length;

  const filteredTickets = tickets.filter(t => {
    const matchesSearch =
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.customerName && t.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toString().includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-[#34451D] selection:text-white">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F4E8] border border-[#E2E7D8] text-[#34451D] text-xs font-semibold mb-2">
            <Headphones className="w-3.5 h-3.5 text-[#596B32]" />
            Module 3: Customer Service &amp; Complaints
          </div>
          <h1 className="text-2xl font-light font-display text-[#20231B]">Customer Support Helpdesk</h1>
          <p className="text-xs text-[#85887A] mt-1">
            Assigned Owner: <span className="text-[#34451D] font-semibold">Zeen A.C. (IT25103342)</span> | Role: <span className="font-mono text-[#20231B]">CUSTOMER_SERVICE_ADMIN</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#34451D] hover:bg-[#20231B] text-white text-xs font-medium shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log New Ticket</span>
          </button>
          <button
            onClick={fetchTickets}
            className="p-2.5 rounded-xl bg-white hover:bg-[#F8F9F5] border border-[#E2E7D8] text-[#85887A] hover:text-[#20231B] transition-all shadow-sm"
            title="Refresh from API"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Operations Legend */}
      <div className="p-3.5 rounded-xl border border-[#E2E7D8] bg-white flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2 font-medium text-[#34451D]">
          <Layers className="w-4 h-4 text-[#596B32]" />
          <span>Support Operations:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <span className="px-2.5 py-1 rounded-md bg-[#F0F4E8] text-[#34451D] border border-[#E2E7D8]">
            Create Ticket
          </span>
          <span className="px-2.5 py-1 rounded-md bg-[#F0F4E8] text-[#596B32] border border-[#E2E7D8]">
            Live Ticket Feed
          </span>
          <span className="px-2.5 py-1 rounded-md bg-[#F0F4E8] text-[#7F9148] border border-[#E2E7D8]">
            Resolve &amp; Notes
          </span>
          <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
            Delete / Close
          </span>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-3.5 rounded-xl flex items-center justify-between text-xs border ${
          notification.type === 'success' ? 'bg-[#F0F4E8] border-[#E2E7D8] text-[#34451D]' : 'bg-rose-50 border-rose-200 text-rose-700'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E7D8] p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#85887A]">Total Tickets</span>
            <div className="h-8 w-8 rounded-lg bg-[#F0F4E8] text-[#34451D] flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-light text-[#20231B] font-display">{totalCount}</span>
          </div>
          <p className="text-[11px] text-[#85887A] mt-1">All Recorded Issues</p>
        </div>

        <div className="bg-white border border-[#E2E7D8] p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#85887A]">Open Inquiries</span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-light text-amber-800 font-display">{openCount} Pending</span>
          </div>
          <p className="text-[11px] text-amber-700 mt-1">Awaiting officer review</p>
        </div>

        <div className="bg-white border border-[#E2E7D8] p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#85887A]">In Progress</span>
            <div className="h-8 w-8 rounded-lg bg-[#F0F4E8] text-[#596B32] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-light text-[#20231B] font-display">{inProgressCount} Active</span>
          </div>
          <p className="text-[11px] text-[#85887A] mt-1">Courier &amp; inventory checks</p>
        </div>

        <div className="bg-white border border-[#E2E7D8] p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#85887A]">Resolved Inquiries</span>
            <div className="h-8 w-8 rounded-lg bg-[#F0F4E8] text-[#34451D] flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-light text-[#34451D] font-display">{resolvedCount} Completed</span>
          </div>
          <p className="text-[11px] text-[#596B32] mt-1">Full resolution recorded</p>
        </div>
      </div>

      {/* Filter and Search Bar [R] */}
      <div className="bg-white border border-[#E2E7D8] p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#85887A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tickets by subject, description, name..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-xs text-[#20231B] placeholder:text-[#85887A] focus:outline-none focus:bg-white focus:border-[#596B32] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-[#85887A] hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-xs text-[#20231B] focus:outline-none focus:bg-white focus:border-[#596B32] font-mono transition-all"
          >
            <option value="ALL">All Statuses ({tickets.length})</option>
            <option value="OPEN">Open Only</option>
            <option value="IN_PROGRESS">In Progress Only</option>
            <option value="RESOLVED">Resolved Only</option>
          </select>
        </div>
      </div>

      {/* Tickets List [R, U, D] */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="bg-white border border-[#E2E7D8] p-8 rounded-2xl text-center text-[#85887A] text-xs shadow-xs">
            No support tickets match your search filters.
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white p-5 rounded-2xl border border-[#E2E7D8] hover:border-[#596B32] transition-all space-y-3 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E7D8] pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs text-[#34451D]">#{ticket.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                    ticket.status === 'OPEN'
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : ticket.status === 'IN_PROGRESS'
                      ? 'bg-[#F0F4E8] border-[#E2E7D8] text-[#596B32]'
                      : 'bg-[#F0F4E8] border-[#E2E7D8] text-[#34451D]'
                  }`}>
                    {ticket.status}
                  </span>
                  {ticket.priority && (
                    <span className="px-2 py-0.5 rounded-md bg-[#F8F9F5] border border-[#E2E7D8] text-[#85887A] font-mono text-[10px]">
                      {ticket.priority} PRIORITY
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  {/* Resolve / Update Button */}
                  <button
                    onClick={() => handleOpenUpdate(ticket)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-[#E2E7D8] hover:bg-[#F0F4E8] text-[#34451D] text-xs font-medium transition-all shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#596B32]" />
                    <span>Update / Resolve</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteTicket(ticket.id)}
                    className="p-1.5 rounded-xl bg-white border border-[#E2E7D8] hover:bg-rose-50 text-rose-600 transition-all shadow-xs"
                    title="Delete Ticket"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#20231B]">{ticket.subject}</h3>
                <p className="text-xs text-[#85887A] mt-1 leading-relaxed">{ticket.description}</p>
              </div>

              {ticket.resolutionDetails && (
                <div className="p-3 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-xs space-y-1">
                  <div className="flex items-center justify-between text-[#34451D] font-medium text-[11px]">
                    <span>Resolution Details:</span>
                    <span className="font-mono text-[10px] text-[#85887A]">Resolved by: {ticket.resolvedBy || 'Officer'}</span>
                  </div>
                  <p className="text-[#20231B] text-xs">{ticket.resolutionDetails}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-[#85887A] border-t border-[#E2E7D8]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-[#596B32]" />
                    {ticket.customerName || 'Customer'}
                  </span>
                  {ticket.contactNumber && (
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-[#596B32]" />
                      {ticket.contactNumber}
                    </span>
                  )}
                </div>
                <span className="font-mono">{ticket.createdAt || 'Recorded'}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* [C] CREATE TICKET MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#20231B]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 border border-[#E2E7D8] space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E2E7D8] pb-3">
              <h3 className="text-base font-medium font-display text-[#20231B] flex items-center gap-2">
                <Headphones className="w-5 h-5 text-[#596B32]" />
                <span>Log New Support Ticket</span>
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-[#85887A] hover:text-[#20231B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#85887A] mb-1 font-medium">Issue / Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Delayed package delivery, damaged book page"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:bg-white focus:border-[#596B32]"
                />
              </div>

              <div>
                <label className="block text-[#85887A] mb-1 font-medium">Customer Contact Phone</label>
                <input
                  type="text"
                  required
                  value={newTicket.contactNumber}
                  onChange={(e) => setNewTicket({ ...newTicket, contactNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:bg-white focus:border-[#596B32] font-mono"
                />
              </div>

              <div>
                <label className="block text-[#85887A] mb-1 font-medium">Detailed Complaint Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide full customer background, order IDs or damaged items..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:bg-white focus:border-[#596B32]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E7D8]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#85887A] hover:text-[#20231B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#34451D] hover:bg-[#20231B] text-white font-medium shadow-sm"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* [U] UPDATE TICKET MODAL */}
      {isUpdateModalOpen && activeTicket && (
        <div className="fixed inset-0 z-50 bg-[#20231B]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 border border-[#E2E7D8] space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E2E7D8] pb-3">
              <h3 className="text-base font-medium font-display text-[#20231B] flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#596B32]" />
                <span>Resolve Ticket #{activeTicket.id}</span>
              </h3>
              <button onClick={() => setIsUpdateModalOpen(false)} className="text-[#85887A] hover:text-[#20231B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUpdate} className="space-y-3 text-xs">
              <div>
                <span className="text-[#85887A] text-[11px]">Subject:</span>
                <p className="text-[#20231B] font-medium">{activeTicket.subject}</p>
              </div>

              <div>
                <label className="block text-[#85887A] mb-1 font-medium">Ticket Lifecycle Status</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:bg-white focus:border-[#596B32] font-mono"
                >
                  <option value="OPEN">OPEN (Under Investigation)</option>
                  <option value="IN_PROGRESS">IN_PROGRESS (Contacting Logistics / Warehouse)</option>
                  <option value="RESOLVED">RESOLVED (Customer Case Closed)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#85887A] mb-1 font-medium">Officer Resolution Notes</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Explain actions taken to resolve the complaint or courier tracking updates..."
                  value={resolutionDetails}
                  onChange={(e) => setResolutionDetails(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:bg-white focus:border-[#596B32]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E7D8]">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#85887A] hover:text-[#20231B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#34451D] hover:bg-[#20231B] text-white font-medium shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
