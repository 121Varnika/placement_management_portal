-- =========================================================
-- Placement Management Portal (PMP)
-- Migration 02: Performance Indexes
-- =========================================================

-- Indexes on students
create index if not exists idx_students_college_id on public.students(college_id);
create index if not exists idx_students_dept on public.students(department);
create index if not exists idx_students_status on public.students(placement_status);
create index if not exists idx_students_batch on public.students(batch);

-- Indexes on companies
create index if not exists idx_companies_status on public.companies(status);
create index if not exists idx_companies_drive_type on public.companies(drive_type);
create index if not exists idx_companies_opp_type on public.companies(opportunity_type);

-- Indexes on selection_rounds
create index if not exists idx_rounds_company on public.selection_rounds(company_id);

-- Indexes on student_applications
create index if not exists idx_apps_company on public.student_applications(company_id);
create index if not exists idx_apps_student on public.student_applications(student_id);
create index if not exists idx_apps_status on public.student_applications(status);

-- Indexes on drive_links
create index if not exists idx_drive_links_title on public.drive_links(title);
