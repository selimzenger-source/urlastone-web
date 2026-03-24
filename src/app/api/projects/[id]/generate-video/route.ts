import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const maxDuration = 60

const FAL_VIDEO_URL = 'https://queue.fal.run/fal-ai/kling-video/v2.1/standard/image-to-video'

function validateAdmin(request: NextRequest): boolean {
  const auth = request.headers.get('Authorization')
  const password = (process.env.ADMIN_PASSWORD || '').trim()
  return auth === `Bearer ${password}`
}

/** Upload video to Supabase Storage */
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

// POST — Start video generation
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

    // Use Claude to find an aerial/drone-angle photo (min ~30° angle, showing full building)
    // If no suitable photo exists, reject video generation
    let imageUrl: string | null = null

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const Anthropic = (await import('@anthropic-ai/sdk')).default
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

        const imageContent = await Promise.all(
          project.photos.slice(0, 8).map(async (url: string, i: number) => {
            try {
              const res = await fetch(url)
              const buf = Buffer.from(await res.arrayBuffer())
              const base64 = buf.toString('base64')
              const mimeType = res.headers.get('content-type') || 'image/jpeg'
              return [
                { type: 'image' as const, source: { type: 'base64' as const, media_type: mimeType as 'image/jpeg', data: base64 } },
                { type: 'text' as const, text: `Image ${i + 1}` },
              ]
            } catch {
              return [{ type: 'text' as const, text: `Image ${i + 1}: failed to load` }]
            }
          })
        )

        const msg = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 50,
          messages: [{
            role: 'user',
            content: [
              ...imageContent.flat(),
              {
                type: 'text',
                text: `I need to create a cinematic drone-style video. Which image is taken from an ELEVATED/AERIAL angle (like a drone at 30+ degrees above ground) showing the FULL building and surroundings?

Requirements:
- Must be taken from above (elevated angle, not ground level)
- Must show the entire building or most of it
- Must NOT be a close-up of stone texture or wall detail
- Must NOT be taken from ground level / eye level

If ANY image meets these criteria, reply with ONLY the number (e.g. "3").
If NONE of the images are taken from an elevated/aerial angle, reply with ONLY "NONE".`,
              },
            ],
          }],
        })

        const answer = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
        console.log(`[Video] Claude analysis: "${answer}"`)

        if (answer === 'NONE' || answer.toLowerCase().includes('none')) {
          return NextResponse.json({
            error: 'Bu projede drone/kuş bakışı açıdan çekilmiş fotoğraf bulunamadı. Video üretimi için en az 30° açıyla yukarıdan çekilmiş, tüm binayı gösteren bir fotoğraf gereklidir.',
          }, { status: 400 })
        }

        const pickedIndex = parseInt(answer) - 1
        if (pickedIndex >= 0 && pickedIndex < project.photos.length) {
          imageUrl = project.photos[pickedIndex]
          console.log(`[Video] Claude picked image ${pickedIndex + 1} of ${project.photos.length}`)
        }
      } catch (err) {
        console.warn('[Video] Claude photo analysis failed:', err)
      }
    }

    // Fallback: if Claude unavailable, use first photo
    if (!imageUrl) imageUrl = project.photos[0]

    // Cinematic drone prompt — lateral tracking + dolly, elevated angle showing building + surroundings
    // This prompt produced the excellent B2 Gökova drone-style video
    const prompt = 'Dynamic lateral tracking shot moving sideways at moderate speed while dollying closer to this building facade, camera reveals natural stone cladding texture and craftsmanship, smooth professional architectural footage with noticeable camera movement, building fills entire frame, warm natural lighting, cinematic motion'

    const res = await fetch(FAL_VIDEO_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,
        prompt,
        duration: '10',
        negative_prompt: 'blur, distort, low quality, shaky camera, fast motion, text overlay, zoom out, sky only',
        cfg_scale: 0.5,
      }),
    })

    if (!res.ok) {
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
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET — Poll status / Save completed video
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
