import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase'

export const maxDuration = 120

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Tavily web search for current trends
async function searchTrends(): Promise<string> {
  const tavilyKey = process.env.TAVILY_API_KEY
  if (!tavilyKey) return 'Güncel trend verisi bulunamadı.'

  try {
    const queries = [
      'doğal taş dış cephe trendleri 2026',
      'natural stone facade architecture trends',
      'sürdürülebilir mimari taş kullanımı',
    ]

    const results: string[] = []
    for (const query of queries) {
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query,
          max_results: 3,
          search_depth: 'basic',
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const snippets = (data.results || [])
          .slice(0, 2)
          .map((r: { title: string; content: string }) => `- ${r.title}: ${r.content?.substring(0, 150)}`)
          .join('\n')
        if (snippets) results.push(snippets)
      }
    }

    return results.length > 0
      ? results.join('\n')
      : 'Güncel trend verisi bulunamadı.'
  } catch {
    return 'Güncel trend verisi bulunamadı.'
  }
}

// Get product info from DB
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

// POST /api/blogs/generate - AI blog generation (admin only)
export async function POST(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Step 1: Get existing blog titles to avoid repetition
    const { data: existingBlogs } = await supabaseAdmin
      .from('blogs')
      .select('title')
      .order('created_at', { ascending: false })

    const existingTitles = (existingBlogs || []).map((b: { title: string }) => b.title)
    const titlesList = existingTitles.length > 0
      ? existingTitles.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n')
      : 'Henüz blog yazısı yok.'

    // Step 2: Gather context - Tavily trends + DB products (parallel)
    const [trendData, productInfo] = await Promise.all([
      searchTrends(),
      getProductInfo(),
    ])

    // Step 3: Generate blog text with Claude
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `Sen, uluslararası çapta faaliyet gösteren premium doğal taş üreticisi "Urla Stone" (www.urlastone.com) firmasının Baş SEO Stratejisti ve Mimari Metin Yazarısın.

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

GÖREV: Yukarıdaki başlıklardan TAMAMEN FARKLI, güncel trendlerden de ilham alarak yepyeni bir doğal taş blog yazısı üret.

KURALLAR:
1. Konu doğal taş sektörüne, mimari trendlere, cephe kaplamasına, iç mekan tasarımına veya sürdürülebilir yapı malzemelerine dair olmalı
2. Başlık: 6-7 kelime, çarpıcı, SEO uyumlu, Türkçe
3. İçerik: 500-600 kelime, HTML formatında (<h2>, <h3>, <p>, <strong> tagları)
4. Marka entegrasyonu: Rockshell teknolojisi, AI Simülasyon veya ürün çeşitliliğine konuyu bozmadan doğal referans
5. CTA: Yazı sonunda okuyucuyu web sitesindeki AI Simülasyonu denemeye veya ürünleri keşfetmeye davet et
6. Meta description: 150-160 karakter, SEO uyumlu
7. Profesyonel ve bilgilendirici ton, reklam diline kaçma
8. Kapak fotoğrafı için kısa bir İngilizce prompt üret (doğal taş mimarisi temalı, metin içermeyecek, konuyla bütünleşik özgün bir görsel)

ÇIKTI FORMATI (SADECE JSON, başka metin yok):
{
  "title": "...",
  "content": "<h2>...</h2><p>...</p>...",
  "meta_description": "...",
  "cover_image_prompt": "..."
}`
      }]
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI yanıtı parse edilemedi' }, { status: 500 })
    }

    const generated = JSON.parse(jsonMatch[0])

    // Step 4: Generate cover image with Gemini
    let coverImageUrl = ''
    try {
      coverImageUrl = await generateCoverImage(generated.cover_image_prompt || generated.title)
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

async function generateCoverImage(prompt: string): Promise<string> {
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
