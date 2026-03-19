import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function validateAdmin(request: NextRequest): boolean {
  const auth = request.headers.get('Authorization')
  return auth === `Bearer ${process.env.ADMIN_PASSWORD}`
}

// GET — public: tüm aktif projeleri getir
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
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

  return NextResponse.json(data, { status: 201 })
}
