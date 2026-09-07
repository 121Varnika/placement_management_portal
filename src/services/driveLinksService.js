import { getSupabaseClient } from '../lib/supabase';

export async function getDriveLinks() {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Database client not initialized.');
  }

  const { data, error } = await client
    .from('drive_links')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch drive links from Supabase:', error);
    throw error;
  }

  return data || [];
}

export async function createDriveLink(formData) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Database client not initialized.');
  }

  const payload = {
    title: formData.title.trim(),
    url: formData.url.trim(),
    description: formData.description ? formData.description.trim() : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await client
    .from('drive_links')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Failed to create drive link in Supabase:', error);
    throw error;
  }

  return data;
}

export async function updateDriveLink(id, formData) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Database client not initialized.');
  }

  const payload = {
    title: formData.title.trim(),
    url: formData.url.trim(),
    description: formData.description ? formData.description.trim() : null,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await client
    .from('drive_links')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Failed to update drive link ${id}:`, error);
    throw error;
  }

  return data;
}

export async function deleteDriveLink(id) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Database client not initialized.');
  }

  const { error } = await client
    .from('drive_links')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Failed to delete drive link ${id}:`, error);
    throw error;
  }

  return true;
}
