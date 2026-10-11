import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ClipboardList, Clock, FileCheck, Plus, Send, Users,
} from 'lucide-react';
import { useState } from 'react';
import {
  Async, Badge, Button, Card, CardHeader, EmptyState, Field,
  Modal, PageHeader,
} from '../../components/ui';
import type { Tone } from '../../components/ui';
import { api } from '../../lib/api';
import { fmtDate, fmtDateTime } from '../../lib/format';
import {
  keys, useCourseworkSubmissions, useTeacherAssignments,
  useTeacherCoursework,
} from '../../lib/queries';
import type { CourseworkDto, SubmissionDto } from '../../lib/types';
import { useToast } from '../../state/toast';

const submissionTone: Record<string, Tone> = {
  SUBMITTED: 'blue',
  LATE: 'red',
  EVALUATED: 'green',
};

export default function TeacherAssignments() {
  const qc = useQueryClient();
  const toast = useToast();
  const courseworkQ = useTeacherCoursework();
  const assignmentsQ = useTeacherAssignments();

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedCw, setSelectedCw] = useState<CourseworkDto | null>(null);
  const [evaluatingSub, setEvaluatingSub] = useState<SubmissionDto | null>(null);

  // Form state for creating coursework
  const [formClassSubject, setFormClassSubject] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formMaxMarks, setFormMaxMarks] = useState(25);

  // Form state for evaluating submission
  const [evalMarks, setEvalMarks] = useState<number>(0);
  const [evalFeedback, setEvalFeedback] = useState('');

  const submissionsQ = useCourseworkSubmissions(selectedCw?.id);

  // Create coursework mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const [classIdStr, subjectIdStr] = formClassSubject.split(':');
      if (!classIdStr || !subjectIdStr) throw new Error('Please select a class and subject.');
      if (!formTitle.trim()) throw new Error('Please enter a title.');
      if (!formDeadline) throw new Error('Please select a deadline.');

      return api.post('/teachers/me/coursework', {
        classId: Number(classIdStr),
        subjectId: Number(subjectIdStr),
        title: formTitle.trim(),
        description: formDesc.trim() || undefined,
        deadline: new Date(formDeadline).toISOString().slice(0, 19),
        maxMarks: Number(formMaxMarks),
      });
    },
    onSuccess: () => {
      toast.push({
        tone: 'success',
        title: 'Assignment Created',
        message: 'Your coursework was successfully published to students.',
      });
      setCreateOpen(false);
      setFormTitle('');
      setFormDesc('');
      setFormDeadline('');
      void qc.invalidateQueries({ queryKey: keys.teacherCoursework });
    },
    onError: (err: Error) => {
      toast.push({ tone: 'error', title: 'Could not create', message: err.message });
    },
  });

  // Evaluate submission mutation
  const evaluateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCw || !evaluatingSub) return;
      return api.put(
        `/teachers/me/coursework/${selectedCw.id}/submissions/${evaluatingSub.id}/evaluate`,
        {
          marks: Number(evalMarks),
          feedback: evalFeedback.trim() || undefined,
        }
      );
    },
    onSuccess: () => {
      toast.push({
        tone: 'success',
        title: 'Submission Evaluated',
        message: 'Grade and feedback recorded successfully.',
      });
      setEvaluatingSub(null);
      if (selectedCw) {
        void qc.invalidateQueries({
          queryKey: keys.courseworkSubmissions(selectedCw.id),
        });
      }
    },
    onError: (err: Error) => {
      toast.push({ tone: 'error', title: 'Failed to Evaluate', message: err.message });
    },
  });

  const teachingAssignments = assignmentsQ.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coursework & Submissions"
        subtitle="Publish assignments, review submitted student work, and award grades with personalized feedback."
        actions={
          <Button
            variant="primary"
            icon={Plus}
            size="sm"
            onClick={() => {
              if (teachingAssignments.length > 0 && !formClassSubject) {
                setFormClassSubject(`${teachingAssignments[0]?.classId}:${teachingAssignments[0]?.subjectId}`);
              }
              setCreateOpen(true);
            }}
          >
            Create Assignment
          </Button>
        }
      />

      {/* Main Coursework List */}
      <Async query={courseworkQ}>
        {(list) =>
          list.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No assignments created yet"
              text="Create your first coursework assignment so students can submit their solutions online."
              action={
                <Button
                  icon={Plus}
                  size="sm"
                  onClick={() => {
                    if (teachingAssignments.length > 0 && !formClassSubject) {
                      setFormClassSubject(`${teachingAssignments[0]?.classId}:${teachingAssignments[0]?.subjectId}`);
                    }
                    setCreateOpen(true);
                  }}
                >
                  Create Coursework
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {list.map((cw) => {
                const isSelected = selectedCw?.id === cw.id;
                return (
                  <Card
                    key={cw.id}
                    hover
                    className={`cursor-pointer transition ${
                      isSelected ? 'ring-2 ring-brand-500 shadow-md' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-brand-500/10 px-2 py-0.5 text-xs font-semibold text-brand-600 dark:text-brand-400">
                            {cw.className}
                          </span>
                          <span className="text-xs font-mono text-slate-400">{cw.subjectCode}</span>
                        </div>
                        <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                          {cw.title}
                        </h3>
                        <p className="text-xs text-slate-500">{cw.subjectName}</p>
                      </div>
                      <Badge tone={cw.submissionCount > 0 ? 'teal' : 'slate'}>
                        {cw.submissionCount} submissions
                      </Badge>
                    </div>

                    {cw.description && (
                      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                        {cw.description}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 dark:border-white/5">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> Due {fmtDate(cw.deadline)}
                        </span>
                        <span>·</span>
                        <span>Max {cw.maxMarks} marks</span>
                      </div>
                      <Button
                        variant={isSelected ? 'primary' : 'secondary'}
                        size="sm"
                        icon={Users}
                        onClick={() => setSelectedCw(isSelected ? null : cw)}
                      >
                        {isSelected ? 'Close Submissions' : 'Review Submissions'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )
        }
      </Async>

      {/* Selected Coursework Submissions Drawer */}
      {selectedCw && (
        <Card className="animate-fade-in border-brand-500/20">
          <CardHeader
            title={`Submissions for: ${selectedCw.title}`}
            subtitle={`Class: ${selectedCw.className} · Max Marks: ${selectedCw.maxMarks}`}
            action={
              <Button variant="ghost" size="sm" onClick={() => setSelectedCw(null)}>
                Dismiss
              </Button>
            }
          />

          <Async query={submissionsQ}>
            {(subs) =>
              subs.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No submissions yet"
                  text="Students have not submitted answers for this assignment yet."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200/80 text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
                        <th className="pb-3 font-semibold">Roll No</th>
                        <th className="pb-3 font-semibold">Student</th>
                        <th className="pb-3 font-semibold">Submitted Answer / Work</th>
                        <th className="pb-3 font-semibold">Timestamp</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 text-right font-semibold">Score</th>
                        <th className="pb-3 text-right font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {subs.map((s) => (
                        <tr key={s.id} className="transition hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                          <td className="py-3 font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">
                            {s.rollNo}
                          </td>
                          <td className="py-3 font-medium text-slate-900 dark:text-white">
                            {s.studentName}
                          </td>
                          <td className="py-3 max-w-xs truncate text-slate-600 dark:text-slate-300">
                            {s.content}
                          </td>
                          <td className="py-3 text-xs text-slate-500">
                            {fmtDateTime(s.submittedAt)}
                          </td>
                          <td className="py-3">
                            <Badge tone={submissionTone[s.status] ?? 'slate'}>
                              {s.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-100">
                            {s.marks !== null ? `${s.marks} / ${selectedCw.maxMarks}` : '—'}
                          </td>
                          <td className="py-3 text-right">
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={FileCheck}
                              onClick={() => {
                                setEvaluatingSub(s);
                                setEvalMarks(s.marks ?? 0);
                                setEvalFeedback(s.feedback ?? '');
                              }}
                            >
                              {s.marks !== null ? 'Re-grade' : 'Evaluate'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </Async>
        </Card>
      )}

      {/* Modal: Create Coursework */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create New Assignment"
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
              Publish Assignment
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Class & Subject">
            <select
              className="input py-2 text-sm"
              value={formClassSubject}
              onChange={(e) => setFormClassSubject(e.target.value)}
            >
              {teachingAssignments.map((a) => (
                <option key={`${a.classId}:${a.subjectId}`} value={`${a.classId}:${a.subjectId}`}>
                  {a.className} — {a.subjectCode}: {a.subjectName}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Assignment Title" hint="e.g. Lab Assignment 2 - Dynamic Programming">
            <input
              type="text"
              maxLength={150}
              className="input text-sm"
              placeholder="Enter descriptive title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />
          </Field>

          <Field label="Instructions & Description" hint="Provide submission guidelines or link to problem statement">
            <textarea
              className="input min-h-24 resize-y text-sm"
              maxLength={2000}
              placeholder="Explain required deliverables, repository structure, or submission formats..."
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Deadline">
              <input
                type="datetime-local"
                className="input text-sm"
                value={formDeadline}
                onChange={(e) => setFormDeadline(e.target.value)}
              />
            </Field>

            <Field label="Maximum Marks">
              <input
                type="number"
                min={1}
                max={100}
                className="input text-sm"
                value={formMaxMarks}
                onChange={(e) => setFormMaxMarks(Number(e.target.value))}
              />
            </Field>
          </div>
        </div>
      </Modal>

      {/* Modal: Evaluate Submission */}
      <Modal
        open={evaluatingSub !== null}
        onClose={() => setEvaluatingSub(null)}
        title={`Evaluate: ${evaluatingSub?.studentName} (${evaluatingSub?.rollNo})`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEvaluatingSub(null)}>
              Cancel
            </Button>
            <Button
              icon={Send}
              loading={evaluateMutation.isPending}
              onClick={() => evaluateMutation.mutate()}
            >
              Submit Grade & Feedback
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Submitted Work / Link
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white break-all select-all">
              {evaluatingSub?.content}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Submitted at: {evaluatingSub?.submittedAt ? fmtDateTime(evaluatingSub.submittedAt) : ''} · Status:{' '}
              <span className="font-semibold">{evaluatingSub?.status}</span>
            </p>
          </div>

          <Field label={`Marks (Max ${selectedCw?.maxMarks})`}>
            <input
              type="number"
              min={0}
              max={selectedCw?.maxMarks ?? 100}
              step={0.5}
              className="input text-sm"
              value={evalMarks}
              onChange={(e) => setEvalMarks(Number(e.target.value))}
            />
          </Field>

          <Field label="Teacher Feedback & Comments" hint="Guidance for the student on how to improve">
            <textarea
              className="input min-h-24 resize-y text-sm"
              maxLength={1000}
              placeholder="Great work on algorithm complexity, consider handling edge cases..."
              value={evalFeedback}
              onChange={(e) => setEvalFeedback(e.target.value)}
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
