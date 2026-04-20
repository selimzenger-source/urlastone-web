// IndexNow API — Bing/Yandex'e URL bildirimi
// Yeni icerik (blog, proje) yayinlaninca arama motorlarina saniyeler icinde haber verir

const INDEXNOW_KEY = '3bb5b687c4c1628360b44325fb6f6bda'
const HOST = 'www.urlastone.com'

/**
 * Belirtilen URL'leri IndexNow'a gonder.
 * Hata verirse sessizce log atar — caller'i bozmaz.
 */
export async function pingIndexNow(urls: string[]): Promise<void> {
  if (!urls || urls.length === 0) return

  // Sadece kendi domain'imizdeki URL'ler
  const validUrls = urls.filter(u => typeof u === 'string' && u.startsWith('https://www.urlastone.com'))
  if (validUrls.length === 0) return

  try {
    const res = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
        urlList: validUrls,
      }),
    })
    console.log(`[IndexNow] ${validUrls.length} URL gonderildi, status: ${res.status}`)
  } catch (err) {
    console.error('[IndexNow] Error:', err)
  }
}

/**
 * Blog yayinlandiginda cagrilir: blog detay sayfasi + blog listesi + sitemap
 */
export function pingBlogPublished(slug: string): Promise<void> {
  return pingIndexNow([
    `https://www.urlastone.com/blog/${slug}`,
    'https://www.urlastone.com/blog',
    'https://www.urlastone.com/sitemap.xml',
  ])
}

/**
 * Proje eklendiginde cagrilir
 */
export function pingProjectAdded(slug: string): Promise<void> {
  return pingIndexNow([
    `https://www.urlastone.com/projelerimiz/${slug}`,
    'https://www.urlastone.com/projelerimiz',
    'https://www.urlastone.com/sitemap.xml',
  ])
}
