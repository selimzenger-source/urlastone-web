import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const CATALOG_FILES: Record<string, string> = {
  urlastone: 'Catalog-compressed.pdf',
  urlaklinker: 'urlaklinker-katalog.pdf',
}

function brandOf(req: NextRequest) {
  const b = new URL(req.url).searchParams.get('brand')
  return b === 'urlaklinker' ? 'urlaklinker' : 'urlastone'
}

// GET /api/katalog?brand=urlastone|urlaklinker - Get that brand's catalog info
export async function GET(req: NextRequest) {
  const brand = brandOf(req)
  const fileName = CATALOG_FILES[brand]
  try {
    const { data, error } = await supabaseAdmin.storage
      .from('products')
      .list('catalog', { search: fileName })

    const file = data?.find(f => f.name === fileName)
    if (error || !file) {
      return NextResponse.json({ url: null, fileName: null })
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('products')
      .getPublicUrl(`catalog/${fileName}`)

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

// DELETE /api/katalog?brand=... - Remove only that brand's catalog
export async function DELETE(req: NextRequest) {
  const pw = req.headers.get('x-admin-password')
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const brand = brandOf(req)
  try {
    await supabaseAdmin.storage.from('products').remove([`catalog/${CATALOG_FILES[brand]}`])
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
