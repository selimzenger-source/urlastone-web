// Bot bilgi yönetimi - Vercel KV veya fallback olarak in-memory
// Telegram bot komutlarıyla yönetilir

import { supabase } from '@/lib/supabase'

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
  ihracat: 'İhracat / Export',
  teknik: 'Teknik Özellikler',
  proje: 'Proje Danışmanlığı',
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

// =====================================================
// Ürün & Proje Veritabanı - Uri chatbot için dinamik bilgi
// =====================================================

interface ProductRow {
  name: string
  code: string
  image_url: string | null
  category: { name: string; slug: string } | null
  stone_type: { name: string; code: string } | null
}

interface ProjectRow {
  project_name: string
  city: string
  product: string | null
  project_date: string | null
  photos: string[]
  category: string
  active: boolean
}

// Cache: 10 dakika
let productProjectCache: { data: string; timestamp: number } | null = null
const CACHE_TTL = 10 * 60 * 1000 // 10 dakika

function slugifyCity(city: string): string {
  const turkishMap: Record<string, string> = {
    'ç': 'c', 'Ç': 'c', 'ş': 's', 'Ş': 's', 'ğ': 'g', 'Ğ': 'g',
    'ü': 'u', 'Ü': 'u', 'ö': 'o', 'Ö': 'o', 'ı': 'i', 'İ': 'i',
    'â': 'a', 'î': 'i', 'û': 'u',
  }
  const parts = city.split(/[,\/]/).map(s => s.trim())
  const mainCity = parts[parts.length - 1] || parts[0] || ''
  return mainCity.split('').map(ch => turkishMap[ch] || ch).join('')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

export async function getProductProjectPrompt(): Promise<string> {
  // Cache kontrolü
  if (productProjectCache && Date.now() - productProjectCache.timestamp < CACHE_TTL) {
    return productProjectCache.data
  }

  try {
    // Paralel fetch
    const [productsRes, projectsRes, referansRes] = await Promise.all([
      supabase
        .from('products')
        .select('name, code, image_url, category:categories(name, slug), stone_type:stone_types(name, code)')
        .eq('is_active', true)
        .order('sort_order'),
      supabase
        .from('projects')
        .select('project_name, city, product, project_date, photos, category, active')
        .eq('active', true)
        .order('project_date', { ascending: true }),
      supabase
        .from('referanslar')
        .select('name, description, website_url, project:projects(id, project_name, city)')
        .eq('is_active', true)
        .order('sort_order'),
    ])

    const products = (productsRes.data || []) as unknown as ProductRow[]
    const projects = (projectsRes.data || []) as unknown as ProjectRow[]

    if (products.length === 0 && projects.length === 0) {
      productProjectCache = { data: '', timestamp: Date.now() }
      return ''
    }

    let prompt = '\n\n## Ürün Veritabanı (Güncel)\n'

    // Ürünleri kategoriye göre grupla
    const byCategory: Record<string, ProductRow[]> = {}
    for (const p of products) {
      const catName = p.category?.name || 'Diğer'
      if (!byCategory[catName]) byCategory[catName] = []
      byCategory[catName].push(p)
    }

    for (const [catName, prods] of Object.entries(byCategory)) {
      prompt += `### ${catName}\n`
      for (const p of prods) {
        const stoneType = p.stone_type?.name || ''
        const imgLink = p.image_url ? ` [Görsel](${p.image_url})` : ''
        prompt += `- **${p.name}** (Kod: ${p.code}) — ${stoneType}${imgLink}\n`
      }
      prompt += '\n'
    }

    // Ürün kodu arama rehberi
    prompt += `### Ürün Kodu Rehberi\n`
    prompt += `Müşteri bir ürün kodu söylediğinde (RKS 1, EBT 2, Scabas Mix vb.) yukarıdaki listeden eşleştir.\n`
    prompt += `Ürün görseli istendiğinde [Görsel] linkini paylaş.\n`
    prompt += `Ürün sayfasına yönlendirme: https://www.urlastone.com/urunlerimiz\n\n`

    // Taş türüne göre en çok kullanılan (proje sayısı)
    const stoneUsage: Record<string, number> = {}
    for (const proj of projects) {
      if (!proj.product) continue
      // Product alanından taş türü çıkar
      const prodLower = proj.product.toLowerCase()
      for (const p of products) {
        if (prodLower.includes(p.code.toLowerCase().replace(/\s+/g, '-')) ||
            prodLower.includes(p.code.toLowerCase().replace(/\s+/g, ''))) {
          const stName = p.stone_type?.name || 'Diğer'
          stoneUsage[stName] = (stoneUsage[stName] || 0) + 1
        }
      }
    }
    const topStones = Object.entries(stoneUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)

    if (topStones.length > 0) {
      prompt += `### En Çok Tercih Edilen Taş Türleri\n`
      topStones.forEach(([name, count], i) => {
        prompt += `${i + 1}. ${name} — ${count} projede kullanıldı\n`
      })
      prompt += '\n'
    }

    // Proje veritabanı
    prompt += `## Proje Veritabanı (${projects.length} proje)\n\n`

    // İlk ve son proje
    const dated = projects.filter(p => p.project_date)
    if (dated.length > 0) {
      const first = dated[0]
      const last = dated[dated.length - 1]
      prompt += `### İlk Proje\n`
      prompt += `- ${first.project_name} — ${first.city} (${first.project_date})\n`
      if (first.product) prompt += `  Ürün: ${first.product}\n`
      prompt += `  Link: https://www.urlastone.com/projelerimiz\n\n`

      prompt += `### Son Proje\n`
      prompt += `- ${last.project_name} — ${last.city} (${last.project_date})\n`
      if (last.product) prompt += `  Ürün: ${last.product}\n`
      prompt += `  Link: https://www.urlastone.com/projelerimiz\n\n`
    }

    // Şehir bazlı proje sayıları
    const cityProjects: Record<string, { count: number; mainCity: string; projects: string[] }> = {}
    for (const proj of projects) {
      const parts = proj.city.split(/[,\/]/).map(s => s.trim())
      const mainCity = parts[parts.length - 1] || parts[0] || ''
      const key = mainCity.toLowerCase()
      if (!cityProjects[key]) cityProjects[key] = { count: 0, mainCity, projects: [] }
      cityProjects[key].count++
      if (cityProjects[key].projects.length < 3) {
        cityProjects[key].projects.push(proj.project_name)
      }
    }

    prompt += `### Şehir Bazlı Projeler\n`
    prompt += `Müşteri bir şehirde proje olup olmadığını sorduğunda bu listeye bak:\n`
    const sortedCities = Object.entries(cityProjects).sort((a, b) => b[1].count - a[1].count)
    for (const [, info] of sortedCities) {
      const slug = slugifyCity(info.mainCity)
      prompt += `- **${info.mainCity}**: ${info.count} proje (${info.projects.join(', ')}${info.count > 3 ? '...' : ''}) → [Gör](https://www.urlastone.com/projelerimiz/${slug}-dogal-tas)\n`
    }
    prompt += `\nŞehir projesi linki formatı: https://www.urlastone.com/projelerimiz/SEHIR-dogal-tas (küçük harf, Türkçe karaktersiz)\n`
    prompt += `Şehirde proje yoksa: "Bu şehirde henüz projemiz yok ama Türkiye genelinde ${projects.length}+ projemiz var!" + genel proje sayfası linki\n\n`

    // Ürüne göre proje eşleştirme
    const productProjects: Record<string, string[]> = {}
    for (const proj of projects) {
      if (!proj.product) continue
      const prodKey = proj.product.split(/\s+/).slice(0, 2).join(' ') // "EBT-2 Scabas" → ilk 2 kelime
      if (!productProjects[prodKey]) productProjects[prodKey] = []
      if (productProjects[prodKey].length < 3) {
        productProjects[prodKey].push(`${proj.project_name} (${proj.city})`)
      }
    }

    if (Object.keys(productProjects).length > 0) {
      prompt += `### Ürüne Göre Projeler\n`
      prompt += `"Bu taşla yapılan projeleriniz var mı?" sorusuna cevap ver:\n`
      for (const [prod, projs] of Object.entries(productProjects)) {
        prompt += `- ${prod}: ${projs.join(', ')}\n`
      }
      prompt += '\n'
    }

    // Referanslar veritabanı
    const referanslar = (referansRes.data || []) as unknown as { name: string; description: string | null; website_url: string | null; project: { id: string; project_name: string; city: string } | null }[]
    if (referanslar.length > 0) {
      prompt += `## Referans Firmalar (${referanslar.length} referans)\n`
      prompt += `Müşteri bir referans firma hakkında sorduğunda bu listeden bilgi ver ve varsa proje linkini paylaş:\n`
      for (const ref of referanslar) {
        prompt += `- **${ref.name}**`
        if (ref.description) prompt += `: ${ref.description}`
        if (ref.website_url) prompt += ` (${ref.website_url})`
        if (ref.project) {
          const projSlug = slugifyCity(ref.project.project_name)
          prompt += ` → Proje: [${ref.project.project_name}](https://www.urlastone.com/projelerimiz/${projSlug})`
        }
        prompt += '\n'
      }
      prompt += `Referanslar sayfası: https://www.urlastone.com/referanslarimiz\n\n`
    }

    // Prompt'u max 14000 karakter ile sınırla
    const finalPrompt = prompt.length > 14000 ? prompt.slice(0, 14000) + '\n...(kısaltıldı)\n' : prompt
    productProjectCache = { data: finalPrompt, timestamp: Date.now() }
    return finalPrompt
  } catch (error) {
    console.error('[ProductProjectPrompt] Error:', error)
    return ''
  }
}
