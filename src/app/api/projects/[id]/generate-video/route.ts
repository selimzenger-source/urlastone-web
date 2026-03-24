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

    // Use first (cover) photo
    const imageUrl = project.photos[0]

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
