import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Fal AI video generation can take up to 3 minutes
export const maxDuration = 300

const FAL_VIDEO_URL = 'https://queue.fal.run/fal-ai/kling-video/v2.1/standard/image-to-video'
const FAL_STATUS_BASE = 'https://queue.fal.run/fal-ai/kling-video/v2.1/standard/image-to-video/requests'

function validateAdmin(request: NextRequest): boolean {
  const auth = request.headers.get('Authorization')
  const password = (process.env.ADMIN_PASSWORD || '').trim()
  return auth === `Bearer ${password}`
}

/** Use Claude Sonnet to analyze the project photo and generate an optimal video prompt */
async function generateVideoPrompt(
  imageUrl: string,
  projectName: string,
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return `Slow cinematic orbit around this building exterior, smooth camera movement, golden hour lighting, professional architectural photography, 4K quality`
  }

  console.log('[Video] Sonnet analyzing photo for video prompt...')
  const startTime = Date.now()

  try {
    // Download image and convert to base64
    const imgResponse = await fetch(imageUrl)
    const imgBuffer = Buffer.from(await imgResponse.arrayBuffer())
    const base64 = imgBuffer.toString('base64')
    const contentType = imgResponse.headers.get('content-type') || 'image/jpeg'

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: contentType, data: base64 },
            },
            {
              type: 'text',
              text: `This is a photo of a building/project called "${projectName}". Generate a SHORT English video prompt (1-2 sentences) for an AI image-to-video model to create a slow cinematic orbit/flyover animation of this building.

The prompt should describe:
- Camera movement (slow orbit, drone flyover, etc.)
- Lighting/atmosphere matching the photo
- Architectural style visible

Reply ONLY with the prompt text, nothing else. Keep it under 50 words.`,
            },
          ],
        }],
      }),
    })

    const elapsed = Math.round((Date.now() - startTime) / 1000)

    if (!response.ok) {
      console.error(`[Video] Sonnet error (${response.status}, ${elapsed}s)`)
      return `Slow cinematic orbit around this building exterior, smooth camera movement, professional architectural photography`
    }

    const result = await response.json()
    const prompt = result.content?.[0]?.text?.trim() || ''
    console.log(`[Video] Sonnet prompt (${elapsed}s):`, prompt)
    return prompt || `Slow cinematic orbit around this building exterior, smooth camera movement, professional architectural photography`
  } catch (err) {
    console.error('[Video] Sonnet analysis failed:', err)
    return `Slow cinematic orbit around this building exterior, smooth camera movement, professional architectural photography`
  }
}

/** Submit video generation to Fal AI queue and poll for result */
async function generateVideo(imageUrl: string, prompt: string): Promise<string> {
  const falKey = process.env.FAL_API_KEY
  if (!falKey) throw new Error('FAL_API_KEY not configured')

  console.log('[Video] Submitting to Fal AI queue...')

  // Submit to queue
  const submitResponse = await fetch(FAL_VIDEO_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${falKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: imageUrl,
      prompt,
      duration: '10',
      negative_prompt: 'blur, distort, low quality, shaky camera, fast motion',
      cfg_scale: 0.5,
    }),
  })

  if (!submitResponse.ok) {
    const errText = await submitResponse.text()
    console.error('[Video] Fal AI submit error:', submitResponse.status, errText)
    throw new Error(`Fal AI submission failed: ${submitResponse.status}`)
  }

  const submitResult = await submitResponse.json()
  const requestId = submitResult.request_id

  if (!requestId) {
    // Direct response (not queued)
    const videoUrl = submitResult.video?.url
    if (videoUrl) return videoUrl
    throw new Error('No request_id or video in response')
  }

  console.log('[Video] Queued, request_id:', requestId)

  // Poll for completion (max 4 minutes)
  const maxAttempts = 48
  const pollInterval = 5000

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, pollInterval))

    const statusResponse = await fetch(`${FAL_STATUS_BASE}/${requestId}/status`, {
      headers: { 'Authorization': `Key ${falKey}` },
    })

    if (!statusResponse.ok) {
      console.log(`[Video] Poll ${i + 1}: status check failed (${statusResponse.status})`)
      continue
    }

    const status = await statusResponse.json()
    console.log(`[Video] Poll ${i + 1}: ${status.status}`)

    if (status.status === 'COMPLETED') {
      // Fetch result
      const resultResponse = await fetch(`${FAL_STATUS_BASE}/${requestId}`, {
        headers: { 'Authorization': `Key ${falKey}` },
      })

      if (!resultResponse.ok) throw new Error('Failed to fetch completed result')

      const result = await resultResponse.json()
      const videoUrl = result.video?.url
      if (!videoUrl) throw new Error('No video URL in completed result')
      return videoUrl
    }

    if (status.status === 'FAILED') {
      throw new Error(`Video generation failed: ${status.error || 'unknown error'}`)
    }
  }

  throw new Error('Video generation timed out after 4 minutes')
}

/** Download video from Fal AI and upload to Supabase Storage */
async function uploadVideoToStorage(videoUrl: string, projectId: string): Promise<string> {
  console.log('[Video] Downloading from Fal AI...')
  const response = await fetch(videoUrl)
  if (!response.ok) throw new Error('Failed to download video')

  const buffer = Buffer.from(await response.arrayBuffer())
  const filePath = `project-videos/${projectId}-${Date.now()}.mp4`

  console.log(`[Video] Uploading to Supabase (${(buffer.length / 1024 / 1024).toFixed(1)}MB)...`)

  const { error } = await supabaseAdmin.storage
    .from('uploads')
    .upload(filePath, buffer, {
      contentType: 'video/mp4',
      upsert: true,
    })

  if (error) {
    console.error('[Video] Storage upload error:', error)
    throw new Error('Failed to upload video to storage: ' + error.message)
  }

  const { data: urlData } = supabaseAdmin.storage
    .from('uploads')
    .getPublicUrl(filePath)

  console.log('[Video] Uploaded:', urlData.publicUrl.substring(0, 80) + '...')
  return urlData.publicUrl
}

// POST — generate 3D video for project
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!validateAdmin(request)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const projectId = params.id
  console.log(`[Video] Starting video generation for project ${projectId}`)

  try {
    // 1. Fetch project
    const { data: project, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (fetchError || !project) {
      return NextResponse.json({ error: 'Proje bulunamadi' }, { status: 404 })
    }

    if (!project.photos?.length) {
      return NextResponse.json({ error: 'Proje fotografi yok' }, { status: 400 })
    }

    // 2. Pick best photo (first/cover photo)
    const imageUrl = project.photos[0]
    console.log('[Video] Using cover photo:', imageUrl.substring(0, 80) + '...')

    // 3. Generate video prompt with Sonnet
    const prompt = await generateVideoPrompt(imageUrl, project.project_name)

    // 4. Generate video with Fal AI
    const falVideoUrl = await generateVideo(imageUrl, prompt)
    console.log('[Video] Fal AI video ready:', falVideoUrl.substring(0, 80) + '...')

    // 5. Upload to Supabase Storage
    const storageUrl = await uploadVideoToStorage(falVideoUrl, projectId)

    // 6. Update project with video URL
    const { error: updateError } = await supabaseAdmin
      .from('projects')
      .update({ video_url: storageUrl })
      .eq('id', projectId)

    if (updateError) {
      console.error('[Video] DB update error:', updateError)
      return NextResponse.json({ error: 'Video olusturuldu ama DB guncellenemedi' }, { status: 500 })
    }

    console.log(`[Video] Complete for project ${projectId}`)
    return NextResponse.json({ success: true, video_url: storageUrl })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata'
    console.error('[Video] Generation failed:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE — remove video from project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!validateAdmin(request)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const projectId = params.id

  try {
    // Get current video URL
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('video_url')
      .eq('id', projectId)
      .single()

    // Remove from storage
    if (project?.video_url) {
      const parts = project.video_url.split('/uploads/')
      if (parts[1]) {
        await supabaseAdmin.storage.from('uploads').remove([parts[1]])
      }
    }

    // Clear video_url
    await supabaseAdmin
      .from('projects')
      .update({ video_url: null })
      .eq('id', projectId)

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
