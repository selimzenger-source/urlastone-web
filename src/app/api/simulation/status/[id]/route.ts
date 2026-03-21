import { NextResponse } from 'next/server'

const REPLICATE_API = 'https://api.replicate.com/v1/predictions'
const FAL_QUEUE_URL = 'https://queue.fal.run/fal-ai/flux-general'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  console.log('[Status] Polling for ID:', id)

  // Route to correct provider based on ID prefix
  if (id.startsWith('fal--')) {
    return handleFalStatus(id.replace('fal--', ''))
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
    const statusUrl = `${FAL_QUEUE_URL}/requests/${requestId}/status`
    console.log('[fal.ai] Checking status:', statusUrl)

    const statusRes = await fetch(statusUrl, {
      headers: {
        'Authorization': `Key ${falKey}`,
      },
    })

    if (!statusRes.ok) {
      const errText = await statusRes.text()
      console.error('[fal.ai] Status check failed:', statusRes.status, errText)
      return NextResponse.json({ error: 'Failed to check status: ' + errText }, { status: statusRes.status })
    }

    const statusData = await statusRes.json()
    console.log('[fal.ai] Status response:', JSON.stringify({ status: statusData.status, queue_position: statusData.queue_position }))

    // fal.ai statuses: IN_QUEUE, IN_PROGRESS, COMPLETED, FAILED
    if (statusData.status === 'COMPLETED') {
      // Fetch the actual result
      const resultUrl = `${FAL_QUEUE_URL}/requests/${requestId}`
      console.log('[fal.ai] Fetching result:', resultUrl)

      const resultRes = await fetch(resultUrl, {
        headers: {
          'Authorization': `Key ${falKey}`,
        },
      })

      if (!resultRes.ok) {
        const errText = await resultRes.text()
        console.error('[fal.ai] Result fetch failed:', resultRes.status, errText)
        return NextResponse.json({ error: 'Failed to fetch result' }, { status: resultRes.status })
      }

      const resultData = await resultRes.json()
      console.log('[fal.ai] Result keys:', Object.keys(resultData))
      console.log('[fal.ai] Images count:', resultData.images?.length)

      // Check if there was an error in the result
      if (resultData.error) {
        console.error('[fal.ai] Generation error:', resultData.error)
        return NextResponse.json({
          status: 'failed',
          output: null,
          error: typeof resultData.error === 'string' ? resultData.error : JSON.stringify(resultData.error),
        })
      }

      const outputUrl = resultData.images?.[0]?.url || null
      console.log('[fal.ai] Output URL:', outputUrl?.substring(0, 80))

      if (!outputUrl) {
        console.error('[fal.ai] No output URL in result:', JSON.stringify(resultData).substring(0, 200))
        return NextResponse.json({
          status: 'failed',
          output: null,
          error: 'No image generated',
        })
      }

      return NextResponse.json({
        status: 'succeeded',
        output: outputUrl,
        error: null,
      })
    } else if (statusData.status === 'FAILED') {
      console.error('[fal.ai] Generation failed:', statusData.error)
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
  } catch (err) {
    console.error('[fal.ai] Status handler error:', err)
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
