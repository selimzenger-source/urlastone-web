import { NextRequest, NextResponse } from 'next/server'
import { sendTelegramNotification } from '@/lib/telegram'

// Lead bilgilerini email + Telegram ile bildir
export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, locale } = await req.json()

    if (!name || !phone) {
      return NextResponse.json({ error: 'Ad ve telefon gerekli' }, { status: 400 })
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '-'
    const tarih = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })

    // 1) Email bildirim (Resend)
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
            subject: `Yeni Chatbot Müşterisi: ${name}`,
            html: `
              <h2>Yeni Chatbot Müşterisi</h2>
              <table style="border-collapse:collapse;font-family:Arial,sans-serif;">
                <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Ad:</td><td style="padding:8px;border-bottom:1px solid #eee;">${name}</td></tr>
                <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Telefon:</td><td style="padding:8px;border-bottom:1px solid #eee;">${phone}</td></tr>
                ${email ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Email:</td><td style="padding:8px;border-bottom:1px solid #eee;">${email}</td></tr>` : ''}
                <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Dil:</td><td style="padding:8px;border-bottom:1px solid #eee;">${locale || 'tr'}</td></tr>
                <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">IP:</td><td style="padding:8px;border-bottom:1px solid #eee;">${ip}</td></tr>
                <tr><td style="padding:8px;font-weight:bold;">Tarih:</td><td style="padding:8px;">${tarih}</td></tr>
              </table>
              <p style="margin-top:16px;color:#666;font-size:13px;">Bu bildirim URLASTONE web sitesi chatbot'undan otomatik gönderilmiştir.</p>
            `,
          }),
        })
      } catch (emailErr) {
        console.error('[ChatLead] Email error:', emailErr)
      }
    }

    // 2) Telegram bildirim
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
