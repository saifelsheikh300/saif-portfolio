-- ============================================================
-- SAIF EL SHEIKH PORTFOLIO — COMPLETE SUPABASE DATABASE SCHEMA
-- Combines Parts 1 to 5 (Core, RLS, Seed, Profiles Trigger, Bilingual)
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS
-- ============================================================

-- 1) CATEGORIES TABLE ------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT,
  slug TEXT NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) PROJECTS TABLE --------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_en TEXT,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  description_en TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  video_url TEXT,          -- Cloudflare R2 / Stream / YouTube URL
  thumbnail_url TEXT,      -- Cloudflare R2 / Thumbnail URL
  software TEXT[],         -- e.g. {"Premiere Pro","After Effects"}
  client TEXT,
  year INT DEFAULT 2024,
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_published ON public.projects(published);

-- 3) SITE SETTINGS (KEY/VALUE, JSONB) --------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) THEME SETTINGS (COLORS) -----------------------------------
CREATE TABLE IF NOT EXISTS public.theme_settings (
  mode TEXT PRIMARY KEY CHECK (mode IN ('dark','light')),
  background TEXT NOT NULL,
  accent TEXT NOT NULL,
  card TEXT NOT NULL,
  text_color TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5) PROFILES (ADMIN AUTH LINK) --------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_settings_updated_at ON public.site_settings;
CREATE TRIGGER trg_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_theme_updated_at ON public.theme_settings;
CREATE TRIGGER trg_theme_updated_at
  BEFORE UPDATE ON public.theme_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-insert into profiles whenever a new auth user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- CATEGORIES RLS
DROP POLICY IF EXISTS "public read categories" ON public.categories;
CREATE POLICY "public read categories"
  ON public.categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "admin write categories" ON public.categories;
CREATE POLICY "admin write categories"
  ON public.categories FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- PROJECTS RLS
DROP POLICY IF EXISTS "public read published projects" ON public.projects;
CREATE POLICY "public read published projects"
  ON public.projects FOR SELECT
  USING (published = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "admin write projects" ON public.projects;
CREATE POLICY "admin write projects"
  ON public.projects FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- SITE SETTINGS RLS
DROP POLICY IF EXISTS "public read settings" ON public.site_settings;
CREATE POLICY "public read settings"
  ON public.site_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "admin write settings" ON public.site_settings;
CREATE POLICY "admin write settings"
  ON public.site_settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- THEME SETTINGS RLS
DROP POLICY IF EXISTS "public read theme" ON public.theme_settings;
CREATE POLICY "public read theme"
  ON public.theme_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "admin write theme" ON public.theme_settings;
CREATE POLICY "admin write theme"
  ON public.theme_settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- PROFILES RLS
DROP POLICY IF EXISTS "authenticated read profiles" ON public.profiles;
CREATE POLICY "authenticated read profiles"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "authenticated update own profile" ON public.profiles;
CREATE POLICY "authenticated update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- SEED DATA (DEFAULT BRAND & BILINGUAL CONTENT)
-- ============================================================

-- 1) THEME SETTINGS
INSERT INTO public.theme_settings (mode, background, accent, card, text_color)
VALUES
  ('dark',  '#0A0F2C', '#00C6FF', '#111827', '#FFFFFF'),
  ('light', '#F0F9FF', '#0077B6', '#FFFFFF', '#0A0F2C')
ON CONFLICT (mode) DO UPDATE SET
  background = excluded.background,
  accent = excluded.accent,
  card = excluded.card,
  text_color = excluded.text_color;

-- 2) SITE SETTINGS (BILINGUAL)
INSERT INTO public.site_settings (key, value) VALUES
  ('hero', jsonb_build_object(
    'ar', jsonb_build_object('title', 'سيف الشيخ', 'subtitle', 'فيديو إيديتور · موشن ديزاينر'),
    'en', jsonb_build_object('title', 'Saif El Sheikh', 'subtitle', 'Video Editor · Motion Designer'),
    'showreel_video_url', ''
  )),
  ('about', jsonb_build_object(
    'ar', jsonb_build_object('text', 'أنا سيف، فيديو إيديتور متخصص في تحويل الفيديوهات الخام والفويس أوفر لمحتوى احترافي يشد المشاهد ويخليه يكمل الفيديو للآخر. بشتغل بـ Adobe Premiere Pro و After Effects وبقدر أعمل مونتاج ريلز وشورتس وتيك توك، فيديوهات يوتيوب كاملة، فيديوهات إعلانية وترويجية، موشن جرافيك وأنيميشن نصوص، وتصحيح ألوان.'),
    'en', jsonb_build_object('text', 'I am Saif, a video editor specialized in transforming raw footage and voice-overs into professional content that grabs attention and keeps viewers watching until the end. I work with Adobe Premiere Pro & After Effects delivering Reels, YouTube videos, promotional content, motion graphics, and color grading.')
  )),
  ('contact', jsonb_build_object(
    'email', 'saifelsheikh330@gmail.com',
    'whatsapp', '201125655690'
  )),
  ('social_links', jsonb_build_object(
    'instagram', 'https://instagram.com',
    'behance', 'https://behance.net',
    'youtube', 'https://youtube.com',
    'tiktok', 'https://tiktok.com',
    'facebook', 'https://facebook.com',
    'whatsapp', 'https://wa.me/201125655690'
  )),
  ('seo', jsonb_build_object(
    'ar', jsonb_build_object('title', 'سيف الشيخ — مونتير فيديو ومصمم موشن جرافيك', 'description', 'بورتفوليو أعمال المونتاج والموشن جرافيك'),
    'en', jsonb_build_object('title', 'Saif El Sheikh — Video Editor & Motion Designer', 'description', 'Portfolio of video editing and motion design work.')
  )),
  ('profile', jsonb_build_object(
    'dob', '2009',
    'profile_photo', ''
  ))
ON CONFLICT (key) DO UPDATE SET value = excluded.value;

-- 3) CATEGORIES
INSERT INTO public.categories (name, name_en, slug, sort_order) VALUES
  ('ريلز', 'Reels', 'reels', 1),
  ('عقاري', 'Real Estate', 'real-estate', 2),
  ('جيم', 'Gym', 'gym', 3),
  ('يوتيوب', 'YouTube', 'youtube', 4),
  ('إعلانات', 'Commercial', 'commercial', 5),
  ('موشن جرافيك', 'Motion Graphics', 'motion-graphics', 6)
ON CONFLICT (slug) DO NOTHING;
