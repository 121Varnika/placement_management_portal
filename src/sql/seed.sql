-- =========================================================
-- Placement Management Portal (PMP) - Seed Data Script
-- =========================================================

-- Clean up existing data if re-seeding
truncate table public.drive_links cascade;
truncate table public.student_applications cascade;
truncate table public.selection_rounds cascade;
truncate table public.companies cascade;
truncate table public.students cascade;

-- 1. SEED STUDENTS
insert into public.students (
    id, college_id, name, department, batch, 
    college_email, work_personal_email, phone, cgpa, 
    current_arrears, arrears_history, tenth_percentage, twelfth_percentage,
    github_url, linkedin_url, leetcode_url, portfolio_url, placement_status
) values
(
    'a1111111-1111-1111-1111-111111111101', 'E0223001', 'Aarav Sharma', 'Cybersecurity and IoT', '2023–2027',
    'aarav.sharma@college.edu', 'aarav.dev@gmail.com', '+91 98765 43210', 9.15,
    0, 0, 94.5, 91.2,
    'https://github.com/aaravsharma', 'https://linkedin.com/in/aaravsharma', 'https://leetcode.com/aaravsharma', 'https://aarav.dev', 'Placed'
),
(
    'a1111111-1111-1111-1111-111111111102', 'E0223002', 'Priya Raman', 'Cybersecurity and IoT', '2023–2027',
    'priya.raman@college.edu', 'priyaraman.work@outlook.com', '+91 98765 43211', 8.85,
    0, 0, 96.0, 93.4,
    'https://github.com/priyaraman', 'https://linkedin.com/in/priyaraman', 'https://leetcode.com/priyaraman', 'https://priya.portfolio.site', 'Not Placed'
),
(
    'a1111111-1111-1111-1111-111111111103', 'E0223003', 'Rohan Verma', 'Cybersecurity and IoT', '2023–2027',
    'rohan.v@college.edu', 'rohanverma.code@gmail.com', '+91 98765 43212', 7.92,
    0, 1, 88.0, 84.6,
    'https://github.com/rohanverma', 'https://linkedin.com/in/rohanverma', 'https://leetcode.com/rohanverma', '', 'Not Placed'
),
(
    'a1111111-1111-1111-1111-111111111104', 'E0223004', 'Ananya Iyer', 'Cybersecurity and IoT', '2023–2027',
    'ananya.i@college.edu', 'ananya.iyer99@gmail.com', '+91 98765 43213', 8.40,
    0, 0, 91.5, 87.8,
    'https://github.com/ananyaiyer', 'https://linkedin.com/in/ananyaiyer', 'https://leetcode.com/ananyaiyer', 'https://ananya.me', 'Placed'
),
(
    'a1111111-1111-1111-1111-111111111105', 'E0223005', 'Karthik Raja', 'Cybersecurity and IoT', '2023–2027',
    'karthik.r@college.edu', 'karthik.raja22@gmail.com', '+91 98765 43214', 6.85,
    1, 2, 79.0, 74.5,
    'https://github.com/karthikraja', 'https://linkedin.com/in/karthikraja', '', '', 'Not Placed'
),
(
    'a1111111-1111-1111-1111-111111111106', 'E0223006', 'Sneha Kulkarni', 'Cybersecurity and IoT', '2023–2027',
    'sneha.k@college.edu', 'sneha.ml@gmail.com', '+91 98765 43215', 9.35,
    0, 0, 98.2, 95.0,
    'https://github.com/snehakulkarni', 'https://linkedin.com/in/snehakulkarni', 'https://leetcode.com/snehakulkarni', 'https://sneha.ai', 'Placed'
);

-- 2. SEED COMPANIES
insert into public.companies (
    id, name, description, salary_package, opportunity_type, 
    notified_date, status, working_hours, leave_policy, wfh_info
) values
(
    'c1111111-1111-1111-1111-111111111101', 'Google Cloud',
    'Software Engineer (L3) campus hire for core cloud infrastructure and developer productivity tools.',
    '32 LPA', 'Full-time',
    '2026-08-15', 'Completed',
    '9:30 AM - 5:30 PM (Mon-Fri)', '24 days paid vacation + 12 wellness days', 'Hybrid (3 days office, 2 days remote)'
),
(
    'c1111111-1111-1111-1111-111111111102', 'Microsoft',
    'Software Development Engineer (SDE) role across Azure, Teams and Windows Core engineering.',
    '28.5 LPA', 'FTE + Internship',
    '2026-08-20', 'In Process',
    '9:00 AM - 6:00 PM (Flexible)', '20 days earned leave + 10 sick leaves', 'Hybrid (up to 50% work from home)'
),
(
    'c1111111-1111-1111-1111-111111111103', 'Zoho Corporation',
    'Member Technical Staff (MTS) for Zoho CRM, Cliq, and distributed cloud applications.',
    '9.5 LPA', 'Full-time',
    '2026-09-01', 'In Process',
    '8:30 AM - 5:30 PM (Mon-Fri)', '18 days annual leave + medical allowance', 'On-site campus (Tenkasi / Chennai)'
),
(
    'c1111111-1111-1111-1111-111111111104', 'TCS Digital',
    'Systems Engineer Digital role focusing on Full Stack Java, Cloud native, and AI solutions.',
    '7.5 LPA', 'Full-time',
    '2026-09-05', 'Notified',
    '9:00 AM - 6:00 PM (Mon-Fri)', '16 days privileged leave + 8 casual leaves', 'Client dependent / Hybrid'
);

-- 3. SEED SELECTION ROUNDS
-- Rounds for Google Cloud
insert into public.selection_rounds (id, company_id, round_number, round_type, round_date, details) values
('r1111111-1111-1111-1111-111111111101', 'c1111111-1111-1111-1111-111111111101', 1, 'Online Assessment', '2026-08-22', 'Google Online Challenge - 2 DSA algorithms, 60 mins on HackerEarth.'),
('r1111111-1111-1111-1111-111111111102', 'c1111111-1111-1111-1111-111111111101', 2, 'Technical Round 1', '2026-08-27', 'Data structures, Algorithms, Trees & Graphs (Google Meet).'),
('r1111111-1111-1111-1111-111111111103', 'c1111111-1111-1111-1111-111111111101', 3, 'Technical Round 2', '2026-08-28', 'System Design, Concurrency, and OS internals.'),
('r1111111-1111-1111-1111-111111111104', 'c1111111-1111-1111-1111-111111111101', 4, 'Googliness & Leadership', '2026-08-30', 'Behavioral, team collaboration, and ethical decision making.');

-- Rounds for Microsoft
insert into public.selection_rounds (id, company_id, round_number, round_type, round_date, details) values
('r1111111-1111-1111-1111-111111111105', 'c1111111-1111-1111-1111-111111111102', 1, 'Online Coding Round', '2026-08-29', 'Codility test - 3 programming problems, 90 mins.'),
('r1111111-1111-1111-1111-111111111106', 'c1111111-1111-1111-1111-111111111102', 2, 'Technical Interview 1', '2026-09-10', 'Live coding, Data Structures, Space/Time complexity.'),
('r1111111-1111-1111-1111-111111111107', 'c1111111-1111-1111-1111-111111111102', 3, 'AA (As Appropriate) / Manager Round', '2026-09-14', 'System architecture, past projects deep dive, culture fit.');

-- Rounds for Zoho
insert into public.selection_rounds (id, company_id, round_number, round_type, round_date, details) values
('r1111111-1111-1111-1111-111111111108', 'c1111111-1111-1111-1111-111111111103', 1, 'Written Aptitude & C/C++ Test', '2026-09-08', 'Aptitude, basic math puzzles, and C dry-run logic, 90 mins.'),
('r1111111-1111-1111-1111-111111111109', 'c1111111-1111-1111-1111-111111111103', 2, 'Basic Programming Round', '2026-09-12', '5 problem solving scenarios in C/Java/Python.'),
('r1111111-1111-1111-1111-111111111110', 'c1111111-1111-1111-1111-111111111103', 3, 'Advanced Programming / Design', '2026-09-15', 'Application prototype design (Railway reservation / Snake game logic).'),
('r1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111103', 4, 'HR Interview', '2026-09-16', 'General evaluation, willingness to relocate to Tenkasi/Chennai.');

-- Rounds for TCS Digital
insert into public.selection_rounds (id, company_id, round_number, round_type, round_date, details) values
('r1111111-1111-1111-1111-111111111112', 'c1111111-1111-1111-1111-111111111104', 1, 'National Qualifier Test (NQT)', '2026-09-22', 'Cognitive skills and Advanced Coding section on TCS iON platform.'),
('r1111111-1111-1111-1111-111111111113', 'c1111111-1111-1111-1111-111111111104', 2, 'Technical & HR Combined Interview', '2026-09-28', 'Evaluation of full stack projects, CS fundamentals, and HR verification.');

-- 4. SEED APPLICATIONS & STATUS
-- Applications for Google Cloud (Completed drive)
insert into public.student_applications (id, company_id, student_id, status, current_round_id, outcome_round_id, outcome_date, not_applied_reason, notes) values
(
    'app-11111111-0001', 'c1111111-1111-1111-1111-111111111101', 'a1111111-1111-1111-1111-111111111101',
    'Selected', 'r1111111-1111-1111-1111-111111111104', 'r1111111-1111-1111-1111-111111111104', '2026-08-31', null,
    'Offered SWE L3. Outstanding performance in Graph and Concurrency rounds.'
),
(
    'app-11111111-0002', 'c1111111-1111-1111-1111-111111111101', 'a1111111-1111-1111-1111-111111111102',
    'Rejected', 'r1111111-1111-1111-1111-111111111102', 'r1111111-1111-1111-1111-111111111102', '2026-08-28', null,
    'Cleared OA with top score; narrowly missed edge cases in Dynamic Programming in Technical Round 1.'
),
(
    'app-11111111-0003', 'c1111111-1111-1111-1111-111111111101', 'a1111111-1111-1111-1111-111111111105',
    'Did Not Apply', null, null, null, 'CGPA criteria was min 7.5; student has standing arrears.',
    'Ineligible as per company criteria'
);

-- Applications for Microsoft (In Process)
insert into public.student_applications (id, company_id, student_id, status, current_round_id, outcome_round_id, outcome_date, not_applied_reason, notes) values
(
    'app-11111111-0004', 'c1111111-1111-1111-1111-111111111102', 'a1111111-1111-1111-1111-111111111102',
    'In Process', 'r1111111-1111-1111-1111-111111111106', null, null, null,
    'Cleared Codility with 100% score. Scheduled for Technical Interview 1 on Sept 10.'
),
(
    'app-11111111-0005', 'c1111111-1111-1111-1111-111111111102', 'a1111111-1111-1111-1111-111111111103',
    'In Process', 'r1111111-1111-1111-1111-111111111106', null, null, null,
    'Passed Round 1 OA. Prepped on Trees and System architecture.'
),
(
    'app-11111111-0006', 'c1111111-1111-1111-1111-111111111102', 'a1111111-1111-1111-1111-111111111101',
    'Did Not Apply', null, null, null, 'Already selected in Google Cloud with 32 LPA; opted out to give peer opportunity.',
    'Voluntary opt-out under Single Placement Offer policy.'
);

-- Applications for Zoho (In Process)
insert into public.student_applications (id, company_id, student_id, status, current_round_id, outcome_round_id, outcome_date, not_applied_reason, notes) values
(
    'app-11111111-0007', 'c1111111-1111-1111-1111-111111111103', 'a1111111-1111-1111-1111-111111111104',
    'Selected', 'r1111111-1111-1111-1111-111111111111', 'r1111111-1111-1111-1111-111111111111', '2026-09-06', null,
    'Exceptional performance in Advanced Programming round. Offered MTS role.'
),
(
    'app-11111111-0008', 'c1111111-1111-1111-1111-111111111103', 'a1111111-1111-1111-1111-111111111105',
    'In Process', 'r1111111-1111-1111-1111-111111111108', null, null, null,
    'Applied for Round 1 Written Aptitude test.'
),
(
    'app-11111111-0009', 'c1111111-1111-1111-1111-111111111103', 'a1111111-1111-1111-1111-111111111106',
    'Did Not Apply', null, null, null, 'Targeting research-heavy AI / ML Labs exclusively.',
    'Opted out of general software roles.'
);

-- 5. SEED DRIVE LINKS
insert into public.drive_links (id, title, url, description) values
(
    'd1111111-1111-1111-1111-111111111101',
    'Student Resumes',
    'https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ-resumes',
    'Central Google Drive folder containing verified student resumes for the 2023–2027 batch.'
),
(
    'd1111111-1111-1111-1111-111111111102',
    'Placement Documents',
    'https://drive.google.com/drive/folders/2bCdEfGhIjKlMnOpQrStUvWxYz-placement',
    'Placement policy handbook, student NOC consent forms, and drive eligibility criteria.'
),
(
    'd1111111-1111-1111-1111-111111111103',
    'Company Documents',
    'https://drive.google.com/drive/folders/3cDeFgHiJkLmNoPqRsTuVwXyZa-companies',
    'Recruiting company Job Descriptions (JDs), campus brochures, test links, and coordinator contacts.'
),
(
    'd1111111-1111-1111-1111-111111111104',
    'Internship Documents',
    'https://drive.google.com/drive/folders/4dEfGhIjKlMnOpQrStUvWxYzAb-internships',
    'Summer and winter internship completion certificates, offer letters, and mentor assessment rubrics.'
);
