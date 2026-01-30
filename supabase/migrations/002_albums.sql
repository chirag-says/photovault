-- ===========================================
-- PHOTOVAULT - Albums Database Migration
-- ===========================================
-- Run this in Supabase SQL Editor

-- Albums table
CREATE TABLE IF NOT EXISTS albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    cover_image_id UUID REFERENCES images(id) ON DELETE SET NULL,
    visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
    access_code TEXT,
    image_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Album images junction table
CREATE TABLE IF NOT EXISTS album_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
    image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(album_id, image_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_albums_user_id ON albums(user_id);
CREATE INDEX IF NOT EXISTS idx_albums_visibility ON albums(visibility);
CREATE INDEX IF NOT EXISTS idx_albums_access_code ON albums(access_code);
CREATE INDEX IF NOT EXISTS idx_album_images_album_id ON album_images(album_id);
CREATE INDEX IF NOT EXISTS idx_album_images_image_id ON album_images(image_id);

-- Function to update image_count (prevents negative counts)
CREATE OR REPLACE FUNCTION update_album_image_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE albums SET image_count = image_count + 1, updated_at = NOW()
        WHERE id = NEW.album_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Use GREATEST to prevent negative counts
        UPDATE albums SET image_count = GREATEST(0, image_count - 1), updated_at = NOW()
        WHERE id = OLD.album_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating image_count
DROP TRIGGER IF EXISTS trigger_album_image_count ON album_images;
CREATE TRIGGER trigger_album_image_count
AFTER INSERT OR DELETE ON album_images
FOR EACH ROW EXECUTE FUNCTION update_album_image_count();

-- Row Level Security for albums
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for albums
-- Users can view their own albums
CREATE POLICY "Users can view own albums" ON albums
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can view public albums
CREATE POLICY "Anyone can view public albums" ON albums
    FOR SELECT USING (visibility = 'public');

-- Users can insert their own albums
CREATE POLICY "Users can create albums" ON albums
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own albums
CREATE POLICY "Users can update own albums" ON albums
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Users can delete their own albums
CREATE POLICY "Users can delete own albums" ON albums
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- RLS Policies for album_images
CREATE POLICY "Users can manage album images" ON album_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM albums WHERE albums.id = album_images.album_id
            AND albums.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Anyone can view public album images" ON album_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM albums WHERE albums.id = album_images.album_id
            AND albums.visibility = 'public'
        )
    );

-- ===========================================
-- NOTE ON ROW LEVEL SECURITY
-- ===========================================
-- These RLS policies are defined for documentation purposes but are NOT active
-- because the application uses the Supabase Service Role Key, which bypasses RLS.
-- All authorization is handled at the application level in our API route handlers.
-- 
-- If you want to enable RLS-based security:
-- 1. Switch from getSupabaseAdmin() to using the anon key with user context
-- 2. The policies above would then be enforced by Supabase
