-- ==============================================================================
-- MOMORA FULL-STACK DATABASE SCHEMA (A-TO-Z BACKEND)
-- Project Ref: fpcovwexojrauddbszab
-- ==============================================================================

-- 1. EXTENSIONS & UTILITIES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Timestamp update trigger function
CREATE OR REPLACE FUNCTION public.momora_handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- 2. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.momora_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'mother' CHECK (role IN ('mother', 'father')),
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  journey_mode TEXT DEFAULT 'pregnancy' CHECK (journey_mode IN ('pregnancy', 'postpartum', 'baby')),
  partner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  partner_name TEXT,
  family_code TEXT UNIQUE,
  
  -- Gebelik & Bebek Bilgileri
  due_date DATE,
  conception_date DATE,
  pregnancy_week INTEGER DEFAULT 4,
  pregnancy_day INTEGER DEFAULT 0,
  baby_name TEXT DEFAULT 'Bebeğimiz',
  baby_gender TEXT DEFAULT 'Henüz Öğrenmedik',
  blood_type TEXT,
  doctor_name TEXT,
  hospital_name TEXT,
  birth_weight_kg NUMERIC(4,2),
  birth_date DATE,
  
  -- Tercihler & Hatırlatıcılar
  preferences JSONB DEFAULT '{
    "remindWater": true,
    "remindVitamin": true,
    "remindLetter": true,
    "remindPartner": true,
    "waterTargetGlasses": 8,
    "quietHoursStart": "22:00",
    "quietHoursEnd": "08:00"
  }'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_momora_profiles_family_code ON public.momora_profiles(family_code);
CREATE INDEX IF NOT EXISTS idx_momora_profiles_partner_id ON public.momora_profiles(partner_id);

ALTER TABLE public.momora_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles viewable by owner and partner" ON public.momora_profiles;
CREATE POLICY "Profiles viewable by owner and partner"
ON public.momora_profiles FOR SELECT
TO authenticated
USING (
  (SELECT auth.uid()) = user_id OR
  (SELECT auth.uid()) = partner_id OR
  (family_code IS NOT NULL AND family_code = (SELECT p.family_code FROM public.momora_profiles p WHERE p.user_id = (SELECT auth.uid())))
);

DROP POLICY IF EXISTS "Profiles insertable by owner" ON public.momora_profiles;
CREATE POLICY "Profiles insertable by owner"
ON public.momora_profiles FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Profiles updatable by owner" ON public.momora_profiles;
CREATE POLICY "Profiles updatable by owner"
ON public.momora_profiles FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP TRIGGER IF EXISTS tr_momora_profiles_updated_at ON public.momora_profiles;
CREATE TRIGGER tr_momora_profiles_updated_at
BEFORE UPDATE ON public.momora_profiles
FOR EACH ROW EXECUTE FUNCTION public.momora_handle_updated_at();

-- 3. PARTNER LINKING FUNCTION (ATOMIC CO-PARENT SYNC)
CREATE OR REPLACE FUNCTION public.momora_link_partner(code_to_link TEXT)
RETURNS JSONB AS $$
DECLARE
  caller_id UUID;
  caller_prof RECORD;
  target_prof RECORD;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Kullanıcı oturumu bulunamadı.';
  END IF;

  SELECT * INTO caller_prof FROM public.momora_profiles WHERE user_id = caller_id;
  IF caller_prof IS NULL THEN
    RAISE EXCEPTION 'Kendi profiliniz bulunamadı.';
  END IF;

  SELECT * INTO target_prof FROM public.momora_profiles 
  WHERE UPPER(TRIM(family_code)) = UPPER(TRIM(code_to_link))
    AND user_id != caller_id;

  IF target_prof IS NULL THEN
    RAISE EXCEPTION 'Bu koda ait eşleşecek kullanıcı bulunamadı.';
  END IF;

  -- Her iki hesabı birbirine bağla ve gebelik bilgilerini senkronize et
  UPDATE public.momora_profiles
  SET 
    partner_id = target_prof.user_id,
    partner_name = target_prof.display_name,
    family_code = target_prof.family_code,
    due_date = COALESCE(due_date, target_prof.due_date),
    pregnancy_week = COALESCE(pregnancy_week, target_prof.pregnancy_week),
    baby_name = COALESCE(target_prof.baby_name, baby_name),
    baby_gender = COALESCE(target_prof.baby_gender, baby_gender)
  WHERE user_id = caller_id;

  UPDATE public.momora_profiles
  SET 
    partner_id = caller_id,
    partner_name = caller_prof.display_name
  WHERE user_id = target_prof.user_id;

  -- Aile eşleşme tablosunu güncelle
  INSERT INTO public.momora_family_sync (code, mother_user_id, father_user_id, status, synced_at)
  VALUES (
    target_prof.family_code,
    CASE WHEN caller_prof.role = 'mother' THEN caller_id ELSE target_prof.user_id END,
    CASE WHEN caller_prof.role = 'father' THEN caller_id ELSE target_prof.user_id END,
    'connected',
    NOW()
  )
  ON CONFLICT (code) DO UPDATE
  SET 
    mother_user_id = EXCLUDED.mother_user_id,
    father_user_id = EXCLUDED.father_user_id,
    status = 'connected',
    synced_at = NOW();

  RETURN jsonb_build_object(
    'success', true,
    'partner_name', target_prof.display_name,
    'family_code', target_prof.family_code,
    'due_date', target_prof.due_date,
    'baby_name', target_prof.baby_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. PARTNER & FAMILY MESSAGES
CREATE TABLE IF NOT EXISTS public.momora_family_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_code TEXT NOT NULL,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role TEXT DEFAULT 'mother',
  sender_name TEXT,
  body TEXT NOT NULL,
  mood_tag TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_momora_messages_family ON public.momora_family_messages(family_code);
CREATE INDEX IF NOT EXISTS idx_momora_messages_created ON public.momora_family_messages(created_at DESC);

ALTER TABLE public.momora_family_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Family messages viewable by family" ON public.momora_family_messages;
CREATE POLICY "Family messages viewable by family"
ON public.momora_family_messages FOR SELECT
TO authenticated
USING (
  family_code IN (SELECT p.family_code FROM public.momora_profiles p WHERE p.user_id = (SELECT auth.uid()))
);

DROP POLICY IF EXISTS "Family messages insertable by member" ON public.momora_family_messages;
CREATE POLICY "Family messages insertable by member"
ON public.momora_family_messages FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = sender_id);

-- 5. DAILY HEALTH, MOOD & SYMPTOM LOGS
CREATE TABLE IF NOT EXISTS public.momora_daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_code TEXT,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood_index INTEGER CHECK (mood_index >= 0 AND mood_index <= 4),
  mood_label TEXT,
  symptoms TEXT[] DEFAULT '{}',
  water_glasses INTEGER DEFAULT 0,
  water_ml INTEGER DEFAULT 0,
  vitamin_taken BOOLEAN DEFAULT FALSE,
  weight_kg NUMERIC(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_momora_user_daily_log UNIQUE(user_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_momora_daily_logs_user_date ON public.momora_daily_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_momora_daily_logs_family ON public.momora_daily_logs(family_code);

ALTER TABLE public.momora_daily_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Daily logs viewable by family" ON public.momora_daily_logs;
CREATE POLICY "Daily logs viewable by family"
ON public.momora_daily_logs FOR SELECT
TO authenticated
USING (
  (SELECT auth.uid()) = user_id OR
  family_code IN (SELECT p.family_code FROM public.momora_profiles p WHERE p.user_id = (SELECT auth.uid()))
);

DROP POLICY IF EXISTS "Daily logs insertable by owner" ON public.momora_daily_logs;
CREATE POLICY "Daily logs insertable by owner"
ON public.momora_daily_logs FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Daily logs updatable by owner" ON public.momora_daily_logs;
CREATE POLICY "Daily logs updatable by owner"
ON public.momora_daily_logs FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 6. KICK COUNTER SESSIONS
CREATE TABLE IF NOT EXISTS public.momora_kick_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_code TEXT,
  pregnancy_week INTEGER,
  kick_count INTEGER NOT NULL DEFAULT 10,
  duration_seconds INTEGER NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_momora_kick_sessions_user ON public.momora_kick_sessions(user_id, started_at DESC);
ALTER TABLE public.momora_kick_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Kick sessions viewable by family" ON public.momora_kick_sessions;
CREATE POLICY "Kick sessions viewable by family"
ON public.momora_kick_sessions FOR SELECT
TO authenticated
USING (
  (SELECT auth.uid()) = user_id OR
  family_code IN (SELECT p.family_code FROM public.momora_profiles p WHERE p.user_id = (SELECT auth.uid()))
);

DROP POLICY IF EXISTS "Kick sessions insertable by owner" ON public.momora_kick_sessions;
CREATE POLICY "Kick sessions insertable by owner"
ON public.momora_kick_sessions FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 7. CONTRACTION TIMER SESSIONS
CREATE TABLE IF NOT EXISTS public.momora_contraction_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_code TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  duration_seconds INTEGER NOT NULL,
  interval_seconds INTEGER,
  intensity TEXT DEFAULT 'Orta' CHECK (intensity IN ('Hafif', 'Orta', 'Şiddetli')),
  status_alert TEXT DEFAULT 'normal',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_momora_contractions_user ON public.momora_contraction_sessions(user_id, started_at DESC);
ALTER TABLE public.momora_contraction_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Contraction sessions viewable by family" ON public.momora_contraction_sessions;
CREATE POLICY "Contraction sessions viewable by family"
ON public.momora_contraction_sessions FOR SELECT
TO authenticated
USING (
  (SELECT auth.uid()) = user_id OR
  family_code IN (SELECT p.family_code FROM public.momora_profiles p WHERE p.user_id = (SELECT auth.uid()))
);

DROP POLICY IF EXISTS "Contraction sessions insertable by owner" ON public.momora_contraction_sessions;
CREATE POLICY "Contraction sessions insertable by owner"
ON public.momora_contraction_sessions FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 8. WEIGHT TRACKING SESSIONS
CREATE TABLE IF NOT EXISTS public.momora_weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_code TEXT,
  pregnancy_week INTEGER,
  weight_kg NUMERIC(5,2) NOT NULL,
  bmi NUMERIC(4,1),
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_momora_weight_logs_user ON public.momora_weight_logs(user_id, logged_date DESC);
ALTER TABLE public.momora_weight_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Weight logs viewable by family" ON public.momora_weight_logs;
CREATE POLICY "Weight logs viewable by family"
ON public.momora_weight_logs FOR SELECT
TO authenticated
USING (
  (SELECT auth.uid()) = user_id OR
  family_code IN (SELECT p.family_code FROM public.momora_profiles p WHERE p.user_id = (SELECT auth.uid()))
);

DROP POLICY IF EXISTS "Weight logs insertable by owner" ON public.momora_weight_logs;
CREATE POLICY "Weight logs insertable by owner"
ON public.momora_weight_logs FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 9. HOSPITAL BAG CHECKLIST
CREATE TABLE IF NOT EXISTS public.momora_hospital_bag_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_code TEXT,
  category TEXT NOT NULL CHECK (category IN ('mother', 'baby', 'partner', 'docs')),
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  is_packed BOOLEAN NOT NULL DEFAULT FALSE,
  is_custom BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_momora_bag_user ON public.momora_hospital_bag_items(user_id);
ALTER TABLE public.momora_hospital_bag_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Hospital bag viewable by family" ON public.momora_hospital_bag_items;
CREATE POLICY "Hospital bag viewable by family"
ON public.momora_hospital_bag_items FOR SELECT
TO authenticated
USING (
  (SELECT auth.uid()) = user_id OR
  family_code IN (SELECT p.family_code FROM public.momora_profiles p WHERE p.user_id = (SELECT auth.uid()))
);

DROP POLICY IF EXISTS "Hospital bag insertable by family" ON public.momora_hospital_bag_items;
CREATE POLICY "Hospital bag insertable by family"
ON public.momora_hospital_bag_items FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Hospital bag updatable by family" ON public.momora_hospital_bag_items;
CREATE POLICY "Hospital bag updatable by family"
ON public.momora_hospital_bag_items FOR UPDATE
TO authenticated
USING (
  (SELECT auth.uid()) = user_id OR
  family_code IN (SELECT p.family_code FROM public.momora_profiles p WHERE p.user_id = (SELECT auth.uid()))
);

-- 10. DOCTOR APPOINTMENTS & QUESTIONS
CREATE TABLE IF NOT EXISTS public.momora_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_code TEXT,
  title TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME,
  doctor_name TEXT,
  hospital_name TEXT,
  pregnancy_week INTEGER,
  notes TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_momora_appointments_user ON public.momora_appointments(user_id, appointment_date);
ALTER TABLE public.momora_appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Appointments viewable by family" ON public.momora_appointments;
CREATE POLICY "Appointments viewable by family"
ON public.momora_appointments FOR SELECT
TO authenticated
USING (
  (SELECT auth.uid()) = user_id OR
  family_code IN (SELECT p.family_code FROM public.momora_profiles p WHERE p.user_id = (SELECT auth.uid()))
);

DROP POLICY IF EXISTS "Appointments insertable by owner" ON public.momora_appointments;
CREATE POLICY "Appointments insertable by owner"
ON public.momora_appointments FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Appointments updatable by owner" ON public.momora_appointments;
CREATE POLICY "Appointments updatable by owner"
ON public.momora_appointments FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 11. BABY LETTERS & TIME CAPSULE
CREATE TABLE IF NOT EXISTS public.momora_baby_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_code TEXT,
  author_name TEXT NOT NULL,
  author_role TEXT DEFAULT 'mother',
  title TEXT,
  body TEXT NOT NULL,
  photo_url TEXT,
  audio_url TEXT,
  unlock_date DATE,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_momora_letters_user ON public.momora_baby_letters(user_id, created_at DESC);
ALTER TABLE public.momora_baby_letters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Letters viewable by family" ON public.momora_baby_letters;
CREATE POLICY "Letters viewable by family"
ON public.momora_baby_letters FOR SELECT
TO authenticated
USING (
  (SELECT auth.uid()) = user_id OR
  family_code IN (SELECT p.family_code FROM public.momora_profiles p WHERE p.user_id = (SELECT auth.uid()))
);

DROP POLICY IF EXISTS "Letters insertable by family" ON public.momora_baby_letters;
CREATE POLICY "Letters insertable by family"
ON public.momora_baby_letters FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 12. NEWBORN TRACKING (NURSING, DIAPERS, SLEEP)
CREATE TABLE IF NOT EXISTS public.momora_newborn_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_code TEXT,
  log_type TEXT NOT NULL CHECK (log_type IN ('nursing', 'bottle', 'diaper', 'sleep', 'tummy_time')),
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  amount_ml INTEGER,
  sub_type TEXT, -- 'left_breast', 'right_breast', 'formula', 'wet', 'dirty', 'both'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_momora_newborn_logs_user ON public.momora_newborn_logs(user_id, start_time DESC);
ALTER TABLE public.momora_newborn_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Newborn logs viewable by family" ON public.momora_newborn_logs;
CREATE POLICY "Newborn logs viewable by family"
ON public.momora_newborn_logs FOR SELECT
TO authenticated
USING (
  (SELECT auth.uid()) = user_id OR
  family_code IN (SELECT p.family_code FROM public.momora_profiles p WHERE p.user_id = (SELECT auth.uid()))
);

DROP POLICY IF EXISTS "Newborn logs insertable by family" ON public.momora_newborn_logs;
CREATE POLICY "Newborn logs insertable by family"
ON public.momora_newborn_logs FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 13. COMMUNITY FORUM (TRIGGERS FOR LIKE & COMMENT COUNTS)
CREATE OR REPLACE FUNCTION public.momora_update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.momora_community_posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.momora_community_posts
    SET comments_count = GREATEST(0, comments_count - 1)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_momora_comment_count ON public.momora_community_comments;
CREATE TRIGGER tr_momora_comment_count
AFTER INSERT OR DELETE ON public.momora_community_comments
FOR EACH ROW EXECUTE FUNCTION public.momora_update_post_comment_count();

-- Grant permissions to public API
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT EXECUTE ON FUNCTION public.momora_link_partner(TEXT) TO authenticated;
