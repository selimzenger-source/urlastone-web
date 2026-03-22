import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const maxDuration = 60

const FAL_VIDEO_URL = 'https://queue.fal.run/fal-ai/kling-video/v2.1/standard/image-to-video'

function validateAdmin(request: NextRequest): boolean {
  const auth = request.headers.get('Authorization')
  const password = (process.env.ADMIN_PASSWORD || '').trim()
  return auth === `Bearer ${password}`
}

/** Claude Sonnet picks 2 best photos and writes 2 different camera prompts */
async function generateMultiClipPrompts(
  photos: string[],
  projectName: string,
): Promise<{ photo1: string; prompt1: string; photo2: string; prompt2: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  const defaultResult = {
    photo1: photos[0],
    prompt1: 'Slow cinematic orbit clockwise around this building exterior, smooth steady camera, golden hour warm lighting, professional architectural drone footage',
    photo2: photos[Math.min(1, photos.length - 1)],
    prompt2: 'Dramatic upward crane shot rising from ground level to reveal the full building facade, smooth vertical camera movement, natural daylight, cinematic architectural photography',
  }

  if (!apiKey || photos.length < 1) return defaultResult

  console.log('[Video] Sonnet analyzing photos for multi-clip prompts...')

  try {
    // Send up to 4 photos for Sonnet to choose from
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
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: [
            ...imageContents.flat(),
            {
              type: 'text',
              text: `These are ${photosToAnalyze.length} photos of a building/project called "${projectName}".

Pick the 2 BEST photos showing different angles of the building/stone work. Write 2 SHORT English video prompts for an AI image-to-video model. These 2 clips will play back-to-back as ONE continuous cinematic video.

CRITICAL RULES:
- Clip 1 (10 seconds): Focus on the STONE WORK and BUILDING DETAILS — slow cinematic orbit or dolly showing the craftsmanship, texture of natural stone cladding, architectural details up close
- Clip 2 (5 seconds): RISING upward shot — camera tilts/rises vertically from building base upward revealing the full structure against the sky. NOT bird's eye, but ground-to-sky reveal
- Each prompt must feel like a PROFESSIONAL architectural showcase video
- Focus on the STONE APPLICATION and BUILDING QUALITY, not generic scenery
- Describe lighting/atmosphere matching each photo

Reply ONLY with JSON, no markdown:
{"photo1": 1, "prompt1": "...", "photo2": 2, "prompt2": "..."}

photo1/photo2 = photo number (1-based index)`
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
      const idx1 = Math.max(0, Math.min((parsed.photo1 || 1) - 1, photos.length - 1))
      const idx2 = Math.max(0, Math.min((parsed.photo2 || 2) - 1, photos.length - 1))
      console.log('[Video] Sonnet chose photos', idx1 + 1, idx2 + 1)
      return {
        photo1: photos[idx1],
        prompt1: parsed.prompt1 || defaultResult.prompt1,
        photo2: photos[idx2 === idx1 ? Math.min(idx2 + 1, photos.length - 1) : idx2],
        prompt2: parsed.prompt2 || defaultResult.prompt2,
      }
    }

    return defaultResult
  } catch (err) {
    console.error('[Video] Sonnet multi-clip failed:', err)
    return defaultResult
  }
}

/** Submit one video to Fal AI queue */
async function submitToFalQueue(imageUrl: string, prompt: string, falKey: string, duration: '5' | '10' = '10') {
  const res = await fetch(FAL_VIDEO_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${falKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: imageUrl,
      prompt,
      duration,
      negative_prompt: 'blur, distort, low quality, shaky camera, fast motion, text overlay',
      cfg_scale: 0.5,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Fal AI submit failed: ${res.status} ${err}`)
  }

  return await res.json()
}

/** Download video from URL and upload to Supabase Storage */
async function uploadVideoToStorage(videoUrl: string, projectId: string, clipIndex: number): Promise<string> {
  const response = await fetch(videoUrl)
  if (!response.ok) throw new Error('Failed to download video')

  const buffer = Buffer.from(await response.arrayBuffer())
  const filePath = `project-videos/${projectId}-clip${clipIndex}-${Date.now()}.mp4`

  const { error } = await supabaseAdmin.storage
    .from('uploads')
    .upload(filePath, buffer, { contentType: 'video/mp4', upsert: true })

  if (error) throw new Error('Storage upload failed: ' + error.message)

  const { data: urlData } = supabaseAdmin.storage.from('uploads').getPublicUrl(filePath)
  return urlData.publicUrl
}

// ─── POST: Start multi-clip video generation ───
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

    // Sonnet picks 2 photos + writes 2 different prompts
    const clips = await generateMultiClipPrompts(project.photos, project.project_name)
    console.log('[Video] Clip 1 prompt:', clips.prompt1.substring(0, 80))
    console.log('[Video] Clip 2 prompt:', clips.prompt2.substring(0, 80))

    // Submit 2 Fal AI requests in parallel
    const [submit1, submit2] = await Promise.all([
      submitToFalQueue(clips.photo1, clips.prompt1, falKey, '5'),
      submitToFalQueue(clips.photo2, clips.prompt2, falKey, '5'),
    ])

    const clip1 = {
      status_url: submit1.status_url || '',
      response_url: submit1.response_url || '',
      request_id: submit1.request_id || '',
    }
    const clip2 = {
      status_url: submit2.status_url || '',
      response_url: submit2.response_url || '',
      request_id: submit2.request_id || '',
    }

    console.log('[Video] Submitted 2 clips:', clip1.request_id, clip2.request_id)

    return NextResponse.json({
      status: 'IN_QUEUE',
      clips: [clip1, clip2],
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata'
    console.error('[Video] Start failed:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ─── GET: Poll status of 2 clips / Save completed videos ───
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!validateAdmin(request)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const projectId = params.id
  const statusUrl1 = request.nextUrl.searchParams.get('status_url_1')
  const statusUrl2 = request.nextUrl.searchParams.get('status_url_2')
  const responseUrl1 = request.nextUrl.searchParams.get('response_url_1')
  const responseUrl2 = request.nextUrl.searchParams.get('response_url_2')
  const save = request.nextUrl.searchParams.get('save')

  if (!statusUrl1 || !statusUrl2) {
    return NextResponse.json({ error: 'status_url_1 ve status_url_2 gerekli' }, { status: 400 })
  }

  const falKey = process.env.FAL_API_KEY
  if (!falKey) {
    return NextResponse.json({ error: 'FAL_API_KEY not configured' }, { status: 500 })
  }

  try {
    // Check both statuses in parallel
    const [statusRes1, statusRes2] = await Promise.all([
      fetch(statusUrl1, { headers: { 'Authorization': `Key ${falKey}` } }),
      fetch(statusUrl2, { headers: { 'Authorization': `Key ${falKey}` } }),
    ])

    if (!statusRes1.ok || !statusRes2.ok) {
      return NextResponse.json({ error: 'Durum kontrol edilemedi' }, { status: 500 })
    }

    const [status1, status2] = await Promise.all([statusRes1.json(), statusRes2.json()])

    const s1 = status1.status || 'UNKNOWN'
    const s2 = status2.status || 'UNKNOWN'

    if (s1 === 'FAILED' || s2 === 'FAILED') {
      return NextResponse.json({ status: 'FAILED', error: 'Bir veya iki klip başarısız oldu' })
    }

    const bothCompleted = s1 === 'COMPLETED' && s2 === 'COMPLETED'

    if (bothCompleted && save === '1') {
      // Fetch both results
      const rUrl1 = responseUrl1 || statusUrl1.replace('/status', '')
      const rUrl2 = responseUrl2 || statusUrl2.replace('/status', '')

      const [result1, result2] = await Promise.all([
        fetch(rUrl1, { headers: { 'Authorization': `Key ${falKey}` } }).then(r => r.json()),
        fetch(rUrl2, { headers: { 'Authorization': `Key ${falKey}` } }).then(r => r.json()),
      ])

      const falUrl1 = result1.video?.url
      const falUrl2 = result2.video?.url

      if (!falUrl1 || !falUrl2) {
        return NextResponse.json({ error: 'Video URL bulunamadi' }, { status: 500 })
      }

      // Download + upload both to Supabase
      const [storageUrl1, storageUrl2] = await Promise.all([
        uploadVideoToStorage(falUrl1, projectId, 1),
        uploadVideoToStorage(falUrl2, projectId, 2),
      ])

      // Update DB with array of URLs
      await supabaseAdmin
        .from('projects')
        .update({ video_urls: [storageUrl1, storageUrl2] })
        .eq('id', projectId)

      console.log(`[Video] Saved 2 clips for project ${projectId}`)
      return NextResponse.json({ status: 'COMPLETED', video_urls: [storageUrl1, storageUrl2] })
    }

    if (bothCompleted) {
      return NextResponse.json({ status: 'COMPLETED' })
    }

    return NextResponse.json({ status: 'IN_PROGRESS', clip1: s1, clip2: s2 })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ─── DELETE: Remove all videos from project ───
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

    await supabaseAdmin
      .from('projects')
      .update({ video_urls: null })
      .eq('id', params.id)

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
