import { supabase, isSupabaseConfigured } from './supabaseClient';

const SYNC_VERSION = 2;

export function cloudStatusLabel() {
  return isSupabaseConfigured() ? 'Bulut eşitleme aktif' : 'Bulut eşitleme bekleniyor';
}

// ─── 1. KULLANICI PROFİLİ VE BULUT DURUMU ─────────────────────────────────────

export async function loadCloudState() {
  if (!supabase) return { state: null, user: null, error: null };
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) return { state: null, user: null, error: userError || null };

    const { data, error } = await supabase
      .from('momora_state_snapshots')
      .select('state, updated_at')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (error) return { state: null, user: userData.user, error };
    return { state: data?.state || null, user: userData.user, error: null };
  } catch (err) {
    return { state: null, user: null, error: err };
  }
}

export async function saveCloudState(state) {
  if (!supabase) return { skipped: true };
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) return { skipped: true, error: userError || null };

    const userId = userData.user.id;
    const profile = {
      user_id: userId,
      email: userData.user.email,
      display_name: state.name || null,
      role: state.role || 'mother',
      partner_name: state.partnerName || null,
      baby_name: state.babyName || null,
      baby_gender: state.babyGender || null,
      journey_mode: state.mode || 'pregnancy',
      due_date: /^\d{4}-\d{2}-\d{2}$/.test(state.dueDate || '') ? state.dueDate : null,
      pregnancy_week: state.week || 24,
      blood_type: state.bloodType || null,
      doctor_name: state.doctor || null,
      hospital_name: state.hospital || null,
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
  } catch (err) {
    return { error: err };
  }
}

// ─── 2. EŞ BAĞLAMA VE AİLE EŞİTLEMESİ (RPC) ───────────────────────────────────

export async function linkPartnerAccount(partnerCode) {
  if (!supabase) return { error: { message: 'Bulut bağlantısı yok.' } };
  try {
    const { data, error } = await supabase.rpc('momora_link_partner', {
      code_to_link: partnerCode.trim(),
    });
    if (error) return { error };
    return { ok: true, data };
  } catch (err) {
    return { error: err };
  }
}

// ─── 3. EŞ MESAJLARI (SEVGİ NOTLARI) ──────────────────────────────────────────

export async function sendPartnerMessage(body, moodTag = null) {
  if (!supabase) return { skipped: true };
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return { skipped: true };

    const { data: prof } = await supabase
      .from('momora_profiles')
      .select('family_code, role, display_name')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    const familyCode = prof?.family_code || 'MOM-7829-TR';

    const { data, error } = await supabase.from('momora_family_messages').insert({
      sender_id: userData.user.id,
      family_code: familyCode,
      sender_role: prof?.role || 'mother',
      sender_name: prof?.display_name || 'Eşiniz',
      body,
      mood_tag: moodTag,
      is_read: false,
    }).select().single();

    if (error) return { error };
    return { ok: true, data };
  } catch (err) {
    return { error: err };
  }
}

export async function fetchPartnerMessages() {
  if (!supabase) return { data: [] };
  try {
    const { data, error } = await supabase
      .from('momora_family_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) return { data: [], error };
    return { data: data || [] };
  } catch (err) {
    return { data: [], error: err };
  }
}

// ─── 4. GÜNLÜK SAĞLIK & TAKİP LOGLARI ─────────────────────────────────────────

export async function saveDailyHealthLog({ waterGlasses, vitaminTaken, moodIndex, symptoms, weightKg, notes }) {
  if (!supabase) return { skipped: true };
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return { skipped: true };

    const todayStr = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase.from('momora_daily_logs').upsert({
      user_id: userData.user.id,
      log_date: todayStr,
      water_glasses: waterGlasses || 0,
      vitamin_taken: Boolean(vitaminTaken),
      mood_index: moodIndex ?? null,
      symptoms: symptoms || [],
      weight_kg: weightKg || null,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,log_date' });

    if (error) return { error };
    return { ok: true, data };
  } catch (err) {
    return { error: err };
  }
}

// ─── 5. TEKME SAYACI SEANSLARI ────────────────────────────────────────────────

export async function saveKickSessionCloud({ durationSeconds, kickCount, week, notes }) {
  if (!supabase) return { skipped: true };
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return { skipped: true };

    const startedAt = new Date(Date.now() - durationSeconds * 1000).toISOString();
    const finishedAt = new Date().toISOString();

    const { data, error } = await supabase.from('momora_kick_sessions').insert({
      user_id: userData.user.id,
      duration_seconds: durationSeconds,
      kick_count: kickCount || 10,
      pregnancy_week: week || 24,
      started_at: startedAt,
      finished_at: finishedAt,
      notes: notes || null,
    }).select().single();

    if (error) return { error };
    return { ok: true, data };
  } catch (err) {
    return { error: err };
  }
}

// ─── 6. KASILMA SAYACI SEANSLARI ──────────────────────────────────────────────

export async function saveContractionSessionCloud({ durationSeconds, intervalSeconds, intensity, statusAlert, notes }) {
  if (!supabase) return { skipped: true };
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return { skipped: true };

    const { data, error } = await supabase.from('momora_contraction_sessions').insert({
      user_id: userData.user.id,
      started_at: new Date().toISOString(),
      duration_seconds: durationSeconds,
      interval_seconds: intervalSeconds || null,
      intensity: intensity || 'Orta',
      status_alert: statusAlert || 'normal',
      notes: notes || null,
    }).select().single();

    if (error) return { error };
    return { ok: true, data };
  } catch (err) {
    return { error: err };
  }
}

// ─── 7. BEBEK MEKTUPLARI (ANI DEFTERİ) ─────────────────────────────────────────

export async function saveBabyLetterCloud({ title, body, authorRole = 'mother', authorName = 'Anne' }) {
  if (!supabase) return { skipped: true };
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return { skipped: true };

    const { data, error } = await supabase.from('momora_baby_letters').insert({
      user_id: userData.user.id,
      author_name: authorName,
      author_role: authorRole,
      title: title || 'Canımız Bebeğimize',
      body,
    }).select().single();

    if (error) return { error };
    return { ok: true, data };
  } catch (err) {
    return { error: err };
  }
}

export async function fetchBabyLettersCloud() {
  if (!supabase) return { data: [] };
  try {
    const { data, error } = await supabase
      .from('momora_baby_letters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return { data: [], error };
    return { data: data || [] };
  } catch (err) {
    return { data: [], error: err };
  }
}

// ─── 8. DOĞUM ÇANTASI LİSTESİ ─────────────────────────────────────────────────

export async function fetchHospitalBagCloud() {
  if (!supabase) return { data: [] };
  try {
    const { data, error } = await supabase
      .from('momora_hospital_bag_items')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) return { data: [], error };
    return { data: data || [] };
  } catch (err) {
    return { data: [], error: err };
  }
}

export async function toggleHospitalBagCloud(id, isPacked) {
  if (!supabase) return { skipped: true };
  try {
    const { error } = await supabase
      .from('momora_hospital_bag_items')
      .update({ is_packed: isPacked })
      .eq('id', id);

    if (error) return { error };
    return { ok: true };
  } catch (err) {
    return { error: err };
  }
}

// ─── 9. TOPLULUK FORUMU (GÖNDERİLER VE YORUMLAR) ──────────────────────────────

export async function fetchCommunityPostsCloud(category = 'All') {
  if (!supabase) return { data: [] };
  try {
    let query = supabase
      .from('momora_community_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (category && category !== 'All' && category !== 'Tümü' && category !== 'Genel') {
      query = query.eq('category', category);
    }

    const { data, error } = await query.limit(30);
    if (error) return { data: [], error };
    return { data: data || [] };
  } catch (err) {
    return { data: [], error: err };
  }
}

export async function createCommunityPostCloud({ title, body, category = 'Genel', isAnonymous = false }) {
  if (!supabase) return { error: { message: 'Bağlantı yok.' } };
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return { error: { message: 'Giriş yapmanız gerekiyor.' } };

    const { data: prof } = await supabase
      .from('momora_profiles')
      .select('display_name, role, pregnancy_week')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    const authorName = isAnonymous ? 'Anonim Anne' : (prof?.display_name || 'Anne Adayı');
    const weekLabel = (prof?.pregnancy_week || 24) + '. Hafta';

    const { data, error } = await supabase.from('momora_community_posts').insert({
      user_id: userData.user.id,
      author_name: authorName,
      author_role: prof?.role || 'mother',
      week_label: weekLabel,
      category,
      title,
      body,
      is_anonymous: isAnonymous,
      likes_count: 0,
      comments_count: 0,
    }).select().single();

    if (error) return { error };
    return { ok: true, data };
  } catch (err) {
    return { error: err };
  }
}

export async function addCommunityCommentCloud({ postId, body }) {
  if (!supabase) return { error: { message: 'Bağlantı yok.' } };
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return { error: { message: 'Giriş yapmanız gerekiyor.' } };

    const { data: prof } = await supabase
      .from('momora_profiles')
      .select('display_name, role')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    const { data, error } = await supabase.from('momora_community_comments').insert({
      post_id: postId,
      user_id: userData.user.id,
      author_name: prof?.display_name || 'Anne Adayı',
      author_role: prof?.role || 'mother',
      body,
    }).select().single();

    if (error) return { error };
    return { ok: true, data };
  } catch (err) {
    return { error: err };
  }
}

export async function fetchCommunityCommentsCloud(postId) {
  if (!supabase) return { data: [] };
  try {
    const { data, error } = await supabase
      .from('momora_community_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) return { data: [], error };
    return { data: data || [] };
  } catch (err) {
    return { data: [], error: err };
  }
}

// ─── 10. GENEL İZLEME OLAYLARI (FALLBACK LOGGING) ──────────────────────────────

export async function saveTrackingEvent(eventType, payload = {}, occurredAt = new Date().toISOString()) {
  if (!supabase) return { skipped: true };
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return { skipped: true };

    const { error } = await supabase.from('momora_tracking_events').insert({
      user_id: userData.user.id,
      event_type: eventType,
      occurred_at: occurredAt,
      payload,
    });
    if (error) return { error };
    return { ok: true };
  } catch (err) {
    return { error: err };
  }
}
