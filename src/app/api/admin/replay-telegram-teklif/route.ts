import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendTelegramNotification } from '@/lib/telegram'

// POST /api/admin/replay-telegram-teklif
// Telegram bildirimi gitmemiş geçmiş teklifleri yeniden gönderir.
// Body: { since?: ISO date string, ids?: string[] }
// Headers: x-admin-password
// Mesajların başına "🔁 Geç bildirilen talep" eklenir, gerçek bildirimden ayrılsın.
export async function POST(req: NextRequest) {
  const pw = req.headers.get('x-admin-password')
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { since?: string; ids?: string[] } = {}
  try {
    body = await req.json()
  } catch {
    /* boş body OK */
  }

  let query = supabaseAdmin.from('teklifler').select('*').order('created_at', { ascending: true })
  if (body.ids && body.ids.length > 0) {
    query = query.in('id', body.ids)
  } else if (body.since) {
    query = query.gte('created_at', body.since)
  } else {
    return NextResponse.json({ error: 'since veya ids parametresi gerekli' }, { status: 400 })
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data || data.length === 0) return NextResponse.json({ ok: true, sent: 0, message: 'Eşleşen kayıt yok' })

  let sent = 0
  for (const t of data) {
    const tasArr: string[] = Array.isArray(t.tas_tercihi) ? t.tas_tercihi : []
    const ts = new Date(t.created_at).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })
    const msg = [
      '🔁 *Geç bildirilen talep*',
      '',
      '📋 *Yeni Teklif Talebi*',
      '',
      `👤 *Ad:* ${t.ad_soyad}`,
      `📞 *Telefon:* ${t.telefon}`,
      t.email ? `📧 *Email:* ${t.email}` : '',
      `📍 *Konum:* ${t.il}${t.ilce ? ', ' + t.ilce : ''}, ${t.ulke || 'Türkiye'}`,
      `🏗 *Proje:* ${t.proje_tipi}`,
      `🪨 *Taş:* ${tasArr.join(', ') || '-'}`,
      `📐 *m²:* ${t.cephe_metre || '-'}`,
      `💰 *Fiyat Tipi:* ${t.fiyat_tipi || '-'}`,
      t.aciklama ? `📝 *Not:* ${String(t.aciklama).substring(0, 100)}` : '',
      '',
      `🕐 Asıl tarih: ${ts}`,
    ]
      .filter(Boolean)
      .join('\n')
    await sendTelegramNotification(msg)
    sent++
  }

  return NextResponse.json({ ok: true, sent, ids: data.map(d => d.id) })
}
