import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const pw = req.headers.get('x-admin-password')
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { companyName, city, websiteUrl } = await req.json()
  if (!companyName?.trim()) {
    return NextResponse.json({ error: 'Firma adı gerekli' }, { status: 400 })
  }

  const name = companyName.trim()
  const cityStr = city?.trim() || ''
  let description = ''
  let logoUrl: string | null = null
  let searchResults = ''

  try {
    // 1. Website URL verilmişse direkt siteyi çek
    let aboutPageUrl = ''
    if (websiteUrl?.trim()) {
      const rawUrl = websiteUrl.trim().startsWith('http') ? websiteUrl.trim() : `https://${websiteUrl.trim()}`

      // Tüm varyasyonları dene: www/www yok, https/http
      const urlSet: string[] = []
      for (const proto of ['https://', 'http://']) {
        const host = rawUrl.replace(/^https?:\/\//, '')
        if (!urlSet.includes(`${proto}${host}`)) urlSet.push(`${proto}${host}`)
        const alt = host.startsWith('www.') ? host.replace('www.', '') : `www.${host}`
        if (!urlSet.includes(`${proto}${alt}`)) urlSet.push(`${proto}${alt}`)
      }

      for (const tryUrl of urlSet) {
        try {
          console.log('[Research] Trying URL:', tryUrl)
          const siteRes = await fetch(tryUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
              'Accept-Encoding': 'identity',
              'Cache-Control': 'no-cache',
            },
            redirect: 'follow',
            signal: AbortSignal.timeout(15000),
          })
          if (siteRes.ok) {
            const html = await siteRes.text()
            // Cloudflare challenge kontrolü
            if (html.includes('challenge-platform') || html.includes('Just a moment')) {
              console.log('[Research] Cloudflare challenge, skipping:', tryUrl)
              continue
            }
            console.log('[Research] Site fetched OK, length:', html.length)

            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
            const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
            const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)

            const parts = []
            if (titleMatch?.[1]) parts.push(`Site başlığı: ${titleMatch[1].trim()}`)
            if (descMatch?.[1]) parts.push(`Site açıklaması: ${descMatch[1].trim()}`)
            if (ogDescMatch?.[1] && ogDescMatch[1] !== descMatch?.[1]) parts.push(`OG açıklaması: ${ogDescMatch[1].trim()}`)

            // Sayfa içeriğini çek (script/style temizle)
            const cleanHtml = html
              .replace(/<script[\s\S]*?<\/script>/gi, '')
              .replace(/<style[\s\S]*?<\/style>/gi, '')
              .replace(/<nav[\s\S]*?<\/nav>/gi, '')
              .replace(/<footer[\s\S]*?<\/footer>/gi, '')
            const textContent = cleanHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 2000)
            if (textContent) parts.push(`Ana sayfa içeriği: ${textContent}`)

            if (parts.length > 0) {
              searchResults = parts.join('\n')
              console.log('[Research] Extracted content length:', searchResults.length)
            }

            // Logo çek: og:image > apple-touch-icon > favicon
            const ogImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
            const appleIcon = html.match(/<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i)
            const favicon = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i)
            const foundLogo = ogImg?.[1] || appleIcon?.[1] || favicon?.[1]
            if (foundLogo) {
              if (foundLogo.startsWith('http')) {
                logoUrl = foundLogo
              } else if (foundLogo.startsWith('/')) {
                const urlObj = new URL(tryUrl)
                logoUrl = `${urlObj.protocol}//${urlObj.host}${foundLogo}`
              }
              console.log('[Research] Logo found:', logoUrl)
            }

            // Hakkımızda linkini bul
            const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*(?:hakk|about|biz\s*kimiz|kurumsal|corporate|who\s*we)[^<]*)<\/a>/gi
            let linkMatch
            while ((linkMatch = linkRegex.exec(html)) !== null) {
              let href = linkMatch[1]
              if (href.startsWith('/')) {
                const urlObj = new URL(tryUrl)
                href = `${urlObj.protocol}//${urlObj.host}${href}`
              } else if (!href.startsWith('http')) {
                href = `${tryUrl.replace(/\/$/, '')}/${href}`
              }
              aboutPageUrl = href
              console.log('[Research] About page found:', aboutPageUrl)
              break
            }

            break // İlk başarılı URL yeterli
          }
        } catch (e) {
          console.log('[Research] URL failed:', tryUrl, e)
        }
      }

      // Clearbit logo fallback
      if (!logoUrl) {
        try {
          const urlStr = websiteUrl.trim().startsWith('http') ? websiteUrl.trim() : `https://${websiteUrl.trim()}`
          const urlObj = new URL(urlStr)
          const domain = urlObj.hostname.replace('www.', '')
          const clearbitUrl = `https://logo.clearbit.com/${domain}`
          const test = await fetch(clearbitUrl, { method: 'HEAD' })
          if (test.ok) {
            logoUrl = clearbitUrl
            console.log('[Research] Clearbit logo found:', logoUrl)
          }
        } catch { /* skip */ }
      }
    }

    // 2. Hakkımızda sayfasını çek
    if (aboutPageUrl) {
      try {
        console.log('[Research] Fetching about page:', aboutPageUrl)
        const aboutRes = await fetch(aboutPageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
          },
          redirect: 'follow',
          signal: AbortSignal.timeout(12000),
        })
        if (aboutRes.ok) {
          const html = await aboutRes.text()
          if (!html.includes('challenge-platform') && !html.includes('Just a moment')) {
            const cleanHtml = html
              .replace(/<script[\s\S]*?<\/script>/gi, '')
              .replace(/<style[\s\S]*?<\/style>/gi, '')
              .replace(/<nav[\s\S]*?<\/nav>/gi, '')
              .replace(/<footer[\s\S]*?<\/footer>/gi, '')
            const textContent = cleanHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 2000)
            if (textContent.length > 50) {
              searchResults += '\n\nHakkımızda sayfası içeriği:\n' + textContent
              console.log('[Research] About page content added, total length:', searchResults.length)
            }
          }
        }
      } catch (e) {
        console.log('[Research] About page fetch failed:', e)
      }
    }

    // 3. İsimden logo tahmini (URL verilmemişse veya bulunamadıysa)
    if (!logoUrl) {
      const simpleName = name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w: string) => !['ve', 'and', 'the', 'co', 'ltd', 'llc', 'inc'].includes(w))
        .slice(0, 2)
        .join('')

      if (simpleName.length > 2) {
        for (const ext of ['.com.tr', '.com']) {
          try {
            const testDomain = `${simpleName}${ext}`
            const clearbitUrl = `https://logo.clearbit.com/${testDomain}`
            const test = await fetch(clearbitUrl, { method: 'HEAD' })
            if (test.ok) {
              logoUrl = clearbitUrl
              break
            }
          } catch { /* skip */ }
        }
      }
    }

    // 4. Claude ile açıklama üret
    console.log('[Research] searchResults length:', searchResults.length, 'first 200:', searchResults.slice(0, 200))

    if (searchResults) {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `Aşağıdaki web sitesi içeriklerine dayanarak "${name}"${cityStr ? ` (${cityStr} bölgesinde)` : ''} firması hakkında kısa bir açıklama yaz.

KURALLAR:
- 1-2 cümle olsun. Kuruluş yılı, faaliyet alanı, konum gibi bilgiler ekle.
- Türkçe yaz. Sadece açıklama metnini döndür.
- SADECE site içeriğinde kesin olarak bulunan bilgileri yaz.
- Eğer site içeriğinde firma hakkında hiçbir bilgi YOKSA, sadece "Bilgi bulunamadı" yaz.
- Farklı şehirdeki veya farklı sektördeki benzer isimli firmalarla KARIŞTIRMA.${cityStr ? `\n- Firma ${cityStr} bölgesinde olmalı.` : ''}

Web sitesi içerikleri:
${searchResults}`
        }],
      })

      const textBlock = response.content.find(b => b.type === 'text')
      if (textBlock && textBlock.type === 'text') {
        description = textBlock.text.trim()
        console.log('[Research] Claude description:', description)
      }
    } else {
      console.log('[Research] No content found, skipping Claude')
    }

    return NextResponse.json({ description, logo_url: logoUrl })
  } catch (error) {
    console.error('Research error:', error)
    return NextResponse.json({ error: 'Araştırma sırasında hata oluştu' }, { status: 500 })
  }
}
