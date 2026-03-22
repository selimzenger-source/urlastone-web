import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/teklifler/delete-photo — delete a single photo (admin only)
export async function POST(req: NextRequest) {
  const pw = req.headers.get('x-admin-password')
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { teklif_id, photo_url } = await req.json()
  if (!teklif_id || !photo_url) {
    return NextResponse.json({ error: 'teklif_id and photo_url required' }, { status: 400 })
  }

  // Extract storage path from public URL
  // URL format: https://<project>.supabase.co/storage/v1/object/public/teklifler/<path>
  const match = photo_url.match(/\/teklifler\/(.+)$/)
  if (match) {
    await supabaseAdmin.storage
      .from('teklifler')
      .remove([match[1]])
  }

  // Remove URL from foto_urls array
  const { data: teklif } = await supabaseAdmin
    .from('teklifler')
    .select('foto_urls')
    .eq('id', teklif_id)
    .single()

  if (teklif) {
    const updatedUrls = (teklif.foto_urls || []).filter((u: string) => u !== photo_url)
    await supabaseAdmin
      .from('teklifler')
      .update({ foto_urls: updatedUrls })
      .eq('id', teklif_id)
  }

  return NextResponse.json({ success: true })
}
