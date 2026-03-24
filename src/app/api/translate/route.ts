import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

function validateAdmin(request: NextRequest): boolean {
  const auth = request.headers.get('Authorization')
  const password = (process.env.ADMIN_PASSWORD || '').trim()
  return auth === `Bearer ${password}`
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  if (!validateAdmin(request)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const body = await request.json()

  // Generic translate: accepts { fields: { key: "Turkish text", ... } }
  // or legacy format: { project_name, description }
  const fields: Record<string, string> = body.fields || {}

  // Legacy support for project translate
  if (!body.fields) {
    if (body.project_name) fields.project_name = body.project_name
    if (body.description) fields.description = body.description
  }

  const fieldKeys = Object.keys(fields).filter(k => fields[k]?.trim())
  if (fieldKeys.length === 0) {
    return NextResponse.json({ error: 'Çevrilecek metin yok' }, { status: 400 })
  }

  // Build field list for prompt
  const fieldPrompts = fieldKeys.map(k => `${k} (Turkish): "${fields[k]}"`).join('\n')
  const fieldStructure = fieldKeys.map(k => `"${k}": "..."`).join(', ')

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Translate the following Turkish text into English, Spanish, German, French, Russian, and Arabic. Return ONLY valid JSON with no extra text. Translations must be professional and natural-sounding for a natural stone company website.

${fieldPrompts}

Return this exact JSON structure:
{
  "en": { ${fieldStructure} },
  "es": { ${fieldStructure} },
  "de": { ${fieldStructure} },
  "fr": { ${fieldStructure} },
  "ru": { ${fieldStructure} },
  "ar": { ${fieldStructure} }
}`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Çeviri parse edilemedi' }, { status: 500 })
    }

    const translations = JSON.parse(jsonMatch[0])
    return NextResponse.json(translations)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
