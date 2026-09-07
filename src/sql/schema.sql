-- =========================================================
-- Placement Management Portal (PMP)
-- Complete Production Database Setup (Schema, Indexes, RLS, Seed)
-- =========================================================

-- Step 1: Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Step 2: Tables
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

-- 3. SELECTION ROUNDS TABLE
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

-- Step 3: Indexes
create index if not exists idx_students_college_id on public.students(college_id);
create index if not exists idx_students_dept on public.students(department);
create index if not exists idx_students_status on public.students(placement_status);
create index if not exists idx_students_batch on public.students(batch);

create index if not exists idx_companies_status on public.companies(status);
create index if not exists idx_companies_drive_type on public.companies(drive_type);
create index if not exists idx_companies_opp_type on public.companies(opportunity_type);

create index if not exists idx_rounds_company on public.selection_rounds(company_id);

create index if not exists idx_apps_company on public.student_applications(company_id);
create index if not exists idx_apps_student on public.student_applications(student_id);
create index if not exists idx_apps_status on public.student_applications(status);

create index if not exists idx_drive_links_title on public.drive_links(title);

-- Step 4: Row Level Security (RLS)
alter table public.students enable row level security;
alter table public.companies enable row level security;
alter table public.selection_rounds enable row level security;
alter table public.student_applications enable row level security;
alter table public.drive_links enable row level security;

-- Drop any legacy open policies
drop policy if exists "Allow all actions on students" on public.students;
drop policy if exists "Allow all actions on companies" on public.companies;
drop policy if exists "Allow all actions on selection_rounds" on public.selection_rounds;
drop policy if exists "Allow all actions on student_applications" on public.student_applications;
drop policy if exists "Allow all actions on drive_links" on public.drive_links;

drop policy if exists "Authenticated users have full access to students" on public.students;
drop policy if exists "Authenticated users have full access to companies" on public.companies;
drop policy if exists "Authenticated users have full access to selection_rounds" on public.selection_rounds;
drop policy if exists "Authenticated users have full access to student_applications" on public.student_applications;
drop policy if exists "Authenticated users have full access to drive_links" on public.drive_links;

-- Secure policies for authenticated mentors only
create policy "Authenticated users have full access to students"
    on public.students for all
    to authenticated
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');

create policy "Authenticated users have full access to companies"
    on public.companies for all
    to authenticated
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');

create policy "Authenticated users have full access to selection_rounds"
    on public.selection_rounds for all
    to authenticated
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');

create policy "Authenticated users have full access to student_applications"
    on public.student_applications for all
    to authenticated
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');

create policy "Authenticated users have full access to drive_links"
    on public.drive_links for all
    to authenticated
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');
