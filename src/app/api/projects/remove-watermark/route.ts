import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import sharp from 'sharp'

const REPLICATE_API = 'https://api.replicate.com/v1/predictions'
const LAMA_VERSION = '2b91ca2340801c2a5be745612356fac36a17f698354a07f48a62d564d3b3a7a0'

function validateAdmin(request: NextRequest): boolean {
  const auth = request.headers.get('Authorization')
  const password = (process.env.ADMIN_PASSWORD || '').trim()
  return auth === `Bearer ${password}`
}

/**
 * Claude Haiku ile watermark bölgelerini tespit et
 * Returns: array of {x, y, w, h} normalized (0-1) coordinates
 */
async function detectWatermarkRegions(imageUrl: string): Promise<{ type: 'diagonal_full' | 'local' | 'none'; regions: Array<{ x: number; y: number; w: number; h: number }> }> {
  const anthropic = new Anthropic()

  // Resmi base64 olarak çek
  const imgRes = await fetch(imageUrl)
  const imgBuffer = Buffer.from(await imgRes.arrayBuffer())
  const base64 = imgBuffer.toString('base64')
  const mediaType = (imgRes.headers.get('content-type') || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data: base64 },
        },
        {
          type: 'text',
          text: `Look VERY carefully at this image for watermarks. Types to detect:

1. DIAGONAL TEXT: Semi-transparent repeating diagonal text across image (e.g. "sahibinden.com", "hepsiemlak", "emlakjet"). These are VERY faint.
2. CORNER WATERMARKS: Logos, badges, or text in corners
3. BANNER WATERMARKS: Horizontal strips with text/logos at top or bottom
4. STAMP WATERMARKS: Circular or rectangular stamps overlaid on image

DO NOT detect: building signs, construction banners (physical objects IN the scene), architectural elements.

Return JSON with type and bounding boxes:
{"type": "diagonal_full", "regions": [{"x":0,"y":0,"w":1,"h":1}]}
{"type": "local", "regions": [{"x":0.8,"y":0,"w":0.2,"h":0.1}]}
{"type": "none", "regions": []}

- "diagonal_full" = repeating text covering most of image (needs external tool)
- "local" = specific corner/banner watermarks (can be inpainted)
- "none" = no watermarks found

Return ONLY the JSON object.`,
        },
      ],
    }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  console.log('[WatermarkRemoval] Claude response:', text)

  try {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return { type: 'none' as const, regions: [] }
    const parsed = JSON.parse(match[0])
    const wmType = parsed.type || 'none'
    const regions = Array.isArray(parsed.regions) ? parsed.regions.filter((r: { x: number; y: number; w: number; h: number }) =>
      typeof r.x === 'number' && typeof r.y === 'number' &&
      typeof r.w === 'number' && typeof r.h === 'number' &&
      r.w > 0 && r.h > 0
    ) : []
    return { type: wmType as 'diagonal_full' | 'local' | 'none', regions }
  } catch {
    return { type: 'none' as const, regions: [] }
  }
}

/**
 * Sharp ile mask oluştur — watermark bölgeleri beyaz, geri kalan siyah
 * Full-image watermark (diagonal text) için diagonal stripe pattern mask oluşturur
 */
async function createMask(
  width: number,
  height: number,
  regions: Array<{ x: number; y: number; w: number; h: number }>
): Promise<Buffer> {
  // Spesifik bölgeler için dikdörtgen mask
  const overlays = regions.map((r) => {
    const rx = Math.max(0, Math.floor(r.x * width))
    const ry = Math.max(0, Math.floor(r.y * height))
    const rw = Math.min(width - rx, Math.ceil(r.w * width))
    const rh = Math.min(height - ry, Math.ceil(r.h * height))

    return {
      input: Buffer.from(
        `<svg width="${rw}" height="${rh}"><rect x="0" y="0" width="${rw}" height="${rh}" fill="white"/></svg>`
      ),
      top: ry,
      left: rx,
    }
  })

  const maskBuffer = await sharp({
    create: { width, height, channels: 3, background: { r: 0, g: 0, b: 0 } },
  }).png().composite(overlays).toBuffer()

  return maskBuffer
}

/**
 * Replicate LaMa ile inpainting
 */
async function inpaintWithLama(imageUrl: string, maskDataUrl: string): Promise<string | null> {
  const token = process.env.REPLICATE_API_TOKEN
  if (!token) return null

  const response = await fetch(REPLICATE_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'wait',
    },
    body: JSON.stringify({
      version: LAMA_VERSION,
      input: {
        image: imageUrl,
        mask: maskDataUrl,
      },
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    console.error('[WatermarkRemoval] LaMa error:', err)
    return null
  }

  const prediction = await response.json()
  return typeof prediction.output === 'string'
    ? prediction.output
    : Array.isArray(prediction.output)
      ? prediction.output[0]
      : null
}

// POST /api/projects/remove-watermark
export async function POST(request: NextRequest) {
  if (!validateAdmin(request)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  try {
    const { imageUrl } = await request.json()
    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl gerekli' }, { status: 400 })
    }

    console.log('[WatermarkRemoval] Starting for:', imageUrl.substring(0, 80))

    // 1. Claude Sonnet ile watermark tespiti
    console.log('[WatermarkRemoval] Step 1: Detecting watermarks with Claude Sonnet...')
    const detection = await detectWatermarkRegions(imageUrl)

    if (detection.type === 'none' || detection.regions.length === 0) {
      console.log('[WatermarkRemoval] No watermarks detected')
      return NextResponse.json({ url: imageUrl, watermarkFound: false })
    }

    // Diagonal full-image watermark — LaMa ile silinemez, kullanıcıya bildir
    if (detection.type === 'diagonal_full') {
      console.log('[WatermarkRemoval] Diagonal full-image watermark detected — needs external tool')
      return NextResponse.json({
        url: imageUrl,
        watermarkFound: true,
        watermarkType: 'diagonal_full',
        message: 'Resimde tüm yüzeyi kaplayan diagonal watermark tespit edildi. Bu tip watermark için watermarkremover.io kullanın.',
      })
    }

    const regions = detection.regions
    console.log('[WatermarkRemoval] Found', regions.length, 'local watermark regions:', regions)

    // 2. Resim boyutlarını al
    const imgRes = await fetch(imageUrl)
    const imgBuffer = Buffer.from(await imgRes.arrayBuffer())
    const metadata = await sharp(imgBuffer).metadata()
    const width = metadata.width || 1600
    const height = metadata.height || 1200

    // 3. Mask oluştur
    console.log('[WatermarkRemoval] Step 2: Creating mask...')
    const maskBuffer = await createMask(width, height, regions)
    const maskBase64 = maskBuffer.toString('base64')
    const maskDataUrl = `data:image/png;base64,${maskBase64}`

    // 4. LaMa ile inpainting
    console.log('[WatermarkRemoval] Step 3: Inpainting with LaMa...')
    const cleanedUrl = await inpaintWithLama(imageUrl, maskDataUrl)

    if (!cleanedUrl) {
      return NextResponse.json({ error: 'İnpainting başarısız' }, { status: 500 })
    }

    console.log('[WatermarkRemoval] Done! Clean URL:', cleanedUrl.substring(0, 80))
    return NextResponse.json({ url: cleanedUrl, watermarkFound: true, regionsRemoved: regions.length })

  } catch (error) {
    console.error('[WatermarkRemoval] Error:', error)
    return NextResponse.json({ error: 'Watermark silme hatası' }, { status: 500 })
  }
}
