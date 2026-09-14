import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import type {
  AttendanceSummary, MarkDto, MyCoursework, MyFees, ResultDto, StudentDto,
} from './types';

export const keys = {
  me: ['me'], attendance: ['attendance'], marks: ['marks'], results: ['results'],
  coursework: ['coursework'], fees: ['fees'],
} as const;

export const useMe = () => useQuery({ queryKey: keys.me, queryFn: () => api.get<StudentDto>('/students/me') });
export const useAttendance = () => useQuery({ queryKey: keys.attendance, queryFn: () => api.get<AttendanceSummary>('/students/me/attendance') });
export const useMarks = () => useQuery({ queryKey: keys.marks, queryFn: () => api.get<MarkDto[]>('/students/me/marks') });
export const useResults = () => useQuery({ queryKey: keys.results, queryFn: () => api.get<ResultDto>('/students/me/results') });
export const useCoursework = () => useQuery({ queryKey: keys.coursework, queryFn: () => api.get<MyCoursework[]>('/students/me/coursework') });
export const useFees = () => useQuery({ queryKey: keys.fees, queryFn: () => api.get<MyFees>('/students/me/fees') });
