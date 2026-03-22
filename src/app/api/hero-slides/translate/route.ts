import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// POST /api/hero-slides/translate - Translate Turkish texts to 4 languages
export async function POST(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { tag, subtitle, gold, desc } = await req.json()

  if (!tag && !subtitle && !gold && !desc) {
    return NextResponse.json({ error: 'No text to translate' }, { status: 400 })
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Translate the following Turkish texts into English, Spanish, Arabic, and German. These are short hero banner texts for a natural stone company website. Keep them concise and impactful. Return ONLY valid JSON.

Turkish texts:
${tag ? `- tag: "${tag}"` : ''}
${subtitle ? `- subtitle: "${subtitle}"` : ''}
${gold ? `- gold (main heading): "${gold}"` : ''}
${desc ? `- desc (description): "${desc}"` : ''}

Return this exact JSON:
{
  "en": { ${tag ? '"tag": "..."' : ''}${tag && subtitle ? ', ' : ''}${subtitle ? '"subtitle": "..."' : ''}${(tag || subtitle) && gold ? ', ' : ''}${gold ? '"gold": "..."' : ''}${(tag || subtitle || gold) && desc ? ', ' : ''}${desc ? '"desc": "..."' : ''} },
  "es": { ${tag ? '"tag": "..."' : ''}${tag && subtitle ? ', ' : ''}${subtitle ? '"subtitle": "..."' : ''}${(tag || subtitle) && gold ? ', ' : ''}${gold ? '"gold": "..."' : ''}${(tag || subtitle || gold) && desc ? ', ' : ''}${desc ? '"desc": "..."' : ''} },
  "ar": { ${tag ? '"tag": "..."' : ''}${tag && subtitle ? ', ' : ''}${subtitle ? '"subtitle": "..."' : ''}${(tag || subtitle) && gold ? ', ' : ''}${gold ? '"gold": "..."' : ''}${(tag || subtitle || gold) && desc ? ', ' : ''}${desc ? '"desc": "..."' : ''} },
  "de": { ${tag ? '"tag": "..."' : ''}${tag && subtitle ? ', ' : ''}${subtitle ? '"subtitle": "..."' : ''}${(tag || subtitle) && gold ? ', ' : ''}${gold ? '"gold": "..."' : ''}${(tag || subtitle || gold) && desc ? ', ' : ''}${desc ? '"desc": "..."' : ''} }
}`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Translation parse failed' }, { status: 500 })
    }

    const translations = JSON.parse(jsonMatch[0])
    return NextResponse.json(translations)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
