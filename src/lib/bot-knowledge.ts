// Bot bilgi yönetimi - Vercel KV veya fallback olarak in-memory
// Telegram bot komutlarıyla yönetilir

let kvStore: Record<string, string> | null = null

// KV'den oku (Vercel KV yoksa in-memory fallback)
async function getKV(): Promise<Record<string, string>> {
  // Vercel KV varsa kullan
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import('@vercel/kv')
      const data = await kv.get<Record<string, string>>('bot_knowledge')
      return data || {}
    }
  } catch {}

  // Fallback: in-memory (cold start'ta sıfırlanır ama Telegram'dan tekrar eklenebilir)
  return kvStore || {}
}

async function setKV(data: Record<string, string>) {
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import('@vercel/kv')
      await kv.set('bot_knowledge', data)
      return
    }
  } catch {}

  kvStore = data
}

// Kategori listesi (varsayılan başlıklar)
const CATEGORIES: Record<string, string> = {
  teslimat: 'Teslimat Süreleri',
  odeme: 'Ödeme Yöntemleri',
  garanti: 'Garanti ve Dayanıklılık',
  uygulama: 'Uygulama / Montaj',
  numune: 'Numune',
  fiyat: 'Fiyatlandırma',
  stok: 'Stok ve Üretim',
  kampanya: 'Kampanya / İndirim',
  genel: 'Genel Bilgi',
}

// Tüm bilgileri oku
export async function getAllKnowledge(): Promise<Record<string, string>> {
  return getKV()
}

// Belirli kategoriyi oku
export async function getKnowledge(category: string): Promise<string | null> {
  const data = await getKV()
  return data[category] || null
}

// Kategori ekle/güncelle
export async function setKnowledge(category: string, content: string) {
  const data = await getKV()
  data[category] = content
  await setKV(data)
}

// Kategori sil
export async function deleteKnowledge(category: string) {
  const data = await getKV()
  delete data[category]
  await setKV(data)
}

// Dinamik bilgileri system prompt formatında döndür
export async function getDynamicPrompt(): Promise<string> {
  const data = await getKV()
  const entries = Object.entries(data)
  if (entries.length === 0) return ''

  let prompt = '\n\n## Güncel Bilgiler (Admin tarafından eklendi)\n'
  for (const [key, value] of entries) {
    const title = CATEGORIES[key] || key
    prompt += `### ${title}\n${value}\n\n`
  }
  return prompt
}

// Telegram komut yardımı
export function getHelpText(): string {
  return `🤖 *URLASTONE Bot Yönetimi*

📂 *Kategoriler:*
${Object.entries(CATEGORIES).map(([k, v]) => `• \`${k}\` - ${v}`).join('\n')}

📝 *Komutlar:*
/gor - Tüm bilgileri göster
/gor [kategori] - Belirli kategoriyi göster
/ekle [kategori] [bilgi] - Bilgi ekle
/duzenle [kategori] [bilgi] - Bilgiyi güncelle
/sil [kategori] - Kategoriyi sil
/engelle [IP] - IP adresini engelle
/engelkaldir [IP] - IP engelini kaldır
/engelliler - Engelli IP listesi
/yardim - Bu mesajı göster

📌 *Örnek:*
\`/ekle teslimat Yurt içi 7-10 gün, yurt dışı 15-25 gün\`
\`/ekle kampanya %15 yaz indirimi 30 Haziran'a kadar\`
\`/duzenle fiyat Traverten 35-80$/m², Bazalt 40-90$/m²\`
\`/gor teslimat\`
\`/sil kampanya\``
}

// IP Engelleme sistemi
export async function getBlockedIPs(): Promise<string[]> {
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import('@vercel/kv')
      const data = await kv.get<string[]>('blocked_ips')
      return data || []
    }
  } catch {}
  return blockedIPsStore
}

export async function blockIP(ip: string): Promise<void> {
  const ips = await getBlockedIPs()
  if (!ips.includes(ip)) {
    ips.push(ip)
    try {
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        const { kv } = await import('@vercel/kv')
        await kv.set('blocked_ips', ips)
        return
      }
    } catch {}
    blockedIPsStore = ips
  }
}

export async function unblockIP(ip: string): Promise<boolean> {
  const ips = await getBlockedIPs()
  const idx = ips.indexOf(ip)
  if (idx === -1) return false
  ips.splice(idx, 1)
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import('@vercel/kv')
      await kv.set('blocked_ips', ips)
      return true
    }
  } catch {}
  blockedIPsStore = ips
  return true
}

export async function isIPBlocked(ip: string): Promise<boolean> {
  const ips = await getBlockedIPs()
  return ips.includes(ip)
}

let blockedIPsStore: string[] = []

export { CATEGORIES }
