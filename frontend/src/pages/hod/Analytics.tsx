import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { TrendLine, ValueBars, pctColor } from '../../components/charts';
import { TableSkeleton, Td, TableWrap, Th } from '../../components/common';
import { Async, Badge, Card, CardHeader, PageHeader, Skeleton, Tabs, attendanceTone } from '../../components/ui';
import { api } from '../../lib/api';
import { num, pct } from '../../lib/format';
import { H } from '../../lib/staff';
import type { AttendancePoint, ClassStat, SemesterStat, SubjectStat } from '../../lib/types';

type Tab = 'SEMESTERS' | 'CLASSES' | 'SUBJECTS';
const sgpaColor = (v: number) => (v >= 7 ? '#10a595' : v >= 5.5 ? '#f59e0b' : '#ef4444');

export default function Analytics() {
  const [tab, setTab] = useState<Tab>('SEMESTERS');
  const sems = useQuery({ queryKey: [H, 'semesters'], queryFn: () => api.get<SemesterStat[]>('/hod/analytics/semesters') });
  const classes = useQuery({ queryKey: [H, 'classes'], queryFn: () => api.get<ClassStat[]>('/hod/analytics/classes') });
  const subjects = useQuery({ queryKey: [H, 'subjects'], queryFn: () => api.get<SubjectStat[]>('/hod/analytics/subjects') });
  const trend = useQuery({ queryKey: [H, 'trend'], queryFn: () => api.get<AttendancePoint[]>('/hod/analytics/attendance-trend') });

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Compare semesters, classes and subjects. Subjects are listed weakest first so problems are easy to spot." />
      <div className="mb-5"><Tabs<Tab> value={tab} onChange={setTab} options={[{ value: 'SEMESTERS', label: 'Semesters' }, { value: 'CLASSES', label: 'Classes' }, { value: 'SUBJECTS', label: 'Subjects' }]} /></div>

      {tab === 'SEMESTERS' && (
        <Async query={sems} skeleton={<TableSkeleton />}>
          {(list) => (
            <div className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-2">
                <Card><CardHeader title="Average attendance" />
                  <ValueBars data={list.map((s) => ({ name: `Sem ${s.semesterNo}`, value: s.averageAttendance }))} reference={75} colorFn={pctColor} label="Attendance" /></Card>
                <Card><CardHeader title="Average SGPA" />
                  <ValueBars data={list.map((s) => ({ name: `Sem ${s.semesterNo}`, value: s.averageSgpa }))} max={10} unit="" label="SGPA" colorFn={sgpaColor} /></Card>
              </div>
              <Card className="!p-0"><TableWrap className="border-0">
                <thead><tr><Th>Semester</Th><Th right>Students</Th><Th right>Attendance</Th><Th right>Avg SGPA</Th><Th right>Avg CGPA</Th><Th right>Below 75%</Th><Th right>High risk</Th></tr></thead>
                <tbody>{list.map((s) => (
                  <tr key={s.semesterNo}><Td className="font-medium">Semester {s.semesterNo}</Td><Td right>{s.students}</Td>
                    <Td right><Badge tone={attendanceTone(s.averageAttendance)}>{pct(s.averageAttendance)}</Badge></Td>
                    <Td right>{num(s.averageSgpa)}</Td><Td right>{num(s.averageCgpa)}</Td><Td right>{s.lowAttendanceCount}</Td>
                    <Td right>{s.highRiskCount > 0 ? <Badge tone="red">{s.highRiskCount}</Badge> : <span className="text-slate-400">0</span>}</Td></tr>
                ))}</tbody></TableWrap></Card>
            </div>
          )}
        </Async>
      )}

      {tab === 'CLASSES' && (
        <Async query={classes} skeleton={<TableSkeleton />}>
          {(list) => (
            <div className="space-y-6">
              <Card><CardHeader title="Average marks by class" subtitle="Percentage of marks obtained across all assessments." />
                <ValueBars data={list.map((c) => ({ name: c.className, value: c.averageMarksPct }))} label="Marks" colorFn={(v) => (v >= 60 ? '#10a595' : v >= 45 ? '#f59e0b' : '#ef4444')} /></Card>
              <Card className="!p-0"><TableWrap className="border-0">
                <thead><tr><Th>Class</Th><Th right>Sem</Th><Th right>Students</Th><Th right>Attendance</Th><Th right>Marks</Th><Th right>Avg SGPA</Th><Th right>Assignments</Th></tr></thead>
                <tbody>{list.map((c) => (
                  <tr key={c.classId}><Td className="font-medium">{c.className}</Td><Td right>{c.semesterNo}</Td><Td right>{c.students}</Td>
                    <Td right><Badge tone={attendanceTone(c.averageAttendance)}>{pct(c.averageAttendance)}</Badge></Td>
                    <Td right>{pct(c.averageMarksPct)}</Td><Td right>{num(c.averageSgpa)}</Td><Td right>{pct(c.assignmentCompletionPct, 0)}</Td></tr>
                ))}</tbody></TableWrap></Card>
            </div>
          )}
        </Async>
      )}

      {tab === 'SUBJECTS' && (
        <Async query={subjects} skeleton={<TableSkeleton />}>
          {(list) => (
            <Card className="!p-0"><TableWrap className="border-0">
              <thead><tr><Th>Subject</Th><Th right>Sem</Th><Th right>Credits</Th><Th right>Avg marks</Th><Th right>Attendance</Th><Th right>Assessed</Th><Th right>Failing</Th></tr></thead>
              <tbody>{list.map((s) => (
                <tr key={s.subjectId}><Td><p className="font-medium text-slate-900 dark:text-white">{s.name}</p><p className="font-mono text-xs text-slate-500">{s.code}</p></Td>
                  <Td right>{s.semesterNo}</Td><Td right>{s.credits}</Td>
                  <Td right><Badge tone={s.averagePercentage >= 60 ? 'green' : s.averagePercentage >= 45 ? 'amber' : 'red'}>{pct(s.averagePercentage)}</Badge></Td>
                  <Td right><Badge tone={attendanceTone(s.averageAttendance)}>{pct(s.averageAttendance)}</Badge></Td>
                  <Td right>{s.studentsAssessed}</Td><Td right>{s.failingCount > 0 ? <Badge tone="red">{s.failingCount}</Badge> : <span className="text-slate-400">0</span>}</Td></tr>
              ))}</tbody></TableWrap></Card>
          )}
        </Async>
      )}

      <Card className="mt-6">
        <CardHeader title="Daily attendance trend" subtitle="Percentage of students present each class day." />
        <Async query={trend} skeleton={<Skeleton className="h-56 w-full" />}>
          {(t) => t.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">No attendance recorded yet.</p> : <TrendLine data={t.map((p) => ({ label: p.date.slice(5), value: p.percent }))} label="Present" />}
        </Async>
      </Card>
    </div>
  );
}
