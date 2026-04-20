import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { pingProjectAdded } from '@/lib/indexnow'
import { generateSlug } from '@/lib/slug'

// Vercel Data Cache'i devre dışı bırak — yeni eklenen projeler anında görünsün
export const dynamic = 'force-dynamic'
export const revalidate = 0

function validateAdmin(request: NextRequest): boolean {
  const auth = request.headers.get('Authorization')
  const password = (process.env.ADMIN_PASSWORD || '').trim()
  return auth === `Bearer ${password}`
}

// GET — public: aktif projeleri getir, admin: tüm projeleri getir
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const all = searchParams.get('all') === 'true'

  let query = supabaseAdmin
    .from('projects')
    .select('*')
    .order('display_order', { ascending: true })

  // Admin değilse sadece aktif projeleri göster
  if (!all) {
    query = query.eq('active', true)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Cache: kısa CDN cache — proje güncellenince hızlı yansısın
  const cacheHeader = all
    ? 'no-store'
    : 'public, s-maxage=60, stale-while-revalidate=120'
  return NextResponse.json(data, {
    headers: { 'Cache-Control': cacheHeader },
  })
}

// POST — admin: yeni proje ekle
export async function POST(request: NextRequest) {
  if (!validateAdmin(request)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const body = await request.json()

  const { data, error } = await supabaseAdmin
    .from('projects')
    .insert(body)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // IndexNow — yeni proje aktif ise Bing/Yandex'e bildir (fire-and-forget)
  if (data?.active !== false && data?.project_name) {
    const slug = generateSlug(data.project_name)
    pingProjectAdded(slug).catch(() => {})
  }

  return NextResponse.json(data, { status: 201 })
}
