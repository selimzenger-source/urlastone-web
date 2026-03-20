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

  const ext = file.name.split('.').pop()
  const fileName = `categories/${categoryId}.${ext}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabaseAdmin.storage
    .from('products')
    .upload(fileName, file, { upsert: true, contentType: file.type })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  // Get public URL
  const { data: urlData } = supabaseAdmin.storage
    .from('products')
    .getPublicUrl(fileName)

  const imageUrl = `${urlData.publicUrl}?v=${Date.now()}`

  // Update category record
  const { error: updateError } = await supabaseAdmin
    .from('categories')
    .update({ image_url: imageUrl })
    .eq('id', categoryId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ url: imageUrl })
}
