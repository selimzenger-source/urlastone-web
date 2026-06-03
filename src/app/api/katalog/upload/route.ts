import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Marka basina SABIT dosya adi — /katalog URL'leri hic kirilmaz, markalar birbirini silmez
const CATALOG_FILES: Record<string, string> = {
  urlastone: 'Catalog-compressed.pdf',
  urlaklinker: 'urlaklinker-katalog.pdf',
}

// POST /api/katalog/upload - Get signed upload URL (admin only)
// Client uploads directly to Supabase Storage to bypass Vercel's 4.5MB body limit
export async function POST(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const brand = body?.brand === 'urlaklinker' ? 'urlaklinker' : 'urlastone'
  const fileName = CATALOG_FILES[brand]
  const filePath = `catalog/${fileName}`

  try {
    // Yalnizca BU markanin dosyasini kaldir (digerine dokunma) — sonra yeniden olustur
    await supabaseAdmin.storage.from('products').remove([filePath]).catch(() => {})

    const { data, error } = await supabaseAdmin.storage
      .from('products')
      .createSignedUploadUrl(filePath)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

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
