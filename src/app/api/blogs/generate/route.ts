import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase'
import { getUrlaklinkerSupabase } from '@/lib/urlaklinker-supabase'

export const maxDuration = 120

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

type Brand = 'urlastone' | 'urlaklinker'

function resolveBrand(value: unknown): Brand {
  return value === 'urlaklinker' ? 'urlaklinker' : 'urlastone'
}

// Check bi-weekly AI blog limit (max 1 per 14 days)
async function checkBiWeeklyLimit(brand: Brand): Promise<{ allowed: boolean; message: string; currentMonth: string }> {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const currentMonth = `${year}-${String(month).padStart(2, '0')}`

  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()

  const db = brand === 'urlaklinker' ? getUrlaklinkerSupabase() : supabaseAdmin
  const table = brand === 'urlaklinker' ? 'urlaklinker_blogs' : 'blogs'

  const { data: recentBlogs, error } = await db
    .from(table)
    .select('id, created_at')
    .eq('ai_generated', true)
    .gte('created_at', fourteenDaysAgo)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Bi-weekly limit check error:', error)
    return { allowed: true, message: '', currentMonth }
  }

  const count = recentBlogs?.length || 0

  if (count >= 1 && recentBlogs && recentBlogs.length > 0) {
    const lastBlogDate = new Date(recentBlogs[0].created_at)
    const nextAllowedDate = new Date(lastBlogDate.getTime() + 14 * 24 * 60 * 60 * 1000)
    const daysRemaining = Math.ceil((nextAllowedDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))

    const nextDateStr = nextAllowedDate.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    return {
      allowed: false,
      message: `Son 14 günde zaten 1 AI blog üretildi. 2 haftada en fazla 1 AI blog üretilebilir. Sonraki blog ${nextDateStr} tarihinden sonra üretilebilir (${daysRemaining} gün kaldı).`,
      currentMonth
    }
  }

  return { allowed: true, message: '', currentMonth }
}

// Tavily web search for current trends
async function searchTrends(topic: string | undefined, brand: Brand): Promise<string> {
  const tavilyKey = process.env.TAVILY_API_KEY
  if (!tavilyKey) return 'Güncel trend verisi bulunamadı.'

  try {
    const queries: string[] = []

    if (brand === 'urlaklinker') {
      if (topic) {
        queries.push(`${topic} klinker tuğla mimari 2026`)
        queries.push(`${topic} handmade brick architecture trends`)
        queries.push(`${topic} terracotta facade design`)
      } else {
        queries.push('klinker tuğla cephe mimari trendleri 2026')
        queries.push('handmade brick facade architecture design trends 2026')
        queries.push('sürdürülebilir mimari klinker tuğla yeni projeler')
      }
    } else {
      if (topic) {
        queries.push(`${topic} doğal taş mimari 2026`)
        queries.push(`${topic} natural stone architecture trends`)
        queries.push(`${topic} sürdürülebilir yapı tasarım`)
      } else {
        queries.push('doğal taş dış cephe mimari trendleri 2026')
        queries.push('natural stone facade architecture design trends 2026')
        queries.push('sürdürülebilir mimari doğal taş kullanımı yeni projeler')
      }
    }

    const results: string[] = []
    const searchPromises = queries.map(async (query) => {
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query,
          max_results: 5,
          search_depth: 'advanced',
          include_raw_content: false,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const snippets = (data.results || [])
          .slice(0, 4)
          .map((r: { title: string; content: string; url: string }) =>
            `- ${r.title}: ${r.content?.substring(0, 400)}`)
          .join('\n')
        return snippets || ''
      }
      return ''
    })

    const searchResults = await Promise.all(searchPromises)
    for (const s of searchResults) {
      if (s) results.push(s)
    }

    return results.length > 0
      ? results.join('\n\n')
      : 'Güncel trend verisi bulunamadı.'
  } catch {
    return 'Güncel trend verisi bulunamadı.'
  }
}

// Get product info from urlastone DB (only used for urlastone brand)
async function getProductInfo(): Promise<string> {
  try {
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('name, code, stone_type, category, dimensions')
      .limit(20)

    if (!products || products.length === 0) return ''

    const productList = products.map((p: { name: string; code: string; stone_type?: string; category?: string }) =>
      `${p.name} (${p.code}) - ${p.stone_type || ''} ${p.category || ''}`
    ).join('\n')

    return `\nÜRÜN VERİTABANI (güncel ürünler):\n${productList}`
  } catch {
    return ''
  }
}

// POST /api/blogs/generate
export async function POST(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const brand = resolveBrand(body.brand)
  const userTopic = body.topic || ''
  const userDescription = body.description || ''

  // Check if just querying limit status
  if (body.checkLimit) {
    const limitStatus = await checkBiWeeklyLimit(brand)
    return NextResponse.json(limitStatus)
  }

  try {
    const limitCheck = await checkBiWeeklyLimit(brand)
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: limitCheck.message }, { status: 429 })
    }

    const db = brand === 'urlaklinker' ? getUrlaklinkerSupabase() : supabaseAdmin
    const table = brand === 'urlaklinker' ? 'urlaklinker_blogs' : 'blogs'

    const { data: existingBlogs } = await db
      .from(table)
      .select('title')
      .order('created_at', { ascending: false })

    const existingTitles = (existingBlogs || []).map((b: { title: string }) => b.title)
    const titlesList = existingTitles.length > 0
      ? existingTitles.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n')
      : 'Henüz blog yazısı yok.'

    const [trendData, productInfo] = await Promise.all([
      searchTrends(userTopic || undefined, brand),
      brand === 'urlastone' ? getProductInfo() : Promise.resolve(''),
    ])

    // Brand-specific prompt
    const prompt = brand === 'urlaklinker'
      ? `Sen, premium handmade klinker tuğla üreticisi "URLAKLINKER" (www.urlaklinker.com) firmasının Baş Mimari Editörü ve SEO Stratejistsin.

MARKA KİMLİĞİ:
- URLAKLINKER: İzmir/Urla merkezli, handmade klinker tuğla (handmade brick) üreticisi
- Slogan: "In Its Handmade State"
- Ürün: Handmade klinker tuğla, terracotta tonları, doğal kil + ateş zanaatı
- Editorial ton: bilgili, sıcak, güvenli — abartı yok. Malzeme, zanaat, ateş, jeoloji, modern cephe tasarımına atıf
- Kategoriler: Mimari, Zanaat, Malzeme, Tasarım, Sürdürülebilirlik

GÜNCEL SEKTÖR TRENDLERİ (Tavily araştırması):
${trendData}

MEVCUT BLOG BAŞLIKLARI (TEKRAR ETME):
${titlesList}

${userTopic ? `KULLANICININ İSTEDİĞİ KONU: "${userTopic}"${userDescription ? `\nEK AÇIKLAMA: "${userDescription}"` : ''}
GÖREV: Kullanıcının verdiği konu ve açıklama doğrultusunda, mevcut başlıklardan farklı, handmade klinker tuğla / klinker brick mimarisine dair editorial bir blog yazısı üret.` : `GÖREV: Yukarıdaki başlıklardan TAMAMEN FARKLI, güncel trendlerden de ilham alarak yepyeni bir handmade klinker tuğla mimari blog yazısı üret.`}

KURALLAR:
1. Konu SADECE klinker tuğla, handmade brick, terracotta cephe, modern tuğla mimarisi, zanaat / sürdürülebilir tuğla üretimine dair olmalı.
2. Başlık: 6-7 kelime, çarpıcı, SEO uyumlu, Türkçe, sonunda nokta YOK.
3. İçerik: EN AZ 1000 kelime, HTML formatında. SADECE bu tagleri kullan: <h2>, <h3>, <p>, <strong>
4. Editorial ton — reklam değil, mimarlar ve tasarımcılar için bilgi ve değer sunan yazı. URLAKLINKER / handmade state referansı doğal olarak 1-2 yerde geçmeli.
5. CTA: Yazı sonunda kısa ve doğal bir keşfetme daveti
6. Meta description: 150-160 karakter, SEO uyumlu
7. Profesyonel editorial ton, reklam diline kaçma
8. Kapak fotoğrafı için kısa bir İngilizce prompt üret (handmade klinker brick, terracotta facade, modern architecture, no text)

YAZI KALİTESİ VE FORMAT KURALLARI:
- Her paragraf 2-4 cümle olsun, akıcı
- H2 ile ana bölüm, H3 ile alt başlık
- Önemli terimleri <strong> ile vurgula
- Klişe giriş cümleleri kullanma
- Her blog farklı bakış açısı sunmalı

ÇIKTI FORMATI (SADECE JSON, başka metin yok):
{
  "title": "...",
  "content": "<h2>...</h2><p>...</p>...",
  "meta_description": "...",
  "cover_image_prompt": "..."
}`
      : `Sen, uluslararası çapta faaliyet gösteren premium doğal taş üreticisi "Urla Stone" (www.urlastone.com) firmasının Baş SEO Stratejisti ve Mimari Metin Yazarısın.

MARKA KİMLİĞİ:
- Rockshell (Taş Kabuk) Teknolojisi: Taşların 2 cm kalınlığında üretilmesi, klasik taşlar gibi binaya statik yük bindirmemesi, kimyasal yapıştırıcılarla pratik montaj
- AI Simülasyonu: Müşteriler web sitesinde kendi binalarının fotoğrafını yükleyerek taşların cephede nasıl duracağını anında görebilir
- Ürün Çeşitliliği: Traverten, Bazalt, Mermer ve Kalker (Limestone). Nature, Mix, Crazy, Line ebat kategorileri
- İzmir/Urla merkezli üretim, 25+ yıl tecrübe, 15+ ülkeye ihracat
- Türkiye'nin 81 iline anahtar teslim uygulama
${productInfo}

GÜNCEL SEKTÖR TRENDLERİ (Tavily araştırması):
${trendData}

MEVCUT BLOG BAŞLIKLARI (TEKRAR ETME):
${titlesList}

${userTopic ? `KULLANICININ İSTEDİĞİ KONU: "${userTopic}"${userDescription ? `\nEK AÇIKLAMA: "${userDescription}"` : ''}
GÖREV: Kullanıcının verdiği konu ve açıklama doğrultusunda, mevcut başlıklardan farklı, doğal taş sektörüne uygun bir blog yazısı üret.` : `GÖREV: Yukarıdaki başlıklardan TAMAMEN FARKLI, güncel trendlerden de ilham alarak yepyeni bir doğal taş blog yazısı üret.`}

KURALLAR:
1. Konu SADECE doğal taş sektörüne, mimari trendlere, cephe kaplamasına, iç mekan tasarımına veya sürdürülebilir yapı malzemelerine dair olmalı. Alakasız konu ÜRETME.
2. Başlık: 6-7 kelime, çarpıcı, SEO uyumlu, Türkçe. Mevcut başlıklarla benzer yapıda OLMAMALI.
3. İçerik: EN AZ 1000 kelime, HTML formatında. SADECE bu tagleri kullan: <h2>, <h3>, <p>, <strong>
4. Bilgilendirici ton: Reklam değil, okuyucuya gerçek bilgi ve değer sunan bir yazı olmalı. Marka referansı (Rockshell teknolojisi, AI Simülasyon) sadece doğal ve kısa olarak 1-2 yerde geçmeli, asıl odak bilgi ve eğitim olmalı
5. CTA: Yazı sonunda okuyucuyu web sitesindeki AI Simülasyonu denemeye veya ürünleri keşfetmeye davet et (kısa ve doğal)
6. Meta description: 150-160 karakter, SEO uyumlu
7. Profesyonel ve bilgilendirici ton, reklam diline kaçma
8. Kapak fotoğrafı için kısa bir İngilizce prompt üret (doğal taş mimarisi temalı, metin içermeyecek, konuyla bütünleşik özgün bir görsel)

YAZI KALİTESİ VE FORMAT KURALLARI (ÇOK ÖNEMLİ):
- Her paragraf 2-4 cümle olsun, okunaklı ve akıcı
- H2 ile ana bölüm başlıkları, H3 ile alt başlıklar kullan
- Önemli terimleri <strong> ile vurgula (her paragrafta 1-2 adet)
- Anlatım zengin, bilgilendirici ve okuyucuyu çeken tarzda olsun
- Klişe giriş cümleleri kullanma ("Günümüzde...", "Bilindiği gibi..." gibi)
- Her blog birbirinden TAMAMEN farklı bir bakış açısı ve anlatım tarzı sunmalı
- Bir blogun tonu bilimsel-teknik olabilir, diğeri hikaye anlatımı, diğeri rehber formatında olabilir — çeşitlilik sağla
- Benzer kelime kalıpları ve cümle yapılarını tekrar etme, her seferinde taze ve özgün yaz

ÇIKTI FORMATI (SADECE JSON, başka metin yok):
{
  "title": "...",
  "content": "<h2>...</h2><p>...</p>...",
  "meta_description": "...",
  "cover_image_prompt": "..."
}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }]
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI yanıtı parse edilemedi' }, { status: 500 })
    }

    const generated = JSON.parse(jsonMatch[0])

    if (generated.content) {
      generated.content = generated.content
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    }

    // Step 4: Generate cover image — Replicate Flux Pro for urlaklinker, Gemini for urlastone
    let coverImageUrl = ''
    try {
      if (brand === 'urlaklinker') {
        coverImageUrl = await generateCoverImageFlux(generated.cover_image_prompt || generated.title)
      } else {
        coverImageUrl = await generateCoverImageGemini(generated.cover_image_prompt || generated.title)
      }
    } catch (imgErr) {
      console.error('Cover image generation failed:', imgErr)
    }

    return NextResponse.json({
      title: generated.title,
      content: generated.content,
      meta_description: generated.meta_description,
      cover_image_url: coverImageUrl,
      cover_image_prompt: generated.cover_image_prompt,
    })

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

async function generateCoverImageGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) throw new Error('GOOGLE_AI_API_KEY not set')

  const models = [
    'gemini-2.5-flash-image',
    'gemini-3.1-flash-image-preview',
  ]

  const imagePrompt = `Professional architectural photography of ${prompt}. Luxury natural stone facade, high-end building exterior, editorial quality, golden hour lighting, no text, no watermark, no people. Magazine quality photography.`

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: imagePrompt }] }],
            generationConfig: {
              responseModalities: ['TEXT', 'IMAGE'],
            },
          }),
        }
      )

      if (!res.ok) continue

      const data = await res.json()
      const parts = data.candidates?.[0]?.content?.parts || []
      const imagePart = parts.find((p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData?.mimeType?.startsWith('image/'))

      if (imagePart?.inlineData) {
        const buffer = Buffer.from(imagePart.inlineData.data, 'base64')
        const fileName = `blog-covers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`

        const { error: uploadError } = await supabaseAdmin.storage
          .from('blog-covers')
          .upload(fileName, buffer, { upsert: true, contentType: 'image/jpeg' })

        if (uploadError) {
          if (uploadError.message.includes('not found') || uploadError.message.includes('Bucket')) {
            await supabaseAdmin.storage.createBucket('blog-covers', { public: true })
            await supabaseAdmin.storage
              .from('blog-covers')
              .upload(fileName, buffer, { upsert: true, contentType: 'image/jpeg' })
          } else {
            throw uploadError
          }
        }

        const { data: urlData } = supabaseAdmin.storage
          .from('blog-covers')
          .getPublicUrl(fileName)

        return urlData.publicUrl
      }
    } catch {
      continue
    }
  }

  return ''
}

// Replicate Flux Pro — uploaded into URLAKLINKER Supabase blog-covers bucket
async function generateCoverImageFlux(promptInput: string): Promise<string> {
  const token = process.env.REPLICATE_API_TOKEN
  if (!token) return ''

  try {
    const prompt =
      `Editorial architecture magazine cover photograph, 16:9 widescreen, premium quality, ` +
      `photorealistic, soft warm natural lighting, terracotta and ochre accents, ` +
      `museum-grade composition, fine paper-grain noise, no text no logos no labels. ` +
      `Subject: ${promptInput || 'handmade terracotta klinker brick architecture'}, ` +
      `subtle storytelling — craftsmanship, fire, clay, modern facade context.`

    const resp = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait',
      },
      body: JSON.stringify({
        input: {
          prompt,
          aspect_ratio: '16:9',
          output_format: 'jpg',
          output_quality: 90,
          safety_tolerance: 2,
          prompt_upsampling: true,
        },
      }),
    })
    if (!resp.ok) return ''
    const result: any = await resp.json()
    let outUrl: string | null = result.output
    if (Array.isArray(outUrl)) outUrl = outUrl[0]
    if (!outUrl) return ''

    const imgRes = await fetch(outUrl)
    if (!imgRes.ok) return ''
    const buf = Buffer.from(await imgRes.arrayBuffer())

    const db = getUrlaklinkerSupabase()
    const path = `urlaklinker-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.jpg`
    await db.storage.createBucket('blog-covers', { public: true }).catch(() => null)

    const { error: upErr } = await db.storage
      .from('blog-covers')
      .upload(path, buf, { contentType: 'image/jpeg', upsert: false })
    if (upErr) {
      console.error('[urlaklinker cover] upload error', upErr.message)
      return ''
    }
    const { data: pub } = db.storage.from('blog-covers').getPublicUrl(path)
    return pub?.publicUrl || ''
  } catch (e) {
    console.error('[urlaklinker cover] generation failed', e)
    return ''
  }
}
