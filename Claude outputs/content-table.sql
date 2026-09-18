-- Content management table for homepage and page content
-- This is a singleton table (should have only one row)
CREATE TABLE IF NOT EXISTS content (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),

  -- Homepage hero section (bilingual)
  homepage_hero_title_fa TEXT DEFAULT 'دیدار',
  homepage_hero_subtitle_fa TEXT DEFAULT 'انجمن فرهنگی دانشجویی',
  homepage_hero_title_de TEXT DEFAULT 'Didar',
  homepage_hero_subtitle_de TEXT DEFAULT 'Iranische Kulturgemeinschaft',

  -- About section (bilingual)
  about_intro_fa TEXT DEFAULT '',
  about_intro_de TEXT DEFAULT ''
);

-- Enable RLS
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Public can only read published content
CREATE POLICY "public_read_content" ON content
  FOR SELECT
  USING (true);

-- Block all public writes
CREATE POLICY "block_public_insert_content" ON content
  TO anon
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "block_public_update_content" ON content
  TO anon
  FOR UPDATE
  USING (false);

CREATE POLICY "block_public_delete_content" ON content
  TO anon
  FOR DELETE
  USING (false);

-- Insert initial content row
INSERT INTO content (homepage_hero_title_fa, homepage_hero_subtitle_fa, homepage_hero_title_de, homepage_hero_subtitle_de)
VALUES ('دیدار', 'انجمن فرهنگی دانشجویی', 'Didar', 'Iranische Kulturgemeinschaft')
ON CONFLICT DO NOTHING;
