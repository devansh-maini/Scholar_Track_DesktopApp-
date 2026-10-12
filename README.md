# ScholarTrack
## AI-Assisted Academic Management and Performance Monitoring System

**Institution:** Arya College of Engineering & IT, Jaipur, Rajasthan  
**Department:** Computer Science and Engineering (CSE)  
**Project Guide:** Er. Ram Babu Buri, Assistant Professor, Department of CSE  
**Academic Session:** 2026–2027

---

## 1. Introduction

ScholarTrack is a centralized academic management and performance monitoring system developed to organize academic information and role-specific activities in one application. Academic information is often distributed across different records, notices, spreadsheets, and communication channels. This can make it difficult for students to follow their academic progress, for teachers to manage relevant academic information, and for departmental staff to review performance consistently. ScholarTrack aims to provide a common digital system in which authorized users can access the academic information and workflows relevant to their roles.

The project is designed as a desktop application with a modern user interface and a separate backend service. The frontend provides the screens through which users interact with the application. The backend handles API requests, application rules, authentication, authorization, data access, and supported AI requests. A relational database is used for persistent data according to the project's configured database connection. The system also includes an AI-assisted academic support area using a backend-mediated Groq integration, subject to the configured service credentials and available features.

ScholarTrack is a team project. Each team member contributes to a defined area, and those areas must work together as one integrated application. The following sections explain the purpose of the project, the main technical components, and the individual responsibilities of the five team members. Individual contribution descriptions should be read alongside the actual code, commits, pull requests, and screens in the submitted version. They are intended to explain each module clearly without replacing implementation evidence.

## 2. Project Objectives

The primary objective of ScholarTrack is to make academic information easier to access and manage through a unified application. The project objectives are:

1. **Centralize academic information:** Provide a common application for supported academic records and workflows rather than relying on disconnected records for every activity.
2. **Support role-based access:** Organize the application around different user roles so that each user can access only the screens and operations permitted by the system.
3. **Improve student visibility:** Help students review their available academic information, including profile details, attendance, assignments, marks, notices, fees, and performance indicators where those features are implemented.
4. **Support teaching workflows:** Provide teacher-facing access to relevant class and academic activities supported by the application.
5. **Assist departmental monitoring:** Offer administrative or HOD-oriented views for reviewing academic information and summaries that are available in the implemented version.
6. **Present useful performance information:** Make academic results and related indicators easier to review, including CGPA or other performance summaries where supported by the data model and interface.
7. **Explore AI-assisted academic support:** Integrate an AI assistance workflow through the backend to support academic queries and context-aware help where configured.
8. **Maintain a modular architecture:** Separate the user interface, backend services, database persistence, authentication, and AI provider integration so the project can be maintained and extended.
9. **Enable collaborative development:** Use Git and GitHub branches to organize individual contributions and combine reviewed work into the integrated project.

## 3. Scope of the Project

ScholarTrack brings together several connected areas of academic management. The exact features available in a final build depend on the code and configuration submitted with the project.

- **Student academic area:** Student dashboard and access to personal academic details and supported academic records.
- **Teacher academic area:** Teacher-facing workflows for viewing or managing academic information within the permitted scope.
- **HOD and administration area:** Department-level views and administrative workflows where implemented.
- **Academic records and reporting:** Shared academic data, performance summaries, and report-oriented functionality supported by the backend.
- **Authentication and authorization:** Identity verification, authenticated API requests, and role-aware access protection.
- **AI academic assistance:** A backend-mediated integration with the configured AI provider for the supported chat and context features.
- **Desktop delivery:** An Electron-based desktop shell around the frontend application.

The system should not be understood as a replacement for every institutional information system. Its functionality is limited to the workflows, screens, APIs, and database entities actually included in the submitted implementation.

## 4. Team Members and Individual Contributions

The following member names and roll numbers are presented in the requested format. The contribution descriptions explain each member's module responsibilities and how that work fits into the overall system. For an academic submission, the final text should match the work actually completed by each person and be consistent with the source code and Git history.

### 4.1 Devansh Maini (24EARCS044)

**Primary area: Authentication and User Management**

Devansh's primary area is the authentication and user management foundation used by ScholarTrack's role-specific workflows. Authentication establishes who is using the application, while authorization determines which operations that user may perform. These responsibilities are central to the system because student, teacher, and HOD or administrative functions should not all be available to every account.

**Login workflow:** The authentication workflow accepts the credentials entered through the application's login interface and sends them to the backend using the defined API contract. The backend is responsible for verifying the submitted credentials against the configured user records. The interface should communicate unsuccessful login attempts clearly without revealing sensitive information about stored accounts. Successful authentication should lead to the application's authenticated state rather than leaving protected screens accessible without a valid session or token.

**Credential verification and password handling:** Passwords must not be stored or transmitted as plaintext database values. The backend should verify credentials using the configured password-hashing mechanism, such as the project's BCrypt-based password encoder where that is what the implementation uses. The frontend should never be responsible for deciding whether a password is valid by comparing it against a hard-coded value. Credential verification belongs on the server, where the application can apply a consistent security policy.

**Token-based authentication:** The system's API workflow uses JSON Web Tokens (JWT) where configured. Following successful authentication, the backend can issue a signed token that the client uses for subsequent protected requests. The client API layer must attach the token in the expected format, and the backend must validate the token before allowing protected operations. Token expiration, invalid tokens, and unauthenticated requests should be handled in a controlled manner so the user receives an understandable result and protected data remains inaccessible.

**Role-based authorization:** ScholarTrack has role-specific areas. The authentication and user management layer supports identifying the authenticated user's role and applying role restrictions to protected endpoints. A user interface may hide controls that do not apply to a role, but that is only a usability measure. The backend must enforce access rules independently because a client can be modified or API requests can be sent outside the normal interface.

**Current-user context:** After login, the application needs a reliable way to determine the current authenticated user and their role. The user context is used by the frontend to present the appropriate application area and by backend services to authorize requests. The current-user workflow should be consistent with the token and user records so that the application does not display a role or identity that differs from the server's authenticated context.

**Protected API integration:** The shared frontend API layer should handle the common requirements for authenticated requests. This avoids every screen implementing token handling differently. It also makes it easier to handle expired sessions and common API errors consistently. Protected endpoints should return appropriate responses when a request is missing valid authentication or the user lacks the required role.

**Security and error handling:** Authentication failures, authorization failures, and server errors are different cases and should not be treated as identical. The system should not disclose password hashes, token-signing secrets, internal stack traces, or other sensitive implementation details in user-facing error messages. Secret values and API keys should be configured on the server and kept out of committed files and public documentation.

**Coordination with other modules:** The authentication foundation is shared by the student, teacher, and HOD or administration modules. The role names, token format, user identity, and API error behavior need to remain consistent across all team members' work. Changes to the login response or security configuration should be communicated to the rest of the team so the frontend modules continue to work correctly.

**Testing responsibilities:** Appropriate checks include successful login with valid credentials, rejection of invalid credentials, denial of protected requests without a token, rejection of invalid or expired tokens, and enforcement of role restrictions. Tests should also confirm that a role cannot gain access merely by manually navigating to a restricted screen or directly calling a protected endpoint.

**Contribution summary:** Devansh's area provides the identity and access foundation that allows ScholarTrack to distinguish users and protect role-specific workflows. It supports the rest of the project by establishing a consistent login process, authenticated API communication, and server-enforced authorization.

### 4.2 Aryan Kumar Singh (24EARCS030)

**Primary area: Student Academic Management and Performance Monitoring**

Aryan's primary contribution is the student academic management and performance monitoring area of ScholarTrack. This part of the system is important because students need a clear view of their own academic status and should not have to navigate unrelated administrative functions to find their information. The student-facing module is intended to present relevant academic information in a structured, understandable, and consistent manner.

**Student dashboard and information organization:** The student-facing experience brings together the key information a student may need when opening the application. A dashboard should prioritize useful academic details and provide a clear route to the available sections. The purpose of this work is to make the application easier to understand, reduce unnecessary navigation, and give the student a central starting point for reviewing academic progress. Dashboard content must be connected to the data and endpoints available in the actual build rather than showing unsupported or fabricated values.

**Student profile and personal academic context:** The student area provides a place to view the student's relevant profile information and academic context. The interface should present information in a readable structure and should rely on authenticated backend requests. Where the application distinguishes between users, the backend must ensure that a student can access only the records associated with their own account or records that are otherwise explicitly authorized.

**Attendance visibility:** Attendance is one of the important indicators of a student's academic participation. The student academic area is intended to make attendance information accessible when that information is available through the backend. This includes organizing the available figures or records so they can be reviewed without requiring a student to interpret raw database information. Attendance totals, percentages, and subject-wise information should only be displayed when the corresponding data is actually available and correctly calculated.

**Assignments and academic tasks:** The student module includes access to assignment-related information where implemented. Its purpose is to help students identify relevant academic tasks, understand the information associated with them, and keep their academic activities organized. Assignment data should be presented using the backend's actual fields and should remain consistent with the teacher-facing workflow that creates or maintains the relevant records.

**Marks, results, and performance indicators:** A major part of academic monitoring is the ability to review marks and results. The student-facing module is intended to organize available result information and make academic progress easier to understand. Where the project provides CGPA, subject-wise marks, semester information, or other indicators, those values should be derived from the actual stored data and the project's implemented calculation rules. The interface should avoid implying that an indicator is official if it is only a local estimate or an informational summary.

**Fees and notices:** Where fee information and institutional notices are available in the application, the student area helps present them in a student-accessible location. This supports better awareness of relevant academic or administrative information. The screen should distinguish between viewing information and performing any transaction or administrative action; the latter must not be implied unless it is actually implemented and authorized.

**Academic insights and AI-assisted support:** ScholarTrack includes an AI academic assistance direction through a backend-mediated provider integration. The student-facing experience may provide access to academic questions, contextual assistance, or insight features that are present in the final build. AI-generated content should be treated as assistance rather than an authoritative institutional decision. The application should not expose provider credentials in the frontend, and requests should pass through the backend's configured integration.

**API integration and frontend behavior:** The student interface is part of the shared desktop frontend. Its requests must use the common API configuration and follow the backend's request and response formats. Loading, empty, and error states are important because academic information may not always be available, the backend may be offline, or a request may fail. Clear feedback is preferable to presenting stale or invented information as current data.

**Access control and privacy:** Student information can contain private academic records. The student module therefore depends on authentication and server-side authorization, not merely on hiding buttons in the interface. Requests should be authenticated according to the application's security configuration, and the backend must enforce record ownership or equivalent access rules for student-specific records.

**Integration and testing responsibilities:** The student module must work with the shared backend and the other academic modules. Integration includes checking that the dashboard and academic screens call the expected APIs, that response fields are handled correctly, that the application behaves sensibly when records are absent, and that errors are communicated clearly. Relevant testing should confirm that the student-facing views do not expose information belonging to another student.

**Contribution summary:** Aryan's area focuses on the student experience, the organization and presentation of personal academic information, and performance monitoring. This module connects the student's day-to-day view of academic records with the wider ScholarTrack system and depends on reliable API integration, correct authorization, and consistent data from the backend.

### 4.3 Akshita Mawaliya (24EARCS016)

**Primary area: HOD, Administration, and Academic Analytics**

Akshita's primary area is the HOD or administration-facing part of ScholarTrack, with emphasis on departmental visibility and academic summaries supported by the project. A departmental view has a different purpose from a student dashboard: it is intended to help an authorized academic or administrative user review information across the relevant scope rather than only the records belonging to one student.

**HOD-oriented dashboard:** The administrative dashboard should provide a structured entry point to the screens and information relevant to the HOD role. Its layout should make key sections easy to locate and should distinguish overview information from detailed records. Any counts, indicators, or summaries shown on the dashboard must be based on real backend responses and should use clear labels so their meaning is not ambiguous.

**Departmental academic overview:** Where the backend provides appropriate data, the HOD area can organize information useful for reviewing academic activity at a departmental level. This may include summaries of available student, class, subject, attendance, assignment, or result records, depending on what is implemented. The purpose is to make relevant information easier to review, not to create additional records or calculations unsupported by the data model.

**Analytics and performance summaries:** Analytics are useful only when the source data and calculation rules are clear. The module is intended to present supported academic indicators in a readable way, such as summary values or comparisons that are available in the final implementation. Any chart, table, percentage, or aggregate should correspond to a defined API response or a transparent calculation. Missing data should be handled explicitly rather than converted into misleading zero values.

**Administrative navigation and usability:** Administrative workflows may involve more categories of information than student workflows. Clear navigation, meaningful labels, consistent table layouts, and understandable empty states help authorized users locate the relevant information. Where filters, search, sorting, or date and semester selection are implemented, they should behave consistently and should not silently change the scope of the displayed data.

**Role-restricted operations:** HOD or administrative functions must be available only to the intended roles. The interface should show controls that make sense for the signed-in user, while the backend remains responsible for enforcing authorization. If a workflow permits a user to view departmental records but not edit them, the interface and backend must agree on that distinction.

**AI-assisted academic information:** The project includes an AI assistance component. Where the HOD or administrative interface connects to an AI-assisted feature, that connection should be limited to supported workflows and should not imply that AI output replaces institutional review or official academic records. Any contextual information sent to the AI service should be handled through the backend and should avoid exposing unnecessary personal or sensitive student information.

**Integration with shared academic data:** The HOD area depends on the same central backend and data model used by the student and teacher modules. It should not maintain a separate, conflicting copy of academic information. If a dashboard displays an aggregate, it should reflect the same underlying records that are used by the relevant academic workflows, subject to authorization and any defined update timing.

**Testing responsibilities:** Testing should cover the intended HOD or administrative role, the data scope available to that role, and the behavior when data is empty or an API request fails. It should also verify that users with other roles cannot access restricted administrative screens or retrieve the same information through direct API requests.

**Contribution summary:** Akshita's area focuses on departmental and administrative visibility, structured overview screens, and analytics or summary views supported by the implementation. It helps connect individual academic records to a broader departmental view while relying on accurate shared data and strict role-based access controls.

### 4.4 Awantika Jaiswal (24EARCS035)

**Primary area: Teacher Module and Teaching Workflows**

Awantika's primary area is the teacher-facing part of ScholarTrack. Teachers need access to the academic information and operations associated with their teaching responsibilities, while remaining within the scope permitted by their role. The teacher module is intended to make those workflows accessible through the same application rather than requiring a separate, disconnected system.

**Teacher-facing navigation and dashboard:** The teacher area should provide a clear starting point for the features available to a teacher account. It should organize teaching-related information into understandable sections and avoid presenting administrative controls that belong to other roles. The dashboard should reflect the endpoints and data available in the backend, with clear loading, empty, and error states.

**Class and student context:** Where supported by the data model, the teacher module can provide access to relevant class, subject, or student information needed for teaching activities. The information shown should be limited to the classes and records the teacher is authorized to access. The frontend should not assume that a teacher can see every student or every department record simply because the user is authenticated.

**Assignments and academic tasks:** Assignment-related workflows can help teachers work with academic tasks and make relevant task information available to students. Where the implementation supports assignment creation, viewing, updating, or tracking, the interface should validate required fields and communicate the result of each operation. If a particular operation is not implemented, the README and user interface should not imply that it is available.

**Marks and assessment information:** Teacher-facing workflows may include viewing or maintaining assessment information where supported. Any data-entry workflow should provide clear field labels, reasonable validation, and feedback when a save operation succeeds or fails. The backend should validate submitted data as well, since client-side validation alone is not a security or data-integrity boundary.

**Attendance and academic record workflows:** Where attendance entry or attendance review is part of the implemented teacher workflow, the interface should make the relevant class or subject context clear and reduce the risk of updating the wrong records. Any attendance calculations should follow the project's defined rules and should be consistent with the values displayed in student and administrative views.

**Consistency with student views:** Teacher-facing changes to shared academic records can affect what students see. The teacher module must therefore use the same backend source of truth and data definitions as the student module. For example, if a teacher updates a supported academic record, the student-facing view should display the resulting data according to the application's refresh and update behavior.

**Permission boundaries and privacy:** Teacher permissions should be specific to the role and relevant academic responsibilities. The backend should prevent access to administrative functions or records outside the teacher's authorized scope. The frontend should not expose private information unnecessarily, and test data used in screenshots or documentation should not contain real student personal details unless explicit authorization and institutional policy permit it.

**API integration and error handling:** The teacher screens should use the shared API configuration and follow the backend's expected request and response formats. Network failures, validation errors, missing records, and authorization errors should be handled distinctly where possible. Clear feedback helps users understand whether a change was saved or whether they need to retry or contact an administrator.

**Testing responsibilities:** Relevant testing includes opening the teacher area using a teacher account, confirming that only permitted information is visible, validating supported assignment or assessment workflows, and checking how the interface responds to missing data and failed requests. Tests should also verify that student and HOD views remain consistent with the shared records after changes.

**Contribution summary:** Awantika's area supports teaching-related academic workflows and provides a teacher-oriented interface connected to ScholarTrack's shared backend. The module aims to make supported teaching activities easier to access while maintaining consistency with student records and enforcing the correct role permissions.

### 4.5 Aviral Joshi (24EARCS034)

**Primary area: Academic Data Management and Reports**

Aviral's primary area is the shared academic data management and reporting side of ScholarTrack. The application depends on consistent academic records: student screens, teacher workflows, and departmental views must refer to the same underlying information. This module area focuses on the organization of academic data and the report-oriented functionality available in the submitted implementation.

**Shared academic data organization:** Academic data should follow consistent structures so that the same record can be used by different parts of the application. The academic data area works with the backend's entities, relationships, validation rules, and persistence layer as implemented. Consistent identifiers and field definitions help prevent mismatches between what a teacher enters, what a student views, and what appears in a departmental summary.

**Backend and persistence coordination:** The frontend should not maintain an independent authoritative copy of academic records. Supported records should be read from and written through the backend API, with persistence handled by the configured relational database. The data-management work therefore needs to align API request and response structures with the actual entity and database fields, and should handle invalid or incomplete data in a controlled way.

**Validation and data consistency:** Academic records require sensible validation. Required fields should be checked, invalid values should be rejected, and relationships between records should remain valid. The backend must be responsible for important validation rules even if the frontend also provides immediate feedback. This helps prevent inconsistent records from being stored through direct API calls or from clients other than the desktop interface.

**Academic summaries and reports:** Reporting functionality makes stored information easier to interpret. Depending on the implemented endpoints and screens, reports may organize available academic records into tables, summaries, or performance views. Report values should be traceable to the underlying records or defined calculation rules. The application should not label a generated summary as an official institutional report unless the institution's process and the implementation support that claim.

**Cross-module consistency:** A central responsibility of the academic data and reporting area is ensuring that data remains consistent across the student, teacher, and HOD modules. The same attendance record or assessment result should not be calculated differently in different parts of the interface without a defined reason. When data is updated, other screens should retrieve or refresh the correct values according to the application's update behavior.

**Handling missing and exceptional data:** A report may have no rows, incomplete information, or records that do not fit a selected filter. Such cases should be handled clearly. An empty result should not be presented as a system failure, and an unavailable value should not automatically be represented as zero unless that is the defined meaning. Error messages should help the user understand whether the issue is caused by missing data, an invalid request, lack of permission, or a service failure.

**Reporting and export boundaries:** If the submitted build supports report export or download, the output should reflect the same authorized dataset shown by the application. Export functions must not bypass role restrictions or expose records that the current user is not permitted to view. If exporting is not implemented, the project documentation should describe reporting only at the level supported by the actual screens and APIs.

**Coordination with AI and analytics features:** Academic summaries may provide context for analytics or AI-assisted workflows, but the use of data should be deliberate. AI requests must be routed through the backend integration and should not expose provider credentials. Only the information needed for a supported academic query should be sent, and generated answers should not be treated as replacements for stored academic records.

**Testing responsibilities:** Testing should verify that records can be retrieved and stored through the intended API workflows, that validation rules behave consistently, that summaries correspond to the source data, and that role restrictions apply to reports. Integration tests should also check whether student, teacher, and HOD views remain consistent when the underlying academic records change.

**Contribution summary:** Aviral's area focuses on the shared academic data structures, consistency of records, and report-oriented functionality. This work supports the other modules by helping ensure that academic information is stored, retrieved, validated, and summarized in a consistent way across the application.

## 5. How the Individual Modules Work Together

The project is divided into areas for clarity, but the modules are not independent applications. They form one connected workflow:

1. **Authentication establishes identity.** The user signs in, and the backend verifies the credentials and establishes the authenticated context according to the security configuration.
2. **Authorization applies role boundaries.** The application determines which screens and backend operations are permitted for the current role. The backend remains the enforcement point for protected data and actions.
3. **The student module presents personal academic information.** It requests relevant records through the shared API and displays the information allowed for the authenticated student.
4. **The teacher module supports teaching workflows.** It accesses or updates the academic records permitted for the teacher, subject to implemented functionality and server-side validation.
5. **The HOD or administration module provides broader academic visibility.** It displays the departmental or administrative information the current role is authorized to review.
6. **Academic data and reporting keep records consistent.** Shared APIs and database persistence help different screens use the same source of truth.
7. **AI assistance operates through the backend.** Where configured, AI requests are mediated by the backend so provider credentials are not exposed in the desktop client.
8. **The desktop application packages the user interface.** Electron provides the desktop shell while the frontend communicates with the backend service.

A successful integration requires agreement on API paths, field names, role identifiers, error responses, data ownership, and configuration. When one module changes an API contract, the team should review the effect on every module that consumes that endpoint.

## 6. System Architecture

ScholarTrack follows a client-server architecture. The desktop frontend is responsible for presentation and user interaction. The Spring Boot backend exposes API endpoints and applies server-side rules. The relational database persists the data managed by the backend. The configured AI provider is accessed through the backend integration rather than directly from the frontend.

```text
┌────────────────────────────────────────────────────────────┐
│                  ScholarTrack Desktop App                  │
│                                                            │
│               React + TypeScript + Vite                    │
│                         Electron                           │
│       Screens, navigation, forms, API client, UI state     │
└──────────────────────────────┬─────────────────────────────┘
                               │ REST API / authenticated requests
                               ▼
┌────────────────────────────────────────────────────────────┐
│                   Java Spring Boot Backend                 │
│                                                            │
│ Authentication and authorization | Academic services       │
│ Validation and business rules     | AI request handling     │
│ API responses                     | Persistence access      │
└────────────────┬─────────────────────────────┬─────────────┘
                 │                             │
                 ▼                             ▼
┌────────────────────────────┐   ┌───────────────────────────┐
│ Configured Relational DB   │   │ Configured Groq AI API   │
│ Persistent project data    │   │ AI assistance, if enabled│
└────────────────────────────┘   └───────────────────────────┘
```

This diagram is a high-level representation of the intended architecture. The actual database provider, deployment environment, network configuration, and enabled features must match the project's checked-in configuration and the setup used during evaluation.

## 7. Technology Stack

| Component | Technology or responsibility |
|---|---|
| Desktop shell | Electron |
| Frontend framework | React |
| Frontend language | TypeScript |
| Frontend build tooling | Vite |
| Backend framework | Java with Spring Boot |
| API communication | REST endpoints and configured real-time communication where implemented |
| Authentication | JWT-based authentication where configured |
| Backend security | Spring Security and role-aware authorization where configured |
| Password handling | Password hashing and verification using the backend's configured encoder |
| Data persistence | JPA/Hibernate and the configured relational database, where used by the backend |
| AI assistance | Groq integration through the backend |
| Version control | Git and GitHub |

The exact versions and supporting libraries should be taken from the project's package manifests and backend build configuration. This README does not substitute for those dependency files.

## 8. API and Data Flow

A typical interaction begins when a user opens a screen or submits a form. The frontend prepares a request using the shared API client and sends it to the backend. For a protected endpoint, the request includes the authentication information expected by the server. The backend validates the request, applies authentication and authorization rules, runs the relevant application logic, and accesses the database if required. The backend then returns a response that the frontend uses to update the interface.

The main principles of this flow are:

- The frontend is responsible for user interaction and clear presentation, not for enforcing security by itself.
- The backend validates important inputs and controls access to protected operations.
- Persistent academic data is managed through the backend and its configured database connection.
- The UI should handle loading, empty, success, validation, authorization, and server-error states clearly.
- AI provider credentials should remain in server-side configuration and should never be embedded in frontend source code.
- The same data definitions should be used across modules so records remain consistent.

The specific endpoints should be documented from the final backend controllers and the frontend API client. Endpoint names should not be added to a submission unless they exist in the submitted source code.

## 9. AI-Assisted Academic Support

ScholarTrack includes an AI-assisted academic support direction using a configured Groq integration through the backend. The purpose of this area is to provide an additional way to ask academic questions or obtain contextual assistance through the application, where those features are enabled in the final build.

The AI integration should follow several principles. Requests should be routed through the backend so that the provider key is not exposed in the desktop client. The application should provide clear feedback when the AI service is unavailable, returns an error, or has not been configured. AI responses can be useful for explanation and guidance, but they may contain mistakes and should not replace official marks, attendance records, institutional notices, or decisions made by authorized staff. Any context supplied to the AI service should be limited to what is necessary for the supported request and handled in accordance with applicable privacy expectations.

The final project demonstration should show only the AI functions that are actually implemented and configured. If the AI service requires an API key or network access, those requirements should be prepared before the demonstration, and the key itself must not be included in the README or public repository.

## 10. Authentication, Authorization, and Privacy

Because ScholarTrack handles role-specific academic information, security is a core design consideration.

- **Authentication:** Establish the identity of the user through the configured login workflow.
- **Authorization:** Enforce role permissions on the backend for protected endpoints and operations.
- **Record ownership:** Where information belongs to a specific student or teacher, the backend should check that the current user is permitted to access the requested record.
- **Password security:** Store password hashes rather than plaintext passwords and never include real passwords in documentation or commits.
- **Token security:** Validate signed tokens on the server and handle invalid or expired tokens without exposing protected data.
- **Secret management:** Store database credentials, JWT signing secrets, and AI API keys in environment-specific configuration or a secrets manager, not in source control.
- **Error messages:** Provide useful messages without exposing stack traces, internal configuration, secrets, or sensitive account details.
- **Data minimization:** Display and send only the information required for a particular workflow.
- **Testing data:** Use synthetic or appropriately anonymized data in screenshots, demonstrations, and documentation.

A secure interface alone is not sufficient. Restrictions must be enforced by the backend because API calls can be made independently of the desktop screens.

## 11. GitHub Collaboration and Contribution Tracking

Git and GitHub provide a way to organize the work of the five team members. Each member should work on a branch associated with their actual module or task. Changes should be committed in meaningful units, pushed to the shared repository, reviewed, tested, and merged into the integrated `main` branch when ready.

Suggested branch naming convention:

- `devansh-auth` — student academic management and performance monitoring.
- `aryan-student` — authentication and user management.
- `akshita-hod-ai` — HOD, administration, and analytics.
- `awantika-teacher` — teacher workflows.
- `aviral-academic-reports` — shared academic data and reports.
- `main` — integrated project state intended for review and submission.

These names are conventions, not proof that branches with these exact names exist. The final submission should use the branch names and commit links visible in the actual repository.

### Recommended weekly workflow

1. Identify the specific task or issue to be completed.
2. Create or switch to the appropriate member branch.
3. Make changes that correspond to the task and test them locally.
4. Commit the real work with a clear message describing the change.
5. Push the branch and preserve the commit history.
6. Open a pull request or request a review when the change is ready to integrate.
7. Resolve conflicts and test the combined application, not only the individual module.
8. Merge the reviewed change into `main` when it is stable.
9. Record the actual commit, pull request, screenshots, or test results required by the weekly logbook.

Commit history and weekly reports should represent work that was actually performed. Do not manufacture commits, backdate changes, or claim that a feature was completed earlier than it was. If a feature is incomplete, describe its current status accurately and list the remaining work.

## 12. Setup and Execution Notes

The commands and configuration required to run ScholarTrack depend on the directory structure and scripts in the submitted repository. The checked-in `package.json`, backend build file, application properties, and project-specific setup instructions are the source of truth.

### Frontend development

```bash
npm install
npm run dev
```

Run these commands from the frontend project directory that contains the relevant `package.json`. To create a production frontend build, use the build script defined by that package, commonly:

```bash
npm run build
```

### Desktop packaging

The desktop build uses Electron. The exact packaging command should be taken from the scripts and Electron Builder configuration in the repository. A Windows installer may be generated through the configured Electron Builder workflow, but build output depends on the local environment and packaging configuration.

### Backend and database

Start the Spring Boot backend using the project's configured build tool and application instructions. Configure the database connection and any required server-side values before starting the backend. The desktop application must be configured to reach the running backend. A client running on another computer cannot use `localhost` to reach a backend running on the developer's computer; `localhost` refers to the computer on which the client itself is running. For multi-computer testing, configure a reachable host address or deployed server and ensure the network and firewall permit the required connection.

### AI configuration

If AI assistance is enabled, configure the required provider key on the backend side. Do not paste the key into this README, commit it to GitHub, or expose it in frontend variables that are bundled into the desktop application.

## 13. Testing and Verification Plan

Before submission, the team should verify the application as a connected system. A feature that works in isolation may still fail after integration because of API contracts, database configuration, or role restrictions.

- **Build verification:** Confirm that the frontend builds successfully and the backend starts with the documented configuration.
- **Connectivity verification:** Confirm that the desktop client can reach the backend URL configured for the test environment.
- **Authentication verification:** Test successful and unsuccessful login attempts and protected requests.
- **Authorization verification:** Confirm that student, teacher, and HOD or administrative roles cannot access restricted endpoints or records.
- **Student workflow verification:** Review the implemented student dashboard and available academic information using valid test data.
- **Teacher workflow verification:** Test each supported teacher operation and confirm the results appear consistently in relevant views.
- **Administrative workflow verification:** Test the HOD or administration views with an authorized account and verify the scope of accessible data.
- **Data integrity verification:** Confirm that invalid data is rejected and shared academic records remain consistent across modules.
- **Reporting verification:** Compare report values with their source records and check empty or filtered results.
- **AI verification:** If enabled, test a valid request, service-unavailable behavior, and safe handling of provider configuration.
- **Desktop verification:** Test application launch, navigation, error states, and backend connectivity in the packaged application, not only in development mode.
- **Privacy verification:** Ensure test screenshots and public commits do not expose real student information, credentials, tokens, or private configuration.

Only mark a test as passed when it has actually been performed. Screenshots, test records, and commit references can be used as evidence in the final project file or demonstration.

## 14. Limitations and Future Improvements

Possible future improvements should be selected after reviewing the actual submitted version and identifying genuine gaps. Potential directions include:

- Expanding automated tests for API behavior, authorization, and cross-module integration.
- Improving validation and error messages for forms and network failures.
- Adding clearer report filters and date or semester selection where relevant.
- Improving accessibility, keyboard navigation, and consistency across the desktop interface.
- Adding more robust logging and diagnostics without recording passwords, tokens, or sensitive student information.
- Improving deployment configuration so multiple clients can connect to a centrally hosted backend.
- Documenting database setup, backup, and recovery procedures for the configured database.
- Adding monitoring for backend availability and AI provider failures.
- Refining AI prompts and context handling while maintaining privacy and treating AI output as advisory.
- Maintaining an explicit test checklist for every release and every merged module.

These are potential improvements, not claims that the listed work has already been completed.

## 15. Conclusion

ScholarTrack is a team-developed academic management and performance monitoring application intended to bring student, teacher, and departmental workflows into a common desktop system. Its architecture separates the user interface from the backend services and persistent data, while authentication and role-based authorization provide the foundation for protected access. The AI-assisted academic support component adds an optional assistance workflow through the configured backend integration.

The five individual work areas contribute to different parts of the same application: Devansh Maini focuses on student academic management and performance monitoring; Aryan Kumar Singh focuses on authentication and user management; Akshita Mawaliya focuses on HOD, administration, and analytics; Awantika Jaiswal focuses on teacher workflows; and Aviral Joshi focuses on shared academic data management and reporting. The value of the project depends on these modules being integrated, tested, and documented consistently.

For final academic submission, the source repository and running build should remain the authority for which features are complete. Member contribution statements, branch names, test results, and screenshots should accurately represent the work performed by the team.

## 16. Acknowledgement

The team acknowledges the guidance and academic support provided by Er. Ram Babu Buri, Assistant Professor, Department of Computer Science and Engineering, Arya College of Engineering & IT, Jaipur. The project has been prepared as part of the team's academic project work for the 2026–2027 session.

---

*README prepared for academic project documentation. Review the contribution statements against the final code and actual contribution history before submission.*
