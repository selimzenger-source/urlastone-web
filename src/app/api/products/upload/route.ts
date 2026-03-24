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

  // Auto-optimize image
  const optimized = await optimizeUploadedFile(file, { maxWidth: 1200, quality: 82 })
  const fileName = `${productId}.${optimized.ext}`

  // Upload optimized image to Supabase Storage
  const { error: uploadError } = await supabaseAdmin.storage
    .from('products')
    .upload(fileName, optimized.buffer, { upsert: true, contentType: optimized.contentType })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  // Get public URL
  const { data: urlData } = supabaseAdmin.storage
    .from('products')
    .getPublicUrl(fileName)

  // Update product record
  const { error: updateError } = await supabaseAdmin
    .from('products')
    .update({ image_url: urlData.publicUrl, updated_at: new Date().toISOString() })
    .eq('id', productId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ url: urlData.publicUrl })
}
