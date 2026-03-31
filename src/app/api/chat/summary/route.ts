import { NextRequest, NextResponse } from 'next/server'
import { sendTelegramNotification } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, messages, locale } = await req.json()
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '-'

    if (!messages || messages.length === 0) return NextResponse.json({ ok: true })

    // Sohbet özetini oluştur
    const userMessages = messages.filter((m: { role: string }) => m.role === 'user')
    const assistantMessages = messages.filter((m: { role: string }) => m.role === 'assistant')

    // Konuları çıkar (kullanıcı mesajlarından)
    const topics = userMessages.map((m: { content: string }) => m.content.slice(0, 100)).join('\n- ')

    const now = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })

    const summaryMsg = `📊 SOHBET OZETI

👤 Müşteri: ${name || 'Bilinmiyor'}
📞 Telefon: ${phone || '-'}
📧 Email: ${email || '-'}
🌐 Dil: ${locale || 'tr'}
🔒 IP: ${ip}
🕐 Tarih: ${now}
💬 Toplam mesaj: ${messages.length} (${userMessages.length} müşteri, ${assistantMessages.length} Uri)

📝 Müşterinin sorduğu konular:
- ${topics}

${userMessages.length > 0 ? `💡 İlk soru: "${userMessages[0].content.slice(0, 200)}"` : ''}
${userMessages.length > 1 ? `💡 Son soru: "${userMessages[userMessages.length - 1].content.slice(0, 200)}"` : ''}

Engellemek icin: /engelle ${ip}`

    await sendTelegramNotification(summaryMsg)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[Chat Summary] Error:', error)
    return NextResponse.json({ ok: true })
  }
}
