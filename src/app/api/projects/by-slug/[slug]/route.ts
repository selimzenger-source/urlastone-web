import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateSlug } from '@/lib/slug'

// Vercel Data Cache'i devre dışı bırak — yeni eklenen projeler anında görünsün
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET — find project by slug (generated from project_name)
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const targetSlug = params.slug

  // Fetch all active projects and match by generated slug
  const { data: projects, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('active', true)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const project = projects?.find(
    (p) => generateSlug(p.project_name) === targetSlug
  )

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(project, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
  })
}
