import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/categories
export async function GET() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
