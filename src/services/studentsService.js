import { getSupabaseClient } from '../lib/supabase';

export function sanitizeStudent(student) {
  if (!student) return student;
  const { section, resume_url, ...rest } = student;
  return rest;
}

export async function getStudents() {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Database client not initialized. Check Supabase credentials.');
  }

  const { data, error } = await client
    .from('students')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Failed to fetch students from Supabase:', error);
    throw error;
  }

  return (data || []).map(sanitizeStudent);
}

export async function getStudentById(id) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Database client not initialized.');
  }

  const { data, error } = await client
    .from('students')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Failed to fetch student ${id}:`, error);
    throw error;
  }

  return sanitizeStudent(data);
}

export async function createStudent(studentData) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Database client not initialized.');
  }

  const sanitized = sanitizeStudent(studentData);
  const payload = {
    ...sanitized,
    cgpa: parseFloat(sanitized.cgpa || 0),
    current_arrears: parseInt(sanitized.current_arrears || 0, 10),
    arrears_history: parseInt(sanitized.arrears_history || 0, 10),
    tenth_percentage: sanitized.tenth_percentage ? parseFloat(sanitized.tenth_percentage) : null,
    twelfth_percentage: sanitized.twelfth_percentage ? parseFloat(sanitized.twelfth_percentage) : null,
    placement_status: sanitized.placement_status === 'In Progress' ? 'Not Placed' : (sanitized.placement_status || 'Not Placed'),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await client
    .from('students')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Failed to create student in Supabase:', error);
    throw error;
  }

  return sanitizeStudent(data);
}

export async function updateStudent(id, studentData) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Database client not initialized.');
  }

  const sanitized = sanitizeStudent(studentData);
  const payload = {
    ...sanitized,
    cgpa: parseFloat(sanitized.cgpa || 0),
    current_arrears: parseInt(sanitized.current_arrears || 0, 10),
    arrears_history: parseInt(sanitized.arrears_history || 0, 10),
    tenth_percentage: sanitized.tenth_percentage ? parseFloat(sanitized.tenth_percentage) : null,
    twelfth_percentage: sanitized.twelfth_percentage ? parseFloat(sanitized.twelfth_percentage) : null,
    placement_status: sanitized.placement_status === 'In Progress' ? 'Not Placed' : (sanitized.placement_status || 'Not Placed'),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await client
    .from('students')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Failed to update student ${id}:`, error);
    throw error;
  }

  return sanitizeStudent(data);
}

export async function deleteStudent(id) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Database client not initialized.');
  }

  const { error } = await client
    .from('students')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Failed to delete student ${id}:`, error);
    throw error;
  }

  return true;
}

export async function bulkUpsertStudents(importedStudents, updateExisting = true) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Database client not initialized.');
  }

  const cleaned = importedStudents.map((s) => {
    const sanitized = sanitizeStudent(s);
    return {
      college_id: sanitized.college_id,
      name: sanitized.name,
      department: sanitized.department,
      batch: sanitized.batch,
      college_email: sanitized.college_email || null,
      work_personal_email: sanitized.work_personal_email || null,
      phone: sanitized.phone || null,
      cgpa: parseFloat(sanitized.cgpa || 0),
      current_arrears: parseInt(sanitized.current_arrears || 0, 10),
      arrears_history: parseInt(sanitized.arrears_history || 0, 10),
      tenth_percentage: sanitized.tenth_percentage ? parseFloat(sanitized.tenth_percentage) : null,
      twelfth_percentage: sanitized.twelfth_percentage ? parseFloat(sanitized.twelfth_percentage) : null,
      github_url: sanitized.github_url || null,
      linkedin_url: sanitized.linkedin_url || null,
      leetcode_url: sanitized.leetcode_url || null,
      portfolio_url: sanitized.portfolio_url || null,
      placement_status: sanitized.placement_status === 'In Progress' ? 'Not Placed' : (sanitized.placement_status || 'Not Placed'),
      updated_at: new Date().toISOString()
    };
  });

  const { data, error } = await client
    .from('students')
    .upsert(cleaned, { onConflict: 'college_id', ignoreDuplicates: !updateExisting })
    .select();

  if (error) {
    console.error('Failed to bulk upsert students in Supabase:', error);
    throw error;
  }

  return data;
}
