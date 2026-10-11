import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Save, Trophy, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Async, Badge, Button, Card, CardHeader, EmptyState, PageHeader, Progress, Stat } from '../../components/ui';
import { api } from '../../lib/api';
import { pct } from '../../lib/format';
import { keys, useClassStudents, useTeacherAssignments, useTeacherMarks } from '../../lib/queries';
import type { AssessmentType, MarkEntry } from '../../lib/types';
import { useToast } from '../../state/toast';

const assessmentDefaults: Record<AssessmentType, number> = {
  MIDTERM: 50,
  INTERNAL: 20,
  ASSIGNMENT: 25,
  PRACTICAL: 50,
};

const assessmentLabels: Record<AssessmentType, string> = {
  MIDTERM: 'Midterm Examination',
  INTERNAL: 'Internal Assessment',
  ASSIGNMENT: 'Coursework / Assignment',
  PRACTICAL: 'Practical Lab Assessment',
};

export default function TeacherMarks() {
  const [params, setSearchParams] = useSearchParams();
  const assignmentsQ = useTeacherAssignments();
  const qc = useQueryClient();
  const toast = useToast();

  const assignments = assignmentsQ.data ?? [];
  const defaultAssignment = assignments[0];

  const selectedClassId = params.get('classId') ? Number(params.get('classId')) : defaultAssignment?.classId;
  const selectedSubjectId = params.get('subjectId') ? Number(params.get('subjectId')) : defaultAssignment?.subjectId;
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('MIDTERM');
  const [maxMarks, setMaxMarks] = useState<number>(assessmentDefaults.MIDTERM);

  const currentAssignment = assignments.find(
    (a) => a.classId === selectedClassId && a.subjectId === selectedSubjectId
  );

  const studentsQ = useClassStudents(selectedClassId);
  const marksQ = useTeacherMarks(selectedClassId, selectedSubjectId);

  // Local state for entered marks
  const [scores, setScores] = useState<Record<number, number>>({});

  // When assessment type or existing marks change, initialize score state
  useEffect(() => {
    if (marksQ.data) {
      const filtered = marksQ.data.filter((m) => m.assessmentType === assessmentType);
      const initial: Record<number, number> = {};
      filtered.forEach((m) => {
        initial[m.studentId] = m.marks;
        if (m.maxMarks) setMaxMarks(m.maxMarks);
      });
      setScores(initial);
    }
  }, [marksQ.data, assessmentType]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClassId || !selectedSubjectId) return;
      const entries: MarkEntry[] = Object.entries(scores)
        .filter(([_, val]) => val !== undefined && val !== null && !isNaN(val))
        .map(([studentId, marks]) => ({
          studentId: Number(studentId),
          marks: Number(marks),
        }));

      return api.put<{ saved: number }>('/teachers/me/marks', {
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        assessmentType,
        maxMarks: Number(maxMarks),
        entries,
      });
    },
    onSuccess: (data) => {
      toast.push({
        tone: 'success',
        title: 'Marks Saved',
        message: `Successfully saved marks for ${data?.saved ?? 0} students.`,
      });
      if (selectedClassId && selectedSubjectId) {
        void qc.invalidateQueries({
          queryKey: keys.teacherMarks(selectedClassId, selectedSubjectId),
        });
      }
    },
    onError: (err: Error) => {
      toast.push({ tone: 'error', title: 'Failed to Save Marks', message: err.message });
    },
  });

  const studentsList = studentsQ.data ?? [];
  const enteredScores = Object.values(scores).filter((s) => s !== undefined && !isNaN(s));
  const count = enteredScores.length;
  const avgScore = count > 0 ? (enteredScores.reduce((a, b) => a + b, 0) / count).toFixed(1) : '0';
  const highestScore = count > 0 ? Math.max(...enteredScores) : 0;
  const passingCount = enteredScores.filter((s) => s >= maxMarks * 0.4).length;
  const passRate = count > 0 ? Math.round((passingCount / count) * 100) : 0;

  // CSV Export
  const exportCsv = () => {
    if (!currentAssignment || studentsList.length === 0) return;
    const header = [
      `Academic Marks Report`,
      `${currentAssignment.className} - ${currentAssignment.subjectName} (${currentAssignment.subjectCode})`,
      `Assessment,${assessmentLabels[assessmentType]}`,
      `Maximum Marks,${maxMarks}`,
      `Generated,${new Date().toISOString().slice(0, 10)}`,
      `Average Score,${avgScore} / ${maxMarks}`,
      `Pass Rate,${passRate}%`,
      ``,
      `Roll No,Student Name,Marks Obtained,Max Marks,Percentage,Result`,
    ];

    const rows = studentsList.map((s) => {
      const score = scores[s.id] ?? 0;
      const percentage = maxMarks > 0 ? ((score / maxMarks) * 100).toFixed(1) : '0';
      const result = score >= maxMarks * 0.4 ? 'PASS' : 'FAIL';
      return `"${s.rollNo}","${s.fullName}",${score},${maxMarks},${percentage}%,${result}`;
    });

    const csvContent = [...header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `marks-${currentAssignment.className.toLowerCase()}-${assessmentType.toLowerCase()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marks & Academic Evaluation"
        subtitle="Record assessment scores, evaluate exam performances, and export academic grade rosters."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={Download}
              size="sm"
              onClick={exportCsv}
              disabled={studentsList.length === 0}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              icon={Save}
              size="sm"
              loading={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
              disabled={studentsList.length === 0}
            >
              Save Marks
            </Button>
          </div>
        }
      />

      {/* Selector Card */}
      <Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
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

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Assessment Type
            </label>
            <select
              className="input py-2 text-sm"
              value={assessmentType}
              onChange={(e) => {
                const nextType = e.target.value as AssessmentType;
                setAssessmentType(nextType);
                setMaxMarks(assessmentDefaults[nextType]);
              }}
            >
              <option value="MIDTERM">Midterm Exam (Max 50)</option>
              <option value="INTERNAL">Internal Assessment (Max 20)</option>
              <option value="ASSIGNMENT">Coursework / Assignment (Max 25)</option>
              <option value="PRACTICAL">Practical Lab Exam (Max 50)</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Max Marks (Scale)
            </label>
            <input
              type="number"
              min={1}
              max={200}
              className="input py-2 text-sm"
              value={maxMarks}
              onChange={(e) => setMaxMarks(Number(e.target.value))}
            />
          </div>
        </div>
      </Card>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Graded Students" value={`${count} / ${studentsList.length}`} hint="Records entered" icon={Users} tone="slate" />
        <Stat label="Class Average" value={`${avgScore}`} hint={`Out of ${maxMarks}`} icon={Trophy} tone="teal" />
        <Stat label="Highest Score" value={`${highestScore}`} hint="Top mark achieved" icon={Trophy} tone="violet" />
        <Stat label="Passing Rate" value={`${passRate}%`} hint={`${passingCount} students ≥ 40%`} icon={Trophy} tone={passRate >= 75 ? 'green' : 'amber'} />
      </div>

      {/* Marks Entry Grid */}
      <Card>
        <CardHeader
          title={currentAssignment ? `${currentAssignment.className} — ${assessmentLabels[assessmentType]}` : 'Grade Entry'}
          subtitle={`Enter numeric marks between 0 and ${maxMarks} for each student.`}
        />

        <Async query={studentsQ}>
          {(list) =>
            list.length === 0 ? (
              <EmptyState
                icon={Trophy}
                title="No students found"
                text="There are no students registered in this class group."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200/80 text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
                      <th className="pb-3 font-semibold">Roll No</th>
                      <th className="pb-3 font-semibold">Student Name</th>
                      <th className="pb-3 font-semibold">Score / {maxMarks}</th>
                      <th className="pb-3 font-semibold">Progress</th>
                      <th className="pb-3 text-right font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {list.map((student) => {
                      const score = scores[student.id];
                      const val = score ?? 0;
                      const percentage = maxMarks > 0 ? (val / maxMarks) * 100 : 0;
                      const isPassing = val >= maxMarks * 0.4;
                      return (
                        <tr key={student.id} className="transition hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                          <td className="py-3 font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">
                            {student.rollNo}
                          </td>
                          <td className="py-3 font-medium text-slate-900 dark:text-white">
                            {student.fullName}
                          </td>
                          <td className="py-3 w-40">
                            <input
                              type="number"
                              min={0}
                              max={maxMarks}
                              step={0.5}
                              value={score !== undefined ? score : ''}
                              placeholder="0"
                              onChange={(e) => {
                                const numVal = parseFloat(e.target.value);
                                setScores((prev) => ({
                                  ...prev,
                                  [student.id]: isNaN(numVal) ? 0 : Math.min(maxMarks, Math.max(0, numVal)),
                                }));
                              }}
                              className="input w-28 py-1.5 px-3 font-mono font-medium"
                            />
                          </td>
                          <td className="py-3 w-48">
                            <div className="flex items-center gap-3">
                              <Progress
                                value={percentage}
                                tone={percentage >= 75 ? 'green' : percentage >= 40 ? 'teal' : 'red'}
                              />
                              <span className="text-xs font-semibold text-slate-500 w-12 text-right">
                                {pct(percentage, 0)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            <Badge tone={score === undefined ? 'slate' : isPassing ? 'green' : 'red'}>
                              {score === undefined ? 'Pending' : isPassing ? 'Pass' : 'Needs Support'}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          }
        </Async>
      </Card>
    </div>
  );
}
