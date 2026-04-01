import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase'

export const maxDuration = 300

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const LANGS = ['en', 'es', 'ar', 'de', 'fr', 'ru'] as const
type Lang = typeof LANGS[number]

// Translate title + meta for a single language
async function translateTitleMeta(title: string, meta: string, lang: Lang): Promise<{ title: string; meta_description: string } | null> {
  const langNames: Record<Lang, string> = { en: 'English', es: 'Spanish', ar: 'Arabic', de: 'German', fr: 'French', ru: 'Russian' }

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const msg = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Translate to ${langNames[lang]}. Premium natural stone company. Professional, SEO-friendly.

Title: "${title}"
Meta: "${meta}"

Return ONLY JSON: {"title": "...", "meta_description": "..."}`
        }]
      })

      const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
      const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}')
      if (json.title && json.meta_description) return json
    } catch {
      // retry
    }
  }
  return null
}

// Translate HTML content for a single language
async function translateContent(content: string, lang: Lang): Promise<string | null> {
  const langNames: Record<Lang, string> = { en: 'English', es: 'Spanish', ar: 'Arabic', de: 'German', fr: 'French', ru: 'Russian' }

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const msg = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        messages: [{
          role: 'user',
          content: `Translate this Turkish HTML blog to ${langNames[lang]}.
Keep ALL HTML tags exactly as they are (<h2>, <h3>, <p>, <strong>). Only translate text.
Premium natural stone company website. Professional, natural-sounding.

${content}

Return ONLY the translated HTML (no JSON, no code blocks, just the HTML):`
        }]
      })

      const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
      // Clean up: remove markdown code blocks + convert markdown bold/italic to HTML
      const cleaned = text
        .replace(/^```html?\n?/i, '').replace(/\n?```$/i, '')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .trim()
      if (cleaned.length > 50) return cleaned
    } catch {
      // retry
    }
  }
  return null
}

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

  const { data: blog, error } = await supabaseAdmin
    .from('blogs')
    .select('title, content, meta_description')
    .eq('id', blogId)
    .single()

  if (error || !blog) {
    return NextResponse.json({ error: 'Blog bulunamadı' }, { status: 404 })
  }

  // Türkçe content'teki markdown kalıntılarını temizle
  let cleanContent = blog.content
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')

  // Türkçe content farklıysa güncelle
  if (cleanContent !== blog.content) {
    console.log('[Translate] Cleaning Turkish content markdown artifacts')
    await supabaseAdmin.from('blogs').update({ content: cleanContent }).eq('id', blogId)
    blog.content = cleanContent
  }

  const updateData: Record<string, string> = {}
  const results: { lang: string; success: boolean }[] = []

  // Translate each language - 3 parallel at a time for speed
  for (let i = 0; i < LANGS.length; i += 3) {
    const batch = LANGS.slice(i, i + 3)
    console.log(`[Translate] Batch ${i/3 + 1}: ${batch.join(', ')}`)
    const promises = batch.map(async (lang) => {
      try {
        const [titleMeta, content] = await Promise.all([
          translateTitleMeta(blog.title, blog.meta_description, lang),
          translateContent(blog.content, lang),
        ])

        if (titleMeta) {
          updateData[`title_${lang}`] = titleMeta.title
          updateData[`meta_description_${lang}`] = titleMeta.meta_description
        }
        if (content) {
          updateData[`content_${lang}`] = content
        }

        const success = !!(titleMeta && content)
        console.log(`[Translate] ${lang}: ${success ? 'OK' : 'FAILED'} (title: ${!!titleMeta}, content: ${!!content})`)
        results.push({ lang, success })
      } catch (err) {
        console.error(`[Translate] ${lang} error:`, err)
        results.push({ lang, success: false })
      }
    })

    await Promise.all(promises)
  }

  // Save whatever we got
  if (Object.keys(updateData).length > 0) {
    updateData.updated_at = new Date().toISOString()

    const { error: updateError } = await supabaseAdmin
      .from('blogs')
      .update(updateData)
      .eq('id', blogId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }
  }

  const failed = results.filter(r => !r.success)
  if (failed.length > 0) {
    return NextResponse.json({
      success: false,
      error: `Bazı diller çevrilemedi: ${failed.map(f => f.lang.toUpperCase()).join(', ')}. Tekrar deneyin.`,
      results,
      translated: Object.keys(updateData).length,
    }, { status: 207 })
  }

  return NextResponse.json({ success: true, results, translated: Object.keys(updateData).length })
}
