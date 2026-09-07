import { getSupabaseClient } from '../lib/supabase';
import { sanitizeStudent } from './studentsService';

export async function getCompanyApplications(companyId) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Database client not initialized.');
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
    throw new Error('Database client not initialized.');
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
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Database client not initialized.');
  }

  const { students, companies, ...pureData } = applicationData;
  const payload = {
    ...pureData,
    updated_at: new Date().toISOString()
  };

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
    throw new Error('Database client not initialized.');
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
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Database client not initialized.');
  }

  if (!applicationsToSave || applicationsToSave.length === 0) {
    return [];
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
