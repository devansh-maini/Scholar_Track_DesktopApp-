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

/* ------------------------------------------------------------------ */
/* Staff (teacher + HOD) types                                          */
/* ------------------------------------------------------------------ */
export interface Page<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number }

export interface DepartmentDto { id: number; code: string; name: string }
export interface SubjectDto { id: number; code: string; name: string; credits: number; semesterNo: number; departmentId: number }
export interface ClassDto { id: number; name: string; section: string; semesterNo: number; academicYear: string; departmentId: number }
export interface TeacherDto { id: number; userId: number; username: string; fullName: string; email: string; employeeCode: string; departmentCode: string }
/** A teaching assignment: one teacher teaches one subject to one class. */
export interface TeachingDto {
  id: number; teacherId: number; teacherName: string; subjectId: number; subjectCode: string; subjectName: string; classId: number; className: string;
}

export interface AttendanceRow { studentId: number; rollNo: string; fullName: string; status: 'PRESENT' | 'ABSENT' | null }
export interface CourseworkDto {
  id: number; subjectId: number; subjectCode: string; subjectName: string; classId: number; className: string;
  title: string; description: string | null; deadline: string; maxMarks: number; submissionCount: number;
}
export interface SubmissionDto {
  id: number; courseworkId: number; studentId: number; rollNo: string; studentName: string; content: string;
  status: CourseworkStatus; submittedAt: string; marks: number | null; feedback: string | null;
}

export interface StudentRow {
  studentId: number; rollNo: string; name: string; className: string; semesterNo: number; attended: number; total: number;
  attendancePct: number; lowAttendance: boolean; marksPct: number; sgpa: number; cgpa: number; assignmentCompletionPct: number;
  riskScore: number; riskLevel: RiskLevel;
}
export interface StudentRiskDetail extends RiskDetail { student: StudentRow }
export interface ActivityItem { type: string; text: string; at: string }
export interface HodDashboard {
  totalStudents: number; totalTeachers: number; averageCgpa: number; averageAttendance: number; lowAttendanceCount: number;
  highRiskCount: number; mediumRiskCount: number; assignmentCompletionPct: number; outstandingFees: number; overdueFeeCount: number;
  openComplaints: number; recentActivity: ActivityItem[];
}
export interface SemesterStat { semesterNo: number; students: number; averageAttendance: number; averageSgpa: number; averageCgpa: number; lowAttendanceCount: number; highRiskCount: number }
export interface ClassStat { classId: number; className: string; semesterNo: number; students: number; averageAttendance: number; averageMarksPct: number; averageSgpa: number; assignmentCompletionPct: number }
export interface SubjectStat { subjectId: number; code: string; name: string; semesterNo: number; credits: number; averagePercentage: number; averageAttendance: number; studentsAssessed: number; failingCount: number }
export interface AttendancePoint { date: string; present: number; total: number; percent: number }
export interface PerformanceDto { studentId: number; rollNo: string; fullName: string; className: string; semesterNo: number; attendance: AttendanceSummary; results: ResultDto }

export interface FeeSummary { totalBilled: number; totalCollected: number; totalOutstanding: number; feeCount: number; fullyPaidCount: number; overdueCount: number }
export interface SyllabusOverviewRow {
  classId: number; className: string; subjectId: number; subjectCode: string; subjectName: string; teacherName: string;
  topicsTotal: number; topicsDone: number; percentComplete: number;
}
export type NoticeTargetType = 'ALL' | 'STUDENTS' | 'TEACHERS' | 'DEPARTMENT' | 'SEMESTER' | 'CLASS' | 'SUBJECT';
