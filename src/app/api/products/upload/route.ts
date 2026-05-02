import { optimizeUploadedFile } from '@/lib/image-optimize'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/products/upload - Upload product image (admin only)
export async function POST(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File
  const productId = formData.get('product_id') as string

  if (!file || !productId) {
    return NextResponse.json({ error: 'file and product_id required' }, { status: 400 })
  }

  // Fetch existing image_url so we can delete the old file after a successful upload
  const { data: existing } = await supabaseAdmin
    .from('products')
    .select('image_url')
    .eq('id', productId)
    .maybeSingle()
  const oldPath = extractStoragePath(existing?.image_url ?? null)

  // Auto-optimize image
  const optimized = await optimizeUploadedFile(file, { maxWidth: 1200, quality: 82 })
  const fileName = `${productId}-${Date.now()}.${optimized.ext}`

  // Upload optimized image to Supabase Storage (unique filename = no CDN/browser cache hit)
  const { error: uploadError } = await supabaseAdmin.storage
    .from('products')
    .upload(fileName, optimized.buffer, { upsert: false, contentType: optimized.contentType })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: urlData } = supabaseAdmin.storage
    .from('products')
    .getPublicUrl(fileName)

  const imageUrl = urlData.publicUrl
  const { error: updateError } = await supabaseAdmin
    .from('products')
    .update({ image_url: imageUrl, updated_at: new Date().toISOString() })
    .eq('id', productId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  if (oldPath && oldPath !== fileName) {
    await supabaseAdmin.storage.from('products').remove([oldPath])
  }

  return NextResponse.json({ url: imageUrl })
}

function extractStoragePath(url: string | null): string | null {
  if (!url) return null
  const match = url.match(/\/storage\/v1\/object\/public\/products\/(.+?)(\?|$)/)
  return match ? match[1] : null
}
