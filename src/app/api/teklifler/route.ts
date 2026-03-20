import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendCustomerConfirmation, sendAdminNotification } from '@/lib/email'

// GET /api/teklifler — admin only
export async function GET(req: Request) {
  const pw = req.headers.get('x-admin-password')
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('teklifler')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/teklifler — public form submission
export async function POST(req: Request) {
  const body = await req.json()
  const {
    ad_soyad, telefon, email, ulke, il, ilce,
    proje_tipi, tas_tercihi, metrekare,
    aciklama, kaynak,
  } = body

  // Validate required fields
  if (!ad_soyad || !telefon || !il || !proje_tipi) {
    return NextResponse.json(
      { error: 'Ad Soyad, Telefon, İl ve Proje Tipi zorunludur' },
      { status: 400 }
    )
  }

  const { data, error } = await supabaseAdmin
    .from('teklifler')
    .insert({
      ad_soyad,
      telefon,
      email: email || null,
      ulke: ulke || 'Türkiye',
      il,
      ilce: ilce || null,
      proje_tipi,
      tas_tercihi: tas_tercihi || [],
      metrekare: metrekare || null,
      aciklama: aciklama || null,
      kaynak: kaynak || null,
      foto_urls: [],
      durum: 'Yeni',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send emails (don't block response on email failures)
  if (process.env.RESEND_API_KEY) {
    const emailData = { ad_soyad, telefon, email, ulke: ulke || 'Türkiye', il, ilce, proje_tipi, tas_tercihi: tas_tercihi || [], metrekare, aciklama, kaynak }
    Promise.allSettled([
      sendCustomerConfirmation(emailData),
      sendAdminNotification(emailData),
    ]).catch(() => {})
  }

  return NextResponse.json(data)
}
