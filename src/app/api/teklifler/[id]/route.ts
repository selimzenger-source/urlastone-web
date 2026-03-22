import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// PATCH /api/teklifler/[id] — update status (admin)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const pw = req.headers.get('x-admin-password')
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const { data, error } = await supabaseAdmin
    .from('teklifler')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/teklifler/[id] — delete (admin)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const pw = req.headers.get('x-admin-password')
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  // Delete storage files for this teklif
  const { data: files } = await supabaseAdmin.storage
    .from('teklifler')
    .list(id)
  if (files && files.length > 0) {
    await supabaseAdmin.storage
      .from('teklifler')
      .remove(files.map(f => `${id}/${f.name}`))
  }

  const { error } = await supabaseAdmin
    .from('teklifler')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
