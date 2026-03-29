import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 30

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const auth = req.headers.get('Authorization')
  const password = (process.env.ADMIN_PASSWORD || '').trim()
  if (auth !== `Bearer ${password}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { project_name, product, category, city, contractor, application_type, existingDescriptions } = await req.json()

  if (!project_name) {
    return NextResponse.json({ error: 'Proje adı gerekli' }, { status: 400 })
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Doğal taş uygulama projesi için kısa bir Türkçe açıklama yaz.

Proje bilgileri:
- Proje Adı: ${project_name}
- Kullanılan Ürün: ${product || 'belirtilmemiş'}
- Kategori: ${category || 'belirtilmemiş'}
- Uygulama Tipi: ${application_type || 'belirtilmemiş'}
- Şehir: ${city || 'belirtilmemiş'}
- Yapılan Firma: ${contractor || 'belirtilmemiş'}

${existingDescriptions?.length ? `MEVCUT PROJE AÇIKLAMALARINDAN ÖRNEKLER (bu tonda yaz):\n${existingDescriptions.slice(0, 3).map((d: string) => `- "${d}"`).join('\n')}\n` : ''}
KURALLAR:
- 2-3 cümle olsun, profesyonel ve etkileyici
- Yukarıdaki mevcut açıklamalarla aynı tonda ve üslupta yaz
- Doğal taş sektörüne uygun terminoloji kullan (doku, cephe kaplama, derzli/derzsiz, doğal görünüm vb.)
- Proje adını, lokasyonu ve kullanılan taş ürününü doğal bir şekilde dahil et
- Lüks, kaliteli ve prestijli bir ton kullan
- Sadece açıklama metnini döndür, başka bir şey yazma
- Nokta ile bitir`
      }],
    })

    const textBlock = response.content.find(b => b.type === 'text')
    const description = textBlock && textBlock.type === 'text' ? textBlock.text.trim() : ''

    return NextResponse.json({ description })
  } catch (error) {
    console.error('Description generation error:', error)
    return NextResponse.json({ error: 'Açıklama üretilemedi' }, { status: 500 })
  }
}
