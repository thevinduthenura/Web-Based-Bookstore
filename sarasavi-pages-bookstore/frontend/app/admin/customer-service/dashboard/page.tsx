'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
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
  Phone
} from 'lucide-react';

interface TicketItem {
  id: number;
  customerId: number;
  customerName: string;
  contactNumber: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  resolutionDetails?: string;
  resolvedBy?: string;
  createdAt: string;
}

const INITIAL_TICKETS: TicketItem[] = [
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
  },
  {
    id: 4008,
    customerId: 4,
    customerName: 'Nipuni Fernando',
    contactNumber: '+94 70 333 4455',
    subject: 'Inquiry about upcoming Sinhala translation arrivals',
    description: 'Requesting notification when Harry Potter Chamber of Secrets Sinhala edition is back in stock.',
    status: 'OPEN',
    priority: 'LOW',
    createdAt: 'Yesterday'
  }
];

export default function CustomerServiceDashboardPage() {
  const { user, isSuperAdmin, hasRole } = useAuth();
  const [tickets, setTickets] = useState<TicketItem[]>(INITIAL_TICKETS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [activeModalTicket, setActiveModalTicket] = useState<TicketItem | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  const isAuthorized = isSuperAdmin || hasRole('CUSTOMER_SERVICE_ADMIN');

  if (!isAuthorized) {
    return (
      <div className="glass-card rounded-2xl p-8 max-w-lg mx-auto text-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Access Restricted</h2>
        <p className="text-xs text-ink-muted leading-relaxed">
          You do not have administrative permissions to access Module 3 (Customer Service).
          This panel is exclusively reserved for the Customer Service Admin (Zeen A.C.) or Super Admin.
        </p>
      </div>
    );
  }

  // Handlers
  const handleUpdateStatus = (id: number, newStatus: 'IN_PROGRESS' | 'RESOLVED') => {
    if (newStatus === 'RESOLVED') {
      const ticket = tickets.find(t => t.id === id);
      if (ticket) {
        setActiveModalTicket(ticket);
        setResolutionText(ticket.resolutionDetails || '');
      }
      return;
    }

    setTickets(prev =>
      prev.map(t => (t.id === id ? { ...t, status: 'IN_PROGRESS' } : t))
    );
  };

  const handleSaveResolution = () => {
    if (!activeModalTicket) return;
    setTickets(prev =>
      prev.map(t =>
        t.id === activeModalTicket.id
          ? {
              ...t,
              status: 'RESOLVED',
              resolutionDetails: resolutionText || 'Resolved by Customer Service Officer',
              resolvedBy: user?.username || 'zeen.admin'
            }
          : t
      )
    );
    setActiveModalTicket(null);
    setResolutionText('');
  };

  // KPIs
  const openCount = tickets.filter(t => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED').length;

  const filteredTickets = tickets.filter(t => {
    const matchesSearch =
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toString().includes(searchTerm) ||
      t.contactNumber.includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-2">
            <Headphones className="w-3.5 h-3.5" />
            Module 3 — Customer Service Administration
          </div>
          <h1 className="text-2xl font-bold font-display text-white">Helpdesk & Support Center</h1>
          <p className="text-xs text-ink-muted mt-1">
            Assigned Owner: <span className="text-sky-400 font-semibold">Zeen A.C. (IT25103342)</span> • Role: <span className="font-mono text-white">CUSTOMER_SERVICE_ADMIN</span>
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border text-xs font-mono text-sky-400">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>AI Support Bot: Active (FAQ Deflection)</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Open Tickets</span>
            <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">{openCount} Tickets</span>
          </div>
          <p className="text-[11px] text-sky-400 mt-1">Awaiting staff response</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">In Progress</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">{inProgressCount} Active</span>
          </div>
          <p className="text-[11px] text-amber-400 mt-1">Under active officer investigation</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Resolved Tickets</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">{resolvedCount} Tickets</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">96% Satisfaction Rate</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">AI Bot Deflections</span>
            <div className="h-8 w-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">68%</span>
          </div>
          <p className="text-[11px] text-brand-400 mt-1">Automated FAQs resolved</p>
        </div>
      </div>

      {/* Tickets Queue Table */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Active Support Tickets Queue & Resolution</h2>
            <p className="text-xs text-ink-muted mt-0.5">Manage customer inquiries, feedback and complaints (UC-SCS-01, UC-SCS-02)</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-surface border border-surface-border rounded-xl p-1 text-xs">
              {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    statusFilter === st
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-ink-muted hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search subject, user or ID..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-surface border border-surface-border text-xs text-white focus:outline-none focus:border-sky-500/50 w-52"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/80 border-b border-surface-border text-ink-faint uppercase text-[10px] font-semibold">
              <tr>
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Subject & Description</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              {filteredTickets.map(t => (
                <tr key={t.id} className="hover:bg-surface/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-brand-400 font-semibold">
                    #TCK-{t.id}
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="text-white font-medium truncate">{t.subject}</div>
                    <div className="text-[11px] text-ink-muted truncate">{t.description}</div>
                    {t.resolutionDetails && (
                      <div className="mt-1 text-[10px] text-emerald-400/90 font-mono bg-emerald-500/5 p-1 rounded border border-emerald-500/10">
                        Resolution: {t.resolutionDetails}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-white font-medium">{t.customerName}</div>
                    <div className="text-[10px] font-mono text-ink-faint">{t.contactNumber}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                      t.priority === 'HIGH'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : t.priority === 'MEDIUM'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-surface text-ink-muted border-surface-border'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${
                      t.status === 'OPEN'
                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                        : t.status === 'IN_PROGRESS'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-ink-faint">
                    {t.createdAt}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {t.status === 'OPEN' && (
                        <button
                          onClick={() => handleUpdateStatus(t.id, 'IN_PROGRESS')}
                          className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 text-[10px] font-medium transition-all"
                        >
                          Start Investigation
                        </button>
                      )}

                      {t.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleUpdateStatus(t.id, 'RESOLVED')}
                          className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 text-[10px] font-medium transition-all inline-flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Resolve
                        </button>
                      )}

                      {t.status === 'RESOLVED' && (
                        <span className="text-[10px] font-mono text-ink-muted">
                          Resolved ({t.resolvedBy})
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolution Modal */}
      {activeModalTicket && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card bg-surface-card border border-surface-border rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Resolve Ticket #TCK-{activeModalTicket.id}
            </h3>
            <p className="text-xs text-ink-muted">
              Provide resolution notes to finalize this complaint/ticket (UC-SCS-02).
            </p>

            <div>
              <label className="text-xs text-ink-faint mb-1 block">Resolution Details</label>
              <textarea
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                rows={4}
                placeholder="Enter actions taken to resolve customer issue..."
                className="w-full p-3 rounded-xl bg-surface border border-surface-border text-xs text-white focus:outline-none focus:border-emerald-500/50 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModalTicket(null)}
                className="px-3 py-1.5 rounded-xl bg-surface border border-surface-border text-xs text-ink-muted hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveResolution}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-all shadow-sm"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
