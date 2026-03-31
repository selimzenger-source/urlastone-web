import { NextRequest, NextResponse } from 'next/server'

// Dosyayı Telegram'a gönder (depolama gerektirmez)
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const name = formData.get('name') as string || '-'
    const phone = formData.get('phone') as string || '-'
    const locale = formData.get('locale') as string || 'tr'

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
      `🕐 ${tarih}`,
    ].join('\n')

    // Telegram FormData oluştur
    const tgForm = new FormData()
    tgForm.append('chat_id', chatId)
    tgForm.append('caption', caption)
    tgForm.append('parse_mode', 'Markdown')

    // File'ı blob olarak ekle
    const buffer = Buffer.from(await file.arrayBuffer())
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
