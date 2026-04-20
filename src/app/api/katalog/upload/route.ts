import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/katalog/upload - Get signed upload URL (admin only)
// Client uploads directly to Supabase Storage to bypass Vercel's 4.5MB body limit
export async function POST(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Client'tan fileName parametresi geliyor ama biz yok sayiyoruz
  // Her katalog SABIT isim ile kaydedilir — /katalog URL'i hic kirilmaz
  await req.json().catch(() => ({}))

  try {
    // Remove old catalog files first
    const { data: existingFiles } = await supabaseAdmin.storage
      .from('products')
      .list('catalog')

    if (existingFiles && existingFiles.length > 0) {
      const filesToRemove = existingFiles.map(f => `catalog/${f.name}`)
      await supabaseAdmin.storage.from('products').remove(filesToRemove)
    }

    // SABIT dosya adi — admin hangi isimle yuklerse yuklesin ayni isimle kaydedilir
    // Boylece /katalog URL'i her zaman en guncel katalogu gosterir
    const fileName = 'Catalog-compressed.pdf'
    const filePath = `catalog/${fileName}`
    const { data, error } = await supabaseAdmin.storage
      .from('products')
      .createSignedUploadUrl(filePath)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('products')
      .getPublicUrl(filePath)

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
      publicUrl: urlData.publicUrl,
    })
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
