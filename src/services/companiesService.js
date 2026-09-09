import { getSupabaseClient } from '../lib/supabase';
import { 
  getMockCompanies, 
  setMockCompanies, 
  getMockRounds, 
  setMockRounds 
} from './mockData';

export function sanitizeCompany(company) {
  if (!company) return company;
  return {
    ...company,
    drive_type: company.drive_type || 'On Campus',
    min_tenth_percentage: company.min_tenth_percentage !== undefined && company.min_tenth_percentage !== null ? parseFloat(company.min_tenth_percentage) : 60.0,
    min_twelfth_percentage: company.min_twelfth_percentage !== undefined && company.min_twelfth_percentage !== null ? parseFloat(company.min_twelfth_percentage) : 60.0,
    min_cgpa: company.min_cgpa !== undefined && company.min_cgpa !== null ? parseFloat(company.min_cgpa) : 6.0,
    current_arrears_allowed: company.current_arrears_allowed !== undefined ? Boolean(company.current_arrears_allowed) : false,
    arrears_history_allowed: company.arrears_history_allowed !== undefined ? Boolean(company.arrears_history_allowed) : true
  };
}

export function evaluateStudentEligibility(student, company) {
  if (!student || !company) return { isEligible: true, reasons: [] };

  const sanitizedComp = sanitizeCompany(company);
  const reasons = [];

  const studentCgpa = parseFloat(student.cgpa || 0);
  const reqCgpa = parseFloat(sanitizedComp.min_cgpa || 6.0);
  if (studentCgpa < reqCgpa) {
    reasons.push(`CGPA: ${studentCgpa.toFixed(2)} is below the required ${reqCgpa.toFixed(2)}`);
  }

  const studentTenth = parseFloat(student.tenth_percentage || 0);
  const reqTenth = parseFloat(sanitizedComp.min_tenth_percentage || 60.0);
  if (studentTenth < reqTenth) {
    reasons.push(`10th: ${studentTenth}% is below the required ${reqTenth}%`);
  }

  const studentTwelfth = parseFloat(student.twelfth_percentage || 0);
  const reqTwelfth = parseFloat(sanitizedComp.min_twelfth_percentage || 60.0);
  if (studentTwelfth < reqTwelfth) {
    reasons.push(`12th / Diploma: ${studentTwelfth}% is below the required ${reqTwelfth}%`);
  }

  const currentArrears = parseInt(student.current_arrears || 0, 10);
  if (!sanitizedComp.current_arrears_allowed && currentArrears > 0) {
    reasons.push(`Has ${currentArrears} standing arrear(s) (no active arrears allowed)`);
  }

  const arrearsHistory = parseInt(student.arrears_history || 0, 10);
  if (!sanitizedComp.arrears_history_allowed && arrearsHistory > 0) {
    reasons.push(`Has history of ${arrearsHistory} arrear(s) (clean history required)`);
  }

  return {
    isEligible: reasons.length === 0,
    reasons
  };
}

export async function getCompanies() {
  const client = getSupabaseClient();
  if (!client) {
    return getMockCompanies().map(sanitizeCompany);
  }

  const { data, error } = await client
    .from('companies')
    .select('*')
    .order('notified_date', { ascending: false });

  if (error) {
    console.error('Failed to fetch companies from Supabase:', error);
    throw error;
  }

  return (data || []).map(sanitizeCompany);
}

export async function getCompanyById(id) {
  const client = getSupabaseClient();
  if (!client) {
    const list = getMockCompanies();
    const found = list.find((c) => c.id === id);
    return sanitizeCompany(found || null);
  }

  const { data, error } = await client
    .from('companies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Failed to fetch company ${id}:`, error);
    throw error;
  }

  return sanitizeCompany(data);
}

export async function createCompany(companyData, rounds = []) {
  const sanitized = sanitizeCompany(companyData);
  const newCompany = {
    ...sanitized,
    min_tenth_percentage: parseFloat(sanitized.min_tenth_percentage || 60),
    min_twelfth_percentage: parseFloat(sanitized.min_twelfth_percentage || 60),
    min_cgpa: parseFloat(sanitized.min_cgpa || 6.0),
    current_arrears_allowed: Boolean(sanitized.current_arrears_allowed),
    arrears_history_allowed: Boolean(sanitized.arrears_history_allowed),
    status: sanitized.status || 'Notified',
    notified_date: sanitized.notified_date || new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const client = getSupabaseClient();
  if (!client) {
    const list = getMockCompanies();
    const createdComp = { ...newCompany, id: `c-${Date.now()}` };
    list.unshift(createdComp);
    setMockCompanies(list);

    if (rounds && rounds.length > 0) {
      const rList = getMockRounds();
      const createdRounds = rounds.map((r, idx) => ({
        id: `r-${Date.now()}-${idx}`,
        company_id: createdComp.id,
        round_number: r.round_number || idx + 1,
        round_type: r.round_type,
        round_date: r.round_date || null,
        details: r.details || ''
      }));
      setMockRounds([...rList, ...createdRounds]);
    }

    return sanitizeCompany(createdComp);
  }

  const { data: createdCompany, error: compErr } = await client
    .from('companies')
    .insert([newCompany])
    .select()
    .single();

  if (compErr || !createdCompany) {
    console.error('Failed to create company in Supabase:', compErr);
    throw compErr;
  }

  // Insert rounds only if specified
  if (rounds && rounds.length > 0) {
    const roundsToInsert = rounds.map((r, idx) => ({
      company_id: createdCompany.id,
      round_number: r.round_number || idx + 1,
      round_type: r.round_type,
      round_date: r.round_date || null,
      details: r.details || ''
    }));

    const { error: rndErr } = await client
      .from('selection_rounds')
      .insert(roundsToInsert);

    if (rndErr) {
      console.warn('Failed to insert rounds for new company:', rndErr);
    }
  }

  return sanitizeCompany(createdCompany);
}

export async function updateCompany(id, companyData, rounds = null) {
  const sanitized = sanitizeCompany(companyData);
  const updatedCompany = {
    ...sanitized,
    min_tenth_percentage: parseFloat(sanitized.min_tenth_percentage || 60),
    min_twelfth_percentage: parseFloat(sanitized.min_twelfth_percentage || 60),
    min_cgpa: parseFloat(sanitized.min_cgpa || 6.0),
    current_arrears_allowed: Boolean(sanitized.current_arrears_allowed),
    arrears_history_allowed: Boolean(sanitized.arrears_history_allowed),
    updated_at: new Date().toISOString()
  };

  const client = getSupabaseClient();
  if (!client) {
    const list = getMockCompanies();
    const index = list.findIndex((c) => c.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedCompany };
      setMockCompanies(list);
    }

    if (rounds !== null) {
      const rList = getMockRounds().filter((r) => r.company_id !== id);
      const newRounds = rounds.map((r, idx) => ({
        id: r.id || `r-${Date.now()}-${idx}`,
        company_id: id,
        round_number: r.round_number || idx + 1,
        round_type: r.round_type,
        round_date: r.round_date || null,
        details: r.details || ''
      }));
      setMockRounds([...rList, ...newRounds]);
    }

    return sanitizeCompany(list[index] || updatedCompany);
  }

  const { data, error } = await client
    .from('companies')
    .update(updatedCompany)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Failed to update company ${id}:`, error);
    throw error;
  }

  // Update selection rounds if provided
  if (rounds !== null) {
    // Delete existing rounds
    const { error: delErr } = await client
      .from('selection_rounds')
      .delete()
      .eq('company_id', id);

    if (delErr) {
      console.warn('Failed to clean previous rounds:', delErr);
    }

    if (rounds.length > 0) {
      const roundsToInsert = rounds.map((r, idx) => ({
        company_id: id,
        round_number: r.round_number || idx + 1,
        round_type: r.round_type,
        round_date: r.round_date || null,
        details: r.details || ''
      }));

      const { error: insErr } = await client
        .from('selection_rounds')
        .insert(roundsToInsert);

      if (insErr) {
        console.warn('Failed to insert updated rounds:', insErr);
      }
    }
  }

  return sanitizeCompany(data);
}

export async function deleteCompany(id) {
  const client = getSupabaseClient();
  if (!client) {
    setMockCompanies(getMockCompanies().filter((c) => c.id !== id));
    setMockRounds(getMockRounds().filter((r) => r.company_id !== id));
    return true;
  }

  const { error } = await client
    .from('companies')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Failed to delete company ${id}:`, error);
    throw error;
  }

  return true;
}

export async function getCompanyRounds(companyId) {
  const client = getSupabaseClient();
  if (!client) {
    return getMockRounds()
      .filter((r) => r.company_id === companyId)
      .sort((a, b) => (a.round_number || 0) - (b.round_number || 0));
  }

  const { data, error } = await client
    .from('selection_rounds')
    .select('*')
    .eq('company_id', companyId)
    .order('round_number', { ascending: true });

  if (error) {
    console.error(`Failed to fetch rounds for company ${companyId}:`, error);
    throw error;
  }

  return data || [];
}

