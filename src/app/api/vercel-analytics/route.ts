import { NextResponse } from 'next/server'

const VERCEL_TOKEN = process.env.VERCEL_TOKEN
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || 'urlastone-web'
const URLAKLINKER_PROJECT_ID = process.env.URLAKLINKER_VERCEL_PROJECT_ID || 'prj_rPbTUlQQPe4hhkBq5C01MCLOssRN'
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || 'team_GariHi8fy8koIkpANkIdKjSH'

function getDateRange(days: number) {
  const now = new Date()
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  return {
    from: from.toISOString(),
    to: now.toISOString(),
  }
}

export async function GET(req: Request) {
  if (!VERCEL_TOKEN) {
    return NextResponse.json({ error: 'Vercel token not configured' }, { status: 500 })
  }

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') || '30d'
  const project = searchParams.get('project') === 'urlaklinker' ? 'urlaklinker' : 'urlastone'
  const projectId = project === 'urlaklinker' ? URLAKLINKER_PROJECT_ID : VERCEL_PROJECT_ID
  const days = period === '1d' ? 1 : period === '7d' ? 7 : period === '90d' ? 90 : 30
  const { from, to } = getDateRange(days)
  // Önceki dönem: mevcut periyodun hemen öncesi (Vercel'in gösterdiği karşılaştırma gibi)
  const now = new Date()
  const prevTo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
  const prevFrom = new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000).toISOString()

  const headers = { Authorization: `Bearer ${VERCEL_TOKEN}` }
  const base = `https://vercel.com/api/web-analytics/v2`
  const qs = `environment=production&filter=%7B%7D&projectId=${projectId}&teamId=${VERCEL_TEAM_ID}&tz=Europe%2FIstanbul`

  // Vercel boş gövde/HTML dönerse 500 yerine null — panel kalan veriyle çalışmaya devam eder
  const safeJson = async (res: Response) => {
    if (!res.ok) {
      console.error(`Vercel Analytics ${res.url} -> HTTP ${res.status}`)
      return null
    }
    try {
      return await res.json()
    } catch {
      console.error(`Vercel Analytics ${res.url} -> invalid JSON`)
      return null
    }
  }

  try {
    const [overviewRes, prevOverviewRes, timeseriesRes, pathsRes, countriesRes, devicesRes, referrersRes] = await Promise.all([
      fetch(`${base}/overview?${qs}&from=${from}&to=${to}&withBounceRate=true`, { headers }),
      fetch(`${base}/overview?${qs}&from=${prevFrom}&to=${prevTo}&withBounceRate=true`, { headers }),
      fetch(`${base}/timeseries?${qs}&from=${from}&to=${to}`, { headers }),
      fetch(`${base}/stats?${qs}&from=${from}&to=${to}&limit=8&type=path`, { headers }),
      fetch(`${base}/stats?${qs}&from=${from}&to=${to}&limit=8&type=country`, { headers }),
      fetch(`${base}/stats?${qs}&from=${from}&to=${to}&limit=5&type=device_type`, { headers }),
      fetch(`${base}/stats?${qs}&from=${from}&to=${to}&limit=5&type=referrer`, { headers }),
    ])

    const [overview, prevOverview, timeseries, paths, countries, devices, referrers] = await Promise.all([
      safeJson(overviewRes),
      safeJson(prevOverviewRes),
      safeJson(timeseriesRes),
      safeJson(pathsRes),
      safeJson(countriesRes),
      safeJson(devicesRes),
      safeJson(referrersRes),
    ])

    // v2 timeseries saatlik döner — 1 günden uzun periyotlarda günlüğe topla (grafik v1 gibi günlük çubuk bekler)
    if (days > 1 && timeseries?.data?.groups?.all) {
      const byDay = new Map<string, { key: string; total: number; devices: number }>()
      for (const item of timeseries.data.groups.all as Array<{ key: string; total: number; devices: number }>) {
        const day = item.key.slice(0, 10)
        const agg = byDay.get(day) || { key: day, total: 0, devices: 0 }
        agg.total += item.total || 0
        agg.devices += item.devices || 0
        byDay.set(day, agg)
      }
      timeseries.data.groups.all = Array.from(byDay.values())
    }

    return NextResponse.json(
      { overview, prevOverview, timeseries, paths, countries, devices, referrers, period },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    )
  } catch (err) {
    console.error('Vercel Analytics API error:', err)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
