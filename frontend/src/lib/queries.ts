import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import type {
  AttendanceSummary, StudentDto,
} from './types';

export const keys = {
  me: ['me'], attendance: ['attendance'],
} as const;

export const useMe = () => useQuery({ queryKey: keys.me, queryFn: () => api.get<StudentDto>('/students/me') });
export const useAttendance = () => useQuery({ queryKey: keys.attendance, queryFn: () => api.get<AttendanceSummary>('/students/me/attendance') });
