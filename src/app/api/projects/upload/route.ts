import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { optimizeUploadedFile } from '@/lib/image-optimize'

function validateAdmin(request: NextRequest): boolean {
  const auth = request.headers.get('Authorization')
  const password = (process.env.ADMIN_PASSWORD || '').trim()
  return auth === `Bearer ${password}`
}

// POST — admin: fotoğraf yükle (auto-optimized)
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
    // Auto-optimize
    const optimized = await optimizeUploadedFile(file, { maxWidth: 1600, quality: 82 })
    const fileName = `${projectId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${optimized.ext}`

    const { error } = await supabaseAdmin.storage
      .from('project-photos')
      .upload(fileName, optimized.buffer, {
        contentType: optimized.contentType,
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
