import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { optimizeUploadedFile } from '@/lib/image-optimize'

// POST /api/blogs/upload - Upload blog cover image (admin only)
export async function POST(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'file required' }, { status: 400 })
  }

  const optimized = await optimizeUploadedFile(file, { maxWidth: 1200, quality: 85 })
  const fileName = `blog-covers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${optimized.ext}`

  const { error: uploadError } = await supabaseAdmin.storage
    .from('blog-covers')
    .upload(fileName, optimized.buffer, { upsert: true, contentType: optimized.contentType })

  if (uploadError) {
    if (uploadError.message.includes('not found') || uploadError.message.includes('Bucket')) {
      await supabaseAdmin.storage.createBucket('blog-covers', { public: true })
      const { error: retryError } = await supabaseAdmin.storage
        .from('blog-covers')
        .upload(fileName, optimized.buffer, { upsert: true, contentType: optimized.contentType })
      if (retryError) {
        return NextResponse.json({ error: retryError.message }, { status: 500 })
      }
    } else {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }
  }

  const { data: urlData } = supabaseAdmin.storage
    .from('blog-covers')
    .getPublicUrl(fileName)

  return NextResponse.json({ url: urlData.publicUrl })
}
