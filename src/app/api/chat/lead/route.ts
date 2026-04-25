import { NextRequest, NextResponse } from 'next/server'
import { sendTelegramNotification } from '@/lib/telegram'
import { isIPBlocked } from '@/lib/bot-knowledge'

// Lead dedup: ayni IP + telefon 30 dk icinde 1 kez bildirilir
const recentLeads = new Map<string, number>()
const LEAD_DEDUP_WINDOW_MS = 30 * 60 * 1000

function cleanExpiredLeads() {
  const cutoff = Date.now() - LEAD_DEDUP_WINDOW_MS
  recentLeads.forEach((ts, key) => {
    if (ts < cutoff) recentLeads.delete(key)
  })
}

// Lead bilgilerini email + Telegram ile bildir
export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, locale } = await req.json()

    if (!name || !phone) {
      return NextResponse.json({ error: 'Ad ve telefon gerekli' }, { status: 400 })
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '-'

    // IP engelleme kontrolü
    if (await isIPBlocked(ip)) {
      return NextResponse.json({ error: 'Erişiminiz kısıtlanmıştır.' }, { status: 403 })
    }

    // Dedup: ayni IP 30 dk icinde varsa skip (double submit + spam koruma)
    cleanExpiredLeads()
    const dedupKey = ip
    const lastSent = recentLeads.get(dedupKey)
    if (lastSent && Date.now() - lastSent < LEAD_DEDUP_WINDOW_MS) {
      console.log(`[ChatLead] Duplicate skipped — IP: ${ip}, phone: ${phone}`)
      return NextResponse.json({ ok: true, skipped: 'duplicate' })
    }
    recentLeads.set(dedupKey, Date.now())

    const tarih = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })

    // Chatbot lead'leri icin email gondermiyoruz — Telegram yeterli
    // (Sadece teklif talepleri email atar, chatbot girisleri degil)

    // Telegram bildirim
    await sendTelegramNotification(
      [
        '💬 *Yeni Chatbot Müşterisi*',
        '',
        `👤 *Ad:* ${name}`,
        `📞 *Telefon:* ${phone}`,
        email ? `📧 *Email:* ${email}` : '',
        `🌍 *Dil:* ${locale || 'tr'}`,
        `🔒 *IP:* \`${ip}\``,
        `🕐 *Tarih:* ${tarih}`,
        '',
        `Engellemek icin: \`/engelle ${ip}\``,
      ].filter(Boolean).join('\n')
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[ChatLead] Error:', error)
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}
