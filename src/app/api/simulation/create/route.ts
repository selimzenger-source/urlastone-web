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
  hasReference: boolean,
  referenceImageNum: number | null,
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
    const refInstruction = hasReference
      ? ` Image ${referenceImageNum} shows a REAL COMPLETED PROJECT with stone veneer at CORRECT SCALE — match this stone-to-building size ratio.`
      : ''

    return `Image 1 is a photo of ${ctx.scene}. Image 2 is a close-up stone texture sample — copy ONLY color, texture, surface from it. IGNORE Image 2's apparent stone size (it's zoomed in).${refInstruction}${patternRef} Image ${maskImageNum} is a black/white mask — WHITE = apply stone.

### STONE VENEER SCALE (MOST IMPORTANT):
Apply thin split-face STONE VENEER CLADDING — NOT large boulders.
Each stone piece ≈ 1/20th of floor height, 1/8th of window width. At least 20 pieces per floor vertically. If any stone looks larger than a human fist relative to the building, it is TOO LARGE.
${sizeDesc}
${hasPattern ? `Follow the arrangement pattern shown in Image ${patternImageNum}.` : ''}

### STONE COLOR: Reproduce ALL color tones from Image 2 (if it has orange, brown, dark — use that same variety). Do NOT average into one color.

### RULES:
- Replicate EXACT stone texture from Image 2. Do NOT invent a different stone.
- UNIFORMITY: Same veneer pattern everywhere — narrow columns included.
- Apply ONLY to white mask areas. Black = untouched. Do NOT change the building structure.
- IGNORE wall text/numbers — cover with stone.
- Real stone veneer with 3D depth and mortar shadows — NOT flat wallpaper.
- ${groutInstruction}
- Photorealistic.${userNote ? `\n\n### USER INSTRUCTION:\nThe user added this note: "${userNote}". Follow this instruction as much as possible while keeping the other rules.` : ''}`
  }

  // Full mode
  const patternRef = hasPattern
    ? `\n\nImage 3 is a diagram showing the stone laying PATTERN — follow it for stone arrangement.`
    : ''

  const refInstruction = hasReference
    ? ` Image ${referenceImageNum} is a REAL COMPLETED PROJECT photo showing this stone veneer already installed on a building at the CORRECT SCALE. Match this exact stone-to-building size ratio in your output.`
    : ''

  return `Image 1 is a photo of ${ctx.scene}. Image 2 is a close-up stone texture sample — copy ONLY the color, texture, and surface finish from it. Image 2 is heavily zoomed in so COMPLETELY IGNORE the apparent size of stones in it.${refInstruction}${patternRef}

### STONE VENEER SCALE (MOST IMPORTANT — read FIRST):
Apply thin split-face STONE VENEER CLADDING — NOT large boulders or rock formations.
Think of this as fine architectural stone veneer, like small mosaic tiles on a kitchen backsplash but in irregular natural stone shapes.

PROPORTION RULES (use these instead of centimeters):
- Each stone piece should be approximately 1/20th the height of one floor
- Each stone piece should be approximately 1/8th the width of a window
- One floor height must contain at least 20 stone pieces vertically
- The width between two windows must contain at least 6 stone pieces horizontally
- The ENTIRE visible facade must contain AT LEAST 500 individual stone pieces total
- If any single stone piece appears larger than a human fist relative to the building, it is TOO LARGE

${sizeDesc}

### STONE COLOR FIDELITY:
Study Image 2 carefully. If it contains MULTIPLE colors/tones (e.g. some pieces are orange, some brown, some dark/near-black, some cream), reproduce that EXACT SAME color variety. Do NOT simplify or average into one uniform color.

### COVERAGE:
Apply this stone veneer to ${ctx.apply}. 100% coverage on ALL target surfaces — walls, columns, corners, every visible wall area. Cover wall text/numbers with stone. Preserve: ${ctx.preserve}. Same camera angle.

### QUALITY:
- Replicate EXACT stone texture from Image 2. Do NOT invent a different stone.
- UNIFORMITY: Identical veneer pattern on ALL surfaces — narrow columns included.
- Real installed stone veneer cladding with 3D depth, mortar shadows, surface relief — NOT flat wallpaper.
- ${groutInstruction}
- Professional architectural photography, photorealistic.${userNote ? `\n\n### USER INSTRUCTION:\nThe user added this note: "${userNote}". Follow this instruction as much as possible while keeping the other rules.` : ''}`
}

// Category-based scale instructions — adapted per surface type for correct size references
function getCategoryScale(categorySlug: string, surfaceContext: string): string {
  const cat = categorySlug || 'nature'

  // Exterior (facade) — use windows, doors, bricks, floor height as size references
  if (surfaceContext === 'facade') {
    const scales: Record<string, string> = {
      nature: `SMALL thin flat stone veneer pieces in irregular shapes — like broken ceramic tiles or flagstone pavers, NOT boulders or large rocks. Each piece is the size of a smartphone or smaller. A window is at least 8 pieces wide. One floor is at least 20 pieces tall. Think: mosaic of SMALL flat pieces glued to the wall — like a jigsaw puzzle of many tiny pieces.`,
      mix: `A mix of thin horizontal cut strips and small irregular flat pieces. The strips are like thin bricks (2-3cm tall). Between two windows there should be at least 8-12 rows. Each piece is small — smartphone-sized or smaller.`,
      crazy: `Dense mosaic of MANY TINY rounded/irregular pieces — like a cobblestone path scaled to a wall. Each piece is the size of a coin to a fist. Between two windows there should be at least 40-60 pieces. Very dense, very small.`,
      line: `THIN uniform horizontal stone strips, each approximately 2-3cm height and 30-60cm width. Between two stacked windows there should be at least 30-40 horizontal strips. Each strip is thinner than a standard brick. Modern minimalist linear pattern — NOT irregular polygon stones.`,
    }
    return scales[cat] || scales.nature
  }

  // Interior / fireplace / bathroom / floor — use ALL visible real-world objects as size reference
  // Gemini will pick whichever references are visible: doors, bricks, outlets, tiles, furniture, etc.
  const interiorScales: Record<string, string> = {
    nature: `SMALL thin flat stone veneer pieces in irregular shapes — like broken ceramic tiles or flagstone pavers, NOT boulders. Each piece is smartphone-sized or smaller. A door height (2m) should have at least 15 pieces vertically. An outlet cover (~10cm) is about the same size as one stone piece. Think: mosaic of SMALL flat pieces glued to the wall.`,
    mix: `A mix of thin horizontal strips and small irregular flat pieces. Strips are thin like bricks (2-3cm tall). A door height (2m) = at least 15-20 rows. Each piece is small — smartphone-sized or smaller.`,
    crazy: `Dense mosaic of MANY TINY rounded/irregular pieces — like cobblestones. Each piece is coin-to-fist sized. A 1m×1m section should have at least 30-50 pieces. Very dense, very small.`,
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
  preferredModel?: string,
  referenceBase64?: string | null,
  referenceMimeType?: string | null,
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

  // Determine image numbering: building=1, stone=2, then reference?, pattern?, mask?
  const hasReference = referenceBase64 && referenceMimeType
  const hasPattern = patternBase64 && patternMimeType
  let nextImgNum = 3
  const referenceImageNum = hasReference ? nextImgNum++ : null
  const patternImageNum = hasPattern ? nextImgNum++ : null
  const maskImageNum = maskBase64 ? nextImgNum++ : null

  // Build prompt using unified builder
  const prompt = buildGeminiPrompt(
    surfaceContext,
    sizeDesc,
    groutInstruction,
    !!hasReference,
    referenceImageNum,
    !!hasPattern,
    patternImageNum,
    !!maskBase64,
    maskImageNum,
    userNote,
  )

  // Model fallback chain — try each model in order, skip to next on 503/failure
  // If a preferred model is specified, try it first then fallback to others
  const ALL_MODELS = [
    'gemini-2.5-flash-image',           // 500 RPM / 2K RPD
    'gemini-3-pro-image-preview',       // 20 RPM / 250 RPD
    'gemini-3.1-flash-image-preview',   // 100 RPM / 1K RPD
  ]
  const MODELS = preferredModel
    ? [preferredModel, ...ALL_MODELS.filter(m => m !== preferredModel)]
    : ALL_MODELS

  console.log('[Gemini] Surface context:', surfaceContext, hasPattern ? '(with pattern)' : '', maskBase64 ? '(brush)' : '(full)')

  // Build parts array: building + stone + optional reference + optional pattern + optional mask
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imageParts: any[] = [
    { inlineData: { mimeType: buildingMimeType, data: buildingBase64 } },
    { inlineData: { mimeType: stoneMimeType, data: stoneBase64 } },
  ]
  if (hasReference) {
    imageParts.push({ inlineData: { mimeType: referenceMimeType, data: referenceBase64 } })
  }
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
      // Higher output resolution = more pixels for fine stone detail
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
    console.log(`[Simulation] Stone: code=${stoneCode}, category=${categorySlug}, imageUrl=${stoneImageUrl.substring(0, 100)}`)

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

      // 3. Pattern image disabled — sending only 2 images (building + stone) like AI Studio
      const pattern: { base64: string; mimeType: string } | null = null

      // 4. Try Gemini (sends building + stone)
      const geminiResult = await generateWithGemini(
        building.base64, building.mimeType,
        stone.base64, stone.mimeType,
        surfaceContext,
        groutStyle,
        categorySlug || 'nature',
        null, null, // pattern disabled
        undefined, undefined, // no mask in full mode
        userNote,
        geminiModel,
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

      // 3. Pattern image disabled for brush mode too
      const pattern: { base64: string; mimeType: string } | null = null

      // 4. Try Gemini (building + stone + mask)
      if (userNote) {
        console.log('[Simulation] User note for brush mode:', userNote)
      }
      const geminiResult = await generateWithGemini(
        building.base64, building.mimeType,
        stone.base64, stone.mimeType,
        surfaceContext,
        groutStyle,
        categorySlug || 'nature',
        null, null, // pattern disabled
        maskData.base64, maskData.mimeType,
        userNote,
        geminiModel,
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
