# Placement Management Portal (PMP)

A production-ready placement management portal built to streamline campus recruitment drives, student eligibility tracking, multi-round interview pipelines, and placement statistics for educational institutions.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [System Architecture & How It Works](#system-architecture--how-it-works)
- [Key Features](#key-features)
- [Prerequisites](#prerequisites)
- [Step-by-Step Setup Guide](#step-by-step-setup-guide)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Configure Supabase Backend](#3-configure-supabase-backend)
  - [4. Set Up Environment Variables](#4-set-up-environment-variables)
  - [5. Run the Application](#5-run-the-application)
- [Available Scripts](#available-scripts)
- [Database Schema Reference](#database-schema-reference)
- [Deployment (Vercel)](#deployment-vercel)
- [Future Contributions & Roadmap](#future-contributions--roadmap)
- [Contributing Guidelines](#contributing-guidelines)
- [License](#license)

---

## Overview

The **Placement Management Portal (PMP)** replaces fragmented spreadsheets and manual tracking with a centralized, secure web dashboard. Training and Placement Officers (TPOs) and department mentors can manage company recruitment schedules, track student eligibility and progress through multiple interview rounds, import/export student batches via CSV, and visualize real-time placement statistics.

---

## Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend Framework** | React 19 (`react`, `react-dom`) | Declarative component-based UI |
| **Build Tool & Bundler** | Vite 8 | Fast hot module replacement (HMR) and optimized builds |
| **Backend & Database** | Supabase (PostgreSQL 15+) | Managed database, REST API, Row Level Security (RLS) |
| **Authentication** | Supabase Auth | Secure session tokens with email & password authentication |
| **Icons** | Lucide React | Clean, modern UI iconography |
| **Styling** | Modern Vanilla CSS | Custom design system with glassmorphic cards and responsive layouts |
| **Deployment** | Vercel | Single-Page Application (SPA) hosting with edge routing |

---

## System Architecture & How It Works

```
┌─────────────────────────────────────────────────────────┐
│              React 19 Frontend (Vite)                   │
│  (Dashboard | Companies | Students | Calendar | Links)  │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼ (Authenticated Session Tokens)
┌─────────────────────────────────────────────────────────┐
│                     Supabase Auth                       │
│  - Email / Password Login                               │
│  - Public Sign-ups Disabled (Admin-Provisioned Mentors) │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼ (Protected by Row Level Security)
┌─────────────────────────────────────────────────────────┐
│              PostgreSQL Database (Supabase)             │
│  ├── students             (Profiles, CGPA, Arrears)     │
│  ├── companies            (Drives, CTC, Criteria)       │
│  ├── selection_rounds     (Aptitude, Tech, HR rounds)   │
│  ├── student_applications (Pipeline status per student) │
│  └── drive_links          (Notices, JD links, Folders)  │
└─────────────────────────────────────────────────────────┘
```

### Workflow
1. **Authentication Gate**: Only authorized faculty/mentors with Supabase credentials can access the system. Public user registration is disabled to safeguard student records.
2. **Row Level Security (RLS)**: PostgreSQL tables enforce `auth.role() = 'authenticated'` policies, rejecting unauthenticated read or write queries at the database engine level.
3. **Company & Drive Pipeline**: When a company is added with eligibility criteria (minimum CGPA, 10th/12th percentages, allowed arrears), mentors can schedule interview rounds and move students through round statuses (`Applied` -> `In Process` -> `Selected` / `Rejected`).
4. **Student Lifecycle**: Student records reflect real-time placement status (`Placed` vs `Not Placed`), department statistics, and links to GitHub, LinkedIn, and LeetCode profiles.

---

## Key Features

- **Centralized Dashboard**: Live counters for registered students, participating companies, ongoing drives, overall placement rate, and department-wise placement distributions.
- **Company & Round Tracking**: Add visiting companies, compensation details (CTC), drive types (On/Off Campus), and customize interview rounds (Aptitude, Technical, GD, HR).
- **Student Directory**: Filter and search students by department, placement status, CGPA, or arrears count. View individual student portfolios and social links.
- **Bulk CSV Import**: Import entire student batches from CSV files with automatic header mapping and data validation.
- **Placement Calendar**: Monthly visual calendar displaying drive dates, interview rounds, and registration deadlines.
- **Drive Links Hub**: Shared repository for official job descriptions, Google Drive links, and college circulars.

---

## Prerequisites

Before starting, ensure you have installed:
- **Node.js**: v18.0.0 or higher (v20+ recommended) — [Download Node.js](https://nodejs.org/)
- **npm**: v9.0.0 or higher (packaged with Node.js)
- **Git**: [Download Git](https://git-scm.com/)
- A free account on [Supabase](https://supabase.com)

Check your installed versions:
```bash
node -v
npm -v
git --version
```

---

## Step-by-Step Setup Guide

### 1. Clone the Repository

Clone the project repository to your local machine and switch into the project directory:

```bash
git clone https://github.com/naveen-sekhar/placement-management-portal.git
cd placement-management-portal
```

### 2. Install Dependencies

Install the required npm packages:

```bash
npm install
```

---

### 3. Configure Supabase Backend

#### Step 3.1: Create a Supabase Project
1. Go to [Supabase Console](https://supabase.com/dashboard) and log in.
2. Click **New Project**.
3. Set your project name (e.g., `pmp-portal`), choose a database password, and select your nearest geographic region.
4. Click **Create new project** and allow ~2 minutes for initialization.

#### Step 3.2: Run Database Migrations
1. In the Supabase Dashboard, open the **SQL Editor** from the left navigation bar.
2. Click **New query**.
3. Open the [`src/sql/schema.sql`](src/sql/schema.sql) file from this repository, copy the full contents, paste it into the SQL Editor, and click **Run**.
4. *(Optional)* To seed initial demo data (students, companies, and rounds), open [`src/sql/04_seed.sql`](src/sql/04_seed.sql), paste it into a new query, and click **Run**.

#### Step 3.3: Configure Supabase Authentication
1. Navigate to **Authentication** > **Providers** > **Email**.
2. Verify **Enable Email provider** is turned **ON**.
3. Under **Authentication** > **Settings** (or User Signups), toggle **Enable email signups** to **OFF** (this prevents random public registrations).
4. Go to **Authentication** > **Users** > click **Add user** > **Create user**:
   - **Email**: Enter your mentor email (e.g., `mentor@college.edu`)
   - **Password**: Set a strong password
   - **Auto Confirm User**: Toggle **ON**
   - Click **Create user**

---

### 4. Set Up Environment Variables

Create a `.env.local` file in the project root directory by copying the sample configuration:

**On Linux / macOS:**
```bash
cp .env.example .env.local
```

**On Windows (PowerShell):**
```powershell
Copy-Item .env.example .env.local
```

**On Windows (Command Prompt):**
```cmd
copy .env.example .env.local
```

Open `.env.local` and replace the placeholder values with your Supabase credentials:

```env
# Supabase Production Configuration
# Found under: Supabase Dashboard -> Project Settings -> API
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-publishable-key
```

> **Security Note:** Only use the public `anon` key in frontend environment variables. Never expose the `service_role` secret key.

---

### 5. Run the Application

Start the local Vite development server:

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:5173
```

Log in using the mentor credentials created in Step 3.3.

---

## Available Scripts

In the project root, you can execute:

| Command | Action |
|---|---|
| `npm run dev` | Starts the Vite development server with Hot Module Replacement |
| `npm run build` | Compiles the production-ready static assets into the `dist/` folder |
| `npm run preview` | Locally serves the production build from `dist/` for verification |
| `npm run lint` | Runs ESLint to check for syntax issues and code quality rules |

---

## Database Schema Reference

The portal relies on 5 primary PostgreSQL tables with relational foreign keys:

| Table | Purpose | Key Columns |
|---|---|---|
| `students` | Student academic & contact registry | `college_id`, `name`, `department`, `batch`, `cgpa`, `current_arrears`, `placement_status` |
| `companies` | Visiting recruiters & drive details | `name`, `salary_package`, `opportunity_type`, `drive_type`, `min_cgpa`, `status` |
| `selection_rounds` | Multi-stage interview rounds per company | `company_id`, `round_number`, `round_type`, `round_date`, `details` |
| `student_applications` | Student progress through company rounds | `company_id`, `student_id`, `current_round_id`, `status` (`Applied`, `In Process`, `Selected`, `Rejected`) |
| `drive_links` | Centralized drive links & resources | `title`, `url`, `company_name`, `category` |

---

## Deployment (Vercel)

The project includes a [`vercel.json`](vercel.json) file preconfigured to handle client-side routing.

1. Push your repository to GitHub / GitLab.
2. In [Vercel Dashboard](https://vercel.com/dashboard), click **Add New Project** and select your repository.
3. Configure project settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add the **Environment Variables** in the Vercel project settings:
   - `VITE_SUPABASE_URL` = Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase `anon` public key
5. Click **Deploy**.
6. In Supabase Dashboard under **Authentication** > **URL Configuration**, add your Vercel deployment URL (e.g., `https://your-app.vercel.app/**`) to **Redirect URLs**.

---

## Future Contributions & Roadmap

Contributions are welcome! Below are identified areas for expansion and enhancements:

### 1. Student Self-Service Portal
- Introduce role-based student logins.
- Allow students to update profiles, upload resumes, view eligible drives, and directly register for upcoming interviews.

### 2. Automated Notification Engine
- Integration with SendGrid / Resend for transactional emails.
- Automated email/WhatsApp notifications for shortlisted candidates before each round.

### 3. Resume Parsing & Auto-Eligibility Engine
- Implement PDF resume upload with automated skill parsing.
- Auto-match candidate profiles with company job descriptions and criteria.

### 4. Advanced Placement Analytics & Accreditation Reports
- Export audit-ready placement reports for NAAC / NBA / NIRF institutional accreditation.
- Generate one-click downloadable PDF summaries of placed batches and salary package distributions.

### 5. Role-Based Access Control (RBAC)
- Support multiple distinct roles: `Super Admin`, `Department TPO`, `Faculty Mentor`, and `Recruiter HR`.
- Recruiter portal for external company HRs to submit round shortlists directly.

---

## Contributing Guidelines

1. **Fork the Repository**:
   Click the **Fork** button on the GitHub repository page.

2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Commit Your Changes**:
   Follow clear, descriptive commit messages:
   ```bash
   git commit -m "feat: add PDF export for student placement statistics"
   ```

4. **Push to Your Branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Submit a Pull Request**:
   Open a Pull Request against the `main` branch with a concise summary of changes, testing steps, and screenshots if UI changes were made.

---

## License

This project is maintained for campus recruitment and placement management. Distributed under the **MIT License**. Feel free to adapt and use it for your college or university.
