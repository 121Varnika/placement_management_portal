-- =========================================================
-- Placement Management Portal (PMP)
-- Migration 04: Starter / Seed Data
-- =========================================================

-- 1. SEED STUDENTS (Cybersecurity & IoT Department)
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
)
on conflict (college_id) do nothing;

-- 2. SEED COMPANIES & DRIVES
insert into public.companies (
    id, name, description, salary_package, opportunity_type, drive_type,
    min_tenth_percentage, min_twelfth_percentage, min_cgpa,
    current_arrears_allowed, arrears_history_allowed,
    notified_date, status, working_hours, leave_policy, wfh_info
) values
(
    'c1111111-1111-1111-1111-111111111101', 'Google Cloud',
    'Software Engineer (L3) campus hire for core cloud infrastructure and developer productivity tools.',
    '32 LPA', 'Full-time', 'On Campus',
    75.00, 75.00, 8.00,
    false, true,
    '2026-08-15', 'Completed',
    '9:30 AM - 5:30 PM (Mon-Fri)', '24 days paid vacation + 12 wellness days', 'Hybrid (3 days office, 2 days remote)'
),
(
    'c1111111-1111-1111-1111-111111111102', 'Microsoft',
    'Software Development Engineer (SDE) role across Azure, Teams and Windows Core engineering.',
    '28.5 LPA', 'FTE + Internship', 'On Campus',
    70.00, 70.00, 7.50,
    false, true,
    '2026-08-20', 'In Process',
    '9:00 AM - 6:00 PM (Flexible)', '20 days earned leave + 10 sick leaves', 'Hybrid (up to 50% work from home)'
),
(
    'c1111111-1111-1111-1111-111111111103', 'Zoho Corporation',
    'Member Technical Staff (MTS) for Zoho CRM, Cliq, and distributed cloud applications.',
    '9.5 LPA', 'Full-time', 'Off Campus',
    60.00, 60.00, 6.50,
    false, false,
    '2026-09-01', 'In Process',
    '8:30 AM - 5:30 PM (Mon-Fri)', '18 days annual leave + medical allowance', 'On-site campus (Tenkasi / Chennai)'
),
(
    'c1111111-1111-1111-1111-111111111104', 'TCS Digital',
    'Systems Engineer Digital role focusing on Full Stack Java, Cloud native, and AI solutions.',
    '7.5 LPA', 'Full-time', 'On Campus',
    60.00, 60.00, 6.00,
    false, true,
    '2026-09-05', 'Notified',
    '9:00 AM - 6:00 PM (Mon-Fri)', '16 days privileged leave + 8 casual leaves', 'Client dependent / Hybrid'
)
on conflict (id) do nothing;

-- 3. SEED SELECTION ROUNDS
-- Rounds for Google Cloud
insert into public.selection_rounds (id, company_id, round_number, round_type, round_date, details) values
('r1111111-1111-1111-1111-111111111101', 'c1111111-1111-1111-1111-111111111101', 1, 'Online Assessment', '2026-08-22', 'Google Online Challenge - 2 DSA algorithms, 60 mins on HackerEarth.'),
('r1111111-1111-1111-1111-111111111102', 'c1111111-1111-1111-1111-111111111101', 2, 'Technical Round 1', '2026-08-27', 'Data structures, Algorithms, Trees & Graphs (Google Meet).'),
('r1111111-1111-1111-1111-111111111103', 'c1111111-1111-1111-1111-111111111101', 3, 'Technical Round 2', '2026-08-28', 'System Design, Concurrency, and OS internals.'),
('r1111111-1111-1111-1111-111111111104', 'c1111111-1111-1111-1111-111111111101', 4, 'Googliness & Leadership', '2026-08-30', 'Behavioral, team collaboration, and ethical decision making.')
on conflict (id) do nothing;

-- Rounds for Microsoft
insert into public.selection_rounds (id, company_id, round_number, round_type, round_date, details) values
('r1111111-1111-1111-1111-111111111105', 'c1111111-1111-1111-1111-111111111102', 1, 'Online Coding Round', '2026-08-29', 'Codility test - 3 programming problems, 90 mins.'),
('r1111111-1111-1111-1111-111111111106', 'c1111111-1111-1111-1111-111111111102', 2, 'Technical Interview 1', '2026-09-03', 'Problem Solving, C++/Java/Python fundamentals (MS Teams).'),
('r1111111-1111-1111-1111-111111111107', 'c1111111-1111-1111-1111-111111111102', 3, 'Technical & System Design', '2026-09-06', 'Low level architecture, database querying, and debugging.'),
('r1111111-1111-1111-1111-111111111108', 'c1111111-1111-1111-1111-111111111102', 4, 'AA (As Appropriate) Round', '2026-09-08', 'Senior engineering manager conversation & culture fit.')
on conflict (id) do nothing;

-- Rounds for Zoho
insert into public.selection_rounds (id, company_id, round_number, round_type, round_date, details) values
('r1111111-1111-1111-1111-111111111109', 'c1111111-1111-1111-1111-111111111103', 1, 'Basic Programming & Aptitude', '2026-09-07', 'General aptitude + C/Java code snippets evaluation.'),
('r1111111-1111-1111-1111-111111111110', 'c1111111-1111-1111-1111-111111111103', 2, 'Advanced Programming (DSA)', '2026-09-10', 'Matrix manipulation, recursion, string handling without libraries.')
on conflict (id) do nothing;

-- 4. SEED APPLICATIONS & CANDIDATE TRACKING
insert into public.student_applications (
    id, company_id, student_id, status, 
    current_round_id, outcome_round_id, outcome_date, not_applied_reason, notes
) values
(
    'p1111111-1111-1111-1111-111111111101', 'c1111111-1111-1111-1111-111111111101', 'a1111111-1111-1111-1111-111111111101',
    'Selected', 'r1111111-1111-1111-1111-111111111104', 'r1111111-1111-1111-1111-111111111104', '2026-08-30',
    null, 'Selected as SWE (L3) with 32 LPA package. Joining July 2027.'
),
(
    'p1111111-1111-1111-1111-111111111102', 'c1111111-1111-1111-1111-111111111102', 'a1111111-1111-1111-1111-111111111102',
    'In Process', 'r1111111-1111-1111-1111-111111111107', null, null,
    null, 'Cleared Round 2 with distinction; scheduled for Round 3 System Design.'
),
(
    'p1111111-1111-1111-1111-111111111103', 'c1111111-1111-1111-1111-111111111102', 'a1111111-1111-1111-1111-111111111103',
    'In Process', 'r1111111-1111-1111-1111-111111111106', null, null,
    null, 'Cleared online coding test (3/3 test cases passed).'
),
(
    'p1111111-1111-1111-1111-111111111104', 'c1111111-1111-1111-1111-111111111101', 'a1111111-1111-1111-1111-111111111104',
    'Rejected', null, 'r1111111-1111-1111-1111-111111111102', '2026-08-27',
    null, 'Eliminated in Technical Round 1 - needed deeper optimization in graph questions.'
),
(
    'p1111111-1111-1111-1111-111111111105', 'c1111111-1111-1111-1111-111111111102', 'a1111111-1111-1111-1111-111111111106',
    'Did Not Apply', null, null, null,
    'Higher Package Already Secured', 'Already secured 32 LPA offer at Google Cloud; opted out of Microsoft drive.'
)
on conflict (id) do nothing;

-- 5. SEED DRIVE LINKS
insert into public.drive_links (id, title, url, description) values
(
    'd1111111-1111-1111-1111-111111111101', 'Student Resumes Folder',
    'https://drive.google.com/drive/folders/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs',
    'Verified student PDF resumes organized by graduation year and roll numbers.'
),
(
    'd1111111-1111-1111-1111-111111111102', 'Placement Handbook & Policy Documents',
    'https://drive.google.com/drive/folders/1AxiMVs0XRA5nFMdKvBdBZjgmUUqptlbc',
    'Institutional guidelines, student undertaking forms, and recruitment codes of conduct.'
),
(
    'd1111111-1111-1111-1111-111111111103', 'Company Brochures & Job Descriptions',
    'https://drive.google.com/drive/folders/1CxiMVs0XRA5nFMdKvBdBZjgmUUqptlbd',
    'Official company profile decks, job descriptions, test links, and compensation breakdowns.'
),
(
    'd1111111-1111-1111-1111-111111111104', 'Internship Completion Certificates',
    'https://drive.google.com/drive/folders/1DxiMVs0XRA5nFMdKvBdBZjgmUUqptlbe',
    'Industry internship verification letters and assessment evaluation rubrics.'
)
on conflict (id) do nothing;
