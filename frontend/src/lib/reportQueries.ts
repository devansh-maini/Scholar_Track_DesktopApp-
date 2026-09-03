import { useQuery } from '@tanstack/react-query';
import { api, download } from './api';
import type {
  AttendanceStatisticsReport,
  DepartmentPerformanceReport,
  FeePaymentAuditReport,
  StudentTranscript,
} from './reportTypes';

export function useStudentTranscript(studentId?: number) {
  const path = studentId ? `/reports/student/${studentId}` : '/reports/student/me';
  return useQuery({
    queryKey: ['report', 'transcript', studentId ?? 'me'],
    queryFn: () => api.get<StudentTranscript>(path),
  });
}

export function useAttendanceReport(classId = 1) {
  return useQuery({
    queryKey: ['report', 'attendance', classId],
    queryFn: () => api.get<AttendanceStatisticsReport>(`/reports/attendance?classId=${classId}`),
  });
}

export function useDepartmentReport() {
  return useQuery({
    queryKey: ['report', 'department'],
    queryFn: () => api.get<DepartmentPerformanceReport>('/reports/department'),
  });
}

export function useFeeAuditReport() {
  return useQuery({
    queryKey: ['report', 'fees'],
    queryFn: () => api.get<FeePaymentAuditReport>('/reports/fees'),
  });
}

export async function downloadReportFile(endpoint: string, format: 'pdf' | 'csv' | 'xlsx'): Promise<string> {
  const sep = endpoint.includes('?') ? '&' : '?';
  return download(`${endpoint}${sep}format=${format}`);
}
