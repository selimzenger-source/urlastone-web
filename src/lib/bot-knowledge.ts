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
/yardim - Bu mesajı göster

📌 *Örnek:*
\`/ekle teslimat Yurt içi 7-10 gün, yurt dışı 15-25 gün\`
\`/ekle kampanya %15 yaz indirimi 30 Haziran'a kadar\`
\`/duzenle fiyat Traverten 35-80$/m², Bazalt 40-90$/m²\`
\`/gor teslimat\`
\`/sil kampanya\``
}

export { CATEGORIES }
