import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// GET /api/hero-slides - Get all active slides (public)
export async function GET() {
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

// POST /api/hero-slides - Create new slide (admin only)
export async function POST(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check max 10 slides
  const { count } = await supabaseAdmin
    .from('hero_slides')
    .select('id', { count: 'exact', head: true })

  if (count !== null && count >= 10) {
    return NextResponse.json({ error: 'Maksimum 10 slayt eklenebilir' }, { status: 400 })
  }

  const body = await req.json()

  // Get next sort_order
  const { data: maxOrder } = await supabaseAdmin
    .from('hero_slides')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = maxOrder && maxOrder.length > 0 ? maxOrder[0].sort_order + 1 : 1

  const { data, error } = await supabaseAdmin
    .from('hero_slides')
    .insert({ ...body, sort_order: nextOrder })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
