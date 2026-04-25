import { NextRequest, NextResponse } from 'next/server'
import type { ApplyMode, SurfaceContext } from '@/lib/simulation'
import { supabaseAdmin } from '@/lib/supabase'
import { sendTelegramMediaGroup, toLowResUrl } from '@/lib/telegram'
import { waitUntil } from '@vercel/functions'

// ═══════════════════════════════════════════════════════════════
// PARALEL TEST ROUTE: Replicate (google/nano-banana-pro)
// ═══════════════════════════════════════════════════════════════
// Bu route mevcut /api/simulation/create (Gemini) route'una
// DOKUNMADAN paralel çalışır. Frontend'de ?test=1 query param
// ile aktive edilir. Eski sistemi geri istersen sadece bu
// dosyayı sil — hiçbir şey etkilenmez.
// ═══════════════════════════════════════════════════════════════

export const maxDuration = 300

const DAILY_LIMIT_PER_IP = 10
const DAILY_LIMIT_GLOBAL = 50

const LIMIT_MSGS: Record<string, { ip: string; global: string }> = {
  tr: {
    ip: 'Günlük simülasyon hakkınız doldu. Yarın tekrar deneyin',
    global: 'Bugünkü simülasyon kapasitesi doldu. Yarın tekrar deneyin',
  },
  en: {
    ip: 'Your daily simulation limit reached. Please try again tomorrow',
    global: "Today's simulation capacity is full. Please try again tomorrow",
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

// ─── Sonnet Image Analysis (aynı Gemini'daki gibi) ─────────────

interface SonnetAnalysis {
  type: 'exterior' | 'interior'
  floors: number
  estimated_wall_height_m: number
  scale_instruction: string
}

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
  if (!apiKey) return defaultResult

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
  "estimated_wall_height_m": estimated total wall height in meters (2.5 for room, 6 for 2-story, 21 for 7-story),
  "scale_instruction": "Specific scale instruction using visible elements like windows, doors, outlets."
}`,
            },
          ],
        }],
      }),
    })

    if (!response.ok) return defaultResult

    const result = await response.json()
    const text = result.content?.[0]?.text || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0])
      return {
        type: analysis.type || 'exterior',
        floors: analysis.floors || 2,
        estimated_wall_height_m: analysis.estimated_wall_height_m || 6,
        scale_instruction: analysis.scale_instruction || '',
      }
    }
    return defaultResult
  } catch {
    return defaultResult
  }
}

// ─── Prompt Builders ──────────────────────────────────────

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
    case 'nature': return 'SMALL irregular flat polygonal stone pieces — like broken ceramic tiles. Each piece max 20cm. NOT boulders, NOT large rocks. Dozens of pieces visible per square meter.'
    case 'mix': return 'MIX pattern: alternates thin HORIZONTAL stone strips (2-3cm tall, 20-40cm wide) with SMALL irregular rounded pieces. Must include visible horizontal strip rows. Strips are thin, not blocks.'
    case 'crazy': return 'Dense mosaic of MANY TINY rounded cobblestone pieces — each piece 10-15cm max. CRITICAL: 30+ stones visible per square meter. NOT large rocks, NOT boulders. Think small river pebbles packed tight. Hundreds of small pieces on a full wall.'
    case 'line': return 'THIN uniform horizontal strips (2-3cm tall, 30-60cm wide) — minimalist linear pattern. Strips are razor thin, not blocks.'
    default: return 'SMALL irregular flat stone pieces, NOT boulders, NOT large rocks. Dozens visible per square meter.'
  }
}

function getCoverageInstructions(surfaceContext: string) {
  switch (surfaceContext) {
    case 'facade': return {
      apply: 'ALL exterior wall surfaces',
      full: 'Front, sides, columns, foundation wall, beams — EVERY surface. Zero bare concrete or plaster. Cover ALL concrete beams and columns with stone too.',
      preserve: 'PRESERVE: Windows, roof, sky, ground, stairs, vegetation.',
    }
    case 'fireplace': return {
      apply: 'the fireplace surround and chimney wall',
      full: 'Cover the fireplace wall area completely.',
      preserve: 'DO NOT TOUCH: Fireplace body, mantle, floor, ceiling, furniture, fixtures.',
    }
    case 'interior': return {
      apply: 'all bare wall surfaces',
      full: 'Cover all painted/bare walls.',
      preserve: 'DO NOT TOUCH: Fireplace, countertops, floor, ceiling, furniture, doors, windows.',
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

function buildFullPrompt(
  surfaceContext: string,
  groutInstruction: string,
  categorySlug: string,
  analysis: SonnetAnalysis,
  userNote?: string,
): string {
  const stoneSize = surfaceContext === 'facade'
    ? (categorySlug === 'crazy' ? 0.12 : categorySlug === 'line' ? 0.05 : 0.15)
    : (categorySlug === 'crazy' ? 0.10 : 0.12)
  const wallHeight = analysis.estimated_wall_height_m || 6
  const stonesVertical = Math.round(wallHeight / stoneSize)
  const categoryDesc = getCategoryDesc(categorySlug)
  const coverage = getCoverageInstructions(surfaceContext)

  return `Image 1: ${getSurfaceDescription(surfaceContext, analysis)}. Image 2: stone texture reference — copy the EXACT COLOR, TEXTURE and SURFACE. Size in Image 2 is misleading (close-up) — real size is ~${Math.round(stoneSize * 100)}cm per piece.

EDIT Image 1: Apply Image 2's stone to ${coverage.apply}.

⚠️ STONE COLOR & TEXTURE (HIGHEST PRIORITY):
Study Image 2 carefully. Copy its EXACT colors — reproduce ALL tones (brown, cream, dark patches, red-brown). Do NOT simplify to uniform beige.

STONE SIZE (CRITICAL — DO NOT MAKE STONES LARGE):
Each stone piece is ~${Math.round(stoneSize * 100)}cm in real life — TINY compared to the building.
- Wall height ~${wallHeight}m ÷ ${stoneSize}m = ${stonesVertical} stones from bottom to top — that many rows MUST be visible
- ${categoryDesc}
${analysis.scale_instruction ? `- SCALE REFERENCE: ${analysis.scale_instruction}` : ''}
⚠️ If a window is ~1m wide, it should span ~${Math.round(1 / stoneSize)} stones horizontally.
⚠️ WRONG: 5-10 huge boulders on a wall. CORRECT: ${stonesVertical * 3}+ small pieces visible.

⚠️ UNIFORMITY: Same stone size on ALL walls. Zero size variation.

COVERAGE: ${coverage.full}

${coverage.preserve}

${surfaceContext === 'facade' ? 'WINDOWS: Install glass with dark aluminum frames in ALL openings.\n' : ''}QUALITY: ${groutInstruction} 3D surface depth with natural shadows — NOT flat wallpaper. Photorealistic${surfaceContext === 'facade' ? ' architectural photograph' : ''}.${userNote ? `\n\nUSER NOTE: "${userNote}"` : ''}`
}

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
  const totalEstimate = stonesVertical * 15
  const categoryDesc = getCategoryDesc(categorySlug)

  return `Image 1: ${getSurfaceDescription(surfaceContext, analysis)}. Image 2: stone texture CLOSE-UP (real size: ${Math.round(stoneSize * 100)}cm per piece — IGNORE apparent stone size in photo). Image ${maskImageNum}: black/white MASK — apply stone ONLY to WHITE areas, leave BLACK areas completely untouched.

⚠️ STONE SIZE — #1 PRIORITY:
Each stone piece is only ${Math.round(stoneSize * 100)}cm.
${analysis.scale_instruction ? `SCALE REFERENCE: ${analysis.scale_instruction}` : ''}
- Wall height ~${wallHeight}m ÷ ${stoneSize}m = ${stonesVertical} stone pieces bottom to top
- The masked area must show ${totalEstimate}+ individual stone pieces
- ${categoryDesc}

⚠️ THE MOST COMMON MISTAKE: Making stones TOO LARGE like boulders.
✅ CORRECT: Many small pieces (${Math.round(stoneSize * 100)}cm each), dense mosaic
❌ WRONG: Large rocks or boulders

⚠️ UNIFORMITY: Every part of masked area has IDENTICAL stone size.

COLOR: Copy EXACT tones from Image 2 with natural color variety.

RULES:
- Apply stone ONLY to white mask areas. Black areas = completely untouched
- ${groutInstruction}
- 3D depth and mortar shadows — NOT flat wallpaper
- Do NOT change building structure, windows, roof, sky
- Photorealistic.${userNote ? `\n\nUSER NOTE: "${userNote}"` : ''}`
}

// ─── Helpers ──────────────────────────────────────

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

function extractBase64(dataUrl: string): { base64: string; mimeType: string } {
  const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/)
  if (!match) throw new Error('Invalid data URL')
  return { base64: match[2], mimeType: match[1] }
}

/** Upload base64 data URL to Supabase and return public URL */
async function uploadBase64ToStorage(dataUrl: string, prefix: string): Promise<string> {
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

  if (error) throw new Error('Failed to upload: ' + error.message)

  const { data: urlData } = supabaseAdmin.storage
    .from('uploads')
    .getPublicUrl(filePath)

  return urlData.publicUrl
}

/** Download image URL and upload to Supabase — used for Replicate result */
async function mirrorUrlToStorage(remoteUrl: string, prefix: string): Promise<string> {
  const res = await fetch(remoteUrl)
  if (!res.ok) throw new Error(`Failed to download result: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const contentType = res.headers.get('content-type') || 'image/jpeg'
  const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'
  const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
  const filePath = `simulation/${fileName}`

  const { error } = await supabaseAdmin.storage
    .from('uploads')
    .upload(filePath, buffer, { contentType, upsert: false })

  if (error) throw new Error('Failed to store result: ' + error.message)

  const { data: urlData } = supabaseAdmin.storage
    .from('uploads')
    .getPublicUrl(filePath)

  return urlData.publicUrl
}

// ─── Replicate Provider (nano-banana-pro) ──────────────────────

/** Call google/nano-banana-pro on Replicate with multi-image input */
async function generateWithReplicate(
  prompt: string,
  imageUrls: string[],
): Promise<string | null> {
  const apiKey = process.env.REPLICATE_API_TOKEN
  if (!apiKey) {
    console.error('[Replicate] No API token configured')
    return null
  }

  const startTime = Date.now()
  console.log(`[Replicate] Calling google/nano-banana-pro with ${imageUrls.length} images...`)

  try {
    // Synchronous mode — wait up to 60s for result
    const res = await fetch('https://api.replicate.com/v1/models/google/nano-banana-pro/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait=60',
      },
      body: JSON.stringify({
        input: {
          prompt,
          image_input: imageUrls,
          output_format: 'jpg',
          aspect_ratio: 'match_input_image',
        },
      }),
    })

    const elapsed = Math.round((Date.now() - startTime) / 1000)

    if (!res.ok) {
      const err = await res.text()
      console.error(`[Replicate] HTTP ${res.status} (${elapsed}s):`, err.substring(0, 500))
      return null
    }

    const result = await res.json()
    console.log(`[Replicate] Status: ${result.status} (${elapsed}s)`)

    // If still processing, poll for result
    if (result.status === 'starting' || result.status === 'processing') {
      const pollUrl = result.urls?.get
      if (!pollUrl) return null

      for (let i = 0; i < 30; i++) { // max 30 polls (~60s)
        await new Promise(r => setTimeout(r, 2000))
        const pollRes = await fetch(pollUrl, {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        })
        if (!pollRes.ok) continue
        const pollData = await pollRes.json()
        if (pollData.status === 'succeeded') {
          const output = pollData.output
          return Array.isArray(output) ? output[0] : output
        }
        if (pollData.status === 'failed' || pollData.status === 'canceled') {
          console.error('[Replicate] Prediction failed:', pollData.error)
          return null
        }
      }
      console.error('[Replicate] Polling timeout')
      return null
    }

    if (result.status === 'succeeded') {
      const output = result.output
      return Array.isArray(output) ? output[0] : output
    }

    if (result.status === 'failed') {
      console.error('[Replicate] Failed:', result.error)
      return null
    }

    console.error('[Replicate] Unexpected status:', result.status)
    return null
  } catch (err) {
    const elapsed = Math.round((Date.now() - startTime) / 1000)
    console.error(`[Replicate] Exception after ${elapsed}s:`, err)
    return null
  }
}

// ─── Rate Limiting (Gemini route ile aynı tablo) ───────────

async function checkRateLimit(ip: string, locale: string): Promise<NextResponse | null> {
  const msgs = LIMIT_MSGS[locale || 'tr'] || LIMIT_MSGS.tr

  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayISO = todayStart.toISOString()

    const { count: globalCount } = await supabaseAdmin
      .from('simulation_requests')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayISO)

    if (globalCount !== null && globalCount >= DAILY_LIMIT_GLOBAL) {
      return NextResponse.json(
        { error: msgs.global, rateLimited: true, limitType: 'global', remaining: 0 },
        { status: 429 }
      )
    }

    const { count: ipCount } = await supabaseAdmin
      .from('simulation_requests')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('created_at', todayISO)

    if (ipCount !== null && ipCount >= DAILY_LIMIT_PER_IP) {
      return NextResponse.json(
        { error: msgs.ip, rateLimited: true, limitType: 'ip', remaining: 0 },
        { status: 429 }
      )
    }

    await supabaseAdmin.from('simulation_requests').insert({ ip_address: ip })
  } catch {
    console.warn('Rate limit check failed')
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

// ─── Main Handler ──────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const {
      image,
      mask,
      stoneCode,
      stoneName,
      categorySlug,
      stoneImageUrl,
      locale,
      applyMode = 'brush' as ApplyMode,
      surfaceContext = 'facade' as SurfaceContext,
      groutStyle = 'grouted',
      userNote,
    } = await req.json()

    // Validate
    if (!image || !stoneCode) {
      return NextResponse.json({ error: 'image and stoneCode are required' }, { status: 400 })
    }
    if (applyMode === 'brush' && !mask) {
      return NextResponse.json({ error: 'mask is required for brush mode' }, { status: 400 })
    }
    if (!stoneImageUrl) {
      return NextResponse.json({ error: 'stoneImageUrl is required' }, { status: 400 })
    }

    console.log(`[Replicate-Sim] Stone: ${stoneCode}, cat: ${categorySlug}, mode: ${applyMode}`)

    // Rate limit (aynı tabloyu paylaşıyor)
    const ip = getClientIp(req)
    const rateLimitResponse = await checkRateLimit(ip, locale)
    if (rateLimitResponse) return rateLimitResponse

    // 1. Extract building image for Sonnet
    const building = extractBase64(image)

    // 2. Sonnet analysis for prompt scale math
    const analysis = await analyzeImageWithSonnet(building.base64, building.mimeType)
    console.log(`[Replicate-Sim] Sonnet: floors=${analysis.floors}, height=${analysis.estimated_wall_height_m}m`)

    // 3. Upload building to Supabase so Replicate can fetch it
    let buildingUrl: string
    try {
      buildingUrl = await uploadBase64ToStorage(image, 'input-building')
    } catch (err) {
      console.error('[Replicate-Sim] Building upload failed:', err)
      return NextResponse.json({ error: 'Failed to prepare building image' }, { status: 500 })
    }

    // 4. Resolve stone image URL (absolute)
    let resolvedStoneUrl = stoneImageUrl
    if (stoneImageUrl.startsWith('/')) {
      const origin = req.headers.get('origin') || req.headers.get('x-forwarded-host') || 'www.urlastone.com'
      const protocol = origin.startsWith('http') ? '' : 'https://'
      resolvedStoneUrl = `${protocol}${origin}${stoneImageUrl}`
    }

    // 5. Build image URL array + prompt
    const groutInstruction = groutStyle === 'groutless'
      ? 'Stones tightly fitted with NO visible grout or gaps.'
      : 'Visible mortar/grout lines between each stone piece.'

    const imageUrls: string[] = [buildingUrl, resolvedStoneUrl]
    let prompt: string

    if (applyMode === 'brush') {
      // Upload mask too
      let maskUrl: string
      try {
        maskUrl = await uploadBase64ToStorage(mask, 'input-mask')
      } catch (err) {
        console.error('[Replicate-Sim] Mask upload failed:', err)
        return NextResponse.json({ error: 'Failed to prepare mask' }, { status: 500 })
      }
      imageUrls.push(maskUrl)
      prompt = buildBrushPrompt(
        surfaceContext, groutInstruction, categorySlug || 'nature',
        analysis, 3, userNote,
      )
    } else {
      prompt = buildFullPrompt(
        surfaceContext, groutInstruction, categorySlug || 'nature',
        analysis, userNote,
      )
    }

    // 6. Call Replicate
    const replicateResultUrl = await generateWithReplicate(prompt, imageUrls)

    if (!replicateResultUrl) {
      return NextResponse.json(
        { error: 'AI görsel üretemedi. Lütfen tekrar deneyin.' },
        { status: 500 }
      )
    }

    // 7. Mirror Replicate result to our Supabase (so download/upscale works)
    let outputUrl: string
    try {
      outputUrl = await mirrorUrlToStorage(replicateResultUrl, 'result-replicate')
      console.log('[Replicate-Sim] Result stored:', outputUrl.substring(0, 80))
    } catch (err) {
      console.error('[Replicate-Sim] Failed to mirror result, returning raw URL:', err)
      outputUrl = replicateResultUrl // fallback to direct Replicate URL
    }

    // 8. Telegram bildirimi — fire-and-forget (response'u beklemez)
    // Fotolari ayri gonderirsek Telegram her birini tam boyda gosterir (media group kucultuyor)
    const displayStoneName = stoneName
      ? `${stoneName}${stoneCode ? ` (${stoneCode})` : ''}`
      : stoneCode || 'bilinmiyor'
    const telegramCaption = `\`${ip}\` IP adresinden 1 kişi AI simülasyonla sonuç üretti\nSeçilen taş: *${displayStoneName}*`

    // Sadece After — kullaniciya yansimasin, waitUntil ile arka planda
    waitUntil(
      sendTelegramMediaGroup([
        { url: toLowResUrl(outputUrl, 1200), caption: `✨ After\n\n${telegramCaption}` },
      ]).catch(err => console.error('[Telegram Simulation Notif] Error:', err))
    )

    // 9. Return
    const remaining = await getRemainingCount(ip)

    return NextResponse.json({
      output: outputUrl,
      status: 'succeeded',
      remaining,
      provider: 'replicate-nano-banana-pro',
    })
  } catch (error) {
    console.error('[Replicate-Sim] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
