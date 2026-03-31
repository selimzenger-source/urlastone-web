import { NextRequest, NextResponse } from 'next/server'
import { CATEGORIES } from '@/lib/bot-knowledge'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const ADMIN_CHAT_ID = process.env.TELEGRAM_CHAT_ID

async function sendMessage(chatId: string | number, text: string) {
  if (!BOT_TOKEN) return
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
    }),
  })
}

export async function POST(req: NextRequest) {
  // Auth check
  const { secret } = await req.json()
  if (secret !== process.env.TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
    return NextResponse.json({ error: 'Bot token or chat ID missing' }, { status: 500 })
  }

  // 1. Set webhook
  const webhookUrl = 'https://www.urlastone.com/api/telegram'
  const webhookRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${webhookUrl}`)
  const webhookResult = await webhookRes.json()

  // 2. Send welcome message to Cihan
  const welcomeMsg = `🤖 *Merhaba Cihan!*

URLASTONE AI Asistan (Uri) yonetim sistemi hazir!

Bu bot ile Uri'nin bilgi tabanini yonetebilirsin. Musteri sordugunda Uri bu bilgileri kullanarak cevap verecek.

📂 *Mevcut Kategoriler:*
${Object.entries(CATEGORIES).map(([k, v]) => `• \`${k}\` - ${v}`).join('\n')}

📝 *Nasil Kullanilir:*

*1. Bilgi Ekle:*
\`/ekle teslimat Yurt ici 7-10 gun, yurt disi 15-25 gun\`
\`/ekle kampanya %15 yaz indirimi 30 Haziran'a kadar\`
\`/ekle fiyat Traverten 35-80$/m2, Bazalt 40-90$/m2\`

*2. Bilgi Gor:*
Sadece kategori adini yaz: \`teslimat\` veya \`/gor teslimat\`
Tumunu gor: \`/gor\`

*3. Bilgi Duzenle:*
\`/duzenle teslimat Yurt ici 5-7 gun, yurt disi 10-20 gun\`

*4. Bilgi Sil:*
\`/sil kampanya\`

💡 *Ornek Akis:*
1. \`/ekle teslimat Yurt ici siparis onayi sonrasi 7-10 is gunu. Yurt disi 15-25 is gunu.\`
2. \`/ekle odeme Banka havalesi (TL/USD/EUR), kredi karti, yurt disi L/C ve T/T\`
3. \`/ekle garanti Dogal tas omur boyu dayanikli, -20C don dayanimi, UV dayanikli\`
4. \`teslimat\` yazarak ekledigini kontrol et
5. \`/duzenle teslimat ...\` ile guncelle

✅ Ekledigin bilgiler aninda Uri'nin hafizasina eklenir ve musterilere bu bilgileri kullanarak cevap verir.`

  await sendMessage(ADMIN_CHAT_ID, welcomeMsg)

  return NextResponse.json({
    ok: true,
    webhook: webhookResult,
    message: 'Welcome message sent to admin',
  })
}
