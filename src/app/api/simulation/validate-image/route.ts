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
                text: 'Does this image show a real architectural surface where stone cladding could be applied? This means: a building exterior/facade, an interior wall, a fireplace, a bathroom, or a floor.\n\nAnswer EXACTLY one word:\n- "VALID" — real building, wall, room, facade, fireplace, bathroom, or floor is clearly visible, AND no significant text/logos/watermarks\n- "HAS_TEXT" — valid surface BUT has visible text, logos, watermarks, or branding\n- "INVALID" — NOT an architectural surface. Examples of INVALID: selfies, animals, food, cars, landscapes without buildings, abstract art, neon lights, screenshots, documents, memes\n\nBe STRICT. If unsure, say INVALID. Answer with ONLY one word.',
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
    console.log('[Validate] Haiku response:', answer)

    if (answer.includes('VALID') && !answer.includes('INVALID') && !answer.includes('HAS_TEXT')) {
      return NextResponse.json({ valid: true, reason: null })
    } else if (answer.includes('HAS_TEXT')) {
      return NextResponse.json({ valid: false, reason: 'has_text' })
    } else {
      console.log('[Validate] Image rejected:', answer)
      return NextResponse.json({ valid: false, reason: 'no_surface' })
    }
  } catch (error) {
    console.error('Image validation error:', error)
    return NextResponse.json({ valid: true })
  }
}
