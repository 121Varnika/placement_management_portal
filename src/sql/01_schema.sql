-- =========================================================
-- Placement Management Portal (PMP)
-- Migration 01: Core Schema & Tables
-- =========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. STUDENTS TABLE
create table if not exists public.students (
    id uuid primary key default gen_random_uuid(),
    college_id text not null unique,
    name text not null,
    department text not null,
    batch text not null,
    college_email text,
    work_personal_email text,
    phone text,
    cgpa numeric(4, 2) not null default 0.00,
    current_arrears integer not null default 0,
    arrears_history integer not null default 0,
    tenth_percentage numeric(5, 2),
    twelfth_percentage numeric(5, 2),
    github_url text,
    linkedin_url text,
    leetcode_url text,
    portfolio_url text,
    placement_status text not null default 'Not Placed' check (placement_status in ('Not Placed', 'Placed')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. COMPANIES TABLE
create table if not exists public.companies (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    salary_package text not null,
    opportunity_type text not null default 'Full-time' check (opportunity_type in ('Full-time', 'Internship', 'FTE + Internship')),
    drive_type text not null default 'On Campus' check (drive_type in ('On Campus', 'Off Campus')),
    min_tenth_percentage numeric(5, 2) not null default 60.00,
    min_twelfth_percentage numeric(5, 2) not null default 60.00,
    min_cgpa numeric(4, 2) not null default 6.00,
    current_arrears_allowed boolean not null default false,
    arrears_history_allowed boolean not null default true,
    notified_date date not null default current_date,
    status text not null default 'Notified' check (status in ('Notified', 'In Process', 'Completed')),
    working_hours text default '9:00 AM - 6:00 PM (Mon-Fri)',
    leave_policy text default '18 days Paid Leave + Standard College Holidays',
    wfh_info text default 'Hybrid (2 days remote / 3 days in-office)',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. SELECTION ROUNDS TABLE (supports drives where rounds are not specified: 0 records)
create table if not exists public.selection_rounds (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references public.companies(id) on delete cascade,
    round_number integer not null,
    round_type text not null,
    round_date date,
    details text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(company_id, round_number)
);

-- 4. STUDENT APPLICATIONS & ROUND TRACKING TABLE
create table if not exists public.student_applications (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references public.companies(id) on delete cascade,
    student_id uuid not null references public.students(id) on delete cascade,
    status text not null default 'Applied' check (status in ('Applied', 'In Process', 'Selected', 'Rejected', 'Did Not Apply')),
    current_round_id uuid references public.selection_rounds(id) on delete set null,
    outcome_round_id uuid references public.selection_rounds(id) on delete set null,
    outcome_date date,
    not_applied_reason text,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(company_id, student_id)
);

-- 5. DRIVE LINKS TABLE
create table if not exists public.drive_links (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    url text not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
