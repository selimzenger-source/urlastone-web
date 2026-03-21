import { NextRequest, NextResponse } from 'next/server'
import { buildPrompt, negativePrompt } from '@/lib/simulation'

const REPLICATE_API = 'https://api.replicate.com/v1/predictions'

export async function POST(req: NextRequest) {
  const token = process.env.REPLICATE_API_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'Replicate API token not configured' }, { status: 500 })
  }

  try {
    const { image, mask, stoneCode, categorySlug } = await req.json()

    if (!image || !mask || !stoneCode) {
      return NextResponse.json({ error: 'image, mask, and stoneCode are required' }, { status: 400 })
    }

    // Build optimized prompt server-side based on stone type + category
    const prompt = buildPrompt(stoneCode, categorySlug)

    // Create prediction using stable-diffusion-inpainting
    const response = await fetch(REPLICATE_API, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // stability-ai/stable-diffusion-inpainting latest version
        version: 'e490d072a34a94a11e9711ed5a6ba621c3fab884eda1665d9d3a282d65a21571',
        input: {
          prompt,
          negative_prompt: negativePrompt,
          image,
          mask,
          num_outputs: 1,
          num_inference_steps: 25,
          guidance_scale: 7.5,
          prompt_strength: 0.85,
          scheduler: 'K_EULER_ANCESTRAL',
        },
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('Replicate error:', err)
      return NextResponse.json(
        { error: err.detail || 'Failed to create prediction' },
        { status: response.status }
      )
    }

    const prediction = await response.json()
    return NextResponse.json({
      id: prediction.id,
      status: prediction.status,
    })
  } catch (error) {
    console.error('Simulation create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
