import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase'

export const maxDuration = 120

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// POST /api/blogs/translate - Translate blog to 6 languages (admin only)
export async function POST(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { blogId } = await req.json()
  if (!blogId) {
    return NextResponse.json({ error: 'blogId required' }, { status: 400 })
  }

  // Get blog
  const { data: blog, error } = await supabaseAdmin
    .from('blogs')
    .select('title, content, meta_description')
    .eq('id', blogId)
    .single()

  if (error || !blog) {
    return NextResponse.json({ error: 'Blog bulunamadı' }, { status: 404 })
  }

  try {
    // Translate title and meta_description
    const titleMessage = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `Translate the following Turkish blog title and meta description into English, Spanish, Arabic, German, French, and Russian.
This is for a premium natural stone company (Urla Stone). Translations must be professional, natural-sounding, and SEO-friendly.

Title (Turkish): "${blog.title}"
Meta Description (Turkish): "${blog.meta_description}"

Return ONLY valid JSON:
{
  "en": { "title": "...", "meta_description": "..." },
  "es": { "title": "...", "meta_description": "..." },
  "ar": { "title": "...", "meta_description": "..." },
  "de": { "title": "...", "meta_description": "..." },
  "fr": { "title": "...", "meta_description": "..." },
  "ru": { "title": "...", "meta_description": "..." }
}`
      }]
    })

    const titleText = titleMessage.content[0].type === 'text' ? titleMessage.content[0].text : ''
    const titleJson = JSON.parse(titleText.match(/\{[\s\S]*\}/)?.[0] || '{}')

    // Translate content (HTML) - strip tags for translation context
    const contentMessage = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [{
        role: 'user',
        content: `Translate the following Turkish HTML blog article into English, Spanish, Arabic, German, French, and Russian.
IMPORTANT: Keep all HTML tags exactly as they are (<h2>, <h3>, <p>, <strong>, etc). Only translate the text content.
This is for a premium natural stone company website. Translations must be professional and natural-sounding.

Turkish HTML content:
${blog.content}

Return ONLY valid JSON with HTML content for each language:
{
  "en": "translated HTML...",
  "es": "translated HTML...",
  "ar": "translated HTML...",
  "de": "translated HTML...",
  "fr": "translated HTML...",
  "ru": "translated HTML..."
}`
      }]
    })

    const contentText = contentMessage.content[0].type === 'text' ? contentMessage.content[0].text : ''
    const contentJson = JSON.parse(contentText.match(/\{[\s\S]*\}/)?.[0] || '{}')

    // Update blog with translations
    const updateData: Record<string, string> = {}
    const langs = ['en', 'es', 'ar', 'de', 'fr', 'ru'] as const

    for (const lang of langs) {
      if (titleJson[lang]?.title) updateData[`title_${lang}`] = titleJson[lang].title
      if (titleJson[lang]?.meta_description) updateData[`meta_description_${lang}`] = titleJson[lang].meta_description
      if (contentJson[lang]) updateData[`content_${lang}`] = contentJson[lang]
    }

    updateData.updated_at = new Date().toISOString()

    const { error: updateError } = await supabaseAdmin
      .from('blogs')
      .update(updateData)
      .eq('id', blogId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, translated: Object.keys(updateData).length })

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
