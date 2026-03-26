import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error: createError } = await supabaseAdmin.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS blogs (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        slug text UNIQUE NOT NULL,
        title text NOT NULL,
        title_en text DEFAULT '', title_es text DEFAULT '', title_ar text DEFAULT '', title_de text DEFAULT '', title_fr text DEFAULT '', title_ru text DEFAULT '',
        content text NOT NULL,
        content_en text DEFAULT '', content_es text DEFAULT '', content_ar text DEFAULT '', content_de text DEFAULT '', content_fr text DEFAULT '', content_ru text DEFAULT '',
        cover_image_url text DEFAULT '',
        author_name text NOT NULL DEFAULT 'Cihan Zenger',
        meta_description text DEFAULT '',
        meta_description_en text DEFAULT '', meta_description_es text DEFAULT '', meta_description_ar text DEFAULT '', meta_description_de text DEFAULT '', meta_description_fr text DEFAULT '', meta_description_ru text DEFAULT '',
        is_published boolean DEFAULT false,
        ai_generated boolean DEFAULT false,
        published_at timestamptz,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );

      CREATE UNIQUE INDEX IF NOT EXISTS blogs_slug_idx ON blogs(slug);
      CREATE INDEX IF NOT EXISTS blogs_published_at_idx ON blogs(published_at DESC);

      ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'blogs_public_read') THEN
          CREATE POLICY blogs_public_read ON blogs FOR SELECT USING (is_published = true);
        END IF;
      END $$;
    `
  })

  if (createError) {
    const { data: existing } = await supabaseAdmin
      .from('blogs')
      .select('id')
      .limit(1)

    if (existing === null) {
      return NextResponse.json({
        error: 'Could not create table. Please run the SQL manually in Supabase dashboard.',
        sql_error: createError.message,
        manual_sql: getCreateTableSQL()
      }, { status: 500 })
    }

    return NextResponse.json({ message: 'Table already exists', count: existing.length })
  }

  return NextResponse.json({ message: 'Blogs table created successfully' })
}

function getCreateTableSQL() {
  return `
CREATE TABLE IF NOT EXISTS blogs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  title_en text DEFAULT '', title_es text DEFAULT '', title_ar text DEFAULT '', title_de text DEFAULT '', title_fr text DEFAULT '', title_ru text DEFAULT '',
  content text NOT NULL,
  content_en text DEFAULT '', content_es text DEFAULT '', content_ar text DEFAULT '', content_de text DEFAULT '', content_fr text DEFAULT '', content_ru text DEFAULT '',
  cover_image_url text DEFAULT '',
  author_name text NOT NULL DEFAULT 'Cihan Zenger',
  meta_description text DEFAULT '',
  meta_description_en text DEFAULT '', meta_description_es text DEFAULT '', meta_description_ar text DEFAULT '', meta_description_de text DEFAULT '', meta_description_fr text DEFAULT '', meta_description_ru text DEFAULT '',
  is_published boolean DEFAULT false,
  ai_generated boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS blogs_slug_idx ON blogs(slug);
CREATE INDEX IF NOT EXISTS blogs_published_at_idx ON blogs(published_at DESC);

ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY blogs_public_read ON blogs FOR SELECT USING (is_published = true);
`
}
