import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import type {
  ClassDto, ComplaintDto, CourseworkDto, DepartmentDto, NoticeDto, StudentRow, SubjectDto, TeacherDto, TeachingDto,
} from './types';

/**
 * Query-key prefixes. Every teacher query starts with 't' and every HOD query with 'h', so a live event can refresh a
 * whole portal with one invalidation (see state/live.tsx).
 */
export const T = 't';
export const H = 'h';

export const useTeacherMe = () => useQuery({ queryKey: [T, 'me'], queryFn: () => api.get<TeacherDto>('/teachers/me') });
export const useTeaching = () => useQuery({ queryKey: [T, 'teaching'], queryFn: () => api.get<TeachingDto[]>('/teachers/me/assignments') });
export const useTeacherCoursework = () => useQuery({ queryKey: [T, 'coursework'], queryFn: () => api.get<CourseworkDto[]>('/teachers/me/coursework') });
export const useClassPerformance = (classId: number | null) => useQuery({
  queryKey: [T, 'performance', classId],
  queryFn: () => api.get<StudentRow[]>(`/teachers/me/classes/${classId}/performance`),
  enabled: classId !== null,
});

export const useDepartments = () => useQuery({ queryKey: ['departments'], queryFn: () => api.get<DepartmentDto[]>('/departments'), staleTime: 60_000 });
export const useClasses = () => useQuery({ queryKey: ['classes'], queryFn: () => api.get<ClassDto[]>('/classes'), staleTime: 60_000 });
export const useSubjects = () => useQuery({ queryKey: ['subjects'], queryFn: () => api.get<SubjectDto[]>('/subjects'), staleTime: 60_000 });

export const useStaffNotices = () => useQuery({ queryKey: ['notices', 'staff'], queryFn: () => api.get<NoticeDto[]>('/notices') });
export const useStaffComplaints = () => useQuery({ queryKey: ['complaints', 'staff'], queryFn: () => api.get<ComplaintDto[]>('/complaints') });
