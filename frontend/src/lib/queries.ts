import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import type {
  AttendanceSummary, ComplaintDto, HistoryItem, MarkDto, MyCoursework, MyFees, NoticeDto, ResultDto, RiskDetail, StudentDto, SyllabusDto,
} from './types';

export const keys = {
  me: ['me'], attendance: ['attendance'], marks: ['marks'], results: ['results'], risk: ['risk'], coursework: ['coursework'],
  fees: ['fees'], notices: ['notices'], syllabus: ['syllabus'], complaints: ['complaints'], aiHistory: ['ai-history'],
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
export const useAiHistory = () => useQuery({ queryKey: keys.aiHistory, queryFn: () => api.get<HistoryItem[]>('/ai/history'), staleTime: Infinity });
