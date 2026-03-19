import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function validateAdmin(request: NextRequest): boolean {
  const auth = request.headers.get('Authorization')
  return auth === `Bearer ${process.env.ADMIN_PASSWORD}`
}

// POST — admin: fotoğraf yükle
export async function POST(request: NextRequest) {
  if (!validateAdmin(request)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const formData = await request.formData()
  const projectId = formData.get('projectId') as string
  const files = formData.getAll('files') as File[]

  if (!files.length) {
    return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })
  }

  const urls: string[] = []

  for (const file of files) {
    const ext = file.name.split('.').pop()
    const fileName = `${projectId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabaseAdmin.storage
      .from('project-photos')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('project-photos')
      .getPublicUrl(fileName)

    urls.push(urlData.publicUrl)
  }

  return NextResponse.json({ urls })
}
