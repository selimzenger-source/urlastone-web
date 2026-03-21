import { NextRequest, NextResponse } from 'next/server'

const REPLICATE_API = 'https://api.replicate.com/v1/predictions'

export async function POST(req: NextRequest) {
  const token = process.env.REPLICATE_API_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'Replicate API token not configured' }, { status: 500 })
  }

  try {
    const { imageUrl, scale = 4 } = await req.json()

    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 })
    }

    console.log('[Upscale] Starting Real-ESRGAN upscale, scale:', scale)
    console.log('[Upscale] Input URL:', imageUrl.substring(0, 80) + '...')

    // Call Real-ESRGAN with Prefer: wait (synchronous — usually 2-5 seconds)
    const response = await fetch(REPLICATE_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait',
      },
      body: JSON.stringify({
        version: 'b3ef194191d13140337468c916c2c5b96dd0cb06dffc032a022a31807f6a5ea8',
        input: {
          image: imageUrl,
          scale,
          face_enhance: false,
        },
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('[Upscale] Replicate error:', err)
      return NextResponse.json(
        { error: err.detail || 'Upscale failed' },
        { status: response.status }
      )
    }

    const prediction = await response.json()

    // Real-ESRGAN returns output as a single URL string
    const outputUrl = typeof prediction.output === 'string'
      ? prediction.output
      : Array.isArray(prediction.output)
        ? prediction.output[0]
        : null

    console.log('[Upscale] Output URL:', outputUrl?.substring(0, 80))

    if (!outputUrl) {
      return NextResponse.json({ error: 'No output from upscale' }, { status: 500 })
    }

    return NextResponse.json({ url: outputUrl })
  } catch (error) {
    console.error('[Upscale] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
