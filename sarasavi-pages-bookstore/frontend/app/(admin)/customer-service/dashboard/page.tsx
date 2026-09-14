'use client';

import { useAuth } from '@/hooks/useAuth';
import { 
  Headphones, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Bot, 
  AlertCircle,
  Lock,
  Search,
  Sparkles
} from 'lucide-react';

export default function CustomerServiceDashboardPage() {
  const { user, isSuperAdmin, hasRole } = useAuth();

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
          <span>AI Support Bot: Active</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Open Support Tickets</span>
            <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">12 Tickets</span>
          </div>
          <p className="text-[11px] text-amber-400 mt-1">4 High Priority</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Resolved (Today)</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">28 Tickets</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">94% Resolution Rate</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Avg Response Time</span>
            <div className="h-8 w-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">8.4 mins</span>
          </div>
          <p className="text-[11px] text-ink-faint mt-1">Under SLA threshold of 15m</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">AI Bot Deflections</span>
            <div className="h-8 w-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">65%</span>
          </div>
          <p className="text-[11px] text-brand-400 mt-1">Automated FAQs resolved</p>
        </div>
      </div>

      {/* Ticket List */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">Active Support Tickets Queue</h2>
          <span className="text-xs text-ink-muted font-mono">Module 3 Scope</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/80 border-b border-surface-border text-ink-faint uppercase text-[10px] font-semibold">
              <tr>
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              <tr className="hover:bg-surface/40 transition-colors">
                <td className="py-3 px-4 font-mono text-brand-400">#TCK-4011</td>
                <td className="py-3 px-4 text-white font-medium">Order delivery delayed past estimated date</td>
                <td className="py-3 px-4 font-mono text-ink-muted">chamath.k@gmail.com</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-mono">
                    High
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono">
                    In Progress
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-ink-faint">15 mins ago</td>
              </tr>
              <tr className="hover:bg-surface/40 transition-colors">
                <td className="py-3 px-4 font-mono text-brand-400">#TCK-4010</td>
                <td className="py-3 px-4 text-white font-medium">Request book exchange for damaged hardcover</td>
                <td className="py-3 px-4 font-mono text-ink-muted">sanduni.d@yahoo.com</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono">
                    Medium
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-mono">
                    Open
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-ink-faint">1 hour ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
