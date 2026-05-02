import { optimizeUploadedFile } from '@/lib/image-optimize'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/categories/upload - Upload category image (admin only)
export async function POST(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File
  const categoryId = formData.get('category_id') as string

  if (!file || !categoryId) {
    return NextResponse.json({ error: 'file and category_id required' }, { status: 400 })
  }

  const { data: existing } = await supabaseAdmin
    .from('categories')
    .select('image_url')
    .eq('id', categoryId)
    .maybeSingle()
  const oldPath = extractStoragePath(existing?.image_url ?? null)

  const optimized = await optimizeUploadedFile(file, { maxWidth: 1200, quality: 82 })
  const fileName = `categories/${categoryId}-${Date.now()}.${optimized.ext}`

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
    .from('categories')
    .update({ image_url: imageUrl })
    .eq('id', categoryId)

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
