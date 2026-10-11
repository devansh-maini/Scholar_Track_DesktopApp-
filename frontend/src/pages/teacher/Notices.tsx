import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Megaphone, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  Async, Badge, Button, Card, EmptyState, Field,
  Modal, PageHeader, Tabs,
} from '../../components/ui';
import type { Tone } from '../../components/ui';
import { api } from '../../lib/api';
import { fmtDate } from '../../lib/format';
import { keys, useNotices, useTeacherAssignments, useTeacherMe } from '../../lib/queries';
import type { NoticePriority, NoticeTarget, Priority } from '../../lib/types';
import { useToast } from '../../state/toast';

const priorityTone: Record<Priority, Tone> = {
  NORMAL: 'slate',
  IMPORTANT: 'amber',
  URGENT: 'red',
};

export default function TeacherNotices() {
  const qc = useQueryClient();
  const toast = useToast();
  const noticesQ = useNotices();
  const teacherMeQ = useTeacherMe();
  const assignmentsQ = useTeacherAssignments();

  const [tab, setTab] = useState<'ALL' | 'URGENT' | 'IMPORTANT' | 'NORMAL'>('ALL');
  const [createOpen, setCreateOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<NoticePriority>('NORMAL');
  const [targetType, setTargetType] = useState<NoticeTarget>('ALL');
  const [targetId, setTargetId] = useState<number | null>(null);
  const [expiryDate, setExpiryDate] = useState('');

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error('Please enter a notice title.');
      if (!description.trim()) throw new Error('Please enter notice description.');

      return api.post('/notices', {
        title: title.trim(),
        description: description.trim(),
        priority,
        targetType,
        targetId: targetId || undefined,
        expiryDate: expiryDate ? expiryDate : undefined,
      });
    },
    onSuccess: () => {
      toast.push({ tone: 'success', title: 'Notice Published', message: 'The circular has been posted successfully.' });
      setCreateOpen(false);
      setTitle('');
      setDescription('');
      setExpiryDate('');
      void qc.invalidateQueries({ queryKey: keys.notices });
    },
    onError: (err: Error) => {
      toast.push({ tone: 'error', title: 'Publication Failed', message: err.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.del(`/notices/${id}`);
    },
    onSuccess: () => {
      toast.push({ tone: 'success', title: 'Notice Deleted', message: 'The notice was removed.' });
      void qc.invalidateQueries({ queryKey: keys.notices });
    },
    onError: (err: Error) => {
      toast.push({ tone: 'error', title: 'Delete Failed', message: err.message });
    },
  });

  const myFullName = teacherMeQ.data?.fullName;
  const assignments = assignmentsQ.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Notices & Circulars"
        subtitle="Publish announcements to your classes or department, and view institutional circulars."
        actions={
          <Button variant="primary" icon={Plus} size="sm" onClick={() => setCreateOpen(true)}>
            Publish Circular
          </Button>
        }
      />

      <Async query={noticesQ}>
        {(list) => {
          const filtered = list.filter((n) => (tab === 'ALL' ? true : n.priority === tab));
          return (
            <div className="space-y-5">
              <Tabs
                value={tab}
                onChange={setTab}
                options={[
                  { value: 'ALL', label: 'All Notices', count: list.length },
                  { value: 'URGENT', label: 'Urgent', count: list.filter((n) => n.priority === 'URGENT').length },
                  { value: 'IMPORTANT', label: 'Important', count: list.filter((n) => n.priority === 'IMPORTANT').length },
                  { value: 'NORMAL', label: 'General', count: list.filter((n) => n.priority === 'NORMAL').length },
                ]}
              />

              {filtered.length === 0 ? (
                <EmptyState
                  icon={Megaphone}
                  title="No notices found"
                  text="No announcements match the selected priority filter."
                  action={
                    <Button size="sm" icon={Plus} onClick={() => setCreateOpen(true)}>
                      Publish First Notice
                    </Button>
                  }
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {filtered.map((notice) => {
                    const isAuthor = myFullName && notice.authorName === myFullName;
                    return (
                      <Card key={notice.id} hover className="flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white leading-snug">
                              {notice.title}
                            </h3>
                            <Badge tone={priorityTone[notice.priority]}>{notice.priority}</Badge>
                          </div>
                          <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                            {notice.description}
                          </p>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400 dark:border-white/5">
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {notice.authorName}
                            </span>{' '}
                            ({notice.authorRole}) · {fmtDate(notice.createdAt)} · Target:{' '}
                            <span className="font-semibold">{notice.targetLabel}</span>
                          </div>

                          {isAuthor && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 p-1"
                              onClick={() => deleteMutation.mutate(notice.id)}
                              loading={deleteMutation.isPending}
                              title="Delete notice"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }}
      </Async>

      {/* Modal: Publish Notice */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Publish Circular / Announcement"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              icon={Plus}
              loading={createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              Publish Announcement
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Circular Title" hint="Keep it clear and actionable">
            <input
              type="text"
              maxLength={150}
              className="input text-sm"
              placeholder="e.g. Schedule for Midterm Practical Submissions"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Priority Level">
              <select
                className="input py-2 text-sm"
                value={priority}
                onChange={(e) => setPriority(e.target.value as NoticePriority)}
              >
                <option value="NORMAL">General (Normal)</option>
                <option value="IMPORTANT">Important</option>
                <option value="URGENT">Urgent (Immediate)</option>
              </select>
            </Field>

            <Field label="Audience Target">
              <select
                className="input py-2 text-sm"
                value={targetType}
                onChange={(e) => {
                  const val = e.target.value as NoticeTarget;
                  setTargetType(val);
                  if (val === 'CLASS' && assignments.length > 0) {
                    setTargetId(assignments[0]?.classId ?? null);
                  } else {
                    setTargetId(null);
                  }
                }}
              >
                <option value="ALL">Entire Campus</option>
                <option value="DEPARTMENT">My Department</option>
                <option value="CLASS">Specific Class Cohort</option>
              </select>
            </Field>
          </div>

          {targetType === 'CLASS' && (
            <Field label="Target Class">
              <select
                className="input py-2 text-sm"
                value={targetId ?? ''}
                onChange={(e) => setTargetId(Number(e.target.value))}
              >
                {Array.from(new Set(assignments.map((a) => a.classId))).map((cid) => {
                  const match = assignments.find((a) => a.classId === cid);
                  return (
                    <option key={cid} value={cid}>
                      {match?.className}
                    </option>
                  );
                })}
              </select>
            </Field>
          )}

          <Field label="Detailed Description">
            <textarea
              className="input min-h-28 resize-y text-sm"
              maxLength={4000}
              placeholder="Enter complete circular text, instructions, venues, dates, or guidelines..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>

          <Field label="Expiry Date (Optional)" hint="Notice will automatically archive after this date">
            <input
              type="date"
              className="input text-sm"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
