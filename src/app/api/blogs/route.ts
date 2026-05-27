import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { getUrlaklinkerSupabase } from '@/lib/urlaklinker-supabase'
import { generateSlug } from '@/lib/slug'
import { pingBlogPublished } from '@/lib/indexnow'

function resolveBrand(value: string | null | undefined): 'urlastone' | 'urlaklinker' {
  return value === 'urlaklinker' ? 'urlaklinker' : 'urlastone'
}

// GET /api/blogs - List blogs
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all')
  const year = searchParams.get('year')
  const brand = resolveBrand(searchParams.get('brand'))

  // Admin: get all blogs (including drafts)
  if (all === 'true') {
    const password = req.headers.get('x-admin-password')
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = brand === 'urlaklinker' ? getUrlaklinkerSupabase() : supabaseAdmin
    const table = brand === 'urlaklinker' ? 'urlaklinker_blogs' : 'blogs'

    const { data, error } = await db
      .from(table)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  }

  // Public: only published blogs (urlastone-only public path; urlaklinker has its own public API)
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
  const brand = resolveBrand(body.brand)
  const { title, content, cover_image_url, author_name, meta_description, is_published, ai_generated } = body

  if (!title || !content) {
    return NextResponse.json({ error: 'title and content required' }, { status: 400 })
  }

  const db = brand === 'urlaklinker' ? getUrlaklinkerSupabase() : supabaseAdmin
  const table = brand === 'urlaklinker' ? 'urlaklinker_blogs' : 'blogs'

  // Generate unique slug
  let slug = generateSlug(title)
  const { data: existing } = await db
    .from(table)
    .select('slug')
    .eq('slug', slug)
    .limit(1)

  if (existing && existing.length > 0) {
    slug = `${slug}-${Date.now().toString(36)}`
  }

  const defaultAuthor = brand === 'urlaklinker' ? 'URLAKLINKER Editör' : 'Cihan Zenger'

  const blogData: Record<string, unknown> = {
    slug,
    title,
    content,
    cover_image_url: cover_image_url || '',
    author_name: author_name || defaultAuthor,
    meta_description: meta_description || '',
    is_published: is_published || false,
    ai_generated: ai_generated || false,
  }

  if (is_published) {
    blogData.published_at = new Date().toISOString()
  }

  const { data, error } = await db
    .from(table)
    .insert(blogData)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (is_published && data?.slug) {
    pingBlogPublished(data.slug).catch(() => {})
  }

  if (brand === 'urlastone' && is_published) {
    revalidatePath('/blog')
    revalidatePath('/')
    if (data?.slug) revalidatePath(`/blog/${data.slug}`)
  }

  return NextResponse.json(data)
}
