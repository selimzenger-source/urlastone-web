import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/hero-slides/upload - Upload hero slide image (admin only)
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

  const ext = file.name.split('.').pop()
  const fileName = `hero-slides/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabaseAdmin.storage
    .from('hero-slides')
    .upload(fileName, file, { upsert: true, contentType: file.type })

  if (uploadError) {
    // If bucket doesn't exist, try creating it
    if (uploadError.message.includes('not found') || uploadError.message.includes('Bucket')) {
      await supabaseAdmin.storage.createBucket('hero-slides', { public: true })
      // Retry upload
      const { error: retryError } = await supabaseAdmin.storage
        .from('hero-slides')
        .upload(fileName, file, { upsert: true, contentType: file.type })
      if (retryError) {
        return NextResponse.json({ error: retryError.message }, { status: 500 })
      }
    } else {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }
  }

  // Get public URL
  const { data: urlData } = supabaseAdmin.storage
    .from('hero-slides')
    .getPublicUrl(fileName)

  return NextResponse.json({ url: urlData.publicUrl })
}
