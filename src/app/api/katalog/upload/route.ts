import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/katalog/upload - Upload catalog PDF (admin only)
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

  // Only allow PDF
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
  }

  try {
    // Remove old catalog files first
    const { data: existingFiles } = await supabaseAdmin.storage
      .from('products')
      .list('catalog')

    if (existingFiles && existingFiles.length > 0) {
      const filesToRemove = existingFiles.map(f => `catalog/${f.name}`)
      await supabaseAdmin.storage.from('products').remove(filesToRemove)
    }

    // Upload new catalog
    const fileName = `catalog/${file.name}`
    const { error: uploadError } = await supabaseAdmin.storage
      .from('products')
      .upload(fileName, file, { upsert: true, contentType: 'application/pdf' })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('products')
      .getPublicUrl(fileName)

    return NextResponse.json({ url: urlData.publicUrl, fileName: file.name })
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
