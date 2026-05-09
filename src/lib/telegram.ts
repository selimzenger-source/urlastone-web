// Tek bir admin'e mesaj gönder. Önce Markdown ile dener; Telegram 400 dönerse
// (içerikte parse'i kıran özel karakter var) parse_mode'suz düz text ile
// tekrar gönderir, böylece bildirim ASLA sessizce kaybolmaz.
async function postTelegramMessage(token: string, chatId: string, message: string): Promise<void> {
  try {
    let res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' }),
    })
    if (res.ok) return
    if (res.status === 400) {
      const errBody = await res.text().catch(() => '')
      console.warn(`[Telegram] Markdown parse failed (${chatId}), retrying plain:`, errBody.slice(0, 200))
      res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message }),
      })
      if (res.ok) return
    }
    const errBody = await res.text().catch(() => '')
    console.error(`[Telegram] Send failed (${chatId}, status ${res.status}):`, errBody.slice(0, 300))
  } catch (err) {
    console.error(`[Telegram] Network error (${chatId}):`, err)
  }
}

// Telegram bot bildirim gönderimi — tüm adminlere
export async function sendTelegramNotification(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatIds = (process.env.TELEGRAM_CHAT_ID || '').split(',').map(id => id.trim()).filter(Boolean)

  if (!token || chatIds.length === 0) {
    console.warn('[Telegram] Skipped: missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID')
    return
  }

  await Promise.allSettled(chatIds.map(chatId => postTelegramMessage(token, chatId, message)))
}

// Supabase Storage URL'ini düşük çözünürlüklü render URL'ine çevir (Pro tier özelliği)
// /storage/v1/object/public/... → /storage/v1/render/image/public/...?width=800&quality=70
export function toLowResUrl(url: string, width = 800, quality = 70): string {
  if (!url || !url.includes('/storage/v1/object/public/')) return url
  return url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/') +
    `?width=${width}&quality=${quality}`
}

// Telegram'a fotograf(lar) gonder
// options.separate = true ise her foto ayri mesajda gonderilir (her biri tam boyda gorunur)
// options.separate = false (default) ise media group olarak 2-10 foto yan yana
// Fotograflar URL ile gönderilir (Telegram sunucusu kendisi indirir, bizden bandwidth yemez)
export async function sendTelegramMediaGroup(
  photos: Array<{ url: string; caption?: string }>,
  options: { separate?: boolean } = {}
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatIds = (process.env.TELEGRAM_CHAT_ID || '').split(',').map(id => id.trim()).filter(Boolean)

  if (!token || chatIds.length === 0) return
  if (photos.length < 1) return

  async function sendPhoto(chatId: string, photoUrl: string, caption?: string) {
    try {
      let res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, photo: photoUrl, caption, parse_mode: 'Markdown' }),
      })
      if (res.ok) return
      if (res.status === 400 && caption) {
        const errBody = await res.text().catch(() => '')
        console.warn(`[Telegram Photo] Markdown failed (${chatId}), retry plain:`, errBody.slice(0, 200))
        res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, photo: photoUrl, caption }),
        })
        if (res.ok) return
      }
      const errBody = await res.text().catch(() => '')
      console.error(`[Telegram Photo] Send failed (${chatId}, ${res.status}):`, errBody.slice(0, 300))
    } catch (err) {
      console.error(`[Telegram Photo] Network error (${chatId}):`, err)
    }
  }

  // Ayri ayri gonder — her foto tam boyda gorunur (media group'ta kucuk kalir)
  if (options.separate || photos.length === 1) {
    for (const p of photos) {
      await Promise.allSettled(chatIds.map(chatId => sendPhoto(chatId, p.url, p.caption)))
    }
    return
  }

  // sendMediaGroup: caption Markdown bozulursa tüm grup başarısız olur — caption parse'siz daha güvenli
  const buildMedia = (withMarkdown: boolean) =>
    photos.slice(0, 10).map((p, i) => ({
      type: 'photo' as const,
      media: p.url,
      ...(i === 0 && p.caption
        ? withMarkdown
          ? { caption: p.caption, parse_mode: 'Markdown' as const }
          : { caption: p.caption }
        : {}),
    }))

  async function sendGroup(chatId: string) {
    try {
      let res = await fetch(`https://api.telegram.org/bot${token}/sendMediaGroup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, media: buildMedia(true) }),
      })
      if (res.ok) return
      if (res.status === 400) {
        const errBody = await res.text().catch(() => '')
        console.warn(`[Telegram MediaGroup] Markdown failed (${chatId}), retry plain:`, errBody.slice(0, 200))
        res = await fetch(`https://api.telegram.org/bot${token}/sendMediaGroup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, media: buildMedia(false) }),
        })
        if (res.ok) return
      }
      const errBody = await res.text().catch(() => '')
      console.error(`[Telegram MediaGroup] Send failed (${chatId}, ${res.status}):`, errBody.slice(0, 300))
    } catch (err) {
      console.error(`[Telegram MediaGroup] Network error (${chatId}):`, err)
    }
  }

  await Promise.allSettled(chatIds.map(chatId => sendGroup(chatId)))
}
