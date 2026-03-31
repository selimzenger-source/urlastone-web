import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json()

    if (!name || name.length < 3) {
      return NextResponse.json({ valid: false })
    }

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 10,
      messages: [{
        role: 'user',
        content: `Bu bir gercek insan adi ve soyadi mi? Herhangi bir dilde olabilir (Turkce, Ingilizce, Arapca, Rusca, Almanca, Ispanyolca, Fransizca vb). Sadece "EVET" veya "HAYIR" yaz.\n\nIsim: "${name}"`,
      }],
    })

    const text = response.content[0]?.type === 'text' ? response.content[0].text : ''
    const valid = text.includes('EVET')

    return NextResponse.json({ valid })
  } catch {
    // Hata durumunda geçir
    return NextResponse.json({ valid: true })
  }
}
