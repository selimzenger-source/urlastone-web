import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function validateAdmin(request: NextRequest): boolean {
  const auth = request.headers.get('Authorization')
  const password = (process.env.ADMIN_PASSWORD || '').trim()
  return auth === `Bearer ${password}`
}

// GET — tek proje getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json(data)
}

// PUT — admin: proje güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!validateAdmin(request)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const body = await request.json()

  const { data, error } = await supabaseAdmin
    .from('projects')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE — admin: proje sil (fotoğrafları da sil)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!validateAdmin(request)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  // Önce projenin fotoğraflarını al
  const { data: project } = await supabaseAdmin
    .from('projects')
    .select('photos')
    .eq('id', params.id)
    .single()

  // Storage'dan fotoğrafları sil
  if (project?.photos?.length) {
    const filePaths = project.photos.map((url: string) => {
      const parts = url.split('/project-photos/')
      return parts[1] || ''
    }).filter(Boolean)

    if (filePaths.length) {
      await supabaseAdmin.storage.from('project-photos').remove(filePaths)
    }
  }

  // Projeyi sil
  const { error } = await supabaseAdmin
    .from('projects')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
