import { NextRequest, NextResponse } from 'next/server'
import { buildPrompt, buildFullApplyPrompt } from '@/lib/simulation'
import type { ApplyMode, SurfaceContext } from '@/lib/simulation'
import { supabaseAdmin } from '@/lib/supabase'

// fal.ai endpoint
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
  const falKey = process.env.FAL_API_KEY
  if (!falKey) {
    return NextResponse.json({ error: 'fal.ai API key not configured' }, { status: 500 })
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
    if (!stoneImageUrl) {
      return NextResponse.json({ error: 'stoneImageUrl is required' }, { status: 400 })
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

    // --- Build Prompt & Call fal.ai ---
    const prompt = applyMode === 'full'
      ? buildFullApplyPrompt(stoneCode, categorySlug, surfaceContext)
      : buildPrompt(stoneCode, categorySlug)

    console.log(`[Simulation] ${applyMode.toUpperCase()} mode — fal.ai FLUX General`)
    console.log('[Simulation] Stone texture ref:', stoneImageUrl?.substring(0, 60) + '...')
    console.log('[Simulation] Prompt:', prompt.substring(0, 100) + '...')

    // Build controlnets based on mode
    const controlnets = applyMode === 'full'
      ? [
          {
            path: 'InstantX/FLUX.1-dev-Controlnet-Canny',
            control_image_url: image,
            conditioning_scale: 0.85,
          },
        ]
      : [
          {
            path: 'Shakker-Labs/FLUX.1-dev-ControlNet-Union-Pro',
            control_image_url: image,
            control_mode: 'inpainting',
            mask_image_url: mask,
            conditioning_scale: 0.9,
          },
        ]

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
        controlnets,
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
    console.log('[Simulation] fal.ai response_url:', falResult.response_url)

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
      id: `fal--${falResult.request_id}`,
      status: falResult.status || 'IN_QUEUE',
      remaining,
    })
  } catch (error) {
    console.error('Simulation create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
