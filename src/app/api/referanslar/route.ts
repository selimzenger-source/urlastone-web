import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// GET /api/referanslar
export async function GET(req: NextRequest) {
  const includeHidden = new URL(req.url).searchParams.get('include_hidden') === 'true'

  let query = supabase
    .from('referanslar')
    .select('*, project:projects(id, project_name)')
    .order('sort_order')

  if (!includeHidden) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const cacheHeader = includeHidden
    ? 'no-store'
    : 'public, s-maxage=60, stale-while-revalidate=300'
  return NextResponse.json(data, {
    headers: { 'Cache-Control': cacheHeader },
  })
}

// POST /api/referanslar
export async function POST(req: Request) {
  const pw = req.headers.get('x-admin-password')
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, description, project_id, website_url, sort_order } = body

  if (!name) {
    return NextResponse.json({ error: 'İsim zorunludur' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('referanslar')
    .insert({ name, description: description || null, project_id: project_id || null, website_url: website_url || null, sort_order: sort_order || 0, is_active: true })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
