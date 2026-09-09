import { getSupabaseClient, isSupabaseConfigured, isDemoMode, setDemoMode } from '../lib/supabase';

export const MOCK_DEMO_USER = {
  id: 'demo-mentor-001',
  email: 'demo.mentor@college.edu',
  user_metadata: {
    full_name: 'Dr. S. Placement Mentor',
    role: 'Placement Coordinator',
    department: 'Cybersecurity and IoT'
  }
};

export const MOCK_DEMO_SESSION = {
  access_token: 'mock-demo-access-token',
  user: MOCK_DEMO_USER
};

const authListeners = new Set();

function notifyListeners(event, session) {
  authListeners.forEach((callback) => {
    try {
      callback(event, session);
    } catch (e) {
      console.error('Auth listener error:', e);
    }
  });
}

export async function signIn(email, password, forceDemo = false) {
  const client = getSupabaseClient();
  
  if (!client || forceDemo || !isSupabaseConfigured()) {
    setDemoMode(true);
    localStorage.setItem('pmp_demo_authenticated', 'true');
    const data = { user: MOCK_DEMO_USER, session: MOCK_DEMO_SESSION };
    notifyListeners('SIGNED_IN', MOCK_DEMO_SESSION);
    return data;
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
  if (!client || isDemoMode()) {
    localStorage.removeItem('pmp_demo_authenticated');
    notifyListeners('SIGNED_OUT', null);
    return;
  }

  const { error } = await client.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export async function getSession() {
  const client = getSupabaseClient();
  if (!client || isDemoMode()) {
    const isAuth = localStorage.getItem('pmp_demo_authenticated') === 'true';
    return isAuth ? MOCK_DEMO_SESSION : null;
  }

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
  if (!client || isDemoMode()) {
    const session = await getSession();
    return session?.user || null;
  }

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
  if (!client || isDemoMode()) {
    authListeners.add(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => authListeners.delete(callback)
        }
      }
    };
  }

  return client.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

