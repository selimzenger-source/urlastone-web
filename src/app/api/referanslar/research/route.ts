import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const pw = req.headers.get('x-admin-password')
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { companyName, city } = await req.json()
  if (!companyName?.trim()) {
    return NextResponse.json({ error: 'Firma adı gerekli' }, { status: 400 })
  }

  const name = companyName.trim()
  const cityStr = city?.trim() || ''
  let description = ''
  let logoUrl: string | null = null

  try {
    // 1. Tavily ile firma hakkında web araması
    const tavilyKey = process.env.TAVILY_API_KEY
    let searchResults = ''

    if (tavilyKey) {
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
          for (const r of results) {
            try {
              const url = new URL(r.url)
              // Firma kendi sitesiyse domain'den logo çek
              const domain = url.hostname.replace('www.', '')
              // Genel haber/dizin siteleri hariç tut
              const skipDomains = ['linkedin.com', 'facebook.com', 'instagram.com', 'twitter.com', 'wikipedia.org', 'youtube.com', 'tripadvisor.com', 'google.com', 'sikayetvar.com']
              if (!skipDomains.some(s => domain.includes(s))) {
                // Clearbit logo API ile dene
                const testUrl = `https://logo.clearbit.com/${domain}`
                const logoTest = await fetch(testUrl, { method: 'HEAD' })
                if (logoTest.ok) {
                  logoUrl = testUrl
                  break
                }
              }
            } catch { /* skip invalid urls */ }
          }
        }
      } catch (e) {
        console.error('Tavily search error:', e)
      }
    }

    // 2. Google favicon fallback
    if (!logoUrl) {
      // Basit bir domain tahmin et
      const simpleName = name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w: string) => !['ve', 'and', 'the', 'co', 'ltd', 'llc', 'inc'].includes(w))
        .slice(0, 2)
        .join('')

      if (simpleName.length > 2) {
        // .com.tr ve .com dene
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

    // 3. Claude ile 1-2 cümle açıklama üret
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
    } else {
      description = ''
    }

    return NextResponse.json({
      description,
      logo_url: logoUrl,
    })
  } catch (error) {
    console.error('Research error:', error)
    return NextResponse.json({ error: 'Araştırma sırasında hata oluştu' }, { status: 500 })
  }
}
