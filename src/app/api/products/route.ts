import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// GET /api/products - List products with optional filters
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') // slug: nature, mix, crazy, line
  const stoneType = searchParams.get('stone_type') // code: TRV, MRMR, BZLT, KLKR

  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug, thickness, image_url),
      stone_type:stone_types(id, name, code)
    `)
    .eq('is_active', true)
    .order('sort_order')

  if (category) {
    // Filter by category slug
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single()
    if (cat) query = query.eq('category_id', cat.id)
  }

  if (stoneType) {
    // Filter by stone type code
    const { data: st } = await supabase
      .from('stone_types')
      .select('id')
      .eq('code', stoneType)
      .single()
    if (st) query = query.eq('stone_type_id', st.id)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/products - Create product (admin only)
export async function POST(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { data, error } = await supabaseAdmin
    .from('products')
    .insert(body)
    .select(`
      *,
      category:categories(id, name, slug),
      stone_type:stone_types(id, name, code)
    `)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
