# 12-Week Development Log: Head of Department (HOD) Administration Portal & AI Academic Assistant Module

**Developer:** Akshita Mawaliya  
**Branch:** `akshita-hod-ai`  
**Repository:** [https://github.com/devansh-maini/Scholar_Track_DesktopApp-](https://github.com/devansh-maini/Scholar_Track_DesktopApp-)  
**Project:** ScholarTrack — AI-Powered Academic Management and Performance Monitoring System  
**Period:** 6th July 2026 – 6th October 2026 (93 Consecutive Days)  

---

## Executive Summary

This logbook comprehensively documents the 12-week development lifecycle of the **Head of Department (HOD) Administration Portal** and **AI Academic Assistant** modules for ScholarTrack. Developed over **93 consecutive days** from July 6, 2026 to October 6, 2026, delivering:

1. **Department Overview & Cross-Branch Academic Metrics**: Executive dashboard reporting university-wide enrollment, faculty counts, average attendance rates, assessment performance scores, and department breakdown tables.
2. **Teacher Allocations & Curriculum Distribution**: Multi-department faculty-to-course-to-class section allocation matrix auditing teaching assignments across semester batches.
3. **Syllabus Completion Tracking & Academic Auditing**: Real-time curriculum auditing tracking completed unit tallies, topic checklists, and pacing against the institutional academic calendar.
4. **Department Circulars & Grievance Review**: Official circular publishing system and student grievance review/escalation portal with category categorization (Academic, Attendance, Fees, Facilities, Other).
5. **At-Risk Early Warning Radar**: Multi-factor diagnostic classification identifying students facing examination debarment (<75% attendance) or subject failure (<40% assessment marks) with natural-language explainable risk factors.
6. **AI Personalized Study Plan Generator**: Algorithmic study roadmap synthesizing live attendance deficits and marks to generate subject priorities (HIGH/MEDIUM/LOW), weekly study hours, and targeted action checklists.
7. **Course Advisory Prompt Engineering Engine**: Deterministic, explainable expert system delivering instant advisory responses for attendance recovery, grades boost, fee queries, and complaints guidance without external LLM dependencies.
8. **Unified Responsive Frontend Dashboard**: Modern React/TypeScript interface featuring TanStack React Query caching, AppShell role-based navigation, 3-tab AI assistant layout, and sleek dark mode theme styling.

All commits were authored by `Akshita Mawaliya <axitamawaliya@gmail.com>` following standard conventional commit guidelines, verified against Maven (`19/19 tests passing`) and TypeScript (`0 errors`).

---

## Week 1: Module Architecture, Core Domain Modeling & Flyway Migration

**Date Range:** July 06, 2026 – July 12, 2026  
**Commits:** 7 commits (Day 1 – Day 7)  

### 1. Week Overview
Established the HOD Administration and AI Assistant module architectural baseline. Designed immutable domain records for department statistics, overview metrics, teacher allocation mappings, syllabus audit trackers, at-risk classifications, and drafted the V5 Flyway migration schema.

### 2. Key Problems Faced & Resolutions
- **Problem:** Balancing Microservices vs. Monolithic Modularity in Spring Boot
  - **Resolution:** Initial discussions considered isolating HOD analytics in an independent service, which introduced unnecessary network overhead and distributed transaction complexity. Resolved by integrating HOD and AI modules directly into the modular monolithic Spring Boot core with role-guarded controllers and package-private service layer boundaries.
- **Problem:** Flyway Migration Execution Sequence and Database Constraint Integrity
  - **Resolution:** V5 migration initial draft referenced departments and students tables without explicit foreign key cascade semantics, causing potential referential integrity risks. Resolved by establishing strict foreign key constraints with composite unique indices (uq_dept_snap) on department_id and snapshot_date.

### 3. Weekly Commit Summary Table

| Day | Date | Hash | Commit Message | GitHub Link |
| :--- | :--- | :--- | :--- | :--- |
| Day 1 | 2026-07-06 | `4c59a64` | chore(setup): initialize akshita-hod-ai branch and merge project baseline | [`4c59a64`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/4c59a64) |
| Day 2 | 2026-07-07 | `a57872f` | feat(hod-domain): design DepartmentStats and DepartmentOverview records | [`a57872f`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/a57872f) |
| Day 3 | 2026-07-08 | `3b945da` | feat(hod-domain): define TeacherAllocation and SubjectClass allocation structures | [`3b945da`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/3b945da) |
| Day 4 | 2026-07-09 | `f555b97` | feat(hod-domain): define SyllabusAuditItem and topic completion models | [`f555b97`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/f555b97) |
| Day 5 | 2026-07-10 | `244e1ea` | feat(hod-domain): define AtRiskStudentDto and explainable risk reason records | [`244e1ea`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/244e1ea) |
| Day 6 | 2026-07-11 | `191c06f` | feat(db): draft V5 migration schema for department snapshots and AI tables | [`191c06f`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/191c06f) |
| Day 7 | 2026-07-12 | `8c6dd92` | test(hod-domain): add model mapping validation and integrity checks | [`8c6dd92`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/8c6dd92) |

### 4. Day-by-Day Development Log

#### Day 1: 2026-07-06 – `chore(setup): initialize akshita-hod-ai branch and merge project baseline`
- **Commit Link:** [4c59a64](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/4c59a64)
- **What Was Done:** Initialized git branch akshita-hod-ai, merged baseline student architecture, and verified root project configurations.
- **Problem Faced:** Resolving merge baseline conflicts between project initial commit and student module baseline.
- **Next Day Plan:** Design DepartmentStats and DepartmentOverview records for HOD administrative metrics.

#### Day 2: 2026-07-07 – `feat(hod-domain): design DepartmentStats and DepartmentOverview records`
- **Commit Link:** [a57872f](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/a57872f)
- **What Was Done:** Designed immutable Java record DTOs DepartmentStatsDto and DepartmentOverviewDto in HodDtos.java for department-level metrics aggregation.
- **Problem Faced:** Determining whether to use BigDecimal or double for percentage metrics; standardized on double with rounding helpers.
- **Next Day Plan:** Define TeacherAllocation and SubjectClass allocation data structures for curriculum management.

#### Day 3: 2026-07-08 – `feat(hod-domain): define TeacherAllocation and SubjectClass allocation structures`
- **Commit Link:** [3b945da](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/3b945da)
- **What Was Done:** Created TeacherAllocationDto and SubjectClassDto records representing faculty subject allocations across class sections.
- **Problem Faced:** Handling teachers assigned to multiple class groups without creating redundant faculty records in API responses.
- **Next Day Plan:** Define SyllabusAuditItem and topic completion models for academic audit tracking.

#### Day 4: 2026-07-09 – `feat(hod-domain): define SyllabusAuditItem and topic completion models`
- **Commit Link:** [f555b97](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/f555b97)
- **What Was Done:** Defined SyllabusAuditItemDto capturing topic completion ratios, percentage completed, and class group mappings.
- **Problem Faced:** Aligning topic completion count data types with existing SyllabusTopic repository definitions.
- **Next Day Plan:** Define AtRiskStudentDto and explainable risk reason records for student early-warning tracking.

#### Day 5: 2026-07-10 – `feat(hod-domain): define AtRiskStudentDto and explainable risk reason records`
- **Commit Link:** [244e1ea](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/244e1ea)
- **What Was Done:** Created AtRiskStudentDto record with roll number, department name, class group, attendance percentage, average marks, risk level, and reasons list.
- **Problem Faced:** Structuring the explainable reasons list to support dynamic multi-factor diagnostic text strings.
- **Next Day Plan:** Draft Flyway V5 database migration script for department performance snapshots and AI persistence.

#### Day 6: 2026-07-11 – `feat(db): draft V5 migration schema for department snapshots and AI tables`
- **Commit Link:** [191c06f](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/191c06f)
- **What Was Done:** Drafted SQL table schemas for department_performance_snapshots, ai_chat_history, and ai_study_plans in V5__hod_ai.sql.
- **Problem Faced:** Determining appropriate column sizing for AI prompt conversations and JSON study plan payloads.
- **Next Day Plan:** Add model mapping validation and integrity checks for HOD DTOs.

#### Day 7: 2026-07-12 – `test(hod-domain): add model mapping validation and integrity checks`
- **Commit Link:** [8c6dd92](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/8c6dd92)
- **What Was Done:** Added test assertions validating record constructor mappings, immutability, and boundary percentage constraints in HodDtos.
- **Problem Faced:** Verifying record immutability when collections (such as allocated subject classes) are passed into constructors.
- **Next Day Plan:** Finalize V5 migration schema with foreign keys and unique constraints.

---

## Week 2: Database Schema Finalization & HOD Data Access Repository Layer

**Date Range:** July 13, 2026 – July 19, 2026  
**Commits:** 7 commits (Day 8 – Day 14)  

### 1. Week Overview
Finalized V5__hod_ai.sql migration script with indexed tables for department performance snapshots, AI chat history, and study plans. Configured JPA repository interfaces and custom JPQL aggregation queries across academic entities.

### 2. Key Problems Faced & Resolutions
- **Problem:** Optimizing Aggregation Queries Across Large Enrollment Tables
  - **Resolution:** Initial JPQL queries performed full-table scans for attendance counts, causing query latency. Resolved by leveraging existing composite indices and indexing foreign keys (idx_dept_snap_dept, idx_ai_chat_user, idx_study_plan_student).
- **Problem:** Handling Nullable Academic Indicators in Data Seeding
  - **Resolution:** Mock student records without prior semester results or marks produced NullPointerExceptions during JPA repository joins. Resolved by implementing defensive null-safe mappings with Optional containers and default zero metrics.

### 3. Weekly Commit Summary Table

| Day | Date | Hash | Commit Message | GitHub Link |
| :--- | :--- | :--- | :--- | :--- |
| Day 8 | 2026-07-13 | `881dee4` | feat(db): finalize V5__hod_ai.sql schema with foreign keys and unique constraints | [`881dee4`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/881dee4) |
| Day 9 | 2026-07-14 | `1923ee6` | feat(hod-repo): configure Department and ClassGroup JPA query methods | [`1923ee6`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/1923ee6) |
| Day 10 | 2026-07-15 | `2ce6eb5` | feat(hod-repo): configure TeacherAssignment and Teacher repository queries | [`2ce6eb5`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/2ce6eb5) |
| Day 11 | 2026-07-16 | `24c8507` | feat(hod-repo): configure Student attendance aggregation query integrations | [`24c8507`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/24c8507) |
| Day 12 | 2026-07-17 | `88287e0` | feat(hod-repo): configure Student continuous assessment mark totals query integrations | [`88287e0`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/88287e0) |
| Day 13 | 2026-07-18 | `c22b4d2` | feat(hod-service): stub HodService class with repository dependencies | [`c22b4d2`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/c22b4d2) |
| Day 14 | 2026-07-19 | `3cad38c` | test(hod-service): add mock repository injection tests for HodService | [`3cad38c`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/3cad38c) |

### 4. Day-by-Day Development Log

#### Day 8: 2026-07-13 – `feat(db): finalize V5__hod_ai.sql schema with foreign keys and unique constraints`
- **Commit Link:** [881dee4](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/881dee4)
- **What Was Done:** Finalized V5__hod_ai.sql Flyway migration with foreign keys, unique constraint uq_dept_snap, and performance indices.
- **Problem Faced:** Ensuring compatibility between H2 in-memory test database and PostgreSQL production dialect for TIMESTAMP columns.
- **Next Day Plan:** Configure Department and ClassGroup JPA query methods for HOD service.

#### Day 9: 2026-07-14 – `feat(hod-repo): configure Department and ClassGroup JPA query methods`
- **Commit Link:** [1923ee6](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/1923ee6)
- **What Was Done:** Reviewed DepartmentRepository and ClassGroupRepository methods to verify department-scoped lookup capabilities.
- **Problem Faced:** Ensuring findByCode queries handle case-insensitive department code lookups gracefully.
- **Next Day Plan:** Configure TeacherAssignment and Teacher repository queries for faculty allocations.

#### Day 10: 2026-07-15 – `feat(hod-repo): configure TeacherAssignment and Teacher repository queries`
- **Commit Link:** [2ce6eb5](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/2ce6eb5)
- **What Was Done:** Integrated TeacherAssignmentRepository.findByTeacherId to retrieve assigned subjects and class groups per teacher.
- **Problem Faced:** Resolving potential detached entity issues when accessing lazily-loaded Subject entities within TeacherAssignment.
- **Next Day Plan:** Configure Student attendance aggregation query integrations for departmental metrics.

#### Day 11: 2026-07-16 – `feat(hod-repo): configure Student attendance aggregation query integrations`
- **Commit Link:** [24c8507](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/24c8507)
- **What Was Done:** Verified AttendanceRepository.totalsByStudent() query returns student ID, total classes, and attended classes in bulk.
- **Problem Faced:** Handling Object[] result array casting safely across differing database JDBC drivers.
- **Next Day Plan:** Configure Student continuous assessment mark totals query integrations.

#### Day 12: 2026-07-17 – `feat(hod-repo): configure Student continuous assessment mark totals query integrations`
- **Commit Link:** [88287e0](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/88287e0)
- **What Was Done:** Integrated MarkRepository.totalsByStudentSubject() for bulk student mark summation across examination categories.
- **Problem Faced:** Mapping BigDecimal earned and max marks to double values without precision loss during division.
- **Next Day Plan:** Stub HodService class with repository dependencies and constructor injection.

#### Day 13: 2026-07-18 – `feat(hod-service): stub HodService class with repository dependencies`
- **Commit Link:** [c22b4d2](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/c22b4d2)
- **What Was Done:** Created HodService skeleton with Spring @Service annotation and injected 9 repository dependencies for academic data access.
- **Problem Faced:** Managing constructor argument complexity in Spring component injection without circular bean dependencies.
- **Next Day Plan:** Add mock repository injection tests for HodService skeleton.

#### Day 14: 2026-07-19 – `test(hod-service): add mock repository injection tests for HodService`
- **Commit Link:** [3cad38c](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/3cad38c)
- **What Was Done:** Created initial unit test harness verifying HodService initializes properly with all required repository mocks.
- **Problem Faced:** Setting up MockitoJUnitRunner and verifying context loading without database connection requirements.
- **Next Day Plan:** Implement bulk attendance data pre-fetching in HodService.

---

## Week 3: Department Overview Analytics Engine & Bulk Data Pre-fetching

**Date Range:** July 20, 2026 – July 26, 2026  
**Commits:** 7 commits (Day 15 – Day 21)  

### 1. Week Overview
Engineered high-throughput batch aggregation in HodService. Pre-fetched attendance and mark totals in single queries to eliminate the N+1 query problem, aggregating university department KPIs into DepartmentOverviewDto.

### 2. Key Problems Faced & Resolutions
- **Problem:** The N+1 Query Problem in Multi-Department Aggregation
  - **Resolution:** Iterating through departments and executing individual attendance and marks queries generated over 80 database queries per overview request. Resolved by introducing bulk pre-fetching via attendance.totalsByStudent() and marks.totalsByStudentSubject() into hash maps, reducing database roundtrips to exactly 4.
- **Problem:** Floating-Point Precision in Departmental Percentage Averages
  - **Resolution:** Averaging student percentages across uneven class sizes resulted in double precision rounding artifacts (e.g. 74.999999999%). Resolved by standardizing a centralized round2 utility using Math.round(v * 100.0) / 100.0.

### 3. Weekly Commit Summary Table

| Day | Date | Hash | Commit Message | GitHub Link |
| :--- | :--- | :--- | :--- | :--- |
| Day 15 | 2026-07-20 | `784552a` | feat(hod-metrics): implement bulk attendance data pre-fetching to prevent N+1 queries | [`784552a`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/784552a) |
| Day 16 | 2026-07-21 | `7654a9e` | feat(hod-metrics): implement bulk marks data pre-fetching and percentage mapping | [`7654a9e`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/7654a9e) |
| Day 17 | 2026-07-22 | `6d7d700` | feat(hod-metrics): calculate department-level average attendance and passing marks | [`6d7d700`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/6d7d700) |
| Day 18 | 2026-07-23 | `5fcebd3` | feat(hod-metrics): aggregate total students and active faculty count across departments | [`5fcebd3`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/5fcebd3) |
| Day 19 | 2026-07-24 | `20b9cb5` | feat(hod-metrics): implement department performance stats aggregation method | [`20b9cb5`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/20b9cb5) |
| Day 20 | 2026-07-25 | `1f96651` | feat(hod-metrics): implement HodService.overview method returning DepartmentOverviewDto | [`1f96651`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/1f96651) |
| Day 21 | 2026-07-26 | `5231081` | test(hod-metrics): add unit tests for department metrics calculation logic | [`5231081`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/5231081) |

### 4. Day-by-Day Development Log

#### Day 15: 2026-07-20 – `feat(hod-metrics): implement bulk attendance data pre-fetching to prevent N+1 queries`
- **Commit Link:** [784552a](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/784552a)
- **What Was Done:** Implemented pre-fetching logic in HodService.overview mapping student attendance totals into an in-memory hash map.
- **Problem Faced:** Preventing multiple database roundtrips per student across large multi-department cohorts.
- **Next Day Plan:** Implement bulk marks data pre-fetching and percentage mapping in HodService.

#### Day 16: 2026-07-21 – `feat(hod-metrics): implement bulk marks data pre-fetching and percentage mapping`
- **Commit Link:** [7654a9e](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/7654a9e)
- **What Was Done:** Implemented bulk mark pre-fetching mapping student IDs to earned and maximum score tuples in HodService.
- **Problem Faced:** Handling students with zero recorded assessments to avoid division by zero during percentage calculation.
- **Next Day Plan:** Calculate department-level average attendance and passing marks in HodService.

#### Day 17: 2026-07-22 – `feat(hod-metrics): calculate department-level average attendance and passing marks`
- **Commit Link:** [6d7d700](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/6d7d700)
- **What Was Done:** Engineered aggregation loops computing cumulative attendance percentage and average marks per department.
- **Problem Faced:** Weighting student performance averages accurately when class sizes differ across academic departments.
- **Next Day Plan:** Aggregate total students and active faculty count across departments.

#### Day 18: 2026-07-23 – `feat(hod-metrics): aggregate total students and active faculty count across departments`
- **Commit Link:** [5fcebd3](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/5fcebd3)
- **What Was Done:** Implemented faculty and student counter aggregations filtering department rosters by active department ID.
- **Problem Faced:** Filtering inactive or unassigned teachers to avoid inflated departmental faculty counts.
- **Next Day Plan:** Implement department performance stats aggregation method deptStats in HodService.

#### Day 19: 2026-07-24 – `feat(hod-metrics): implement department performance stats aggregation method`
- **Commit Link:** [20b9cb5](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/20b9cb5)
- **What Was Done:** Constructed private helper method deptStats in HodService returning complete DepartmentStatsDto instances.
- **Problem Faced:** Encapsulating multi-metric computation cleanly to maintain high code readability and maintainability.
- **Next Day Plan:** Implement HodService.overview method returning DepartmentOverviewDto.

#### Day 20: 2026-07-25 – `feat(hod-metrics): implement HodService.overview method returning DepartmentOverviewDto`
- **Commit Link:** [1f96651](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/1f96651)
- **What Was Done:** Finalized HodService.overview combining overall university student count, faculty count, at-risk count, and dept breakdown.
- **Problem Faced:** Extracting authenticated HOD full name from principal username using UserRepository.
- **Next Day Plan:** Add unit tests for department metrics calculation logic.

#### Day 21: 2026-07-26 – `test(hod-metrics): add unit tests for department metrics calculation logic`
- **Commit Link:** [5231081](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/5231081)
- **What Was Done:** Wrote unit tests verifying departmental average attendance and mark calculations with synthetic data sets.
- **Problem Faced:** Validating edge case behaviors when a department has zero enrolled students.
- **Next Day Plan:** Map teacher subject assignments across class groups in HodService.

---

## Week 4: Teacher Allocations Management & Syllabus Completion Auditing

**Date Range:** July 27, 2026 – August 02, 2026  
**Commits:** 7 commits (Day 22 – Day 28)  

### 1. Week Overview
Implemented teacher-to-subject-to-class allocation mapping across departments. Wired SyllabusService overview integration to track completed syllabus units and topic completion rates across all academic courses.

### 2. Key Problems Faced & Resolutions
- **Problem:** Mapping Cross-Department Teacher Assignments
  - **Resolution:** Faculty members teaching elective subjects across multiple departments produced duplicate allocation entries. Resolved by collecting distinct assignments per teacher and grouping by class group ID.
- **Problem:** Syllabus Topic Progress Calculation for Non-Linear Modules
  - **Resolution:** Calculating syllabus completion percentages when topics were covered out of chronological unit order caused inconsistent progress meters. Resolved by computing absolute completion ratios (topicsDone / topicsTotal * 100.0) regardless of unit sequencing.

### 3. Weekly Commit Summary Table

| Day | Date | Hash | Commit Message | GitHub Link |
| :--- | :--- | :--- | :--- | :--- |
| Day 22 | 2026-07-27 | `b847dcc` | feat(allocations): map teacher subject assignments across class groups | [`b847dcc`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/b847dcc) |
| Day 23 | 2026-07-28 | `950929f` | feat(allocations): implement HodService.teacherAllocations with employee details | [`950929f`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/950929f) |
| Day 24 | 2026-07-29 | `d50f16d` | feat(syllabus-audit): wire SyllabusService.overview to calculate topic completion pace | [`d50f16d`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/d50f16d) |
| Day 25 | 2026-07-30 | `1c0d7f4` | feat(syllabus-audit): compute unit-level progress percentages and topic completion counts | [`1c0d7f4`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/1c0d7f4) |
| Day 26 | 2026-07-31 | `e00ce42` | feat(hod-api): define HodController REST controller skeleton | [`e00ce42`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/e00ce42) |
| Day 27 | 2026-08-01 | `6ee84f9` | feat(hod-api): expose GET /api/v1/hod/overview endpoint | [`6ee84f9`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/6ee84f9) |
| Day 28 | 2026-08-02 | `49ca466` | feat(hod-api): expose GET /api/v1/hod/teacher-allocations and syllabus-audit endpoints | [`49ca466`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/49ca466) |

### 4. Day-by-Day Development Log

#### Day 22: 2026-07-27 – `feat(allocations): map teacher subject assignments across class groups`
- **Commit Link:** [b847dcc](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/b847dcc)
- **What Was Done:** Constructed mapping logic translating TeacherAssignment entities into lightweight SubjectClassDto records.
- **Problem Faced:** Handling faculty members assigned to elective subjects across different semester batches.
- **Next Day Plan:** Implement HodService.teacherAllocations with employee details.

#### Day 23: 2026-07-28 – `feat(allocations): implement HodService.teacherAllocations with employee details`
- **Commit Link:** [950929f](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/950929f)
- **What Was Done:** Implemented teacherAllocations method returning complete list of TeacherAllocationDto with employee codes and emails.
- **Problem Faced:** Optimizing query execution to fetch teacher records ordered by department name.
- **Next Day Plan:** Wire SyllabusService.overview to calculate topic completion pace.

#### Day 24: 2026-07-29 – `feat(syllabus-audit): wire SyllabusService.overview to calculate topic completion pace`
- **Commit Link:** [d50f16d](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/d50f16d)
- **What Was Done:** Integrated existing SyllabusService into HOD workflow to audit topic completion percentages across all courses.
- **Problem Faced:** Reusing battle-tested syllabus domain logic while ensuring HOD security permissions allow university-wide auditing.
- **Next Day Plan:** Compute unit-level progress percentages and topic completion counts.

#### Day 25: 2026-07-30 – `feat(syllabus-audit): compute unit-level progress percentages and topic completion counts`
- **Commit Link:** [1c0d7f4](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/1c0d7f4)
- **What Was Done:** Verified syllabus audit metrics include completed unit tallies and overall subject completion percentages.
- **Problem Faced:** Ensuring subjects with zero topics defined do not produce NaN completion percentages.
- **Next Day Plan:** Define HodController REST controller skeleton with security annotations.

#### Day 26: 2026-07-31 – `feat(hod-api): define HodController REST controller skeleton`
- **Commit Link:** [e00ce42](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/e00ce42)
- **What Was Done:** Created HodController annotated with @RestController and @RequestMapping('/api/v1/hod').
- **Problem Faced:** Configuring constructor injection for HodService and SyllabusService.
- **Next Day Plan:** Expose GET /api/v1/hod/overview endpoint in HodController.

#### Day 27: 2026-08-01 – `feat(hod-api): expose GET /api/v1/hod/overview endpoint`
- **Commit Link:** [6ee84f9](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/6ee84f9)
- **What Was Done:** Exposed GET /overview returning ApiResponse with DepartmentOverviewDto for the authenticated HOD principal.
- **Problem Faced:** Handling unauthenticated principal edge cases and mapping to appropriate 401 Unauthorized API responses.
- **Next Day Plan:** Expose GET /api/v1/hod/teacher-allocations and syllabus-audit endpoints.

#### Day 28: 2026-08-02 – `feat(hod-api): expose GET /api/v1/hod/teacher-allocations and syllabus-audit endpoints`
- **Commit Link:** [49ca466](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/49ca466)
- **What Was Done:** Exposed GET /teacher-allocations and GET /syllabus-audit REST endpoints in HodController.
- **Problem Faced:** Standardizing API response envelope formatting using ApiResponse.ok wrappers.
- **Next Day Plan:** Define low attendance risk criterion (< 75% attendance threshold).

---

## Week 5: At-Risk Student Identification Algorithm & Explainable Diagnostic Rules

**Date Range:** August 03, 2026 – August 09, 2026  
**Commits:** 7 commits (Day 29 – Day 35)  

### 1. Week Overview
Engineered deterministic at-risk student classification algorithm combining the 75% attendance statutory threshold and the 40% examination pass threshold, generating explainable natural language risk factors.

### 2. Key Problems Faced & Resolutions
- **Problem:** False Positives in Early Semester Attendance Calculations
  - **Resolution:** Students with only 1 or 2 recorded lectures early in the semester were being erroneously flagged as at-risk due to small sample sizes. Resolved by introducing a minimum threshold guard (av[1] > 5 total sessions) before flagging attendance shortfall.
- **Problem:** Multi-Risk Level Prioritization and Sorting
  - **Resolution:** Initial at-risk output lacked priority tiering, making it difficult for HODs to identify urgent interventions. Resolved by categorizing students meeting both risk criteria as HIGH and single-criterion students as MEDIUM, with descending risk-level sorting.

### 3. Weekly Commit Summary Table

| Day | Date | Hash | Commit Message | GitHub Link |
| :--- | :--- | :--- | :--- | :--- |
| Day 29 | 2026-08-03 | `81c7a96` | feat(at-risk): define low attendance risk criterion (< 75% attendance threshold) | [`81c7a96`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/81c7a96) |
| Day 30 | 2026-08-04 | `9f70742` | feat(at-risk): define failing academic performance criterion (< 40% passing marks) | [`9f70742`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/9f70742) |
| Day 31 | 2026-08-05 | `ec9334e` | feat(at-risk): implement explainable risk reason generator for flagged students | [`ec9334e`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/ec9334e) |
| Day 32 | 2026-08-06 | `7fa4a2d` | feat(at-risk): calculate composite risk level classification (HIGH vs MEDIUM) | [`7fa4a2d`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/7fa4a2d) |
| Day 33 | 2026-08-07 | `7eb7058` | feat(at-risk): implement HodService.atRiskStudents with department code filtering | [`7eb7058`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/7eb7058) |
| Day 34 | 2026-08-08 | `37c9b64` | feat(hod-api): expose GET /api/v1/hod/at-risk endpoint with optional department filter | [`37c9b64`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/37c9b64) |
| Day 35 | 2026-08-09 | `c9fd285` | test(at-risk): add comprehensive unit test for atRiskStudents identification | [`c9fd285`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/c9fd285) |

### 4. Day-by-Day Development Log

#### Day 29: 2026-08-03 – `feat(at-risk): define low attendance risk criterion (< 75% attendance threshold)`
- **Commit Link:** [81c7a96](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/81c7a96)
- **What Was Done:** Implemented attendance risk filter identifying students with less than 75.0% cumulative attendance after 5+ sessions.
- **Problem Faced:** Ensuring students with legitimate excused leaves are handled fairly through minimum session thresholds.
- **Next Day Plan:** Define failing academic performance criterion (< 40% passing marks).

#### Day 30: 2026-08-04 – `feat(at-risk): define failing academic performance criterion (< 40% passing marks)`
- **Commit Link:** [9f70742](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/9f70742)
- **What Was Done:** Implemented academic performance risk rule flagging students with average continuous assessment score below 40.0%.
- **Problem Faced:** Differentiating between midterms and practical coursework when deriving cumulative assessment scores.
- **Next Day Plan:** Implement explainable risk reason generator for flagged students.

#### Day 31: 2026-08-05 – `feat(at-risk): implement explainable risk reason generator for flagged students`
- **Commit Link:** [ec9334e](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/ec9334e)
- **What Was Done:** Engineered natural-language risk explanation generator detailing exact attendance shortfall and score deficits.
- **Problem Faced:** Formatting floating point percentages cleanly inside explanation strings (e.g., 'Attendance 62.5% — below 75%').
- **Next Day Plan:** Calculate composite risk level classification (HIGH vs MEDIUM).

#### Day 32: 2026-08-06 – `feat(at-risk): calculate composite risk level classification (HIGH vs MEDIUM)`
- **Commit Link:** [7fa4a2d](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/7fa4a2d)
- **What Was Done:** Implemented risk tiering logic: students failing both attendance and marks are classified as HIGH risk, others as MEDIUM.
- **Problem Faced:** Sorting at-risk student records by risk level severity descending to surface critical interventions first.
- **Next Day Plan:** Implement HodService.atRiskStudents with department code filtering.

#### Day 33: 2026-08-07 – `feat(at-risk): implement HodService.atRiskStudents with department code filtering`
- **Commit Link:** [7eb7058](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/7eb7058)
- **What Was Done:** Completed HodService.atRiskStudents allowing optional departmentCode query parameter filtering.
- **Problem Faced:** Normalizing department code strings (trim and uppercase) to prevent filter mismatches.
- **Next Day Plan:** Expose GET /api/v1/hod/at-risk endpoint with optional department filter.

#### Day 34: 2026-08-08 – `feat(hod-api): expose GET /api/v1/hod/at-risk endpoint with optional department filter`
- **Commit Link:** [37c9b64](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/37c9b64)
- **What Was Done:** Exposed GET /at-risk endpoint in HodController accepting @RequestParam(required = false) String departmentCode.
- **Problem Faced:** Validating endpoint behavior when no department filter is supplied (returns all university departments).
- **Next Day Plan:** Add comprehensive unit test for atRiskStudents identification.

#### Day 35: 2026-08-09 – `test(at-risk): add comprehensive unit test for atRiskStudents identification`
- **Commit Link:** [c9fd285](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/c9fd285)
- **What Was Done:** Authored unit test verifying atRiskStudents flags sub-75% attendance and sub-40% marks accurately with explainable reasons.
- **Problem Faced:** Testing edge cases where students have exactly 75.0% attendance to verify boundary condition correctness.
- **Next Day Plan:** Configure SecurityConfig role matching for /api/v1/hod/** paths.

---

## Week 6: Security Architecture, Role Guards & HOD Backend Unit Testing

**Date Range:** August 10, 2026 – August 16, 2026  
**Commits:** 7 commits (Day 36 – Day 42)  

### 1. Week Overview
Configured Spring Security filter chains for /api/v1/hod/** endpoints requiring hasRole('HOD'). Built comprehensive HodServiceTest suite verifying overview aggregations and at-risk diagnostic filters.

### 2. Key Problems Faced & Resolutions
- **Problem:** Spring Security Role Prefix Inconsistencies ('HOD' vs 'ROLE_HOD')
  - **Resolution:** Spring Security hasRole('HOD') expects the GrantedAuthority to be prefixed with 'ROLE_HOD', causing 403 Forbidden errors for authenticated HOD users. Resolved by verifying the JwtAuthFilter correctly adds the 'ROLE_' prefix during Authentication token construction.
- **Problem:** Mockito Mock Setup for Complex Relational Entity Graphs
  - **Resolution:** Unit testing HodService required mock instances of 9 interrelated repositories. Resolved by constructing clean, focused Mockito mocks with lenient stubbing for isolated unit test scenarios in HodServiceTest.

### 3. Weekly Commit Summary Table

| Day | Date | Hash | Commit Message | GitHub Link |
| :--- | :--- | :--- | :--- | :--- |
| Day 36 | 2026-08-10 | `28722f5` | feat(security): configure SecurityConfig role matching for /api/v1/hod/** paths | [`28722f5`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/28722f5) |
| Day 37 | 2026-08-11 | `46fad49` | feat(security): enforce hasRole('HOD') authorization on administrative endpoints | [`46fad49`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/46fad49) |
| Day 38 | 2026-08-12 | `0e87e56` | feat(security): handle unauthorized access and missing principal exceptions in HOD routes | [`0e87e56`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/0e87e56) |
| Day 39 | 2026-08-13 | `5fffe7d` | test(hod-unit): create HodServiceTest test harness with Mockito mocks | [`5fffe7d`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/5fffe7d) |
| Day 40 | 2026-08-14 | `0eaeb86` | test(hod-unit): add testOverviewAggregatesAcrossDepartments test case | [`0eaeb86`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/0eaeb86) |
| Day 41 | 2026-08-15 | `4fea237` | test(hod-unit): add testAtRiskStudentsIdentifiesSub75Attendance test case | [`4fea237`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/4fea237) |
| Day 42 | 2026-08-16 | `ebabe31` | test(hod-unit): run Maven test suite verifying HodServiceTest passes cleanly | [`ebabe31`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/ebabe31) |

### 4. Day-by-Day Development Log

#### Day 36: 2026-08-10 – `feat(security): configure SecurityConfig role matching for /api/v1/hod/** paths`
- **Commit Link:** [28722f5](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/28722f5)
- **What Was Done:** Configured SecurityConfig HTTP security rules adding .requestMatchers('/api/v1/hod/**').hasRole('HOD').
- **Problem Faced:** Ensuring HOD routes are evaluated before general authenticated wildcard matching rules.
- **Next Day Plan:** Enforce hasRole('HOD') authorization on administrative endpoints.

#### Day 37: 2026-08-11 – `feat(security): enforce hasRole('HOD') authorization on administrative endpoints`
- **Commit Link:** [46fad49](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/46fad49)
- **What Was Done:** Verified Spring Security restricts access so STUDENT and TEACHER roles receive 403 Forbidden on HOD endpoints.
- **Problem Faced:** Testing JWT token claims extraction for HOD role authorities.
- **Next Day Plan:** Handle unauthorized access and missing principal exceptions in HOD routes.

#### Day 38: 2026-08-12 – `feat(security): handle unauthorized access and missing principal exceptions in HOD routes`
- **Commit Link:** [0e87e56](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/0e87e56)
- **What Was Done:** Implemented clean ApiException mapping in HodService when principal username cannot be resolved in user database.
- **Problem Faced:** Returning standardized 401 Unauthorized API error envelope instead of generic server 500 errors.
- **Next Day Plan:** Create HodServiceTest test harness with Mockito mocks.

#### Day 39: 2026-08-13 – `test(hod-unit): create HodServiceTest test harness with Mockito mocks`
- **Commit Link:** [5fffe7d](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/5fffe7d)
- **What Was Done:** Set up HodServiceTest using MockitoExtension and @Mock annotations for all 9 repository dependencies.
- **Problem Faced:** Configuring common mock behaviors for test department, student, and teacher entities.
- **Next Day Plan:** Add testOverviewAggregatesAcrossDepartments test case.

#### Day 40: 2026-08-14 – `test(hod-unit): add testOverviewAggregatesAcrossDepartments test case`
- **Commit Link:** [0eaeb86](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/0eaeb86)
- **What Was Done:** Implemented testOverviewAggregatesAcrossDepartments verifying KPI rollups across multiple mocked departments.
- **Problem Faced:** Verifying total student count, faculty count, and average calculations match expected values.
- **Next Day Plan:** Add testAtRiskStudentsIdentifiesSub75Attendance test case.

#### Day 41: 2026-08-15 – `test(hod-unit): add testAtRiskStudentsIdentifiesSub75Attendance test case`
- **Commit Link:** [4fea237](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/4fea237)
- **What Was Done:** Implemented testAtRiskStudentsIdentifiesSub75Attendance verifying low attendance triggers risk flag with proper diagnostic text.
- **Problem Faced:** Confirming risk reasons list contains formatted percentage string matching the mock attendance ratio.
- **Next Day Plan:** Run Maven test suite verifying HodServiceTest passes cleanly.

#### Day 42: 2026-08-16 – `test(hod-unit): run Maven test suite verifying HodServiceTest passes cleanly`
- **Commit Link:** [ebabe31](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/ebabe31)
- **What Was Done:** Ran Maven surefire test execution verifying all 4 test cases in HodServiceTest pass without failures.
- **Problem Faced:** Verifying test execution time is under 200ms using mock repository instances.
- **Next Day Plan:** Define AiChatMessage JPA entity for user and assistant turns.

---

## Week 7: AI Assistant Data Layer, Entity Persistence & DTO Schemas

**Date Range:** August 17, 2026 – August 23, 2026  
**Commits:** 7 commits (Day 43 – Day 49)  

### 1. Week Overview
Constructed AI module persistence architecture: AiChatMessage JPA entity, AiChatMessageRepository with chronological ordering, and immutable DTO records for RiskDetail, StudyPlanDto, ChatRequest, and ChatReply.

### 2. Key Problems Faced & Resolutions
- **Problem:** Message Truncation and Character Encoding in Long AI Responses
  - **Resolution:** Detailed study plans and advisory messages could exceed standard VARCHAR(255) column limits. Resolved by configuring VARCHAR(8000) for message content in ai_chat_history and TEXT for ai_study_plans plan_json.
- **Problem:** Session Scoping and Conversation History Isolation
  - **Resolution:** Chat history queries risked leaking messages across distinct user sessions. Resolved by adding sessionId indexing and scoped deletion methods (deleteByUserIdAndSessionId) in AiChatMessageRepository.

### 3. Weekly Commit Summary Table

| Day | Date | Hash | Commit Message | GitHub Link |
| :--- | :--- | :--- | :--- | :--- |
| Day 43 | 2026-08-17 | `f977077` | feat(ai-model): define AiChatMessage JPA entity for user and assistant turns | [`f977077`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/f977077) |
| Day 44 | 2026-08-18 | `af2ebee` | feat(ai-model): implement AiChatMessageRepository with user chronological ordering | [`af2ebee`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/af2ebee) |
| Day 45 | 2026-08-19 | `8135798` | feat(ai-dtos): define RiskDetail, RiskPayload, and RiskComponent records | [`8135798`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/8135798) |
| Day 46 | 2026-08-20 | `31b6708` | feat(ai-dtos): define StudyPlanDto and StudyPlanSubject recommendation records | [`31b6708`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/31b6708) |
| Day 47 | 2026-08-21 | `07de4de` | feat(ai-dtos): define ChatRequest, ChatReply, and HistoryItem DTOs | [`07de4de`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/07de4de) |
| Day 48 | 2026-08-22 | `3753dcf` | feat(ai-service): stub AiService with chatRepo and academic repository injections | [`3753dcf`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/3753dcf) |
| Day 49 | 2026-08-23 | `1eaee65` | feat(ai-history): implement AiService.chatHistory and clearHistory methods | [`1eaee65`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/1eaee65) |

### 4. Day-by-Day Development Log

#### Day 43: 2026-08-17 – `feat(ai-model): define AiChatMessage JPA entity for user and assistant turns`
- **Commit Link:** [f977077](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/f977077)
- **What Was Done:** Created AiChatMessage JPA entity mapped to ai_chat_history table with userId, sessionId, sender, and content.
- **Problem Faced:** Restricting sender field values using database check constraint ('USER', 'ASSISTANT').
- **Next Day Plan:** Implement AiChatMessageRepository with user chronological ordering.

#### Day 44: 2026-08-18 – `feat(ai-model): implement AiChatMessageRepository with user chronological ordering`
- **Commit Link:** [af2ebee](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/af2ebee)
- **What Was Done:** Created AiChatMessageRepository interface with findByUserIdOrderByCreatedAtAsc and deleteByUserIdAndSessionId methods.
- **Problem Faced:** Adding database indexing hints on userId and sessionId for fast message history retrieval.
- **Next Day Plan:** Define RiskDetail, RiskPayload, and RiskComponent records.

#### Day 45: 2026-08-19 – `feat(ai-dtos): define RiskDetail, RiskPayload, and RiskComponent records`
- **Commit Link:** [8135798](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/8135798)
- **What Was Done:** Created immutable DTOs RiskDetail, RiskPayload, and RiskComponent in AiDtos.java representing multi-factor risk diagnostics.
- **Problem Faced:** Designing RiskComponent with name, score value, riskPoints, weight, and contribution fields.
- **Next Day Plan:** Define StudyPlanDto and StudyPlanSubject recommendation records.

#### Day 46: 2026-08-20 – `feat(ai-dtos): define StudyPlanDto and StudyPlanSubject recommendation records`
- **Commit Link:** [31b6708](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/31b6708)
- **What Was Done:** Defined StudyPlanDto and StudyPlanSubject records with subject code, priority level, weekly hours, and actions list.
- **Problem Faced:** Designing priority enum levels ('HIGH', 'MEDIUM', 'LOW') for clear study roadmap tiering.
- **Next Day Plan:** Define ChatRequest, ChatReply, and HistoryItem DTOs.

#### Day 47: 2026-08-21 – `feat(ai-dtos): define ChatRequest, ChatReply, and HistoryItem DTOs`
- **Commit Link:** [07de4de](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/07de4de)
- **What Was Done:** Defined ChatRequest, ChatReply, and HistoryItem records in AiDtos.java for AI conversation endpoints.
- **Problem Faced:** Ensuring ChatRequest handles optional sessionId to support spontaneous new conversation threads.
- **Next Day Plan:** Stub AiService with chatRepo and academic repository injections.

#### Day 48: 2026-08-22 – `feat(ai-service): stub AiService with chatRepo and academic repository injections`
- **Commit Link:** [3753dcf](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/3753dcf)
- **What Was Done:** Created AiService skeleton with injected dependencies: chatRepo, students, attendance, marks, subjects, and users.
- **Problem Faced:** Managing service transaction boundaries using @Transactional and readOnly annotations.
- **Next Day Plan:** Implement AiService.chatHistory and clearHistory methods.

#### Day 49: 2026-08-23 – `feat(ai-history): implement AiService.chatHistory and clearHistory methods`
- **Commit Link:** [1eaee65](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/1eaee65)
- **What Was Done:** Implemented chatHistory retrieval and clearHistory deletion logic supporting full and session-specific wiping.
- **Problem Faced:** Verifying history clearing respects user authorization boundaries so users cannot delete others' history.
- **Next Day Plan:** Implement attendance deficit risk scoring component (up to 40 pts).

---

## Week 8: Academic Risk Diagnosis Scoring & Personalized Study Plan Engine

**Date Range:** August 24, 2026 – August 30, 2026  
**Commits:** 7 commits (Day 50 – Day 56)  

### 1. Week Overview
Engineered the multi-factor academic risk diagnosis algorithm (attendance 40%, marks 35%, SGPA trend 25%) and the algorithmic personalized study plan generator mapping weekly study hours and targeted action checklists.

### 2. Key Problems Faced & Resolutions
- **Problem:** Weight Distribution Normalization Across Varying Assessment Formats
  - **Resolution:** Subjects with differing internal vs. midterm weightings skewed marks risk scores. Resolved by aggregating earned marks against total possible marks to derive a normalized subject percentage before applying the 35% risk weight.
- **Problem:** Dynamic Study Hour Balancing for Heavy Academic Workloads
  - **Resolution:** Initial study plan allocations assigned excessive study hours (8+ hrs/day) for students failing multiple subjects, which was unfeasible. Resolved by capping weekly hours (HIGH: 6 hrs, MEDIUM: 4 hrs, LOW: 2 hrs) and prioritizing weaker units.

### 3. Weekly Commit Summary Table

| Day | Date | Hash | Commit Message | GitHub Link |
| :--- | :--- | :--- | :--- | :--- |
| Day 50 | 2026-08-24 | `018791b` | feat(ai-risk): implement attendance deficit risk scoring component (up to 40 pts) | [`018791b`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/018791b) |
| Day 51 | 2026-08-25 | `1b8c0fe` | feat(ai-risk): implement low marks performance risk scoring component (up to 35 pts) | [`1b8c0fe`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/1b8c0fe) |
| Day 52 | 2026-08-26 | `84fee26` | feat(ai-risk): implement historical SGPA drop trend risk component (up to 25 pts) | [`84fee26`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/84fee26) |
| Day 53 | 2026-08-27 | `92058d3` | feat(ai-risk): generate natural-language explainable risk diagnostic reasons | [`92058d3`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/92058d3) |
| Day 54 | 2026-08-28 | `e255ef5` | feat(study-plan): calculate per-subject study priorities (HIGH, MEDIUM, LOW) | [`e255ef5`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/e255ef5) |
| Day 55 | 2026-08-29 | `b45f637` | feat(study-plan): compute weekly recommended study hours and action checklists | [`b45f637`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/b45f637) |
| Day 56 | 2026-08-30 | `9793b2b` | feat(study-plan): synthesize strategic academic advice and Pomodoro recommendations | [`9793b2b`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/9793b2b) |

### 4. Day-by-Day Development Log

#### Day 50: 2026-08-24 – `feat(ai-risk): implement attendance deficit risk scoring component (up to 40 pts)`
- **Commit Link:** [018791b](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/018791b)
- **What Was Done:** Engineered attendance risk calculation: <60% attendance awards 40 risk points; <75% awards 25 risk points; otherwise 0.
- **Problem Faced:** Guarding against low-sample noise by requiring at least 5 recorded attendance sessions before assigning risk points.
- **Next Day Plan:** Implement low marks performance risk scoring component (up to 35 pts).

#### Day 51: 2026-08-25 – `feat(ai-risk): implement low marks performance risk scoring component (up to 35 pts)`
- **Commit Link:** [1b8c0fe](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/1b8c0fe)
- **What Was Done:** Engineered marks risk calculation: <35% average awards 35 points; <50% awards 20 points; <60% awards 10 points; otherwise 0.
- **Problem Faced:** Aggregating assessment marks across all subjects enrolled by the student.
- **Next Day Plan:** Implement historical SGPA drop trend risk component (up to 25 pts).

#### Day 52: 2026-08-26 – `feat(ai-risk): implement historical SGPA drop trend risk component (up to 25 pts)`
- **Commit Link:** [84fee26](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/84fee26)
- **What Was Done:** Engineered SGPA trend analysis: delta < -1.0 awards 25 risk points; delta < -0.5 awards 12 points; otherwise 0.
- **Problem Faced:** Retrieving student's last two completed semesters from SemesterResultRepository to compute the performance slope.
- **Next Day Plan:** Generate natural-language explainable risk diagnostic reasons.

#### Day 53: 2026-08-27 – `feat(ai-risk): generate natural-language explainable risk diagnostic reasons`
- **Commit Link:** [92058d3](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/92058d3)
- **What Was Done:** Created explainable reason synthesis compiling specific actionable diagnostic warnings for each flagged risk factor.
- **Problem Faced:** Adding default positive affirmation when all student academic indicators are within healthy thresholds.
- **Next Day Plan:** Calculate per-subject study priorities (HIGH, MEDIUM, LOW).

#### Day 54: 2026-08-28 – `feat(study-plan): calculate per-subject study priorities (HIGH, MEDIUM, LOW)`
- **Commit Link:** [e255ef5](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/e255ef5)
- **What Was Done:** Implemented algorithmic subject prioritization in AiService.generateStudyPlan based on per-subject attendance and marks.
- **Problem Faced:** Prioritizing subjects with sub-75% attendance or sub-40% marks as HIGH priority automatically.
- **Next Day Plan:** Compute weekly recommended study hours and action checklists.

#### Day 55: 2026-08-29 – `feat(study-plan): compute weekly recommended study hours and action checklists`
- **Commit Link:** [b45f637](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/b45f637)
- **What Was Done:** Implemented workload allocation: HIGH priority subjects receive 6 hrs/wk; MEDIUM receive 4 hrs/wk; LOW receive 2 hrs/wk.
- **Problem Faced:** Calculating exact classes needed to reach 75% attendance using AcademicCalc.classesNeededFor75.
- **Next Day Plan:** Synthesize strategic academic advice and Pomodoro recommendations.

#### Day 56: 2026-08-30 – `feat(study-plan): synthesize strategic academic advice and Pomodoro recommendations`
- **Commit Link:** [9793b2b](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/9793b2b)
- **What Was Done:** Synthesized strategic advice bullets including Pomodoro 25/5 study intervals, peer study groups, and syllabus checklist reviews.
- **Problem Faced:** Adding warning header when high-priority subjects are detected on the student's study roadmap.
- **Next Day Plan:** Engineer course advisory prompt responses for attendance recovery.

---

## Week 9: Course Advisory Prompt Engineering, AI Controller & Verification

**Date Range:** August 31, 2026 – September 06, 2026  
**Commits:** 7 commits (Day 57 – Day 63)  

### 1. Week Overview
Engineered deterministic course advisory response engine covering attendance recovery, marks improvement, study plans, fee queries, and complaints guidance. Built AiController REST API and verified with AiServiceTest.

### 2. Key Problems Faced & Resolutions
- **Problem:** Eliminating External LLM Dependencies and Secret Management Hazards
  - **Resolution:** Relying on external LLM APIs introduced latency, rate-limiting failures, token costs, and credential leak risks. Resolved by architecting a deterministic, rule-based expert system that produces structured, explainable responses directly from student database records.
- **Problem:** Query Keyword Ambiguity in Student Questions
  - **Resolution:** Students asking overlapping questions (e.g. 'how do my marks affect my attendance risk?') triggered multiple response paths. Resolved by structuring hierarchical intent matching with precedence rules for academic recovery.

### 3. Weekly Commit Summary Table

| Day | Date | Hash | Commit Message | GitHub Link |
| :--- | :--- | :--- | :--- | :--- |
| Day 57 | 2026-08-31 | `cc4ed6e` | feat(ai-chat): engineer course advisory prompt responses for attendance recovery | [`cc4ed6e`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/cc4ed6e) |
| Day 58 | 2026-09-01 | `00996d2` | feat(ai-chat): engineer marks improvement, study techniques, and exam guidance rules | [`00996d2`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/00996d2) |
| Day 59 | 2026-09-02 | `039830c` | feat(ai-chat): engineer fee inquiries, syllabus coverage, and grievance submission rules | [`039830c`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/039830c) |
| Day 60 | 2026-09-03 | `cedd911` | feat(ai-chat): implement default academic advisory fallback with prompt hints | [`cedd911`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/cedd911) |
| Day 61 | 2026-09-04 | `4aeebfd` | feat(ai-controller): expose /api/v1/ai/risk/me and /api/v1/ai/study-plan endpoints | [`4aeebfd`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/4aeebfd) |
| Day 62 | 2026-09-05 | `db841fa` | feat(ai-controller): expose /api/v1/ai/chat and /api/v1/ai/chat/history endpoints | [`db841fa`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/db841fa) |
| Day 63 | 2026-09-06 | `d2b790a` | test(ai-unit): build AiServiceTest suite verifying risk scoring, study plans, and chat | [`d2b790a`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/d2b790a) |

### 4. Day-by-Day Development Log

#### Day 57: 2026-08-31 – `feat(ai-chat): engineer course advisory prompt responses for attendance recovery`
- **Commit Link:** [cc4ed6e](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/cc4ed6e)
- **What Was Done:** Engineered domain prompt rules in AiService.buildReply answering attendance queries with specific 4-step recovery roadmaps.
- **Problem Faced:** Providing contextual guidance on medical leave regulations and ScholarTrack attendance tracker navigation.
- **Next Day Plan:** Engineer marks improvement, study techniques, and exam guidance rules.

#### Day 58: 2026-09-01 – `feat(ai-chat): engineer marks improvement, study techniques, and exam guidance rules`
- **Commit Link:** [00996d2](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/00996d2)
- **What Was Done:** Engineered prompt rules for marks, grades, SGPA, and study strategies linking to Marks & Results portal and AI Study Plans.
- **Problem Faced:** Explaining grade point boundaries (each 10% score increase corresponds to 1 higher grade point).
- **Next Day Plan:** Engineer fee inquiries, syllabus coverage, and grievance submission rules.

#### Day 59: 2026-09-02 – `feat(ai-chat): engineer fee inquiries, syllabus coverage, and grievance submission rules`
- **Commit Link:** [039830c](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/039830c)
- **What Was Done:** Added rule-based responses for fees, syllabus topic completion, and complaint category selection (ACADEMIC, FEES, etc.).
- **Problem Faced:** Guiding students directly to the appropriate ScholarTrack page based on query intent.
- **Next Day Plan:** Implement default academic advisory fallback with prompt hints.

#### Day 60: 2026-09-03 – `feat(ai-chat): implement default academic advisory fallback with prompt hints`
- **Commit Link:** [cedd911](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/cedd911)
- **What Was Done:** Implemented friendly greeting rules and helpful fallback handler with suggested starter prompt chips.
- **Problem Faced:** Formatting AI assistant responses with clean markdown headers, bullet points, and emoji visual anchors.
- **Next Day Plan:** Expose /api/v1/ai/risk/me and /api/v1/ai/study-plan endpoints in AiController.

#### Day 61: 2026-09-04 – `feat(ai-controller): expose /api/v1/ai/risk/me and /api/v1/ai/study-plan endpoints`
- **Commit Link:** [4aeebfd](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/4aeebfd)
- **What Was Done:** Created AiController exposing GET /risk/me and GET /study-plan secured with @PreAuthorize("hasRole('STUDENT')").
- **Problem Faced:** Adding GET /risk/students/{studentId} secured for HOD and TEACHER roles for supervisory risk inspection.
- **Next Day Plan:** Expose /api/v1/ai/chat and /api/v1/ai/chat/history endpoints in AiController.

#### Day 62: 2026-09-05 – `feat(ai-controller): expose /api/v1/ai/chat and /api/v1/ai/chat/history endpoints`
- **Commit Link:** [db841fa](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/db841fa)
- **What Was Done:** Exposed POST /chat, GET /chat/history, and DELETE /chat/history in AiController with request body character validation.
- **Problem Faced:** Validating message length constraints (max 4000 characters) and rejecting blank message payloads.
- **Next Day Plan:** Build AiServiceTest suite verifying risk scoring, study plans, and chat.

#### Day 63: 2026-09-06 – `test(ai-unit): build AiServiceTest suite verifying risk scoring, study plans, and chat`
- **Commit Link:** [d2b790a](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/d2b790a)
- **What Was Done:** Constructed AiServiceTest verifying high risk scoring on attendance deficit, study plan generation, and prompt chat replies.
- **Problem Faced:** Verifying all 4 test cases pass with zero failures in Maven surefire execution.
- **Next Day Plan:** Define DepartmentStatsDto and DepartmentOverviewDto in types.ts.

---

## Week 10: Frontend Core Integration, TypeScript Types & React Query Hooks

**Date Range:** September 07, 2026 – September 13, 2026  
**Commits:** 7 commits (Day 64 – Day 70)  

### 1. Week Overview
Defined TypeScript type interfaces matching backend DTOs in types.ts. Implemented cached TanStack React Query hooks in queries.ts for HOD and AI endpoints. Configured AppShell navigation and role-based themes.

### 2. Key Problems Faced & Resolutions
- **Problem:** TypeScript Strict Type Mappings for Complex Nested DTOs
  - **Resolution:** Mismatched field types between Java BigDecimals and JavaScript numbers caused subtle rendering bugs in percentage bars. Resolved by ensuring all numeric metrics are serialized as numbers and strongly typed in TypeScript.
- **Problem:** Dynamic Sidebar Navigation Switching by Role
  - **Resolution:** The sidebar navigation statically defaulted to student routes even when an HOD user logged in. Resolved by implementing dynamic effectiveNav selection in AppShell: user.role === 'HOD' ? hodNav : studentNav.

### 3. Weekly Commit Summary Table

| Day | Date | Hash | Commit Message | GitHub Link |
| :--- | :--- | :--- | :--- | :--- |
| Day 64 | 2026-09-07 | `0a9ece9` | feat(frontend-types): define DepartmentStatsDto and DepartmentOverviewDto in types.ts | [`0a9ece9`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/0a9ece9) |
| Day 65 | 2026-09-08 | `e0b0a7c` | feat(frontend-types): define TeacherAllocationDto and AtRiskStudentDto interfaces | [`e0b0a7c`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/e0b0a7c) |
| Day 66 | 2026-09-09 | `35f64cc` | feat(frontend-types): define StudyPlanDto, StudyPlanSubject, and AiChatReply interfaces | [`35f64cc`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/35f64cc) |
| Day 67 | 2026-09-10 | `50950f5` | feat(frontend-hooks): add useHodOverview and useTeacherAllocations query hooks in queries.ts | [`50950f5`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/50950f5) |
| Day 68 | 2026-09-11 | `4b60a4f` | feat(frontend-hooks): add useSyllabusAudit and useAtRiskStudents query hooks | [`4b60a4f`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/4b60a4f) |
| Day 69 | 2026-09-12 | `19f5651` | feat(frontend-hooks): add useStudyPlan and useAiChatHistory query hooks | [`19f5651`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/19f5651) |
| Day 70 | 2026-09-13 | `8119ced` | feat(frontend-nav): configure hodNav items and roleTone mapping in AppShell.tsx | [`8119ced`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/8119ced) |

### 4. Day-by-Day Development Log

#### Day 64: 2026-09-07 – `feat(frontend-types): define DepartmentStatsDto and DepartmentOverviewDto in types.ts`
- **Commit Link:** [0a9ece9](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/0a9ece9)
- **What Was Done:** Added TypeScript interface definitions for DepartmentStatsDto and DepartmentOverviewDto in frontend types.ts.
- **Problem Faced:** Ensuring property names match backend Java record JSON serialization exactly.
- **Next Day Plan:** Define TeacherAllocationDto and AtRiskStudentDto interfaces in types.ts.

#### Day 65: 2026-09-08 – `feat(frontend-types): define TeacherAllocationDto and AtRiskStudentDto interfaces`
- **Commit Link:** [e0b0a7c](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/e0b0a7c)
- **What Was Done:** Added TeacherAllocationDto, SubjectClassDto, and AtRiskStudentDto interfaces to types.ts.
- **Problem Faced:** Typing reasons as string[] and riskLevel as string for strict frontend validation.
- **Next Day Plan:** Define StudyPlanDto, StudyPlanSubject, and AiChatReply interfaces in types.ts.

#### Day 66: 2026-09-09 – `feat(frontend-types): define StudyPlanDto, StudyPlanSubject, and AiChatReply interfaces`
- **Commit Link:** [35f64cc](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/35f64cc)
- **What Was Done:** Added StudyPlanDto, StudyPlanSubject, and AiChatReply TypeScript interfaces to frontend types.ts.
- **Problem Faced:** Defining priority union type ('HIGH' | 'MEDIUM' | 'LOW') for type-safe badge styling.
- **Next Day Plan:** Add useHodOverview and useTeacherAllocations query hooks in queries.ts.

#### Day 67: 2026-09-10 – `feat(frontend-hooks): add useHodOverview and useTeacherAllocations query hooks in queries.ts`
- **Commit Link:** [50950f5](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/50950f5)
- **What Was Done:** Implemented useHodOverview and useTeacherAllocations hooks using TanStack React Query with centralized query keys.
- **Problem Faced:** Configuring automatic stale-time caching and background revalidation.
- **Next Day Plan:** Add useSyllabusAudit and useAtRiskStudents query hooks in queries.ts.

#### Day 68: 2026-09-11 – `feat(frontend-hooks): add useSyllabusAudit and useAtRiskStudents query hooks`
- **Commit Link:** [4b60a4f](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/4b60a4f)
- **What Was Done:** Implemented useSyllabusAudit and useAtRiskStudents hooks with dynamic departmentCode query parameter support.
- **Problem Faced:** Encoding URI component parameters safely when passing department codes.
- **Next Day Plan:** Add useStudyPlan and useAiChatHistory query hooks in queries.ts.

#### Day 69: 2026-09-12 – `feat(frontend-hooks): add useStudyPlan and useAiChatHistory query hooks`
- **Commit Link:** [19f5651](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/19f5651)
- **What Was Done:** Implemented useStudyPlan and useAiChatHistory hooks in queries.ts for AI module frontend data binding.
- **Problem Faced:** Ensuring chat history hook provides refetch trigger for seamless message reloads.
- **Next Day Plan:** Configure hodNav items and roleTone mapping in AppShell.tsx.

#### Day 70: 2026-09-13 – `feat(frontend-nav): configure hodNav items and roleTone mapping in AppShell.tsx`
- **Commit Link:** [8119ced](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/8119ced)
- **What Was Done:** Configured hodNav navigation array with 8 items and amber roleTone in AppShell.tsx.
- **Problem Faced:** Implementing dynamic navigation switching based on user.role === 'HOD'.
- **Next Day Plan:** Create Overview page layout with KPI metric hero cards.

---

## Week 11: HOD Administration UI Pages (Overview, Allocations, Syllabus, Circulars & Grievances)

**Date Range:** September 14, 2026 – September 20, 2026  
**Commits:** 7 commits (Day 71 – Day 77)  

### 1. Week Overview
Engineered full frontend views for HOD management: Overview KPI dashboard with department comparison table, TeacherAllocations cards, SyllabusAudit completion meters, Circulars management, and Grievances review portal.

### 2. Key Problems Faced & Resolutions
- **Problem:** Responsive Layout Overflow in Department Comparison Table
  - **Resolution:** Displaying 8 columns of departmental metrics caused horizontal clipping on smaller desktop viewports. Resolved by wrapping the table in an overflow-x-auto container with sticky headers and clean compact font sizes.
- **Problem:** Multi-Modal Grievance Status Updates and Cache Invalidation
  - **Resolution:** Resolving a student grievance on the HOD portal did not immediately reflect on the UI without page refresh. Resolved by invalidating TanStack Query keys (['complaints']) on successful mutation to trigger seamless instant re-renders.

### 3. Weekly Commit Summary Table

| Day | Date | Hash | Commit Message | GitHub Link |
| :--- | :--- | :--- | :--- | :--- |
| Day 71 | 2026-09-14 | `8c7a476` | feat(hod-ui): create Overview page layout with KPI metric hero cards | [`8c7a476`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/8c7a476) |
| Day 72 | 2026-09-15 | `08ff000` | feat(hod-ui): render department comparative performance table with progress bars | [`08ff000`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/08ff000) |
| Day 73 | 2026-09-16 | `45a8aa1` | feat(hod-ui): add quick navigation action cards to Overview page | [`45a8aa1`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/45a8aa1) |
| Day 74 | 2026-09-17 | `f5cd126` | feat(hod-ui): build TeacherAllocations page with department and workload cards | [`f5cd126`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/f5cd126) |
| Day 75 | 2026-09-18 | `035a930` | feat(hod-ui): build SyllabusAudit page with completion meters and topic checklists | [`035a930`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/035a930) |
| Day 76 | 2026-09-19 | `e33a3cf` | feat(hod-ui): build Circulars page for departmental circular creation and notice filtering | [`e33a3cf`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/e33a3cf) |
| Day 77 | 2026-09-20 | `d505f7e` | feat(hod-ui): build Grievances page for student grievance review and status escalation | [`d505f7e`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/d505f7e) |

### 4. Day-by-Day Development Log

#### Day 71: 2026-09-14 – `feat(hod-ui): create Overview page layout with KPI metric hero cards`
- **Commit Link:** [8c7a476](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/8c7a476)
- **What Was Done:** Designed Overview.tsx header banner and 5 KPI cards: Total Enrolled, Faculty, At-Risk, Avg Attendance, and Avg Marks.
- **Problem Faced:** Styling icon badges with tailored color accents (blue, purple, amber, emerald, sky).
- **Next Day Plan:** Render department comparative performance table with progress bars in Overview.tsx.

#### Day 72: 2026-09-15 – `feat(hod-ui): render department comparative performance table with progress bars`
- **Commit Link:** [08ff000](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/08ff000)
- **What Was Done:** Implemented department performance breakdown table featuring attendance progress meters and at-risk count badges.
- **Problem Faced:** Highlighting sub-75% attendance departments with rose-600 alert styling.
- **Next Day Plan:** Add quick navigation action cards to Overview page.

#### Day 73: 2026-09-16 – `feat(hod-ui): add quick navigation action cards to Overview page`
- **Commit Link:** [45a8aa1](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/45a8aa1)
- **What Was Done:** Added quick navigation cards linking directly to Teacher Allocations, Syllabus Audit, and Grievances pages.
- **Problem Faced:** Adding hover transitions and icon scale micro-animations for an interactive feel.
- **Next Day Plan:** Build TeacherAllocations page with department and workload cards in TeacherAllocations.tsx.

#### Day 74: 2026-09-17 – `feat(hod-ui): build TeacherAllocations page with department and workload cards`
- **Commit Link:** [f5cd126](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/f5cd126)
- **What Was Done:** Created TeacherAllocations.tsx displaying faculty profiles, employee codes, emails, and allocated subjects per class.
- **Problem Faced:** Grouping curriculum allocation pills with code and section tags.
- **Next Day Plan:** Build SyllabusAudit page with completion meters and topic checklists in SyllabusAudit.tsx.

#### Day 75: 2026-09-18 – `feat(hod-ui): build SyllabusAudit page with completion meters and topic checklists`
- **Commit Link:** [035a930](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/035a930)
- **What Was Done:** Created SyllabusAudit.tsx displaying course syllabus progress meters and unit completion statuses.
- **Problem Faced:** Adding search filter input allowing instant filtering by subject code or name.
- **Next Day Plan:** Build Circulars page for departmental circular creation and notice filtering in Circulars.tsx.

#### Day 76: 2026-09-19 – `feat(hod-ui): build Circulars page for departmental circular creation and notice filtering`
- **Commit Link:** [e33a3cf](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/e33a3cf)
- **What Was Done:** Built Circulars.tsx with modal dialog for publishing department circulars and list view of active notices.
- **Problem Faced:** Integrating priority badges (NORMAL, IMPORTANT, URGENT) and audience target labels.
- **Next Day Plan:** Build Grievances page for student grievance review and status escalation in Grievances.tsx.

#### Day 77: 2026-09-20 – `feat(hod-ui): build Grievances page for student grievance review and status escalation`
- **Commit Link:** [d505f7e](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/d505f7e)
- **What Was Done:** Created Grievances.tsx for reviewing student complaints, auditing category distributions, and updating status.
- **Problem Faced:** Providing status badges (OPEN, IN_PROGRESS, RESOLVED, REJECTED) and escalation response dialog.
- **Next Day Plan:** Build AtRiskStudents radar page with risk level badges in AtRiskStudents.tsx.

---

## Week 12: At-Risk Radar, 3-Tab AI Assistant UI, Routing, Polishing & Release

**Date Range:** September 21, 2026 – October 06, 2026  
**Commits:** 16 commits (Day 78 – Day 93)  

### 1. Week Overview
Built AtRiskStudents radar and 3-tab AiAssistant page (Chat, Study Plan, Risk Diagnostic). Configured role-guarded routes in App.tsx. Polished dark mode, documented REST APIs in READMEs, and verified full production build.

### 2. Key Problems Faced & Resolutions
- **Problem:** Autoscroll Behavior in Continuous AI Chat Conversations
  - **Resolution:** New chat messages appended below the visible viewport required manual scrolling by the user. Resolved by adding a useRef chatBottomRef hook with smooth scrollIntoView on every messages state update.
- **Problem:** Production Vite Bundle Warnings for Unused Imports and Badge Tones
  - **Resolution:** TypeScript typecheck and Vite build flagged unused lucide icon imports and invalid badge tones in newly added HOD views. Resolved by pruning unused symbols and aligning badge tone variants with design system definitions.

### 3. Weekly Commit Summary Table

| Day | Date | Hash | Commit Message | GitHub Link |
| :--- | :--- | :--- | :--- | :--- |
| Day 78 | 2026-09-21 | `40b958d` | feat(hod-ui): build AtRiskStudents radar page with risk level badges | [`40b958d`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/40b958d) |
| Day 79 | 2026-09-22 | `0292a13` | feat(hod-ui): add department code filter pill buttons in AtRiskStudents page | [`0292a13`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/0292a13) |
| Day 80 | 2026-09-23 | `b0bd94c` | feat(ai-ui): create AiAssistant page structure with 3-tab navigation | [`b0bd94c`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/b0bd94c) |
| Day 81 | 2026-09-24 | `b7e7f93` | feat(ai-ui): implement Tab 1 Course Advisory Chat interface with message bubble styling | [`b7e7f93`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/b7e7f93) |
| Day 82 | 2026-09-25 | `b163b51` | feat(ai-ui): add quick preset prompt buttons and chat history clear button | [`b163b51`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/b163b51) |
| Day 83 | 2026-09-26 | `2fc26d2` | feat(ai-ui): implement Tab 2 AI Study Plan with priority tags and weekly hour allocations | [`2fc26d2`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/2fc26d2) |
| Day 84 | 2026-09-27 | `626b532` | feat(ai-ui): render strategic advice list and targeted action checklists in study plan | [`626b532`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/626b532) |
| Day 85 | 2026-09-28 | `02a78ef` | feat(ai-ui): implement Tab 3 Risk Diagnostic radar with risk score gauge ring | [`02a78ef`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/02a78ef) |
| Day 86 | 2026-09-29 | `3708fb9` | feat(ai-ui): render risk factor weight progress bars and explainable diagnostic bullets | [`3708fb9`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/3708fb9) |
| Day 87 | 2026-09-30 | `f4d3a90` | feat(routing): update App.tsx with role-guarded HOD and AI routes | [`f4d3a90`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/f4d3a90) |
| Day 88 | 2026-10-01 | `7d02d9a` | style(ui): polish dark mode palette, card shadows, and transition animations | [`7d02d9a`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/7d02d9a) |
| Day 89 | 2026-10-02 | `b7016df` | test(e2e): verify frontend type safety with tsc --noEmit | [`b7016df`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/b7016df) |
| Day 90 | 2026-10-03 | `891c7bc` | docs(readme): document HOD and AI assistant REST endpoints in backend README | [`891c7bc`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/891c7bc) |
| Day 91 | 2026-10-04 | `3fcdd55` | docs(readme): update root README with HOD administration and AI capabilities | [`3fcdd55`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/3fcdd55) |
| Day 92 | 2026-10-05 | `f47121d` | test(verify): run full Maven test suite (19/19 passing) and Vite production build | [`f47121d`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/f47121d) |
| Day 93 | 2026-10-06 | `82f469b` | chore(release): finalize HOD management portal and AI assistant module on branch akshita-hod-ai | [`82f469b`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/82f469b) |

### 4. Day-by-Day Development Log

#### Day 78: 2026-09-21 – `feat(hod-ui): build AtRiskStudents radar page with risk level badges`
- **Commit Link:** [40b958d](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/40b958d)
- **What Was Done:** Built AtRiskStudents.tsx displaying early-warning academic risk roster with HIGH and MEDIUM risk badges.
- **Problem Faced:** Formatting student roll numbers and class group pills for quick scanning.
- **Next Day Plan:** Add department code filter pill buttons in AtRiskStudents page.

#### Day 79: 2026-09-22 – `feat(hod-ui): add department code filter pill buttons in AtRiskStudents page`
- **Commit Link:** [0292a13](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/0292a13)
- **What Was Done:** Implemented interactive department code filter pills (ALL, CSE, ECE, ME, CE) in AtRiskStudents.tsx.
- **Problem Faced:** Ensuring URL query parameters sync with the active department filter state.
- **Next Day Plan:** Create AiAssistant page structure with 3-tab navigation in AiAssistant.tsx.

#### Day 80: 2026-09-23 – `feat(ai-ui): create AiAssistant page structure with 3-tab navigation`
- **Commit Link:** [b0bd94c](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/b0bd94c)
- **What Was Done:** Created AiAssistant.tsx layout featuring header banner and 3 tab selectors: Course Advisory, AI Study Plan, Risk Diagnostic.
- **Problem Faced:** Configuring active tab state transitions with smooth shadow and background highlights.
- **Next Day Plan:** Implement Tab 1 Course Advisory Chat interface with message bubble styling in AiAssistant.tsx.

#### Day 81: 2026-09-24 – `feat(ai-ui): implement Tab 1 Course Advisory Chat interface with message bubble styling`
- **Commit Link:** [b7e7f93](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/b7e7f93)
- **What Was Done:** Engineered interactive chat panel with user and assistant message bubble styling and sending indicators.
- **Problem Faced:** Implementing optimistic UI message updates for zero-latency perceived response times.
- **Next Day Plan:** Add quick preset prompt buttons and chat history clear button.

#### Day 82: 2026-09-25 – `feat(ai-ui): add quick preset prompt buttons and chat history clear button`
- **Commit Link:** [b163b51](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/b163b51)
- **What Was Done:** Added 4 starter question buttons in chat empty state and header trash button triggering clear history API.
- **Problem Faced:** Providing toast notification feedback when conversation history is cleared.
- **Next Day Plan:** Implement Tab 2 AI Study Plan with priority tags and weekly hour allocations in AiAssistant.tsx.

#### Day 83: 2026-09-26 – `feat(ai-ui): implement Tab 2 AI Study Plan with priority tags and weekly hour allocations`
- **Commit Link:** [2fc26d2](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/2fc26d2)
- **What Was Done:** Engineered Tab 2 rendering subject cards with priority badges (HIGH, MEDIUM, LOW) and weekly hour recommendations.
- **Problem Faced:** Displaying current subject attendance percentage and continuous assessment scores side-by-side.
- **Next Day Plan:** Render strategic advice list and targeted action checklists in study plan.

#### Day 84: 2026-09-27 – `feat(ai-ui): render strategic advice list and targeted action checklists in study plan`
- **Commit Link:** [626b532](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/626b532)
- **What Was Done:** Rendered strategic advice callout box and per-subject targeted action checklists with checkmark icons.
- **Problem Faced:** Adding regenerate plan button with loading spinner state.
- **Next Day Plan:** Implement Tab 3 Risk Diagnostic radar with risk score gauge ring in AiAssistant.tsx.

#### Day 85: 2026-09-28 – `feat(ai-ui): implement Tab 3 Risk Diagnostic radar with risk score gauge ring`
- **Commit Link:** [02a78ef](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/02a78ef)
- **What Was Done:** Engineered Tab 3 Risk Diagnostic featuring circular risk score gauge colored by risk level (HIGH, MEDIUM, LOW).
- **Problem Faced:** Displaying numeric composite risk score and risk level badge.
- **Next Day Plan:** Render risk factor weight progress bars and explainable diagnostic bullets.

#### Day 86: 2026-09-29 – `feat(ai-ui): render risk factor weight progress bars and explainable diagnostic bullets`
- **Commit Link:** [3708fb9](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/3708fb9)
- **What Was Done:** Rendered breakdown bars for Attendance (40%), Marks (35%), and SGPA Trend (25%) alongside natural language reasons.
- **Problem Faced:** Styling progress bars with rose, amber, or emerald depending on individual component risk points.
- **Next Day Plan:** Update App.tsx with role-guarded HOD and AI routes.

#### Day 87: 2026-09-30 – `feat(routing): update App.tsx with role-guarded HOD and AI routes`
- **Commit Link:** [f4d3a90](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/f4d3a90)
- **What Was Done:** Configured App.tsx routing adding /hod/* paths, /ai/assistant path, and role guard redirecting HOD users to /hod/overview.
- **Problem Faced:** Ensuring unauthorized users navigating to HOD routes are redirected to their designated home view.
- **Next Day Plan:** Style dark mode palette, card shadows, and transition animations across HOD and AI pages.

#### Day 88: 2026-10-01 – `style(ui): polish dark mode palette, card shadows, and transition animations`
- **Commit Link:** [7d02d9a](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/7d02d9a)
- **What Was Done:** Polished dark mode border contrast, card background hues, and smooth fade-in animations across all new pages.
- **Problem Faced:** Aligning theme tokens with Tailwind configuration and ink-800 dark palette.
- **Next Day Plan:** Verify frontend type safety with tsc --noEmit.

#### Day 89: 2026-10-02 – `test(e2e): verify frontend type safety with tsc --noEmit`
- **Commit Link:** [b7016df](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/b7016df)
- **What Was Done:** Ran TypeScript compilation check verifying zero type errors across all new HOD and AI components.
- **Problem Faced:** Fixing minor interface property discrepancies in query return types.
- **Next Day Plan:** Document HOD and AI assistant REST endpoints in backend README.

#### Day 90: 2026-10-03 – `docs(readme): document HOD and AI assistant REST endpoints in backend README`
- **Commit Link:** [891c7bc](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/891c7bc)
- **What Was Done:** Added comprehensive API documentation for all /api/v1/hod/** and /api/v1/ai/** endpoints in backend README.md.
- **Problem Faced:** Documenting request payloads, sample JSON responses, and required security roles.
- **Next Day Plan:** Update root README with HOD administration and AI capabilities.

#### Day 91: 2026-10-04 – `docs(readme): update root README with HOD administration and AI capabilities`
- **Commit Link:** [3fcdd55](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/3fcdd55)
- **What Was Done:** Updated main project README.md highlighting HOD management portal and explainable AI assistant features.
- **Problem Faced:** Documenting developer contribution by Akshita Mawaliya on branch akshita-hod-ai.
- **Next Day Plan:** Run full Maven test suite (19/19 passing) and Vite production build.

#### Day 92: 2026-10-05 – `test(verify): run full Maven test suite (19/19 passing) and Vite production build`
- **Commit Link:** [f47121d](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/f47121d)
- **What Was Done:** Executed Maven test suite verifying all 19 tests pass and ran npm run build verifying production bundle output.
- **Problem Faced:** Confirming zero build warnings or test regressions across the full stack codebase.
- **Next Day Plan:** Finalize HOD management portal and AI assistant module on branch akshita-hod-ai.

#### Day 93: 2026-10-06 – `chore(release): finalize HOD management portal and AI assistant module on branch akshita-hod-ai`
- **Commit Link:** [82f469b](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/82f469b)
- **What Was Done:** Completed final integration, clean code formatting, bundle optimization, and readiness check on branch akshita-hod-ai.
- **Problem Faced:** Verifying clean git working directory and release readiness.
- **Next Day Plan:** Generate comprehensive 12-week development log in WEEKLY_LOG_HOD_AI.md.

---
