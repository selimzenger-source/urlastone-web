import { NextResponse } from 'next/server'

const REPLICATE_API = 'https://api.replicate.com/v1/predictions'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = process.env.REPLICATE_API_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const { id } = await params

  try {
    const response = await fetch(`${REPLICATE_API}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch prediction' }, { status: response.status })
    }

    const prediction = await response.json()

    // Handle both output formats:
    // - SD Inpainting returns: output: ["url1", "url2"]
    // - FLUX Canny returns: output: "url" or output: ["url"]
    let outputUrl: string | null = null
    if (prediction.output) {
      if (Array.isArray(prediction.output)) {
        outputUrl = prediction.output[0] || null
      } else if (typeof prediction.output === 'string') {
        outputUrl = prediction.output
      }
    }

    return NextResponse.json({
      status: prediction.status,
      output: outputUrl,
      error: prediction.error || null,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
