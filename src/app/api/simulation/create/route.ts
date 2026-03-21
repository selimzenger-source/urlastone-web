import { NextRequest, NextResponse } from 'next/server'
import { buildPrompt, buildFullApplyPrompt, negativePrompt } from '@/lib/simulation'
import type { ApplyMode, SurfaceContext } from '@/lib/simulation'
import { supabaseAdmin } from '@/lib/supabase'

// API endpoints
const REPLICATE_PREDICTIONS = 'https://api.replicate.com/v1/predictions'
const FAL_QUEUE_URL = 'https://queue.fal.run/fal-ai/flux-general'

const DAILY_LIMIT_PER_IP = 3   // Max per IP per day
const DAILY_LIMIT_GLOBAL = 20  // Max total across all users per day

// Rate limit error messages per locale
const LIMIT_MSGS: Record<string, { ip: string; global: string }> = {
  tr: {
    ip: 'Günlük simülasyon hakkınız doldu. Yarın tekrar deneyin',
    global: 'Bugünkü simülasyon kapasitesi doldu. Yarın tekrar deneyin',
  },
  en: {
    ip: 'Your daily simulation limit reached. Please try again tomorrow',
    global: 'Today\'s simulation capacity is full. Please try again tomorrow',
  },
  es: {
    ip: 'Su límite diario de simulación se alcanzó. Inténtelo mañana',
    global: 'La capacidad de simulación de hoy está llena. Inténtelo mañana',
  },
  ar: {
    ip: 'تم الوصول إلى الحد اليومي للمحاكاة. حاول مرة أخرى غداً',
    global: 'سعة المحاكاة اليوم ممتلئة. حاول مرة أخرى غداً',
  },
  de: {
    ip: 'Ihr tägliches Simulationslimit erreicht. Versuchen Sie es morgen erneut',
    global: 'Die heutige Simulationskapazität ist voll. Versuchen Sie es morgen erneut',
  },
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
      stoneImageUrl,
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
    if (applyMode === 'full' && !stoneImageUrl) {
      return NextResponse.json({ error: 'stoneImageUrl is required for full mode' }, { status: 400 })
    }

    // --- Rate Limiting ---
    const ip = getClientIp(req)
    const msgs = LIMIT_MSGS[locale || 'tr'] || LIMIT_MSGS.tr

    try {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const todayISO = todayStart.toISOString()

      // 1) Check GLOBAL daily limit (all users combined)
      const { count: globalCount, error: globalError } = await supabaseAdmin
        .from('simulation_requests')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISO)

      if (!globalError && globalCount !== null && globalCount >= DAILY_LIMIT_GLOBAL) {
        return NextResponse.json(
          { error: msgs.global, rateLimited: true, limitType: 'global', remaining: 0 },
          { status: 429 }
        )
      }

      // 2) Check PER-IP daily limit
      const { count: ipCount, error: ipError } = await supabaseAdmin
        .from('simulation_requests')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', ip)
        .gte('created_at', todayISO)

      if (!ipError && ipCount !== null && ipCount >= DAILY_LIMIT_PER_IP) {
        return NextResponse.json(
          { error: msgs.ip, rateLimited: true, limitType: 'ip', remaining: 0 },
          { status: 429 }
        )
      }

      // Log this request
      await supabaseAdmin
        .from('simulation_requests')
        .insert({ ip_address: ip })

    } catch {
      console.warn('Rate limit check failed, continuing without limit')
    }

    // --- Build Prompt & Call AI Provider ---

    if (applyMode === 'full') {
      // === FAL.AI — FLUX General with ControlNet (Canny) + IP-Adapter (stone texture) ===
      const falKey = process.env.FAL_API_KEY
      if (!falKey) {
        return NextResponse.json({ error: 'fal.ai API key not configured' }, { status: 500 })
      }

      const prompt = buildFullApplyPrompt(stoneCode, categorySlug, surfaceContext)

      console.log('[Simulation] FULL mode — fal.ai FLUX General + IP-Adapter')
      console.log('[Simulation] Surface context:', surfaceContext)
      console.log('[Simulation] Stone texture ref:', stoneImageUrl?.substring(0, 60) + '...')
      console.log('[Simulation] Prompt:', prompt.substring(0, 100) + '...')

      const falResponse = await fetch(FAL_QUEUE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${falKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          num_inference_steps: 28,
          guidance_scale: 3.5,
          num_images: 1,
          output_format: 'jpeg',
          enable_safety_checker: false,
          controlnets: [
            {
              path: 'InstantX/FLUX.1-dev-Controlnet-Canny',
              control_image_url: image,
              conditioning_scale: 0.85,
            },
          ],
          ip_adapters: [
            {
              path: 'https://huggingface.co/XLabs-AI/flux-ip-adapter/resolve/main/flux-ip-adapter.safetensors',
              image_url: stoneImageUrl,
              scale: 0.75,
              image_encoder_path: 'openai/clip-vit-large-patch14',
            },
          ],
        }),
      })

      if (!falResponse.ok) {
        const err = await falResponse.json()
        console.error('fal.ai error:', err)
        return NextResponse.json(
          { error: err.detail || err.message || 'Failed to create prediction' },
          { status: falResponse.status }
        )
      }

      const falResult = await falResponse.json()
      console.log('[Simulation] fal.ai queue response:', { request_id: falResult.request_id, status: falResult.status })

      // Calculate remaining
      let remaining = DAILY_LIMIT_PER_IP - 1
      try {
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)
        const { count } = await supabaseAdmin
          .from('simulation_requests')
          .select('*', { count: 'exact', head: true })
          .eq('ip_address', ip)
          .gte('created_at', todayStart.toISOString())
        if (count !== null) remaining = Math.max(0, DAILY_LIMIT_PER_IP - count)
      } catch { /* ignore */ }

      return NextResponse.json({
        id: `fal:${falResult.request_id}`,
        status: falResult.status || 'IN_QUEUE',
        remaining,
      })
    }

    // === REPLICATE — SD Inpainting (brush mode) ===
    let response: Response

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
    let remaining = DAILY_LIMIT_PER_IP - 1
    try {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const { count } = await supabaseAdmin
        .from('simulation_requests')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', ip)
        .gte('created_at', todayStart.toISOString())
      if (count !== null) remaining = Math.max(0, DAILY_LIMIT_PER_IP - count)
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
