import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Circle, ListChecks, Plus } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Ring, pctColor } from '../../components/charts';
import {
  Async, Badge, Button, Card, CardHeader, EmptyState, Field,
  Modal, PageHeader, Stat,
} from '../../components/ui';
import { api } from '../../lib/api';
import { fmtDate, pct } from '../../lib/format';
import { keys, useClassSyllabus, useTeacherAssignments } from '../../lib/queries';
import { useToast } from '../../state/toast';

export default function TeacherSyllabus() {
  const [params, setSearchParams] = useSearchParams();
  const assignmentsQ = useTeacherAssignments();
  const qc = useQueryClient();
  const toast = useToast();

  const assignments = assignmentsQ.data ?? [];
  const defaultAssignment = assignments[0];

  const selectedClassId = params.get('classId') ? Number(params.get('classId')) : defaultAssignment?.classId;
  const selectedSubjectId = params.get('subjectId') ? Number(params.get('subjectId')) : defaultAssignment?.subjectId;

  const syllabusQ = useClassSyllabus(selectedClassId, selectedSubjectId);

  const [addOpen, setAddOpen] = useState(false);
  const [unitNo, setUnitNo] = useState<number>(1);
  const [topicTitle, setTopicTitle] = useState('');

  // Toggle topic progress mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ topicId, completed }: { topicId: number; completed: boolean }) => {
      if (!selectedClassId || !selectedSubjectId) return;
      return api.put(
        `/teachers/me/classes/${selectedClassId}/subjects/${selectedSubjectId}/syllabus/${topicId}`,
        { completed }
      );
    },
    onSuccess: () => {
      toast.push({ tone: 'success', title: 'Progress Updated', message: 'Syllabus progress status saved.' });
      if (selectedClassId && selectedSubjectId) {
        void qc.invalidateQueries({
          queryKey: keys.classSyllabus(selectedClassId, selectedSubjectId),
        });
      }
    },
    onError: (err: Error) => {
      toast.push({ tone: 'error', title: 'Update Failed', message: err.message });
    },
  });

  // Add topic mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSubjectId) return;
      if (!topicTitle.trim()) throw new Error('Please enter a topic title.');
      return api.post(`/teachers/me/subjects/${selectedSubjectId}/syllabus`, {
        unitNo: Number(unitNo),
        title: topicTitle.trim(),
      });
    },
    onSuccess: () => {
      toast.push({ tone: 'success', title: 'Topic Added', message: 'New curriculum topic added to syllabus.' });
      setAddOpen(false);
      setTopicTitle('');
      if (selectedClassId && selectedSubjectId) {
        void qc.invalidateQueries({
          queryKey: keys.classSyllabus(selectedClassId, selectedSubjectId),
        });
      }
    },
    onError: (err: Error) => {
      toast.push({ tone: 'error', title: 'Failed to Add', message: err.message });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Syllabus Progress Tracker"
        subtitle="Manage and track curriculum coverage, topic-by-topic, for your assigned courses."
        actions={
          <Button
            variant="primary"
            icon={Plus}
            size="sm"
            onClick={() => setAddOpen(true)}
            disabled={!selectedSubjectId}
          >
            Add Syllabus Topic
          </Button>
        }
      />

      {/* Class & Subject Selector */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-64">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Class & Subject
            </label>
            <select
              className="input py-2 text-sm"
              value={
                selectedClassId && selectedSubjectId
                  ? `${selectedClassId}:${selectedSubjectId}`
                  : ''
              }
              onChange={(e) => {
                const [cid, sid] = e.target.value.split(':');
                setSearchParams({ classId: cid!, subjectId: sid! });
              }}
            >
              {assignments.map((a) => (
                <option key={`${a.classId}:${a.subjectId}`} value={`${a.classId}:${a.subjectId}`}>
                  {a.className} — {a.subjectCode}: {a.subjectName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Async query={syllabusQ}>
        {(syl) => {
          const percent = syl.percentComplete ?? 0;
          return (
            <div className="space-y-6">
              {/* Top Overview Cards */}
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="flex flex-col items-center justify-center text-center p-6">
                  <Ring value={percent} size={150} stroke={13} color={pctColor(percent)}>
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">
                      {pct(percent, 0)}
                    </span>
                    <span className="text-xs text-slate-400">completed</span>
                  </Ring>
                  <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                    {syl.topicsDone} of {syl.topicsTotal} topics covered
                  </p>
                  <Badge tone={percent >= 80 ? 'green' : percent >= 50 ? 'teal' : 'amber'} className="mt-2.5">
                    {percent >= 100 ? 'Syllabus Completed' : `${syl.topicsTotal - syl.topicsDone} topics remaining`}
                  </Badge>
                </Card>

                <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
                  <Stat label="Total Curriculum Units" value={new Set(syl.topics.map((t) => t.unitNo)).size || 1} hint="Academic modules" icon={ListChecks} tone="teal" />
                  <Stat label="Completed Topics" value={syl.topicsDone} hint="Taught in lectures" icon={CheckCircle2} tone="green" />
                  <Stat label="Pending Topics" value={syl.topicsTotal - syl.topicsDone} hint="Scheduled ahead" icon={Circle} tone="amber" />
                  <Stat label="Subject Code" value={syl.subjectCode} hint={syl.subjectName} icon={ListChecks} tone="violet" />
                </div>
              </div>

              {/* Topics Checklist */}
              <Card>
                <CardHeader
                  title="Curriculum Topics Checklist"
                  subtitle="Click the circle toggle to mark topics as taught or pending for this class"
                />

                {syl.topics.length === 0 ? (
                  <EmptyState
                    icon={ListChecks}
                    title="No topics listed yet"
                    text="Add topics to the syllabus for this subject to start tracking progress."
                    action={
                      <Button size="sm" icon={Plus} onClick={() => setAddOpen(true)}>
                        Add First Topic
                      </Button>
                    }
                  />
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {syl.topics.map((topic) => (
                      <div
                        key={topic.id}
                        className="flex items-center justify-between gap-4 py-3.5 transition hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <button
                            type="button"
                            disabled={toggleMutation.isPending}
                            onClick={() =>
                              toggleMutation.mutate({
                                topicId: topic.id,
                                completed: !topic.completed,
                              })
                            }
                            className="rounded-full p-1 text-slate-400 hover:text-brand-600 transition"
                            aria-label="Toggle status"
                          >
                            {topic.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-500/20" />
                            ) : (
                              <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                            )}
                          </button>
                          <div className="min-w-0">
                            <p
                              className={`text-sm font-medium ${
                                topic.completed
                                  ? 'text-slate-500 line-through dark:text-slate-400'
                                  : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {topic.title}
                            </p>
                            <p className="text-xs text-slate-400">
                              Unit {topic.unitNo}
                              {topic.completedOn && ` · Completed on ${fmtDate(topic.completedOn)}`}
                            </p>
                          </div>
                        </div>

                        <Badge tone={topic.completed ? 'green' : 'slate'}>
                          {topic.completed ? 'Completed' : 'Pending'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          );
        }}
      </Async>

      {/* Modal: Add Topic */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Curriculum Topic"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              icon={Plus}
              loading={addMutation.isPending}
              disabled={!topicTitle.trim()}
              onClick={() => addMutation.mutate()}
            >
              Add Topic
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Unit Number">
            <input
              type="number"
              min={1}
              max={20}
              className="input text-sm"
              value={unitNo}
              onChange={(e) => setUnitNo(Number(e.target.value))}
            />
          </Field>

          <Field label="Topic Title" hint="e.g. Graph Traversals (BFS and DFS with Applications)">
            <input
              type="text"
              maxLength={200}
              className="input text-sm"
              placeholder="Enter topic title"
              value={topicTitle}
              onChange={(e) => setTopicTitle(e.target.value)}
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
