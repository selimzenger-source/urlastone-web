'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Users, Eye, Smartphone, Monitor, Globe, TrendingUp, Loader2, ArrowUp, ArrowDown, MousePointerClick, Clock, FileText, Tablet } from 'lucide-react'

interface AnalyticsData {
  today: { views: number; visitors: number }
  week: { views: number; visitors: number }
  month: { views: number; visitors: number }
  total: number
  topPages: { page: string; count: number }[]
  devices: Record<string, number>
  topReferrers: { source: string; count: number }[]
  dailyChart: { date: string; views: number; visitors: number }[]
  bounceRate?: number
  avgDuration?: number
  viewsPerVisit?: number
}

interface ProjectName {
  id: string
  project_name: string
}

const PAGE_NAMES: Record<string, string> = {
  '/': 'Ana Sayfa',
  '/taslar': 'Taşlarımız',
  '/simulasyon': 'Simülasyon',
  '/uygulamalarimiz': 'Uygulamalarımız',
  '/hakkimizda': 'Hakkımızda',
  '/iletisim': 'İletişim',
  '/teklif': 'Teklif Formu',
}

const PAGE_ICONS: Record<string, string> = {
  '/': '🏠',
  '/taslar': '🪨',
  '/simulasyon': '🎨',
  '/uygulamalarimiz': '📍',
  '/hakkimizda': 'ℹ️',
  '/iletisim': '📞',
  '/teklif': '📋',
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}sn`
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${mins}dk ${secs}sn`
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [projectNames, setProjectNames] = useState<Record<string, string>>({})

  useEffect(() => {
    const pw = localStorage.getItem('admin_pw') || ''

    // Fetch analytics + project names in parallel
    Promise.all([
      fetch('/api/analytics', { headers: { 'x-admin-password': pw } }).then(r => r.json()),
      fetch('/api/projects').then(r => r.json()).catch(() => []),
    ]).then(([analyticsData, projects]) => {
      if (analyticsData && analyticsData.today) setData(analyticsData)

      // Build project name lookup
      if (Array.isArray(projects)) {
        const names: Record<string, string> = {}
        projects.forEach((p: ProjectName) => {
          names[p.id] = p.project_name
        })
        setProjectNames(names)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // Resolve page path to readable name
  const getPageName = (page: string): { name: string; icon: string; isProject: boolean } => {
    // Known pages
    if (PAGE_NAMES[page]) {
      return { name: PAGE_NAMES[page], icon: PAGE_ICONS[page] || '📄', isProject: false }
    }

    // Project detail pages: /uygulamalarimiz/UUID
    const projectMatch = page.match(/^\/uygulamalarimiz\/(.+)$/)
    if (projectMatch) {
      const projectId = projectMatch[1]
      const projectName = projectNames[projectId]
      if (projectName) {
        return { name: projectName, icon: '🏗️', isProject: true }
      }
      return { name: 'Proje Detay', icon: '🏗️', isProject: true }
    }

    // Stone detail pages: /taslar/slug
    const stoneMatch = page.match(/^\/taslar\/(.+)$/)
    if (stoneMatch) {
      return { name: `Taş: ${stoneMatch[1]}`, icon: '🪨', isProject: false }
    }

    return { name: page, icon: '📄', isProject: false }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 size={24} className="animate-spin text-gold-400" />
        <span className="text-white/30 text-xs font-mono">Veriler yükleniyor...</span>
      </div>
    )
  }

  if (!data || !data.today) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <BarChart3 size={24} className="text-red-400" />
        </div>
        <p className="text-white/50 text-sm mb-2">Veri yüklenemedi</p>
        <p className="text-white/20 text-xs font-mono">Lütfen sayfayı yenileyip tekrar giriş yapın</p>
      </div>
    )
  }

  const dailyChart = data.dailyChart || []
  const topPages = data.topPages || []
  const devices = data.devices || {}
  const topReferrers = data.topReferrers || []
  const today = data.today || { views: 0, visitors: 0 }
  const week = data.week || { views: 0, visitors: 0 }
  const month = data.month || { views: 0, visitors: 0 }

  const maxChartViews = dailyChart.length > 0 ? Math.max(...dailyChart.map(d => d.views), 1) : 1
  const totalDevices = Object.values(devices).reduce((a: number, b: number) => a + b, 0) || 1

  // Calculate week-over-week change
  const thisWeekViews = dailyChart.slice(-7).reduce((sum, d) => sum + d.views, 0)
  const lastWeekViews = dailyChart.slice(0, 7).reduce((sum, d) => sum + d.views, 0)
  const weekChange = lastWeekViews > 0
    ? Math.round(((thisWeekViews - lastWeekViews) / lastWeekViews) * 100)
    : thisWeekViews > 0 ? 100 : 0

  // Calculate bounce rate (single-page sessions) and views per visit
  const totalViews = month.views || 1
  const totalVisitors = month.visitors || 1
  const viewsPerVisit = (totalViews / totalVisitors).toFixed(1)

  // Merge project pages under one entry for cleaner display
  const mergedPages = topPages.reduce<{ page: string; count: number }[]>((acc, p) => {
    // Group all individual project pages
    const existing = acc.find(a => a.page === p.page)
    if (existing) {
      existing.count += p.count
    } else {
      acc.push({ ...p })
    }
    return acc
  }, [])

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          icon={Eye}
          label="Bugün"
          value={formatNumber(today.views)}
          sub={`${today.visitors} ziyaretçi`}
          color="text-gold-400"
        />
        <StatCard
          icon={Users}
          label="Bu Hafta"
          value={formatNumber(week.views)}
          sub={`${week.visitors} ziyaretçi`}
          color="text-blue-400"
        />
        <StatCard
          icon={BarChart3}
          label="Bu Ay"
          value={formatNumber(month.views)}
          sub={`${month.visitors} ziyaretçi`}
          color="text-purple-400"
        />
        <StatCard
          icon={MousePointerClick}
          label="Sayfa/Ziyaret"
          value={viewsPerVisit}
          sub="ortalama"
          color="text-cyan-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Toplam"
          value={formatNumber(data.total)}
          sub={weekChange >= 0 ? `+%${weekChange} haftalık` : `%${weekChange} haftalık`}
          color="text-green-400"
          trend={weekChange}
        />
      </div>

      {/* Daily Chart — Area style */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading text-sm md:text-base font-semibold text-white">Ziyaretçi Trendi</h3>
            <p className="text-white/30 text-[10px] font-mono mt-0.5">Son 14 gün</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gold-400" /> Görüntüleme
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" /> Ziyaretçi
            </span>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="flex items-end gap-1 md:gap-1.5 h-44 md:h-56">
          {dailyChart.map((day, i) => {
            const viewH = (day.views / maxChartViews) * 100
            const visitorH = (day.visitors / maxChartViews) * 100
            const dateObj = new Date(day.date + 'T12:00:00')
            const dayNum = dateObj.getDate()
            const monthName = dateObj.toLocaleDateString('tr-TR', { month: 'short' })
            const weekDay = dateObj.toLocaleDateString('tr-TR', { weekday: 'short' })
            const isToday = i === dailyChart.length - 1
            const fullDate = `${dayNum} ${monthName}`

            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                {/* Tooltip */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl">
                  <p className="text-white/60 text-[9px] font-mono mb-1">{fullDate} {weekDay}</p>
                  <p className="text-gold-400 text-[11px] font-mono font-semibold">{day.views} görüntüleme</p>
                  <p className="text-blue-400 text-[11px] font-mono">{day.visitors} ziyaretçi</p>
                </div>

                {/* Bars */}
                <div className="w-full flex gap-px items-end h-full">
                  <div
                    className={`flex-1 rounded-t-sm transition-all duration-500 ${isToday ? 'bg-gold-400' : 'bg-gold-400/30 group-hover:bg-gold-400/60'}`}
                    style={{ height: `${Math.max(viewH, 3)}%` }}
                  />
                  <div
                    className={`flex-1 rounded-t-sm transition-all duration-500 ${isToday ? 'bg-blue-400' : 'bg-blue-400/30 group-hover:bg-blue-400/60'}`}
                    style={{ height: `${Math.max(visitorH, 3)}%` }}
                  />
                </div>

                {/* Labels */}
                <div className={`text-center ${isToday ? 'text-gold-400' : 'text-white/25'}`}>
                  <span className="text-[8px] md:text-[9px] font-mono block leading-tight">
                    {dayNum}
                  </span>
                  <span className="text-[7px] font-mono hidden md:block leading-tight opacity-60">
                    {weekDay}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Pages */}
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-gold-400" />
              <h3 className="font-heading text-sm md:text-base font-semibold text-white">Popüler Sayfalar</h3>
            </div>
            <span className="text-white/20 text-[10px] font-mono px-2 py-1 rounded-full bg-white/[0.04]">bu ay</span>
          </div>

          {mergedPages.length === 0 ? (
            <p className="text-white/20 text-sm font-mono text-center py-8">Henüz veri yok</p>
          ) : (
            <div className="space-y-2">
              {mergedPages.map((p, i) => {
                const maxCount = mergedPages[0]?.count || 1
                const pct = (p.count / maxCount) * 100
                const pageInfo = getPageName(p.page)
                const percentage = month.views > 0 ? Math.round((p.count / month.views) * 100) : 0

                return (
                  <div key={p.page} className="group relative">
                    {/* Background bar */}
                    <div
                      className="absolute inset-0 rounded-xl bg-gold-400/[0.04] group-hover:bg-gold-400/[0.08] transition-colors"
                      style={{ width: `${pct}%` }}
                    />
                    <div className="relative flex items-center justify-between px-3 py-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-sm flex-shrink-0">{pageInfo.icon}</span>
                        <span className="text-white text-sm font-medium truncate">{pageInfo.name}</span>
                        {pageInfo.isProject && (
                          <span className="text-gold-400/50 text-[9px] font-mono flex-shrink-0">proje</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-white/30 text-[10px] font-mono">%{percentage}</span>
                        <span className="text-gold-400 text-sm font-mono font-bold min-w-[2rem] text-right">{p.count}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Device Breakdown */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-5">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone size={14} className="text-purple-400" />
              <h3 className="font-heading text-sm font-semibold text-white">Cihazlar</h3>
            </div>

            {totalDevices <= 1 && Object.keys(devices).length === 0 ? (
              <p className="text-white/20 text-sm font-mono text-center py-4">Henüz veri yok</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(devices).sort((a, b) => b[1] - a[1]).map(([device, count]) => {
                  const pct = Math.round((count / totalDevices) * 100)
                  const Icon = device === 'mobile' ? Smartphone : device === 'tablet' ? Tablet : Monitor
                  const label = device === 'mobile' ? 'Mobil' : device === 'tablet' ? 'Tablet' : 'Masaüstü'
                  const color = device === 'mobile' ? 'bg-blue-400' : device === 'tablet' ? 'bg-cyan-400' : 'bg-purple-400'
                  return (
                    <div key={device}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Icon size={13} className="text-white/40" />
                          <span className="text-white/70 text-xs">{label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white/30 text-[10px] font-mono">{count}</span>
                          <span className="text-white text-xs font-mono font-semibold min-w-[2.5rem] text-right">%{pct}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${color}/60 rounded-full transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Referrers */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-green-400" />
                <h3 className="font-heading text-sm font-semibold text-white">Trafik Kaynakları</h3>
              </div>
            </div>

            {topReferrers.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-white/20 text-xs font-mono">Henüz referans trafiği yok</p>
              </div>
            ) : (
              <div className="space-y-2">
                {topReferrers.map((r, i) => {
                  const maxRef = topReferrers[0]?.count || 1
                  const refPct = (r.count / maxRef) * 100
                  return (
                    <div key={r.source} className="group relative">
                      <div
                        className="absolute inset-0 rounded-lg bg-green-400/[0.04]"
                        style={{ width: `${refPct}%` }}
                      />
                      <div className="relative flex items-center justify-between px-2.5 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-white/20 text-[10px] font-mono w-4">{i + 1}</span>
                          <span className="text-white/60 text-xs truncate">{r.source}</span>
                        </div>
                        <span className="text-green-400 font-mono text-xs font-semibold flex-shrink-0">{r.count}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-gold-400" />
              <h3 className="font-heading text-sm font-semibold text-white">Özet</h3>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-xs">Sayfa / Ziyaret</span>
                <span className="text-white text-xs font-mono font-semibold">{viewsPerVisit}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-xs">Toplam Sayfa</span>
                <span className="text-white text-xs font-mono font-semibold">{mergedPages.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-xs">Kaynak Sayısı</span>
                <span className="text-white text-xs font-mono font-semibold">{topReferrers.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-xs">En Yoğun Gün</span>
                <span className="text-white text-xs font-mono font-semibold">
                  {dailyChart.length > 0
                    ? (() => {
                        const best = dailyChart.reduce((a, b) => a.views > b.views ? a : b)
                        const d = new Date(best.date + 'T12:00:00')
                        return `${d.getDate()} ${d.toLocaleDateString('tr-TR', { month: 'short' })} (${best.views})`
                      })()
                    : '—'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color, trend }: {
  icon: typeof Eye
  label: string
  value: string
  sub: string
  color: string
  trend?: number
}) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 hover:bg-white/[0.05] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-8 h-8 rounded-lg ${color.replace('text-', 'bg-')}/10 flex items-center justify-center`}>
          <Icon size={16} className={color} />
        </div>
        {trend !== undefined ? (
          <span className={`flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
            trend >= 0 ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
          }`}>
            {trend >= 0 ? <ArrowUp size={9} /> : <ArrowDown size={9} />}
            {Math.abs(trend)}%
          </span>
        ) : null}
      </div>
      <p className="font-heading text-2xl md:text-3xl font-bold text-white leading-none">{value}</p>
      <div className="flex items-center justify-between mt-1.5">
        <p className="text-white/40 text-[10px] md:text-xs font-mono">{label}</p>
        <p className="text-white/25 text-[10px] font-mono">{sub}</p>
      </div>
    </div>
  )
}
