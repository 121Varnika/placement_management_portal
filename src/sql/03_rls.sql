-- =========================================================
-- Placement Management Portal (PMP)
-- Migration 03: Row Level Security (RLS) Policies
-- =========================================================

-- Enable RLS across all tables
alter table public.students enable row level security;
alter table public.companies enable row level security;
alter table public.selection_rounds enable row level security;
alter table public.student_applications enable row level security;
alter table public.drive_links enable row level security;

-- Drop any legacy open policies if they exist
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

-- 1. STUDENTS: Full CRUD for authenticated mentors only
create policy "Authenticated users have full access to students"
    on public.students for all
    to authenticated
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');

-- 2. COMPANIES: Full CRUD for authenticated mentors only
create policy "Authenticated users have full access to companies"
    on public.companies for all
    to authenticated
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');

-- 3. SELECTION ROUNDS: Full CRUD for authenticated mentors only
create policy "Authenticated users have full access to selection_rounds"
    on public.selection_rounds for all
    to authenticated
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');

-- 4. STUDENT APPLICATIONS: Full CRUD for authenticated mentors only
create policy "Authenticated users have full access to student_applications"
    on public.student_applications for all
    to authenticated
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');

-- 5. DRIVE LINKS: Full CRUD for authenticated mentors only
create policy "Authenticated users have full access to drive_links"
    on public.drive_links for all
    to authenticated
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');
