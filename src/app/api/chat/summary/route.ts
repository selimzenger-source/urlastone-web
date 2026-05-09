import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { sendTelegramNotification } from '@/lib/telegram'

// Yabancı dil özetlerinde Claude çevirisi + Telegram için 30s pay
export const maxDuration = 30

const translateClient = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

// Sohbeti Türkçeye çevir (locale !== 'tr' ise). Hata olursa orijinali döndür.
async function translateMessagesToTurkish(
  msgs: Array<{ role: string; content: string }>,
  sourceLocale: string
): Promise<Array<{ role: string; content: string }>> {
  if (sourceLocale === 'tr' || !translateClient) return msgs
  try {
    const numbered = msgs
      .map((m, i) => `[${i}|${m.role}]\n${m.content}`)
      .join('\n---\n')
    const result = await translateClient.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `Aşağıdaki sohbet mesajlarını ${sourceLocale} dilinden Türkçeye doğal ve akıcı şekilde çevir. Her mesajın başındaki [index|role] etiketini AYNEN ve değiştirmeden koru, sadece altındaki içeriği çevir. Mesajları --- satırı ile ayrılmış olarak ver. Açıklama ekleme, sadece çeviriyi döndür.\n\n${numbered}`,
        },
      ],
    })
    const block = result.content[0]
    const text = block && block.type === 'text' ? block.text : ''
    if (!text) return msgs
    const parts = text.split('\n---\n')
    return msgs.map((orig, i) => {
      const part = parts[i]
      if (!part) return orig
      const match = part.match(/^\[\d+\|(\w+)\]\s*\n?([\s\S]+)$/)
      if (match) return { role: match[1], content: match[2].trim() }
      return orig
    })
  } catch (err) {
    console.error('[Chat Summary] Translation failed:', err)
    return msgs
  }
}

// Server-side dedup: ayni IP + ayni konusma 30 dk icinde 1 kezden fazla gonderilmesin
// Lambda restart'inde Map temizlenir ama client side sessionStorage da var, ikisi birlikte
// %99 dedup saglar
const recentSummaries = new Map<string, number>()
const DEDUP_WINDOW_MS = 30 * 60 * 1000 // 30 dk

function cleanExpired() {
  const cutoff = Date.now() - DEDUP_WINDOW_MS
  recentSummaries.forEach((ts, key) => {
    if (ts < cutoff) recentSummaries.delete(key)
  })
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

    // Dedup — sadece IP, 30 dk icinde 1 ozet (mesaj icerigi degisse bile yine 1 ozet)
    cleanExpired()
    const dedupKey = ip
    const lastSent = recentSummaries.get(dedupKey)
    if (lastSent && Date.now() - lastSent < DEDUP_WINDOW_MS) {
      console.log(`[Chat Summary] Duplicate skipped — IP: ${ip}`)
      return NextResponse.json({ ok: true, skipped: 'duplicate' })
    }
    recentSummaries.set(dedupKey, Date.now())

    const now = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })

    // Türkçe değilse Claude Haiku ile çevir — Telegram'da hep Türkçe görünsün
    const sourceLocale = (locale || 'tr').toLowerCase()
    const displayMessages =
      sourceLocale === 'tr'
        ? (messages as Array<{ role: string; content: string }>)
        : await translateMessagesToTurkish(messages, sourceLocale)

    // Diyalog formatında sohbeti olustur (musteri sorusu + Uri cevabi sirayla)
    const conversation: string[] = []
    let questionNo = 0
    for (const m of displayMessages) {
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

    const dialogTitle = sourceLocale === 'tr' ? '*Diyalog:*' : `*Diyalog* (orijinal dil: ${sourceLocale}, Türkçeye çevrildi):`
    const header = `📊 SOHBET OZETI

👤 Müşteri: ${name || 'Bilinmiyor'}
📞 Telefon: ${phone || '-'}
📧 Email: ${email || '-'}
🌐 Dil: ${locale || 'tr'}
🔒 IP: ${ip}
🕐 Tarih: ${now}
💬 Toplam mesaj: ${messages.length} (${userMessages.length} müşteri, ${assistantMessages.length} Uri)

━━━━━━━━━━━━━━━━━━
📜 ${dialogTitle}
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
