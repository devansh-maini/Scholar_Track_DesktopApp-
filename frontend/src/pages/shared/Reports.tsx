import { useMemo, useState } from 'react';
import { ReportCard } from '../../components/common';
import { Field, PageHeader } from '../../components/ui';
import { useClasses, useSubjects, useTeaching } from '../../lib/staff';
import { useAuth } from '../../state/auth';

/** Report downloads for teachers (their own classes only) and the HOD (everything). The server enforces the same rules. */
export default function StaffReports() {
  const { user } = useAuth();
  const isHod = user?.role === 'HOD';
  const allClasses = useClasses();
  const allSubjects = useSubjects();
  const teaching = useTeaching();
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');

  const classes = useMemo(() => {
    if (isHod) return (allClasses.data ?? []).map((c) => ({ id: c.id, label: c.name }));
    const m = new Map<number, string>(); (teaching.data ?? []).forEach((a) => m.set(a.classId, a.className));
    return [...m.entries()].map(([id, label]) => ({ id, label }));
  }, [isHod, allClasses.data, teaching.data]);
  const subjects = useMemo(() => {
    if (isHod) return (allSubjects.data ?? []).map((s) => ({ id: s.id, label: `${s.code} · ${s.name}` }));
    const m = new Map<number, string>();
    (teaching.data ?? []).filter((a) => !classId || String(a.classId) === classId).forEach((a) => m.set(a.subjectId, `${a.subjectCode} · ${a.subjectName}`));
    return [...m.entries()].map(([id, label]) => ({ id, label }));
  }, [isHod, allSubjects.data, teaching.data, classId]);

  const cq = classId ? `classId=${classId}` : '';
  const mq = [classId && `classId=${classId}`, subjectId && `subjectId=${subjectId}`].filter(Boolean).join('&');
  // A teacher with several classes must pick one, otherwise the server has nothing specific to export.
  const needClass = !isHod && classId === '';

  return (
    <div>
      <PageHeader title="Reports" subtitle={isHod ? 'Download official reports as PDF, Excel or CSV. They use the same records and formulas as every screen.' : 'Download reports for the classes you teach. You cannot export other teachers\u2019 classes.'} />
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <Field label="Class filter">
          <select className="input min-w-56" value={classId} onChange={(e) => { setClassId(e.target.value); setSubjectId(''); }}>
            <option value="">{isHod ? 'All classes' : 'Choose a class…'}</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </Field>
        <Field label="Subject filter (marks report)">
          <select className="input min-w-64" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">All subjects</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </Field>
      </div>
      {needClass && <p className="mb-4 text-sm text-amber-700 dark:text-amber-300">Choose a class first to enable the downloads.</p>}
      <div className={`grid gap-5 md:grid-cols-2 ${needClass ? 'pointer-events-none opacity-50' : ''}`}>
        <ReportCard title="Attendance report" text="Every student's attended and total classes with percentage per subject." path="/reports/attendance" query={cq} />
        <ReportCard title="Marks report" text="Marks for each assessment, with percentages. Filter by subject above." path="/reports/marks" query={mq} />
        <ReportCard title="Assignment report" text="Submission and evaluation status for every assignment." path="/reports/assignments" query={cq} />
        {isHod && <ReportCard title="Department performance" text="Attendance, SGPA, CGPA and risk for every student in the department." path="/reports/department" />}
        {isHod && <ReportCard title="Fee report" text="Billed, paid and outstanding fees, with overdue entries flagged." path="/reports/fees" />}
      </div>
    </div>
  );
}
