'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { 
  FileText, 
  Search, 
  Filter, 
  RotateCw, 
  ShieldCheck, 
  Clock, 
  User, 
  ArrowUpDown,
  Calendar
} from 'lucide-react';
import type { AuditLogEntry, PagedResponse } from '@/types/admin';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActionFilter, setSelectedActionFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchLogs = async (pageNum = 0) => {
    try {
      setIsLoading(true);
      const res = await apiClient.get(`/admin/audit-logs?page=${pageNum}&size=15`);
      if (res.data?.data) {
        const data: PagedResponse<AuditLogEntry> = res.data.data;
        setLogs(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
        setPage(data.number);
      }
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(0);
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.targetUsername && log.targetUsername.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = selectedActionFilter === 'ALL' || log.action === selectedActionFilter;
    return matchesSearch && matchesAction;
  });

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action)));

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-brand-400" />
            Security & System Audit Trail
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Immutable audit records of all administrative actions, staff mutations, and access logs.
          </p>
        </div>

        <button
          onClick={() => fetchLogs(page)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-card border border-surface-border text-xs text-white hover:border-brand-500 transition-all self-start sm:self-auto"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-brand-400' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by actor, target, or details..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder:text-ink-faint focus:outline-none focus:border-brand-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-ink-faint hidden sm:block" />
          <select
            value={selectedActionFilter}
            onChange={(e) => setSelectedActionFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 rounded-xl bg-surface border border-surface-border text-xs text-white focus:outline-none focus:border-brand-500 font-mono transition-all"
          >
            <option value="ALL">All Actions</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-surface-border">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-ink-muted">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mx-auto mb-2" />
            Loading audit logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-ink-muted">
            No audit records matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface/80 border-b border-surface-border text-ink-faint uppercase tracking-wider text-[10px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Log ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor (Performed By)</th>
                  <th className="py-3 px-4">Target Account</th>
                  <th className="py-3 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-ink-faint">#{log.id}</td>

                    <td className="py-3 px-4 font-mono text-ink-muted whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-surface border border-surface-border font-mono text-[11px] text-brand-400">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-white">
                      {log.performedBy}
                    </td>

                    <td className="py-3 px-4 font-mono text-ink-muted">
                      {log.targetUsername ? (
                        <span className="text-white">{log.targetUsername}</span>
                      ) : (
                        <span className="text-ink-faint">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-ink-muted max-w-md">
                      {log.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-surface-border flex items-center justify-between text-xs text-ink-muted">
            <span>
              Page {page + 1} of {totalPages} ({totalElements} total entries)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchLogs(page - 1)}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border disabled:opacity-40 hover:text-white"
              >
                Previous
              </button>
              <button
                onClick={() => fetchLogs(page + 1)}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border disabled:opacity-40 hover:text-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
