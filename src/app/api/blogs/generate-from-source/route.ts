import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase'

export const maxDuration = 120

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// POST /api/blogs/generate-from-source
// Accepts: { sourceText?: string, sourceImage?: string (base64), sourceImageType?: string }
export async function POST(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { sourceText, sourceImage, sourceImageType } = body

  if (!sourceText && !sourceImage) {
    return NextResponse.json({ error: 'Kaynak metin veya görsel gerekli' }, { status: 400 })
  }

  try {
    // Get existing blog titles to avoid repetition
    const { data: existingBlogs } = await supabaseAdmin
      .from('blogs')
      .select('title')
      .order('created_at', { ascending: false })

    const existingTitles = (existingBlogs || []).map((b: { title: string }) => b.title)

    // Get product info for context
    let productInfo = ''
    try {
      const { data: products } = await supabaseAdmin
        .from('products')
        .select('name, code, stone_type, category')
        .limit(15)
      if (products?.length) {
        productInfo = products.map((p: { name: string; code: string; stone_type?: string; category?: string }) =>
          `${p.name} (${p.code}) - ${p.stone_type || ''} ${p.category || ''}`
        ).join('\n')
      }
    } catch { /* skip */ }

    // Build Claude message content
    const contentParts: Anthropic.Messages.ContentBlockParam[] = []

    // If screenshot provided, add as image
    if (sourceImage) {
      const mediaType = (sourceImageType || 'image/png') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
      contentParts.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: sourceImage,
        },
      })
    }

    // Add the main prompt
    contentParts.push({
      type: 'text',
      text: `Sen, uluslararası çapta faaliyet gösteren premium doğal taş üreticisi "Urla Stone" (www.urlastone.com) firmasının blog yazarısın.

GÖREV: Aşağıdaki kaynak içeriği referans alarak, TAMAMEN YENİ ve ORİJİNAL bir Türkçe blog yazısı üret. Bu bir çeviri DEĞİL — kaynaktaki bilgiyi temel al ama farklı bir bakış açısı, anlatım tarzı ve yapıyla sun.

${sourceImage ? 'Yukarıdaki görseldeki metni oku ve referans al.' : ''}
${sourceText ? `KAYNAK METİN:\n${sourceText}` : ''}

ADAPTASYON KURALLARI (ÇOK ÖNEMLİ):
1. Firma adları → "Urla Stone" veya "URLASTONE" olarak değiştir
2. İnç (inch, ") → cm'ye çevir (1 inch = 2.54 cm). Örn: 1" → 2,5 cm
3. Feet, square foot → metrekare (m²) veya metre'ye çevir
4. Pound → kilogram'a çevir
5. ABD şehirleri/bölgeleri → İzmir, Urla, Türkiye olarak uyarla
6. Dolar ($) → genel ifadeler kullan, spesifik fiyat verme
7. Yabancı firma isimleri ve referansları → Urla Stone veya genel sektör ifadelerine dönüştür
8. Rockshell (Taş Kabuk) Teknolojisi: 2,5 cm kalınlığında kesim, 60 kg/m² ağırlık, kimyasal yapıştırıcılarla montaj
9. Ürün çeşitliliği: Traverten, Bazalt, Mermer, Kalker (Limestone). Nature, Mix, Crazy, Line ebat kategorileri
10. İzmir/Urla merkezli üretim, 25+ yıl tecrübe, 15+ ülkeye ihracat

${productInfo ? `ÜRÜN VERİTABANI:\n${productInfo}` : ''}

MEVCUT BLOG BAŞLIKLARI (TEKRAR ETME):
${existingTitles.length > 0 ? existingTitles.join('\n') : 'Henüz yok'}

İÇERİK KURALLARI:
- Başlık: 5-8 kelime, çarpıcı, SEO uyumlu, Türkçe
- İçerik: EN AZ 1000 kelime, HTML formatında. SADECE bu tagleri kullan: <h2>, <h3>, <p>, <strong>
- Bilgilendirici ton — reklam değil, okuyucuya gerçek değer sunan yazı
- Rockshell teknolojisi veya AI Simülasyon referansı doğal şekilde 1-2 yerde geçsin
- CTA: Yazı sonunda kısa ve doğal bir yönlendirme
- Meta description: 150-160 karakter, SEO uyumlu
- Kapak fotoğrafı için İngilizce prompt (doğal taş mimarisi, metin yok)
- Kaynak içerikten BİREBİR KOPYA YAPMA — bilgiyi özümse ve farklı şekilde anlat

ÇIKTI FORMATI (SADECE JSON):
{
  "title": "...",
  "content": "<h2>...</h2><p>...</p>...",
  "meta_description": "...",
  "cover_image_prompt": "..."
}`
    })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [{ role: 'user', content: contentParts }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI yanıtı parse edilemedi' }, { status: 500 })
    }

    const generated = JSON.parse(jsonMatch[0])

    // Clean markdown artifacts
    if (generated.content) {
      generated.content = generated.content
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    }

    // Generate cover image with Gemini
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
    console.error('Generate from source error:', err)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

async function generateCoverImage(prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) return ''

  const models = ['gemini-2.5-flash-image', 'gemini-3.1-flash-image-preview']
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
            generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
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
            await supabaseAdmin.storage.from('blog-covers').upload(fileName, buffer, { upsert: true, contentType: 'image/jpeg' })
          } else throw uploadError
        }
        const { data: urlData } = supabaseAdmin.storage.from('blog-covers').getPublicUrl(fileName)
        return urlData.publicUrl
      }
    } catch { continue }
  }
  return ''
}
