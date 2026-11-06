import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getInitialUrl = () => {
  try {
    const saved = localStorage.getItem('shopflow_supabase_url');
    if (saved && saved.trim()) return saved.trim();
  } catch (e) {
    // ignore
  }
  return import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
};

const getInitialKey = () => {
  try {
    const saved = localStorage.getItem('shopflow_supabase_anon_key');
    if (saved && saved.trim()) return saved.trim();
  } catch (e) {
    // ignore
  }
  return import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';
};

let currentUrl = getInitialUrl();
let currentKey = getInitialKey();

export let supabase: SupabaseClient = createClient(currentUrl, currentKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(currentUrl) &&
    Boolean(currentKey) &&
    !currentUrl.includes('placeholder.supabase.co') &&
    currentKey !== 'placeholder-key'
  );
};

export const getSupabaseConfig = () => {
  return {
    url: currentUrl.includes('placeholder.supabase.co') ? '' : currentUrl,
    anonKey: currentKey === 'placeholder-key' ? '' : currentKey,
    isConfigured: isSupabaseConfigured()
  };
};

export const updateSupabaseConfig = (url: string, anonKey: string): { success: boolean; error?: string } => {
  try {
    const cleanUrl = url.trim();
    const cleanKey = anonKey.trim();

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      return { success: false, error: 'Project URL must start with https:// (e.g. https://your-project.supabase.co)' };
    }
    if (cleanKey.length < 20) {
      return { success: false, error: 'Anon / Public API Key appears invalid (usually starts with eyJhbGciOi...)' };
    }

    currentUrl = cleanUrl;
    currentKey = cleanKey;

    try {
      localStorage.setItem('shopflow_supabase_url', cleanUrl);
      localStorage.setItem('shopflow_supabase_anon_key', cleanKey);
    } catch (e) {
      // ignore
    }

    supabase = createClient(currentUrl, currentKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to initialize Supabase client' };
  }
};

export const testSupabaseConnection = async (): Promise<{ connected: boolean; message: string }> => {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      message: 'Supabase credentials are not configured yet. Enter your Supabase Project URL and Anon Key.'
    };
  }

  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      return { connected: false, message: `Connection error: ${error.message}` };
    }
    return { connected: true, message: 'Successfully connected to Supabase Cloud!' };
  } catch (err: any) {
    return { connected: false, message: `Network error: ${err.message || 'Could not reach Supabase endpoint'}` };
  }
};
