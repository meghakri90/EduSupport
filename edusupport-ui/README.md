# EduSupport – Student Support & Ticket Management System

## 1. Project Overview

EduSupport is a student support and ticket management system designed for educational institutions.

Students can raise support requests related to fees, attendance, ID cards, documents, certificates, and other administrative issues. Staff members can manage and resolve tickets, while administrators/managers can monitor ticket status, workload, ageing, SLA breaches, and escalations.

The system focuses on improving ticket ownership, response tracking, transparency, and resolution management.

---

## 2. Problem Statement

Educational institutions receive a large number of student support requests through different channels.

Without a centralized ticketing system:

- Requests can be missed or duplicated.
- Students may not know the current status of their request.
- Staff ownership may be unclear.
- Delayed requests are difficult to identify.
- Management has limited visibility into workload and SLA performance.

EduSupport addresses these problems through a centralized ticketing system.

---

## 3. User Roles

### Student

- Create support tickets
- Select category and priority
- View submitted tickets
- View ticket details
- Add comments/replies
- Track ticket status and history

### Staff

- View tickets
- Manage assigned tickets
- Assign and reassign tickets
- Change ticket status
- Add comments
- View ticket history
- Monitor SLA-related information

### Admin / Manager

- Monitor overall tickets
- View dashboard statistics
- Monitor ticket ageing
- Identify SLA breaches
- Trigger SLA checks
- Monitor escalated tickets
- View ticket details and activity history

---

## 4. Main Features

### Ticket Management

- Create tickets
- Automatic ticket number generation
- Category selection
- Priority management
- Status management
- Ticket assignment
- Ticket reassignment
- Ticket ageing

### Comments & Communication

- Add comments to tickets
- Student and staff communication
- Ticket-specific discussion

### Activity History

The system records important ticket activities such as:

- Ticket creation
- Assignment
- Status changes
- Reassignment
- Escalation

### SLA Management

Each category has a default SLA duration.

| Category | SLA |
|---|---:|
| Fees | 48 hours |
| Attendance | 24 hours |
| ID Card | 24 hours |
| Documents | 72 hours |
| Certificate | 48 hours |
| Other | 72 hours |

Tickets are monitored against their due time and can be escalated when the SLA is exceeded.

### Management Dashboard

The dashboard provides:

- Total tickets
- Open tickets
- Pending tickets
- Resolved tickets
- Escalated tickets
- SLA-breached tickets
- Ticket ageing information

---

## 5. Ticket Workflow

```text
Student Creates Ticket
        ↓
      Open
        ↓
    Assigned
        ↓
   In Progress
        ↓
 ┌───────────────┐
 │               │
 ↓               ↓
Pending       Resolution
Student/         ↓
Internal       Resolved
                  ↓
                Closed

---

## 6. Technology Stack

### Backend

- ASP.NET Core Web API
- .NET 10
- Entity Framework Core
- SQL Server
- REST APIs

### Frontend

- React
- Vite
- JavaScript
- CSS

### Development Tools

- Visual Studio
- Visual Studio Code
- SQL Server LocalDB
- Postman / API testing tools
- Git

---

## 7. Architecture

```text
React Frontend
      ↓
ASP.NET Core Web API
      ↓
Entity Framework Core
      ↓
SQL Server / LocalDB

The frontend communicates with the backend through REST APIs.

Entity Framework Core is used for database access and migrations.

---

## 8. Database Design

Main entities:

- Users
- Categories
- Tickets
- TicketComments
- TicketHistory
- TicketAssignments

### Users

Stores student, staff, and administrator information.

### Categories

Stores ticket categories and their default SLA hours.

### Tickets

Stores the main ticket information including:

- Ticket number
- Student
- Category
- Subject
- Description
- Priority
- Status
- Assigned staff
- Creation time
- Due time
- Resolution time
- Closing time

### TicketComments

Stores comments associated with tickets.

### TicketHistory

Stores ticket activity and status/assignment changes.

### TicketAssignments

Stores ticket assignment information and assignment history.

---

## 9. API Endpoints

### Tickets

GET    /api/Tickets
GET    /api/Tickets/{id}
POST   /api/Tickets
PATCH  /api/Tickets/{id}/status
PATCH  /api/Tickets/{id}/assign
GET    /api/Tickets/{id}/history
GET    /api/Tickets/ageing
POST   /api/Tickets/check-sla

### Comments

GET    /api/TicketComments/ticket/{ticketId}
POST   /api/TicketComments

### Users

GET    /api/Users

### Categories

GET    /api/Categories

### Dashboard

GET    /api/Dashboard/summary

---

## 10. Assumptions

1. The system supports three primary roles: Student, Staff, and Admin/Manager.
2. A ticket belongs to one student and one category.
3. Staff members can be assigned to tickets.
4. Category-based default SLA hours are used.
5. SLA calculation currently uses calendar hours.
6. A ticket can be reopened after resolution.
7. Ticket activity is stored in a separate history table.
8. Multiple comments can be added to a ticket.
9. Local SQL Server LocalDB is used for development.
10. Authentication and authorization can be extended with ASP.NET Core Identity or JWT for production.

---

## 11. Edge Cases Considered

- Empty ticket description
- Invalid priority
- Invalid ticket status
- Inactive student
- Inactive staff
- Invalid category
- Previous assignments
- Unassigned tickets
- SLA breach
- Ticket reopening
- Resolved and closed timestamps
- Ticket activity tracking

---

## 12. Validation & Testing

The following flows were tested during development:

- Student ticket creation
- Ticket number generation
- Category and priority selection
- Ticket assignment
- Status updates
- Ticket comments
- Activity history
- Dashboard statistics
- Ticket ageing
- SLA checking
- Ticket escalation

API responses were tested using local API endpoints.

---

## 13. Design Decisions & Trade-offs

### Why ASP.NET Core?

ASP.NET Core provides a structured framework for building REST APIs and integrates well with Entity Framework Core and SQL Server.

### Why React?

React provides reusable UI components and makes it easier to create separate dashboards for different user roles.

### Why SQL Server?

SQL Server provides relational data management suitable for users, tickets, assignments, comments, and history.

### Why separate TicketHistory and TicketComments?

Comments represent communication, while history represents system activity. Keeping them separate makes auditing and activity tracking clearer.

### Why category-based SLA?

Different support requests have different expected response times. Category-based SLA provides a simple and configurable starting point.

---

## 14. Future Improvements

- ASP.NET Core Identity / JWT authentication
- Role-based authorization
- Email notifications
- Real-time notifications
- File attachments
- Advanced search and filtering
- Configurable SLA policies
- Business-hour based SLA calculation
- Automatic scheduled escalation
- Detailed analytics and reports
- Audit logging
- Pagination and optimized database queries
- Docker deployment
- Cloud deployment using Azure

---

## 15. Project Structure

EduSupport
├── EduSupport.Api
│   ├── Controllers
│   ├── Data
│   ├── Models
│   ├── Migrations
│   ├── Properties
│   ├── appsettings.json
│   └── Program.cs
│
└── edusupport-ui
    ├── src
    ├── public
    ├── package.json
    └── vite.config.js

---

## 16. How to Run

### Backend

Open the `EduSupport.Api` project in Visual Studio.

Ensure SQL Server LocalDB is available.

Run:

Update-Database

Then start the ASP.NET Core API.

Development API:

http://localhost:5293

### Frontend

Open the `edusupport-ui` folder in VS Code.

Install dependencies:

npm install

Start the frontend:

npm run dev

The frontend runs on the Vite development server.

---

## 17. Demo Users

Student  
student@edusupport.com

Staff  
staff@edusupport.com

Admin  
admin@edusupport.com

---

## 18. Conclusion

EduSupport provides a centralized workflow for handling student support requests.

The prototype demonstrates ticket creation, assignment, status management, comments, activity history, SLA monitoring, ageing, escalation, and management visibility.

The architecture is designed so that authentication, notifications, advanced SLA rules, and cloud deployment can be added without changing the core ticket management workflow.
