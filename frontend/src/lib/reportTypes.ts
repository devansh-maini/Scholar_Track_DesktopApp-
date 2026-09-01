export interface SubjectAttendanceItem {
  subjectName: string;
  attended: number;
  total: number;
  percent: number;
  classesNeededFor75: number;
}

export interface SubjectResultItem {
  subjectName: string;
  credits: number;
  percentage: number;
  gradePoint: number;
}

export interface MarkItem {
  subjectCode: string;
  assessmentType: string;
  marks: number;
  maxMarks: number;
}

export interface PreviousSemesterScore {
  semesterLabel: string;
  sgpa: number;
  credits: number;
}

export interface ReportFeeItem {
  feeTitle: string;
  totalAmount: number;
  lateFee: number;
  paidAmount: number;
  outstandingAmount: number;
  status: string;
  dueDate: string;
}

export interface StudentTranscript {
  studentId: number;
  fullName: string;
  rollNo: string;
  className: string;
  semesterNo: number;
  sgpa: number;
  cgpa: number;
  overallAttendancePercent: number;
  attendedClasses: number;
  totalClasses: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore: number;
  generatedDate: string;
  attendanceBySubject: SubjectAttendanceItem[];
  subjectResults: SubjectResultItem[];
  marks: MarkItem[];
  previousSemesters: PreviousSemesterScore[];
  fees: ReportFeeItem[];
}

export interface AttendanceRosterRow {
  rollNo: string;
  name: string;
  className: string;
  attended: number;
  total: number;
  percent: number;
  status: 'OK' | 'LOW';
}

export interface AttendanceStatisticsReport {
  className: string;
  generatedDate: string;
  totalStudents: number;
  averageAttendancePercent: number;
  below75Count: number;
  studentAttendance: AttendanceRosterRow[];
}

export interface SemesterSummaryRow {
  semesterLabel: string;
  students: number;
  avgAttendancePercent: number;
  avgSgpa: number;
  avgCgpa: number;
  below75Count: number;
  highRiskCount: number;
}

export interface SubjectPerformanceRow {
  code: string;
  name: string;
  semesterNo: number;
  avgPercentage: number;
  avgAttendancePercent: number;
  assessedCount: number;
  failingCount: number;
}

export interface StudentRiskRankRow {
  rollNo: string;
  name: string;
  className: string;
  attendancePercent: number;
  marksPercent: number;
  sgpa: number;
  cgpa: number;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface DepartmentPerformanceReport {
  departmentName: string;
  generatedDate: string;
  totalStudents: number;
  totalTeachers: number;
  averageCgpa: number;
  averageAttendancePercent: number;
  studentsBelow75Attendance: number;
  highRiskStudentsCount: number;
  mediumRiskStudentsCount: number;
  assignmentCompletionPercent: number;
  totalOutstandingFees: number;
  semesterSummaries: SemesterSummaryRow[];
  subjectPerformance: SubjectPerformanceRow[];
  studentPerformance: StudentRiskRankRow[];
}

export interface FeeAuditRow {
  rollNo: string;
  name: string;
  feeTitle: string;
  totalAmount: number;
  lateFee: number;
  paidAmount: number;
  outstandingAmount: number;
  status: string;
  dueDate: string;
}

export interface FeePaymentAuditReport {
  reportTitle: string;
  generatedDate: string;
  totalBilled: number;
  totalCollected: number;
  totalOutstanding: number;
  feesFullyPaidCount: number;
  totalFeesCount: number;
  overdueCount: number;
  fees: FeeAuditRow[];
}
