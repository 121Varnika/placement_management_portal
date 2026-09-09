import { getSupabaseClient } from '../lib/supabase';
import { getMockDriveLinks, setMockDriveLinks } from './mockData';

export async function getDriveLinks() {
  const client = getSupabaseClient();
  if (!client) {
    return getMockDriveLinks();
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
  const payload = {
    title: formData.title.trim(),
    url: formData.url.trim(),
    description: formData.description ? formData.description.trim() : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const client = getSupabaseClient();
  if (!client) {
    const list = getMockDriveLinks();
    const newItem = { ...payload, id: `dl-${Date.now()}` };
    list.unshift(newItem);
    setMockDriveLinks(list);
    return newItem;
  }

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
  const payload = {
    title: formData.title.trim(),
    url: formData.url.trim(),
    description: formData.description ? formData.description.trim() : null,
    updated_at: new Date().toISOString()
  };

  const client = getSupabaseClient();
  if (!client) {
    const list = getMockDriveLinks();
    const idx = list.findIndex((l) => l.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...payload };
      setMockDriveLinks(list);
      return list[idx];
    }
    return null;
  }

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
    setMockDriveLinks(getMockDriveLinks().filter((l) => l.id !== id));
    return true;
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

