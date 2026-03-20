import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/katalog - Get current catalog URL
export async function GET() {
  try {
    // List files in catalog folder
    const { data, error } = await supabaseAdmin.storage
      .from('products')
      .list('catalog', { limit: 1, sortBy: { column: 'updated_at', order: 'desc' } })

    if (error || !data || data.length === 0) {
      return NextResponse.json({ url: null, fileName: null })
    }

    const file = data[0]
    const { data: urlData } = supabaseAdmin.storage
      .from('products')
      .getPublicUrl(`catalog/${file.name}`)

    return NextResponse.json({
      url: urlData.publicUrl,
      fileName: file.name,
      size: file.metadata?.size || 0,
      updatedAt: file.updated_at,
    })
  } catch {
    return NextResponse.json({ url: null }, { status: 500 })
  }
}

// DELETE /api/katalog - Remove catalog
export async function DELETE(req: NextRequest) {
  const pw = req.headers.get('x-admin-password')
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data } = await supabaseAdmin.storage
      .from('products')
      .list('catalog')

    if (data && data.length > 0) {
      const filesToRemove = data.map(f => `catalog/${f.name}`)
      await supabaseAdmin.storage.from('products').remove(filesToRemove)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
