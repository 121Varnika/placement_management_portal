import { getSupabaseClient } from '../lib/supabase';
import { sanitizeStudent } from './studentsService';
import { sanitizeCompany } from './companiesService';
import { 
  getMockStudents, 
  getMockCompanies, 
  getMockApplications, 
  getMockRounds 
} from './mockData';

export async function getDashboardData() {
  const client = getSupabaseClient();
  
  let rawStudents = [];
  let rawCompanies = [];
  let apps = [];
  let allRounds = [];

  if (!client) {
    rawStudents = getMockStudents();
    rawCompanies = getMockCompanies();
    apps = getMockApplications();
    allRounds = getMockRounds();
  } else {
    const [
      { data: students, error: stdErr },
      { data: companies, error: cmpErr },
      { data: applications, error: appErr },
      { data: rounds, error: rndErr }
    ] = await Promise.all([
      client.from('students').select('*'),
      client.from('companies').select('*').order('notified_date', { ascending: false }),
      client.from('student_applications').select('*'),
      client.from('selection_rounds').select('*')
    ]);

    if (stdErr) console.error('Error fetching students for dashboard:', stdErr);
    if (cmpErr) console.error('Error fetching companies for dashboard:', cmpErr);
    if (appErr) console.error('Error fetching applications for dashboard:', appErr);
    if (rndErr) console.error('Error fetching rounds for dashboard:', rndErr);

    rawStudents = students || [];
    rawCompanies = companies || [];
    apps = applications || [];
    allRounds = rounds || [];
  }

  const cleanStudents = rawStudents.map(sanitizeStudent);
  const cleanCompanies = rawCompanies.map(sanitizeCompany);

  // Metrics calculation
  const totalCompanies = cleanCompanies.length;
  const completedCompanies = cleanCompanies.filter((c) => c.status === 'Completed').length;
  const inProcessCompanies = cleanCompanies.filter((c) => c.status === 'In Process').length;
  const notifiedCompanies = cleanCompanies.filter((c) => c.status === 'Notified' || !c.status).length;

  const totalStudents = cleanStudents.length;
  const placedStudents = cleanStudents.filter((s) => s.placement_status === 'Placed').length;
  const placementRate = totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : '0.0';

  const inProcessStudentIds = new Set(
    apps.filter((a) => a.status === 'In Process' || a.status === 'Applied').map((a) => a.student_id)
  );
  const inProcessStudents = inProcessStudentIds.size;

  const metrics = {
    totalCompanies,
    completedCompanies,
    inProcessCompanies,
    notifiedCompanies,
    totalStudents,
    placedStudents,
    placementRate,
    inProcessStudents
  };

  // Department Placement Breakdown
  const deptMap = {};
  cleanStudents.forEach((std) => {
    const deptName = std.department || 'Cybersecurity and IoT';
    if (!deptMap[deptName]) {
      deptMap[deptName] = { total: 0, placed: 0 };
    }
    deptMap[deptName].total += 1;
    if (std.placement_status === 'Placed') {
      deptMap[deptName].placed += 1;
    }
  });

  const departmentStats = Object.keys(deptMap).map((deptName) => {
    const d = deptMap[deptName];
    const rate = d.total > 0 ? Math.round((d.placed / d.total) * 100) : 0;
    return {
      name: deptName,
      total: d.total,
      placed: d.placed,
      rate
    };
  });

  // Recent Companies (up to 5 latest)
  const recentCompanies = cleanCompanies.slice(0, 5);

  // Calendar Events from Selection Rounds
  const companyMap = new Map(cleanCompanies.map((c) => [c.id, c]));
  const calendarEvents = allRounds
    .filter((r) => r.round_date)
    .map((r) => {
      const company = companyMap.get(r.company_id);
      return {
        id: r.id,
        date: r.round_date,
        title: `${company?.name || 'Recruitment Drive'} - ${r.round_type}`,
        type: r.round_type?.toLowerCase().includes('interview') ? 'interview' : 'assessment',
        companyId: r.company_id,
        companyName: company?.name || 'Recruitment Drive',
        package: company?.salary_package || '',
        details: r.details || ''
      };
    });

  return {
    metrics,
    departmentStats,
    recentCompanies,
    calendarEvents,
    // Aliases for any components expecting alternative naming
    stats: metrics,
    companies: cleanCompanies,
    students: cleanStudents,
    recentApplications: apps.slice(0, 10)
  };
}

