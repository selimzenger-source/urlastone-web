import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/teklifler/upload — public (form submission uploads)
export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const teklifId = formData.get('teklif_id') as string
  const files = formData.getAll('files') as File[]

  if (!teklifId || files.length === 0) {
    return NextResponse.json({ error: 'teklif_id and files required' }, { status: 400 })
  }

  if (files.length > 5) {
    return NextResponse.json({ error: 'Maximum 5 files allowed' }, { status: 400 })
  }

  const uploadedUrls: string[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    // Validate file type
    if (!file.type.startsWith('image/')) {
      continue
    }

    // Max 10MB per file
    if (file.size > 10 * 1024 * 1024) {
      continue
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${teklifId}/${Date.now()}-${i}.${ext}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('teklifler')
      .upload(fileName, file, { contentType: file.type })

    if (uploadError) {
      console.error('Upload error:', uploadError.message)
      continue
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('teklifler')
      .getPublicUrl(fileName)

    uploadedUrls.push(urlData.publicUrl)
  }

  if (uploadedUrls.length === 0) {
    return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
  }

  // Update teklif record with foto_urls
  const { error: updateError } = await supabaseAdmin
    .from('teklifler')
    .update({ foto_urls: uploadedUrls })
    .eq('id', teklifId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ urls: uploadedUrls })
}
