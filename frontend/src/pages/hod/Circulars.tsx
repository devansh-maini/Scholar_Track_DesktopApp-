import { useState } from 'react';
import { Calendar, Megaphone, Plus, Send } from 'lucide-react';
import { Badge, Card, Skeleton } from '../../components/ui';
import { api } from '../../lib/api';
import { useNotices } from '../../lib/queries';
import { useToast } from '../../state/toast';

export default function Circulars() {
  const { data: notices, isLoading, refetch } = useNotices();
  const { push } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'NORMAL' | 'IMPORTANT' | 'URGENT'>('NORMAL');
  const [targetType, setTargetType] = useState<'ALL' | 'DEPARTMENT' | 'CLASS'>('DEPARTMENT');
  const [expiryDate, setExpiryDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      push({ tone: 'error', message: 'Please provide both title and circular text' });
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/notices', {
        title: title.trim(),
        description: description.trim(),
        priority,
        targetType,
        targetId: null,
        expiryDate: expiryDate ? `${expiryDate}T23:59:59` : null,
      });
      push({ tone: 'success', message: 'Department circular published successfully' });
      setTitle('');
      setDescription('');
      setExpiryDate('');
      setShowModal(false);
      refetch();
    } catch (err) {
      push({ tone: 'error', message: 'Failed to issue circular. Please check input parameters.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const priorityBadge = (p: string) => {
    switch (p) {
      case 'URGENT':
        return <Badge tone="red">Urgent</Badge>;
      case 'IMPORTANT':
        return <Badge tone="amber">Important</Badge>;
      default:
        return <Badge tone="teal">Normal</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
              Department Communications
            </span>
            <span className="text-xs text-slate-400">Official Notices</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Department Circular Management
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Publish academic notices, meeting announcements, and official department circulars.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-500 transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Issue New Circular
        </button>
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-ink-800 animate-scale-in">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-brand-500" />
              Publish Department Circular
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              This notice will be visible on the bulletin boards of students and faculty.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Circular Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Mid-Term Examination Schedule & Guidelines"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['NORMAL', 'IMPORTANT', 'URGENT'] as const).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`rounded-xl py-2 text-xs font-bold transition border ${
                        priority === p
                          ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                          : 'border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Audience
                </label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['DEPARTMENT', 'ALL', 'CLASS'] as const).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setTargetType(t)}
                      className={`rounded-xl py-2 text-xs font-bold transition border ${
                        targetType === t
                          ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                          : 'border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400'
                      }`}
                    >
                      {t === 'DEPARTMENT' ? 'Department' : t === 'ALL' ? 'College-Wide' : 'Class Group'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Detailed Circular Text *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="State the instructions, deadlines, and contact details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-500 disabled:opacity-50 transition"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? 'Publishing...' : 'Publish Circular'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Notices List */}
      <div className="space-y-4">
        {notices && notices.length > 0 ? (
          notices.map((n) => (
            <Card key={n.id} className="p-6 transition hover:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {priorityBadge(n.priority)}
                    <Badge tone="violet">{n.targetLabel || n.targetType}</Badge>
                    <span className="text-xs text-slate-400">
                      By {n.authorName} ({n.authorRole})
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {n.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {n.expiryDate ? `Expires: ${n.expiryDate.slice(0, 10)}` : 'Permanent'}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {n.description}
              </p>
            </Card>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-white/10 dark:text-slate-400">
            <Megaphone className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <p className="font-semibold">No active circulars issued yet.</p>
            <p className="text-xs mt-1">Click the button above to publish your first department circular.</p>
          </div>
        )}
      </div>
    </div>
  );
}
