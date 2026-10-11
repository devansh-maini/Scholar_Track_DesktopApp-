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

// ---------- Teacher / Faculty types ----------
export interface TeacherDto {
  id: number; userId: number; username: string; fullName: string; email: string;
  employeeCode: string; departmentCode: string;
}

export interface AssignmentDto {
  id: number; teacherId: number; teacherName: string; subjectId: number; subjectCode: string;
  subjectName: string; classId: number; className: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface AttendanceRowDto {
  studentId: number; rollNo: string; fullName: string; status: AttendanceStatus;
}

export interface AttendanceEntry {
  studentId: number; status: AttendanceStatus;
}

export interface MarkAttendanceRequest {
  classId: number; subjectId: number; date: string; records: AttendanceEntry[];
}

export interface MarkEntry {
  studentId: number; marks: number;
}

export interface SaveMarksRequest {
  classId: number; subjectId: number; assessmentType: AssessmentType; maxMarks: number; entries: MarkEntry[];
}

export interface CourseworkDto {
  id: number; subjectId: number; subjectCode: string; subjectName: string; classId: number; className: string;
  title: string; description: string | null; deadline: string; maxMarks: number; submissionCount: number;
}

export interface CreateCourseworkRequest {
  classId: number; subjectId: number; title: string; description?: string; deadline: string; maxMarks: number;
}

export interface SubmissionDto {
  id: number; courseworkId: number; studentId: number; rollNo: string; studentName: string; content: string;
  status: 'SUBMITTED' | 'LATE' | 'EVALUATED'; submittedAt: string; marks: number | null; feedback: string | null;
}

export interface EvaluateRequest {
  marks: number; feedback?: string;
}

export interface AddTopicRequest {
  unitNo: number; title: string;
}

export type NoticePriority = Priority;
export type NoticeTarget = 'ALL' | 'DEPARTMENT' | 'CLASS';

export interface CreateNoticeRequest {
  title: string; description: string; priority: Priority; targetType: NoticeTarget;
  targetId?: number | null; expiryDate?: string | null;
}

