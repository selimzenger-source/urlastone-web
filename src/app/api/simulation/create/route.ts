import { NextRequest, NextResponse } from 'next/server'
import { buildPrompt } from '@/lib/simulation'
import type { ApplyMode, SurfaceContext } from '@/lib/simulation'
import { supabaseAdmin } from '@/lib/supabase'

// Allow up to 120 seconds for Vercel serverless function (Sonnet analysis + Gemini generation)
export const maxDuration = 120

const DAILY_LIMIT_PER_IP = 10
const DAILY_LIMIT_GLOBAL = 50

// fal.ai endpoints (brush mode + full mode fallback)
const FAL_URL_KONTEXT = 'https://fal.run/fal-ai/flux-kontext/dev'
const FAL_URL_INPAINT = 'https://fal.run/fal-ai/flux-general'

// Short stone descriptions for fal.ai fallback prompts
const STONE_DESCRIPTIONS: Record<string, string> = {
  TRV: 'natural travertine stone with large irregular polygon-shaped cream beige pieces and thick grout lines',
  MRMR: 'natural white marble stone with elegant grey veining in large irregular polygon-shaped pieces',
  BZLT: 'natural dark basalt stone with deep charcoal grey irregular polygon-shaped pieces',
  KLKR: 'natural limestone with warm sandy beige irregular polygon-shaped pieces and thick grout lines',
}

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

// Gemini prompt templates — the second image is ALWAYS the stone reference, Gemini must replicate it exactly
const GEMINI_PROMPTS: Record<string, string> = {
  facade: `The first image is a building photo. The second image is a close-up stone texture sample — it shows the stone type to use but is zoomed in.

CRITICAL RULES:
1. Replicate the EXACT stone texture, color, shape, and pattern from the second image. Do NOT invent a different stone type.
2. SCALE — THIS IS THE MOST IMPORTANT RULE: The reference image is a macro close-up photo. The stones must be VERY SMALL on the building. Think of it this way: between two windows that are side by side, there should be at least 4-6 stones horizontally. Between two windows that are stacked vertically, there should be at least 5-8 stones. A single window should be completely surrounded by at least 25-40 individual stone pieces. Each individual stone piece should be roughly 1/5 to 1/8 the width of a window. If you can count fewer than 30 stones on any wall section between windows, the stones are TOO BIG. Make them SMALLER.
3. UNIFORMITY: Use the IDENTICAL stone pattern on ALL wall surfaces — corners, edges, columns, every section. No variation between areas.

Apply this stone cladding to EVERY visible wall surface. No bare plaster or concrete remaining. Preserve windows, doors, roof, sky, ground, vegetation. Real installed cladding with 3D depth and natural shadows. Keep the same camera angle. Photorealistic.`,

  fireplace: `The first image is a room with a fireplace. The second image is a close-up stone texture sample — it shows the stone type to use but is zoomed in.

CRITICAL RULES:
1. Replicate the EXACT stone texture, color, shape, and pattern from the second image. Do NOT invent a different stone type.
2. SCALE: The reference image is a close-up. When applying to the fireplace, each stone piece must be SMALL. The fireplace opening height should contain at least 8-10 stone pieces vertically. Do NOT make large boulder-sized stones.
3. UNIFORMITY: Use the IDENTICAL stone pattern on the entire fireplace surface.

Apply this stone to the fireplace surround and chimney area. Real installed cladding with 3D depth and natural shadows. Keep furniture, floor, ceiling, and everything else exactly the same. Photorealistic result.`,

  interior: `The first image is an interior room. The second image is a close-up stone texture sample — it shows the stone type to use but is zoomed in.

CRITICAL RULES:
1. Replicate the EXACT stone texture, color, shape, and pattern from the second image. Do NOT invent a different stone type.
2. SCALE: The reference image is a close-up. When applying to the wall, each stone piece must be SMALL. A door height (2m) should have at least 12-15 stones vertically. Do NOT make large boulder-sized stones.
3. UNIFORMITY: Use the IDENTICAL stone pattern on ALL wall surfaces.

Apply this stone to bare wall surfaces only. Do not apply to fireplace, countertops, furniture, floor, ceiling, or fixtures. Real installed cladding with 3D depth and natural shadows. Keep everything else exactly the same. Photorealistic result.`,

  bathroom: `The first image is a bathroom. The second image is a close-up stone texture sample — it shows the stone type to use but is zoomed in.

CRITICAL RULES:
1. Replicate the EXACT stone texture, color, shape, and pattern from the second image. Do NOT invent a different stone type.
2. SCALE: The reference image is a close-up. Each stone piece must be SMALL. A door height should have at least 12-15 stones vertically.
3. UNIFORMITY: ALL wall surfaces must use the IDENTICAL stone pattern.

Apply this stone to all bathroom wall surfaces. Real installed cladding with 3D depth and natural shadows. Keep toilet, sink, mirror, fixtures, bathtub, shower, and floor unchanged. Photorealistic result.`,

  floor: `The first image is a room. The second image is a close-up stone texture sample — it shows the stone type to use but is zoomed in.

CRITICAL RULES:
1. Replicate the EXACT stone texture, color, shape, and pattern from the second image. Do NOT invent a different stone type.
2. SCALE: The reference image is a close-up. Each stone piece must be SMALL (15-25cm). The floor should have many stone pieces, not just a few large ones.
3. UNIFORMITY: The ENTIRE floor must use the IDENTICAL stone pattern.

Apply this stone to the floor surface. Real installed tiles with 3D depth and natural shadows. Keep walls, furniture, and everything else unchanged. Photorealistic result.`,
}

// Category-based stone size descriptions for accurate scaling
const CATEGORY_SIZES: Record<string, string> = {
  nature: 'Each stone piece is a large irregular polygon, approximately 15-30cm wide, with natural broken rough edges.',
  mix: 'A combination of thin horizontal strips (3cm height x 20-40cm width) alternating with medium rounded natural pieces (10-20cm).',
  crazy: 'A random mosaic of many small irregular stone pieces, mixed sizes from 3cm to 15cm, chaotic artistic pattern.',
  line: 'Thin uniform horizontal stone strips, each approximately 2-3cm height x 30-60cm width, clean parallel lines running horizontally.',
}

// ─── Helpers ───────────────────────────────────────────────

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

/** Extract base64 data and mimeType from a data URL */
function extractBase64(dataUrl: string): { base64: string; mimeType: string } {
  const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/)
  if (!match) throw new Error('Invalid data URL')
  return { base64: match[2], mimeType: match[1] }
}

/** Fetch image from URL and convert to base64 */
async function fetchImageAsBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const contentType = res.headers.get('content-type') || 'image/jpeg'
  return { base64: buffer.toString('base64'), mimeType: contentType }
}

/** Upload base64 data URL to Supabase Storage and return public URL */
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

// ─── Claude Sonnet Image Analysis ─────────────────────────

/** Analyze building photo with Claude Sonnet to generate optimal scale instructions */
async function analyzeImageWithSonnet(
  imageBase64: string,
  imageMimeType: string,
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.log('[Sonnet] No API key, using default scale instructions')
    return 'Each stone piece should be approximately 15-25cm in real life.'
  }

  const startTime = Date.now()
  console.log('[Sonnet] Analyzing image for scale context...')

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: imageMimeType, data: imageBase64 },
            },
            {
              type: 'text',
              text: `Analyze this photo for stone cladding simulation. The photo could be an exterior building, interior room, fireplace, bathroom, or any space. Reply ONLY with a JSON object, no markdown:
{
  "type": "exterior" or "interior",
  "floors": number of visible floors (0 if interior),
  "distance": "close" or "medium" or "far",
  "has_windows": true/false,
  "reference_elements": "list visible objects that can be used for size reference: doors, windows, electrical outlets, vents, fireplace opening, furniture, light switches, etc.",
  "estimated_wall_height_m": estimated wall/surface height in meters (e.g. 2.5 for standard room, 6 for 2-story building),
  "scale_instruction": "A VERY specific instruction telling an AI image generator the exact size of each stone piece relative to visible elements. For interiors use outlets, vents, doors, fireplace dimensions. For exteriors use windows, doors, floor heights. CRITICAL: stones must be SMALL, typically 10-25cm each in real life. Example for interior: Each stone piece should be roughly the same size as an electrical outlet (about 10-15cm), so a standard door should have at least 15-20 stones along its height. Example for exterior: Each stone should be about 1/8 the height of a window."
}`,
            },
          ],
        }],
      }),
    })

    const elapsed = Math.round((Date.now() - startTime) / 1000)

    if (!response.ok) {
      console.error(`[Sonnet] API error (${response.status}, ${elapsed}s)`)
      return 'Each stone piece should be approximately 15-25cm in real life.'
    }

    const result = await response.json()
    const text = result.content?.[0]?.text || ''
    console.log(`[Sonnet] Analysis received in ${elapsed}s:`, text.substring(0, 200))

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0])
      console.log('[Sonnet] Parsed analysis:', JSON.stringify(analysis))
      return analysis.scale_instruction || 'Each stone piece should be approximately 15-25cm in real life.'
    }

    return 'Each stone piece should be approximately 15-25cm in real life.'
  } catch (err) {
    const elapsed = Math.round((Date.now() - startTime) / 1000)
    console.error(`[Sonnet] Exception after ${elapsed}s:`, err)
    return 'Each stone piece should be approximately 15-25cm in real life.'
  }
}

// ─── AI Providers ──────────────────────────────────────────

/** Generate with Google Gemini (primary for both full and brush modes) */
async function generateWithGemini(
  buildingBase64: string,
  buildingMimeType: string,
  stoneBase64: string,
  stoneMimeType: string,
  surfaceContext: string,
  groutStyle: string,
  categorySlug: string,
  patternBase64?: string | null,
  patternMimeType?: string | null,
  maskBase64?: string,
  maskMimeType?: string,
): Promise<string | null> {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) {
    console.log('[Gemini] No API key configured, skipping')
    return null
  }

  // Build grout instruction based on style
  const groutInstruction = groutStyle === 'groutless'
    ? 'Stones must be tightly fitted together with NO visible grout, mortar, or gap lines between them. Zero spacing between stone pieces.'
    : 'There must be visible grout/mortar lines between each stone piece. Clear gaps filled with grey mortar between stones.'

  // Get category-specific size description
  const sizeDesc = CATEGORY_SIZES[categorySlug] || CATEGORY_SIZES.nature

  // Determine image numbering based on whether pattern image is included
  const hasPattern = patternBase64 && patternMimeType
  const patternImageNum = hasPattern ? 3 : null
  const maskImageNum = maskBase64 ? (hasPattern ? 4 : 3) : null

  // Build prompt based on mode (full vs brush with mask)
  let prompt: string
  if (maskBase64) {
    // Brush mode with mask
    const patternRef = hasPattern
      ? ` Image ${patternImageNum} is a diagram showing the stone laying PATTERN — how stones are arranged and their relative sizes.`
      : ''
    prompt = `Image 1 is a photo of a space. Image 2 is a close-up stone texture sample (zoomed in) showing the stone type to use.${patternRef} Image ${maskImageNum} is a black and white mask — the WHITE areas indicate exactly where to apply the stone.

CRITICAL RULES:
1. Replicate the EXACT stone texture, color, shape, and pattern from Image 2. Do NOT invent a different stone type.
2. SCALE: Image 2 is a close-up. Each stone piece must be SMALL when applied — ${sizeDesc}${hasPattern ? ` Follow the arrangement pattern shown in Image ${patternImageNum}.` : ''}
3. UNIFORMITY: Use the IDENTICAL stone pattern across the entire masked area.

Apply this stone ONLY to the white areas of the mask. Do NOT change anything in the black areas. Real installed cladding with 3D depth and natural shadows — NOT flat like wallpaper. ${groutInstruction} Photorealistic result.`
  } else {
    const basePrompt = GEMINI_PROMPTS[surfaceContext] || GEMINI_PROMPTS.facade
    const patternRef = hasPattern
      ? `\n\nImage 3 is a diagram showing the stone laying PATTERN — how stones should be arranged. Follow this pattern for the stone layout.`
      : ''
    // Append grout, size and pattern instructions to the base prompt
    prompt = `${basePrompt}${patternRef}\n\nSTONE SIZE: ${sizeDesc}\n\n${groutInstruction}`
  }

  console.log('[Gemini] Calling gemini-3-pro-image-preview...')
  console.log('[Gemini] Surface context:', surfaceContext, hasPattern ? '(with pattern image)' : '', maskBase64 ? '(brush mode with mask)' : '(full mode)')
  const startTime = Date.now()

  // Build parts array: building + stone + optional pattern + optional mask
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imageParts: any[] = [
    { inlineData: { mimeType: buildingMimeType, data: buildingBase64 } },
    { inlineData: { mimeType: stoneMimeType, data: stoneBase64 } },
  ]
  if (hasPattern) {
    imageParts.push({ inlineData: { mimeType: patternMimeType, data: patternBase64 } })
  }
  if (maskBase64 && maskMimeType) {
    imageParts.push({ inlineData: { mimeType: maskMimeType, data: maskBase64 } })
  }
  imageParts.push({ text: prompt })

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: imageParts }],
          generationConfig: {
            responseModalities: ['IMAGE'],
          },
        }),
      }
    )

    const elapsed = Math.round((Date.now() - startTime) / 1000)

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      console.error(`[Gemini] API error (${res.status}, ${elapsed}s):`, JSON.stringify(err).substring(0, 300))
      return null
    }

    const result = await res.json()
    console.log(`[Gemini] Response received in ${elapsed}s`)

    // Find image in response parts
    const resParts = result.candidates?.[0]?.content?.parts || []
    for (const part of resParts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        const mimeType = part.inlineData.mimeType as string
        console.log('[Gemini] Image found in response, mimeType:', mimeType)
        return `data:${mimeType};base64,${part.inlineData.data}`
      }
    }

    // Check for safety block or other issues
    const finishReason = result.candidates?.[0]?.finishReason
    if (finishReason && finishReason !== 'STOP') {
      console.error('[Gemini] Finish reason:', finishReason)
    }

    // Log text parts for debugging
    const textParts = resParts.filter((p: Record<string, unknown>) => p.text).map((p: Record<string, unknown>) => p.text)
    if (textParts.length) {
      console.log('[Gemini] Text response:', (textParts.join(' ') as string).substring(0, 200))
    }

    console.error('[Gemini] No image in response')
    return null
  } catch (err) {
    const elapsed = Math.round((Date.now() - startTime) / 1000)
    console.error(`[Gemini] Exception after ${elapsed}s:`, err)
    return null
  }
}

/** Generate with fal.ai (fallback for full mode, primary for brush mode) */
async function generateWithFalAi(
  imageUrl: string,
  maskUrl: string | undefined,
  stoneCode: string,
  categorySlug: string,
  applyMode: ApplyMode,
  prompt: string,
): Promise<string | null> {
  const falKey = process.env.FAL_API_KEY
  if (!falKey) {
    console.log('[fal.ai] No API key configured')
    return null
  }

  let falBody: Record<string, unknown>
  let falEndpoint: string

  if (applyMode === 'full') {
    falEndpoint = FAL_URL_KONTEXT
    const stoneDesc = STONE_DESCRIPTIONS[stoneCode] || 'natural irregular polygon stone'
    falBody = {
      image_url: imageUrl,
      prompt: `Apply ${stoneDesc} cladding to ALL exterior wall surfaces of this building. Cover every wall completely with stone. Preserve EXACTLY: all windows, doors, roof, stairs, railings, sky, vegetation, ground. Do not add or remove any architectural elements. Do not change the building shape. Only replace the wall surface material with stone. Photorealistic result, professional architectural photography.`,
      num_inference_steps: 28,
      guidance_scale: 3.5,
      num_images: 1,
      output_format: 'jpeg',
      enable_safety_checker: false,
    }
  } else {
    falEndpoint = FAL_URL_INPAINT
    falBody = {
      prompt,
      num_inference_steps: 30,
      guidance_scale: 4.0,
      num_images: 1,
      output_format: 'jpeg',
      enable_safety_checker: false,
      controlnets: [
        {
          path: 'Shakker-Labs/FLUX.1-dev-ControlNet-Union-Pro',
          control_image_url: imageUrl,
          control_mode: 'inpainting',
          mask_image_url: maskUrl,
          conditioning_scale: 0.85,
        },
      ],
    }
  }

  console.log(`[fal.ai] Calling ${falEndpoint.split('/').pop()} (${applyMode})...`)
  const startTime = Date.now()

  const falResponse = await fetch(falEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${falKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(falBody),
  })

  const elapsed = Math.round((Date.now() - startTime) / 1000)

  if (!falResponse.ok) {
    const err = await falResponse.json().catch(() => ({}))
    console.error(`[fal.ai] Error (${falResponse.status}, ${elapsed}s):`, JSON.stringify(err).substring(0, 300))
    return null
  }

  const falResult = await falResponse.json()
  console.log(`[fal.ai] Result received in ${elapsed}s`)

  const outputUrl = falResult.images?.[0]?.url || null
  if (outputUrl) {
    console.log('[fal.ai] Output URL:', outputUrl.substring(0, 80))
  }
  return outputUrl
}

// ─── Rate Limiting ─────────────────────────────────────────

async function checkRateLimit(ip: string, locale: string): Promise<NextResponse | null> {
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

    await supabaseAdmin.from('simulation_requests').insert({ ip_address: ip })
  } catch {
    console.warn('Rate limit check failed, continuing without limit')
  }

  return null
}

async function getRemainingCount(ip: string): Promise<number> {
  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const { count } = await supabaseAdmin
      .from('simulation_requests')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('created_at', todayStart.toISOString())
    if (count !== null) return Math.max(0, DAILY_LIMIT_PER_IP - count)
  } catch { /* ignore */ }
  return DAILY_LIMIT_PER_IP - 1
}

// ─── Main Handler ──────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const {
      image,
      mask,
      stoneCode,
      categorySlug,
      categoryImageUrl,
      stoneImageUrl,
      locale,
      applyMode = 'brush' as ApplyMode,
      surfaceContext = 'facade' as SurfaceContext,
      groutStyle = 'grouted',
    } = await req.json()

    // Validate required fields
    if (!image || !stoneCode) {
      return NextResponse.json({ error: 'image and stoneCode are required' }, { status: 400 })
    }
    if (applyMode === 'brush' && !mask) {
      return NextResponse.json({ error: 'mask is required for brush mode' }, { status: 400 })
    }
    if (!stoneImageUrl) {
      return NextResponse.json({ error: 'stoneImageUrl is required' }, { status: 400 })
    }

    // Rate limiting
    const ip = getClientIp(req)
    const rateLimitResponse = await checkRateLimit(ip, locale)
    if (rateLimitResponse) return rateLimitResponse

    let outputUrl: string | null = null

    if (applyMode === 'full') {
      // ═══════════════════════════════════════════════════════
      // FULL MODE: Gemini (primary) → fal.ai kontext (fallback)
      // ═══════════════════════════════════════════════════════
      console.log('[Simulation] FULL mode — Gemini primary, fal.ai fallback')

      // 1. Extract building image base64
      const building = extractBase64(image)

      // 2. Fetch stone reference image as base64
      console.log('[Simulation] Fetching stone reference image:', stoneImageUrl.substring(0, 80))
      let stone: { base64: string; mimeType: string }
      try {
        // Handle relative URLs
        let resolvedUrl = stoneImageUrl
        if (stoneImageUrl.startsWith('/')) {
          const origin = req.headers.get('origin') || req.headers.get('x-forwarded-host') || 'www.urlastone.com'
          const protocol = origin.startsWith('http') ? '' : 'https://'
          resolvedUrl = `${protocol}${origin}${stoneImageUrl}`
        }
        stone = await fetchImageAsBase64(resolvedUrl)
      } catch (err) {
        console.error('[Simulation] Failed to fetch stone image:', err)
        return NextResponse.json(
          { error: 'Failed to load stone reference image' },
          { status: 500 }
        )
      }

      // 3. Fetch category pattern illustration (if available)
      let pattern: { base64: string; mimeType: string } | null = null
      if (categoryImageUrl) {
        try {
          let resolvedPatternUrl = categoryImageUrl
          if (categoryImageUrl.startsWith('/')) {
            const origin = req.headers.get('origin') || req.headers.get('x-forwarded-host') || 'www.urlastone.com'
            const protocol = origin.startsWith('http') ? '' : 'https://'
            resolvedPatternUrl = `${protocol}${origin}${categoryImageUrl}`
          }
          pattern = await fetchImageAsBase64(resolvedPatternUrl)
          console.log('[Simulation] Pattern image fetched for category:', categorySlug)
        } catch (err) {
          console.warn('[Simulation] Could not fetch pattern image, continuing without:', err)
        }
      }

      // 4. Try Gemini first (sends building + stone + optional pattern)
      const geminiResult = await generateWithGemini(
        building.base64, building.mimeType,
        stone.base64, stone.mimeType,
        surfaceContext,
        groutStyle,
        categorySlug || 'nature',
        pattern?.base64, pattern?.mimeType,
      )

      if (geminiResult) {
        // Upload Gemini result (base64) to Supabase Storage
        console.log('[Simulation] Uploading Gemini result to storage...')
        try {
          outputUrl = await uploadToStorage(geminiResult, 'result')
          console.log('[Simulation] Gemini result saved:', outputUrl?.substring(0, 80))
        } catch (err) {
          console.error('[Simulation] Failed to upload Gemini result:', err)
          // Don't give up — try fal.ai fallback
        }
      }

      // 4. Fallback to fal.ai if Gemini failed
      if (!outputUrl) {
        console.log('[Simulation] Falling back to fal.ai flux-kontext...')

        // Upload building image to Supabase (fal.ai needs HTTP URL)
        let imageUrl: string
        try {
          imageUrl = await uploadToStorage(image, 'img')
        } catch (err) {
          console.error('[Simulation] Image upload failed:', err)
          return NextResponse.json(
            { error: 'Failed to upload image. Please try again.' },
            { status: 500 }
          )
        }

        outputUrl = await generateWithFalAi(
          imageUrl, undefined, stoneCode, categorySlug, 'full',
          buildPrompt(stoneCode, categorySlug),
        )
      }
    } else {
      // ═══════════════════════════════════════════════════════
      // BRUSH MODE: Gemini (primary) → fal.ai inpainting (fallback)
      // ═══════════════════════════════════════════════════════
      console.log('[Simulation] BRUSH mode — Gemini primary, fal.ai fallback')

      // 1. Extract building + mask base64
      const building = extractBase64(image)
      const maskData = extractBase64(mask)

      // 2. Fetch stone reference image as base64
      console.log('[Simulation] Fetching stone reference image:', stoneImageUrl.substring(0, 80))
      let stone: { base64: string; mimeType: string }
      try {
        let resolvedUrl = stoneImageUrl
        if (stoneImageUrl.startsWith('/')) {
          const origin = req.headers.get('origin') || req.headers.get('x-forwarded-host') || 'www.urlastone.com'
          const protocol = origin.startsWith('http') ? '' : 'https://'
          resolvedUrl = `${protocol}${origin}${stoneImageUrl}`
        }
        stone = await fetchImageAsBase64(resolvedUrl)
      } catch (err) {
        console.error('[Simulation] Failed to fetch stone image:', err)
        return NextResponse.json(
          { error: 'Failed to load stone reference image' },
          { status: 500 }
        )
      }

      // 3. Fetch category pattern illustration (if available)
      let pattern: { base64: string; mimeType: string } | null = null
      if (categoryImageUrl) {
        try {
          let resolvedPatternUrl = categoryImageUrl
          if (categoryImageUrl.startsWith('/')) {
            const origin = req.headers.get('origin') || req.headers.get('x-forwarded-host') || 'www.urlastone.com'
            const protocol = origin.startsWith('http') ? '' : 'https://'
            resolvedPatternUrl = `${protocol}${origin}${categoryImageUrl}`
          }
          pattern = await fetchImageAsBase64(resolvedPatternUrl)
          console.log('[Simulation] Pattern image fetched for brush mode, category:', categorySlug)
        } catch (err) {
          console.warn('[Simulation] Could not fetch pattern image, continuing without:', err)
        }
      }

      // 4. Try Gemini first (building + stone + optional pattern + mask)
      const geminiResult = await generateWithGemini(
        building.base64, building.mimeType,
        stone.base64, stone.mimeType,
        surfaceContext,
        groutStyle,
        categorySlug || 'nature',
        pattern?.base64, pattern?.mimeType,
        maskData.base64, maskData.mimeType,
      )

      if (geminiResult) {
        console.log('[Simulation] Uploading Gemini brush result to storage...')
        try {
          outputUrl = await uploadToStorage(geminiResult, 'result')
          console.log('[Simulation] Gemini brush result saved:', outputUrl?.substring(0, 80))
        } catch (err) {
          console.error('[Simulation] Failed to upload Gemini result:', err)
        }
      }

      // 4. Fallback to fal.ai if Gemini failed
      if (!outputUrl) {
        console.log('[Simulation] Falling back to fal.ai inpainting...')

        let imageUrl: string
        let maskUrl: string | undefined
        try {
          imageUrl = await uploadToStorage(image, 'img')
          if (mask) {
            maskUrl = await uploadToStorage(mask, 'mask')
          }
        } catch (err) {
          console.error('[Simulation] Image upload failed:', err)
          return NextResponse.json(
            { error: 'Failed to upload image. Please try again.' },
            { status: 500 }
          )
        }

        const prompt = buildPrompt(stoneCode, categorySlug)
        outputUrl = await generateWithFalAi(
          imageUrl, maskUrl, stoneCode, categorySlug, 'brush', prompt,
        )
      }
    }

    // Check result
    if (!outputUrl) {
      return NextResponse.json(
        { error: 'AI görsel üretemedi. Lütfen tekrar deneyin.' },
        { status: 500 }
      )
    }

    // Calculate remaining
    const remaining = await getRemainingCount(ip)

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
