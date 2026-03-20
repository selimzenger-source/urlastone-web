import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST - Record a page view (public, no auth needed)
export async function POST(req: NextRequest) {
  try {
    const { page, referrer, session_id, device } = await req.json()

    if (!page) {
      return NextResponse.json({ error: 'page required' }, { status: 400 })
    }

    // Don't track admin pages
    if (page.startsWith('/admin')) {
      return NextResponse.json({ ok: true })
    }

    await supabaseAdmin.from('page_views').insert({
      page,
      referrer: referrer || null,
      session_id: session_id || null,
      device: device || 'desktop',
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}

// GET - Get analytics data (admin only)
export async function GET(req: NextRequest) {
  const pw = req.headers.get('x-admin-password')
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  try {
    // Today's views
    const { count: todayViews } = await supabaseAdmin
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart)

    // Today's unique visitors
    const { data: todayUnique } = await supabaseAdmin
      .from('page_views')
      .select('session_id')
      .gte('created_at', todayStart)
      .not('session_id', 'is', null)

    const todayUniqueCount = new Set(todayUnique?.map(r => r.session_id)).size

    // This week views
    const { count: weekViews } = await supabaseAdmin
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekStart)

    // Week unique visitors
    const { data: weekUnique } = await supabaseAdmin
      .from('page_views')
      .select('session_id')
      .gte('created_at', weekStart)
      .not('session_id', 'is', null)

    const weekUniqueCount = new Set(weekUnique?.map(r => r.session_id)).size

    // This month views
    const { count: monthViews } = await supabaseAdmin
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthStart)

    // Month unique visitors
    const { data: monthUnique } = await supabaseAdmin
      .from('page_views')
      .select('session_id')
      .gte('created_at', monthStart)
      .not('session_id', 'is', null)

    const monthUniqueCount = new Set(monthUnique?.map(r => r.session_id)).size

    // Total all-time
    const { count: totalViews } = await supabaseAdmin
      .from('page_views')
      .select('*', { count: 'exact', head: true })

    // Most visited pages (this month)
    const { data: pageData } = await supabaseAdmin
      .from('page_views')
      .select('page')
      .gte('created_at', monthStart)

    const pageCounts: Record<string, number> = {}
    pageData?.forEach(r => {
      pageCounts[r.page] = (pageCounts[r.page] || 0) + 1
    })
    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([page, count]) => ({ page, count }))

    // Device breakdown (this month)
    const { data: deviceData } = await supabaseAdmin
      .from('page_views')
      .select('device')
      .gte('created_at', monthStart)

    const deviceCounts: Record<string, number> = {}
    deviceData?.forEach(r => {
      deviceCounts[r.device || 'desktop'] = (deviceCounts[r.device || 'desktop'] || 0) + 1
    })

    // Referrer breakdown (this month)
    const { data: refData } = await supabaseAdmin
      .from('page_views')
      .select('referrer')
      .gte('created_at', monthStart)
      .not('referrer', 'is', null)

    const refCounts: Record<string, number> = {}
    refData?.forEach(r => {
      if (r.referrer) {
        try {
          const host = new URL(r.referrer).hostname.replace('www.', '')
          refCounts[host] = (refCounts[host] || 0) + 1
        } catch {
          refCounts[r.referrer] = (refCounts[r.referrer] || 0) + 1
        }
      }
    })
    const topReferrers = Object.entries(refCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([source, count]) => ({ source, count }))

    // Daily views for last 14 days (for chart)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()
    const { data: dailyData } = await supabaseAdmin
      .from('page_views')
      .select('created_at, session_id')
      .gte('created_at', fourteenDaysAgo)

    const dailyStats: Record<string, { views: number; visitors: Set<string> }> = {}
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().split('T')[0]
      dailyStats[key] = { views: 0, visitors: new Set() }
    }

    dailyData?.forEach(r => {
      const key = r.created_at.split('T')[0]
      if (dailyStats[key]) {
        dailyStats[key].views++
        if (r.session_id) dailyStats[key].visitors.add(r.session_id)
      }
    })

    const dailyChart = Object.entries(dailyStats).map(([date, data]) => ({
      date,
      views: data.views,
      visitors: data.visitors.size,
    }))

    return NextResponse.json({
      today: { views: todayViews || 0, visitors: todayUniqueCount },
      week: { views: weekViews || 0, visitors: weekUniqueCount },
      month: { views: monthViews || 0, visitors: monthUniqueCount },
      total: totalViews || 0,
      topPages,
      devices: deviceCounts,
      topReferrers,
      dailyChart,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
