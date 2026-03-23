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

  const { project_name, description } = await request.json()

  if (!project_name && !description) {
    return NextResponse.json({ error: 'Çevrilecek metin yok' }, { status: 400 })
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Translate the following Turkish text into English, Spanish, German, French, Russian, and Arabic. Return ONLY valid JSON with no extra text. Translations must be professional and natural-sounding, not machine-like.

${project_name ? `Project name (Turkish): "${project_name}"` : ''}
${description ? `Description (Turkish): "${description}"` : ''}

Return this exact JSON structure:
{
  "en": { ${project_name ? '"project_name": "..."' : ''}${project_name && description ? ', ' : ''}${description ? '"description": "..."' : ''} },
  "es": { ${project_name ? '"project_name": "..."' : ''}${project_name && description ? ', ' : ''}${description ? '"description": "..."' : ''} },
  "de": { ${project_name ? '"project_name": "..."' : ''}${project_name && description ? ', ' : ''}${description ? '"description": "..."' : ''} },
  "fr": { ${project_name ? '"project_name": "..."' : ''}${project_name && description ? ', ' : ''}${description ? '"description": "..."' : ''} },
  "ru": { ${project_name ? '"project_name": "..."' : ''}${project_name && description ? ', ' : ''}${description ? '"description": "..."' : ''} },
  "ar": { ${project_name ? '"project_name": "..."' : ''}${project_name && description ? ', ' : ''}${description ? '"description": "..."' : ''} }
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
