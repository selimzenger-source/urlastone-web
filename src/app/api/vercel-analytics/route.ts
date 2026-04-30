import { NextResponse } from 'next/server'

const VERCEL_TOKEN = process.env.VERCEL_TOKEN
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || 'urlastone-web'
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
  const days = period === '1d' ? 1 : period === '7d' ? 7 : period === '90d' ? 90 : 30
  const { from, to } = getDateRange(days)
  // Önceki dönem: mevcut periyodun hemen öncesi (Vercel'in gösterdiği karşılaştırma gibi)
  const now = new Date()
  const prevTo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
  const prevFrom = new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000).toISOString()

  const headers = { Authorization: `Bearer ${VERCEL_TOKEN}` }
  const base = `https://vercel.com/api/web-analytics`
  const qs = `environment=production&filter=%7B%7D&projectId=${VERCEL_PROJECT_ID}&teamId=${VERCEL_TEAM_ID}&tz=Europe%2FIstanbul`

  try {
    const [overviewRes, prevOverviewRes, timeseriesRes, pathsRes, countriesRes, devicesRes, referrersRes] = await Promise.all([
      fetch(`${base}/overview?${qs}&from=${from}&to=${to}`, { headers }),
      fetch(`${base}/overview?${qs}&from=${prevFrom}&to=${prevTo}`, { headers }),
      fetch(`${base}/timeseries?${qs}&from=${from}&to=${to}`, { headers }),
      fetch(`${base}/stats?${qs}&from=${from}&to=${to}&limit=8&type=path`, { headers }),
      fetch(`${base}/stats?${qs}&from=${from}&to=${to}&limit=8&type=country`, { headers }),
      fetch(`${base}/stats?${qs}&from=${from}&to=${to}&limit=5&type=device_type`, { headers }),
      fetch(`${base}/stats?${qs}&from=${from}&to=${to}&limit=5&type=referrer_hostname`, { headers }),
    ])

    const [overview, prevOverview, timeseries, paths, countries, devices, referrers] = await Promise.all([
      overviewRes.json(),
      prevOverviewRes.json(),
      timeseriesRes.json(),
      pathsRes.json(),
      countriesRes.json(),
      devicesRes.json(),
      referrersRes.json(),
    ])

    return NextResponse.json(
      { overview, prevOverview, timeseries, paths, countries, devices, referrers, period },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    )
  } catch (err) {
    console.error('Vercel Analytics API error:', err)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
