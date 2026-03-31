import { NextRequest, NextResponse } from 'next/server'
import { sendCustomerConfirmation, sendAdminNotification } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { lead, fields, locale } = await req.json()

    if (!lead?.name) {
      return NextResponse.json({ ok: false, error: 'Missing lead info' }, { status: 400 })
    }

    // Dil eşleştirme: "TR Türkçe" → "tr", "EN English" → "en"
    const dilRaw = fields?.dil || locale || 'tr'
    const tercihDil = dilRaw.toLowerCase().slice(0, 2)

    // İletişim tercihi eşleştirme
    const iletisimMap: Record<string, string> = {
      'telefon': 'phone',
      'e-posta': 'email',
      'whatsapp': 'whatsapp',
      'phone': 'phone',
      'email': 'email',
    }
    const iletisimRaw = (fields?.iletisim || '').toLowerCase()
    const iletisimTuru = iletisimMap[iletisimRaw] || iletisimRaw

    const teklifData = {
      ad_soyad: lead.name,
      telefon: lead.phone || '',
      email: lead.email || undefined,
      ulke: fields?.ulke || 'Türkiye',
      il: fields?.il || '',
      ilce: fields?.ilce || undefined,
      proje_tipi: fields?.proje_tipi || 'Belirtilmedi',
      tas_tercihi: fields?.tas_tercihi ? [fields.tas_tercihi] : [],
      metrekare: fields?.metrekare || undefined,
      cephe_metre: fields?.dis_kose || undefined,
      aciklama: fields?.aciklama || undefined,
      kaynak: fields?.kaynak || undefined,
      iletisim_turu: iletisimTuru || undefined,
      tercih_dil: tercihDil,
    }

    // Müşteri + Admin mailleri paralel gönder
    const results = await Promise.allSettled([
      teklifData.email ? sendCustomerConfirmation(teklifData) : Promise.resolve(),
      sendAdminNotification(teklifData),
    ])

    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.error(`[Teklif Email] ${i === 0 ? 'Customer' : 'Admin'} email failed:`, r.reason)
      }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[Teklif Email] Error:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
