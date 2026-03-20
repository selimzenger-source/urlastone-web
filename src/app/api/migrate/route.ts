import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const pw = req.headers.get('x-admin-password')
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // Use direct postgres connection via Supabase SQL API
  const results: string[] = []

  try {
    // Supabase provides a SQL execution endpoint at the management level
    // We'll use the database REST endpoint with raw SQL via pg_catalog
    const pgRes = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
    })
    results.push(`RPC check: ${pgRes.status}`)
  } catch (e) {
    results.push(`RPC error: ${e}`)
  }

  // Alternative: Use Supabase Management API
  try {
    const ref = supabaseUrl.replace('https://', '').replace('.supabase.co', '')
    const sqlRes = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          ALTER TABLE page_views ADD COLUMN IF NOT EXISTS country text;
          ALTER TABLE page_views ADD COLUMN IF NOT EXISTS city text;
          ALTER TABLE page_views ADD COLUMN IF NOT EXISTS language text;
        `,
      }),
    })
    const sqlData = await sqlRes.text()
    results.push(`SQL result: ${sqlRes.status} - ${sqlData.substring(0, 200)}`)
  } catch (e) {
    results.push(`SQL error: ${e}`)
  }

  return NextResponse.json({ results })
}
