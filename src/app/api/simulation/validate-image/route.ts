import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    // If no API key, skip validation and allow
    return NextResponse.json({ valid: true })
  }

  try {
    const { image } = await req.json()
    if (!image) {
      return NextResponse.json({ valid: false, reason: 'no_image' })
    }

    // Extract base64 data and media type from data URL
    const match = image.match(/^data:(image\/\w+);base64,(.+)$/)
    if (!match) {
      return NextResponse.json({ valid: true }) // Can't parse, allow through
    }

    const mediaType = match[1] as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'
    const base64Data = match[2]

    // Ask Claude Haiku to classify the image
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 100,
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
                text: 'Does this image show any of the following: a building exterior, a wall surface, a facade, a fireplace, a bathroom, an interior room with visible walls, or a floor surface? Answer ONLY with "YES" or "NO". Nothing else.',
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      console.error('Validation API error:', response.status)
      return NextResponse.json({ valid: true }) // On error, allow through
    }

    const result = await response.json()
    const answer = result.content?.[0]?.text?.trim().toUpperCase() || ''

    const isValid = answer.startsWith('YES')

    return NextResponse.json({
      valid: isValid,
      reason: isValid ? null : 'no_surface',
    })
  } catch (error) {
    console.error('Image validation error:', error)
    return NextResponse.json({ valid: true }) // On error, allow through
  }
}
