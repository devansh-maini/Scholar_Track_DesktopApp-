::: {align="center"}
# 🎓 ScholarTrack

### AI-Assisted Academic Management and Performance Monitoring System

**A unified desktop application for student, teacher, and departmental
academic workflows.**

![Platform](https://img.shields.io/badge/Platform-Windows-0078D4?logo=windows&logoColor=white)
![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20TypeScript-3178C6?logo=typescript&logoColor=white)
![Desktop](https://img.shields.io/badge/Desktop-Electron-47848F?logo=electron&logoColor=white)
![Backend](https://img.shields.io/badge/Backend-Java%20%7C%20Spring%20Boot-6DB33F?logo=springboot&logoColor=white)
![AI](https://img.shields.io/badge/AI-Groq%20Integration-f55036)
![Academic
Session](https://img.shields.io/badge/Session-2026--2027-6C5CE7)

**Institution:** Arya College of Engineering & IT, Jaipur, Rajasthan\
**Department:** Computer Science and Engineering (CSE)\
**Project Guide:** Er. Ram Babu Buri, Assistant Professor, Department of
CSE\
**Academic Session:** 2026--2027
:::

------------------------------------------------------------------------

## 📥 Project Files and Application

> **Google Drive -- Complete Documentation & Windows Installer**\
> **[Open the ScholarTrack Google Drive
> Folder](https://drive.google.com/drive/folders/16tq0lVD8OrXHhjCqHuPm0hZRPKJkMXoj?usp=sharing)**
>
> The shared folder is intended to contain the project documentation,
> supporting material, and the Windows installer (`.exe`) for the
> application. Replace the placeholder above with the team's actual
> Google Drive sharing link before publishing this README.

### How to install and start ScholarTrack

1.  **Open the Google Drive folder.** Use the link above to access the
    project files.

2.  **Download the Windows installer.** Download the ScholarTrack `.exe`
    installer to your computer.

3.  **Install the application.** Run the downloaded installer and follow
    the on-screen installation instructions.

4.  **Wake up the backend service.** ScholarTrack's backend is hosted on
    Render's free plan. After a period of inactivity, the service may
    enter a sleep state and need time to start again. Before or while
    launching the desktop app, open the health-check URL below in a
    browser:

    **[ScholarTrack Backend Health
    Check](https://scholartrack-backend-akep.onrender.com/api/v1/health)**

    Wait for the endpoint to respond. The first request after inactivity
    can take longer than subsequent requests. If the service does not
    respond immediately, wait briefly and try again.

5.  **Launch ScholarTrack.** Open the application from the desktop
    shortcut or Windows Start Menu after installation.

6.  **Sign in or register.**

    -   **Demo account:** Use one of the demo accounts and credentials
        made available in the application's login interface.
    -   **New account:** You may register through the application. A
        newly created account must first be authorized by an
        administrator; registration alone does not grant access.

7.  **Open your role-based dashboard.** After successful login and any
    required authorization, the application opens the dashboard
    associated with your assigned role: Student, Teacher, or HOD.

**Deployment note:** The backend's cold-start delay is related to the
Render free hosting plan. It does not necessarily indicate a fault in
the installed desktop application. A successful health-check response
confirms that the health endpoint responded; it does not guarantee that
every external integration, such as the AI provider, is available.

------------------------------------------------------------------------

## 📑 Table of Contents

-   [1. Introduction](#1-introduction)
-   [2. Project Objectives](#2-project-objectives)
-   [3. Scope and Main Modules](#3-scope-and-main-modules)
-   [4. Team Members and Individual
    Contributions](#4-team-members-and-individual-contributions)
-   [5. How the Modules Work Together](#5-how-the-modules-work-together)
-   [6. System Architecture](#6-system-architecture)
-   [7. Technology Stack](#7-technology-stack)
-   [8. API and Data Flow](#8-api-and-data-flow)
-   [9. AI-Assisted Academic Support](#9-ai-assisted-academic-support)
-   [10. Authentication, Authorization, and
    Privacy](#10-authentication-authorization-and-privacy)
-   [11. GitHub Collaboration](#11-github-collaboration)
-   [12. Developer Setup](#12-developer-setup)
-   [13. Testing and Verification](#13-testing-and-verification)
-   [14. Limitations and Future
    Improvements](#14-limitations-and-future-improvements)
-   [15. Conclusion](#15-conclusion)
-   [16. Acknowledgement](#16-acknowledgement)

------------------------------------------------------------------------

## 1. Introduction

ScholarTrack is a centralized academic management and performance
monitoring system developed to organize academic information and
role-specific activities in one application. Academic information is
often distributed across records, notices, spreadsheets, and
communication channels. This can make it difficult for students to
follow their academic progress, for teachers to manage relevant academic
information, and for departmental staff to review performance
consistently.

ScholarTrack aims to provide a common digital system in which authorized
users can access the academic information and workflows relevant to
their roles.

The project is designed as a desktop application with a modern user
interface and a separate backend service. The frontend provides the
screens through which users interact with the application. The backend
handles API requests, application rules, authentication, authorization,
data access, and supported AI requests. A relational database is used
for persistent data according to the project's configured database
connection. The system also includes an AI-assisted academic support
area using a backend-mediated Groq integration, subject to configured
service credentials and available features.

ScholarTrack is a collaborative project developed by a team of five
members. Each member contributes to a defined area, and those areas are
integrated into one application.

## 2. Project Objectives

The primary objective of ScholarTrack is to make academic information
easier to access and manage through a unified application.

1.  **Centralize academic information:** Provide a common application
    for supported academic records and workflows.
2.  **Support role-based access:** Organize the application around
    different user roles so each user can access permitted screens and
    operations.
3.  **Improve student visibility:** Help students review available
    academic information, including profile details, attendance,
    assignments, marks, notices, fees, and performance indicators where
    implemented.
4.  **Support teaching workflows:** Provide teacher-facing access to
    relevant class and academic activities supported by the application.
5.  **Assist departmental monitoring:** Offer administrative or
    HOD-oriented views for reviewing available academic information and
    summaries.
6.  **Present performance information:** Make academic results and
    related indicators easier to review, including CGPA or other
    performance summaries where supported by the data.
7.  **Explore AI-assisted academic support:** Integrate an AI assistance
    workflow through the backend for supported academic queries and
    contextual help.
8.  **Maintain a modular architecture:** Separate the user interface,
    backend services, database persistence, authentication, and AI
    provider integration.
9.  **Enable collaborative development:** Use Git and GitHub branches to
    organize individual contributions and integrate reviewed work.

## 3. Scope and Main Modules

ScholarTrack brings together several connected areas of academic
management. The exact features available in a release depend on the
implementation included in that build.

  -----------------------------------------------------------------------
  Module                              Purpose
  ----------------------------------- -----------------------------------
  🎓 Student Academic Area            Student dashboard and access to
                                      personal academic details and
                                      supported records

  👩‍🏫 Teacher Academic Area            Teacher-facing workflows for
                                      viewing or managing academic
                                      information within permitted scope

  🏛️ HOD and Administration           Department-level views and
                                      administrative workflows where
                                      implemented

  📊 Academic Records and Reporting   Shared academic data, performance
                                      summaries, and report-oriented
                                      functionality

  🔐 Authentication and Authorization Identity verification,
                                      authenticated API requests, and
                                      role-aware access protection

  🤖 AI Academic Assistance           Backend-mediated integration with
                                      the configured AI provider for
                                      supported features

  🖥️ Desktop Application              Electron-based desktop shell around
                                      the frontend application
  -----------------------------------------------------------------------

The system is not intended to replace every institutional information
system. Its functionality is limited to the workflows, screens, APIs,
and database entities included in the submitted implementation.

## 4. Team Members and Individual Contributions

The following contribution descriptions identify each member's primary
area. They should be read alongside the actual source code, commits,
pull requests, and screens in the submitted version.

### 4.1 Devansh Maini (24EARCS044)

**Primary area: Authentication and User Management**

Devansh's primary area is the authentication and user management
foundation used by ScholarTrack's role-specific workflows.
Authentication establishes who is using the application, while
authorization determines which operations that user may perform.

-   **Login workflow:** Handles credentials entered through the login
    interface and communicates with the backend using the defined API
    contract. The backend verifies the submitted credentials against
    configured user records.
-   **Credential verification:** Supports secure password handling
    through the backend's configured password-hashing and verification
    mechanism. Passwords should not be stored as plaintext database
    values.
-   **Token-based authentication:** Supports the JWT-based API workflow
    where configured. The client uses the issued token for subsequent
    protected requests.
-   **Role-based authorization:** Supports identification of the
    authenticated user's role and role restrictions on protected
    endpoints. The backend enforces permissions independently of
    frontend visibility.
-   **Current-user context:** Helps the application identify the
    signed-in user and role consistently across authenticated screens
    and API requests.
-   **Protected API integration:** Supports common authenticated-request
    handling through the shared API layer.
-   **Security and error handling:** Distinguishes authentication
    failures, authorization failures, and server errors while avoiding
    exposure of secrets or internal implementation details.
-   **Integration and testing:** Coordinates authentication contracts
    with the student, teacher, and HOD modules. Relevant checks include
    valid and invalid login, protected requests, token validation, and
    role restrictions.

**Contribution summary:** This area provides the identity and access
foundation that allows ScholarTrack to distinguish users and protect
role-specific workflows.

### 4.2 Aryan Kumar Singh (24EARCS030)

**Primary area: Student Academic Management and Performance Monitoring**

Aryan's primary contribution is the student academic management and
performance monitoring area. It is intended to give students a clear
view of their own academic status and relevant information.

-   **Student dashboard:** Organizes the main student-facing sections
    and provides a central starting point for reviewing academic
    progress.
-   **Student profile:** Presents relevant profile information and
    academic context through authenticated backend requests.
-   **Attendance visibility:** Organizes available attendance figures or
    records so students can review them clearly.
-   **Assignments:** Provides access to assignment-related information
    where implemented.
-   **Marks and performance:** Presents available marks, results, CGPA,
    semester information, or other indicators based on actual stored
    data and defined calculation rules.
-   **Fees and notices:** Provides a student-accessible view of fee
    information and relevant institutional notices where available.
-   **AI-assisted support:** Connects the student-facing experience to
    supported AI academic assistance features where enabled.
-   **API integration and privacy:** Uses the shared API configuration
    and relies on backend authorization to protect student-specific
    information.
-   **Testing:** Checks student-facing screens, API response handling,
    missing-data states, and record access boundaries.

**Contribution summary:** This area focuses on the student experience,
the presentation of personal academic information, and performance
monitoring.

### 4.3 Akshita Mawaliya (24EARCS016)

**Primary area: HOD, Administration, and Academic Analytics**

Akshita's primary area is the HOD or administration-facing part of
ScholarTrack, with emphasis on departmental visibility and academic
summaries supported by the project.

-   **HOD dashboard:** Provides a structured entry point to the screens
    and information relevant to the HOD role.
-   **Departmental overview:** Organizes available student, class,
    subject, attendance, assignment, or result information at the
    appropriate departmental scope.
-   **Analytics and summaries:** Presents supported academic indicators
    through readable summaries, charts, or comparisons based on defined
    data and calculations.
-   **Administrative usability:** Organizes navigation, filters, search,
    and tables where implemented.
-   **Role-restricted operations:** Keeps HOD or administrative
    operations limited to authorized users, with backend enforcement.
-   **AI-assisted information:** Connects to supported AI-assisted
    workflows without treating AI output as an official institutional
    decision.
-   **Testing:** Verifies role access, data scope, empty states, API
    failures, and restrictions on non-administrative accounts.

**Contribution summary:** This area focuses on departmental visibility,
administrative workflows, and analytics or summary views supported by
the implementation.

### 4.4 Awantika Jaiswal (24EARCS035)

**Primary area: Teacher Module and Teaching Workflows**

Awantika's primary area is the teacher-facing part of ScholarTrack. It
supports academic workflows associated with a teacher's assigned
responsibilities.

-   **Teacher dashboard:** Organizes the features and information
    available to a teacher account.
-   **Class and student context:** Provides access to relevant class,
    subject, or student information within the teacher's authorized
    scope.
-   **Assignments:** Supports assignment-related workflows where
    implemented, including appropriate validation and feedback.
-   **Marks and assessment:** Provides teacher-facing access to
    supported assessment information and data-entry workflows.
-   **Attendance:** Supports attendance entry or review where included
    in the implementation.
-   **Consistency with student views:** Uses the shared backend so
    supported teacher updates are reflected in relevant student-facing
    views.
-   **Permissions and privacy:** Relies on backend restrictions to
    prevent access outside the teacher's authorized scope.
-   **Testing:** Checks teacher workflows, API behavior, permissions,
    and consistency with other modules.

**Contribution summary:** This area supports teaching-related academic
workflows through a teacher-oriented interface connected to
ScholarTrack's shared backend.

### 4.5 Aviral Joshi (24EARCS034)

**Primary area: Academic Data Management and Reports**

Aviral's primary area is the shared academic data management and
reporting side of ScholarTrack. This work helps the student, teacher,
and HOD modules use consistent academic records.

-   **Shared academic data:** Works with the backend's entities,
    relationships, validation rules, and persistence structures.
-   **Backend and persistence coordination:** Aligns API request and
    response structures with the configured database fields and
    application model.
-   **Validation and consistency:** Supports validation of required
    fields, values, and relationships to reduce inconsistent records.
-   **Academic reports:** Organizes available records into supported
    tables, summaries, or performance views.
-   **Cross-module consistency:** Helps ensure the same academic record
    is represented consistently across student, teacher, and HOD views.
-   **Missing and exceptional data:** Supports clear handling of empty
    results, incomplete information, and invalid requests.
-   **Reporting boundaries:** Ensures exports, where implemented,
    reflect the authorized data available to the current user.
-   **Testing:** Verifies data retrieval, persistence, validation,
    report accuracy, and role restrictions.

**Contribution summary:** This area focuses on shared academic data
structures, record consistency, and report-oriented functionality.

## 5. How the Modules Work Together

The project is divided into areas for clarity, but the modules are not
independent applications. They form one connected workflow:

1.  **Authentication establishes identity.** The backend verifies
    credentials and establishes the authenticated context.
2.  **Authorization applies role boundaries.** The application
    determines which screens and backend operations are permitted for
    the current role.
3.  **The student module presents personal academic information.** It
    requests relevant records through the shared API.
4.  **The teacher module supports teaching workflows.** It accesses or
    updates records permitted for the teacher.
5.  **The HOD or administration module provides broader academic
    visibility.** It displays information the current role is authorized
    to review.
6.  **Academic data and reporting keep records consistent.** Shared APIs
    and database persistence help different modules use the same source
    of truth.
7.  **AI assistance operates through the backend.** Where configured, AI
    requests are mediated by the backend.
8.  **The desktop application packages the user interface.** Electron
    provides the desktop shell while the frontend communicates with the
    backend service.

``` mermaid
flowchart TD
    A[User launches ScholarTrack] --> B[Login / Registration]
    B --> C{Authentication}
    C -->|Valid| D[Role and Authorization Check]
    C -->|Invalid| E[Show Login Error]
    D --> F{Assigned Role}
    F --> G[Student Module]
    F --> H[Teacher Module]
    F --> I[HOD / Administration Module]
    G --> J[Shared Spring Boot APIs]
    H --> J
    I --> J
    J --> K[(Configured Relational Database)]
    J --> L[Groq AI Integration]
```

A successful integration requires agreement on API paths, field names,
role identifiers, error responses, data ownership, and configuration.
Changes to a shared API contract should be reviewed by the team members
whose modules depend on it.

## 6. System Architecture

ScholarTrack follows a client-server architecture. The desktop frontend
is responsible for presentation and user interaction. The Spring Boot
backend exposes API endpoints and applies server-side rules. The
relational database persists data managed by the backend. The configured
AI provider is accessed through the backend integration rather than
directly from the frontend.

``` mermaid
flowchart TB
    subgraph Desktop["ScholarTrack Desktop Application"]
        A[React + TypeScript]
        B[Vite]
        C[Electron]
        A --- B
        B --- C
    end

    C <-->|REST API / Authenticated Requests| D

    subgraph Server["Java Spring Boot Backend"]
        D[REST API Layer]
        E[Authentication and Authorization]
        F[Academic Services and Business Rules]
        G[Validation and Persistence Layer]
        D --> E
        D --> F
        F --> G
    end

    G <--> H[(Configured Relational Database)]
    F <--> I[Groq AI API]
```

This is a high-level representation of the architecture. The actual
database provider, deployment environment, network configuration, and
enabled features must match the project's checked-in configuration and
submitted build.

## 7. Technology Stack

  -----------------------------------------------------------------------
  Component                           Technology / Responsibility
  ----------------------------------- -----------------------------------
  Desktop shell                       Electron

  Frontend framework                  React

  Frontend language                   TypeScript

  Frontend build tooling              Vite

  Backend language and framework      Java with Spring Boot

  API communication                   REST endpoints and configured
                                      real-time communication where
                                      implemented

  Authentication                      JWT-based authentication where
                                      configured

  Backend security                    Spring Security and role-aware
                                      authorization where configured

  Password handling                   Backend-configured password hashing
                                      and verification

  Data persistence                    JPA/Hibernate and configured
                                      relational database, where used

  AI assistance                       Groq integration through the
                                      backend

  Version control                     Git and GitHub

  Desktop packaging                   Configured Electron packaging
                                      workflow
  -----------------------------------------------------------------------

Exact dependency versions should be taken from the project's package
manifests and backend build configuration.

## 8. API and Data Flow

A typical interaction begins when a user opens a screen or submits a
form. The frontend prepares a request using the shared API client and
sends it to the backend. For a protected endpoint, the request includes
the authentication information expected by the server.

The backend validates the request, applies authentication and
authorization rules, runs the relevant application logic, and accesses
the database if required. The backend then returns a response that the
frontend uses to update the interface.

Key principles:

-   The frontend handles user interaction and presentation; it is not
    the security enforcement boundary.
-   The backend validates important inputs and controls access to
    protected operations.
-   Persistent academic data is managed through the backend and its
    configured database connection.
-   The UI should handle loading, empty, success, validation,
    authorization, and server-error states clearly.
-   AI provider credentials remain in server-side configuration and are
    not embedded in the desktop client.
-   Shared data definitions help keep records consistent across modules.

Specific API endpoints should be documented from the final backend
controllers and frontend API client. Endpoint names should not be added
unless they exist in the submitted source code.

## 9. AI-Assisted Academic Support

ScholarTrack includes an AI-assisted academic support area using a
configured Groq integration through the backend. Its purpose is to
provide an additional way to ask academic questions or obtain contextual
assistance through the application, where those features are enabled in
the final build.

The integration follows these principles:

-   AI requests are routed through the backend so the provider key is
    not exposed in the desktop client.
-   The application should communicate clearly when the AI service is
    unavailable, returns an error, or has not been configured.
-   AI responses are advisory and may contain mistakes. They do not
    replace official marks, attendance records, institutional notices,
    or decisions made by authorized staff.
-   Context supplied to the AI service should be limited to what is
    necessary for the supported request.

The final demonstration should show only AI functions that are
implemented and configured. Provider credentials must not be included in
this README or public repository.

## 10. Authentication, Authorization, and Privacy

Because ScholarTrack handles role-specific academic information,
security is a core design consideration.

-   **Authentication:** Establishes the user's identity through the
    configured login workflow.
-   **Authorization:** Enforces role permissions on the backend for
    protected endpoints and operations.
-   **Record ownership:** Checks that the current user is permitted to
    access student- or teacher-specific records.
-   **Password security:** Stores password hashes rather than plaintext
    passwords.
-   **Token security:** Validates signed tokens and handles invalid or
    expired tokens without exposing protected data.
-   **Secret management:** Keeps database credentials, JWT signing
    secrets, and AI API keys in environment-specific configuration or a
    secrets manager.
-   **Error messages:** Provides useful feedback without exposing stack
    traces, secrets, or sensitive account details.
-   **Data minimization:** Displays and sends only the information
    required for a particular workflow.
-   **Testing data:** Uses synthetic or appropriately anonymized data in
    screenshots and demonstrations.

A secure interface alone is insufficient. Restrictions must be enforced
by the backend because API calls can be made independently of the
desktop screens.

## 11. GitHub Collaboration

Git and GitHub provide a way to organize the work of the five team
members. Each member should work on a branch associated with their
actual module or task. Changes should be committed in meaningful units,
pushed to the shared repository, reviewed, tested, and merged into the
integrated `main` branch when ready.

Suggested branch naming convention:

  Team member          Suggested branch
  -------------------- ---------------------------
  Devansh Maini        `devansh-auth`
  Aryan Kumar Singh    `aryan-student`
  Akshita Mawaliya     `akshita-hod-ai`
  Awantika Jaiswal     `awantika-teacher`
  Aviral Joshi         `aviral-academic-reports`
  Integrated project   `main`

These names are conventions, not proof that branches with these exact
names exist. The final submission should use branch names and commit
links visible in the actual repository.

## 12. Developer Setup

The following notes are intended for contributors who want to run the
project from source. The installed Windows application can be used by
following the [installation
instructions](#how-to-install-and-start-scholartrack).

### Prerequisites

Install the tools required by the checked-in project configuration:

-   Node.js and npm for the frontend.
-   Java Development Kit (JDK) version supported by the backend project.
-   Maven, if the backend uses Maven.
-   Git for source control.
-   A configured database and required environment variables for the
    backend.

Use the exact versions specified by the repository's configuration where
available.

### Frontend development

Open a terminal in the frontend directory containing `package.json` and
run:

``` bash
npm install
npm run dev
```

To create a production frontend build, use the build script defined in
`package.json`, commonly:

``` bash
npm run build
```

### Desktop packaging

The desktop build uses Electron. The exact packaging command must be
taken from the scripts and Electron Builder configuration in the
repository. A Windows installer may be generated through the configured
packaging workflow. Build output depends on the local environment and
packaging configuration.

### Backend and database

Start the Spring Boot backend using the project's configured build tool
and application instructions. Configure the database connection and
required server-side values before starting the backend.

The desktop application must be configured to reach the running backend.
A client on another computer cannot use `localhost` to reach a backend
running on a developer's computer: `localhost` refers to the computer on
which the client itself is running. For multi-computer testing,
configure a reachable host address and ensure the network and firewall
permit the required connection.

### AI configuration

If AI assistance is enabled, configure the required provider key on the
backend side. Do not paste the key into this README, commit it to
GitHub, or expose it in frontend variables bundled into the desktop
application.

## 13. Testing and Verification

Before submission, verify the application as a connected system. A
feature that works in isolation may still fail after integration because
of API contracts, database configuration, or role restrictions.

-   [ ] **Build verification:** Confirm that the frontend builds
    successfully and the backend starts with the documented
    configuration.
-   [ ] **Connectivity verification:** Confirm that the desktop client
    can reach the backend URL configured for the test environment.
-   [ ] **Authentication verification:** Test successful and
    unsuccessful login attempts and protected requests.
-   [ ] **Authorization verification:** Confirm that student, teacher,
    and HOD or administrative roles cannot access restricted endpoints
    or records.
-   [ ] **Student workflow verification:** Review the implemented
    student dashboard and available academic information using valid
    test data.
-   [ ] **Teacher workflow verification:** Test supported teacher
    operations and confirm results appear consistently in relevant
    views.
-   [ ] **Administrative workflow verification:** Test HOD or
    administration views with an authorized account.
-   [ ] **Data integrity verification:** Confirm that invalid data is
    rejected and shared records remain consistent across modules.
-   [ ] **Reporting verification:** Compare report values with source
    records and check empty or filtered results.
-   [ ] **AI verification:** If enabled, test a valid request and
    service-unavailable behavior.
-   [ ] **Desktop verification:** Test application launch, navigation,
    error states, and backend connectivity in the packaged application.
-   [ ] **Privacy verification:** Ensure screenshots and public commits
    do not expose real student information, credentials, tokens, or
    private configuration.

Only mark a test as passed when it has actually been performed.
Screenshots, test records, and commit references can be used as evidence
in the final project submission.

## 14. Limitations and Future Improvements

Potential improvements should be selected after reviewing the submitted
version and identifying genuine gaps.

-   Expand automated tests for API behavior, authorization, and
    cross-module integration.
-   Improve validation and error messages for forms and network
    failures.
-   Add clearer report filters and date or semester selection where
    relevant.
-   Improve accessibility, keyboard navigation, and interface
    consistency.
-   Add robust logging and diagnostics without recording passwords,
    tokens, or sensitive student information.
-   Improve deployment configuration for multiple clients connecting to
    a centrally hosted backend.
-   Document database setup, backup, and recovery procedures.
-   Add monitoring for backend availability and AI provider failures.
-   Refine AI prompts and context handling while maintaining privacy and
    treating AI output as advisory.
-   Maintain an explicit test checklist for every release and merged
    module.

These are potential improvements, not claims that the listed work has
already been completed.

## 15. Conclusion

ScholarTrack is a team-developed academic management and performance
monitoring application intended to bring student, teacher, and
departmental workflows into a common desktop system. Its architecture
separates the user interface from backend services and persistent data,
while authentication and role-based authorization provide the foundation
for protected access. The AI-assisted academic support component adds an
optional assistance workflow through the configured backend integration.

The five individual work areas contribute to different parts of the same
application: Devansh Maini focuses on authentication and user
management; Aryan Kumar Singh focuses on student academic management and
performance monitoring; Akshita Mawaliya focuses on HOD, administration,
and analytics; Awantika Jaiswal focuses on teacher workflows; and Aviral
Joshi focuses on shared academic data management and reporting.

The value of the project depends on these modules being integrated,
tested, and documented consistently. The source repository and running
build remain the authority for which features are complete.

## 16. Acknowledgement

The team acknowledges the guidance and academic support provided by
**Er. Ram Babu Buri**, Assistant Professor, Department of Computer
Science and Engineering, Arya College of Engineering & IT, Jaipur. The
project has been prepared as part of the team's academic project work
for the 2026--2027 session.

------------------------------------------------------------------------

::: {align="center"}
**ScholarTrack · Academic Session 2026--2027**\
*Arya College of Engineering & IT, Jaipur*
:::
