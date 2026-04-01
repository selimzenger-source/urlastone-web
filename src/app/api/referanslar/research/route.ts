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

  try {
    const tavilyKey = process.env.TAVILY_API_KEY
    let searchResults = ''

    // 1. Eğer website URL verilmişse, önce onu Tavily ile çek
    if (tavilyKey && websiteUrl?.trim()) {
      try {
        const siteRes = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: tavilyKey,
            query: `${name} site:${websiteUrl.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')}`,
            max_results: 3,
            search_depth: 'advanced',
            include_raw_content: false,
          }),
        })
        if (siteRes.ok) {
          const siteData = await siteRes.json()
          const results = siteData.results || []
          searchResults = results
            .map((r: { title: string; content: string }) => `${r.title}: ${r.content}`)
            .join('\n\n')

          // Verilen URL'den logo çek
          try {
            const urlObj = new URL(websiteUrl.trim().startsWith('http') ? websiteUrl.trim() : `https://${websiteUrl.trim()}`)
            const domain = urlObj.hostname.replace('www.', '')
            const clearbitUrl = `https://logo.clearbit.com/${domain}`
            const logoTest = await fetch(clearbitUrl, { method: 'HEAD' })
            if (logoTest.ok) logoUrl = clearbitUrl
          } catch { /* skip */ }
        }
      } catch (e) {
        console.error('Site search error:', e)
      }
    }

    // 2. Genel Tavily araması (site URL yoksa veya sonuç bulamadıysa)
    if (tavilyKey && !searchResults) {
      try {
        const tavilyRes = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: tavilyKey,
            query: `${name}${cityStr ? ' ' + cityStr : ''} firma şirket hakkında kuruluş bilgi`,
            max_results: 5,
            search_depth: 'advanced',
            include_raw_content: false,
          }),
        })

        if (tavilyRes.ok) {
          const tavilyData = await tavilyRes.json()
          const results = tavilyData.results || []
          searchResults = results
            .map((r: { title: string; content: string; url: string }) =>
              `${r.title}: ${r.content}`
            )
            .join('\n\n')

          // Logo için domain bulmaya çalış
          if (!logoUrl) {
            for (const r of results) {
              try {
                const url = new URL(r.url)
                const domain = url.hostname.replace('www.', '')
                const skipDomains = ['linkedin.com', 'facebook.com', 'instagram.com', 'twitter.com', 'wikipedia.org', 'youtube.com', 'tripadvisor.com', 'google.com', 'sikayetvar.com']
                if (!skipDomains.some(s => domain.includes(s))) {
                  const testUrl = `https://logo.clearbit.com/${domain}`
                  const logoTest = await fetch(testUrl, { method: 'HEAD' })
                  if (logoTest.ok) {
                    logoUrl = testUrl
                    break
                  }
                }
              } catch { /* skip */ }
            }
          }
        }
      } catch (e) {
        console.error('Tavily search error:', e)
      }
    }

    // 3. Google favicon fallback
    if (!logoUrl) {
      // Verilen URL'den dene
      if (websiteUrl?.trim()) {
        try {
          const urlStr = websiteUrl.trim().startsWith('http') ? websiteUrl.trim() : `https://${websiteUrl.trim()}`
          const urlObj = new URL(urlStr)
          const domain = urlObj.hostname.replace('www.', '')
          // Instagram ise profil resmi yok, skip
          if (!domain.includes('instagram.com')) {
            const clearbitUrl = `https://logo.clearbit.com/${domain}`
            const test = await fetch(clearbitUrl, { method: 'HEAD' })
            if (test.ok) logoUrl = clearbitUrl
          }
        } catch { /* skip */ }
      }

      // İsimden domain tahmin et
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
    }

    // 4. Website URL verilmişse, HER ZAMAN direkt siteyi de çek (Tavily yetersiz olabilir)
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

      // Önce ana sayfayı çek, sonra nav linklerinden hakkımızda sayfasını bul
      for (const tryUrl of urlSet) {
        try {
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
            // Cloudflare challenge sayfası kontrolü
            if (html.includes('challenge-platform') || html.includes('Just a moment')) continue
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
            const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
            const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
            const parts = []
            if (titleMatch?.[1]) parts.push(`Site başlığı: ${titleMatch[1].trim()}`)
            if (descMatch?.[1]) parts.push(`Site açıklaması: ${descMatch[1].trim()}`)
            if (ogDescMatch?.[1] && ogDescMatch[1] !== descMatch?.[1]) parts.push(`OG açıklaması: ${ogDescMatch[1].trim()}`)
            const cleanHtml = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '')
            const textContent = cleanHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1000)
            if (textContent) parts.push(`Site içeriği: ${textContent}`)
            if (parts.length > 0) {
              searchResults += (searchResults ? '\n\n' : '') + parts.join('\n')
            }
            // Siteden logo çek (og:image veya favicon)
            if (!logoUrl) {
              const ogImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
              const appleIcon = html.match(/<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i)
              const favicon = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i)
              const found = ogImg?.[1] || appleIcon?.[1] || favicon?.[1]
              if (found) {
                if (found.startsWith('http')) {
                  logoUrl = found
                } else if (found.startsWith('/')) {
                  const urlObj = new URL(tryUrl)
                  logoUrl = `${urlObj.protocol}//${urlObj.host}${found}`
                }
              }
            }
            // Ana sayfadan hakkımızda linkini bul
            if (!aboutPageUrl) {
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
                break
              }
            }
            // Ana sayfa yeterli bilgi verdiyse dur
            if (searchResults.length > 800) break
          }
        } catch { /* try next URL */ }
      }
    }

    // 4b. Hakkımızda sayfası bulunduysa onu da çek
    if (aboutPageUrl && searchResults.length < 800) {
      try {
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
            const cleanHtml = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<nav[\s\S]*?<\/nav>/gi, '').replace(/<footer[\s\S]*?<\/footer>/gi, '')
            const textContent = cleanHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1500)
            if (textContent.length > 50) {
              searchResults += '\n\nHakkımızda sayfası:\n' + textContent
            }
          }
        }
      } catch { /* skip */ }
    }

    // 5. Claude ile açıklama üret
    if (searchResults) {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `Aşağıdaki web arama sonuçlarına dayanarak "${name}"${cityStr ? ` (${cityStr} bölgesinde)` : ''} firması hakkında kısa bir açıklama yaz.

KURALLAR:
- 1-2 cümle olsun. Kuruluş yılı, faaliyet alanı, konum gibi bilgiler ekle.
- Türkçe yaz. Sadece açıklama metnini döndür.
- SADECE arama sonuçlarında kesin olarak bulunan bilgileri yaz.
- Eğer arama sonuçlarında bu firma hakkında güvenilir bilgi YOKSA, sadece "Bilgi bulunamadı" yaz. Asla uydurma bilgi yazma.
- Farklı şehirdeki veya farklı sektördeki benzer isimli firmalarla KARIŞTIRMA.${cityStr ? `\n- Firma ${cityStr} bölgesinde olmalı, başka şehirdeki benzer isimli firmalar değil.` : ''}

Arama sonuçları:
${searchResults}`
        }],
      })

      const textBlock = response.content.find(b => b.type === 'text')
      if (textBlock && textBlock.type === 'text') {
        description = textBlock.text.trim()
      }
    }

    return NextResponse.json({ description, logo_url: logoUrl })
  } catch (error) {
    console.error('Research error:', error)
    return NextResponse.json({ error: 'Araştırma sırasında hata oluştu' }, { status: 500 })
  }
}
