-- Bridging app schema (isolated from other products on the same Supabase project).
-- Point WeWeb Supabase integration / PostgREST at schema bridging via exposed schemas in API settings.

CREATE SCHEMA IF NOT EXISTS bridging;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles & legacy proof list
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS bridging.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  full_name text,
  school text,
  level text DEFAULT 'Sec 4',
  exam_track text DEFAULT 'E-Math only',
  avatar_url text,
  preferred_difficulty text DEFAULT 'Mixed',
  priority_topics jsonb DEFAULT '[]'::jsonb,
  daily_question_goal double precision DEFAULT 10,
  past_exam_results text,
  preferred_learning_path text,
  notification_daily_reminder boolean NOT NULL DEFAULT true,
  notification_streak_alert boolean NOT NULL DEFAULT true,
  notification_weekly_summary boolean NOT NULL DEFAULT true,
  notification_announcements boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bridging.legacy_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  display_name text,
  weweb_user_id uuid,
  weweb_created_at timestamptz,
  source text NOT NULL DEFAULT 'weweb',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email, source)
);

-- ---------------------------------------------------------------------------
-- Content
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS bridging.topics (
  id uuid PRIMARY KEY,
  code text UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  description text,
  question_count double precision NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bridging.notes (
  id uuid PRIMARY KEY,
  topic_id uuid NOT NULL REFERENCES bridging.topics (id) ON DELETE CASCADE,
  subtopic_name text NOT NULL,
  summary text,
  key_concepts jsonb,
  formulas jsonb,
  worked_examples jsonb,
  common_mistakes jsonb,
  exam_tips jsonb,
  related_topic_codes jsonb,
  order_index double precision,
  level_band text[],
  recommended_levels text[],
  curriculum_stage text DEFAULT 'O-Level',
  strand text,
  estimated_minutes double precision,
  revision_status text DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bridging.note_prerequisites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid REFERENCES bridging.notes (id) ON DELETE CASCADE,
  prerequisite_note_id uuid REFERENCES bridging.notes (id) ON DELETE CASCADE,
  order_index double precision,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (note_id IS DISTINCT FROM prerequisite_note_id)
);

CREATE TABLE IF NOT EXISTS bridging.questions (
  id uuid PRIMARY KEY,
  topic_id uuid NOT NULL REFERENCES bridging.topics (id) ON DELETE CASCADE,
  prompt text NOT NULL,
  model_answer text NOT NULL,
  explanation text NOT NULL,
  difficulty text NOT NULL,
  metadata jsonb,
  diagram_path text,
  question_type text,
  answer_tolerance double precision,
  accepted_answers text[],
  case_sensitive boolean,
  require_simplified_form boolean,
  require_units boolean,
  required_unit text,
  accepted_units text[],
  marking_notes text,
  syntax_migration_status text,
  syntax_migration_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- User data (fresh start on Supabase Auth)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS bridging.attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES bridging.questions (id) ON DELETE CASCADE,
  student_answer text,
  normalized_submitted_answer text,
  is_correct boolean NOT NULL,
  status text,
  marking_method text,
  attempt_number double precision,
  time_spent_seconds double precision,
  ai_analysis text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bridging.mock_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title text NOT NULL,
  topic_ids jsonb DEFAULT '[]'::jsonb,
  question_ids jsonb DEFAULT '[]'::jsonb,
  total_questions double precision NOT NULL DEFAULT 0,
  correct_count double precision NOT NULL DEFAULT 0,
  score_percent double precision NOT NULL DEFAULT 0,
  results jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bridging.user_note_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  note_id uuid NOT NULL REFERENCES bridging.notes (id) ON DELETE CASCADE,
  status text,
  last_viewed_at timestamptz,
  reviewed_at timestamptz,
  time_spent_seconds double precision,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, note_id)
);

CREATE TABLE IF NOT EXISTS bridging.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  page_path text NOT NULL,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer_host text,
  device_type text,
  browser_language text,
  topic_id uuid REFERENCES bridging.topics (id) ON DELETE SET NULL,
  note_id uuid REFERENCES bridging.notes (id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION bridging.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = bridging
AS $$
  SELECT EXISTS (
    SELECT 1 FROM bridging.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION bridging.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = bridging
AS $$
BEGIN
  INSERT INTO bridging.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_bridging ON auth.users;
CREATE TRIGGER on_auth_user_created_bridging
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION bridging.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

ALTER TABLE bridging.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bridging.legacy_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bridging.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE bridging.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bridging.note_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE bridging.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bridging.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bridging.mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bridging.user_note_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bridging.analytics_events ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY profiles_select_own ON bridging.profiles FOR SELECT USING (auth.uid() = id OR bridging.is_admin());
CREATE POLICY profiles_update_own ON bridging.profiles FOR UPDATE USING (auth.uid() = id OR bridging.is_admin());

-- Legacy users: admin only
CREATE POLICY legacy_users_admin ON bridging.legacy_users FOR ALL USING (bridging.is_admin());

-- Public syllabus reads
CREATE POLICY topics_public_read ON bridging.topics FOR SELECT USING (true);
CREATE POLICY notes_public_read ON bridging.notes FOR SELECT USING (
  revision_status IS NULL OR revision_status = 'published'
);
CREATE POLICY note_prerequisites_public_read ON bridging.note_prerequisites FOR SELECT USING (true);
CREATE POLICY questions_public_read ON bridging.questions FOR SELECT USING (true);

CREATE POLICY topics_admin_write ON bridging.topics FOR ALL USING (bridging.is_admin());
CREATE POLICY notes_admin_write ON bridging.notes FOR ALL USING (bridging.is_admin());
CREATE POLICY questions_admin_write ON bridging.questions FOR ALL USING (bridging.is_admin());

-- User-owned rows
CREATE POLICY attempts_own ON bridging.attempts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY mock_tests_own ON bridging.mock_tests FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY note_progress_own ON bridging.user_note_progress FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Analytics: anyone can insert; admin reads
CREATE POLICY analytics_insert ON bridging.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY analytics_admin_read ON bridging.analytics_events FOR SELECT USING (bridging.is_admin());

-- ---------------------------------------------------------------------------
-- Storage buckets (public diagrams, private avatars)
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('bridging-public', 'bridging-public', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  ('bridging-private', 'bridging-private', false, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY bridging_public_read ON storage.objects FOR SELECT
  USING (bucket_id = 'bridging-public');

CREATE POLICY bridging_public_admin_write ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'bridging-public' AND bridging.is_admin());

CREATE POLICY bridging_private_own ON storage.objects FOR ALL
  USING (bucket_id = 'bridging-private' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'bridging-private' AND auth.uid()::text = (storage.foldername(name))[1]);

GRANT USAGE ON SCHEMA bridging TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA bridging TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA bridging TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA bridging GRANT ALL ON TABLES TO anon, authenticated, service_role;
