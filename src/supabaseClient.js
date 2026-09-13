import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Momora Supabase Project Ref: rnkrjmblgcdqlyslbhob
export const DEFAULT_SUPABASE_URL = 'https://rnkrjmblgcdqlyslbhob.supabase.co';

let currentAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3JqbWJsZ2NkcWx5c2xiaG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NTE2OTQsImV4cCI6MjEwNDAyNzY5NH0.PXOKu-TTcxKaJQKFcA-QSN7ukwK3NuPJvVpzYRpMDXg';

// Create or re-create client
export let supabase = null;

function initClient(url, key) {
  if (!url || !key || key.includes('replace-with')) {
    supabase = null;
    return null;
  }
  try {
    supabase = createClient(url, key, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
      },
    });
    return supabase;
  } catch (err) {
    console.warn('[Supabase] Init error:', err);
    supabase = null;
    return null;
  }
}

// Check initial stored key
AsyncStorage.getItem('momora.supabase.anon_key').then(savedKey => {
  if (savedKey && !currentAnonKey) {
    currentAnonKey = savedKey;
    initClient(DEFAULT_SUPABASE_URL, savedKey);
  }
}).catch(() => {});

if (currentAnonKey) {
  initClient(DEFAULT_SUPABASE_URL, currentAnonKey);
}

export function isSupabaseConfigured() {
  return Boolean(supabase);
}

export async function setManualSupabaseKey(key) {
  const trimmed = (key || '').trim();
  if (!trimmed) return false;
  currentAnonKey = trimmed;
  await AsyncStorage.setItem('momora.supabase.anon_key', trimmed);
  initClient(DEFAULT_SUPABASE_URL, trimmed);
  return Boolean(supabase);
}

export async function getCurrentUser() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user || null;
  } catch (e) {
    return null;
  }
}

export async function getAuthSession() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) return null;
    return data.session || null;
  } catch (e) {
    return null;
  }
}

export async function signUpWithEmail({ email, password, fullName, role = 'mother', partnerCode }) {
  if (!supabase) {
    return { error: { message: 'Supabase API anahtarı bekleniyor.' } };
  }
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          partner_code: partnerCode || null,
        },
      },
    });
    return { data, error };
  } catch (err) {
    return { error: err };
  }
}

export async function signInWithEmailPassword({ email, password }) {
  if (!supabase) {
    return { error: { message: 'Supabase API anahtarı bekleniyor.' } };
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  } catch (err) {
    return { error: err };
  }
}

export async function signInWithOAuthProvider(provider = 'google') {
  if (!supabase) {
    return { error: { message: 'Supabase API anahtarı bekleniyor.' } };
  }
  try {
    const redirectTo = Platform.OS === 'web' 
      ? (typeof window !== 'undefined' ? window.location.origin : '') 
      : 'momora://auth-callback';

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      return { data, error };
    }

    if (data?.url && Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.href = data.url;
    }

    return { data, error: null };
  } catch (err) {
    return { error: err };
  }
}

export async function resetPasswordForEmail(email) {
  if (!supabase) {
    return { error: { message: 'Supabase API anahtarı bekleniyor.' } };
  }
  try {
    const redirectTo = Platform.OS === 'web' 
      ? window.location.origin 
      : 'momora://reset-password';

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    return { data, error };
  } catch (err) {
    return { error: err };
  }
}

export async function signOutUser() {
  if (!supabase) return { error: null };
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err) {
    return { error: err };
  }
}

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  setTimeout(() => {
    if (supabase) {
      supabase.auth.onAuthStateChange((event, session) => {
        if (session && (window.location.hash.includes('access_token') || window.location.search.includes('code='))) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      });
    }
  }, 100);
}
