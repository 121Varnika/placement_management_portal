# Placement Management Portal (PMP) — Production Setup Guide

This guide provides step-by-step instructions to configure, run, and deploy the Placement Management Portal with a fresh **Supabase** backend and eventual **Vercel** hosting.

---

## Architecture Overview

```
[ React 19 Frontend (Vite) ]
          │
          ▼  (Authenticated Sessions)
[ Supabase Auth (Email / Password) ]
          │
          ▼  (Protected by Row Level Security)
[ PostgreSQL Database (Supabase) ]
  ├── students
  ├── companies
  ├── selection_rounds
  ├── student_applications
  └── drive_links
```

- **Zero LocalStorage Fallback**: All primary placement data is stored directly in Supabase.
- **Strict Row Level Security (RLS)**: Anonymous/unauthenticated visitors cannot read or modify any records.
- **Restricted Access**: Public account registration is disabled. Mentors are provisioned directly in the Supabase Dashboard.

---

## A. Prerequisites

Ensure your development environment has:
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later
- A free or pro account on [Supabase](https://supabase.com)
- A free account on [Vercel](https://vercel.com) (for production deployment)

---

## B. Install Dependencies

Open a terminal in the frontend directory and install the required packages:

```bash
cd s:/Projects/pmp/frontend
npm install
```

---

## C. Create a Supabase Project

1. Log in to [Supabase Console](https://supabase.com/dashboard).
2. Click **"New Project"**.
3. Fill in the project details:
   - **Name**: `pmp-portal` (or your preferred name)
   - **Database Password**: Generate and securely save a strong password.
   - **Region**: Choose the region closest to your college/users (e.g. `ap-south-1` for India).
4. Click **"Create new project"** and wait ~2 minutes for provisioning to complete.

---

## D. Configure Database (SQL Migrations)

Navigate to the **SQL Editor** tab in your Supabase Dashboard.

### Migration Order

You can either execute the **consolidated setup script** or run the **individual migrations** in the following exact sequence:

#### Option 1: Consolidated Single Script (Recommended)
Open and run [`src/sql/schema.sql`](file:///s:/Projects/pmp/frontend/src/sql/schema.sql) in the Supabase SQL Editor. This script executes all schemas, indexes, and RLS policies in one go.

#### Option 2: Step-by-Step Migrations
Execute the SQL files located in [`src/sql/`](file:///s:/Projects/pmp/frontend/src/sql/) in this exact sequence:

1. **`01_schema.sql`**: Enables UUID extensions and creates tables (`students`, `companies`, `selection_rounds`, `student_applications`, `drive_links`) with foreign keys, checks, and defaults.
2. **`02_indexes.sql`**: Creates B-tree indexes for fast lookups on college IDs, departments, statuses, and foreign keys.
3. **`03_rls.sql`**: Enables Row Level Security on all 5 tables and applies strict policies restricting access exclusively to authenticated users (`auth.role() = 'authenticated'`).
4. **`04_seed.sql`** *(Optional)*: Seeds realistic starter data for Cybersecurity & IoT students, recruitment drives, rounds, and drive links.

---

## E. Configure Supabase Authentication

### 1. Enable Email / Password Provider
1. Go to **Authentication** -> **Providers** in the Supabase Dashboard.
2. Select **Email**.
3. Ensure **Enable Email provider** is toggled **ON**.
4. Disable **"Confirm email"** for development/testing if you want accounts to work immediately without email verification (or leave it enabled if you plan to verify via inbox).

### 2. Disable Public Sign-ups
1. Go to **Authentication** -> **Settings** -> **User Signups**.
2. Toggle **"Enable email signups"** to **OFF** (or uncheck "Allow new users to sign up").
3. *This guarantees that random visitors cannot self-register accounts.*

### 3. Create the Authorized Mentor User
1. Go to **Authentication** -> **Users**.
2. Click **"Add User"** -> **"Create user"**.
3. Enter:
   - **Email**: `mentor@college.edu` (or your email)
   - **Password**: Create a secure password (at least 6 characters)
   - Toggle **"Auto Confirm User?"** to **ON**
4. Click **"Create user"**.

---

## F. Configure Local Environment Variables

1. In the `s:/Projects/pmp/frontend/` directory, create a `.env.local` file:

```bash
cp .env.example .env.local
```

2. Retrieve your project credentials:
   - In Supabase Dashboard, go to **Settings** (gear icon) -> **API**.
   - Copy the **Project URL** (e.g. `https://xyzprojectref.supabase.co`).
   - Copy the **Project API Keys** -> `anon` / `public` key.

3. Edit `.env.local` with your exact values:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh......your-anon-key-here
```

> [!CAUTION]
> Never put the `service_role` (secret) key in `.env.local` or anywhere in the frontend. Only use the public `anon` key.

---

## G. Run Locally

Start the Vite development server:

```bash
npm run dev
```

The portal will be available at `http://localhost:5173/` (or `http://localhost:5174/`).

---

## H. Verify Authentication & Data Flow

1. Open `http://localhost:5173/` in your browser.
2. **Unauthenticated View**: You will immediately see the **Placement Management Portal Sign In** screen. Notice that there is no sign-up or register button.
3. **Invalid Password Test**: Enter an incorrect password and click Sign In -> verify the red error alert appears.
4. **Successful Sign In**: Enter the mentor email and password you created in Step E -> verify you are redirected into the Placement Portal dashboard.
5. **Session Persistence**: Refresh the browser page -> verify your session persists without needing to log in again.
6. **Sign Out**: Click the **Sign Out** button in the bottom-left sidebar card -> confirm you are securely logged out and returned to the Sign In screen.

---

## I. Production Build Verification

Verify that the production bundle compiles with zero errors:

```bash
npm run build
```

This generates the static distribution bundle in `dist/`.

---

## J. Vercel Deployment Guide

When you are ready to deploy the application to Vercel:

### 1. Push Repository to Git
Ensure your codebase is pushed to your GitHub/GitLab/Bitbucket repository.

### 2. Import Project into Vercel
1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** -> **"Project"**.
3. Select your Git repository.
4. Framework Preset: **Vite**
5. Root Directory: `frontend` (if inside a monorepo, or `./` if root).
6. Build Command: `npm run build`
7. Output Directory: `dist`

### 3. Set Environment Variables in Vercel
Before clicking Deploy, expand the **Environment Variables** section and add:
- `VITE_SUPABASE_URL`: Your Supabase Project URL (`https://xyz.supabase.co`)
- `VITE_SUPABASE_ANON_KEY`: Your Supabase `anon` / public key

Select **Production**, **Preview**, and **Development** environments.

### 4. Deploy
Click **"Deploy"**. Vercel will build and assign a production URL (e.g. `https://pmp-portal.vercel.app`).

### 5. Update Supabase Auth Redirect URLs
Once deployed:
1. Copy your live Vercel domain (e.g., `https://pmp-portal.vercel.app`).
2. In Supabase Dashboard, navigate to **Authentication** -> **URL Configuration**.
3. Set **Site URL**: `https://pmp-portal.vercel.app`
4. Under **Redirect URLs**, add:
   - `https://pmp-portal.vercel.app/**`
   - `http://localhost:5173/**` (for local development)
5. Click **Save**.

The [`vercel.json`](file:///s:/Projects/pmp/frontend/vercel.json) file included in the repository automatically handles single-page application routing so refreshing any URL or modal works smoothly in production.
