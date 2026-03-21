import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ valid: true })
  }

  try {
    const { image } = await req.json()
    if (!image) {
      return NextResponse.json({ valid: false, reason: 'no_image' })
    }

    const match = image.match(/^data:(image\/\w+);base64,(.+)$/)
    if (!match) {
      return NextResponse.json({ valid: true })
    }

    let mediaType = match[1] as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'
    const base64Data = match[2]

    // Detect actual image format from magic bytes to avoid media_type mismatch
    const prefix = base64Data.substring(0, 12)
    if (prefix.startsWith('/9j/')) {
      mediaType = 'image/jpeg'
    } else if (prefix.startsWith('iVBORw0KGgo')) {
      mediaType = 'image/png'
    } else if (prefix.startsWith('UklGR') || prefix.startsWith('AAABAA')) {
      mediaType = 'image/webp'
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 50,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Data,
                },
              },
              {
                type: 'text',
                text: 'Analyze this image and answer with EXACTLY one of these three responses:\n1. "VALID" — if the image shows a real building exterior, wall surface, facade, or interior room with visible walls, AND contains no significant text, logos, watermarks, or branding overlays\n2. "HAS_TEXT" — if the image shows a valid surface BUT contains visible text, logos, watermarks, brand names, or catalog-style overlays\n3. "INVALID" — if the image does NOT show any building, wall, or room surface\nAnswer with ONLY one word: VALID, HAS_TEXT, or INVALID.',
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      console.error('Validation API error:', response.status)
      return NextResponse.json({ valid: true })
    }

    const result = await response.json()
    const answer = result.content?.[0]?.text?.trim().toUpperCase() || ''

    if (answer.includes('VALID') && !answer.includes('INVALID') && !answer.includes('HAS_TEXT')) {
      return NextResponse.json({ valid: true, reason: null })
    } else if (answer.includes('HAS_TEXT')) {
      return NextResponse.json({ valid: false, reason: 'has_text' })
    } else {
      return NextResponse.json({ valid: false, reason: 'no_surface' })
    }
  } catch (error) {
    console.error('Image validation error:', error)
    return NextResponse.json({ valid: true })
  }
}
