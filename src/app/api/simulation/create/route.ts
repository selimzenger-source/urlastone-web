import { NextRequest, NextResponse } from 'next/server'
import { buildPrompt, buildFullApplyPrompt } from '@/lib/simulation'
import type { ApplyMode, SurfaceContext } from '@/lib/simulation'
import { supabaseAdmin } from '@/lib/supabase'

// fal.ai SYNCHRONOUS endpoint (not queue) — returns result directly
const FAL_URL = 'https://fal.run/fal-ai/flux-general'

// Allow up to 60 seconds for Vercel serverless function
export const maxDuration = 60

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

// Upload base64 data URL to Supabase Storage and return public URL
async function uploadToStorage(dataUrl: string, prefix: string): Promise<string> {
  const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/)
  if (!match) throw new Error('Invalid data URL')

  const ext = match[1] === 'jpeg' ? 'jpg' : match[1]
  const base64Data = match[2]
  const buffer = Buffer.from(base64Data, 'base64')
  const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
  const filePath = `simulation/${fileName}`

  const { error } = await supabaseAdmin.storage
    .from('uploads')
    .upload(filePath, buffer, {
      contentType: `image/${match[1]}`,
      upsert: false,
    })

  if (error) {
    console.error('[Upload] Supabase storage error:', error)
    throw new Error('Failed to upload image: ' + error.message)
  }

  const { data: urlData } = supabaseAdmin.storage
    .from('uploads')
    .getPublicUrl(filePath)

  console.log('[Upload] Uploaded to:', urlData.publicUrl.substring(0, 80) + '...')
  return urlData.publicUrl
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

      await supabaseAdmin
        .from('simulation_requests')
        .insert({ ip_address: ip })

    } catch {
      console.warn('Rate limit check failed, continuing without limit')
    }

    // --- Upload images to Supabase Storage (fal.ai needs HTTP URLs, not base64) ---
    console.log('[Simulation] Uploading images to Supabase Storage...')

    let imageUrl: string
    let maskUrl: string | undefined

    try {
      imageUrl = await uploadToStorage(image, 'img')
      if (applyMode === 'brush' && mask) {
        maskUrl = await uploadToStorage(mask, 'mask')
      }
    } catch (err) {
      console.error('[Simulation] Image upload failed:', err)
      return NextResponse.json(
        { error: 'Failed to upload image. Please try again.' },
        { status: 500 }
      )
    }

    // --- Build Prompt & Call fal.ai SYNCHRONOUS ---
    const prompt = applyMode === 'full'
      ? buildFullApplyPrompt(stoneCode, categorySlug, surfaceContext)
      : buildPrompt(stoneCode, categorySlug)

    console.log(`[Simulation] ${applyMode.toUpperCase()} mode — fal.ai FLUX General (SYNC)`)
    console.log('[Simulation] Image URL:', imageUrl.substring(0, 80) + '...')
    console.log('[Simulation] Stone ref:', stoneImageUrl?.substring(0, 60) + '...')
    console.log('[Simulation] Prompt:', prompt.substring(0, 100) + '...')

    // Build controlnets based on mode
    const controlnets = applyMode === 'full'
      ? [
          {
            path: 'InstantX/FLUX.1-dev-Controlnet-Canny',
            control_image_url: imageUrl,
            conditioning_scale: 0.85,
          },
        ]
      : [
          {
            path: 'Shakker-Labs/FLUX.1-dev-ControlNet-Union-Pro',
            control_image_url: imageUrl,
            control_mode: 'inpainting',
            mask_image_url: maskUrl,
            conditioning_scale: 0.9,
          },
        ]

    // SYNCHRONOUS call — blocks until result is ready (typically 5-20 seconds)
    const falResponse = await fetch(FAL_URL, {
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
      console.error('[Simulation] fal.ai error:', JSON.stringify(err).substring(0, 300))
      return NextResponse.json(
        { error: err.detail || err.message || 'Failed to create prediction' },
        { status: falResponse.status }
      )
    }

    const falResult = await falResponse.json()
    console.log('[Simulation] fal.ai SYNC result received!')
    console.log('[Simulation] Inference time:', falResult.timings?.inference, 'seconds')

    // Extract output image URL
    const outputUrl = falResult.images?.[0]?.url || null
    console.log('[Simulation] Output URL:', outputUrl?.substring(0, 80))

    if (!outputUrl) {
      console.error('[Simulation] No output image:', JSON.stringify(falResult).substring(0, 300))
      return NextResponse.json(
        { error: 'AI görsel üretemedi. Lütfen tekrar deneyin.' },
        { status: 500 }
      )
    }

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

    // Return result directly — no polling needed!
    return NextResponse.json({
      output: outputUrl,
      status: 'succeeded',
      remaining,
    })
  } catch (error) {
    console.error('Simulation create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
