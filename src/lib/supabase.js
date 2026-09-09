import { createClient } from '@supabase/supabase-js';

// Environment variables
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export function isSupabaseConfigured() {
  return Boolean(
    envUrl && 
    envAnonKey && 
    !envUrl.includes('your-project-ref') && 
    !envAnonKey.includes('your-anon')
  );
}

export function isDemoMode() {
  if (!isSupabaseConfigured()) {
    return true;
  }
  return localStorage.getItem('pmp_demo_mode') === 'true';
}

export function setDemoMode(enabled) {
  if (enabled) {
    localStorage.setItem('pmp_demo_mode', 'true');
  } else {
    localStorage.removeItem('pmp_demo_mode');
  }
}

let supabaseInstance = null;

export function getSupabaseClient() {
  if (isDemoMode() || !isSupabaseConfigured()) {
    return null;
  }

  if (supabaseInstance) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(envUrl, envAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    return supabaseInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

// Direct singleton export
export const supabase = getSupabaseClient();

