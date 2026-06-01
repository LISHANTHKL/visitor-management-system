# Visitor Management System

## Overview

The Visitor Management System is a full-stack MERN application designed to automate and digitize the complete visitor lifecycle within an organization.

The system enables visitors to request appointments with employees, administrators to approve or reject requests, security personnel to verify visitor passes using QR codes, and organizations to maintain complete visitor logs and analytics.

The project eliminates manual visitor registers and provides a secure, scalable, and efficient visitor handling process.

---

# Project Features

## Visitor Features

### Visitor Request Portal

Visitors can:

* Submit visit requests
* Select employees from a searchable employee directory
* View employee details before booking
* Choose available visit slots
* Receive confirmation messages

### Employee Search

Visitors can search employees by:

* Employee Name
* Department
* Employee Code

### Employee Information Display

Displays:

* Employee Name
* Designation
* Department
* Cabin Number
* Office Location

### Slot Availability

The system prevents:

* Double bookings
* Overlapping appointments
* Multiple visitors for the same employee during the same slot

### Visitor Guidelines

Displays:

* Office Timings
* Visit Duration
* Security Verification Requirements
* QR Pass Requirements
* Waiting Policies

---

# Administrator Features

## User Management

Admin can:

* Create Users
* Update Users
* Delete Users
* Manage Employee Accounts
* Manage Security Accounts

### Employee Information

Each employee contains:

* Name
* Email
* Designation
* Department
* Employee Code
* Cabin Number
* Office Location

---

## Visitor Approval Workflow

Admin can:

* View Pending Requests
* Approve Requests
* Reject Requests
* Provide Rejection Reasons

### Visitor Information

Admin can view:

* Visitor Name
* Email
* Phone Number
* Purpose
* Visit Date
* Visit Time

### Employee Information

Admin can view:

* Employee Name
* Department
* Designation
* Cabin Number

---

## Dashboard

Admin dashboard provides:

* Today's Visitors
* Pending Requests
* Approved Requests
* Checked-In Visitors
* Checked-Out Visitors
* Employee Availability Status

---

# Employee Features

Employees can:

* View Visitor Requests
* View Approved Visitors
* View Upcoming Visitors
* View Current Visitors
* Monitor Occupancy Status

Employees cannot:

* Approve Requests
* Reject Requests
* Delete Requests

---

# Security Features

## QR Verification

Security personnel can:

### Scan QR Codes

Using webcam access.

### Upload QR Images

Upload QR code images for verification.

### Verify Visitor Passes

Validate:

* QR Authenticity
* Visitor Approval Status
* Visit Date
* QR Expiry

---

## Check-In System

Security can:

* Check-In Visitors
* Record Entry Time
* Store Security User Information

---

## Check-Out System

Security can:

* Check-Out Visitors
* Record Exit Time
* Calculate Visit Duration

---

# Email Notification System

Automated emails are sent during:

## Request Submission

Visitor receives:

* Request Confirmation

## Request Approval

Visitor receives:

* Approval Email
* QR Visitor Pass
* Employee Details
* Visit Details

## Request Rejection

Visitor receives:

* Rejection Notification
* Rejection Reason

## Check-In

Visitor receives:

* Check-In Confirmation

## Check-Out

Visitor receives:

* Check-Out Confirmation

---

# QR Code System

## QR Generation

QR Codes are generated when:

* Visitor Request is Approved

### QR Data

Contains:

* Visit ID
* Visitor Information
* Employee Information
* Visit Date
* Visit Time
* QR Token

---

## Visitor Pass

Displays:

* Visitor Name
* Employee Name
* Department
* Cabin Number
* Visit Date
* Visit Time
* QR Code

---

# Employee Availability Engine

The system automatically manages employee status.

## Available

Employee is free.

## Occupied

Employee currently has a checked-in visitor.

### Automatic Status Updates

Check-In:

Employee → Occupied

Check-Out:

Employee → Available

---

# Visitor Logs

Stores:

* Visitor Name
* Email
* Phone
* Employee
* Department
* Purpose
* Check-In Time
* Check-Out Time
* Visit Duration
* Visit Status

---

# Audit Logs

Tracks:

* Approved By
* Rejected By
* Checked-In By
* Checked-Out By
* Timestamp

---

# Analytics Dashboard

Provides:

## Visitor Analytics

* Daily Visitors
* Weekly Visitors
* Monthly Visitors

## Employee Analytics

* Most Visited Employees
* Employee Utilization

## Department Analytics

* Visitors By Department

## Visit Duration Analytics

* Average Visit Duration

---

# Technology Stack

## Frontend

* React.js
* Vite
* Redux Toolkit
* React Router
* Axios
* Material UI

## Backend

* Node.js
* Express.js

## Database

* MongoDB Atlas
* Mongoose

## Authentication

* JWT Authentication

## Notifications

* Nodemailer
* Gmail SMTP

## QR System

* QR Code Generation
* QR Code Verification

## Real-Time Features

* Socket.IO

## Version Control

* Git
* GitHub

---

# Project Structure

```text
visitor-management-system/

├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   │
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── store/
│   │   ├── hooks/
│   │   └── routes/
│   │
│   └── package.json
│
└── README.md
```

---

# Database Collections

```text
users

visitor_requests

visit_logs

employee_status

audit_logs
```

---

# Installation

## Clone Repository

```bash
git clone <repository-url>
cd visitor-management-system
```

---

# Backend Setup

```bash
cd backend
npm install
```

Create:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password

EMAIL_FROM=Visitor Management System
EMAIL_ENABLED=true
```

Run:

```bash
npm run dev
```

---

# Frontend Setup

```bash
cd frontend
npm install
```

Create:

```env
VITE_API_URL=http://localhost:5000/api
```

Run:

```bash
npm run dev
```

---

# Default Roles

## Administrator

Can:

* Manage Users
* Approve Visitors
* Reject Visitors
* View Analytics

## Employee

Can:

* View Visitors
* View Appointments

## Security

Can:

* Verify QR
* Check-In Visitors
* Check-Out Visitors

---

# Security Measures

* JWT Authentication
* Role-Based Authorization
* Protected Routes
* QR Validation
* Secure Email Notifications
* Audit Logging
* MongoDB Atlas Cloud Security

---

# Future Enhancements

* Mobile Application
* Face Recognition
* Biometric Authentication
* AI-Based Analytics
* Calendar Integration
* Advanced Reporting
* Multi-Branch Support

---

# Author

**Lishanth K L**

M.Tech CSE – 2nd Semester

VVCE Mysore

---

# License

This project is developed for academic and educational purposes.
