# Global ERP & Management System - Project Documentation

## Project Overview
This project is a comprehensive internal ERP and Management System designed to handle various aspects of business operations ranging from core Human Resources to Sales, Client Management, Finance, Project Execution, Marketing, and Documents. It is built as a single-page application using React, Vite, and an Express.js backend with an SQLite database. It features role-based access control (RBAC), multi-level permissions, and real-time dashboard analytics.

## 1. Authentication & Access Control
- **User Authentication:** Secure login functionality.
- **Roles & Hierarchy:** Comprehensive role structure including `super_admin`, `admin`, `hr`, `sales`, `project_manager`, `accountant`, `payroll_admin`, `employee`, `intern`, `contract`, etc.
- **Permissions Framework:** Granular permissions ranging from view/create/edit/delete for modules like Users, Clients, Finance, Payroll, Projects, leads, calendar, etc.
- **Data Visibility Control:** Data access restricted to self, team, department, or all, depending on user assignments and permissions.

## 2. Core Modules

### 2.1 Dashboard
- Centralized hub for metrics and quick actions.
- Displays different insights based on the user's role (e.g., HR metrics for HR admins, Pipeline metrics for Sales, active tasks for employees).

### 2.2 Sales & Projects
- **Prospect Management:** Telecalling and initial screening with statuses (Not Answered, Follow up later, Potential Lead, etc.). Form captures basic company metadata, contacts, and business type details.
- **Lead Management:** Qualified interactions pushing to different funnel stages (Qualified, Proposal, Negotiation, Closed Won/Lost).
  - Maintains Follow-Up Call/Meeting history.
  - Minutes of Meeting (MOMs) tracking for specific leads.
- **Client Management:** Central directory of converted clients, linking them to projects, engagement types, account owners, and generating invoices based on assigned currency & billing cycle.
- **Project Management:** Track deliverables, progress (0-100), and assignments.
  - Links to Client records.
  - Contains team member designations, manager assignment, and start/end dates.
- **Task Management (Kanban / List):** Track granular pieces of work under projects.
  - Task Prioritization, due dates, statuses (Todo, In-progress, Testing, Done).
  - Includes Time Tracking logs on tasks and feedback history.

### 2.3 HR & Operations
- **Employee Directory & Profiles:** Track employee demographic data, contact numbers, emergency details.
  - Handle Onboarding/Offboarding exits.
  - Track Employee KPIs and Performance Reviews.
- **Attendance Management:** Tracking daily Check-ins, Check-outs, overtimes, leaves taken vs balances.
- **Leave Requests:** Submitting and approving/rejecting leave applications tracking different types of leaves (Sick, Casual, Earned). 
- **Payroll Management:** Salary structures mapping basic pay, HRAs, PF/TDS deductions, generating automated monthly salary records.
- **Resume Management (ATS):** Tracking candidates applying for positions.
  - Stages: New -> Screening -> Interviewing -> Offered.
  - Capture interview MOMs and internal feedback.
- **Calendar & Events:** Central company calendar to visualize holidays, meetings, maintain target scope visibility across departments or users.

### 2.4 Finance & Legal
- **Invoicing:** Create drafts, send, and track payments of invoices linked to clients. Supports recurring formats. Includes tax setups and multi-currency formats. 
- **Quotations:** Generating pricing estimates to clients before invoice conversion.
- **Vendor Management:** Track suppliers and third-party category workers handling expenses and pending balances.
- **Expense Tracking:** Track company outgoing payments, mapped by category (salary, rent, marketing), supporting auto-generated recurring expenses.
- **Asset/Renewal Management:** Track expiring services (Software licenses, Domains, Hosting, AMC) to schedule auto-cost reminders avoiding operational downtimes.
- **Document Management:** Central secure repository.
  - Categorizing documents linking to clients or projects.
  - File Version control and Role-based view restrictions.

### 2.5 Tools & Marketing
- **SEO & Rankings:** Track target keywords, current position, volume, and task lists (on-page, technical). Tracking domain backlinks.
- **Social Media:** Draft and schedule posts across different targets (LinkedIn, X, Instagram) fetching engagement metrics.
- **Ad Campaigns:** Record Meta/Google Ad performance mapping budget spent vs impressions & leads.
- **Internal Messaging / Comm (Chat & Email):** Built-in internal group/direct channel chatting and integrated internal communications.

## 3. Database Schema Entity Structure
- Users, Roles, Departments
- Clients, Prospects, Leads, MOMs, FollowUps
- Projects, Tasks, Team Assignments
- Invoices, Expenses, Payments, Vendors
- Payroll, Attendance, Leaves, Holidays
- Resumes
- Marketing (SEO, Social, Ads)
- Documents & Renewals

## 4. Technology Stack
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React (Icons).
- **Backend:** Node.js, Express.js.
- **Database:** SQLite3 (`better-sqlite3` adapter).
- **Architecture:** Single Page App with RESTful JSON API.
