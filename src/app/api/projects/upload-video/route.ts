import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function validateAdmin(request: NextRequest): boolean {
  const auth = request.headers.get('Authorization')
  const password = (process.env.ADMIN_PASSWORD || '').trim()
  return auth === `Bearer ${password}`
}

// POST — admin: video yükle
export async function POST(request: NextRequest) {
  if (!validateAdmin(request)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const formData = await request.formData()
  const projectId = formData.get('projectId') as string
  const file = formData.get('file') as File

  if (!file || !projectId) {
    return NextResponse.json({ error: 'Dosya veya proje ID bulunamadı' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() || 'mp4'
  const fileName = `project-videos/${projectId}-${Date.now()}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabaseAdmin.storage
    .from('uploads')
    .upload(fileName, buffer, {
      contentType: file.type || 'video/mp4',
      upsert: true,
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: urlData } = supabaseAdmin.storage
    .from('uploads')
    .getPublicUrl(fileName)

  // Update project with video URL
  await supabaseAdmin
    .from('projects')
    .update({ video_urls: [urlData.publicUrl] })
    .eq('id', projectId)

  return NextResponse.json({ video_url: urlData.publicUrl })
}
