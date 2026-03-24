import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import sharp from 'sharp'

function validateAdmin(request: NextRequest): boolean {
  const auth = request.headers.get('Authorization')
  const password = (process.env.ADMIN_PASSWORD || '').trim()
  return auth === `Bearer ${password}`
}

// POST — rotate a project photo by 90 degrees clockwise
export async function POST(request: NextRequest) {
  if (!validateAdmin(request)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const { photoUrl, degrees = 90 } = await request.json()

  if (!photoUrl) {
    return NextResponse.json({ error: 'photoUrl required' }, { status: 400 })
  }

  try {
    // Download current image
    const res = await fetch(photoUrl)
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
    const buffer = Buffer.from(await res.arrayBuffer())

    // Rotate
    const rotated = await sharp(buffer)
      .rotate(degrees)
      .jpeg({ quality: 85, progressive: true, mozjpeg: true })
      .toBuffer()

    // Extract storage path from URL
    const pathMatch = photoUrl.match(/\/project-photos\/(.+?)(\?|$)/)
    if (!pathMatch) {
      return NextResponse.json({ error: 'Invalid photo URL' }, { status: 400 })
    }
    const storagePath = decodeURIComponent(pathMatch[1])

    // Re-upload rotated image
    const { error: uploadError } = await supabaseAdmin.storage
      .from('project-photos')
      .upload(storagePath, rotated, {
        contentType: 'image/jpeg',
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Return URL with cache buster
    const { data: urlData } = supabaseAdmin.storage
      .from('project-photos')
      .getPublicUrl(storagePath)

    return NextResponse.json({ url: `${urlData.publicUrl}?v=${Date.now()}` })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
