// Telegram bot bildirim gönderimi — tüm adminlere
export async function sendTelegramNotification(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatIds = (process.env.TELEGRAM_CHAT_ID || '').split(',').map(id => id.trim()).filter(Boolean)

  if (!token || chatIds.length === 0) return

  // Tüm adminlere paralel gönder
  await Promise.allSettled(
    chatIds.map(chatId =>
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      }).catch(err => console.error(`[Telegram] Error (${chatId}):`, err))
    )
  )
}

// Supabase Storage URL'ini düşük çözünürlüklü render URL'ine çevir (Pro tier özelliği)
// /storage/v1/object/public/... → /storage/v1/render/image/public/...?width=800&quality=70
export function toLowResUrl(url: string, width = 800, quality = 70): string {
  if (!url || !url.includes('/storage/v1/object/public/')) return url
  return url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/') +
    `?width=${width}&quality=${quality}`
}

// Telegram'a 2-10 fotoğraf göndermek için media group
// Fotograflar URL ile gönderilir (Telegram sunucusu kendisi indirir, bizden bandwidth yemez)
export async function sendTelegramMediaGroup(
  photos: Array<{ url: string; caption?: string }>
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatIds = (process.env.TELEGRAM_CHAT_ID || '').split(',').map(id => id.trim()).filter(Boolean)

  if (!token || chatIds.length === 0) return
  if (photos.length < 1) return

  // Telegram sendMediaGroup 2-10 item kabul eder
  // Tek foto varsa sendPhoto kullan
  if (photos.length === 1) {
    const p = photos[0]
    await Promise.allSettled(
      chatIds.map(chatId =>
        fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            photo: p.url,
            caption: p.caption,
            parse_mode: 'Markdown',
          }),
        }).catch(err => console.error(`[Telegram Photo] Error (${chatId}):`, err))
      )
    )
    return
  }

  const media = photos.slice(0, 10).map((p, i) => ({
    type: 'photo',
    media: p.url,
    // Sadece ilk foto'ya caption koyulur (media group kurali)
    ...(i === 0 && p.caption ? { caption: p.caption, parse_mode: 'Markdown' } : {}),
  }))

  await Promise.allSettled(
    chatIds.map(chatId =>
      fetch(`https://api.telegram.org/bot${token}/sendMediaGroup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, media }),
      }).catch(err => console.error(`[Telegram MediaGroup] Error (${chatId}):`, err))
    )
  )
}
