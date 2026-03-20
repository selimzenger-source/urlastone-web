import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// GET /api/referanslar
export async function GET() {
  const { data, error } = await supabase
    .from('referanslar')
    .select('*, project:projects(id, project_name)')
    .eq('is_active', true)
    .order('sort_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/referanslar
export async function POST(req: Request) {
  const pw = req.headers.get('x-admin-password')
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, project_id, sort_order } = body

  if (!name) {
    return NextResponse.json({ error: 'İsim zorunludur' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('referanslar')
    .insert({ name, project_id: project_id || null, sort_order: sort_order || 0 })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
