import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  LifeBuoy,
  MessageSquare,
} from 'lucide-react';
import { Badge, Card, Skeleton } from '../../components/ui';
import { api } from '../../lib/api';
import { useComplaints } from '../../lib/queries';
import type { ComplaintDto, ComplaintStatus } from '../../lib/types';
import { useToast } from '../../state/toast';

export default function Grievances() {
  const { data: complaints, isLoading, refetch } = useComplaints();
  const { push } = useToast();

  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [actionItem, setActionItem] = useState<ComplaintDto | null>(null);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('IN_PROGRESS');
  const [resolutionText, setResolutionText] = useState('');
  const [updating, setUpdating] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  const list = complaints || [];
  const openCount = list.filter((c) => c.status === 'OPEN').length;
  const inProgressCount = list.filter((c) => c.status === 'IN_PROGRESS').length;
  const resolvedCount = list.filter((c) => c.status === 'RESOLVED').length;

  const filtered = list.filter((c) => {
    const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
    const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;
    return matchesStatus && matchesCategory;
  });

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionItem) return;

    try {
      setUpdating(true);
      await api.put(`/complaints/${actionItem.id}/status`, {
        status: newStatus,
        resolution: resolutionText.trim() || null,
      });
      push({ tone: 'success', message: `Grievance status updated to ${newStatus}` });
      setActionItem(null);
      setResolutionText('');
      refetch();
    } catch (err) {
      push({ tone: 'error', message: 'Failed to update grievance. Please verify input.' });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'OPEN':
        return <Badge tone="red">Open</Badge>;
      case 'IN_PROGRESS':
        return <Badge tone="amber">In Progress</Badge>;
      case 'RESOLVED':
        return <Badge tone="teal">Resolved</Badge>;
      case 'REJECTED':
        return <Badge tone="slate">Rejected</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-5 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
            Student Affairs
          </span>
          <span className="text-xs text-slate-400">Grievance Redressal</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Student Grievance Review & Escalation
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Review, escalate, and resolve student complaints regarding academics, facilities, fees, and attendance.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="rounded-2xl bg-rose-500/10 p-3 text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Open Grievances</p>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{openCount}</p>
            <p className="text-[11px] text-slate-400">Require immediate triage</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-600 dark:text-amber-400">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Under Investigation</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{inProgressCount}</p>
            <p className="text-[11px] text-slate-400">Assigned / In Progress</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Resolved Grievances</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{resolvedCount}</p>
            <p className="text-[11px] text-slate-400">Completed with remarks</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-medium">Status:</span>
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                selectedStatus === st
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-medium">Category:</span>
          {['ALL', 'ACADEMIC', 'ATTENDANCE', 'FEES', 'FACILITIES', 'OTHER'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {filtered.map((c) => (
          <Card key={c.id} className="p-6 transition hover:shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {getStatusBadge(c.status)}
                  <Badge tone="violet">{c.category}</Badge>
                  <span className="text-xs text-slate-400">
                    Raised by <strong className="text-slate-600 dark:text-slate-300">{c.submittedByName}</strong>
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">{c.title}</h3>
              </div>
              <button
                onClick={() => {
                  setActionItem(c);
                  setNewStatus(c.status === 'OPEN' ? 'IN_PROGRESS' : 'RESOLVED');
                  setResolutionText(c.resolution || '');
                }}
                className="self-start rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-ink-800 dark:text-slate-200 transition"
              >
                Review & Action &rarr;
              </button>
            </div>

            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {c.description}
            </p>

            {c.resolution && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-xs text-emerald-900 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-300">
                <p className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Resolution Note:
                </p>
                <p className="mt-0.5">{c.resolution}</p>
              </div>
            )}
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-white/10 dark:text-slate-400">
            <LifeBuoy className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <p className="font-semibold">No student grievances matching selected criteria.</p>
          </div>
        )}
      </div>

      {/* Action Dialog */}
      {actionItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-ink-800 animate-scale-in">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-brand-500" />
              Update Grievance #{actionItem.id}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              "{actionItem.title}" — submitted by {actionItem.submittedByName}
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Update Status *
                </label>
                <div className="grid grid-cols-4 gap-2 mt-1.5">
                  {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'] as const).map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setNewStatus(st)}
                      className={`rounded-xl py-2 text-xs font-bold transition border ${
                        newStatus === st
                          ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                          : 'border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Resolution / Administrative Action Remark
                </label>
                <textarea
                  rows={4}
                  placeholder="Explain the findings or resolution provided to the student..."
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setActionItem(null)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-500 disabled:opacity-50 transition"
                >
                  {updating ? 'Saving...' : 'Save Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
