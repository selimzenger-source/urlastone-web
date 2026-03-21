import { NextRequest, NextResponse } from 'next/server'
import { buildPrompt, buildFullApplyPrompt, negativePrompt } from '@/lib/simulation'
import type { ApplyMode, SurfaceContext } from '@/lib/simulation'
import { supabaseAdmin } from '@/lib/supabase'

// API endpoints
const REPLICATE_PREDICTIONS = 'https://api.replicate.com/v1/predictions'
const FLUX_CANNY_API = 'https://api.replicate.com/v1/models/black-forest-labs/flux-canny-dev/predictions'

const DAILY_LIMIT = 3

const LIMIT_MSGS: Record<string, string> = {
  tr: 'Günlük simülasyon limitine ulaştınız. Yarın tekrar deneyin',
  en: 'Daily simulation limit reached. Please try again tomorrow',
  es: 'Límite diario de simulación alcanzado. Inténtelo mañana',
  ar: 'تم الوصول إلى الحد اليومي للمحاكاة. حاول مرة أخرى غداً',
  de: 'Tägliches Simulationslimit erreicht. Versuchen Sie es morgen erneut',
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

export async function POST(req: NextRequest) {
  const token = process.env.REPLICATE_API_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'Replicate API token not configured' }, { status: 500 })
  }

  try {
    const {
      image,
      mask,
      stoneCode,
      categorySlug,
      locale,
      applyMode = 'brush' as ApplyMode,
      surfaceContext = 'facade' as SurfaceContext,
    } = await req.json()

    // Validate required fields based on mode
    if (!image || !stoneCode) {
      return NextResponse.json({ error: 'image and stoneCode are required' }, { status: 400 })
    }
    if (applyMode === 'brush' && !mask) {
      return NextResponse.json({ error: 'mask is required for brush mode' }, { status: 400 })
    }

    // --- Rate Limiting ---
    const ip = getClientIp(req)

    try {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const { count, error: countError } = await supabaseAdmin
        .from('simulation_requests')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', ip)
        .gte('created_at', todayStart.toISOString())

      if (!countError && count !== null && count >= DAILY_LIMIT) {
        const msg = LIMIT_MSGS[locale || 'tr'] || LIMIT_MSGS.tr
        return NextResponse.json(
          { error: msg, rateLimited: true, remaining: 0 },
          { status: 429 }
        )
      }

      await supabaseAdmin
        .from('simulation_requests')
        .insert({ ip_address: ip })

    } catch {
      console.warn('Rate limit check failed, continuing without limit')
    }

    // --- Build Prompt & Call Replicate ---
    let response: Response

    if (applyMode === 'full') {
      // ===== FULL APPLY MODE — FLUX Canny =====
      // Uses canny edge detection to preserve building structure
      // while regenerating with stone texture
      const prompt = buildFullApplyPrompt(stoneCode, categorySlug, surfaceContext)

      console.log('[Simulation] FULL mode — FLUX Canny Dev')
      console.log('[Simulation] Surface context:', surfaceContext)
      console.log('[Simulation] Prompt:', prompt.substring(0, 100) + '...')

      response = await fetch(FLUX_CANNY_API, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait',
        },
        body: JSON.stringify({
          input: {
            prompt,
            control_image: image,
            num_outputs: 1,
            num_inference_steps: 28,
            guidance: 28,
            output_format: 'jpg',
            output_quality: 90,
          },
        }),
      })
    } else {
      // ===== BRUSH MODE — SD Inpainting (current) =====
      const prompt = buildPrompt(stoneCode, categorySlug)

      console.log('[Simulation] BRUSH mode — SD Inpainting')
      console.log('[Simulation] Prompt:', prompt.substring(0, 100) + '...')

      response = await fetch(REPLICATE_PREDICTIONS, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: '95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3',
          input: {
            prompt,
            negative_prompt: negativePrompt,
            image,
            mask,
            num_inference_steps: 25,
            guidance_scale: 7.5,
            scheduler: 'K_EULER_ANCESTRAL',
          },
        }),
      })
    }

    if (!response.ok) {
      const err = await response.json()
      console.error('Replicate error:', err)
      return NextResponse.json(
        { error: err.detail || 'Failed to create prediction' },
        { status: response.status }
      )
    }

    const prediction = await response.json()

    // Calculate remaining requests for this IP today
    let remaining = DAILY_LIMIT - 1
    try {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const { count } = await supabaseAdmin
        .from('simulation_requests')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', ip)
        .gte('created_at', todayStart.toISOString())
      if (count !== null) remaining = Math.max(0, DAILY_LIMIT - count)
    } catch { /* ignore */ }

    return NextResponse.json({
      id: prediction.id,
      status: prediction.status,
      remaining,
    })
  } catch (error) {
    console.error('Simulation create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
