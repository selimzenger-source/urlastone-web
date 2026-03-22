import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// PUT /api/hero-slides/[id] - Update slide (admin only)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const password = req.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { id } = params

  const { data, error } = await supabaseAdmin
    .from('hero_slides')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE /api/hero-slides/[id] - Delete slide (admin only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const password = req.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params

  // Get slide to find image path for cleanup
  const { data: slide } = await supabaseAdmin
    .from('hero_slides')
    .select('image_url')
    .eq('id', id)
    .single()

  // Delete from database
  const { error } = await supabaseAdmin
    .from('hero_slides')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Try to delete from storage if it's a supabase URL
  if (slide?.image_url && slide.image_url.includes('supabase')) {
    const path = slide.image_url.split('/hero-slides/')[1]
    if (path) {
      await supabaseAdmin.storage.from('hero-slides').remove([path])
    }
  }

  return NextResponse.json({ success: true })
}
