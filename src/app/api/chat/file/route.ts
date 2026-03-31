import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

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
            text: 'Bu resim dogal tas, yapi, insaat, ev, villa, otel, cephe, duvar, peyzaj, mimari, proje veya inşaat malzemesi ile ilgili mi? Yoksa müstehcen, uygunsuz veya konu disi mi? Sadece "UYGUN" veya "UYGUNSUZ" yaz, baska bir sey yazma.',
          },
        ],
      }],
    })

    const text = response.content[0]?.type === 'text' ? response.content[0].text : ''
    if (text.includes('UYGUNSUZ')) {
      return { ok: false, reason: 'inappropriate' }
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
    if (isImage) {
      const check = await checkImageContent(buffer, file.type)
      if (!check.ok) {
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

    // Ayrıca email ile de bildir
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'URLASTONE Bot <bot@urlastone.com>',
            to: ['info@urlastone.com', 'cihanzenger@gmail.com'],
            subject: `Chatbot Dosya: ${name} - ${file.name}`,
            html: `
              <h2>Chatbot'tan Dosya Gönderildi</h2>
              <p><b>Ad:</b> ${name}</p>
              <p><b>Telefon:</b> ${phone}</p>
              <p><b>Dosya:</b> ${file.name} (${(file.size / 1024).toFixed(0)}KB)</p>
              <p><b>Tarih:</b> ${tarih}</p>
              <p style="color:#666;font-size:13px;">Dosya Telegram botuna gönderilmiştir.</p>
            `,
          }),
        })
      } catch {}
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[ChatFile] Error:', error)
    return NextResponse.json({ error: 'Dosya gönderilemedi' }, { status: 500 })
  }
}
