import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { generateSlug } from '@/lib/slug'
import { pingBlogPublished } from '@/lib/indexnow'

// GET /api/blogs - List blogs
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all')
  const year = searchParams.get('year')

  // Admin: get all blogs (including drafts)
  if (all === 'true') {
    const password = req.headers.get('x-admin-password')
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { data, error } = await supabaseAdmin
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  }

  // Public: only published blogs
  let query = supabase
    .from('blogs')
    .select('id, slug, title, title_en, title_es, title_ar, title_de, title_fr, title_ru, cover_image_url, author_name, meta_description, meta_description_en, meta_description_es, meta_description_ar, meta_description_de, meta_description_fr, meta_description_ru, is_published, ai_generated, published_at, created_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (year) {
    query = query
      .gte('published_at', `${year}-01-01T00:00:00Z`)
      .lt('published_at', `${parseInt(year) + 1}-01-01T00:00:00Z`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  // max-age=0: browser her zaman yeniden kontrol eder (cache tutmaz)
  // s-maxage=300: Vercel CDN 5 dk cache — yeni blog max 5 dk sonra gorunur
  // stale-while-revalidate=600: eski cache'i bile 10 dk boyunca kullanip arka planda yeniden fetch
  // Yani Vercel origin'e hit gitme sikligi: dakikada max 1 defa (cok dusuk yük)
  return NextResponse.json(data || [], {
    headers: { 'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600' },
  })
}

// POST /api/blogs - Create new blog (admin only)
export async function POST(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { title, content, cover_image_url, author_name, meta_description, is_published, ai_generated } = body

  if (!title || !content) {
    return NextResponse.json({ error: 'title and content required' }, { status: 400 })
  }

  // Generate unique slug
  let slug = generateSlug(title)
  const { data: existing } = await supabaseAdmin
    .from('blogs')
    .select('slug')
    .eq('slug', slug)
    .limit(1)

  if (existing && existing.length > 0) {
    slug = `${slug}-${Date.now().toString(36)}`
  }

  const blogData: Record<string, unknown> = {
    slug,
    title,
    content,
    cover_image_url: cover_image_url || '',
    author_name: author_name || 'Cihan Zenger',
    meta_description: meta_description || '',
    is_published: is_published || false,
    ai_generated: ai_generated || false,
  }

  if (is_published) {
    blogData.published_at = new Date().toISOString()
  }

  const { data, error } = await supabaseAdmin
    .from('blogs')
    .insert(blogData)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // IndexNow — yeni blog yayinlandiysa Bing/Yandex'e bildir (fire-and-forget)
  if (is_published && data?.slug) {
    pingBlogPublished(data.slug).catch(() => {})
  }

  return NextResponse.json(data)
}
