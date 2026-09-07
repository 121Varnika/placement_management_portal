import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

export async function signIn(email, password) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
  }

  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export async function getSession() {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data: { session }, error } = await client.auth.getSession();
    if (error) {
      console.warn('Error fetching session:', error);
      return null;
    }
    return session;
  } catch (err) {
    console.error('Failed to get session:', err);
    return null;
  }
}

export async function getCurrentUser() {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch (err) {
    console.error('Failed to get user:', err);
    return null;
  }
}

export function onAuthStateChange(callback) {
  const client = getSupabaseClient();
  if (!client) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }

  return client.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}
