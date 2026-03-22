import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const maxDuration = 60

const FAL_VIDEO_URL = 'https://queue.fal.run/fal-ai/kling-video/v2.1/standard/image-to-video'

function validateAdmin(request: NextRequest): boolean {
  const auth = request.headers.get('Authorization')
  const password = (process.env.ADMIN_PASSWORD || '').trim()
  return auth === `Bearer ${password}`
}

/** Claude Sonnet picks the best photo and writes an excellent video prompt */
async function generateVideoPrompt(
  photos: string[],
  projectName: string,
): Promise<{ photo: string; prompt: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  const defaultResult = {
    photo: photos[0],
    prompt: 'Camera starts slightly far at 25-degree elevated angle then slowly dollies in toward this stone-clad building facade, gradually leveling to reveal natural stone texture details up close, photorealistic stone craftsmanship, warm lighting, smooth cinematic approach, building fills entire frame',
  }

  if (!apiKey || photos.length < 1) return defaultResult

  console.log('[Video] Sonnet analyzing photos for video prompt...')

  try {
    const photosToAnalyze = photos.slice(0, 4)
    const imageContents = await Promise.all(
      photosToAnalyze.map(async (url, i) => {
        const res = await fetch(url)
        const buf = Buffer.from(await res.arrayBuffer())
        const ct = res.headers.get('content-type') || 'image/jpeg'
        return [
          { type: 'image' as const, source: { type: 'base64' as const, media_type: ct, data: buf.toString('base64') } },
          { type: 'text' as const, text: `Photo ${i + 1}` },
        ]
      })
    )

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
            ...imageContents.flat(),
            {
              type: 'text',
              text: `These are ${photosToAnalyze.length} photos of a building/project called "${projectName}".

Pick the SINGLE BEST photo that shows the building with its natural stone cladding most impressively. Then write ONE cinematic video prompt (under 50 words) for an AI image-to-video model to create a 10-second architectural showcase.

CRITICAL RULES:
- Camera starts from a slightly far distance at a 20-30 degree elevated angle, then SLOWLY DOLLY IN toward the building facade, getting closer and closer to reveal stone texture details
- As camera approaches, it gradually levels to straight-on angle (from 20-30 degrees down to nearly 0 degrees)
- Focus entirely on the NATURAL STONE CLADDING — the texture, individual stone pieces, color variations, craftsmanship must look EXACTLY like the real photo
- Camera NEVER leaves the building — stone-clad structure fills entire frame at all times
- The stone details must be PHOTOREALISTIC and match the actual stone in the photo — preserve exact colors, textures, grout lines
- Movement should feel like a professional architectural drone approach shot — smooth, steady, cinematic
- NO sky reveals, NO landscape, NO zooming out — always on the building and its stone work

Reply ONLY with JSON, no markdown:
{"photo": 1, "prompt": "..."}

photo = photo number (1-based index)`
            },
          ],
        }],
      }),
    })

    if (!response.ok) {
      console.error('[Video] Sonnet error:', response.status)
      return defaultResult
    }

    const result = await response.json()
    const text = result.content?.[0]?.text || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      const idx = Math.max(0, Math.min((parsed.photo || 1) - 1, photos.length - 1))
      console.log('[Video] Sonnet chose photo', idx + 1, 'prompt:', parsed.prompt?.substring(0, 80))
      return {
        photo: photos[idx],
        prompt: parsed.prompt || defaultResult.prompt,
      }
    }

    return defaultResult
  } catch (err) {
    console.error('[Video] Sonnet failed:', err)
    return defaultResult
  }
}

/** Download video from URL and upload to Supabase Storage */
async function uploadVideoToStorage(videoUrl: string, projectId: string): Promise<string> {
  const response = await fetch(videoUrl)
  if (!response.ok) throw new Error('Failed to download video')

  const buffer = Buffer.from(await response.arrayBuffer())
  const filePath = `project-videos/${projectId}-${Date.now()}.mp4`

  const { error } = await supabaseAdmin.storage
    .from('uploads')
    .upload(filePath, buffer, { contentType: 'video/mp4', upsert: true })

  if (error) throw new Error('Storage upload failed: ' + error.message)

  const { data: urlData } = supabaseAdmin.storage.from('uploads').getPublicUrl(filePath)
  return urlData.publicUrl
}

// ─── POST: Start single video generation ───
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!validateAdmin(request)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const projectId = params.id

  try {
    const { data: project, error: fetchError } = await supabaseAdmin
      .from('projects').select('*').eq('id', projectId).single()

    if (fetchError || !project) {
      return NextResponse.json({ error: 'Proje bulunamadi' }, { status: 404 })
    }
    if (!project.photos?.length) {
      return NextResponse.json({ error: 'Proje fotografi yok' }, { status: 400 })
    }

    const falKey = process.env.FAL_API_KEY
    if (!falKey) {
      return NextResponse.json({ error: 'FAL_API_KEY not configured' }, { status: 500 })
    }

    // Sonnet picks best photo + writes prompt
    const { photo, prompt } = await generateVideoPrompt(project.photos, project.project_name)
    console.log('[Video] Prompt:', prompt.substring(0, 100))

    // Submit to Fal AI queue
    const res = await fetch(FAL_VIDEO_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: photo,
        prompt,
        duration: '10',
        negative_prompt: 'blur, distort, low quality, shaky camera, fast motion, text overlay, zoom out, sky only, landscape without building',
        cfg_scale: 0.5,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `Fal AI hata: ${res.status}` }, { status: 500 })
    }

    const submitResult = await res.json()

    if (submitResult.video?.url) {
      const storageUrl = await uploadVideoToStorage(submitResult.video.url, projectId)
      await supabaseAdmin.from('projects').update({ video_urls: [storageUrl] }).eq('id', projectId)
      return NextResponse.json({ status: 'COMPLETED', video_urls: [storageUrl] })
    }

    return NextResponse.json({
      status: 'IN_QUEUE',
      status_url: submitResult.status_url || '',
      response_url: submitResult.response_url || '',
      request_id: submitResult.request_id || '',
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata'
    console.error('[Video] Start failed:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ─── GET: Poll status / Save completed video ───
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!validateAdmin(request)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const projectId = params.id
  const statusUrl = request.nextUrl.searchParams.get('status_url')
  const responseUrl = request.nextUrl.searchParams.get('response_url')
  const save = request.nextUrl.searchParams.get('save')

  if (!statusUrl) {
    return NextResponse.json({ error: 'status_url gerekli' }, { status: 400 })
  }

  const falKey = process.env.FAL_API_KEY
  if (!falKey) {
    return NextResponse.json({ error: 'FAL_API_KEY not configured' }, { status: 500 })
  }

  try {
    const statusResponse = await fetch(statusUrl, {
      headers: { 'Authorization': `Key ${falKey}` },
    })

    if (!statusResponse.ok) {
      return NextResponse.json({ error: 'Durum kontrol edilemedi' }, { status: 500 })
    }

    const statusData = await statusResponse.json()

    if (statusData.status === 'COMPLETED') {
      if (save === '1') {
        const resultUrl = responseUrl || statusUrl.replace('/status', '')
        const resultResponse = await fetch(resultUrl, {
          headers: { 'Authorization': `Key ${falKey}` },
        })

        if (!resultResponse.ok) {
          return NextResponse.json({ error: 'Sonuc alinamadi' }, { status: 500 })
        }

        const result = await resultResponse.json()
        const falVideoUrl = result.video?.url
        if (!falVideoUrl) {
          return NextResponse.json({ error: 'Video URL bulunamadi' }, { status: 500 })
        }

        const storageUrl = await uploadVideoToStorage(falVideoUrl, projectId)
        await supabaseAdmin.from('projects').update({ video_urls: [storageUrl] }).eq('id', projectId)

        return NextResponse.json({ status: 'COMPLETED', video_urls: [storageUrl] })
      }

      return NextResponse.json({ status: 'COMPLETED' })
    }

    if (statusData.status === 'FAILED') {
      return NextResponse.json({ status: 'FAILED', error: statusData.error || 'Video uretimi basarisiz' })
    }

    return NextResponse.json({ status: statusData.status || 'IN_PROGRESS' })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ─── DELETE: Remove video from project ───
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!validateAdmin(request)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  try {
    const { data: project } = await supabaseAdmin
      .from('projects').select('video_urls').eq('id', params.id).single()

    if (project?.video_urls?.length) {
      const filePaths = project.video_urls.map((url: string) => {
        const parts = url.split('/uploads/')
        return parts[1] || ''
      }).filter(Boolean)

      if (filePaths.length) {
        await supabaseAdmin.storage.from('uploads').remove(filePaths)
      }
    }

    await supabaseAdmin.from('projects').update({ video_urls: null }).eq('id', params.id)

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
