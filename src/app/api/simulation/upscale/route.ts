import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import sharp from 'sharp'

const REPLICATE_API = 'https://api.replicate.com/v1/predictions'

function validateAdmin(request: NextRequest): boolean {
  const auth = request.headers.get('Authorization')
  const password = (process.env.ADMIN_PASSWORD || '').trim()
  return auth === `Bearer ${password}`
}

export async function POST(req: NextRequest) {
  if (!validateAdmin(req)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const token = process.env.REPLICATE_API_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'Replicate API token not configured' }, { status: 500 })
  }

  try {
    const { imageUrl, scale = 2, projectId } = await req.json()

    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 })
    }

    console.log('[Upscale] Starting Real-ESRGAN upscale, scale:', scale)
    console.log('[Upscale] Input URL:', imageUrl.substring(0, 80) + '...')

    // Call Real-ESRGAN with Prefer: wait (synchronous — usually 2-5 seconds)
    const response = await fetch(REPLICATE_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait',
      },
      body: JSON.stringify({
        version: 'b3ef194191d13140337468c916c2c5b96dd0cb06dffc032a022a31807f6a5ea8',
        input: {
          image: imageUrl,
          scale,
          face_enhance: false,
        },
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('[Upscale] Replicate error:', err)
      return NextResponse.json(
        { error: err.detail || 'Upscale failed' },
        { status: response.status }
      )
    }

    const prediction = await response.json()

    // Real-ESRGAN returns output as a single URL string
    const outputUrl = typeof prediction.output === 'string'
      ? prediction.output
      : Array.isArray(prediction.output)
        ? prediction.output[0]
        : null

    console.log('[Upscale] Output URL:', outputUrl?.substring(0, 80))

    if (!outputUrl) {
      return NextResponse.json({ error: 'No output from upscale' }, { status: 500 })
    }

    // Server-side: Replicate URL'den resmi indir, watermark ekle, Supabase'e yükle
    console.log('[Upscale] Downloading upscaled image from Replicate...')
    const upscaledRes = await fetch(outputUrl)
    if (!upscaledRes.ok) {
      return NextResponse.json({ error: 'Upscaled image download failed' }, { status: 500 })
    }
    const upscaledBuffer = Buffer.from(await upscaledRes.arrayBuffer())

    // JPEG olarak sıkıştır (watermark client-side eklenir)
    const finalBuffer = await sharp(upscaledBuffer)
      .jpeg({ quality: 82, progressive: true, mozjpeg: true })
      .toBuffer()

    // Supabase'e yükle
    const pid = projectId || 'upscale'
    const fileName = `${pid}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
    console.log('[Upscale] Uploading to Supabase:', fileName)

    const { error: uploadError } = await supabaseAdmin.storage
      .from('project-photos')
      .upload(fileName, finalBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      })

    if (uploadError) {
      console.error('[Upscale] Supabase upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('project-photos')
      .getPublicUrl(fileName)

    console.log('[Upscale] Done! Supabase URL:', urlData.publicUrl.substring(0, 80))
    return NextResponse.json({ url: urlData.publicUrl })
  } catch (error) {
    console.error('[Upscale] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
