# 12-Week Development Log: Academic Reports and Performance Analytics Module

**Developer:** Aviral Joshi (24EARCS034)  
**Branch:** `aviral-academic-reports`  
**Repository:** [https://github.com/devansh-maini/Scholar_Track_DesktopApp-](https://github.com/devansh-maini/Scholar_Track_DesktopApp-)  
**Project:** ScholarTrack – AI-Powered Academic Management and Performance Monitoring System  
**Period:** 6th July 2026 – 6th October 2026 (93 Consecutive Days)  

---

## Executive Summary

This logbook comprehensively documents the 12-week development lifecycle of the **Academic Reports and Performance Analytics** module for ScholarTrack. The module was developed over **93 consecutive days** from July 6, 2026 to October 6, 2026, delivering:
1. **Student Academic Transcripts & Official Semester Report Cards**: Automated SGPA/CGPA progression calculation, credit weighting, institutional branding, digital verification stamps, and printable grade cards.
2. **Attendance Statistics & Chronic Absenteeism Tracking**: Departmental and class-level compliance auditing, identification of chronic absenteeism (<75%) and critical shortfall (<65%) alerts.
3. **Departmental Exam Analytics & Pass/Fail Distributions**: Multi-section score distributions, cohort standard deviations, medians, and 8-tier grade frequency histograms (`O`, `A+`, `A`, `B+`, `B`, `C`, `P`, `F`).
4. **Fee Payment Audit & Ledger Summaries**: Real-time financial reconciliation, collection efficiency metrics, late-fee accounting, and overdue ledger auditing.
5. **Multi-Format Export Engine**: Server-side document rendering in OpenPDF (PDF with custom typography and institutional seals), Apache POI (Excel `.xlsx` workbooks with styled palettes), and RFC 4180 CSV with formula injection sanitization.
6. **Unified Frontend Dashboard**: Interactive React/TypeScript dashboard with TanStack Query hooks, print media stylesheets, and role-based feature guards.

All commits were authored by `Aviral <aviraljoshisj505@gmail.com>` following standard conventional commit guidelines, verified against Maven (`19/19 tests passing`) and TypeScript (`0 errors`).

---

## Week 1: Module Initialization, Security Foundation & Sanitized CSV Export

**Date Range:** July 6, 2026 – July 12, 2026  
**Commits:** 7 commits (Day 1 – Day 7)  

### 1. Week Overview
Established the academic reports module architecture inside Spring Boot. Defined export formats, unified report exceptions, implemented the deterministic academic risk calculation formula (RiskCalc), and engineered an RFC 4180 compliant CSV export engine featuring formula injection protection.

### 2. Key Problems Faced & Resolutions
- **Problem:** Risk Calculation Determinism
  - **Resolution:** Initial prototype used dynamic weightings that caused divergent risk scores across re-renders. Resolved by standardizing a fixed 100-point deterministic rubric: attendance (35%), marks (30%), assignments (15%), CGPA (10%), and academic trend (10%).
- **Problem:** CSV Formula Injection Vulnerability (CWE-1236)
  - **Resolution:** Exported student CSV files could execute arbitrary code when opened in spreadsheet software if student names or remarks started with formula operators. Resolved by prefixing a single quote (') to cells starting with '=', '+', '-', '@', tab, or carriage return.

### 3. Weekly Commit Summary Table

| Day | Date | Hash | Commit Message | GitHub Link |
| :--- | :--- | :--- | :--- | :--- |
| Day 1 | 2026-07-06 | `482aa6f` | chore(setup): initialize academic reports module and configure project structure | [`482aa6f`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/482aa6f5870a1f368ff3cb15639a07ea1d690093) |
| Day 2 | 2026-07-07 | `88967ea` | feat(report-types): define ReportFormat and export parameter enums | [`88967ea`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/88967ea0fbbb26720c48b3681672c3c7a4fae065) |
| Day 3 | 2026-07-08 | `a71f118` | feat(report-common): define ReportException and HTTP error response mappings | [`a71f118`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/a71f118630ec16b2ebd3188300937c8731918430) |
| Day 4 | 2026-07-09 | `1a6e51c` | feat(report-risk): implement RiskCalc deterministic academic risk scoring formula | [`1a6e51c`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/1a6e51cd6f71cf8e30ffeaff1d0930964e6b60e4) |
| Day 5 | 2026-07-10 | `8006c42` | test(report-risk): add unit tests for academic risk thresholds and boundary scores | [`8006c42`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/8006c426b7fb48f0dfe65a0d22de2669a3f6eae9) |
| Day 6 | 2026-07-11 | `fc1f323` | feat(report-csv): create CsvReportBuilder with formula injection sanitizer | [`fc1f323`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/fc1f323194cb58b142348fd281d211c51fea17d0) |
| Day 7 | 2026-07-12 | `d9a8aa2` | test(report-csv): add unit tests for CSV formula sanitizer and RFC 4180 escaping | [`d9a8aa2`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/d9a8aa2c5bddfeff5d3dbfd845ae890449b2615f) |

### 4. Day-by-Day Development Log

#### Day 1: 2026-07-06 – `chore(setup): initialize academic reports module and configure project structure`
- **Commit Link:** [482aa6f](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/482aa6f5870a1f368ff3cb15639a07ea1d690093)
- **What Was Done:** Initial project workspace setup, directory layout for report module, and Maven dependency configuration.
- **Problem Faced:** Resolving artifact coordinate conflicts between Spring Boot parent and lowagie OpenPDF.
- **Next Day Plan:** Define formal ReportFormat enum and supported export format query parameter constraints.

#### Day 2: 2026-07-07 – `feat(report-types): define ReportFormat and export parameter enums`
- **Commit Link:** [88967ea](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/88967ea0fbbb26720c48b3681672c3c7a4fae065)
- **What Was Done:** Created ReportFormat enum supporting PDF, XLSX, CSV, and JSON representations with safe string parsing.
- **Problem Faced:** Handling case-insensitive user input for export format query parameters safely.
- **Next Day Plan:** Establish standardized ReportException class and GlobalExceptionHandler error responses.

#### Day 3: 2026-07-08 – `feat(report-common): define ReportException and HTTP error response mappings`
- **Commit Link:** [a71f118](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/a71f118630ec16b2ebd3188300937c8731918430)
- **What Was Done:** Implemented ReportException with HTTP status code mappings and structured API error responses.
- **Problem Faced:** Ensuring custom report exceptions maintain clean REST response payloads without exposing stack traces.
- **Next Day Plan:** Implement deterministic RiskCalc formula for academic risk scoring.

#### Day 4: 2026-07-09 – `feat(report-risk): implement RiskCalc deterministic academic risk scoring formula`
- **Commit Link:** [1a6e51c](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/1a6e51cd6f71cf8e30ffeaff1d0930964e6b60e4)
- **What Was Done:** Engineered RiskCalc scoring formula calculating student risk based on attendance, marks, and assignments.
- **Problem Faced:** Balancing weight distribution to ensure boundary edge cases (0% and 100%) calculate accurately.
- **Next Day Plan:** Write unit tests for RiskCalc verifying scoring thresholds and boundary conditions.

#### Day 5: 2026-07-10 – `test(report-risk): add unit tests for academic risk thresholds and boundary scores`
- **Commit Link:** [8006c42](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/8006c426b7fb48f0dfe65a0d22de2669a3f6eae9)
- **What Was Done:** Authored unit test suite RiskCalcTest verifying critical thresholds: LOW, MEDIUM, and HIGH risk bands.
- **Problem Faced:** Constructing edge case scenarios for zero assignments submitted without division-by-zero errors.
- **Next Day Plan:** Create RFC 4180 compliant CsvReportBuilder with formula injection sanitizer.

#### Day 6: 2026-07-11 – `feat(report-csv): create CsvReportBuilder with formula injection sanitizer`
- **Commit Link:** [fc1f323](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/fc1f323194cb58b142348fd281d211c51fea17d0)
- **What Was Done:** Implemented CsvReportBuilder featuring CSV formula injection mitigation and RFC 4180 escaping.
- **Problem Faced:** Preventing spreadsheet execution payloads starting with '=', '+', '-', and '@'.
- **Next Day Plan:** Add unit tests verifying CSV formula sanitization and RFC 4180 delimiter handling.

#### Day 7: 2026-07-12 – `test(report-csv): add unit tests for CSV formula sanitizer and RFC 4180 escaping`
- **Commit Link:** [d9a8aa2](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/d9a8aa2c5bddfeff5d3dbfd845ae890449b2615f)
- **What Was Done:** Authored CsvReportBuilderTest suite confirming RFC 4180 compliance and formula injection prevention.
- **Problem Faced:** Ensuring quotes within cells are properly escaped as double-quotes ("") according to standard.
- **Next Day Plan:** Design StudentTranscriptDto and semester grade card records.

---

## Week 2: Domain Modeling & Data Transfer Objects (DTO) Architecture

**Date Range:** July 13, 2026 – July 19, 2026  
**Commits:** 7 commits (Day 8 – Day 14)  

### 1. Week Overview
Designed immutable Java record DTOs covering the entire spectrum of academic reporting: student transcripts, official registrar report cards, attendance statistics, fee audit ledgers, exam analytics, departmental aggregates, and coursework completion metrics.

### 2. Key Problems Faced & Resolutions
- **Problem:** Circular Dependency Between Academic Entities and Report Models
  - **Resolution:** Directly exposing Hibernate entities caused lazy-loading exceptions and serialization loops during JSON conversion. Resolved by designing lightweight, decoupled Java record DTOs with flat primitive/immutable fields.
- **Problem:** Representation of Multidimensional Exam Distributions
  - **Resolution:** Representing pass/fail ratios and grade distributions required complex nested structures. Resolved by creating modular records (ScoreBucketDto, SubjectGradeDistributionDto) with predefined grade tiers.

### 3. Weekly Commit Summary Table

| Day | Date | Hash | Commit Message | GitHub Link |
| :--- | :--- | :--- | :--- | :--- |
| Day 8 | 2026-07-13 | `44bb6d3` | feat(transcripts): define StudentTranscriptDto and semester grade card records | [`44bb6d3`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/44bb6d3a6a6b9d5fbc678dd4de0888db370e28cc) |
| Day 9 | 2026-07-14 | `a420cf6` | feat(transcripts): create OfficialReportCardDto for registrar grade card generation | [`a420cf6`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/a420cf685da0b0a5ae89abbdb15bee4662b19ec2) |
| Day 10 | 2026-07-15 | `0d9bcef` | feat(attendance-reports): define AttendanceStatisticsReportDto and roster item models | [`0d9bcef`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/0d9bcef72fd806d53942376c3aefae567a88c1cd) |
| Day 11 | 2026-07-16 | `c872e50` | feat(fee-reports): define FeePaymentAuditReportDto and ledger audit item models | [`c872e50`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/c872e502284d01dc49cc512493304108f2b972a5) |
| Day 12 | 2026-07-17 | `2765b15` | feat(exam-analytics): define ExamPerformanceReportDto and score distribution records | [`2765b15`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/2765b153b88769d10a075df7244f8e5b513512f8) |
| Day 13 | 2026-07-18 | `a70f1b5` | feat(department-reports): define DepartmentPerformanceReportDto and summary models | [`a70f1b5`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/a70f1b5c06e1f91f07029022487fca2887c832e6) |
| Day 14 | 2026-07-19 | `d10270f` | feat(coursework-reports): define AssignmentCompletionReportDto and submission metrics | [`d10270f`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/d10270f9aa7ed0db6b52d52a0403c2db4b31cb1f) |

### 4. Day-by-Day Development Log

#### Day 8: 2026-07-13 – `feat(transcripts): define StudentTranscriptDto and semester grade card records`
- **Commit Link:** [44bb6d3](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/44bb6d3a6a6b9d5fbc678dd4de0888db370e28cc)
- **What Was Done:** Designed StudentTranscriptDto with student demographics, SGPA/CGPA, and subject grade lists.
- **Problem Faced:** Modeling elective subjects and variable credit allocations cleanly in Java records.
- **Next Day Plan:** Create OfficialReportCardDto for registrar semester grade card generation.

#### Day 9: 2026-07-14 – `feat(transcripts): create OfficialReportCardDto for registrar grade card generation`
- **Commit Link:** [a420cf6](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/a420cf685da0b0a5ae89abbdb15bee4662b19ec2)
- **What Was Done:** Defined OfficialReportCardDto incorporating institution header, academic session, and result clearance.
- **Problem Faced:** Structuring university grading scale mappings (O, A+, A, B+, B, C, P, F) across semesters.
- **Next Day Plan:** Define AttendanceStatisticsReportDto and class attendance roster models.

#### Day 10: 2026-07-15 – `feat(attendance-reports): define AttendanceStatisticsReportDto and roster item models`
- **Commit Link:** [0d9bcef](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/0d9bcef72fd806d53942376c3aefae567a88c1cd)
- **What Was Done:** Engineered AttendanceStatisticsReportDto with aggregate percentages and student compliance rosters.
- **Problem Faced:** Representing individual student attendance status (OK vs LOW) consistently.
- **Next Day Plan:** Define FeePaymentAuditReportDto and financial ledger models.

#### Day 11: 2026-07-16 – `feat(fee-reports): define FeePaymentAuditReportDto and ledger audit item models`
- **Commit Link:** [c872e50](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/c872e502284d01dc49cc512493304108f2b972a5)
- **What Was Done:** Created FeePaymentAuditReportDto containing ledger records, collection sums, and overdue balances.
- **Problem Faced:** Reconciling partial payments with outstanding amounts across student fee records.
- **Next Day Plan:** Define ExamPerformanceReportDto and score distribution models.

#### Day 12: 2026-07-17 – `feat(exam-analytics): define ExamPerformanceReportDto and score distribution records`
- **Commit Link:** [2765b15](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/2765b153b88769d10a075df7244f8e5b513512f8)
- **What Was Done:** Designed ExamPerformanceReportDto with cohort pass/fail distributions and score tier frequencies.
- **Problem Faced:** Aggregating internal and terminal exam marks into normalized percentage bands.
- **Next Day Plan:** Define DepartmentPerformanceReportDto and summary metrics.

#### Day 13: 2026-07-18 – `feat(department-reports): define DepartmentPerformanceReportDto and summary models`
- **Commit Link:** [a70f1b5](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/a70f1b5c06e1f91f07029022487fca2887c832e6)
- **What Was Done:** Constructed DepartmentPerformanceReportDto providing department-wide academic indicators and KPIs.
- **Problem Faced:** Aggregating multi-class and multi-section performance data into unified departmental metrics.
- **Next Day Plan:** Define AssignmentCompletionReportDto and submission tracking models.

#### Day 14: 2026-07-19 – `feat(coursework-reports): define AssignmentCompletionReportDto and submission metrics`
- **Commit Link:** [d10270f](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/d10270f9aa7ed0db6b52d52a0403c2db4b31cb1f)
- **What Was Done:** Implemented AssignmentCompletionReportDto measuring cohort homework and coursework completion rates.
- **Problem Faced:** Tracking unsubmitted vs submitted coursework across diverse class cohorts.
- **Next Day Plan:** Implement OpenPDF document builder with college branding header.

---

## Week 3: Binary Rendering Engines (OpenPDF & Apache POI) & Report Facade

**Date Range:** July 20, 2026 – July 26, 2026  
**Commits:** 7 commits (Day 15 – Day 21)  

### 1. Week Overview
Engineered the binary PDF document builder using OpenPDF with university branding, and the Excel workbook generator using Apache POI. Implemented the centralized ReportService facade and exposed secured REST endpoints.

### 2. Key Problems Faced & Resolutions
- **Problem:** DecimalFormat Parsing Exception with Currency Prefix
  - **Resolution:** Using new DecimalFormat('Rs. 0.00') crashed with IllegalArgumentException: Multiple decimal separators due to the period in 'Rs.'. Resolved by implementing a dedicated formatCurrency() utility using String.format('Rs. %.2f', val).
- **Problem:** Department Entity No-Arg Constructor Access
  - **Resolution:** Department entity declared a protected no-arg constructor preventing manual instantiation in test mocks. Resolved by fetching department names safely via Spring Data JPA repositories with functional fallback chains.

### 3. Weekly Commit Summary Table

| Day | Date | Hash | Commit Message | GitHub Link |
| :--- | :--- | :--- | :--- | :--- |
| Day 15 | 2026-07-20 | `6d2de8c` | feat(report-pdf): implement OpenPDF document builder with college branding header | [`6d2de8c`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/6d2de8cb69ea454d85633b3c575fb8da6e027393) |
| Day 16 | 2026-07-21 | `4033c7e` | feat(report-excel): implement ExcelReportService using Apache POI with styled palettes | [`4033c7e`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/4033c7e959889ad9f99b2b5efce5c013bdd0f04a) |
| Day 17 | 2026-07-22 | `f433f0a` | feat(reports-service): create ReportService facade orchestrating data aggregation | [`f433f0a`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/f433f0aa01be8d046a2fa2fee0d103a100372931) |
| Day 18 | 2026-07-23 | `9db4c2f` | test(reports-service): add unit tests for PDF and Excel report rendering | [`9db4c2f`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/9db4c2f8deb79a24558c65bdc63b5018328f7b7a) |
| Day 19 | 2026-07-24 | `4215edb` | feat(reports-api): expose role-guarded REST endpoints for academic report generation | [`4215edb`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/4215edb40010d7360cad8418706cc81a93c124ca) |
| Day 20 | 2026-07-25 | `2e44da6` | feat(transcripts): add academic classification and graduation honors calculation | [`2e44da6`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/2e44da659fc1ad31a6447d3e83b9a729bb4b9b76) |
| Day 21 | 2026-07-26 | `8b89f29` | feat(transcripts-pdf): add digital verification stamp and registrar seal to PDF | [`8b89f29`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/8b89f29a0882e55da70897808d3ec3b1a033b0ac) |

### 4. Day-by-Day Development Log

#### Day 15: 2026-07-20 – `feat(report-pdf): implement OpenPDF document builder with college branding header`
- **Commit Link:** [6d2de8c](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/6d2de8cb69ea454d85633b3c575fb8da6e027393)
- **What Was Done:** Built PdfReportService using OpenPDF with university branding, styled headers, and metadata tables.
- **Problem Faced:** Ensuring OpenPDF font factory registers fonts properly across various OS environments.
- **Next Day Plan:** Implement ExcelReportService using Apache POI with styled palettes and auto-column sizing.

#### Day 16: 2026-07-21 – `feat(report-excel): implement ExcelReportService using Apache POI with styled palettes`
- **Commit Link:** [4033c7e](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/4033c7e959889ad9f99b2b5efce5c013bdd0f04a)
- **What Was Done:** Engineered ExcelReportService generating multi-tab Excel workbooks with stylized headers.
- **Problem Faced:** Managing Apache POI cell styles efficiently to prevent font palette bloat.
- **Next Day Plan:** Implement centralized ReportService facade orchestrating data retrieval across repositories.

#### Day 17: 2026-07-22 – `feat(reports-service): create ReportService facade orchestrating data aggregation`
- **Commit Link:** [f433f0a](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/f433f0aa01be8d046a2fa2fee0d103a100372931)
- **What Was Done:** Developed ReportService facade aggregating Student, Attendance, Mark, and Fee repository records.
- **Problem Faced:** Managing multi-entity joins and ensuring transactional isolation across repository calls.
- **Next Day Plan:** Write comprehensive unit tests for PDF and Excel rendering pipelines.

#### Day 18: 2026-07-23 – `test(reports-service): add unit tests for PDF and Excel report rendering`
- **Commit Link:** [9db4c2f](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/9db4c2f8deb79a24558c65bdc63b5018328f7b7a)
- **What Was Done:** Authored ReportServiceTest validating PDF byte stream generation and Excel workbook serialization.
- **Problem Faced:** Mocking repository dependencies cleanly without firing external database queries.
- **Next Day Plan:** Expose role-guarded REST endpoints in ReportController.

#### Day 19: 2026-07-24 – `feat(reports-api): expose role-guarded REST endpoints for academic report generation`
- **Commit Link:** [4215edb](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/4215edb40010d7360cad8418706cc81a93c124ca)
- **What Was Done:** Implemented ReportController exposing endpoints for transcripts, attendance, and fee audit reports.
- **Problem Faced:** Enforcing Spring Security role access guards (@PreAuthorize) across report routes.
- **Next Day Plan:** Add academic classification and graduation honors calculation logic.

#### Day 20: 2026-07-25 – `feat(transcripts): add academic classification and graduation honors calculation`
- **Commit Link:** [2e44da6](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/2e44da659fc1ad31a6447d3e83b9a729bb4b9b76)
- **What Was Done:** Integrated academic classification logic (Distinction, First Class, Second Class) into transcripts.
- **Problem Faced:** Aligning division cutoff boundaries with university statutory guidelines.
- **Next Day Plan:** Add digital verification stamp and registrar seal metadata to PDF reports.

#### Day 21: 2026-07-26 – `feat(transcripts-pdf): add digital verification stamp and registrar seal to PDF`
- **Commit Link:** [8b89f29](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/8b89f29a0882e55da70897808d3ec3b1a033b0ac)
- **What Was Done:** Added digital verification stamp (ST-VERIFIED-AUTH) and official disclaimer block to PDF generator.
- **Problem Faced:** Ensuring footer disclaimer layout stays pinned to bottom without overlapping table rows.
- **Next Day Plan:** Format semester scorecard tabs and cell borders in ExcelReportService.

---

## Week 4: Attendance Auditing, Chronic Absenteeism & Threshold Modeling

**Date Range:** July 27, 2026 – August 2, 2026  
**Commits:** 7 commits (Day 22 – Day 28)  

### 1. Week Overview
Focused on statutory attendance compliance tracking. Introduced chronic absenteeism filtering (<75%), critical at-risk category thresholds (<65%), roster PDF generation, and Excel attendance audit spreadsheets with filtering parameters.

### 2. Key Problems Faced & Resolutions
- **Problem:** Division-by-Zero in Attendance Percentage Calculation
  - **Resolution:** Classes with zero held sessions threw ArithmeticException during attendance aggregation. Resolved by adding guard clauses returning 100.0% compliance when total sessions held is zero.
- **Problem:** Performance Degradation on Full Cohort Attendance Scans
  - **Resolution:** Iterating over individual student attendance records one-by-one generated N+1 queries. Resolved by aggregating attendance records grouped by student ID using Spring Data JPA repository queries.

### 3. Weekly Commit Summary Table

| Day | Date | Hash | Commit Message | GitHub Link |
| :--- | :--- | :--- | :--- | :--- |
| Day 22 | 2026-07-27 | `30ae7e2` | feat(transcripts-excel): add semester scorecard tab formatting and borders | [`30ae7e2`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/30ae7e2661a8e621397a266b82a3054bca3ee19c) |
| Day 23 | 2026-07-28 | `5b58970` | feat(attendance-reports): add chronic absenteeism classification criteria (< 75%) | [`5b58970`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/5b58970ebc41bef50e034ecf310b300c49b1ed1c) |
| Day 24 | 2026-07-29 | `03572bc` | feat(attendance-reports): add critical attendance shortfall category (< 65%) | [`03572bc`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/03572bc03ae43dad49d45b3f8569a4e5e3db91f6) |
| Day 25 | 2026-07-30 | `088819e` | feat(attendance-pdf): implement class attendance roster PDF layout | [`088819e`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/088819ed081e3c63054ffb16a345030624bced48) |
| Day 26 | 2026-07-31 | `2a62b4a` | feat(attendance-excel): implement class attendance statistics spreadsheet | [`2a62b4a`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/2a62b4a1f15296b351c6d33e4daf41b119842bcd) |
| Day 27 | 2026-08-01 | `a265e8e` | feat(attendance-api): support chronicOnly filter parameter on attendance endpoint | [`a265e8e`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/a265e8ef40171be25c2d1490238ca88dba514efb) |
| Day 28 | 2026-08-02 | `40abed5` | test(attendance-reports): add unit tests for attendance roster calculations and thresholds | [`40abed5`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/40abed52dbafb4a8b8490cad72112d8744c02b3d) |

### 4. Day-by-Day Development Log

#### Day 22: 2026-07-27 – `feat(transcripts-excel): add semester scorecard tab formatting and borders`
- **Commit Link:** [30ae7e2](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/30ae7e2661a8e621397a266b82a3054bca3ee19c)
- **What Was Done:** Styled Excel semester scorecard sheet with border palettes, summary cards, and data formatting.
- **Problem Faced:** Aligning numeric values to right and text to left consistently across spreadsheet columns.
- **Next Day Plan:** Add chronic absenteeism classification criteria (< 75%) to attendance reports.

#### Day 23: 2026-07-28 – `feat(attendance-reports): add chronic absenteeism classification criteria (< 75%)`
- **Commit Link:** [5b58970](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/5b58970ebc41bef50e034ecf310b300c49b1ed1c)
- **What Was Done:** Formalized chronic absenteeism classification rules flagging students below statutory 75% attendance.
- **Problem Faced:** Differentiating medical exemption statuses from unexcused absenteeism.
- **Next Day Plan:** Add critical attendance shortfall category (< 65%) for dean alerts.

#### Day 24: 2026-07-29 – `feat(attendance-reports): add critical attendance shortfall category (< 65%)`
- **Commit Link:** [03572bc](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/03572bc03ae43dad49d45b3f8569a4e5e3db91f6)
- **What Was Done:** Integrated critical attendance shortfall threshold (<65%) to trigger immediate dean interventions.
- **Problem Faced:** Distinguishing critical risk (<65%) from standard attendance shortfall (<75%).
- **Next Day Plan:** Implement class attendance roster PDF layout with student compliance pill.

#### Day 25: 2026-07-30 – `feat(attendance-pdf): implement class attendance roster PDF layout`
- **Commit Link:** [088819e](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/088819ed081e3c63054ffb16a345030624bced48)
- **What Was Done:** Designed attendance roster PDF layout featuring class ratios, total present counts, and status pills.
- **Problem Faced:** Managing table pagination cleanly when roster exceeds 50 students on a single page.
- **Next Day Plan:** Implement class attendance statistics spreadsheet export.

#### Day 26: 2026-07-31 – `feat(attendance-excel): implement class attendance statistics spreadsheet`
- **Commit Link:** [2a62b4a](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/2a62b4a1f15296b351c6d33e4daf41b119842bcd)
- **What Was Done:** Built Excel attendance statistics workbook with student roster tab and compliance summary.
- **Problem Faced:** Formatting percentage cells with explicit Excel number formats (0.0%).
- **Next Day Plan:** Support chronicOnly filter parameter on attendance REST endpoint.

#### Day 27: 2026-08-01 – `feat(attendance-api): support chronicOnly filter parameter on attendance endpoint`
- **Commit Link:** [a265e8e](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/a265e8ef40171be25c2d1490238ca88dba514efb)
- **What Was Done:** Added ?chronicOnly=true query parameter to ReportController attendance endpoint.
- **Problem Faced:** Ensuring query parameter defaults gracefully to false when omitted.
- **Next Day Plan:** Add unit tests for attendance roster calculations and compliance thresholds.

#### Day 28: 2026-08-02 – `test(attendance-reports): add unit tests for attendance roster calculations and thresholds`
- **Commit Link:** [40abed5](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/40abed52dbafb4a8b8490cad72112d8744c02b3d)
- **What Was Done:** Authored unit tests in ReportServiceTest verifying attendance shortfall and chronic absenteeism logic.
- **Problem Faced:** Validating boundary edge cases where attendance equals exactly 75.0%.
- **Next Day Plan:** Calculate cohort pass/fail distributions for departmental exam performance.

---

## Week 5: Departmental Exam Analytics & Statistical Pass/Fail Distributions

**Date Range:** August 3, 2026 – August 9, 2026  
**Commits:** 7 commits (Day 29 – Day 35)  

### 1. Week Overview
Developed departmental exam analytics engines. Implemented cohort pass/fail calculations, standard deviation and median statistical indicators, 8-tier grade distributions (O through F), and dedicated PDF/Excel/CSV exam analytics exports.

### 2. Key Problems Faced & Resolutions
- **Problem:** Statistical Outliers Distorting Cohort Averages
  - **Resolution:** Students absent for exams recorded 0 marks, heavily skewing standard deviation and cohort pass rates. Resolved by categorizing ABSENT students explicitly while computing normalized statistics across attempted papers.
- **Problem:** OpenPDF Table Overflow on Large Subject Lists
  - **Resolution:** Subjects with long syllabi titles broke cell layout across page boundaries. Resolved by enforcing strict relative column widths and enabling setSplitLate(false) on PdfPTable instances.

### 3. Weekly Commit Summary Table

| Day | Date | Hash | Commit Message | GitHub Link |
| :--- | :--- | :--- | :--- | :--- |
| Day 29 | 2026-08-03 | `1dedae5` | feat(exam-analytics): add pass/fail rate distribution calculation across cohorts | [`1dedae5`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/1dedae553d52b30387b5dcd337d623441250ccf9) |
| Day 30 | 2026-08-04 | `5e7725d` | feat(exam-analytics): add standard deviation and median score statistical formulas | [`5e7725d`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/5e7725d7d3ae3d6bb9c2e933d419b9be526393ec) |
| Day 31 | 2026-08-05 | `dbcb0b5` | feat(exam-analytics): add grade distribution frequency counter (O, A+, A, B+, B, C, F) | [`dbcb0b5`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/dbcb0b5037ecefc0cc0541b1153df72c29fa0562) |
| Day 32 | 2026-08-06 | `acf57e2` | feat(exam-pdf): implement subject exam performance PDF report layout | [`acf57e2`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/acf57e20ac97169720a776e1d30767a185253606) |
| Day 33 | 2026-08-07 | `8da1872` | feat(exam-excel): implement subject exam marks analytics Excel report | [`8da1872`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/8da1872064a80ba2d0dec3e1e6b0b8578a6a64e1) |
| Day 34 | 2026-08-08 | `ae5948c` | feat(exam-csv): implement exam score distribution CSV export | [`ae5948c`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/ae5948cd4a7ba9dea492adaa42f5db3685148b75) |
| Day 35 | 2026-08-09 | `1d801b3` | feat(exam-api): implement GET /api/v1/reports/marks endpoint for subject exam performance | [`1d801b3`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/1d801b3a92ceac9f769578c8b53e159f8dd49535) |

### 4. Day-by-Day Development Log

#### Day 29: 2026-08-03 – `feat(exam-analytics): add pass/fail rate distribution calculation across cohorts`
- **Commit Link:** [1dedae5](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/1dedae553d52b30387b5dcd337d623441250ccf9)
- **What Was Done:** Implemented cohort pass/fail distribution algorithms aggregating marks across class sections.
- **Problem Faced:** Handling ungraded and incomplete assessment entries without distorting pass percentages.
- **Next Day Plan:** Implement standard deviation and median statistical indicators for exam scores.

#### Day 30: 2026-08-04 – `feat(exam-analytics): add standard deviation and median score statistical formulas`
- **Commit Link:** [5e7725d](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/5e7725d7d3ae3d6bb9c2e933d419b9be526393ec)
- **What Was Done:** Added statistical formulas calculating mean, median, and standard deviation for cohort exam marks.
- **Problem Faced:** Implementing fast single-pass variance algorithms to avoid numerical overflow.
- **Next Day Plan:** Implement 8-tier grade distribution frequency counter.

#### Day 31: 2026-08-05 – `feat(exam-analytics): add grade distribution frequency counter (O, A+, A, B+, B, C, F)`
- **Commit Link:** [dbcb0b5](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/dbcb0b5037ecefc0cc0541b1153df72c29fa0562)
- **What Was Done:** Built grade distribution frequency counter mapping scores into O, A+, A, B+, B, C, P, and F tiers.
- **Problem Faced:** Handling fractional mark round-off according to institutional evaluation policies.
- **Next Day Plan:** Implement subject exam performance PDF report layout.

#### Day 32: 2026-08-06 – `feat(exam-pdf): implement subject exam performance PDF report layout`
- **Commit Link:** [acf57e2](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/acf57e20ac97169720a776e1d30767a185253606)
- **What Was Done:** Engineered subject exam performance PDF report layout featuring statistical summary cards and tables.
- **Problem Faced:** Drawing visual progress bars for pass rates using OpenPDF drawing primitives.
- **Next Day Plan:** Implement subject exam marks analytics Excel report.

#### Day 33: 2026-08-07 – `feat(exam-excel): implement subject exam marks analytics Excel report`
- **Commit Link:** [8da1872](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/8da1872064a80ba2d0dec3e1e6b0b8578a6a64e1)
- **What Was Done:** Constructed Excel exam analytics report with statistical overview rows and grade distributions.
- **Problem Faced:** Setting auto-filter on header rows and freezing top panes for smooth spreadsheet navigation.
- **Next Day Plan:** Implement exam score distribution CSV export.

#### Day 34: 2026-08-08 – `feat(exam-csv): implement exam score distribution CSV export`
- **Commit Link:** [ae5948c](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/ae5948cd4a7ba9dea492adaa42f5db3685148b75)
- **What Was Done:** Added exam score distribution CSV export in CsvReportBuilder with sanitized fields.
- **Problem Faced:** Ensuring multi-subject score columns export with consistent column headers.
- **Next Day Plan:** Implement GET /api/v1/reports/marks endpoint for subject exam performance.

#### Day 35: 2026-08-09 – `feat(exam-api): implement GET /api/v1/reports/marks endpoint for subject exam performance`
- **Commit Link:** [1d801b3](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/1d801b3a92ceac9f769578c8b53e159f8dd49535)
- **What Was Done:** Exposed GET /api/v1/reports/marks REST endpoint supporting PDF, Excel, and CSV formats.
- **Problem Faced:** Wiring endpoint to role-based authorization for teachers and department heads.
- **Next Day Plan:** Add unit tests for exam pass/fail distributions and grade frequencies.

---

## Week 6: Fee Payment Audit Reports & Ledger Reconciliation Engine

**Date Range:** August 10, 2026 – August 16, 2026  
**Commits:** 7 commits (Day 36 – Day 42)  

### 1. Week Overview
Built financial audit reporting for institutional compliance. Implemented collection efficiency formulas, payment status reconciliation (PAID, PARTIAL, OVERDUE, PENDING), fee ledger spreadsheets, and audit report generation with late-fee breakdown.

### 2. Key Problems Faced & Resolutions
- **Problem:** Inconsistent Late-Fee Accumulation in Ledger Summaries
  - **Resolution:** Fee balances were showing discrepancy between billed amount and collected amount when late penalties were applied dynamically. Resolved by formalizing the reconciliation formula: Outstanding = (Billed + LateFeesApplied) - Collected.
- **Problem:** Status Filter Query String Case Sensitivity
  - **Resolution:** Users passing ?status=overdue failed to match JPA enum OVERDUE. Resolved by implementing case-insensitive query parameter normalization in ReportController.

### 3. Weekly Commit Summary Table

| Day | Date | Hash | Commit Message | GitHub Link |
| :--- | :--- | :--- | :--- | :--- |
| Day 36 | 2026-08-10 | `3a4b29e` | test(exam-analytics): add unit tests for pass/fail distributions and grade frequencies | [`3a4b29e`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/3a4b29e9a00b2b15a19abfe9b9f9e3edf7317ba5) |
| Day 37 | 2026-08-11 | `62c983e` | feat(fee-reports): add collection efficiency percentage formula | [`62c983e`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/62c983e57fe962d5c74c19b63be7e7250ec4a1a8) |
| Day 38 | 2026-08-12 | `92a44f8` | feat(fee-reports): add fee payment status breakdown (paid, partial, overdue, pending) | [`92a44f8`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/92a44f8ca24de3e694acbaeccfc98e667961a3b3) |
| Day 39 | 2026-08-13 | `758b488` | feat(fee-pdf): implement fee audit report PDF generator | [`758b488`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/758b4883bf40707a6319d86c0020a16497f1eab4) |
| Day 40 | 2026-08-14 | `6f61f02` | feat(fee-excel): implement fee collection ledger spreadsheet | [`6f61f02`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/6f61f02f8eaff4c0eda01e6ca87e1db78e989eab) |
| Day 41 | 2026-08-15 | `1b0c863` | feat(fee-api): add status filter parameter (?status=OVERDUE|PENDING|PAID) to fee endpoint | [`1b0c863`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/1b0c8638a3f7b6a390c7b4453e12674018a36ae5) |
| Day 42 | 2026-08-16 | `ecfebbe` | test(fee-reports): add unit tests for fee audit late-fee reconciliation | [`ecfebbe`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/ecfebbedc0135c9ed3b012560f955dc89c1ccd6d) |

### 4. Day-by-Day Development Log

#### Day 36: 2026-08-10 – `test(exam-analytics): add unit tests for pass/fail distributions and grade frequencies`
- **Commit Link:** [3a4b29e](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/3a4b29e9a00b2b15a19abfe9b9f9e3edf7317ba5)
- **What Was Done:** Authored unit tests verifying pass/fail rate calculations, median formulas, and grade distributions.
- **Problem Faced:** Testing distribution counters when all students score within a single grade band.
- **Next Day Plan:** Implement fee collection efficiency percentage formula.

#### Day 37: 2026-08-11 – `feat(fee-reports): add collection efficiency percentage formula`
- **Commit Link:** [62c983e](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/62c983e57fe962d5c74c19b63be7e7250ec4a1a8)
- **What Was Done:** Formulated fee collection efficiency KPI metric comparing total collected versus total billed.
- **Problem Faced:** Handling zero total billed scenarios gracefully without NaN or infinity results.
- **Next Day Plan:** Aggregate fee payment records by status (PAID, PARTIAL, OVERDUE, PENDING).

#### Day 38: 2026-08-12 – `feat(fee-reports): add fee payment status breakdown (paid, partial, overdue, pending)`
- **Commit Link:** [92a44f8](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/92a44f8ca24de3e694acbaeccfc98e667961a3b3)
- **What Was Done:** Implemented fee payment status aggregation reconciler grouping ledger entries by payment state.
- **Problem Faced:** Ensuring partial payments properly account for remaining balances and applied late fees.
- **Next Day Plan:** Implement fee audit report PDF generator with financial summary cards.

#### Day 39: 2026-08-13 – `feat(fee-pdf): implement fee audit report PDF generator`
- **Commit Link:** [758b488](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/758b4883bf40707a6319d86c0020a16497f1eab4)
- **What Was Done:** Built fee audit PDF layout with summary KPI cards, detailed ledger rows, and overdue indicators.
- **Problem Faced:** Formatting Indian Rupee currency values cleanly across table cells without font clipping.
- **Next Day Plan:** Implement fee collection ledger spreadsheet in ExcelReportService.

#### Day 40: 2026-08-14 – `feat(fee-excel): implement fee collection ledger spreadsheet`
- **Commit Link:** [6f61f02](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/6f61f02f8eaff4c0eda01e6ca87e1db78e989eab)
- **What Was Done:** Constructed fee collection Excel spreadsheet with billed, collected, late fee, and balance columns.
- **Problem Faced:** Applying currency cell styling and total formula rows at the bottom of the sheet.
- **Next Day Plan:** Support status filter parameter (?status=OVERDUE|PENDING|PAID) on fee endpoint.

#### Day 41: 2026-08-15 – `feat(fee-api): add status filter parameter (?status=OVERDUE|PENDING|PAID) to fee endpoint`
- **Commit Link:** [1b0c863](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/1b0c8638a3f7b6a390c7b4453e12674018a36ae5)
- **What Was Done:** Added ?status= query parameter on /api/v1/reports/fees endpoint with validation.
- **Problem Faced:** Handling case-insensitive status values and returning 400 for unsupported status strings.
- **Next Day Plan:** Add unit tests for fee audit late-fee reconciliation.

#### Day 42: 2026-08-16 – `test(fee-reports): add unit tests for fee audit late-fee reconciliation`
- **Commit Link:** [ecfebbe](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/ecfebbedc0135c9ed3b012560f955dc89c1ccd6d)
- **What Was Done:** Authored unit tests verifying fee reconciliation, late-fee additions, and collection efficiency.
- **Problem Faced:** Testing negative balance scenarios and overpayment edge cases.
- **Next Day Plan:** Calculate assignment submission rate per class cohort.

---

## Week 7: Coursework Metrics, Batch ZIP Archives & Parameter Validation

**Date Range:** August 17, 2026 – August 23, 2026  
**Commits:** 7 commits (Day 43 – Day 49)  

### 1. Week Overview
Extended academic reporting to assignment coursework completion rates. Built batch scorecard ZIP archiving to download bulk student transcripts in a compressed stream, and introduced strict parameter boundary validation.

### 2. Key Problems Faced & Resolutions
- **Problem:** Memory Bloat During Large ZIP Streaming
  - **Resolution:** Generating 50+ PDF report cards in memory before writing to ZIP caused heap spikes. Resolved by streaming individual PDF documents directly into java.util.zip.ZipOutputStream as byte chunks.
- **Problem:** Invalid Semester / Class ID Request Handling
  - **Resolution:** Invalid query parameters resulted in raw 500 database exceptions. Resolved by adding explicit validation checks throwing ReportException with HTTP 400 Bad Request.

### 3. Weekly Commit Summary Table

| Day | Date | Hash | Commit Message | GitHub Link |
| :--- | :--- | :--- | :--- | :--- |
| Day 43 | 2026-08-17 | `e3850ed` | feat(coursework-reports): calculate assignment submission rate per class | [`e3850ed`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/e3850ed754ecbb8bbab4500a68cb3221db33a77c) |
| Day 44 | 2026-08-18 | `7163b13` | feat(coursework-api): implement GET /api/v1/reports/assignments endpoint | [`7163b13`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/7163b130e2931a37cea9a15db72cc5fe828b9425) |
| Day 45 | 2026-08-19 | `9a3c4d5` | feat(reports-batch): implement batch scorecard archive zip generator | [`9a3c4d5`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/9a3c4d5c1a931f90d4ef82a631210fd3b6a56da1) |
| Day 46 | 2026-08-20 | `06c061c` | feat(reports-batch-api): expose GET /api/v1/reports/batch-archive endpoint | [`06c061c`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/06c061c922c929a9fae1d13bb84e01204e4be897) |
| Day 47 | 2026-08-21 | `932f58c` | feat(reports-validation): add input validation helpers for semester and class filters | [`932f58c`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/932f58c8e151d2ecba1955586b4e56788d166714) |
| Day 48 | 2026-08-22 | `d720c57` | feat(reports-cache): add in-memory caching helper for departmental summary calculations | [`d720c57`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/d720c57128f42dadf7cb3f66b1691b1ed32c874f) |
| Day 49 | 2026-08-23 | `e87f9b8` | feat(reports-security): enforce teacher assignment scope guard on class report queries | [`e87f9b8`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/e87f9b8dab435929b4e99273c3c01f2a85eeb4f3) |

### 4. Day-by-Day Development Log

#### Day 43: 2026-08-17 – `feat(coursework-reports): calculate assignment submission rate per class`
- **Commit Link:** [e3850ed](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/e3850ed754ecbb8bbab4500a68cb3221db33a77c)
- **What Was Done:** Added assignment submission rate calculation measuring submitted vs expected coursework.
- **Problem Faced:** Accounting for assignments with rolling due dates across different course sections.
- **Next Day Plan:** Expose GET /api/v1/reports/assignments endpoint for coursework metrics.

#### Day 44: 2026-08-18 – `feat(coursework-api): implement GET /api/v1/reports/assignments endpoint`
- **Commit Link:** [7163b13](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/7163b130e2931a37cea9a15db72cc5fe828b9425)
- **What Was Done:** Implemented GET /api/v1/reports/assignments REST endpoint returning submission rates.
- **Problem Faced:** Securing endpoint to verify faculty course assignment permissions.
- **Next Day Plan:** Implement batch scorecard archive ZIP generator in ReportService.

#### Day 45: 2026-08-19 – `feat(reports-batch): implement batch scorecard archive zip generator`
- **Commit Link:** [9a3c4d5](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/9a3c4d5c1a931f90d4ef82a631210fd3b6a56da1)
- **What Was Done:** Engineered batch scorecard archive generator streaming individual student PDF report cards into ZIP.
- **Problem Faced:** Managing streaming buffers to avoid memory spikes when zipping large cohorts.
- **Next Day Plan:** Expose GET /api/v1/reports/batch-archive endpoint.

#### Day 46: 2026-08-20 – `feat(reports-batch-api): expose GET /api/v1/reports/batch-archive endpoint`
- **Commit Link:** [06c061c](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/06c061c922c929a9fae1d13bb84e01204e4be897)
- **What Was Done:** Exposed GET /api/v1/reports/batch-archive endpoint with application/zip streaming response.
- **Problem Faced:** Setting appropriate Content-Disposition headers for downloaded zip archives.
- **Next Day Plan:** Add input parameter validation helpers for classId, subjectId, and semesterNo.

#### Day 47: 2026-08-21 – `feat(reports-validation): add input validation helpers for semester and class filters`
- **Commit Link:** [932f58c](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/932f58c8e151d2ecba1955586b4e56788d166714)
- **What Was Done:** Implemented parameter validation guards enforcing valid semester (1-8) and positive ID boundaries.
- **Problem Faced:** Standardizing parameter violation messages for clean client-side toast notifications.
- **Next Day Plan:** Add in-memory caching helper for departmental summary calculations.

#### Day 48: 2026-08-22 – `feat(reports-cache): add in-memory caching helper for departmental summary calculations`
- **Commit Link:** [d720c57](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/d720c57128f42dadf7cb3f66b1691b1ed32c874f)
- **What Was Done:** Added in-memory summary caching helper to accelerate repetitive departmental analytics queries.
- **Problem Faced:** Setting appropriate cache invalidation policies when underlying marks or attendance update.
- **Next Day Plan:** Enforce teacher assignment scope guard on class report queries.

#### Day 49: 2026-08-23 – `feat(reports-security): enforce teacher assignment scope guard on class report queries`
- **Commit Link:** [e87f9b8](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/e87f9b8dab435929b4e99273c3c01f2a85eeb4f3)
- **What Was Done:** Implemented security check ensuring teachers can only generate class reports for assigned subjects.
- **Problem Faced:** Resolving multi-teacher shared class assignment permission boundaries.
- **Next Day Plan:** Add security tests for role-based report access rules.

---

## Week 8: Performance Optimization, Caching & Header Standards

**Date Range:** August 24, 2026 – August 30, 2026  
**Commits:** 7 commits (Day 50 – Day 56)  

### 1. Week Overview
Optimized report generation performance. Implemented Apache POI CellStyle reuse, OpenPDF font caching, RFC 5987 UTF-8 Content-Disposition filename headers, in-memory caching for heavy summaries, and comprehensive JavaDoc documentation.

### 2. Key Problems Faced & Resolutions
- **Problem:** Excel CellStyle Quota Limit Exceeded in Apache POI
  - **Resolution:** Creating new CellStyle per cell in large rosters exceeded POI's 64,000 style limit. Resolved by creating a shared style registry reused across all rows and workbook sheets.
- **Problem:** Filename Encoding Glitches on Non-ASCII Student Names
  - **Resolution:** Downloading transcripts with Unicode characters resulted in garbled filenames in Chrome/Firefox. Resolved by formatting Content-Disposition with RFC 5987 filename*=UTF-8''<encoded>.

### 3. Weekly Commit Summary Table

| Day | Date | Hash | Commit Message | GitHub Link |
| :--- | :--- | :--- | :--- | :--- |
| Day 50 | 2026-08-24 | `92987b9` | test(reports-security): add security tests for role-based report access rules | [`92987b9`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/92987b931ad467328e55008b1a000e8af3c98557) |
| Day 51 | 2026-08-25 | `4c13465` | feat(reports-core): add Content-Disposition RFC 5987 UTF-8 filename encoding | [`4c13465`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/4c13465d88e5e3d14a506ee3da8706b294c5ca32) |
| Day 52 | 2026-08-26 | `796bf70` | feat(reports-core): add MIME type mapping constants for all supported formats | [`796bf70`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/796bf70defe4175952b6c18b45a7aa8530841e9b) |
| Day 53 | 2026-08-27 | `5283d89` | perf(reports-pdf): optimize OpenPDF font caching and table layout performance | [`5283d89`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/5283d89d2fdd2fb33ca5cb9da8342a0231305281) |
| Day 54 | 2026-08-28 | `b80b62f` | perf(reports-excel): optimize Apache POI cell style reuse across sheets | [`b80b62f`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/b80b62f107a2a23ca5541deea3b0dd77e71c9eca) |
| Day 55 | 2026-08-29 | `8c7ee62` | chore(reports-docs): add JavaDoc comments to ReportService public methods | [`8c7ee62`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/8c7ee62f92a1f811057fbd6a87e7d89e86e661fe) |
| Day 56 | 2026-08-30 | `7f4ad05` | chore(reports-docs): add JavaDoc comments to ReportController endpoints | [`7f4ad05`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/7f4ad05762b996d893177aeebb1d1dfd26d2bef5) |

### 4. Day-by-Day Development Log

#### Day 50: 2026-08-24 – `test(reports-security): add security tests for role-based report access rules`
- **Commit Link:** [92987b9](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/92987b931ad467328e55008b1a000e8af3c98557)
- **What Was Done:** Authored unit tests in ReportServiceTest verifying role-based access guards and forbidden paths.
- **Problem Faced:** Simulating unauthorized student attempts to access financial audit endpoints.
- **Next Day Plan:** Add Content-Disposition RFC 5987 UTF-8 filename encoding.

#### Day 51: 2026-08-25 – `feat(reports-core): add Content-Disposition RFC 5987 UTF-8 filename encoding`
- **Commit Link:** [4c13465](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/4c13465d88e5e3d14a506ee3da8706b294c5ca32)
- **What Was Done:** Implemented RFC 5987 filename*=UTF-8'' encoding in Content-Disposition headers.
- **Problem Faced:** Fixing filename garbling in legacy browsers while preserving modern UTF-8 support.
- **Next Day Plan:** Add MIME type mapping constants for all supported report formats.

#### Day 52: 2026-08-26 – `feat(reports-core): add MIME type mapping constants for all supported formats`
- **Commit Link:** [796bf70](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/796bf70defe4175952b6c18b45a7aa8530841e9b)
- **What Was Done:** Defined explicit MIME type mapping constants in ReportFormat (application/pdf, text/csv, etc.).
- **Problem Faced:** Ensuring browser downloads trigger native 'Save As' dialogs with correct file extensions.
- **Next Day Plan:** Optimize OpenPDF font caching and table layout performance.

#### Day 53: 2026-08-27 – `perf(reports-pdf): optimize OpenPDF font caching and table layout performance`
- **Commit Link:** [5283d89](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/5283d89d2fdd2fb33ca5cb9da8342a0231305281)
- **What Was Done:** Refactored OpenPDF layout engine to reuse static Font instances and optimize memory allocations.
- **Problem Faced:** Benchmarking PDF generation throughput under consecutive report generation calls.
- **Next Day Plan:** Optimize Apache POI cell style reuse across spreadsheet sheets.

#### Day 54: 2026-08-28 – `perf(reports-excel): optimize Apache POI cell style reuse across sheets`
- **Commit Link:** [b80b62f](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/b80b62f107a2a23ca5541deea3b0dd77e71c9eca)
- **What Was Done:** Refactored ExcelReportService to utilize centralized CellStyle cache across all sheet tabs.
- **Problem Faced:** Verifying workbook generation does not exceed POI style limits during large cohort exports.
- **Next Day Plan:** Add comprehensive JavaDoc comments to ReportService public methods.

#### Day 55: 2026-08-29 – `chore(reports-docs): add JavaDoc comments to ReportService public methods`
- **Commit Link:** [8c7ee62](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/8c7ee62f92a1f811057fbd6a87e7d89e86e661fe)
- **What Was Done:** Documented ReportService public interface with comprehensive JavaDoc and method contracts.
- **Problem Faced:** Clarifying input parameter preconditions and expected output formats.
- **Next Day Plan:** Add JavaDoc comments to ReportController REST endpoints.

#### Day 56: 2026-08-30 – `chore(reports-docs): add JavaDoc comments to ReportController endpoints`
- **Commit Link:** [7f4ad05](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/7f4ad05762b996d893177aeebb1d1dfd26d2bef5)
- **What Was Done:** Documented ReportController endpoints with OpenAPI/Swagger style JavaDoc comments.
- **Problem Faced:** Describing query parameter specifications and HTTP response code schemas.
- **Next Day Plan:** Run full Maven test suite verifying all 19 test assertions.

---

## Week 9: Frontend Architecture, TypeScript Types & ExportButton Component

**Date Range:** August 31, 2026 – September 6, 2026  
**Commits:** 7 commits (Day 57 – Day 63)  

### 1. Week Overview
Initiated frontend development for the reports module. Defined TypeScript interfaces in reportTypes.ts, query hooks and download helpers in reportQueries.ts, and created the reusable ExportButton component with loading spinners and toast notifications.

### 2. Key Problems Faced & Resolutions
- **Problem:** Blob Download Filename Extraction from Headers
  - **Resolution:** Browser fetch API masked Content-Disposition header due to CORS restrictions. Resolved by exposing Content-Disposition in backend SecurityConfig and adding fallback filename generators in reportQueries.ts.
- **Problem:** Type Incompatibilities with Base UI Component Props
  - **Resolution:** Tone and variant union types in base ui.tsx restricted color tokens (e.g. emerald was invalid). Resolved by aligning ExportButton with allowed union literals ('green', 'primary', 'secondary').

### 3. Weekly Commit Summary Table

| Day | Date | Hash | Commit Message | GitHub Link |
| :--- | :--- | :--- | :--- | :--- |
| Day 57 | 2026-08-31 | `7c382e6` | test(backend): run full Maven test suite verifying all test assertions | [`7c382e6`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/7c382e62a004ef45d645438f087a1b14846dfe8f) |
| Day 58 | 2026-09-01 | `33274a5` | feat(reports-ui): create TypeScript interfaces in reportTypes.ts | [`33274a5`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/33274a52f6f0b268ee2d798d1b818b656156c1b0) |
| Day 59 | 2026-09-02 | `18cb645` | feat(reports-ui): add ExamPerformanceReport and AssignmentCompletionReport types | [`18cb645`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/18cb645ef51ab2109913ce3e749cc30f2b82dd71) |
| Day 60 | 2026-09-03 | `bc8728f` | feat(reports-ui): implement report query hooks in reportQueries.ts | [`bc8728f`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/bc8728f56db66851de7647b36a454b42083703bf) |
| Day 61 | 2026-09-04 | `564eee1` | feat(reports-ui): implement downloadReportFile helper with format binding | [`564eee1`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/564eee14f36d51f5f0be488556a3610addc009c7) |
| Day 62 | 2026-09-05 | `b889e7e` | feat(reports-ui): create reusable ExportButton component with PDF, Excel, and CSV options | [`b889e7e`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/b889e7ef6d235e030a45e2467532dc752621f255) |
| Day 63 | 2026-09-06 | `c0b502a` | feat(reports-ui): add download spinner and toast notification feedback to ExportButton | [`c0b502a`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/c0b502ac806d25d68e6f1699bafec5cc9c029bb8) |

### 4. Day-by-Day Development Log

#### Day 57: 2026-08-31 – `test(backend): run full Maven test suite verifying all test assertions`
- **Commit Link:** [7c382e6](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/7c382e62a004ef45d645438f087a1b14846dfe8f)
- **What Was Done:** Executed complete backend Maven test suite verifying zero failures across all 19 unit tests.
- **Problem Faced:** Checking test execution time and eliminating slow mock initialization bottlenecks.
- **Next Day Plan:** Create TypeScript interfaces in reportTypes.ts for frontend reports.

#### Day 58: 2026-09-01 – `feat(reports-ui): create TypeScript interfaces in reportTypes.ts`
- **Commit Link:** [33274a5](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/33274a52f6f0b268ee2d798d1b818b656156c1b0)
- **What Was Done:** Defined comprehensive TypeScript interfaces in reportTypes.ts mirroring backend DTO models.
- **Problem Faced:** Ensuring strict nullability and optional property alignments with backend JSON models.
- **Next Day Plan:** Add ExamPerformanceReport and AssignmentCompletionReport types.

#### Day 59: 2026-09-02 – `feat(reports-ui): add ExamPerformanceReport and AssignmentCompletionReport types`
- **Commit Link:** [18cb645](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/18cb645ef51ab2109913ce3e749cc30f2b82dd71)
- **What Was Done:** Extended reportTypes.ts with exam score distributions and coursework submission models.
- **Problem Faced:** Defining ReportExportFormat union type ('pdf' | 'xlsx' | 'csv' | 'json').
- **Next Day Plan:** Implement report query hooks in reportQueries.ts using TanStack Query.

#### Day 60: 2026-09-03 – `feat(reports-ui): implement report query hooks in reportQueries.ts`
- **Commit Link:** [bc8728f](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/bc8728f56db66851de7647b36a454b42083703bf)
- **What Was Done:** Implemented custom React query hooks in reportQueries.ts for fetching report data asynchronously.
- **Problem Faced:** Managing query caching, stale time, and automatic refetch policies upon filter change.
- **Next Day Plan:** Implement downloadReportFile helper with format binding.

#### Day 61: 2026-09-04 – `feat(reports-ui): implement downloadReportFile helper with format binding`
- **Commit Link:** [564eee1](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/564eee14f36d51f5f0be488556a3610addc009c7)
- **What Was Done:** Engineered downloadReportFile utility handling blob downloads and filename parsing.
- **Problem Faced:** Ensuring temporary <a> download elements are cleanly revoked after triggering download.
- **Next Day Plan:** Create reusable ExportButton component with PDF, Excel, and CSV options.

#### Day 62: 2026-09-05 – `feat(reports-ui): create reusable ExportButton component with PDF, Excel, and CSV options`
- **Commit Link:** [b889e7e](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/b889e7ef6d235e030a45e2467532dc752621f255)
- **What Was Done:** Built ExportButton component featuring a split dropdown UI for instant multi-format downloads.
- **Problem Faced:** Styling dropdown menu transitions and handling outside click dismissal cleanly.
- **Next Day Plan:** Add download spinner and toast notification feedback to ExportButton.

#### Day 63: 2026-09-06 – `feat(reports-ui): add download spinner and toast notification feedback to ExportButton`
- **Commit Link:** [c0b502a](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/c0b502ac806d25d68e6f1699bafec5cc9c029bb8)
- **What Was Done:** Integrated loading spinner state and toast notifications to ExportButton during file generation.
- **Problem Faced:** Aligning toast notification hook with application toast state management.
- **Next Day Plan:** Build ReportsHub dashboard page in ReportsHub.tsx.

---

## Week 10: ReportsHub Dashboard & Official Semester Report Card View

**Date Range:** September 7, 2026 – September 13, 2026  
**Commits:** 7 commits (Day 64 – Day 70)  

### 1. Week Overview
Constructed the ReportsHub landing page featuring role-tailored report cards and quick exports. Built the OfficialReportCard component with institutional branding, credit/grade tables, and historical SGPA progression cards.

### 2. Key Problems Faced & Resolutions
- **Problem:** SGPA Progression Card Layout on Mobile/Desktop
  - **Resolution:** Progression cards caused horizontal scroll on narrow viewports. Resolved by building a responsive CSS grid layout (grid-cols-2 md:grid-cols-4) with auto-wrapping.
- **Problem:** Missing Null Guards on Student Transcript Electives
  - **Resolution:** Students without enrolled electives rendered empty rows with broken table lines. Resolved by implementing optional chaining and default empty list fallbacks.

### 3. Weekly Commit Summary Table

| Day | Date | Hash | Commit Message | GitHub Link |
| :--- | :--- | :--- | :--- | :--- |
| Day 64 | 2026-09-07 | `00c7c7b` | feat(reports-ui): build ReportsHub dashboard page in ReportsHub.tsx | [`00c7c7b`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/00c7c7bdbe9ec40d8890e310151b05135450f86a) |
| Day 65 | 2026-09-08 | `6fcf0ce` | feat(reports-ui): add module cards for transcript, attendance, analytics, and fees | [`6fcf0ce`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/6fcf0ce11503857dd04a5f4d20ac269db4675b11) |
| Day 66 | 2026-09-09 | `df9921c` | feat(reports-ui): add role-based feature badges in ReportsHub dashboard | [`df9921c`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/df9921c0e29abece94fd548f0fb04408089db6c8) |
| Day 67 | 2026-09-10 | `12808d8` | feat(reports-ui): create OfficialReportCard component in OfficialReportCard.tsx | [`12808d8`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/12808d8b085afcbb67e3be54106d555c47d712b4) |
| Day 68 | 2026-09-11 | `d65204d` | feat(reports-ui): add college branding header and student profile summary | [`d65204d`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/d65204d0e3595022d0786af366b1fa6f65059823) |
| Day 69 | 2026-09-12 | `5bb68ad` | feat(reports-ui): render subject marks, credits, and grade points table | [`5bb68ad`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/5bb68adbe983d27735661bfff2d1231c5604c2e2) |
| Day 70 | 2026-09-13 | `ba75249` | feat(reports-ui): render historical semester SGPA progression cards | [`ba75249`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/ba752491a3e40ee83060bd79d7360fc9741f4248) |

### 4. Day-by-Day Development Log

#### Day 64: 2026-09-07 – `feat(reports-ui): build ReportsHub dashboard page in ReportsHub.tsx`
- **Commit Link:** [00c7c7b](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/00c7c7bdbe9ec40d8890e310151b05135450f86a)
- **What Was Done:** Constructed ReportsHub dashboard page providing centralized access to all academic report tools.
- **Problem Faced:** Designing responsive grid layout for module action cards across diverse screen sizes.
- **Next Day Plan:** Add module cards for transcript, attendance, analytics, and fee ledgers.

#### Day 65: 2026-09-08 – `feat(reports-ui): add module cards for transcript, attendance, analytics, and fees`
- **Commit Link:** [6fcf0ce](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/6fcf0ce11503857dd04a5f4d20ac269db4675b11)
- **What Was Done:** Built interactive navigation cards in ReportsHub detailing each report module's features.
- **Problem Faced:** Ensuring icon alignments and hover elevation micro-interactions match app design system.
- **Next Day Plan:** Add role-based feature badges in ReportsHub dashboard.

#### Day 66: 2026-09-09 – `feat(reports-ui): add role-based feature badges in ReportsHub dashboard`
- **Commit Link:** [df9921c](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/df9921c0e29abece94fd548f0fb04408089db6c8)
- **What Was Done:** Added role-specific permission badges indicating Student, Faculty, and Admin report capabilities.
- **Problem Faced:** Filtering available report cards based on the authenticated user's active session role.
- **Next Day Plan:** Create OfficialReportCard component in OfficialReportCard.tsx.

#### Day 67: 2026-09-10 – `feat(reports-ui): create OfficialReportCard component in OfficialReportCard.tsx`
- **Commit Link:** [12808d8](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/12808d8b085afcbb67e3be54106d555c47d712b4)
- **What Was Done:** Engineered OfficialReportCard component displaying formal semester report card.
- **Problem Faced:** Organizing student identity header, academic session, and institution identity.
- **Next Day Plan:** Add college branding header and student profile summary to report card.

#### Day 68: 2026-09-11 – `feat(reports-ui): add college branding header and student profile summary`
- **Commit Link:** [d65204d](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/d65204d0e3595022d0786af366b1fa6f65059823)
- **What Was Done:** Integrated institutional branding header and detailed student profile metadata card.
- **Problem Faced:** Ensuring high-resolution institutional marks render cleanly without layout shifts.
- **Next Day Plan:** Render subject marks, credits, and grade points table in report card.

#### Day 69: 2026-09-12 – `feat(reports-ui): render subject marks, credits, and grade points table`
- **Commit Link:** [5bb68ad](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/5bb68adbe983d27735661bfff2d1231c5604c2e2)
- **What Was Done:** Built structured academic grade table showing credits, marks, grade points, and pass/fail tags.
- **Problem Faced:** Implementing grade point calculation logic and visual status pills for each subject.
- **Next Day Plan:** Render historical semester SGPA progression cards in report card.

#### Day 70: 2026-09-13 – `feat(reports-ui): render historical semester SGPA progression cards`
- **Commit Link:** [ba75249](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/ba752491a3e40ee83060bd79d7360fc9741f4248)
- **What Was Done:** Constructed historical semester SGPA progression grid visualizing academic progression over time.
- **Problem Faced:** Managing multi-semester progression cards across different academic terms.
- **Next Day Plan:** Add attendance clearance status and academic risk badges.

---

## Week 11: Attendance Roster UI, Absenteeism Filters & Exam Analytics UI

**Date Range:** September 14, 2026 – September 20, 2026  
**Commits:** 7 commits (Day 71 – Day 77)  

### 1. Week Overview
Built the AttendanceReport and ExamAnalyticsReport pages. Added KPI summary metrics, class cohort dropdown selectors, chronic absenteeism toggle filters, subject performance rankings, and student academic risk roster tables.

### 2. Key Problems Faced & Resolutions
- **Problem:** State Desynchronization Between Class Dropdown and Roster Table
  - **Resolution:** Changing class cohort did not invalidate stale attendance queries. Resolved by tying query keys to [classId, chronicOnly] inside TanStack Query hooks.
- **Problem:** Academic Risk Badge Color Semantic Mapping
  - **Resolution:** High risk students needed clear visual distinction without clashing with the dark theme. Resolved by creating a semantic risk badge mapper: LOW (green), MEDIUM (amber), HIGH (red).

### 3. Weekly Commit Summary Table

| Day | Date | Hash | Commit Message | GitHub Link |
| :--- | :--- | :--- | :--- | :--- |
| Day 71 | 2026-09-14 | `2c78b0b` | feat(reports-ui): add attendance clearance status and academic risk badges | [`2c78b0b`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/2c78b0b1ea638baa1eab61e50890b96b1e1a0fe0) |
| Day 72 | 2026-09-15 | `9d43353` | feat(reports-ui): add browser print button trigger in OfficialReportCard | [`9d43353`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/9d43353242a33420992869fb7c9430fb2b49b18d) |
| Day 73 | 2026-09-16 | `17de05c` | feat(reports-ui): build AttendanceReport page in AttendanceReport.tsx | [`17de05c`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/17de05c0b21be6e7d36e6110089cadd4d69c3ff4) |
| Day 74 | 2026-09-17 | `2769d6e` | feat(reports-ui): add attendance KPI summary cards (Total, Average, Below 75%) | [`2769d6e`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/2769d6e6ff1344ea290f0950c74a8ae0c8aea831) |
| Day 75 | 2026-09-18 | `de7e86d` | feat(reports-ui): add class group filter selector dropdown | [`de7e86d`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/de7e86d817695659f37ca47489d2b0c5a9350b8e) |
| Day 76 | 2026-09-19 | `43d7675` | feat(reports-ui): implement chronic absenteeism sub-75% filter toggle | [`43d7675`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/43d767526ff54b16174da3d70a180abd02260b6f) |
| Day 77 | 2026-09-20 | `b8fc5fa` | feat(reports-ui): build ExamAnalyticsReport page in ExamAnalyticsReport.tsx | [`b8fc5fa`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/b8fc5fa8dcaeb524979b542c3ad2706e91066537) |

### 4. Day-by-Day Development Log

#### Day 71: 2026-09-14 – `feat(reports-ui): add attendance clearance status and academic risk badges`
- **Commit Link:** [2c78b0b](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/2c78b0b1ea638baa1eab61e50890b96b1e1a0fe0)
- **What Was Done:** Added official attendance clearance badge and academic risk indicator to OfficialReportCard.
- **Problem Faced:** Color-coding risk indicators semantically: Green (Low), Amber (Medium), Red (High).
- **Next Day Plan:** Add browser print button trigger in OfficialReportCard.

#### Day 72: 2026-09-15 – `feat(reports-ui): add browser print button trigger in OfficialReportCard`
- **Commit Link:** [9d43353](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/9d43353242a33420992869fb7c9430fb2b49b18d)
- **What Was Done:** Integrated browser print trigger invoking window.print() with custom print view layout.
- **Problem Faced:** Ensuring interactive buttons and navigation shell are hidden during print execution.
- **Next Day Plan:** Build AttendanceReport page in AttendanceReport.tsx.

#### Day 73: 2026-09-16 – `feat(reports-ui): build AttendanceReport page in AttendanceReport.tsx`
- **Commit Link:** [17de05c](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/17de05c0b21be6e7d36e6110089cadd4d69c3ff4)
- **What Was Done:** Constructed AttendanceReport page for auditing class attendance compliance and rosters.
- **Problem Faced:** Designing clean table layout with pagination and search filtering capabilities.
- **Next Day Plan:** Add attendance KPI summary cards (Total Enrolled, Average %, Below 75%).

#### Day 74: 2026-09-17 – `feat(reports-ui): add attendance KPI summary cards (Total, Average, Below 75%)`
- **Commit Link:** [2769d6e](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/2769d6e6ff1344ea290f0950c74a8ae0c8aea831)
- **What Was Done:** Built KPI metric cards highlighting critical attendance aggregates and at-risk student counts.
- **Problem Faced:** Computing instant summary tallies without requiring separate aggregate queries.
- **Next Day Plan:** Add class group filter selector dropdown to AttendanceReport.

#### Day 75: 2026-09-18 – `feat(reports-ui): add class group filter selector dropdown`
- **Commit Link:** [de7e86d](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/de7e86d817695659f37ca47489d2b0c5a9350b8e)
- **What Was Done:** Integrated class section selector dropdown enabling switching between cohort sections.
- **Problem Faced:** Synchronizing dropdown state with query parameters to preserve selected filters.
- **Next Day Plan:** Implement chronic absenteeism sub-75% filter toggle.

#### Day 76: 2026-09-19 – `feat(reports-ui): implement chronic absenteeism sub-75% filter toggle`
- **Commit Link:** [43d7675](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/43d767526ff54b16174da3d70a180abd02260b6f)
- **What Was Done:** Built toggle button to instantly filter attendance roster down to chronically absent students.
- **Problem Faced:** Ensuring filter toggle seamlessly updates table rows without flickering.
- **Next Day Plan:** Build ExamAnalyticsReport page in ExamAnalyticsReport.tsx.

#### Day 77: 2026-09-20 – `feat(reports-ui): build ExamAnalyticsReport page in ExamAnalyticsReport.tsx`
- **Commit Link:** [b8fc5fa](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/b8fc5fa8dcaeb524979b542c3ad2706e91066537)
- **What Was Done:** Constructed ExamAnalyticsReport page displaying departmental performance and pass/fail ratios.
- **Problem Faced:** Designing visual charts and KPI hero cards for departmental pass percentages.
- **Next Day Plan:** Render subject performance breakdown and rankings table in ExamAnalyticsReport.

---

## Week 12: Fee Audit UI, App Routing, Print Stylesheets, Docs & Final Release

**Date Range:** September 21, 2026 – October 6, 2026  
**Commits:** 16 commits (Day 78 – Day 93)  

### 1. Week Overview
Completed FeeAuditReport with payment status tabs. Wired report navigation into AppShell sidebar and registered routes in App.tsx. Implemented print stylesheets (@media print), dark mode refinements, automated smoke tests, documentation, and final release sign-off.

### 2. Key Problems Faced & Resolutions
- **Problem:** Print Layout Cluttered with Navigation Sidebar and Buttons
  - **Resolution:** Browser window.print() captured sidebar navigation, headers, and export buttons. Resolved by adding @media print rules with display: none !important for aside, header, nav, and button elements.
- **Problem:** Dark Mode Background Contrast in Printed Scorecards
  - **Resolution:** Printed pages wasted ink and lost contrast in dark mode. Resolved by adding .report-card-print { print-color-adjust: exact; } and forcing clean white backgrounds during print execution.

### 3. Weekly Commit Summary Table

| Day | Date | Hash | Commit Message | GitHub Link |
| :--- | :--- | :--- | :--- | :--- |
| Day 78 | 2026-09-21 | `bc70d4e` | feat(reports-ui): add departmental performance KPI hero metrics | [`bc70d4e`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/bc70d4e7d818abad92355509044ea8d834d2f7e2) |
| Day 79 | 2026-09-22 | `f8f47d9` | feat(reports-ui): render subject performance breakdown and rankings table | [`f8f47d9`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/f8f47d90b10bbf9128c5523ea95d0fa3af51f70e) |
| Day 80 | 2026-09-23 | `90515b4` | feat(reports-ui): render student academic risk and performance roster table | [`90515b4`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/90515b4174260afc0ebf64b141ac0156aea7f3c4) |
| Day 81 | 2026-09-24 | `011c851` | feat(reports-ui): build FeeAuditReport page in FeeAuditReport.tsx | [`011c851`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/011c8513ff3792f12afded3c100ede6016461733) |
| Day 82 | 2026-09-25 | `d041650` | feat(reports-ui): add financial summary KPI cards (Billed, Collected, Outstanding) | [`d041650`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/d0416509961241ef913c51bdcae1549d4d28deb1) |
| Day 83 | 2026-09-26 | `a92ec4d` | feat(reports-ui): implement status filter tabs (ALL, OVERDUE, PENDING, PAID) | [`a92ec4d`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/a92ec4df1479f4f6fa72ef65ef8ad2db74c209b7) |
| Day 84 | 2026-09-27 | `3f543de` | feat(reports-ui): integrate Reports & Analytics navigation link in AppShell sidebar | [`3f543de`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/3f543de150401224e4eeb02d8ce7c95d69c48235) |
| Day 85 | 2026-09-28 | `d04bd4e` | feat(reports-ui): configure React Router routes for reports in App.tsx | [`d04bd4e`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/d04bd4ee3560b6bd719d2626dc2d10ebf7f1d42d) |
| Day 86 | 2026-09-29 | `c5987b7` | style(reports-ui): add print stylesheet rules for official semester report cards | [`c5987b7`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/c5987b7e12eb3d7fe0e064483fea8c790c36725b) |
| Day 87 | 2026-09-30 | `638dff6` | style(reports-ui): polish dark mode colors, card borders, and responsive table views | [`638dff6`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/638dff63bf6aa706502205d7660431fcc9ec2197) |
| Day 88 | 2026-10-01 | `8e4f337` | feat(reports-ui): add loading skeleton states and error retry banners | [`8e4f337`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/8e4f337eed63d78555cb4d71d7ea307728d48c3e) |
| Day 89 | 2026-10-02 | `2be6bc4` | test(reports): add automated verification test script for reports endpoints | [`2be6bc4`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/2be6bc4cc0d537a0cc764a908a3ba2aed0428d86) |
| Day 90 | 2026-10-03 | `d9c01ba` | docs(reports): document Academic Reports and Analytics endpoints in backend README | [`d9c01ba`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/d9c01ba107cfbaadb6ce3951f196678385bcc18c) |
| Day 91 | 2026-10-04 | `6e6767c` | docs(reports): update main project README with Reports & Analytics module details | [`6e6767c`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/6e6767c7138ad26a2d2826d17afa7b08963eb98e) |
| Day 92 | 2026-10-05 | `66d90f8` | test(reports): run full Maven test suite and frontend typecheck verification | [`66d90f8`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/66d90f81bdba2bb5f3ad45cb10c0dcd2f7ba375e) |
| Day 93 | 2026-10-06 | `d4a2aa1` | chore(release): finalize Academic Reports and Performance Analytics module on branch aviral-academic-reports | [`d4a2aa1`](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/d4a2aa197aa43c2f8cd2248a16ffe4555c050108) |

### 4. Day-by-Day Development Log

#### Day 78: 2026-09-21 – `feat(reports-ui): add departmental performance KPI hero metrics`
- **Commit Link:** [bc70d4e](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/bc70d4e7d818abad92355509044ea8d834d2f7e2)
- **What Was Done:** Integrated departmental performance KPI hero metrics in Exam Analytics report.
- **Problem Faced:** Computing aggregate pass rate and honors ratio across multiple class cohorts.
- **Next Day Plan:** Render subject performance breakdown and rankings table in ExamAnalyticsReport.

#### Day 79: 2026-09-22 – `feat(reports-ui): render subject performance breakdown and rankings table`
- **Commit Link:** [f8f47d9](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/f8f47d90b10bbf9128c5523ea95d0fa3af51f70e)
- **What Was Done:** Built subject rankings table comparing average marks, attendance, and pass rate across subjects.
- **Problem Faced:** Sorting subject rows dynamically by performance metrics to identify struggling subjects.
- **Next Day Plan:** Render student academic risk and performance roster table in ExamAnalyticsReport.

#### Day 80: 2026-09-23 – `feat(reports-ui): render student academic risk and performance roster table`
- **Commit Link:** [90515b4](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/90515b4174260afc0ebf64b141ac0156aea7f3c4)
- **What Was Done:** Engineered student risk roster table sorted by risk score descending with intervention tags.
- **Problem Faced:** Highlighting multi-factor risk contributors (low attendance + failing exam scores).
- **Next Day Plan:** Build FeeAuditReport page in FeeAuditReport.tsx.

#### Day 81: 2026-09-24 – `feat(reports-ui): build FeeAuditReport page in FeeAuditReport.tsx`
- **Commit Link:** [011c851](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/011c8513ff3792f12afded3c100ede6016461733)
- **What Was Done:** Constructed FeeAuditReport page for auditing departmental fee collections and delinquencies.
- **Problem Faced:** Formatting financial tables with structured columns for billed, collected, and due amounts.
- **Next Day Plan:** Add financial summary KPI cards (Billed, Collected, Outstanding) to FeeAuditReport.

#### Day 82: 2026-09-25 – `feat(reports-ui): add financial summary KPI cards (Billed, Collected, Outstanding)`
- **Commit Link:** [d041650](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/d0416509961241ef913c51bdcae1549d4d28deb1)
- **What Was Done:** Integrated financial KPI cards displaying department-wide collection efficiency and totals.
- **Problem Faced:** Ensuring currency formatting uses consistent formatting helpers throughout the view.
- **Next Day Plan:** Implement status filter tabs (ALL, OVERDUE, PENDING, PAID) in FeeAuditReport.

#### Day 83: 2026-09-26 – `feat(reports-ui): implement status filter tabs (ALL, OVERDUE, PENDING, PAID)`
- **Commit Link:** [a92ec4d](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/a92ec4df1479f4f6fa72ef65ef8ad2db74c209b7)
- **What Was Done:** Built payment status filter tabs allowing instant filtering of fee ledger records.
- **Problem Faced:** Updating query hooks dynamically as user toggles between payment status tabs.
- **Next Day Plan:** Integrate Reports & Analytics navigation link in AppShell sidebar.

#### Day 84: 2026-09-27 – `feat(reports-ui): integrate Reports & Analytics navigation link in AppShell sidebar`
- **Commit Link:** [3f543de](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/3f543de150401224e4eeb02d8ce7c95d69c48235)
- **What Was Done:** Added 'Reports & Analytics' navigation item with BarChart3 icon to AppShell navigation sidebar.
- **Problem Faced:** Ensuring active link highlight logic highlights the reports menu on sub-route navigation.
- **Next Day Plan:** Configure React Router routes for reports module in App.tsx.

#### Day 85: 2026-09-28 – `feat(reports-ui): configure React Router routes for reports in App.tsx`
- **Commit Link:** [d04bd4e](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/d04bd4ee3560b6bd719d2626dc2d10ebf7f1d42d)
- **What Was Done:** Registered routes in App.tsx for /reports, /official-card, /attendance, /exam-analytics, and /fee-audit.
- **Problem Faced:** Wrapping report routes with role-based route guards matching user authorization.
- **Next Day Plan:** Add print stylesheet rules for official semester report cards in index.css.

#### Day 86: 2026-09-29 – `style(reports-ui): add print stylesheet rules for official semester report cards`
- **Commit Link:** [c5987b7](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/c5987b7e12eb3d7fe0e064483fea8c790c36725b)
- **What Was Done:** Authored @media print CSS rules hiding navigation, headers, and buttons during printing.
- **Problem Faced:** Ensuring printable content expands to full page width with page-break-inside: avoid.
- **Next Day Plan:** Polish dark mode colors, card borders, and responsive table views in index.css.

#### Day 87: 2026-09-30 – `style(reports-ui): polish dark mode colors, card borders, and responsive table views`
- **Commit Link:** [638dff6](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/638dff63bf6aa706502205d7660431fcc9ec2197)
- **What Was Done:** Refined CSS utility classes for report card print styling and dark mode contrast.
- **Problem Faced:** Ensuring table borders and badge backgrounds render crisp lines in both print and screen.
- **Next Day Plan:** Add loading skeleton states and error retry banners in ReportsHub dashboard.

#### Day 88: 2026-10-01 – `feat(reports-ui): add loading skeleton states and error retry banners`
- **Commit Link:** [8e4f337](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/8e4f337eed63d78555cb4d71d7ea307728d48c3e)
- **What Was Done:** Implemented animated skeleton loading states and network error retry banners.
- **Problem Faced:** Preventing cumulative layout shift while asynchronous report metrics are loading.
- **Next Day Plan:** Add automated verification test script for reports endpoints in backend/scripts/test-reports.ps1.

#### Day 89: 2026-10-02 – `test(reports): add automated verification test script for reports endpoints`
- **Commit Link:** [2be6bc4](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/2be6bc4cc0d537a0cc764a908a3ba2aed0428d86)
- **What Was Done:** Created test-reports.ps1 PowerShell smoke test script verifying all report API endpoints.
- **Problem Faced:** Testing automated HTTP status checks and file download response validation.
- **Next Day Plan:** Document Academic Reports and Analytics endpoints in backend README.md.

#### Day 90: 2026-10-03 – `docs(reports): document Academic Reports and Analytics endpoints in backend README`
- **Commit Link:** [d9c01ba](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/d9c01ba107cfbaadb6ce3951f196678385bcc18c)
- **What Was Done:** Updated backend/README.md detailing all REST endpoints, supported query parameters, and export types.
- **Problem Faced:** Documenting security requirements and role access rules for report endpoints.
- **Next Day Plan:** Update main project README.md with Reports & Analytics module details.

#### Day 91: 2026-10-04 – `docs(reports): update main project README with Reports & Analytics module details`
- **Commit Link:** [6e6767c](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/6e6767c7138ad26a2d2826d17afa7b08963eb98e)
- **What Was Done:** Updated root README.md with Reports & Performance Analytics architecture and feature highlights.
- **Problem Faced:** Documenting multi-format export engines and student risk scoring methodologies.
- **Next Day Plan:** Run full Maven test suite and frontend typecheck verification pass.

#### Day 92: 2026-10-05 – `test(reports): run full Maven test suite and frontend typecheck verification`
- **Commit Link:** [66d90f8](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/66d90f81bdba2bb5f3ad45cb10c0dcd2f7ba375e)
- **What Was Done:** Executed full Maven test suite and frontend TypeScript typecheck confirming 0 compile/type errors.
- **Problem Faced:** Verifying all 19 unit tests pass and complete type safety across frontend codebase.
- **Next Day Plan:** Finalized Academic Reports and Performance Analytics module release on branch aviral-academic-reports.

#### Day 93: 2026-10-06 – `chore(release): finalize Academic Reports and Performance Analytics module on branch aviral-academic-reports`
- **Commit Link:** [d4a2aa1](https://github.com/devansh-maini/Scholar_Track_DesktopApp-/commit/d4a2aa197aa43c2f8cd2248a16ffe4555c050108)
- **What Was Done:** Completed final release documentation, verification checks, and milestone delivery sign-off.
- **Problem Faced:** Conducting end-to-end regression audit across all 93 daily incremental commits.
- **Next Day Plan:** Ready for project evaluation, viva presentation, and final repository merge.

---
