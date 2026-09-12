-- ==============================================================================
-- Momora Mobile App Database Schema
-- Project: fpcovwexojrauddbszab
-- Fully compliant with Supabase Postgres Best Practices & RLS Security
-- ==============================================================================

-- 1. Helper function for updated_at timestamps
CREATE OR REPLACE FUNCTION public.momora_handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.momora_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'mother' CHECK (role IN ('mother', 'father')),
  display_name TEXT,
  partner_name TEXT,
  partner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  family_code TEXT UNIQUE,
  journey_mode TEXT DEFAULT 'pregnancy',
  due_date DATE,
  pregnancy_week INTEGER DEFAULT 4,
  baby_name TEXT,
  baby_gender TEXT,
  blood_type TEXT,
  doctor TEXT,
  hospital TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{"remindWater": true, "remindVitamin": true, "remindLetter": true, "remindPartner": true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_momora_profiles_family_code ON public.momora_profiles(family_code);
CREATE INDEX IF NOT EXISTS idx_momora_profiles_partner_id ON public.momora_profiles(partner_id);

ALTER TABLE public.momora_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by owner and partner"
ON public.momora_profiles FOR SELECT
TO authenticated
USING (
  (SELECT auth.uid()) = user_id OR
  (SELECT auth.uid()) = partner_id OR
  (family_code IS NOT NULL AND family_code = (SELECT p.family_code FROM public.momora_profiles p WHERE p.user_id = (SELECT auth.uid())))
);

CREATE POLICY "Profiles can be inserted by owner"
ON public.momora_profiles FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Profiles can be updated by owner"
ON public.momora_profiles FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP TRIGGER IF EXISTS set_momora_profiles_updated_at ON public.momora_profiles;
CREATE TRIGGER set_momora_profiles_updated_at
BEFORE UPDATE ON public.momora_profiles
FOR EACH ROW EXECUTE FUNCTION public.momora_handle_updated_at();

-- 3. Family Pairing & Sync Table
CREATE TABLE IF NOT EXISTS public.momora_family_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  mother_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  father_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'connected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_momora_family_sync_code ON public.momora_family_sync(code);
CREATE INDEX IF NOT EXISTS idx_momora_family_sync_mother ON public.momora_family_sync(mother_user_id);
CREATE INDEX IF NOT EXISTS idx_momora_family_sync_father ON public.momora_family_sync(father_user_id);

ALTER TABLE public.momora_family_sync ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family sync viewable by participants"
ON public.momora_family_sync FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = mother_user_id OR (SELECT auth.uid()) = father_user_id);

CREATE POLICY "Family sync can be inserted by authenticated"
ON public.momora_family_sync FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = mother_user_id OR (SELECT auth.uid()) = father_user_id);

CREATE POLICY "Family sync can be updated by participants"
ON public.momora_family_sync FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = mother_user_id OR (SELECT auth.uid()) = father_user_id)
WITH CHECK ((SELECT auth.uid()) = mother_user_id OR (SELECT auth.uid()) = father_user_id);

-- 4. Partner & Family Messages Table
CREATE TABLE IF NOT EXISTS public.momora_family_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_code TEXT NOT NULL,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role TEXT DEFAULT 'mother',
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_momora_family_messages_family ON public.momora_family_messages(family_code);
CREATE INDEX IF NOT EXISTS idx_momora_family_messages_sender ON public.momora_family_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_momora_family_messages_created ON public.momora_family_messages(created_at DESC);

ALTER TABLE public.momora_family_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family messages viewable by family members"
ON public.momora_family_messages FOR SELECT
TO authenticated
USING (
  family_code IN (
    SELECT p.family_code FROM public.momora_profiles p WHERE p.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Family messages insertable by authenticated sender"
ON public.momora_family_messages FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = sender_id);

-- 5. Tracking Events Log (Kicks, Contractions, Water, Weight, Vitamin, etc.)
CREATE TABLE IF NOT EXISTS public.momora_tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_code TEXT,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_momora_tracking_events_user ON public.momora_tracking_events(user_id);
CREATE INDEX IF NOT EXISTS idx_momora_tracking_events_family ON public.momora_tracking_events(family_code);
CREATE INDEX IF NOT EXISTS idx_momora_tracking_events_type ON public.momora_tracking_events(event_type);
CREATE INDEX IF NOT EXISTS idx_momora_tracking_events_occurred ON public.momora_tracking_events(occurred_at DESC);

ALTER TABLE public.momora_tracking_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tracking events viewable by user and family"
ON public.momora_tracking_events FOR SELECT
TO authenticated
USING (
  (SELECT auth.uid()) = user_id OR
  family_code IN (SELECT p.family_code FROM public.momora_profiles p WHERE p.user_id = (SELECT auth.uid()))
);

CREATE POLICY "Tracking events insertable by owner"
ON public.momora_tracking_events FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Tracking events updatable by owner"
ON public.momora_tracking_events FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 6. State Snapshots Table (Instant Cloud Backup of Full App State)
CREATE TABLE IF NOT EXISTS public.momora_state_snapshots (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  sync_version INTEGER NOT NULL DEFAULT 1,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.momora_state_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "State snapshot viewable by owner"
ON public.momora_state_snapshots FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "State snapshot insertable by owner"
ON public.momora_state_snapshots FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "State snapshot updatable by owner"
ON public.momora_state_snapshots FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 7. Community Posts Table
CREATE TABLE IF NOT EXISTS public.momora_community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_role TEXT DEFAULT 'mother',
  week_label TEXT,
  category TEXT NOT NULL DEFAULT 'Genel',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_momora_community_posts_category ON public.momora_community_posts(category);
CREATE INDEX IF NOT EXISTS idx_momora_community_posts_created ON public.momora_community_posts(created_at DESC);

ALTER TABLE public.momora_community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community posts are viewable by everyone"
ON public.momora_community_posts FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Community posts insertable by authenticated users"
ON public.momora_community_posts FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Community posts updatable by post owner"
ON public.momora_community_posts FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 8. Community Comments Table
CREATE TABLE IF NOT EXISTS public.momora_community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.momora_community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_role TEXT DEFAULT 'mother',
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_momora_community_comments_post ON public.momora_community_comments(post_id);

ALTER TABLE public.momora_community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community comments viewable by everyone"
ON public.momora_community_comments FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Community comments insertable by authenticated"
ON public.momora_community_comments FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 9. Favorite Baby Names Table
CREATE TABLE IF NOT EXISTS public.momora_baby_names_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name_key TEXT NOT NULL,
  name_text TEXT NOT NULL,
  gender TEXT,
  meaning TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_momora_user_fav_name UNIQUE (user_id, name_key)
);

CREATE INDEX IF NOT EXISTS idx_momora_baby_names_fav_user ON public.momora_baby_names_favorites(user_id);

ALTER TABLE public.momora_baby_names_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Baby name favorites viewable by owner"
ON public.momora_baby_names_favorites FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Baby name favorites insertable by owner"
ON public.momora_baby_names_favorites FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Baby name favorites deletable by owner"
ON public.momora_baby_names_favorites FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- 10. Automatically Create Profile on User Sign-Up
CREATE OR REPLACE FUNCTION public.momora_handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_family_code TEXT;
BEGIN
  -- Generate unique code like MOM-8492-TR
  new_family_code := 'MOM-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0') || '-TR';

  INSERT INTO public.momora_profiles (
    user_id,
    email,
    role,
    display_name,
    family_code
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'mother'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    new_family_code
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_momora_auth_user_created ON auth.users;
CREATE TRIGGER on_momora_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.momora_handle_new_user();

-- Grant permissions to authenticated & anon roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.momora_community_posts TO anon;
GRANT SELECT ON public.momora_community_comments TO anon;
