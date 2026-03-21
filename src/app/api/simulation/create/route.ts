import { NextRequest, NextResponse } from 'next/server'
import { buildPrompt, negativePrompt } from '@/lib/simulation'
import { supabaseAdmin } from '@/lib/supabase'

const REPLICATE_API = 'https://api.replicate.com/v1/predictions'
const DAILY_LIMIT = 3 // Max requests per IP per day

// Rate limit error messages per locale
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
    const { image, mask, stoneCode, categorySlug, locale } = await req.json()

    if (!image || !mask || !stoneCode) {
      return NextResponse.json({ error: 'image, mask, and stoneCode are required' }, { status: 400 })
    }

    // --- Rate Limiting ---
    const ip = getClientIp(req)

    try {
      // Count today's requests from this IP
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

      // Log this request
      await supabaseAdmin
        .from('simulation_requests')
        .insert({ ip_address: ip })

    } catch {
      // If rate limit table doesn't exist, continue without limiting
      console.warn('Rate limit check failed, continuing without limit')
    }

    // --- Build Prompt & Call Replicate ---
    const prompt = buildPrompt(stoneCode, categorySlug)

    const response = await fetch(REPLICATE_API, {
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
