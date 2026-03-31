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
