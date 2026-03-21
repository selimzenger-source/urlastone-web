import { NextResponse } from 'next/server'

const REPLICATE_API = 'https://api.replicate.com/v1/predictions'
const FAL_QUEUE_URL = 'https://queue.fal.run/fal-ai/flux-general'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Route to correct provider based on ID prefix
  if (id.startsWith('fal:')) {
    return handleFalStatus(id.replace('fal:', ''))
  } else {
    return handleReplicateStatus(id)
  }
}

// --- fal.ai status polling ---
async function handleFalStatus(requestId: string) {
  const falKey = process.env.FAL_API_KEY
  if (!falKey) {
    return NextResponse.json({ error: 'fal.ai not configured' }, { status: 500 })
  }

  try {
    // First check status
    const statusRes = await fetch(`${FAL_QUEUE_URL}/requests/${requestId}/status`, {
      headers: {
        'Authorization': `Key ${falKey}`,
      },
    })

    if (!statusRes.ok) {
      const err = await statusRes.json()
      return NextResponse.json({ error: err.detail || 'Failed to check status' }, { status: statusRes.status })
    }

    const statusData = await statusRes.json()

    // fal.ai statuses: IN_QUEUE, IN_PROGRESS, COMPLETED, FAILED
    if (statusData.status === 'COMPLETED') {
      // Fetch the actual result
      const resultRes = await fetch(`${FAL_QUEUE_URL}/requests/${requestId}`, {
        headers: {
          'Authorization': `Key ${falKey}`,
        },
      })

      if (!resultRes.ok) {
        return NextResponse.json({ error: 'Failed to fetch result' }, { status: resultRes.status })
      }

      const resultData = await resultRes.json()

      // fal.ai returns: { images: [{ url, width, height }], ... }
      const outputUrl = resultData.images?.[0]?.url || null

      return NextResponse.json({
        status: 'succeeded',
        output: outputUrl,
        error: null,
      })
    } else if (statusData.status === 'FAILED') {
      return NextResponse.json({
        status: 'failed',
        output: null,
        error: statusData.error || 'Generation failed',
      })
    } else {
      // IN_QUEUE or IN_PROGRESS
      return NextResponse.json({
        status: 'processing',
        output: null,
        error: null,
      })
    }
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// --- Replicate status polling ---
async function handleReplicateStatus(predictionId: string) {
  const token = process.env.REPLICATE_API_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  try {
    const response = await fetch(`${REPLICATE_API}/${predictionId}`, {
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
