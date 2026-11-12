# Copilot Project Handover

## Project Name

Employee Attendance and Leave Management Platform

## Project Goal

Create a centralized platform for managing employee attendance, Vacation
Leave (VL), Sick Leave (SL), leave balances, manager approvals, and calendar
updates. The platform should reduce manual work and duplicate entries.

## Current Project Status

The following setup activities have been completed:

- A GitHub repository has been created.
- A Supabase project has been created.
- The database tables have been created.
- A Next.js application has been created using the with-supabase template.
- The application runs locally through npm run dev.
- The local project has been connected and pushed to GitHub.

## Technology Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Authentication
- Supabase PostgreSQL database
- Supabase Row Level Security
- GitHub
- GitHub Copilot

## Database Tables

### profiles

Stores:

- Employee profile
- Employee name and email
- Employee role
- Assigned manager
- Vacation Leave balance
- Sick Leave balance

Important fields:

- id
- full_name
- email
- role
- manager_id
- vl_balance
- sl_balance

### leave_requests

Stores:

- Employee leave requests
- Leave type
- Start and end dates
- Number of leave days
- Reason
- Request status
- Manager comments
- Reviewing manager
- Review date

Important fields:

- id
- employee_id
- leave_type
- start_date
- end_date
- number_of_days
- reason
- status
- manager_comment
- reviewed_by
- reviewed_at

### attendance_logs

Stores:

- Employee work date
- Time In
- Time Out
- Attendance status
- Employee notes

Important fields:

- id
- employee_id
- work_date
- time_in
- time_out
- status
- notes

## User Roles

The application will support these roles:

### Employee

An employee can:

- Sign in and sign out.
- View their VL and SL balances.
- Submit a leave request.
- View their leave request status.
- View approved leave on the calendar.
- Record Time In and Time Out.
- View their own attendance records.

### Manager

A manager can:

- Sign in and sign out.
- View leave requests from assigned employees.
- Approve or reject pending leave requests.
- Add comments when reviewing a request.
- View approved team leave on the calendar.
- View team attendance information.

### Administrator

An administrator can:

- Manage employee profiles.
- Assign employees to managers.
- Update employee roles.
- Review leave and attendance information.

Administrative features are lower priority for the initial prototype.

## Build Order

Build and test one feature at a time in this order:

1. Authentication and automatic profile creation
2. Employee dashboard
3. Leave request form
4. Manager approval workflow
5. Leave balance deduction
6. Approved leave calendar
7. Time In and Time Out
8. Testing and presentation preparation

Do not build all features at once.

## Business Rules

1. Employees can access only their own profile, leave requests, and attendance records.
2. Managers can review requests only for employees assigned to them.
3. Only pending leave requests can be approved or rejected.
4. Approved VL requests deduct from the employee's VL balance.
5. Approved SL requests deduct from the employee's SL balance.
6. A leave request cannot be approved if the employee has insufficient balance.
7. Rejected requests must not change the employee's leave balance.
8. Leave balance must be deducted only once for each approved request.
9. The leave end date cannot be earlier than the start date.
10. Time Out cannot be earlier than Time In.
11. An employee should have a maximum of one attendance record per work date.
12. Only approved leave should appear on the calendar.
13. The prototype must use fake employee information only.

## Initial MVP Demonstration

The final demonstration should show this sequence:

1. A fake employee signs in.
2. The employee sees their VL and SL balances.
3. The employee submits a VL or SL request.
4. A fake manager signs in.
5. The manager approves the request.
6. The correct leave balance is deducted.
7. The approved leave appears on the calendar.
8. The employee records Time In.
9. The employee records Time Out.

## Security Requirements

- Keep Row Level Security enabled on all Supabase tables.
- Do not expose the Supabase service role key.
- Do not commit .env.local to GitHub.
- Use the Supabase publishable key in the Next.js environment file.
- Validate user identity and role before allowing database changes.
- Use fake data only during development and demonstration.

## Git and Testing Requirements

For every completed feature:

1. Run the application locally.
2. Test the feature using fake data.
3. Check for browser and terminal errors.
4. Commit the completed feature separately.
5. Push the commit to GitHub.

Use clear commit messages, for example:

- Add authentication and profile creation
- Add employee leave request form
- Add manager approval workflow
- Add transactional balance deduction
- Add approved leave calendar
- Add time in and time out

## Instructions for GitHub Copilot

Help build this application one feature at a time.

For each feature:

1. Inspect the existing project structure first.
2. State which files will be created or modified.
3. Explain the purpose of each change.
4. Provide complete code for each created or modified file.
5. Follow the existing Next.js App Router structure.
6. Use TypeScript.
7. Use the existing Tailwind CSS configuration.
8. Use Supabase server-side authentication where appropriate.
9. Include loading, validation, empty, and error states.
10. Preserve previously completed and working functionality.
11. Do not expose secret keys.
12. Provide a manual test checklist after the code.
13. Stop after completing the requested feature.
14. Do not proceed to the next feature without confirmation.

## First Development Task

Start with authentication and automatic profile creation only.

The expected result is:

- A user can register using fake test details.
- A user can sign in.
- A user can sign out.
- A corresponding profile record is created for the authenticated user.
- A signed-in user can access the dashboard.
- An unauthenticated user is redirected to the login page.

Do not build the leave request, approval, calendar, or attendance features yet.