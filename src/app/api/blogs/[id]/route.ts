import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/blogs/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const password = req.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('blogs')
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
  const updateData: Record<string, unknown> = { ...body, updated_at: new Date().toISOString() }

  // If toggling to published and no published_at yet, set it
  if (body.is_published === true) {
    const { data: current } = await supabaseAdmin
      .from('blogs')
      .select('published_at')
      .eq('id', id)
      .single()

    if (current && !current.published_at) {
      updateData.published_at = new Date().toISOString()
    }
  }

  const { data, error } = await supabaseAdmin
    .from('blogs')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/blogs/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const password = req.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get blog to check for cover image
  const { data: blog } = await supabaseAdmin
    .from('blogs')
    .select('cover_image_url')
    .eq('id', id)
    .single()

  // Delete cover image from storage if it's a Supabase URL
  if (blog?.cover_image_url?.includes('supabase')) {
    const path = blog.cover_image_url.split('/blog-covers/')[1]
    if (path) {
      await supabaseAdmin.storage.from('blog-covers').remove([path])
    }
  }

  const { error } = await supabaseAdmin
    .from('blogs')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
