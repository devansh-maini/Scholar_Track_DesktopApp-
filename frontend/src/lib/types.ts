export type Role = 'STUDENT' | 'TEACHER' | 'HOD';
export interface UserDto { id: number; username: string; email: string; fullName: string; role: Role }
export interface LoginResponse { token: string; user: UserDto }

export interface StudentDto {
  id: number; userId: number; username: string; fullName: string; email: string; rollNo: string;
  departmentCode: string; classId: number; className: string; semesterNo: number;
}
export interface SubjectAttendance {
  subjectId: number; subjectCode: string; subjectName: string; attended: number; total: number; percent: number; classesNeededFor75: number;
}
export interface AttendanceSummary { attended: number; total: number; percent: number; lowAttendance: boolean; subjects: SubjectAttendance[] }
export type AssessmentType = 'MIDTERM' | 'INTERNAL' | 'ASSIGNMENT' | 'PRACTICAL';
export interface MarkDto {
  id: number; studentId: number; rollNo: string; studentName: string; subjectId: number; subjectCode: string;
  assessmentType: AssessmentType; marks: number; maxMarks: number;
}
export interface SubjectResult { subjectId: number; subjectCode: string; subjectName: string; credits: number; percentage: number; gradePoint: number }
export interface PreviousSemester { semesterNo: number; sgpa: number; credits: number }
export interface ResultDto { semesterNo: number; sgpa: number; cgpa: number; subjects: SubjectResult[]; previous: PreviousSemester[] }

export type CourseworkStatus = 'PENDING' | 'SUBMITTED' | 'LATE' | 'EVALUATED';
export interface MyCoursework {
  id: number; subjectCode: string; subjectName: string; teacherName: string; title: string; description: string | null;
  deadline: string; maxMarks: number; status: CourseworkStatus; marks: number | null; feedback: string | null; submittedAt: string | null;
}

export interface PaymentDto { id: number; amount: number; paidAt: string; method: string; reference: string | null }
export type FeeStatus = 'PAID' | 'PARTIALLY_PAID' | 'PENDING' | 'OVERDUE';
export interface FeeDto {
  id: number; studentId: number; rollNo: string; studentName: string; title: string; totalAmount: number;
  lateFeeApplied: number; paid: number; outstanding: number; status: FeeStatus; dueDate: string; payments: PaymentDto[];
}
export interface MyFees { totalBilled: number; totalPaid: number; totalOutstanding: number; fees: FeeDto[] }

export type Priority = 'NORMAL' | 'IMPORTANT' | 'URGENT';
export interface NoticeDto {
  id: number; title: string; description: string; authorName: string; authorRole: string; createdAt: string;
  expiryDate: string | null; expired: boolean; priority: Priority; targetType: string; targetId: number | null; targetLabel: string;
}

export interface TopicDto { id: number; unitNo: number; title: string; completed: boolean; completedOn: string | null }
export interface SyllabusDto {
  subjectId: number; subjectCode: string; subjectName: string; classId: number; className: string;
  percentComplete: number; topicsTotal: number; topicsDone: number; topics: TopicDto[];
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export interface RiskComponent { name: string; value: number | null; riskPoints: number; weight: number; contribution: number }
export interface RiskDetail {
  risk: { score: number; level: RiskLevel; components: RiskComponent[]; reasons: string[] };
  previousCgpa: number | null; sgpaTrend: number | null;
}

export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
export type ComplaintCategory = 'ACADEMIC' | 'ATTENDANCE' | 'FEES' | 'FACILITIES' | 'OTHER';
export interface ComplaintDto {
  id: number; category: ComplaintCategory; title: string; description: string; status: ComplaintStatus;
  submittedByName: string; assignedToName: string | null; resolution: string | null; createdAt: string; updatedAt: string; resolvedAt: string | null;
}

export interface AiReply { reply: string; at: string }
export interface HistoryItem { id: number; sender: 'USER' | 'ASSISTANT'; content: string; at: string }
export interface LiveEvent { type: string; message: string; at: string }

// HOD Module types
export interface DepartmentStatsDto {
  id: number;
  code: string;
  name: string;
  totalStudents: number;
  totalTeachers: number;
  atRiskStudents: number;
  avgAttendance: number;
  avgMarks: number;
}

export interface DepartmentOverviewDto {
  hodName: string;
  totalStudents: number;
  totalTeachers: number;
  atRiskStudents: number;
  avgAttendance: number;
  avgMarks: number;
  departments: DepartmentStatsDto[];
}

export interface SubjectClassDto {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  classId: number;
  className: string;
}

export interface TeacherAllocationDto {
  teacherId: number;
  fullName: string;
  email: string;
  employeeCode: string;
  departmentName: string;
  allocations: SubjectClassDto[];
}

export interface SyllabusAuditItemDto {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  classId: number;
  className: string;
  topicsTotal: number;
  topicsDone: number;
  percentComplete: number;
}

export interface AtRiskStudentDto {
  studentId: number;
  fullName: string;
  rollNo: string;
  department: string;
  className: string;
  attendancePct: number;
  avgMarks: number;
  riskLevel: string;
  reasons: string[];
}

// AI Module types
export interface StudyPlanSubject {
  subjectCode: string;
  subjectName: string;
  attendancePct: number;
  marksPct: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  weeklyHours: number;
  actions: string[];
}

export interface StudyPlanDto {
  studentName: string;
  rollNo: string;
  generatedAt: string;
  subjects: StudyPlanSubject[];
  generalAdvice: string[];
}

export interface AiChatReply {
  reply: string;
  sessionId: string;
  at: string;
}

