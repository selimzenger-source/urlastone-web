import { NextRequest, NextResponse } from 'next/server'
import type { ApplyMode, SurfaceContext } from '@/lib/simulation'
import { supabaseAdmin } from '@/lib/supabase'

// Allow up to 120 seconds for Vercel serverless function (Sonnet analysis + Gemini generation)
export const maxDuration = 120

const DAILY_LIMIT_PER_IP = 10
const DAILY_LIMIT_GLOBAL = 50


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

// ─── Sonnet Image Analysis ───────────────────────────────

interface SonnetAnalysis {
  type: 'exterior' | 'interior'
  floors: number
  estimated_wall_height_m: number
  scale_instruction: string
}

/** Analyze building photo with Claude Sonnet to get wall dimensions for math-based scale */
async function analyzeImageWithSonnet(
  imageBase64: string,
  imageMimeType: string,
): Promise<SonnetAnalysis> {
  const defaultResult: SonnetAnalysis = {
    type: 'exterior',
    floors: 2,
    estimated_wall_height_m: 6,
    scale_instruction: '',
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.log('[Sonnet] No API key, using defaults')
    return defaultResult
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
              text: `Analyze this photo for stone cladding simulation. Reply ONLY with a JSON object, no markdown:
{
  "type": "exterior" or "interior",
  "floors": number of visible floors (0 if interior),
  "estimated_wall_height_m": estimated total wall/surface height in meters (e.g. 2.5 for standard room, 6 for 2-story, 21 for 7-story),
  "scale_instruction": "Specific instruction about stone size relative to visible elements. For interior: reference outlets, doors, furniture. For exterior: reference windows, floor heights."
}`,
            },
          ],
        }],
      }),
    })

    const elapsed = Math.round((Date.now() - startTime) / 1000)

    if (!response.ok) {
      console.error(`[Sonnet] API error (${response.status}, ${elapsed}s)`)
      return defaultResult
    }

    const result = await response.json()
    const text = result.content?.[0]?.text || ''
    console.log(`[Sonnet] Analysis in ${elapsed}s:`, text.substring(0, 200))

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0])
      console.log('[Sonnet] Parsed:', JSON.stringify(analysis))
      return {
        type: analysis.type || 'exterior',
        floors: analysis.floors || 2,
        estimated_wall_height_m: analysis.estimated_wall_height_m || 6,
        scale_instruction: analysis.scale_instruction || '',
      }
    }

    return defaultResult
  } catch (err) {
    const elapsed = Math.round((Date.now() - startTime) / 1000)
    console.error(`[Sonnet] Exception after ${elapsed}s:`, err)
    return defaultResult
  }
}

// ─── Math-Based Prompt Builders (winning strategy from 30+ tests) ───

/** Build prompt for FULL mode — covers ALL walls */
function buildFullPrompt(
  surfaceContext: string,
  groutInstruction: string,
  categorySlug: string,
  analysis: SonnetAnalysis,
  userNote?: string,
): string {
  const stoneSize = 0.15 // meters — average stone piece size
  const wallHeight = analysis.estimated_wall_height_m || 6
  const stonesVertical = Math.round(wallHeight / stoneSize)
  const totalEstimate = stonesVertical * 30 // rough width estimate

  // Category-specific stone description
  const categoryDesc = getCategoryDesc(categorySlug)

  // Surface-specific coverage instructions
  const coverageInstructions = getCoverageInstructions(surfaceContext)

  if (surfaceContext === 'facade' || surfaceContext === 'bathroom' || surfaceContext === 'floor') {
    // Exterior / full coverage surfaces — math-based prompt (v27 winner)
    return `Image 1: ${getSurfaceDescription(surfaceContext, analysis)}. Image 2: stone texture CLOSE-UP (real size: each piece is 10-20cm, photo is zoomed in).

EDIT Image 1: Apply Image 2's stone to ${coverageInstructions.apply}.

STONE SIZE (MOST IMPORTANT):
Each stone piece is ~15cm in real life. ${analysis.scale_instruction ? `SCALE REFERENCE: ${analysis.scale_instruction}` : ''}
- Wall height ~${wallHeight}m ÷ 0.15m = ${stonesVertical} stone pieces from bottom to top
- Each window/opening width (~1m) = ~7 stone pieces across
- Total visible surface must show ${totalEstimate}+ individual stone pieces
- ${categoryDesc}

⚠️ UNIFORMITY (CRITICAL): Every wall section must have the SAME stone size and pattern. Do NOT make some areas have large stones and other areas small stones. The stone size must be IDENTICAL on left wall, right wall, columns, upper floor, lower floor — everywhere. If one wall has 20 stones per floor height, ALL walls must have 20 stones per floor height. Zero variation in stone scale across the building.

COVERAGE: ${coverageInstructions.full}

${surfaceContext === 'facade' ? 'WINDOWS: Install glass with dark aluminum frames in ALL openings.\n' : ''}COLOR: Copy EXACT tones from Image 2 — warm natural colors with variation between pieces. Do NOT average into one uniform color.

QUALITY: ${groutInstruction} 3D surface depth with natural shadows — NOT flat wallpaper. Photorealistic${surfaceContext === 'facade' ? ' architectural photograph' : ''}.${userNote ? `\n\nUSER NOTE: "${userNote}"` : ''}`
  }

  // Interior / fireplace — aggressive scale with real-object calibration
  return `Apply Image 2's stone texture to ${coverageInstructions.apply} in Image 1 (${getSurfaceDescription(surfaceContext, analysis)}).

⚠️ STONE SIZE CALIBRATION — use REAL OBJECTS in the photo:
Look at Image 1 carefully. Find these reference objects and use them to calibrate stone size:
- Electrical OUTLET/SOCKET on the wall → it is ~10cm tall. Each stone piece must be THIS SIZE.
- Ceiling SPOT LIGHTS → ~8cm diameter. Each stone should be slightly larger than one spot.
- Ventilation GRILLE → ~30cm wide. At least 2-3 stones should fit across it.
- Fireplace opening → ~50cm wide. At least 4-5 stones should fit across it.
${analysis.scale_instruction ? `- AI ANALYSIS: ${analysis.scale_instruction}` : ''}

MANDATORY STONE COUNT:
- Floor to ceiling (~${wallHeight}m) = ${Math.round(wallHeight / 0.12)} stones vertically
- Each wall section must show 200+ individual pieces total
- ${categoryDesc}

⚠️ THE #1 AI MISTAKE: Making stones WAY TOO LARGE. If any stone is bigger than a human fist relative to the room → TOO LARGE.

⚠️ UNIFORMITY: ALL walls and surfaces must have IDENTICAL stone size. Narrow columns get the SAME small stones as wide walls. Zero size variation.

${coverageInstructions.preserve}

COLOR: Copy EXACT tones from Image 2 with natural color variety.
QUALITY: ${groutInstruction} 3D depth and shadows. Photorealistic.${userNote ? `\n\nUSER NOTE: "${userNote}"` : ''}`
}

/** Build prompt for BRUSH mode — applies only to masked areas */
function buildBrushPrompt(
  surfaceContext: string,
  groutInstruction: string,
  categorySlug: string,
  analysis: SonnetAnalysis,
  maskImageNum: number,
  userNote?: string,
): string {
  const stoneSize = surfaceContext === 'facade' ? 0.15 : 0.12
  const wallHeight = analysis.estimated_wall_height_m || 6
  const stonesVertical = Math.round(wallHeight / stoneSize)
  const categoryDesc = getCategoryDesc(categorySlug)

  return `Image 1: ${getSurfaceDescription(surfaceContext, analysis)}. Image 2: stone texture CLOSE-UP (real size: each piece is ${Math.round(stoneSize * 100)}cm). Image ${maskImageNum}: black/white MASK — apply stone ONLY to WHITE areas.

STONE SIZE (MOST IMPORTANT):
Each stone piece ~${Math.round(stoneSize * 100)}cm. ${analysis.scale_instruction ? `SCALE: ${analysis.scale_instruction}` : ''}
- Surface height ~${wallHeight}m → ${stonesVertical} stone pieces vertically
- ${categoryDesc}

COLOR: Copy EXACT tones from Image 2 with natural color variety.

RULES:
- Apply stone ONLY to white mask areas. Black = untouched
- ${groutInstruction}
- ⚠️ UNIFORM stone size EVERYWHERE — narrow columns, wide walls, corners ALL must have the SAME stone size. Do NOT make stones larger on narrow surfaces.
- 3D depth and mortar shadows — NOT flat wallpaper
- Do NOT change the building structure
- Photorealistic.${userNote ? `\n\nUSER NOTE: "${userNote}"` : ''}`
}

function getSurfaceDescription(surfaceContext: string, analysis: SonnetAnalysis): string {
  switch (surfaceContext) {
    case 'facade': return `${analysis.floors || 2}-story building (~${analysis.estimated_wall_height_m || 6}m tall)`
    case 'fireplace': return 'interior room with fireplace'
    case 'interior': return 'interior room'
    case 'bathroom': return 'bathroom'
    case 'floor': return 'room (floor view)'
    default: return 'building exterior'
  }
}

function getCategoryDesc(categorySlug: string): string {
  switch (categorySlug) {
    case 'nature': return 'Small irregular flat stone pieces in natural shapes — like broken ceramic tiles, NOT boulders'
    case 'mix': return 'IMPORTANT: This is a MIX pattern — it must have TWO distinct elements: (1) thin HORIZONTAL stone strips like flat bricks (2-3cm tall, 20-40cm wide) AND (2) small irregular rounded natural pieces between them. Alternate between strip rows and irregular pieces. NOT all irregular — must include visible horizontal strip rows'
    case 'crazy': return 'Dense mosaic of MANY TINY rounded/irregular pieces — like cobblestones, very dense very small'
    case 'line': return 'THIN uniform horizontal stone strips (2-3cm tall, 30-60cm wide) — modern minimalist linear pattern'
    default: return 'Small irregular flat stone pieces — like broken tiles, NOT boulders'
  }
}

function getCoverageInstructions(surfaceContext: string): { apply: string; full: string; preserve: string } {
  switch (surfaceContext) {
    case 'facade': return {
      apply: 'ALL exterior wall surfaces',
      full: 'Front, sides, columns, foundation wall, beams — EVERY surface. Zero bare concrete, brick, or plaster. Cover ALL concrete beams and columns with stone too.',
      preserve: 'PRESERVE: Windows, roof, sky, ground, stairs, vegetation.',
    }
    case 'fireplace': return {
      apply: 'the fireplace surround and chimney wall',
      full: 'Cover the fireplace wall area completely.',
      preserve: 'DO NOT TOUCH: Fireplace body/insert, marble/stone mantle/countertop, floor, ceiling, furniture, fixtures.',
    }
    case 'interior': return {
      apply: 'all bare wall surfaces',
      full: 'Cover all painted/bare walls.',
      preserve: 'DO NOT TOUCH: Fireplace, countertops, floor, ceiling, furniture, doors, windows, fixtures.',
    }
    case 'bathroom': return {
      apply: 'all bathroom wall surfaces',
      full: 'Cover all walls completely.',
      preserve: 'PRESERVE: Toilet, sink, mirror, fixtures, bathtub, shower, floor.',
    }
    case 'floor': return {
      apply: 'the entire floor surface',
      full: 'Cover entire floor area.',
      preserve: 'PRESERVE: Walls, furniture, ceiling, fixtures.',
    }
    default: return {
      apply: 'ALL wall surfaces',
      full: 'Cover every surface. Zero bare areas remaining.',
      preserve: 'PRESERVE: Windows, roof, sky, ground.',
    }
  }
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

// ─── Gemini Provider ──────────────────────────────────────

/** Generate with Google Gemini */
async function generateWithGemini(
  prompt: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  images: Array<{ base64: string; mimeType: string }>,
  preferredModel?: string,
): Promise<string | null> {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) {
    console.log('[Gemini] No API key configured, skipping')
    return null
  }

  // Model priority: pro first (better scale results), then flash fallbacks
  const ALL_MODELS = [
    'gemini-3-pro-image-preview',       // Best scale results (20 RPM / 250 RPD)
    'gemini-2.5-flash-image',           // Good fallback (500 RPM / 2K RPD)
    'gemini-3.1-flash-image-preview',   // Additional fallback
  ]
  const MODELS = preferredModel
    ? [preferredModel, ...ALL_MODELS.filter(m => m !== preferredModel)]
    : ALL_MODELS

  // Build parts: images + prompt text
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parts: any[] = images.map(img => ({
    inlineData: { mimeType: img.mimeType, data: img.base64 },
  }))
  parts.push({ text: prompt })

  const requestBody = JSON.stringify({
    contents: [{ parts }],
    generationConfig: { responseModalities: ['IMAGE'] },
  })

  for (const model of MODELS) {
    console.log(`[Gemini] Trying model: ${model}...`)
    const startTime = Date.now()

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: requestBody,
        }
      )

      const elapsed = Math.round((Date.now() - startTime) / 1000)

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }))
        console.error(`[Gemini] ${model} error (${res.status}, ${elapsed}s):`, JSON.stringify(err).substring(0, 200))
        continue
      }

      const result = await res.json()
      console.log(`[Gemini] ${model} responded in ${elapsed}s`)

      const resParts = result.candidates?.[0]?.content?.parts || []
      for (const part of resParts) {
        if (part.inlineData?.mimeType?.startsWith('image/')) {
          const mimeType = part.inlineData.mimeType as string
          console.log(`[Gemini] ${model} — image found (${mimeType})`)
          return `data:${mimeType};base64,${part.inlineData.data}`
        }
      }

      const finishReason = result.candidates?.[0]?.finishReason
      if (finishReason && finishReason !== 'STOP') {
        console.error(`[Gemini] ${model} finish reason:`, finishReason)
      }

      const textParts = resParts.filter((p: Record<string, unknown>) => p.text).map((p: Record<string, unknown>) => p.text)
      if (textParts.length) {
        console.log(`[Gemini] ${model} text:`, (textParts.join(' ') as string).substring(0, 200))
      }

      console.error(`[Gemini] ${model} — no image in response, trying next...`)
    } catch (err) {
      const elapsed = Math.round((Date.now() - startTime) / 1000)
      console.error(`[Gemini] ${model} exception after ${elapsed}s:`, err)
    }
  }

  console.error('[Gemini] All models failed')
  return null
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
      stoneImageUrl,
      locale,
      applyMode = 'brush' as ApplyMode,
      surfaceContext = 'facade' as SurfaceContext,
      groutStyle = 'grouted',
      geminiModel,
      userNote,
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
    console.log(`[Simulation] Stone: code=${stoneCode}, category=${categorySlug}, mode=${applyMode}, surface=${surfaceContext}`)

    // Rate limiting
    const ip = getClientIp(req)
    const rateLimitResponse = await checkRateLimit(ip, locale)
    if (rateLimitResponse) return rateLimitResponse

    // 1. Extract building image
    const building = extractBase64(image)

    // 2. Analyze image with Sonnet (for math-based scale calculation)
    const analysis = await analyzeImageWithSonnet(building.base64, building.mimeType)
    console.log(`[Simulation] Sonnet: type=${analysis.type}, floors=${analysis.floors}, height=${analysis.estimated_wall_height_m}m`)

    // 3. Fetch stone reference image
    console.log('[Simulation] Fetching stone image:', stoneImageUrl.substring(0, 80))
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
      return NextResponse.json({ error: 'Failed to load stone reference image' }, { status: 500 })
    }

    // 4. Build grout instruction
    const groutInstruction = groutStyle === 'groutless'
      ? 'Stones tightly fitted with NO visible grout or gaps.'
      : 'Visible mortar/grout lines between each stone piece.'

    // 5. Build prompt and images array
    let prompt: string
    const images: Array<{ base64: string; mimeType: string }> = [building, stone]

    if (applyMode === 'brush') {
      // BRUSH mode: building + stone + mask
      const maskData = extractBase64(mask)
      images.push(maskData)
      const maskImageNum = 3

      prompt = buildBrushPrompt(
        surfaceContext, groutInstruction, categorySlug || 'nature',
        analysis, maskImageNum, userNote,
      )
      console.log('[Simulation] BRUSH mode prompt built')
    } else {
      // FULL mode: building + stone
      prompt = buildFullPrompt(
        surfaceContext, groutInstruction, categorySlug || 'nature',
        analysis, userNote,
      )
      console.log('[Simulation] FULL mode prompt built')
    }

    // 6. Generate with Gemini
    const geminiResult = await generateWithGemini(prompt, images, geminiModel)

    if (!geminiResult) {
      return NextResponse.json(
        { error: 'AI görsel üretemedi. Lütfen tekrar deneyin.' },
        { status: 500 }
      )
    }

    // 7. Upload result
    console.log('[Simulation] Uploading result to storage...')
    let outputUrl: string | null = null
    try {
      outputUrl = await uploadToStorage(geminiResult, 'result')
      console.log('[Simulation] Result saved:', outputUrl?.substring(0, 80))
    } catch (err) {
      console.error('[Simulation] Failed to upload result:', err)
    }

    if (!outputUrl) {
      return NextResponse.json(
        { error: 'AI görsel üretemedi. Lütfen tekrar deneyin.' },
        { status: 500 }
      )
    }

    // 8. Return result
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
