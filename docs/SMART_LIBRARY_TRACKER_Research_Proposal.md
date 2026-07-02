# SMART LIBRARY TRACKER  
## Research Proposal

**Presented to**  
University of Education, Winneba  

**In Partial Fulfilment of the Requirements for the Award of**  
Bachelor of Science (ICT)  

**By**  
Clement Baffour Palmer  

**February 2026**

---

## ABSTRACT

The Smart Library Tracker is a web-based application designed to automate the tracking of student and staff entry and exit in the university library. The current manual system, which relies on bag tags and handwritten entries in notebooks, is inefficient, time-consuming, and prone to errors. This project proposes the development of a secure and scalable web-based system that records attendance at point of entry and exit, stores data in a centralized relational database, and provides a web dashboard for librarians to monitor usage and generate reports. The system will be built using modern web technologies including HTML, CSS, JavaScript for the frontend, and the Django framework for the backend, with a relational database such as MySQL for persistent storage. Role-based authentication will restrict access to librarians and administrators for management and reporting, while students and staff will use the system to register their entry and exit. The project will improve efficiency, accuracy, and overall library management while producing reliable data for institutional decision-making.

---

## CHAPTER ONE: INTRODUCTION

### 1.1 Background and Context

Libraries are essential components of educational institutions. They provide spaces for study, access to learning resources, and support for teaching and research. In universities such as the University of Education, Winneba, the library serves a large population of students and staff, and understanding how the facility is used is important for resource allocation, security, and planning.

At present, many university libraries rely on manual methods to record who enters and leaves the building. These methods often include the use of bag tags, sign-in sheets, or notebooks where users write their names, identification numbers, and times. Such practices have been in use for decades but are increasingly inadequate as student numbers grow and as institutions require better data for reporting and management.

Web technologies have matured to a point where they can reliably support business and institutional processes. Web-based systems offer centralised data storage, multi-user access from different devices, and the ability to generate reports automatically. They can also enforce security through authentication and authorisation, ensuring that only authorised users can view or modify sensitive data. For these reasons, a web-based solution is a suitable approach to modernise library attendance tracking.

### 1.2 Problem Statement

The current system of tracking library attendance at the university relies on manual recording of student and staff entry and exit. This approach leads to several problems. First, the records are often inaccurate because of illegible handwriting, incomplete entries, or human error when copying data. Second, generating reports—such as daily or monthly usage statistics—requires manual counting and compilation, which is time-consuming and error-prone. Third, the workload on library staff is increased because they must maintain physical records and respond to ad hoc requests for usage information. Fourth, historical data stored in notebooks or loose sheets is difficult to search, archive, and use for long-term analysis. Finally, there is no single, reliable source of truth for who is in the library at any given time, which can affect security and emergency procedures.

These issues justify the need for an automated, web-based system that captures entry and exit events electronically, stores them in a database, and supports reporting and monitoring through a web dashboard.

### 1.3 Justification

A web-based Smart Library Tracker is justified for several reasons. First, it provides **accessibility**: authorised users can access the system from any device with a web browser and internet connection, without installing special software. Second, it offers **scalability**: the system can accommodate a growing number of users and records by using a proper database and server infrastructure. Third, it enables **centralised management**: all attendance data is stored in one place, making it easier to maintain, back up, and query. Fourth, it supports **automation**: entry and exit can be recorded with minimal manual effort, and reports can be generated on demand. Fifth, it improves **security and accountability**: authentication ensures that only registered users can record attendance, and role-based access ensures that sensitive functions are restricted to librarians and administrators. For these reasons, a web-based system is an appropriate and realistic solution for the stated problem.

### 1.4 Significance of the Study

This study is significant for the following reasons. It will **improve efficiency** by reducing the time library staff spend on manual recording and report compilation. It will **reduce errors** in attendance data by capturing information electronically and validating it where possible. It will **enhance library management** by providing librarians with a dashboard to monitor real-time and historical usage. It will **support institutional reporting** by making it easier to produce usage statistics for internal or external stakeholders. Finally, it will **demonstrate the application of ICT** to a real-world problem in an educational setting, which is aligned with the learning outcomes of the Bachelor of Science (ICT) programme.

---

## CHAPTER TWO: OBJECTIVES

### 2.1 Primary Objective

To design and develop a functional web-based Smart Library Tracker that automates the recording of student and staff entry and exit in the university library, stores attendance data in a centralised database, and provides a web dashboard for librarians to monitor usage and generate reports.

### 2.2 Secondary Objectives

- **To design a user-friendly interface**  
  To create a web interface that is clear, easy to navigate, and appropriate for both library users (students and staff) and librarians, so that entry and exit can be recorded quickly and dashboard features can be used without extensive training.

- **To implement authentication and authorisation**  
  To implement a secure login mechanism so that only registered users can record their entry and exit, and so that only authorised roles (e.g. librarians, administrators) can access the dashboard, manage settings, and generate reports.

- **To store attendance data in a database**  
  To design and implement a relational database schema that stores user information, entry and exit events (including timestamp and source), and related settings, so that data is consistent, queryable, and suitable for reporting.

- **To generate reports**  
  To provide reporting functionality that allows librarians to view and export attendance data, for example by date range, user type, or summary statistics, to support monitoring and institutional reporting.

- **To evaluate system usability**  
  To evaluate the system through testing and, where possible, feedback from intended users, to ensure that it meets the stated requirements and is usable in a real library environment.

---

## CHAPTER THREE: METHODOLOGY

### 3.1 Development Methodology

The project will follow a structured approach based on the Software Development Life Cycle (SDLC). The main phases are as follows.

- **Planning and requirement analysis**  
  The problem will be clearly defined, and functional and non-functional requirements will be documented. Stakeholders (e.g. librarians, students) will be considered to ensure that the system addresses real needs. A project plan with milestones and timelines will be prepared.

- **System design**  
  The system will be designed at a high level (e.g. web-based architecture with browser clients, application server, and database). The database will be designed (tables for users, roles, attendance events, and settings). User interfaces will be outlined for the main flows: user login, entry/exit recording, and librarian dashboard and reports.

- **Development**  
  The system will be implemented according to the design. The frontend will be built using HTML, CSS, and JavaScript. The backend will be implemented using a suitable framework (e.g. Django), and the database will be implemented using a relational database management system (e.g. MySQL). Authentication, role-based access, and reporting features will be developed and integrated.

- **Testing**  
  The system will be tested to verify that it meets the requirements. Testing will include functional testing of login, entry/exit recording, dashboard, and reports, as well as basic checks for security (e.g. access control) and usability.

- **Deployment and documentation**  
  The system will be prepared for deployment in a suitable environment (e.g. a server with web and database services). User and technical documentation will be prepared to support handover and future maintenance.

### 3.2 Technology Stack

The following technologies will be used to implement the Smart Library Tracker.

- **Frontend**  
  **HTML** for structure, **CSS** for layout and styling, and **JavaScript** for client-side interactivity. These technologies ensure that the application runs in standard web browsers and can be made responsive for different devices.

- **Backend**  
  **Django** (Python-based web framework) will be used to implement the server-side logic. Django provides built-in support for user authentication, database access through an ORM, and the creation of web views and forms, which aligns well with the requirements for a secure, database-driven application.

- **Database**  
  **MySQL** (or a compatible relational database) will be used to store user accounts, roles, attendance events, and system settings. The relational model will support queries for reporting and ensure data integrity through constraints and relationships.

- **Additional considerations**  
  The application will use HTTPS where possible for secure communication, and passwords will be stored using appropriate hashing (e.g. as provided by Django’s authentication system). The design will allow for future extensions, such as integration with RFID or other hardware for automated entry/exit capture, if required.

### 3.3 System Design

The system design describes the high-level architecture, the database structure, and the user interface layout. This section provides the blueprint for implementation and serves as a reference when adding screenshots of the implemented UI pages to the proposal.

#### 3.3.1 Architectural Design

The Smart Library Tracker follows a **three-tier web architecture**:

1. **Presentation tier (client)**  
   Users interact with the system through a web browser. The client sends HTTP requests to the server and displays the HTML, CSS, and JavaScript returned by the application. No special software is required beyond a modern browser; the interface can be used on desktop and mobile devices.

2. **Application tier (server)**  
   The Django application runs on a web server (e.g. WSGI server such as Gunicorn). It handles user authentication, session management, business logic (e.g. validating entry/exit sequences, computing occupancy), and the generation of HTML pages and report data. Access to administrative and reporting features is restricted by role (e.g. Admin, User).

3. **Data tier**  
   A relational database (MySQL or compatible) stores all persistent data: user accounts, user profiles and roles, library settings, and entry/exit events. The application communicates with the database through Django’s Object-Relational Mapping (ORM), which ensures structured queries and reduces the risk of SQL injection.

Data flows as follows: the user submits an action (e.g. login, record entry) from the browser; the server validates the request and the user’s permissions, updates or reads the database as needed, and returns a new page or redirect. This separation of tiers keeps the system maintainable and allows the database to be backed up and scaled independently.

#### 3.3.2 Database Design

The database is designed to support users, roles, attendance events, and library configuration. The main entities and their relationships are described below.

- **User (auth_user)**  
  The system uses Django’s built-in user model (or equivalent) to store login credentials: username, password (hashed), email, and related account fields. Each person who can record entry or exit (student or staff) or who can access the dashboard (librarian/admin) has one user account.

- **UserProfile**  
  Each user has an associated profile that stores extended information: **role** (e.g. Admin, User), **student_staff_id** (institution ID for students and staff), and **created_at**. The profile is linked to the user by a one-to-one relationship. The role determines whether the user can access the librarian dashboard, manage settings, and generate reports.

- **RFIDCard (optional / future use)**  
  If the system is extended to support RFID-based entry and exit, a table can store the mapping between RFID tag identifiers (tag_uid) and user accounts. Each user can have one active card; the table supports marking cards as active or inactive and recording when they were issued.

- **LibrarySettings**  
  A single-row configuration table stores library-wide settings: **library_name**, **capacity_limit** (maximum number of occupants), and **warning_threshold_percent** (e.g. 80% for capacity alerts). These values are used by the dashboard to display occupancy and capacity levels.

- **EntryExitEvent**  
  Each time a user enters or leaves the library, one record is created. Fields include: **user** (foreign key to User), **event_type** (Entry or Exit), **event_time**, **source** (e.g. Web Manual, Admin Override, or RFID), and optional **gate** and **notes**. Indexes on event_time, user, and event_type support fast queries for “who is in the library,” “entries/exits today,” and date-range reports.

Relationships: User → UserProfile (one-to-one); User → EntryExitEvent (one-to-many); User → RFIDCard (one-to-many, with constraint for one active card per user). LibrarySettings is a singleton. This design ensures that all attendance data is traceable to a user and that reporting can be done efficiently by querying events and joining to users and profiles.

#### 3.3.3 User Interface Design

The user interface is organised into two main areas: **public/authenticated user pages** (login, signup, user dashboard for recording entry/exit) and **administrative pages** (librarian dashboard, reports, settings, user management). The following subsections describe each screen; screenshots of the implemented UI can be inserted where indicated.

**Authentication and registration**

- **Login page**  
  The login page allows users to enter their username and password. On success, the user is redirected to the appropriate dashboard (user or admin) based on their role. Error messages are shown for invalid credentials.  
  *[Insert screenshot: Login page]*

- **Sign-up (registration) page**  
  New users (e.g. students or staff) can register by providing username, email, password, and optionally student/staff ID. After registration, they can log in and use the entry/exit recording features.  
  *[Insert screenshot: Sign-up / registration page]*

**User-facing pages**

- **User dashboard**  
  After logging in, ordinary users (students and staff) see a dashboard where they can record their **entry** or **exit** from the library with a single action (e.g. button or link). The interface may show their last recorded event (e.g. “You last recorded: Entry at 10:00 AM”) to avoid duplicate entries and to guide the next action.  
  *[Insert screenshot: User dashboard – entry/exit recording]*

**Administrative (librarian) pages**

- **Admin dashboard (overview)**  
  Librarians and administrators see an overview dashboard after login. This page typically shows summary information such as current occupancy, number of entries and exits today, and quick links to detailed views and reports.  
  *[Insert screenshot: Admin dashboard – overview]*

- **Current occupancy**  
  This page shows who is currently inside the library, derived from the latest entry/exit events per user (e.g. users whose last event is “Entry” and who have not yet recorded “Exit”).  
  *[Insert screenshot: Current occupancy page]*

- **Entries today / Exits today**  
  These pages list all entry events or all exit events for the current day, with timestamp and user information, to support monitoring and verification.  
  *[Insert screenshot: Entries today]*  
  *[Insert screenshot: Exits today]*

- **Capacity level**  
  This page displays current occupancy against the configured capacity limit and warning threshold (e.g. “350 / 500” or “70%”), helping staff manage crowding and safety.  
  *[Insert screenshot: Capacity level page]*

**Reports**

- **Daily report**  
  The daily report allows the librarian to view or export attendance data for a selected date: total entries, total exits, list of events, and optionally summary statistics.  
  *[Insert screenshot: Daily report page]*

- **Weekly report**  
  The weekly report provides aggregated data for a chosen week (e.g. daily totals or day-by-day breakdown), supporting trend analysis and institutional reporting.  
  *[Insert screenshot: Weekly report page]*

**Configuration and user management**

- **Settings**  
  Administrators can update library-wide settings such as library name, capacity limit, and warning threshold. Changes take effect immediately for occupancy and capacity displays.  
  *[Insert screenshot: Settings page]*

- **User management (users list)**  
  Administrators can view a list of registered users (and optionally profiles), supporting account management and oversight.  
  *[Insert screenshot: Users list / user management page]*

All pages share a consistent layout (e.g. a common base template with navigation) so that users can move easily between the user dashboard and, for librarians, the admin dashboard, reports, and settings. Placing the screenshots in the order above will align the proposal with the actual flow of the system from login through to reporting and configuration.

---

## CHAPTER FOUR: IMPLEMENTATION PLAN

The implementation will be carried out in phases, each with clear deliverables.

**Phase 1: Requirement analysis and planning (Weeks 1–2)**  
- Gather and document functional requirements (e.g. who can log in, how entry/exit is recorded, what reports are needed).  
- Define non-functional requirements (e.g. performance, security).  
- Produce a simple project plan and schedule.

**Phase 2: System design (Weeks 3–4)**  
- Design the overall architecture (client–server, web application, database).  
- Design the database schema (users, profiles, roles, attendance events, settings).  
- Sketch or wireframe the main screens: login, entry/exit, and librarian dashboard.

**Phase 3: Development (Weeks 5–10)**  
- Set up the development environment (Django project, database, version control).  
- Implement user registration and authentication.  
- Implement role-based access (e.g. student/staff vs librarian/admin).  
- Implement entry and exit recording and persistence in the database.  
- Build the librarian dashboard (overview, recent events, basic statistics).  
- Implement reporting (e.g. filter by date, export or display summary data).  
- Apply frontend styling and improve usability.

**Phase 4: Testing (Weeks 11–12)**  
- Perform functional testing of all main features.  
- Check access control and basic security.  
- Fix defects and refine the user interface as needed.

**Phase 5: Deployment and documentation (Weeks 13–14)**  
- Deploy the application on a suitable server (or prepare deployment instructions).  
- Write user documentation (how to log in, record entry/exit, use the dashboard and reports).  
- Write a short technical summary for the project report and future maintenance.

This plan ensures a logical progression from requirements to a working, documented system that can be demonstrated and submitted as part of the final year project.

---

## CHAPTER FIVE: EXPECTED OUTCOMES

Upon successful completion of the project, the following outcomes are expected.

1. **A functional web-based Smart Library Tracker**  
   A working application that allows students and staff to record their entry and exit from the library and allows librarians to view and manage attendance data through a web dashboard.

2. **Improved efficiency**  
   Reduction in the time and effort required to record attendance and to produce usage reports, compared with the manual bag-tag and notebook system.

3. **Better data quality and management**  
   Attendance data stored in a structured database, with consistent formatting and the ability to query by date, user, or other criteria, supporting accurate reporting and historical analysis.

4. **Clear demonstration of ICT skills**  
   Evidence of the use of web technologies, database design, authentication, and software development practices appropriate to a Bachelor of Science (ICT) final year project.

5. **Documentation and deliverables**  
   A project report documenting the problem, objectives, methodology, design, implementation, and evaluation, together with the source code and user documentation, suitable for submission and potential use by the university library.

---

## CHAPTER SIX: CONCLUSION

The Smart Library Tracker project addresses a real need in university libraries: replacing manual, error-prone attendance tracking with an automated, web-based system. By using a structured development approach and modern web and database technologies, the project will deliver a system that records student and staff entry and exit, stores data in a centralised database, and provides a web dashboard for librarians to monitor usage and generate reports.

The system is expected to improve efficiency, reduce errors, and enhance library management, while providing a practical example of applying ICT to an institutional problem. The proposed methodology, technology stack, and implementation plan are realistic and aligned with the requirements of a final year project in ICT. Upon completion, the Smart Library Tracker will offer a solid foundation for modernising library attendance tracking at the University of Education, Winneba, and can be extended in the future with additional features such as integration with RFID or other access control systems if the institution so requires.

---

*End of Research Proposal* 
