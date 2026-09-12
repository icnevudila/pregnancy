import { supabase, isSupabaseConfigured } from './supabaseClient';

const SYNC_VERSION = 1;

export function cloudStatusLabel() {
  return isSupabaseConfigured ? 'Bulut eşitleme hazır' : 'Bulut eşitleme için publishable key bekleniyor';
}

export async function loadCloudState() {
  if (!supabase) return { state: null, user: null, error: null };
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { state: null, user: null, error: userError || null };

  const { data, error } = await supabase
    .from('momora_state_snapshots')
    .select('state, updated_at')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (error) return { state: null, user: userData.user, error };
  return { state: data?.state || null, user: userData.user, error: null };
}

export async function saveCloudState(state) {
  if (!supabase) return { skipped: true };
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { skipped: true, error: userError || null };

  const userId = userData.user.id;
  const profile = {
    user_id: userId,
    display_name: state.name || null,
    role: state.role || 'mother',
    partner_name: state.partnerName || null,
    baby_name: state.babyName || null,
    baby_gender: state.babyGender || null,
    journey_mode: state.mode || 'pregnancy',
    due_date: /^\d{4}-\d{2}-\d{2}$/.test(state.dueDate || '') ? state.dueDate : null,
    preferences: {
      remindWater: state.remindWater !== false,
      remindVitamin: state.remindVitamin !== false,
      remindLetter: state.remindLetter !== false,
      remindPartner: state.remindPartner !== false,
    },
    updated_at: new Date().toISOString(),
  };

  const snapshot = {
    user_id: userId,
    sync_version: SYNC_VERSION,
    state,
    updated_at: new Date().toISOString(),
  };

  const profileResult = await supabase.from('momora_profiles').upsert(profile, { onConflict: 'user_id' });
  if (profileResult.error) return { error: profileResult.error };

  const snapshotResult = await supabase.from('momora_state_snapshots').upsert(snapshot, { onConflict: 'user_id' });
  if (snapshotResult.error) return { error: snapshotResult.error };

  return { ok: true };
}

export async function signInWithEmail(email, password, signUp = false) {
  if (!supabase) return { error: { message: 'Supabase publishable key eksik.' } };
  return signUp
    ? supabase.auth.signUp({ email, password })
    : supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  if (!supabase) return { error: null };
  return supabase.auth.signOut();
}
