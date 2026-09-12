import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import type {
  AttendanceSummary, ComplaintDto, MarkDto, MyCoursework, MyFees, NoticeDto, ResultDto, RiskDetail, StudentDto, SyllabusDto,
} from './types';

export const keys = {
  me: ['me'], attendance: ['attendance'], marks: ['marks'], results: ['results'], risk: ['risk'], coursework: ['coursework'],
  fees: ['fees'], notices: ['notices'], syllabus: ['syllabus'], complaints: ['complaints'],
  hodOverview: ['hod', 'overview'],
  teacherAllocations: ['hod', 'allocations'],
  syllabusAudit: ['hod', 'syllabusAudit'],
  atRiskStudents: (dept?: string) => ['hod', 'atRisk', dept ?? 'all'],
  studyPlan: ['ai', 'studyPlan'],
  aiRisk: ['ai', 'risk'],
  chatHistory: ['ai', 'chatHistory'],
} as const;

export const useMe = () => useQuery({ queryKey: keys.me, queryFn: () => api.get<StudentDto>('/students/me') });
export const useAttendance = () => useQuery({ queryKey: keys.attendance, queryFn: () => api.get<AttendanceSummary>('/students/me/attendance') });
export const useMarks = () => useQuery({ queryKey: keys.marks, queryFn: () => api.get<MarkDto[]>('/students/me/marks') });
export const useResults = () => useQuery({ queryKey: keys.results, queryFn: () => api.get<ResultDto>('/students/me/results') });
export const useRisk = () => useQuery({ queryKey: keys.risk, queryFn: () => api.get<RiskDetail>('/students/me/risk') });
export const useCoursework = () => useQuery({ queryKey: keys.coursework, queryFn: () => api.get<MyCoursework[]>('/students/me/coursework') });
export const useFees = () => useQuery({ queryKey: keys.fees, queryFn: () => api.get<MyFees>('/students/me/fees') });
export const useNotices = () => useQuery({ queryKey: keys.notices, queryFn: () => api.get<NoticeDto[]>('/notices') });
export const useSyllabus = () => useQuery({ queryKey: keys.syllabus, queryFn: () => api.get<SyllabusDto[]>('/students/me/syllabus') });
export const useComplaints = () => useQuery({ queryKey: keys.complaints, queryFn: () => api.get<ComplaintDto[]>('/complaints') });

// ── HOD hooks ────────────────────────────────────────────────────────────────
export const useHodOverview = () =>
  useQuery({
    queryKey: keys.hodOverview,
    queryFn: () => api.get<import('./types').DepartmentOverviewDto>('/hod/overview'),
  });

export const useTeacherAllocations = () =>
  useQuery({
    queryKey: keys.teacherAllocations,
    queryFn: () => api.get<import('./types').TeacherAllocationDto[]>('/hod/teacher-allocations'),
  });

export const useSyllabusAudit = () =>
  useQuery({
    queryKey: keys.syllabusAudit,
    queryFn: () => api.get<import('./types').SyllabusDto[]>('/hod/syllabus-audit'),
  });

export const useAtRiskStudents = (deptCode?: string) =>
  useQuery({
    queryKey: keys.atRiskStudents(deptCode),
    queryFn: () =>
      api.get<import('./types').AtRiskStudentDto[]>(
        '/hod/at-risk' + (deptCode ? `?departmentCode=${encodeURIComponent(deptCode)}` : '')
      ),
  });

// ── AI hooks ─────────────────────────────────────────────────────────────────
export const useStudyPlan = () =>
  useQuery({
    queryKey: keys.studyPlan,
    queryFn: () => api.get<import('./types').StudyPlanDto>('/ai/study-plan'),
  });

export const useAiChatHistory = () =>
  useQuery({
    queryKey: keys.chatHistory,
    queryFn: () => api.get<import('./types').HistoryItem[]>('/ai/chat/history'),
  });

