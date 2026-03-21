import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST - Record a page view (public, no auth needed)
export async function POST(req: NextRequest) {
  try {
    const { page, referrer, session_id, device, os, browser, language } = await req.json()

    if (!page) {
      return NextResponse.json({ error: 'page required' }, { status: 400 })
    }

    // Don't track admin pages
    if (page.startsWith('/admin')) {
      return NextResponse.json({ ok: true })
    }

    // Vercel provides country code via header
    const country = req.headers.get('x-vercel-ip-country') || null
    const city = req.headers.get('x-vercel-ip-city') || null

    const extendedData: Record<string, string | null> = {
      page,
      referrer: referrer || null,
      session_id: session_id || null,
      device: device || 'desktop',
      country: country || null,
      city: city ? decodeURIComponent(city) : null,
      language: language || null,
      os: os || null,
      browser: browser || null,
    }

    const { error } = await supabaseAdmin.from('page_views').insert(extendedData)

    if (error && error.message.includes('column')) {
      const { page: p, referrer: r, session_id: s, device: d } = extendedData
      await supabaseAdmin.from('page_views').insert({ page: p, referrer: r, session_id: s, device: d })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}

// DELETE - Clear all analytics data (admin only)
export async function DELETE(req: NextRequest) {
  const pw = req.headers.get('x-admin-password')
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Delete all page_views
    const { error } = await supabaseAdmin
      .from('page_views')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // delete all rows

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, message: 'All analytics data cleared' })
  } catch {
    return NextResponse.json({ error: 'Failed to clear data' }, { status: 500 })
  }
}

// Helper: count and aggregate for a given time filter
async function getBreakdowns(sinceISO: string | null) {
  // Build query helper
  const q = (col: string) => {
    let query = supabaseAdmin.from('page_views').select(col)
    if (sinceISO) query = query.gte('created_at', sinceISO)
    return query
  }

  // Pages
  const { data: pageData } = await q('page')
  const pageCounts: Record<string, number> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pageData?.forEach((r: any) => { pageCounts[r.page] = (pageCounts[r.page] || 0) + 1 })
  const topPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([page, count]) => ({ page, count }))

  // Devices
  const { data: deviceData } = await q('device')
  const deviceCounts: Record<string, number> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deviceData?.forEach((r: any) => { deviceCounts[r.device || 'desktop'] = (deviceCounts[r.device || 'desktop'] || 0) + 1 })

  // Referrers
  let refQuery = supabaseAdmin.from('page_views').select('referrer').not('referrer', 'is', null)
  if (sinceISO) refQuery = refQuery.gte('created_at', sinceISO)
  const { data: refData } = await refQuery
  const refCounts: Record<string, number> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refData?.forEach((r: any) => {
    if (r.referrer) {
      try { const host = new URL(r.referrer).hostname.replace('www.', ''); refCounts[host] = (refCounts[host] || 0) + 1 }
      catch { refCounts[r.referrer] = (refCounts[r.referrer] || 0) + 1 }
    }
  })
  const topReferrers = Object.entries(refCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([source, count]) => ({ source, count }))

  // Countries
  let topCountries: { country: string; count: number }[] = []
  try {
    let cq = supabaseAdmin.from('page_views').select('country').not('country', 'is', null)
    if (sinceISO) cq = cq.gte('created_at', sinceISO)
    const { data: countryData, error: countryErr } = await cq
    if (!countryErr && countryData) {
      const cc: Record<string, number> = {}
      countryData.forEach((r: { country: string }) => { if (r.country) cc[r.country] = (cc[r.country] || 0) + 1 })
      topCountries = Object.entries(cc).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([country, count]) => ({ country, count }))
    }
  } catch { /* */ }

  // OS
  let osCounts: Record<string, number> = {}
  try {
    let oq = supabaseAdmin.from('page_views').select('os').not('os', 'is', null)
    if (sinceISO) oq = oq.gte('created_at', sinceISO)
    const { data: osData, error: osErr } = await oq
    if (!osErr && osData) osData.forEach((r: { os: string }) => { if (r.os) osCounts[r.os] = (osCounts[r.os] || 0) + 1 })
  } catch { /* */ }

  // Browsers
  let browserCounts: Record<string, number> = {}
  try {
    let bq = supabaseAdmin.from('page_views').select('browser').not('browser', 'is', null)
    if (sinceISO) bq = bq.gte('created_at', sinceISO)
    const { data: browserData, error: browserErr } = await bq
    if (!browserErr && browserData) browserData.forEach((r: { browser: string }) => { if (r.browser) browserCounts[r.browser] = (browserCounts[r.browser] || 0) + 1 })
  } catch { /* */ }

  // Languages
  let langCounts: Record<string, number> = {}
  try {
    let lq = supabaseAdmin.from('page_views').select('language').not('language', 'is', null)
    if (sinceISO) lq = lq.gte('created_at', sinceISO)
    const { data: langData, error: langErr } = await lq
    if (!langErr && langData) langData.forEach((r: { language: string }) => { if (r.language) langCounts[r.language] = (langCounts[r.language] || 0) + 1 })
  } catch { /* */ }

  return { topPages, devices: deviceCounts, topReferrers, topCountries, osSystems: osCounts, browsers: browserCounts, languages: langCounts }
}

// GET - Get analytics data (admin only)
export async function GET(req: NextRequest) {
  const pw = req.headers.get('x-admin-password')
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const period = req.nextUrl.searchParams.get('period') || 'month' // today, week, month, all

  // Use Turkey timezone (UTC+3)
  const now = new Date()
  const turkeyOffset = 3 * 60 * 60 * 1000 // UTC+3
  const turkeyNow = new Date(now.getTime() + turkeyOffset)
  const todayStart = new Date(Date.UTC(turkeyNow.getUTCFullYear(), turkeyNow.getUTCMonth(), turkeyNow.getUTCDate()) - turkeyOffset).toISOString()
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthStart = new Date(Date.UTC(turkeyNow.getUTCFullYear(), turkeyNow.getUTCMonth(), 1) - turkeyOffset).toISOString()

  // Determine breakdown filter based on period
  const breakdownSince = period === 'today' ? todayStart : period === 'week' ? weekStart : period === 'all' ? null : monthStart

  try {
    // Summary stats (always returned)
    const [
      { count: todayViews },
      { data: todayUnique },
      { count: weekViews },
      { data: weekUnique },
      { count: monthViews },
      { data: monthUnique },
      { count: totalViews },
    ] = await Promise.all([
      supabaseAdmin.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
      supabaseAdmin.from('page_views').select('session_id').gte('created_at', todayStart).not('session_id', 'is', null),
      supabaseAdmin.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', weekStart),
      supabaseAdmin.from('page_views').select('session_id').gte('created_at', weekStart).not('session_id', 'is', null),
      supabaseAdmin.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', monthStart),
      supabaseAdmin.from('page_views').select('session_id').gte('created_at', monthStart).not('session_id', 'is', null),
      supabaseAdmin.from('page_views').select('*', { count: 'exact', head: true }),
    ])

    const todayUniqueCount = new Set(todayUnique?.map(r => r.session_id)).size
    const weekUniqueCount = new Set(weekUnique?.map(r => r.session_id)).size
    const monthUniqueCount = new Set(monthUnique?.map(r => r.session_id)).size

    // Breakdowns for selected period
    const breakdowns = await getBreakdowns(breakdownSince)

    // Daily chart (always last 14 days, Turkey timezone)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()
    const { data: dailyData } = await supabaseAdmin
      .from('page_views')
      .select('created_at, session_id')
      .gte('created_at', fourteenDaysAgo)

    const dailyStats: Record<string, { views: number; visitors: Set<string> }> = {}
    for (let i = 13; i >= 0; i--) {
      const d = new Date(turkeyNow.getTime() - i * 24 * 60 * 60 * 1000)
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
      dailyStats[key] = { views: 0, visitors: new Set() }
    }
    dailyData?.forEach(r => {
      // Convert created_at to Turkey timezone for day grouping
      const utcDate = new Date(r.created_at)
      const trDate = new Date(utcDate.getTime() + turkeyOffset)
      const key = `${trDate.getUTCFullYear()}-${String(trDate.getUTCMonth() + 1).padStart(2, '0')}-${String(trDate.getUTCDate()).padStart(2, '0')}`
      if (dailyStats[key]) {
        dailyStats[key].views++
        if (r.session_id) dailyStats[key].visitors.add(r.session_id)
      }
    })
    const dailyChart = Object.entries(dailyStats).map(([date, data]) => ({ date, views: data.views, visitors: data.visitors.size }))

    return NextResponse.json({
      today: { views: todayViews || 0, visitors: todayUniqueCount },
      week: { views: weekViews || 0, visitors: weekUniqueCount },
      month: { views: monthViews || 0, visitors: monthUniqueCount },
      total: totalViews || 0,
      period,
      ...breakdowns,
      dailyChart,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
