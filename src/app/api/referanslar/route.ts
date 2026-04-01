import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// GET /api/referanslar
export async function GET(req: NextRequest) {
  const includeHidden = new URL(req.url).searchParams.get('include_hidden') === 'true'

  let query = supabase
    .from('referanslar')
    .select('*, project:projects(id, project_name)')
    .order('sort_order')

  if (!includeHidden) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const cacheHeader = includeHidden
    ? 'no-store'
    : 'public, s-maxage=60, stale-while-revalidate=300'
  return NextResponse.json(data, {
    headers: { 'Cache-Control': cacheHeader },
  })
}

// POST /api/referanslar
export async function POST(req: Request) {
  const pw = req.headers.get('x-admin-password')
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, description, project_id, website_url, sort_order, logo_url } = body

  if (!name) {
    return NextResponse.json({ error: 'İsim zorunludur' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('referanslar')
    .insert({ name, description: description || null, project_id: project_id || null, website_url: website_url || null, sort_order: sort_order || 0, is_active: true })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // AI logosu varsa server-side çekip Supabase'e yükle
  if (logo_url && data?.id) {
    try {
      console.log('[Referans Logo] Fetching:', logo_url)
      const logoRes = await fetch(logo_url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'image/*,*/*' },
        redirect: 'follow',
        signal: AbortSignal.timeout(15000),
      })
      console.log('[Referans Logo] Fetch status:', logoRes.status, logoRes.headers.get('content-type'))
      if (logoRes.ok) {
        const buffer = Buffer.from(await logoRes.arrayBuffer())
        console.log('[Referans Logo] Buffer size:', buffer.length)
        const contentType = logoRes.headers.get('content-type') || 'image/png'
        const ext = contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : 'png'
        const filePath = `referanslar/${data.id}/logo.${ext}`
        const { error: uploadErr } = await supabaseAdmin.storage
          .from('images')
          .upload(filePath, buffer, { contentType, upsert: true })
        console.log('[Referans Logo] Upload result:', uploadErr ? uploadErr.message : 'OK')
        if (!uploadErr) {
          const { data: urlData } = supabaseAdmin.storage.from('images').getPublicUrl(filePath)
          console.log('[Referans Logo] Public URL:', urlData?.publicUrl)
          if (urlData?.publicUrl) {
            await supabaseAdmin.from('referanslar').update({ logo_url: urlData.publicUrl }).eq('id', data.id)
            data.logo_url = urlData.publicUrl
          }
        }
      } else {
        console.log('[Referans Logo] Fetch failed:', logoRes.status)
      }
    } catch (err) {
      console.error('[Referans Logo] Error:', err)
    }
  }

  return NextResponse.json(data)
}
