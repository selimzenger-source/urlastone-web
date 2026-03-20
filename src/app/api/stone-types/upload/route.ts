import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/stone-types/upload - Upload stone type image (admin only)
export async function POST(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File
  const stoneTypeId = formData.get('stone_type_id') as string

  if (!file || !stoneTypeId) {
    return NextResponse.json({ error: 'file and stone_type_id required' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()
  const fileName = `stone-types/${stoneTypeId}.${ext}`

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

  // Add cache buster to force refresh
  const imageUrl = `${urlData.publicUrl}?v=${Date.now()}`

  // Update stone_type record
  const { error: updateError } = await supabaseAdmin
    .from('stone_types')
    .update({ image_url: imageUrl })
    .eq('id', stoneTypeId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ url: imageUrl })
}
