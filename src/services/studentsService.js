import { getSupabaseClient } from '../lib/supabase';
import { getMockStudents, setMockStudents } from './mockData';

export function sanitizeStudent(student) {
  if (!student) return student;
  const { section, resume_url, ...rest } = student;
  return rest;
}

export async function getStudents() {
  const client = getSupabaseClient();
  if (!client) {
    return getMockStudents().map(sanitizeStudent);
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
    const list = getMockStudents();
    const found = list.find((s) => s.id === id);
    return sanitizeStudent(found || null);
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

  const client = getSupabaseClient();
  if (!client) {
    const list = getMockStudents();
    const newStudent = { ...payload, id: `std-${Date.now()}` };
    list.unshift(newStudent);
    setMockStudents(list);
    return sanitizeStudent(newStudent);
  }

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

  const client = getSupabaseClient();
  if (!client) {
    const list = getMockStudents();
    const index = list.findIndex((s) => s.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...payload };
      setMockStudents(list);
      return sanitizeStudent(list[index]);
    }
    return null;
  }

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
    const list = getMockStudents().filter((s) => s.id !== id);
    setMockStudents(list);
    return true;
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

  if (!client) {
    const list = [...getMockStudents()];
    cleaned.forEach((imp) => {
      const idx = list.findIndex((s) => s.college_id === imp.college_id);
      if (idx !== -1) {
        if (updateExisting) {
          list[idx] = { ...list[idx], ...imp };
        }
      } else {
        list.push({ ...imp, id: `std-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, created_at: new Date().toISOString() });
      }
    });
    setMockStudents(list);
    return list;
  }

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

