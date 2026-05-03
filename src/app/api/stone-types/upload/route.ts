import { optimizeUploadedFile } from '@/lib/image-optimize'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
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

  const optimized = await optimizeUploadedFile(file, { maxWidth: 1200, quality: 82 })
  const fileName = `stone-types/${stoneTypeId}-${Date.now()}.${optimized.ext}`

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
    .from('stone_types')
    .update({ image_url: imageUrl })
    .eq('id', stoneTypeId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Public sayfa CDN cache'lerini hemen temizle — yeni resim anında görünsün
  revalidatePath('/')
  revalidatePath('/urunlerimiz')

  return NextResponse.json({ url: imageUrl })
}
