import { getSupabaseClient } from '../lib/supabase';
import { sanitizeStudent, updateStudent } from './studentsService';
import { 
  getMockApplications, 
  setMockApplications, 
  getMockStudents,
  getMockCompanies 
} from './mockData';

export async function getCompanyApplications(companyId) {
  const client = getSupabaseClient();
  if (!client) {
    const apps = getMockApplications().filter((a) => a.company_id === companyId);
    const students = getMockStudents();
    return apps.map((app) => {
      const studentObj = students.find((s) => s.id === app.student_id);
      return {
        ...app,
        students: sanitizeStudent(studentObj || null)
      };
    });
  }

  const { data, error } = await client
    .from('student_applications')
    .select(`
      *,
      students (*)
    `)
    .eq('company_id', companyId);

  if (error) {
    console.error(`Failed to fetch applications for company ${companyId}:`, error);
    throw error;
  }

  return (data || []).map((app) => ({
    ...app,
    students: sanitizeStudent(app.students)
  }));
}

export async function getStudentApplications(studentId) {
  const client = getSupabaseClient();
  if (!client) {
    const apps = getMockApplications().filter((a) => a.student_id === studentId);
    const companies = getMockCompanies();
    return apps.map((app) => {
      const compObj = companies.find((c) => c.id === app.company_id);
      return {
        ...app,
        companies: compObj || null
      };
    });
  }

  const { data, error } = await client
    .from('student_applications')
    .select(`
      *,
      companies (*)
    `)
    .eq('student_id', studentId);

  if (error) {
    console.error(`Failed to fetch applications for student ${studentId}:`, error);
    throw error;
  }

  return data || [];
}

export async function saveApplication(applicationData) {
  const { students, companies, ...pureData } = applicationData;
  const payload = {
    ...pureData,
    updated_at: new Date().toISOString()
  };

  const client = getSupabaseClient();
  if (!client) {
    const apps = getMockApplications();
    const idx = apps.findIndex(
      (a) => (a.id && a.id === payload.id) || (a.company_id === payload.company_id && a.student_id === payload.student_id)
    );

    let savedApp;
    if (idx !== -1) {
      apps[idx] = { ...apps[idx], ...payload };
      savedApp = apps[idx];
    } else {
      savedApp = { ...payload, id: payload.id || `app-${Date.now()}`, created_at: new Date().toISOString() };
      apps.push(savedApp);
    }
    setMockApplications(apps);

    if (payload.status === 'Selected' && payload.student_id) {
      await updateStudent(payload.student_id, { placement_status: 'Placed' });
    }

    const studentObj = getMockStudents().find((s) => s.id === savedApp.student_id);
    return {
      ...savedApp,
      students: sanitizeStudent(studentObj || null)
    };
  }

  const { data, error } = await client
    .from('student_applications')
    .upsert(payload, { onConflict: 'company_id,student_id' })
    .select(`
      *,
      students (*)
    `)
    .single();

  if (error) {
    console.error('Failed to save application in Supabase:', error);
    throw error;
  }

  // If candidate is marked 'Selected', also update student's placement status to 'Placed'
  if (applicationData.status === 'Selected' && applicationData.student_id) {
    try {
      await client
        .from('students')
        .update({ placement_status: 'Placed', updated_at: new Date().toISOString() })
        .eq('id', applicationData.student_id);
    } catch (stdErr) {
      console.warn('Failed to auto-update student placement status:', stdErr);
    }
  }

  return {
    ...data,
    students: sanitizeStudent(data.students)
  };
}

export async function deleteApplication(id) {
  const client = getSupabaseClient();
  if (!client) {
    setMockApplications(getMockApplications().filter((a) => a.id !== id));
    return true;
  }

  const { error } = await client
    .from('student_applications')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Failed to delete application ${id}:`, error);
    throw error;
  }

  return true;
}

export async function bulkSaveApplications(applicationsToSave) {
  if (!applicationsToSave || applicationsToSave.length === 0) {
    return [];
  }

  const client = getSupabaseClient();
  if (!client) {
    const apps = [...getMockApplications()];
    const result = [];
    for (const app of applicationsToSave) {
      const saved = await saveApplication(app);
      result.push(saved);
    }
    return result;
  }

  const cleanedPayloads = applicationsToSave.map((app) => {
    const { students, companies, ...pureApp } = app;
    return {
      ...pureApp,
      updated_at: new Date().toISOString()
    };
  });

  const { data, error } = await client
    .from('student_applications')
    .upsert(cleanedPayloads, { onConflict: 'company_id,student_id' })
    .select(`
      *,
      students (*)
    `);

  if (error) {
    console.error('Failed to bulk save applications in Supabase:', error);
    throw error;
  }

  // Update placement status for any newly selected candidates
  const selectedStudentIds = applicationsToSave
    .filter((a) => a.status === 'Selected' && a.student_id)
    .map((a) => a.student_id);

  if (selectedStudentIds.length > 0) {
    try {
      await client
        .from('students')
        .update({ placement_status: 'Placed', updated_at: new Date().toISOString() })
        .in('id', selectedStudentIds);
    } catch (e) {
      console.warn('Failed to bulk update student placement statuses:', e);
    }
  }

  return (data || []).map((app) => ({
    ...app,
    students: sanitizeStudent(app.students)
  }));
}

