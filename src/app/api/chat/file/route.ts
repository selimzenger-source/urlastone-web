import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { blockIP } from '@/lib/bot-knowledge'
import { sendTelegramNotification } from '@/lib/telegram'

const moderationClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Resim içerik kontrolü - sadece iş ile ilgili resimler kabul edilir
async function checkImageContent(buffer: Buffer, mimeType: string): Promise<{ ok: boolean; reason?: string }> {
  try {
    const base64 = buffer.toString('base64')
    const mediaType = mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

    const response = await moderationClient.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          {
            type: 'text',
            text: 'Bu resmi analiz et. 3 kategoriden birini yaz:\n1. "UYGUN" - dogal tas, yapi, insaat, ev, villa, otel, cephe, duvar, peyzaj, mimari, proje, insaat malzemesi, bina, dis mekan ile ilgili\n2. "KONU_DISI" - konu ile alakasiz ama zararsiz (selfie, yemek, hayvan, manzara vs)\n3. "MUSTEHCEN" - cinsel icerik,ciplak vucut, genital organ, orta parmak (middle finger), nah isareti (fig sign/fist with thumb), hakaret el isareti, kufur/hakaret iceren yazi, siddet, kan, silah, ofansif sembol veya herhangi bir saldirgan/kaba icerik\nSadece bu 3 kelimeden birini yaz.',
          },
        ],
      }],
    })

    const text = response.content[0]?.type === 'text' ? response.content[0].text : ''
    if (text.includes('MUSTEHCEN')) {
      return { ok: false, reason: 'obscene' }
    }
    if (text.includes('KONU_DISI')) {
      return { ok: false, reason: 'off_topic' }
    }
    return { ok: true }
  } catch {
    // Kontrol başarısız olursa geçir (false positive'den kaçın)
    return { ok: true }
  }
}

// Dosyayı Telegram'a gönder (depolama gerektirmez)
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const name = formData.get('name') as string || '-'
    const phone = formData.get('phone') as string || '-'
    const locale = formData.get('locale') as string || 'tr'
    const note = formData.get('note') as string || ''

    if (!file) {
      return NextResponse.json({ error: 'Dosya gerekli' }, { status: 400 })
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Dosya çok büyük (max 10MB)' }, { status: 400 })
    }

    const token = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    if (!token || !chatId) {
      // Telegram yapılandırılmamışsa sessizce başarılı dön
      return NextResponse.json({ ok: true })
    }

    const isImage = file.type.startsWith('image/')
    const tarih = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })

    const caption = [
      `📎 *Chatbot Dosya*`,
      `👤 ${name}`,
      `📞 ${phone}`,
      `🌍 ${locale}`,
      `📄 ${file.name} (${(file.size / 1024).toFixed(0)}KB)`,
      note ? `💬 *Not:* ${note}` : '',
      `🕐 ${tarih}`,
    ].filter(Boolean).join('\n')

    // File'ı buffer'a çevir
    const buffer = Buffer.from(await file.arrayBuffer())

    // Resim ise içerik kontrolü yap (AI ile)
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    if (isImage) {
      const check = await checkImageContent(buffer, file.type)
      if (!check.ok) {
        // Müstehcen ise: otomatik IP engelle + Telegram'a bildir
        if (check.reason === 'obscene') {
          await blockIP(ip)
          await sendTelegramNotification(
            `🚨 *UYGUNSUZ ICERIK TESPIT EDILDI*\n\n👤 ${name}\n📞 ${phone}\n🔒 IP: \`${ip}\`\n📄 Dosya: ${file.name}\n\n⛔ IP otomatik engellendi.\nKaldirmak icin: /engelkaldir ${ip}`
          )
          return NextResponse.json({
            ok: false,
            rejected: true,
            blocked: true,
            message: locale === 'tr'
              ? 'Uygunsuz icerik tespit edildi. Erisiminiz kisitlanmistir.'
              : 'Inappropriate content detected. Your access has been restricted.',
          })
        }

        // Konu dışı ise: sadece reddet, engelleme
        const rejectMsg: Record<string, string> = {
          tr: 'Bu resim konumuzla ilgili gorunmuyor. Lutfen dogal tas, yapi, cephe, proje veya insaat ile ilgili resimler gonderin.',
          en: 'This image doesn\'t seem related to our business. Please send images related to natural stone, construction, facade or projects.',
          es: 'Esta imagen no parece estar relacionada con nuestro negocio. Envie imagenes de piedra natural, construccion o proyectos.',
          de: 'Dieses Bild scheint nicht mit unserem Geschaft zusammenzuhangen. Bitte senden Sie Bilder zu Naturstein, Bau oder Projekten.',
          fr: 'Cette image ne semble pas liee a notre activite. Veuillez envoyer des images de pierre naturelle, construction ou projets.',
          ru: 'Это изображение не связано с нашей деятельностью. Отправьте изображения натурального камня, строительства или проектов.',
          ar: 'هذه الصورة لا تبدو مرتبطة بعملنا. يرجى ارسال صور تتعلق بالحجر الطبيعي او البناء او المشاريع.',
        }
        return NextResponse.json({
          ok: false,
          rejected: true,
          message: rejectMsg[locale] || rejectMsg.en,
        })
      }
    }

    // Telegram FormData oluştur
    const tgForm = new FormData()
    tgForm.append('chat_id', chatId)
    tgForm.append('caption', caption)
    tgForm.append('parse_mode', 'Markdown')

    // Blob oluştur
    const blob = new Blob([buffer], { type: file.type })

    if (isImage) {
      tgForm.append('photo', blob, file.name)
      await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        body: tgForm,
      })
    } else {
      tgForm.append('document', blob, file.name)
      await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
        method: 'POST',
        body: tgForm,
      })
    }

    // Dosya bildirimi sadece Telegram'a gider
    // Teklif süreci sonunda asıl detaylı mail (müşteri + admin) gönderilir

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[ChatFile] Error:', error)
    return NextResponse.json({ error: 'Dosya gönderilemedi' }, { status: 500 })
  }
}
