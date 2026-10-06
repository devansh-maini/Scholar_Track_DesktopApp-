# ScholarTrack — Student Role Module

Desktop Application for Student Academic Life & Progress Tracking.
Developed by Aryan Kumar Singh (`aryan-student` branch).

## Overview
This branch contains the **Student Role Module** for the ScholarTrack academic management system.
It provides a high-performance desktop experience (Electron + React 18 + TypeScript + Tailwind CSS) backed by a Spring Boot 3.3 + JPA REST backend.

## Student Role Capabilities & Screens
1. **Student Dashboard (`/dashboard`)**:
   - Unified overview displaying Current SGPA, Cumulative CGPA, Overall Attendance %, Pending Coursework, and Fee dues.
   - 75% Attendance alert banner with live shortfall calculator.
   - Subject-wise attendance comparison bars with 75% target threshold.
   - Semester-wise SGPA progression trend line.
   - Upcoming assignment deadlines countdown.
   - College & class announcements bulletin.

2. **Attendance Tracker (`/attendance`)**:
   - Attendance percentage ring and status classification (Good, Warning, Critical).
   - Subject-by-subject attendance sheet (attended vs total classes).
   - Dynamic 75% shortfall rule: calculates exact consecutive classes required: `max(0, 3*total - 4*attended)`.
   - Filters by subject and attendance health.

3. **Marks & Academic Performance (`/marks`)**:
   - SGPA and CGPA computation weighted by course credits.
   - Assessment-by-assessment breakdown (Internal, Midterm) and grade point conversion (0–10 scale).
   - Historical semester progression chart.

4. **Assignments & Coursework (`/assignments`)**:
   - Real-time coursework feed with submission deadlines.
   - Online submission dialog supporting code repository links, responses, and report notes.
   - Deadline enforcement (marking submissions as SUBMITTED vs LATE).
   - Evaluated assignment view with teacher marks and feedback comments.

5. **Fees & Payments Portal (`/fees`)**:
   - Comprehensive ledger of fee heads (Tuition, Examination, Labs).
   - Automatic late fee calculation for overdue balances.
   - Online payment simulation (UPI, Debit Card, Net Banking).
   - Digital transaction receipt generation and ledger audit.

6. **Syllabus Progress Tracker (`/syllabus`)**:
   - Course-wise completion percentage meters.
   - Unit-by-unit topic checklist.

7. **Notices & Circulars (`/notices`)**:
   - Audience-targeted bulletin board (filtered for student's class, department, and general college announcements).
   - Priority indicators (Urgent, Important, Normal).

8. **Grievances & Complaints Redressal (`/complaints`)**:
   - Grievance submission form with category classification (Academic, Infrastructure, Hostel, Fee, Other).
   - Status tracking timeline (Open -> In Progress -> Resolved / Rejected).

9. **Student Profile (`/profile`)**:
   - Official academic identity: Roll Number, Class Group, Department, Semester, Enrollment status.

10. **Real-time Live Notifications (STOMP WebSockets)**:
    - WebSocket connection to `/user/queue/events`.
    - Instant live notification toast and bell badge updates for attendance updates, marks releases, assignment postings, and notice publications.

## Running the Application
### Backend:
```bash
cd backend
mvn spring-boot:run
```
Default URL: `http://localhost:8080`
Demo student credentials: `student` / `student123`

### Frontend:
```bash
cd frontend
npm install
npm run dev
```

### Verification & Tests:
```bash
# Backend unit tests
cd backend && mvn test

# Frontend TypeScript verification
cd frontend && npm run typecheck
```
