import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import type {
  AssignmentDto, AttendanceRowDto, AttendanceSummary, ComplaintDto, CourseworkDto, MarkDto,
  MyCoursework, MyFees, NoticeDto, ResultDto, RiskDetail, StudentDto, SubmissionDto, SyllabusDto, TeacherDto,
} from './types';

export const keys = {
  me: ['me'], attendance: ['attendance'], marks: ['marks'], results: ['results'], risk: ['risk'], coursework: ['coursework'],
  fees: ['fees'], notices: ['notices'], syllabus: ['syllabus'], complaints: ['complaints'],
  teacherMe: ['teacherMe'],
  teacherAssignments: ['teacherAssignments'],
  classStudents: (classId: number) => ['classStudents', classId] as const,
  teacherAttendance: (classId: number, subjectId: number, date?: string) => ['teacherAttendance', classId, subjectId, date ?? ''] as const,
  teacherMarks: (classId: number, subjectId: number) => ['teacherMarks', classId, subjectId] as const,
  teacherCoursework: ['teacherCoursework'],
  courseworkSubmissions: (courseworkId: number) => ['courseworkSubmissions', courseworkId] as const,
  classSyllabus: (classId: number, subjectId: number) => ['classSyllabus', classId, subjectId] as const,
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

// ---------- Teacher / Faculty queries ----------
export const useTeacherMe = () =>
  useQuery({ queryKey: keys.teacherMe, queryFn: () => api.get<TeacherDto>('/teachers/me') });

export const useTeacherAssignments = () =>
  useQuery({ queryKey: keys.teacherAssignments, queryFn: () => api.get<AssignmentDto[]>('/teachers/me/assignments') });

export const useClassStudents = (classId: number | null | undefined) =>
  useQuery({
    queryKey: classId ? keys.classStudents(classId) : ['classStudents', 'none'],
    queryFn: () => api.get<StudentDto[]>(`/teachers/me/classes/${classId}/students`),
    enabled: Boolean(classId),
  });

export const useTeacherAttendance = (classId: number | null | undefined, subjectId: number | null | undefined, date?: string) =>
  useQuery({
    queryKey: classId && subjectId ? keys.teacherAttendance(classId, subjectId, date) : ['teacherAttendance', 'none'],
    queryFn: () => api.get<AttendanceRowDto[]>(`/teachers/me/classes/${classId}/subjects/${subjectId}/attendance${date ? `?date=${date}` : ''}`),
    enabled: Boolean(classId && subjectId),
  });

export const useTeacherMarks = (classId: number | null | undefined, subjectId: number | null | undefined) =>
  useQuery({
    queryKey: classId && subjectId ? keys.teacherMarks(classId, subjectId) : ['teacherMarks', 'none'],
    queryFn: () => api.get<MarkDto[]>(`/teachers/me/classes/${classId}/subjects/${subjectId}/marks`),
    enabled: Boolean(classId && subjectId),
  });

export const useTeacherCoursework = () =>
  useQuery({ queryKey: keys.teacherCoursework, queryFn: () => api.get<CourseworkDto[]>('/teachers/me/coursework') });

export const useCourseworkSubmissions = (courseworkId: number | null | undefined) =>
  useQuery({
    queryKey: courseworkId ? keys.courseworkSubmissions(courseworkId) : ['courseworkSubmissions', 'none'],
    queryFn: () => api.get<SubmissionDto[]>(`/teachers/me/coursework/${courseworkId}/submissions`),
    enabled: Boolean(courseworkId),
  });

export const useClassSyllabus = (classId: number | null | undefined, subjectId: number | null | undefined) =>
  useQuery({
    queryKey: classId && subjectId ? keys.classSyllabus(classId, subjectId) : ['classSyllabus', 'none'],
    queryFn: () => api.get<SyllabusDto>(`/teachers/me/classes/${classId}/subjects/${subjectId}/syllabus`),
    enabled: Boolean(classId && subjectId),
  });

