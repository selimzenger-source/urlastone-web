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

// Helper: count views AND unique visitors for a given time filter
async function getBreakdowns(sinceISO: string | null) {
  // Fetch all relevant data in one query to compute both views and unique visitors
  let mainQuery = supabaseAdmin.from('page_views').select('page, device, referrer, country, os, browser, language, session_id')
  if (sinceISO) mainQuery = mainQuery.gte('created_at', sinceISO)
  const { data: allData } = await mainQuery

  if (!allData || allData.length === 0) {
    return {
      topPages: [], devices: {}, topReferrers: [], topCountries: [],
      osSystems: {}, browsers: {}, languages: {},
      deviceVisitors: {}, pageVisitors: [], referrerVisitors: [],
      countryVisitors: [], osVisitors: {}, browserVisitors: {}, langVisitors: {},
    }
  }

  // Helper to count both views and unique session_ids
  const countBoth = (items: { key: string; sid: string | null }[]) => {
    const views: Record<string, number> = {}
    const visitors: Record<string, Set<string>> = {}
    items.forEach(({ key, sid }) => {
      if (!key) return
      views[key] = (views[key] || 0) + 1
      if (sid) {
        if (!visitors[key]) visitors[key] = new Set()
        visitors[key].add(sid)
      }
    })
    const uniqueCounts: Record<string, number> = {}
    Object.entries(visitors).forEach(([k, s]) => { uniqueCounts[k] = s.size })
    return { views, uniqueCounts }
  }

  // Pages
  const pageResult = countBoth(allData.map(r => ({ key: r.page, sid: r.session_id })))
  const topPages = Object.entries(pageResult.views).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([page, count]) => ({ page, count }))
  const pageVisitors = Object.entries(pageResult.uniqueCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([page, count]) => ({ page, count }))

  // Devices
  const deviceResult = countBoth(allData.map(r => ({ key: r.device || 'desktop', sid: r.session_id })))

  // Referrers
  const refItems = allData.filter(r => r.referrer).map(r => {
    let host = r.referrer
    try { host = new URL(r.referrer).hostname.replace('www.', '') } catch { /* */ }
    return { key: host, sid: r.session_id }
  })
  const refResult = countBoth(refItems)
  const topReferrers = Object.entries(refResult.views).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([source, count]) => ({ source, count }))
  const referrerVisitors = Object.entries(refResult.uniqueCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([source, count]) => ({ source, count }))

  // Countries
  const countryResult = countBoth(allData.filter(r => r.country).map(r => ({ key: r.country, sid: r.session_id })))
  const topCountries = Object.entries(countryResult.views).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([country, count]) => ({ country, count }))
  const countryVisitors = Object.entries(countryResult.uniqueCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([country, count]) => ({ country, count }))

  // OS
  const osResult = countBoth(allData.filter(r => r.os).map(r => ({ key: r.os, sid: r.session_id })))

  // Browsers
  const browserResult = countBoth(allData.filter(r => r.browser).map(r => ({ key: r.browser, sid: r.session_id })))

  // Languages
  const langResult = countBoth(allData.filter(r => r.language).map(r => ({ key: r.language, sid: r.session_id })))

  return {
    topPages, devices: deviceResult.views, topReferrers, topCountries,
    osSystems: osResult.views, browsers: browserResult.views, languages: langResult.views,
    // Unique visitor versions
    deviceVisitors: deviceResult.uniqueCounts, pageVisitors, referrerVisitors, countryVisitors,
    osVisitors: osResult.uniqueCounts, browserVisitors: browserResult.uniqueCounts, langVisitors: langResult.uniqueCounts,
  }
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
