-- ============================================================
-- TVS SENSING SOLUTIONS — DATABASE SCHEMA & RLS POLICIES
-- ============================================================

-- 1. JOBS TABLE
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    department TEXT,
    location TEXT,
    experience TEXT,
    employment_type TEXT DEFAULT 'Full Time',
    description TEXT,
    responsibilities TEXT,
    requirements TEXT,
    qualification TEXT,
    skills TEXT,
    number_of_positions INTEGER DEFAULT 1,
    apply_email TEXT DEFAULT 'hrd@tvsss.co.in',
    closing_date DATE,
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- 2. MEDIA POSTS TABLE
CREATE TABLE IF NOT EXISTS public.media_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Exhibition',
    publish_date DATE DEFAULT CURRENT_DATE,
    featured_image TEXT,
    video_url TEXT,
    video_type TEXT CHECK (video_type IN ('youtube', 'vimeo', 'upload', 'none') OR video_type IS NULL),
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- 3. MEDIA IMAGES TABLE (Multiple Gallery Images)
CREATE TABLE IF NOT EXISTS public.media_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_post_id UUID NOT NULL REFERENCES public.media_posts(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR FAST QUERYING
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_published_at ON public.jobs(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_posts_status ON public.media_posts(status);
CREATE INDEX IF NOT EXISTS idx_media_posts_published_at ON public.media_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_images_post_id ON public.media_images(media_post_id, sort_order);

-- UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_jobs_updated_at ON public.jobs;
CREATE TRIGGER set_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS set_media_posts_updated_at ON public.media_posts;
CREATE TRIGGER set_media_posts_updated_at
BEFORE UPDATE ON public.media_posts
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_images ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- POLICIES FOR 'jobs'
-- ------------------------------------------------------------
-- Public read access ONLY for Published jobs
CREATE POLICY "Public can view published jobs"
ON public.jobs FOR SELECT
USING (status = 'Published' OR auth.role() = 'authenticated');

-- Authenticated admins have full write access
CREATE POLICY "Admins can insert jobs"
ON public.jobs FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update jobs"
ON public.jobs FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete jobs"
ON public.jobs FOR DELETE
USING (auth.role() = 'authenticated');


-- ------------------------------------------------------------
-- POLICIES FOR 'media_posts'
-- ------------------------------------------------------------
-- Public read access ONLY for Published media posts
CREATE POLICY "Public can view published media posts"
ON public.media_posts FOR SELECT
USING (status = 'Published' OR auth.role() = 'authenticated');

-- Authenticated admins have full write access
CREATE POLICY "Admins can insert media posts"
ON public.media_posts FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update media posts"
ON public.media_posts FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete media posts"
ON public.media_posts FOR DELETE
USING (auth.role() = 'authenticated');


-- ------------------------------------------------------------
-- POLICIES FOR 'media_images'
-- ------------------------------------------------------------
-- Public can view images if parent post is published or auth admin
CREATE POLICY "Public can view gallery images"
ON public.media_images FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.media_posts
        WHERE public.media_posts.id = public.media_images.media_post_id
        AND (public.media_posts.status = 'Published' OR auth.role() = 'authenticated')
    )
);

CREATE POLICY "Admins can insert media images"
ON public.media_images FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update media images"
ON public.media_images FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete media images"
ON public.media_images FOR DELETE
USING (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE BUCKETS SETUP (Execute in Supabase SQL Editor or Storage tab)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('tvsss-media', 'tvsss-media', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('tvsss-jobs', 'tvsss-jobs', true) ON CONFLICT DO NOTHING;

-- Storage RLS Policies:
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('tvsss-media', 'tvsss-jobs'));
-- CREATE POLICY "Admin Upload Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('tvsss-media', 'tvsss-jobs') AND auth.role() = 'authenticated');
-- CREATE POLICY "Admin Update Access" ON storage.objects FOR UPDATE USING (bucket_id IN ('tvsss-media', 'tvsss-jobs') AND auth.role() = 'authenticated');
-- CREATE POLICY "Admin Delete Access" ON storage.objects FOR DELETE USING (bucket_id IN ('tvsss-media', 'tvsss-jobs') AND auth.role() = 'authenticated');
