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

// Surface-specific context — what to clad and what to preserve
const SURFACE_CONTEXT: Record<string, { scene: string; apply: string; preserve: string }> = {
  facade: {
    scene: 'a building exterior',
    apply: 'EVERY visible wall surface — front, sides, corners, columns, balcony walls, ALL of it. Zero bare plaster or concrete remaining.',
    preserve: 'windows, doors, roof, sky, ground, vegetation, railings',
  },
  fireplace: {
    scene: 'a room with a fireplace',
    apply: 'the fireplace surround and chimney area',
    preserve: 'furniture, floor, ceiling, walls away from fireplace',
  },
  interior: {
    scene: 'an interior room',
    apply: 'all bare wall surfaces',
    preserve: 'fireplace, countertops, furniture, floor, ceiling, fixtures',
  },
  bathroom: {
    scene: 'a bathroom',
    apply: 'all bathroom wall surfaces',
    preserve: 'toilet, sink, mirror, fixtures, bathtub, shower, floor',
  },
  floor: {
    scene: 'a room',
    apply: 'the entire floor surface',
    preserve: 'walls, furniture, ceiling, fixtures',
  },
}

// Build the final Gemini prompt — scale + color fidelity come FIRST (highest priority)
function buildGeminiPrompt(
  surfaceContext: string,
  sizeDesc: string,
  groutInstruction: string,
  hasPattern: boolean,
  patternImageNum: number | null,
  hasMask: boolean,
  maskImageNum: number | null,
  userNote?: string,
): string {
  const ctx = SURFACE_CONTEXT[surfaceContext] || SURFACE_CONTEXT.facade

  if (hasMask) {
    // Brush mode with mask
    const patternRef = hasPattern
      ? ` Image ${patternImageNum} is a diagram showing the stone laying PATTERN.`
      : ''
    return `Image 1 is a photo of ${ctx.scene}. Image 2 is a close-up stone texture sample (zoomed in).${patternRef} Image ${maskImageNum} is a black/white mask — WHITE = apply stone.

### MOST IMPORTANT — STONE SIZE (read this FIRST):
COMMON MISTAKE: AI models almost always generate stones WAY TOO LARGE. You MUST make them MUCH SMALLER than your instinct.
CRITICAL: Image 2 is a CLOSE-UP macro photo — COMPLETELY IGNORE the apparent size of stones in it. Only copy COLOR and TEXTURE, NOT the size.
PIXEL RULE: Each stone piece should be no wider than 3-5% of the total image width.
${sizeDesc}
${hasPattern ? `Follow the arrangement pattern shown in Image ${patternImageNum}.` : ''}

### STONE COLOR FIDELITY:
Study Image 2 carefully. If it contains MULTIPLE colors/tones (e.g. some pieces are orange, some brown, some dark grey), you MUST reproduce that SAME color distribution. Do NOT average the colors into one uniform tone. Each stone piece should randomly pick from the color range visible in Image 2.

### OTHER RULES:
- Replicate the EXACT stone texture, surface quality from Image 2. Do NOT invent a different stone.
- UNIFORMITY: Same stone pattern everywhere in the masked area.
- Apply ONLY to white mask areas. Black areas = untouched.
- IGNORE any text, numbers, signs, or markings on walls — cover them with stone.
- Real installed cladding with 3D depth and natural shadows — NOT flat wallpaper.
- ${groutInstruction}
- Photorealistic result.${userNote ? `\n\n### USER INSTRUCTION:\nThe user added this note: "${userNote}". Follow this instruction as much as possible while keeping the other rules.` : ''}`
  }

  // Full mode
  const patternRef = hasPattern
    ? `\n\nImage 3 is a diagram showing the stone laying PATTERN — follow it for stone arrangement.`
    : ''

  return `Image 1 is a photo of ${ctx.scene}. Image 2 is a close-up stone texture sample (zoomed in — NOT actual installed size).${patternRef}

### MOST IMPORTANT — STONE SIZE (read this FIRST):
COMMON MISTAKE: AI models almost always generate stones WAY TOO LARGE. You MUST make them MUCH SMALLER than your instinct.
CRITICAL: Image 2 is a CLOSE-UP macro photo. It may show only 2-4 pieces filling the frame — COMPLETELY IGNORE the apparent size of stones in Image 2. Only copy COLOR, TEXTURE, and SURFACE from Image 2, NOT the size or scale.

MANDATORY STONE COUNT: The ENTIRE building facade must contain AT LEAST 300-500 individual stone pieces total. Each floor (approximately 3 meters) must show at least 15-20 stones vertically. If the total visible stone count on the building is less than 200, the stones are WAY TOO BIG.

PIXEL RULE: In the output image, each individual stone piece should be no wider than approximately 3-5% of the total image width. If any stone piece spans more than 8% of image width, it is TOO LARGE.

${sizeDesc}

### STONE COLOR FIDELITY:
Study Image 2 carefully. If it contains MULTIPLE colors/tones (e.g. some pieces are orange, some brown, some dark/near-black, some cream), you MUST reproduce that EXACT SAME color variety and distribution. Do NOT simplify or average into one uniform color. Each stone piece should randomly vary across the full color range visible in Image 2.

### COVERAGE:
Apply this stone to ${ctx.apply} 100% coverage on ALL target surfaces including ground floor, top floor, side walls, columns, and every visible wall area — no gaps, no bare patches, no uncovered areas. Every single wall section from bottom to top must be covered.
IGNORE any text, numbers, signs, labels, or markings painted/written on walls — cover them with stone as if they don't exist. Only preserve: ${ctx.preserve}. Keep the same camera angle.

### QUALITY:
- Replicate EXACT stone texture and surface quality from Image 2. Do NOT invent a different stone.
- UNIFORMITY: IDENTICAL stone pattern on ALL target surfaces — corners, edges, columns included.
- Real installed cladding with 3D depth and natural shadows — NOT flat like wallpaper.
- ${groutInstruction}
- Photorealistic result.${userNote ? `\n\n### USER INSTRUCTION:\nThe user added this note: "${userNote}". Follow this instruction as much as possible while keeping the other rules.` : ''}`
}

// Category-based scale instructions — adapted per surface type for correct size references
function getCategoryScale(categorySlug: string, surfaceContext: string): string {
  const cat = categorySlug || 'nature'

  // Exterior (facade) — use windows, doors, bricks, floor height as size references
  if (surfaceContext === 'facade') {
    const scales: Record<string, string> = {
      nature: `Irregular polygon-shaped flat stone pieces, each roughly 15-30cm wide. Use ANY visible objects for scale: each stone is roughly 1/5 to 1/8 the width of a window; a standard brick is ~6×22cm so each stone is about 2-3 bricks wide; a floor height (~3m) should have at least 15-20 stones vertically. Between two side-by-side windows there should be at least 4-6 stones horizontally. If you can count fewer than 30 stones on a wall section between windows, the stones are TOO BIG.`,
      mix: `A combination of thin horizontal cut strips (2-3cm height, 20-40cm width) alternating with medium irregular natural pieces (10-15cm). Between two windows there should be at least 8-12 stone rows vertically. Each thin strip is about the height of a standard brick or smaller.`,
      crazy: `Random mosaic of many SMALL rounded/irregular stone pieces, mixed sizes from 5cm to 15cm. Very dense pattern. Between two windows there should be at least 40-60 individual stone pieces. Each piece is smaller than a fist.`,
      line: `THIN uniform horizontal stone strips, each approximately 2-3cm height and 30-60cm width. Between two stacked windows there should be at least 30-40 horizontal strips. Each strip is thinner than a standard brick. Modern minimalist linear pattern — NOT irregular polygon stones.`,
    }
    return scales[cat] || scales.nature
  }

  // Interior / fireplace / bathroom / floor — use ALL visible real-world objects as size reference
  // Gemini will pick whichever references are visible: doors, bricks, outlets, tiles, furniture, etc.
  const interiorScales: Record<string, string> = {
    nature: `Irregular polygon-shaped flat stone pieces, each roughly 15-25cm wide. Use ANY visible objects for scale: a standard door height (2m) should have at least 12-15 stones vertically; a standard brick is ~6×22cm so each stone is about 2-3 bricks wide; an electrical outlet cover is ~10cm so each stone is about 1-2 outlet covers wide; a light switch is ~7cm; a door handle is ~12cm from the door edge. A fireplace opening height (~60cm) should contain at least 4-5 stones vertically. Do NOT make boulder-sized stones. The stones must be SMALL relative to the wall.`,
    mix: `A combination of thin horizontal cut strips (2-3cm height, 20-40cm width) alternating with medium irregular natural pieces (10-15cm). A door height (2m) should have at least 15-20 stone rows. Each thin strip is about the height of a standard brick (6cm) or smaller. Use visible objects (doors, bricks, outlets, furniture) to calibrate size.`,
    crazy: `Random mosaic of many SMALL rounded/irregular stone pieces, mixed sizes from 5cm to 15cm. Very dense pattern. A 1m×1m wall section should contain at least 30-50 individual stone pieces. Each piece is smaller than a fist. Use visible objects (doors, bricks, outlets, tiles) to calibrate.`,
    line: `THIN uniform horizontal stone strips, each approximately 2-3cm height and 30-60cm width. A door height (2m) should have at least 40-50 horizontal strips. Each strip is thinner than a standard brick. Modern minimalist linear pattern — NOT irregular polygon stones.`,
  }
  return interiorScales[cat] || interiorScales.nature
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
  userNote?: string,
  retryCount = 0,
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

  // Get category-specific size description adapted to surface type
  const sizeDesc = getCategoryScale(categorySlug, surfaceContext)

  // Determine image numbering based on whether pattern image is included
  const hasPattern = patternBase64 && patternMimeType
  const patternImageNum = hasPattern ? 3 : null
  const maskImageNum = maskBase64 ? (hasPattern ? 4 : 3) : null

  // Build prompt using unified builder — scale + color fidelity are prioritized at the top
  const prompt = buildGeminiPrompt(
    surfaceContext,
    sizeDesc,
    groutInstruction,
    !!hasPattern,
    patternImageNum,
    !!maskBase64,
    maskImageNum,
    userNote,
  )

  // Model fallback chain — try each model in order, skip to next on 503/failure
  // Use highest-availability model to avoid 503s and stay within Vercel 60s timeout
  // gemini-2.5-flash-image: 500 RPM / 2K RPD — most reliable
  // Fallback: gemini-3-pro-image-preview if flash fails (best quality but only 20 RPM)
  const MODELS = [
    'gemini-2.5-flash-image',
    'gemini-3-pro-image-preview',
  ]

  console.log('[Gemini] Surface context:', surfaceContext, hasPattern ? '(with pattern)' : '', maskBase64 ? '(brush)' : '(full)')

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

  const requestBody = JSON.stringify({
    contents: [{ parts: imageParts }],
    generationConfig: {
      responseModalities: ['IMAGE'],
    },
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
        // Try next model
        continue
      }

      const result = await res.json()
      console.log(`[Gemini] ${model} responded in ${elapsed}s`)

      // Find image in response parts
      const resParts = result.candidates?.[0]?.content?.parts || []
      for (const part of resParts) {
        if (part.inlineData?.mimeType?.startsWith('image/')) {
          const mimeType = part.inlineData.mimeType as string
          console.log(`[Gemini] ${model} — image found (${mimeType})`)
          return `data:${mimeType};base64,${part.inlineData.data}`
        }
      }

      // Check for safety block
      const finishReason = result.candidates?.[0]?.finishReason
      if (finishReason && finishReason !== 'STOP') {
        console.error(`[Gemini] ${model} finish reason:`, finishReason)
      }

      const textParts = resParts.filter((p: Record<string, unknown>) => p.text).map((p: Record<string, unknown>) => p.text)
      if (textParts.length) {
        console.log(`[Gemini] ${model} text:`, (textParts.join(' ') as string).substring(0, 200))
      }

      console.error(`[Gemini] ${model} — no image in response, trying next model...`)
    } catch (err) {
      const elapsed = Math.round((Date.now() - startTime) / 1000)
      console.error(`[Gemini] ${model} exception after ${elapsed}s:`, err)
      // Try next model
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
      categoryImageUrl,
      stoneImageUrl,
      locale,
      applyMode = 'brush' as ApplyMode,
      surfaceContext = 'facade' as SurfaceContext,
      groutStyle = 'grouted',
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

    // Rate limiting
    const ip = getClientIp(req)
    const rateLimitResponse = await checkRateLimit(ip, locale)
    if (rateLimitResponse) return rateLimitResponse

    let outputUrl: string | null = null

    if (applyMode === 'full') {
      // ═══════════════════════════════════════════════════════
      // FULL MODE: Gemini only (model fallback chain)
      // ═══════════════════════════════════════════════════════
      console.log('[Simulation] FULL mode — Gemini')

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
        undefined, undefined, // no mask in full mode
        userNote,
      )

      if (geminiResult) {
        // Upload Gemini result (base64) to Supabase Storage
        console.log('[Simulation] Uploading Gemini result to storage...')
        try {
          outputUrl = await uploadToStorage(geminiResult, 'result')
          console.log('[Simulation] Gemini result saved:', outputUrl?.substring(0, 80))
        } catch (err) {
          console.error('[Simulation] Failed to upload Gemini result:', err)
          // Upload failed but we have the data URL
        }
      }
    } else {
      // ═══════════════════════════════════════════════════════
      // BRUSH MODE: Gemini only
      // ═══════════════════════════════════════════════════════
      console.log('[Simulation] BRUSH mode — Gemini')

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

      // 4. Try Gemini first (building + stone + optional pattern + mask + userNote)
      if (userNote) {
        console.log('[Simulation] User note for brush mode:', userNote)
      }
      const geminiResult = await generateWithGemini(
        building.base64, building.mimeType,
        stone.base64, stone.mimeType,
        surfaceContext,
        groutStyle,
        categorySlug || 'nature',
        pattern?.base64, pattern?.mimeType,
        maskData.base64, maskData.mimeType,
        userNote,
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
