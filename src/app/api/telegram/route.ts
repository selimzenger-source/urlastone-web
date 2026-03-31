import { NextRequest, NextResponse } from 'next/server'
import {
  getAllKnowledge,
  getKnowledge,
  setKnowledge,
  deleteKnowledge,
  getHelpText,
  CATEGORIES,
} from '@/lib/bot-knowledge'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
// Birden fazla admin destekle (virgülle ayrılmış)
const ADMIN_IDS = (process.env.TELEGRAM_CHAT_ID || '').split(',').map(id => id.trim())

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

// Telegram Webhook handler
export async function POST(req: NextRequest) {
  try {
    const update = await req.json()
    const message = update.message
    if (!message?.text) return NextResponse.json({ ok: true })

    const chatId = message.chat.id
    const text = message.text.trim()

    // Sadece admin komut kullanabilir (birden fazla admin desteği)
    const isAdmin = ADMIN_IDS.includes(String(chatId))
    console.log(`[Telegram] chatId: ${chatId}, ADMIN_IDS: ${JSON.stringify(ADMIN_IDS)}, isAdmin: ${isAdmin}`)
    if (!isAdmin) {
      await sendMessage(chatId, `Bu bot sadece yöneticiler tarafından kullanılabilir. (ID: ${chatId})`)
      return NextResponse.json({ ok: true })
    }

    // /start veya /yardim
    if (text === '/start' || text === '/yardim') {
      await sendMessage(chatId, getHelpText())
      return NextResponse.json({ ok: true })
    }

    // /gor - Tüm bilgileri göster
    if (text === '/gor') {
      const data = await getAllKnowledge()
      const entries = Object.entries(data)

      if (entries.length === 0) {
        await sendMessage(chatId, '📭 Henüz eklenmiş bilgi yok.\n\nKullanım: `/ekle [kategori] [bilgi]`\n\nKategoriler:\n' +
          Object.entries(CATEGORIES).map(([k, v]) => `• \`${k}\` - ${v}`).join('\n'))
      } else {
        let msg = '📋 *Mevcut Bilgiler:*\n\n'
        for (const [key, value] of entries) {
          const title = CATEGORIES[key] || key
          msg += `📂 *${title}* (\`${key}\`)\n${value}\n\n`
        }
        msg += `\n_Toplam ${entries.length} kategori_`
        await sendMessage(chatId, msg)
      }
      return NextResponse.json({ ok: true })
    }

    // /gor [kategori]
    if (text.startsWith('/gor ')) {
      const category = text.slice(5).trim().toLowerCase()
      const content = await getKnowledge(category)
      if (content) {
        const title = CATEGORIES[category] || category
        await sendMessage(chatId, `📂 *${title}*\n\n${content}`)
      } else {
        await sendMessage(chatId, `❌ \`${category}\` kategorisinde bilgi yok.\n\nMevcut kategoriler:\n${Object.keys(CATEGORIES).map(k => `• \`${k}\``).join('\n')}`)
      }
      return NextResponse.json({ ok: true })
    }

    // /ekle [kategori] [bilgi]
    if (text.startsWith('/ekle ')) {
      const parts = text.slice(6).trim()
      const spaceIndex = parts.indexOf(' ')
      if (spaceIndex === -1) {
        await sendMessage(chatId, '❌ Kullanım: `/ekle [kategori] [bilgi]`\n\nÖrnek: `/ekle teslimat Yurt içi 7-10 gün`')
        return NextResponse.json({ ok: true })
      }

      const category = parts.slice(0, spaceIndex).toLowerCase()
      const content = parts.slice(spaceIndex + 1).trim()

      // Mevcut içeriğe ekle
      const existing = await getKnowledge(category)
      const newContent = existing ? `${existing}\n${content}` : content
      await setKnowledge(category, newContent)

      const title = CATEGORIES[category] || category
      await sendMessage(chatId, `✅ *${title}* kategorisine eklendi:\n\n${content}\n\n📂 Güncel içerik:\n${newContent}`)
      return NextResponse.json({ ok: true })
    }

    // /duzenle [kategori] [bilgi] - mevcut içeriği tamamen değiştirir
    if (text.startsWith('/duzenle ')) {
      const parts = text.slice(9).trim()
      const spaceIndex = parts.indexOf(' ')
      if (spaceIndex === -1) {
        await sendMessage(chatId, '❌ Kullanım: `/duzenle [kategori] [yeni bilgi]`\n\nÖrnek: `/duzenle teslimat Yurt içi 5-7 gün, yurt dışı 10-20 gün`')
        return NextResponse.json({ ok: true })
      }

      const category = parts.slice(0, spaceIndex).toLowerCase()
      const content = parts.slice(spaceIndex + 1).trim()

      await setKnowledge(category, content)

      const title = CATEGORIES[category] || category
      await sendMessage(chatId, `✏️ *${title}* güncellendi:\n\n${content}`)
      return NextResponse.json({ ok: true })
    }

    // /sil [kategori]
    if (text.startsWith('/sil ')) {
      const category = text.slice(5).trim().toLowerCase()
      const existing = await getKnowledge(category)

      if (!existing) {
        await sendMessage(chatId, `❌ \`${category}\` kategorisinde bilgi bulunamadı.`)
      } else {
        await deleteKnowledge(category)
        const title = CATEGORIES[category] || category
        await sendMessage(chatId, `🗑 *${title}* kategorisi silindi.`)
      }
      return NextResponse.json({ ok: true })
    }

    // Bilinmeyen komut
    if (text.startsWith('/')) {
      await sendMessage(chatId, '❓ Bilinmeyen komut. /yardim yazarak komut listesini görebilirsiniz.')
      return NextResponse.json({ ok: true })
    }

    // Komut olmayan mesajlar — kategori adı mı yazmış kontrol et
    const lowerText = text.toLowerCase()
    if (CATEGORIES[lowerText]) {
      const content = await getKnowledge(lowerText)
      const title = CATEGORIES[lowerText]
      if (content) {
        await sendMessage(chatId, `📂 *${title}*\n\n${content}\n\n✏️ Düzenlemek için:\n\`/duzenle ${lowerText} [yeni bilgi]\`\n\n➕ Eklemek için:\n\`/ekle ${lowerText} [ek bilgi]\``)
      } else {
        await sendMessage(chatId, `📂 *${title}* - Henüz bilgi eklenmemiş.\n\n➕ Eklemek için:\n\`/ekle ${lowerText} [bilgi]\``)
      }
      return NextResponse.json({ ok: true })
    }

    // Tanınmayan mesaj
    await sendMessage(chatId, '💡 Komut veya kategori adı yazın.\n\nKategoriler: ' + Object.keys(CATEGORIES).join(', ') + '\n\n/yardim yazarak detaylı bilgi alabilirsiniz.')
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[Telegram Webhook] Error:', error)
    return NextResponse.json({ ok: true }) // Telegram'a her zaman 200 dön
  }
}
