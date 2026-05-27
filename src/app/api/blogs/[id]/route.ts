import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase'
import { getUrlaklinkerSupabase } from '@/lib/urlaklinker-supabase'
import { pingBlogPublished } from '@/lib/indexnow'

function pickBrandFromReq(req: NextRequest, bodyBrand?: unknown): 'urlastone' | 'urlaklinker' {
  const fromQuery = new URL(req.url).searchParams.get('brand')
  const v = bodyBrand ?? fromQuery
  return v === 'urlaklinker' ? 'urlaklinker' : 'urlastone'
}

function pickDb(brand: 'urlastone' | 'urlaklinker') {
  return brand === 'urlaklinker'
    ? { db: getUrlaklinkerSupabase(), table: 'urlaklinker_blogs' as const }
    : { db: supabaseAdmin, table: 'blogs' as const }
}

// GET /api/blogs/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const password = req.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const brand = pickBrandFromReq(req)
  const { db, table } = pickDb(brand)

  const { data, error } = await db
    .from(table)
    .select('*')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

// PUT /api/blogs/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const password = req.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const brand = pickBrandFromReq(req, body.brand)
  const { db, table } = pickDb(brand)

  // Strip brand from update payload
  const { brand: _brand, ...rest } = body
  const updateData: Record<string, unknown> = { ...rest, updated_at: new Date().toISOString() }

  // If toggling to published and no published_at yet, set it
  if (body.is_published === true) {
    const { data: current } = await db
      .from(table)
      .select('published_at')
      .eq('id', id)
      .single()

    if (current && !current.published_at) {
      updateData.published_at = new Date().toISOString()
    }
  }

  const { data, error } = await db
    .from(table)
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (body.is_published === true && data?.slug) {
    pingBlogPublished(data.slug).catch(() => {})
  }

  // Vercel CDN cache'i sadece urlastone tarafında temizle
  if (brand === 'urlastone') {
    revalidatePath('/blog')
    revalidatePath('/')
    if (data?.slug) revalidatePath(`/blog/${data.slug}`)
  }

  return NextResponse.json(data)
}

// DELETE /api/blogs/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const password = req.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const brand = pickBrandFromReq(req)
  const { db, table } = pickDb(brand)

  const { data: blog } = await db
    .from(table)
    .select('cover_image_url')
    .eq('id', id)
    .single()

  if (blog?.cover_image_url?.includes('supabase')) {
    const path = blog.cover_image_url.split('/blog-covers/')[1]
    if (path) {
      await db.storage.from('blog-covers').remove([path])
    }
  }

  const { error } = await db
    .from(table)
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
