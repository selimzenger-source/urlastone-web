import { NextRequest, NextResponse } from 'next/server'
import { sendTelegramNotification } from '@/lib/telegram'
import crypto from 'crypto'

// Server-side dedup: ayni IP + ayni konusma 30 dk icinde 1 kezden fazla gonderilmesin
// Lambda restart'inde Map temizlenir ama client side sessionStorage da var, ikisi birlikte
// %99 dedup saglar
const recentSummaries = new Map<string, number>()
const DEDUP_WINDOW_MS = 30 * 60 * 1000 // 30 dk

function cleanExpired() {
  const cutoff = Date.now() - DEDUP_WINDOW_MS
  for (const [key, ts] of recentSummaries.entries()) {
    if (ts < cutoff) recentSummaries.delete(key)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, messages, locale } = await req.json()
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '-'

    if (!messages || messages.length === 0) return NextResponse.json({ ok: true })

    // Sohbet özetini oluştur
    const userMessages = messages.filter((m: { role: string; content: string }) => m.role === 'user' && m.content.trim())
    const assistantMessages = messages.filter((m: { role: string }) => m.role === 'assistant')

    // Müşteri hiç mesaj yazmadıysa özet gönderme (sadece açıp kapamış)
    if (userMessages.length === 0) return NextResponse.json({ ok: true })

    // Dedup kontrolu — konusma icerigi hash'i + IP
    cleanExpired()
    const contentHash = crypto
      .createHash('md5')
      .update(
        (messages as Array<{ role: string; content: string }>)
          .map(m => `${m.role}:${(m.content || '').slice(0, 100)}`)
          .join('|')
      )
      .digest('hex')
      .slice(0, 12)
    const dedupKey = `${ip}:${contentHash}`
    const lastSent = recentSummaries.get(dedupKey)
    if (lastSent && Date.now() - lastSent < DEDUP_WINDOW_MS) {
      console.log(`[Chat Summary] Duplicate skipped — IP: ${ip}, hash: ${contentHash}`)
      return NextResponse.json({ ok: true, skipped: 'duplicate' })
    }
    // Ipin ilk mesajdan beri X dakikali mesajlari olsa dahi, hic degisiklik yoksa skip
    // Kaydet (Telegram gonderme basarili olsa da olmasa da, cunku yine 30 dk bekletmek istiyoruz)
    recentSummaries.set(dedupKey, Date.now())

    const now = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })

    // Diyalog formatında sohbeti olustur (musteri sorusu + Uri cevabi sirayla)
    // Sadece user ve assistant rolleri, sira korunur
    const conversation: string[] = []
    let questionNo = 0
    for (const m of messages as Array<{ role: string; content: string }>) {
      if (!m.content || !m.content.trim()) continue
      const cleanContent = m.content.replace(/📷|📎/g, '').trim()
      if (!cleanContent) continue
      const snippet = cleanContent.length > 400 ? cleanContent.slice(0, 400) + '...' : cleanContent
      if (m.role === 'user') {
        questionNo++
        conversation.push(`\n❓ *Soru ${questionNo}* (${name || 'Müşteri'}):\n${snippet}`)
      } else if (m.role === 'assistant') {
        conversation.push(`💬 *Uri'nin cevabı:*\n${snippet}`)
      }
    }

    const header = `📊 SOHBET OZETI

👤 Müşteri: ${name || 'Bilinmiyor'}
📞 Telefon: ${phone || '-'}
📧 Email: ${email || '-'}
🌐 Dil: ${locale || 'tr'}
🔒 IP: ${ip}
🕐 Tarih: ${now}
💬 Toplam mesaj: ${messages.length} (${userMessages.length} müşteri, ${assistantMessages.length} Uri)

━━━━━━━━━━━━━━━━━━
📜 *Diyalog:*
`
    const footer = `
━━━━━━━━━━━━━━━━━━

Engellemek icin: /engelle ${ip}`

    // Telegram 4096 char limit — uzarsa kisalt
    const maxBodyLen = 4000 - header.length - footer.length
    let body = conversation.join('\n\n')
    if (body.length > maxBodyLen) {
      body = body.slice(0, maxBodyLen - 30) + '\n\n_[...uzun, Supabase\'de tam kayit]_'
    }

    const summaryMsg = header + body + footer

    await sendTelegramNotification(summaryMsg)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[Chat Summary] Error:', error)
    return NextResponse.json({ ok: true })
  }
}
