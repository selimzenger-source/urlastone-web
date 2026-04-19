import { NextRequest, NextResponse } from 'next/server'
import { sendTelegramNotification } from '@/lib/telegram'

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
