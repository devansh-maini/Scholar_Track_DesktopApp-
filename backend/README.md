# ScholarTrack Backend — Milestone 1 (foundation)

Java 21 + Spring Boot 3.3 · JWT auth · Flyway · H2 (default) / PostgreSQL (production)

## Run locally
    mvn spring-boot:run
Server: http://localhost:8080  (data stored in ./data, demo users seeded on first run)

## Demo accounts (change/disable before real use: SEED_DEMO=false)
| role    | username | password   |
|---------|----------|------------|
| HOD     | hod      | hod123     |
| Teacher | teacher  | teacher123 |
| Student | student  | student123 |

## Try it
    curl http://localhost:8080/api/v1/health
    curl -X POST http://localhost:8080/api/v1/auth/login -H "Content-Type: application/json" -d "{\"username\":\"teacher\",\"password\":\"teacher123\"}"
    curl http://localhost:8080/api/v1/auth/me -H "Authorization: Bearer <token>"
    curl http://localhost:8080/api/v1/hod/x -H "Authorization: Bearer <student token>"   # -> 403

## Environment variables
DATABASE_URL (jdbc:postgresql://host/db?sslmode=require), DATABASE_USERNAME, DATABASE_PASSWORD,
JWT_SECRET (>= 32 chars), SEED_DEMO, PORT

## Deploy (Render + hosted Postgres) — added fully in a later milestone
Build with the Dockerfile; set the variables above. Note: Postgres providers often give a
`postgresql://user:pass@host/db` URI — convert it to `jdbc:postgresql://host/db` and pass user/password separately.

---
## Milestone 2 — Academic core
Adds departments, subjects, classes, students, teachers and teacher assignments (Flyway V2),
demo seed data (10 students, 2 teachers, 5 subjects, 2 classes) and role-scoped endpoints.

| Who | Endpoint |
|-----|----------|
| any user | GET /api/v1/departments, /subjects?semesterNo=5, /classes |
| HOD | POST /api/v1/hod/{departments,subjects,classes,students,teachers,assignments} |
| HOD | GET /api/v1/hod/students?q=&page=&size=, /hod/teachers, /hod/assignments |
| student | GET /api/v1/students/me, /students/me/subjects |
| teacher | GET /api/v1/teachers/me, /teachers/me/assignments, /teachers/me/classes/{id}/students (only assigned classes) |

Extra demo accounts: teacher2/teacher123, student2..student10/student123.
Smoke test: `powershell -ExecutionPolicy Bypass -File .\scripts\test-m2.ps1`

---
## Milestone 3 — Attendance, marks, assignments, SGPA/CGPA
Flyway V3 adds attendance_records, marks, assignments, submissions and semester_results, plus demo data
(20 class days of attendance, midterm/internal marks, 2 assignments per subject, 4 previous semesters).

| Who | Endpoint |
|-----|----------|
| teacher | GET  /api/v1/teachers/me/classes/{classId}/subjects/{subjectId}/attendance?date=YYYY-MM-DD |
| teacher | PUT  /api/v1/teachers/me/attendance  `{classId, subjectId, date, records:[{studentId,status}]}` |
| teacher | PUT  /api/v1/teachers/me/marks  `{classId, subjectId, assessmentType, maxMarks, entries:[{studentId,marks}]}` |
| teacher | GET  /api/v1/teachers/me/classes/{classId}/subjects/{subjectId}/marks |
| teacher | POST/GET /api/v1/teachers/me/coursework, GET .../coursework/{id}/submissions, PUT .../submissions/{sid}/evaluate |
| student | GET  /api/v1/students/me/{attendance,marks,results,coursework}, POST .../coursework/{id}/submit |
| HOD     | GET  /api/v1/hod/students/{id}/performance |

### Frozen academic formulas (AcademicCalc.java — the only place they live)
- Attendance % = attended / total x 100 · low-attendance threshold 75%
- Classes needed for 75% = max(0, 3 x total - 4 x attended)
- Subject % = sum(marks) / sum(max marks) x 100
- Grade point: >=90:10 · >=80:9 · >=70:8 · >=60:7 · >=50:6 · >=45:5 · >=40:4 · else 0
- SGPA = sum(credits x GP) / sum(credits) · CGPA = credit-weighted average of all semester SGPAs
Unit tests: `mvn test`. Smoke test: `powershell -ExecutionPolicy Bypass -File .\scripts\test-m3.ps1`

---
## Milestone 4 — Fees, notices, complaints, syllabus, live updates
Flyway V4 adds fees, payments, notices, complaints, syllabus_topics and syllabus_progress (+ demo data).

| Area | Endpoints |
|------|-----------|
| Fees (HOD owns) | POST /api/v1/hod/fees (one student or a whole class), POST /hod/fees/{id}/payments, GET /hod/fees?status=&q=, GET /hod/fees/summary |
| Fees (student) | GET /api/v1/students/me/fees |
| Notices | GET /api/v1/notices[?includeExpired=true (HOD)], POST (HOD any target; teacher only own classes/subjects), DELETE /{id} |
| Complaints | POST /api/v1/complaints (student), GET (role-scoped), PUT /{id}/assign (HOD), PUT /{id}/status (HOD or assigned teacher) |
| Syllabus | teacher: POST /teachers/me/subjects/{id}/syllabus, GET/PUT /teachers/me/classes/{c}/subjects/{s}/syllabus[/{topic}] · student: GET /students/me/syllabus · HOD: GET /hod/syllabus-progress |

Notice targets: ALL, STUDENTS, TEACHERS, DEPARTMENT, SEMESTER, CLASS, SUBJECT. Expired notices are hidden for everyone (HOD can opt in).
Complaint flow: OPEN -> IN_PROGRESS (HOD assigns) -> RESOLVED | REJECTED (resolution note required, final).

### Fee rules (FeeCalc.java)
Late fee applies only when today is after the due date and the base fee is not fully paid.
outstanding = max(0, total + lateFeeApplied - paid). Status: PAID / OVERDUE / PARTIALLY_PAID / PENDING. Overpayment is rejected.

### Live updates (WebSocket + STOMP)
Connect to `ws://<server>:8080/ws`, send a STOMP CONNECT frame with header `Authorization: Bearer <jwt>`,
then SUBSCRIBE to `/user/queue/events`. Only that destination is allowed and clients cannot send.
The server pushes `{type, message, at}` to exactly the users concerned, after the database commit.
Types: MARKS_UPDATED, ATTENDANCE_UPDATED, ASSIGNMENT_CREATED, SUBMISSION_EVALUATED, SUBMISSION_RECEIVED,
FEE_UPDATED, NOTICE_PUBLISHED, COMPLAINT_UPDATED, SYLLABUS_UPDATED. The client simply re-fetches the matching screen.

Smoke test: `powershell -ExecutionPolicy Bypass -File .\scripts\test-m4.ps1`

---
## Milestone 5 — Analytics, risk score, reports, AI assistant
Flyway V5 adds ai_messages. New dependencies: OpenPDF (PDF) and Apache POI (Excel).

### HOD analytics (all read the same persisted data and formulas as the student/teacher screens)
GET /api/v1/hod/analytics/{dashboard, semesters, classes, subjects, attendance-trend, low-attendance}
GET /api/v1/hod/analytics/risk?level=HIGH&page=&size= · /risk/{studentId} · /compare?studentIds=1,2,3
Student: GET /api/v1/students/me/risk · Teacher: GET /api/v1/teachers/me/classes/{classId}/performance

### Risk score (RiskCalc.java — transparent rules, NOT machine learning)
Weights: attendance 35%, marks 30%, assignment completion 15%, previous CGPA 10%, SGPA trend 10%.
Each input maps linearly to 0-100 risk points (attendance 90%->0, 45%->100; marks 80%->0, 30%->100; assignments 90%->0, 30%->100;
CGPA 8.0->0, 5.0->100; SGPA drop of 2.0 -> 100). HIGH >= 55, MEDIUM >= 30, else LOW. Missing data adds 0 points.
The PRD example (attendance 61, midterm 42, assignments 60, previous CGPA 6.2) scores 59 = HIGH.

### Reports  (?format=pdf | csv | xlsx)
GET /api/v1/reports/student/me · /student/{id} (HOD) · /attendance?classId= · /marks?classId=&subjectId= · /assignments?classId= · /fees (HOD) · /department (HOD)
Teachers can only export classes/subjects they teach. CSV cells are protected against spreadsheet formula injection.

### AI assistant (Groq, backend only)
POST /api/v1/ai/chat {message} · GET/DELETE /api/v1/ai/history · GET /api/v1/ai/context-preview (shows exactly what the AI may see)
The server builds a role-scoped context (student: own data; teacher: own classes; HOD: department) and the model only gets that.
Set the key as an environment variable and restart:  `$env:GROQ_API_KEY="gsk_..."`  (PowerShell)  — never commit it.
Model: GROQ_MODEL (default openai/gpt-oss-120b) with GROQ_FALLBACK_MODEL (default openai/gpt-oss-20b).
Groq retired llama-3.3-70b-versatile on 2026-08-16; check https://console.groq.com/docs/deprecations if a model stops working.
If the AI is unreachable the API answers 503 "AI service unavailable. Please try again later." and everything else keeps working.

Smoke test: `powershell -ExecutionPolicy Bypass -File .\scripts\test-m5.ps1`


## Academic Reports & Analytics Module (Aviral Joshi)
Full multi-format report generation (OpenPDF, Apache POI, RFC 4180 CSV):
- Transcripts: GET /api/v1/reports/student/me (?format=pdf|csv|xlsx)
- Attendance: GET /api/v1/reports/attendance?classId= (?format=csv)
- Exam Analytics: GET /api/v1/reports/department (?format=pdf|xlsx)
- Fee Audit: GET /api/v1/reports/fees (?format=csv)
