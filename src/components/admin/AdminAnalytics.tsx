'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Users, Eye, Smartphone, Monitor, Globe, TrendingUp, Loader2, ArrowUp, ArrowDown, MousePointerClick, Clock, FileText, Tablet } from 'lucide-react'

type Metric = 'views' | 'visitors'

interface AnalyticsData {
  today: { views: number; visitors: number }
  week: { views: number; visitors: number }
  month: { views: number; visitors: number }
  total: number
  topPages: { page: string; count: number }[]
  devices: Record<string, number>
  topReferrers: { source: string; count: number }[]
  topCountries?: { country: string; count: number }[]
  osSystems?: Record<string, number>
  browsers?: Record<string, number>
  languages?: Record<string, number>
  dailyChart: { date: string; views: number; visitors: number }[]
  // Unique visitor versions
  pageVisitors?: { page: string; count: number }[]
  deviceVisitors?: Record<string, number>
  referrerVisitors?: { source: string; count: number }[]
  countryVisitors?: { country: string; count: number }[]
  osVisitors?: Record<string, number>
  browserVisitors?: Record<string, number>
  langVisitors?: Record<string, number>
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

const COUNTRY_NAMES: Record<string, string> = {
  TR: '🇹🇷 Türkiye', DE: '🇩🇪 Almanya', US: '🇺🇸 ABD', GB: '🇬🇧 İngiltere',
  FR: '🇫🇷 Fransa', ES: '🇪🇸 İspanya', IT: '🇮🇹 İtalya', NL: '🇳🇱 Hollanda',
  SA: '🇸🇦 S. Arabistan', AE: '🇦🇪 BAE', QA: '🇶🇦 Katar', KW: '🇰🇼 Kuveyt',
  BH: '🇧🇭 Bahreyn', OM: '🇴🇲 Umman', EG: '🇪🇬 Mısır', JO: '🇯🇴 Ürdün',
  IQ: '🇮🇶 Irak', LB: '🇱🇧 Lübnan', RU: '🇷🇺 Rusya', UA: '🇺🇦 Ukrayna',
  AZ: '🇦🇿 Azerbaycan', GE: '🇬🇪 Gürcistan', GR: '🇬🇷 Yunanistan',
  BG: '🇧🇬 Bulgaristan', RO: '🇷🇴 Romanya', AT: '🇦🇹 Avusturya',
  CH: '🇨🇭 İsviçre', SE: '🇸🇪 İsveç', NO: '🇳🇴 Norveç', DK: '🇩🇰 Danimarka',
  BE: '🇧🇪 Belçika', PL: '🇵🇱 Polonya', CZ: '🇨🇿 Çekya', CA: '🇨🇦 Kanada',
  AU: '🇦🇺 Avustralya', JP: '🇯🇵 Japonya', CN: '🇨🇳 Çin', IN: '🇮🇳 Hindistan',
  BR: '🇧🇷 Brezilya', MX: '🇲🇽 Meksika', AR: '🇦🇷 Arjantin', CL: '🇨🇱 Şili',
  KR: '🇰🇷 G. Kore', TH: '🇹🇭 Tayland', SG: '🇸🇬 Singapur', MY: '🇲🇾 Malezya',
  IL: '🇮🇱 İsrail', PT: '🇵🇹 Portekiz', IE: '🇮🇪 İrlanda', FI: '🇫🇮 Finlandiya',
  HU: '🇭🇺 Macaristan', HR: '🇭🇷 Hırvatistan', RS: '🇷🇸 Sırbistan',
  CY: '🇨🇾 Kıbrıs', MT: '🇲🇹 Malta', LU: '🇱🇺 Lüksemburg',
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

type Period = 'today' | 'week' | 'month' | 'all'

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Bugün',
  week: 'Bu Hafta',
  month: 'Bu Ay',
  all: 'Son 1 Yıl',
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [projectNames, setProjectNames] = useState<Record<string, string>>({})
  const [activePeriod, setActivePeriod] = useState<Period>('month')
  const [activeMetric, setActiveMetric] = useState<Metric>('views')
  const [clearing, setClearing] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const pw = typeof window !== 'undefined' ? localStorage.getItem('admin_pw') || '' : ''

  const fetchAnalytics = (period: Period = activePeriod) => {
    setLoading(true)
    Promise.all([
      fetch(`/api/analytics?period=${period}`, { headers: { 'x-admin-password': pw } }).then(r => r.json()),
      fetch('/api/projects').then(r => r.json()).catch(() => []),
    ]).then(([analyticsData, projects]) => {
      if (analyticsData && analyticsData.today) setData(analyticsData)

      if (Array.isArray(projects)) {
        const names: Record<string, string> = {}
        projects.forEach((p: ProjectName) => {
          names[p.id] = p.project_name
        })
        setProjectNames(names)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  const handlePeriodChange = (period: Period) => {
    setActivePeriod(period)
    fetchAnalytics(period)
  }

  const handleClearData = async () => {
    setClearing(true)
    await fetch('/api/analytics', { method: 'DELETE', headers: { 'x-admin-password': pw } })
    setShowClearConfirm(false)
    setClearing(false)
    fetchAnalytics()
  }

  useEffect(() => { fetchAnalytics() }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

  const isViews = activeMetric === 'views'
  const chartValues = dailyChart.map(d => isViews ? d.views : d.visitors)
  const maxChartValue = chartValues.length > 0 ? Math.max(...chartValues, 1) : 1
  const maxChartViews = dailyChart.length > 0 ? Math.max(...dailyChart.map(d => d.views), 1) : 1

  // Calculate week-over-week change
  const thisWeekViews = dailyChart.slice(-7).reduce((sum, d) => sum + d.views, 0)
  const lastWeekViews = dailyChart.slice(0, 7).reduce((sum, d) => sum + d.views, 0)
  const weekChange = lastWeekViews > 0
    ? Math.round(((thisWeekViews - lastWeekViews) / lastWeekViews) * 100)
    : thisWeekViews > 0 ? 100 : 0

  // Calculate views per visit
  const totalViews = month.views || 1
  const totalVisitors = month.visitors || 1
  const viewsPerVisit = (totalViews / totalVisitors).toFixed(1)

  // Merge project pages under one entry for cleaner display
  const mergedPages = topPages.reduce<{ page: string; count: number }[]>((acc, p) => {
    const existing = acc.find(a => a.page === p.page)
    if (existing) {
      existing.count += p.count
    } else {
      acc.push({ ...p })
    }
    return acc
  }, [])

  // Pick breakdown data based on metric
  const activePages = isViews ? mergedPages : (data.pageVisitors || []).reduce<{ page: string; count: number }[]>((acc, p) => {
    const existing = acc.find(a => a.page === p.page)
    if (existing) existing.count += p.count
    else acc.push({ ...p })
    return acc
  }, [])
  const activeDevices = isViews ? devices : (data.deviceVisitors || {})
  const activeReferrers = isViews ? topReferrers : (data.referrerVisitors || [])
  const activeCountries = isViews ? (data.topCountries || []) : (data.countryVisitors || [])
  const activeOS = isViews ? (data.osSystems || {}) : (data.osVisitors || {})
  const activeBrowsers = isViews ? (data.browsers || {}) : (data.browserVisitors || {})
  const activeLanguages = isViews ? (data.languages || {}) : (data.langVisitors || {})
  const totalDevices = Object.values(activeDevices).reduce((a: number, b: number) => a + b, 0) || 1

  return (
    <div className="space-y-5">
      {/* Summary Cards — Clickable period selectors */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          icon={Eye} label="Bugün" views={today.views} visitors={today.visitors} color="text-gold-400"
          active={activePeriod === 'today'} onClick={() => handlePeriodChange('today')} metric={activeMetric}
        />
        <MetricCard
          icon={BarChart3} label="Bu Hafta" views={week.views} visitors={week.visitors} color="text-blue-400"
          active={activePeriod === 'week'} onClick={() => handlePeriodChange('week')} metric={activeMetric}
        />
        <MetricCard
          icon={Users} label="Bu Ay" views={month.views} visitors={month.visitors} color="text-purple-400"
          active={activePeriod === 'month'} onClick={() => handlePeriodChange('month')} metric={activeMetric}
        />
        <MetricCard
          icon={TrendingUp} label="Son 1 Yıl" views={data.total} visitors={0} color="text-green-400"
          active={activePeriod === 'all'} onClick={() => handlePeriodChange('all')} metric={activeMetric}
          sub={`${viewsPerVisit} sayfa/ziyaret`} trend={weekChange}
        />
      </div>

      {/* Period indicator + Metric Toggle + Reset */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-white/30 text-[10px] font-mono">
          📊 Detaylar: <span className="text-white/60">{PERIOD_LABELS[activePeriod]}</span>
        </p>
        <div className="flex items-center gap-2">
          {/* Metric Toggle */}
          <div className="flex bg-white/[0.04] border border-white/[0.06] rounded-full p-0.5">
            <button
              onClick={() => setActiveMetric('views')}
              className={`px-3 py-1 rounded-full text-[10px] font-mono transition-all ${
                activeMetric === 'views' ? 'bg-gold-400/20 text-gold-400' : 'text-white/30 hover:text-white/50'
              }`}
            >
              <Eye size={10} className="inline mr-1" />Görüntülenme
            </button>
            <button
              onClick={() => setActiveMetric('visitors')}
              className={`px-3 py-1 rounded-full text-[10px] font-mono transition-all ${
                activeMetric === 'visitors' ? 'bg-blue-400/20 text-blue-400' : 'text-white/30 hover:text-white/50'
              }`}
            >
              <Users size={10} className="inline mr-1" />Tekil Ziyaretçi
            </button>
          </div>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="text-red-400/40 text-[10px] font-mono hover:text-red-400 transition-colors"
          >
            🗑️ Sıfırla
          </button>
        </div>
      </div>

      {/* Daily Chart */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading text-sm md:text-base font-semibold text-white">
              {isViews ? 'Görüntülenme Trendi' : 'Ziyaretçi Trendi'}
            </h3>
            <p className="text-white/30 text-[10px] font-mono mt-0.5">Son 14 gün</p>
          </div>
          <span className={`flex items-center gap-1.5 text-[10px] font-mono ${isViews ? 'text-gold-400' : 'text-blue-400'}`}>
            <span className={`w-2 h-2 rounded-full ${isViews ? 'bg-gold-400' : 'bg-blue-400'}`} />
            {isViews ? 'Görüntüleme' : 'Tekil Ziyaretçi'}
          </span>
        </div>

        {/* Bar Chart */}
        <div className="flex items-end gap-1 md:gap-1.5 h-44 md:h-56">
          {dailyChart.map((day, i) => {
            const value = isViews ? day.views : day.visitors
            const barH = (value / maxChartValue) * 100
            const dateObj = new Date(day.date + 'T12:00:00')
            const dayNum = dateObj.getDate()
            const monthName = dateObj.toLocaleDateString('tr-TR', { month: 'short' })
            const weekDay = dateObj.toLocaleDateString('tr-TR', { weekday: 'short' })
            const isTodayBar = i === dailyChart.length - 1
            const fullDate = `${dayNum} ${monthName}`
            const barColor = isViews ? 'bg-gold-400' : 'bg-blue-400'

            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                {/* Tooltip */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl">
                  <p className="text-white/60 text-[9px] font-mono mb-1">{fullDate} {weekDay}</p>
                  <p className="text-gold-400 text-[11px] font-mono font-semibold">{day.views} görüntüleme</p>
                  <p className="text-blue-400 text-[11px] font-mono">{day.visitors} ziyaretçi</p>
                </div>

                {/* Bar */}
                <div className="w-full flex items-end h-full">
                  <div
                    className={`w-full rounded-t-sm transition-all duration-500 ${isTodayBar ? barColor : `${barColor}/30 group-hover:${barColor}/60`}`}
                    style={{ height: `${Math.max(barH, 3)}%` }}
                  />
                </div>

                {/* Labels */}
                <div className={`text-center ${isTodayBar ? (isViews ? 'text-gold-400' : 'text-blue-400') : 'text-white/25'}`}>
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
            <span className="text-white/20 text-[10px] font-mono px-2 py-1 rounded-full bg-white/[0.04]">{PERIOD_LABELS[activePeriod]}</span>
          </div>

          {activePages.length === 0 ? (
            <p className="text-white/20 text-sm font-mono text-center py-8">Henüz veri yok</p>
          ) : (
            <div className="space-y-2">
              {activePages.map((p, i) => {
                const maxCount = activePages[0]?.count || 1
                const pct = (p.count / maxCount) * 100
                const pageInfo = getPageName(p.page)
                const totalForPct = isViews ? month.views : month.visitors
                const percentage = totalForPct > 0 ? Math.round((p.count / totalForPct) * 100) : 0

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

            {totalDevices <= 1 && Object.keys(activeDevices).length === 0 ? (
              <p className="text-white/20 text-sm font-mono text-center py-4">Henüz veri yok</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(activeDevices).sort((a, b) => b[1] - a[1]).map(([device, count]) => {
                  const pct = Math.round((count / totalDevices) * 100)
                  const Icon = device === 'mobile' ? Smartphone : device === 'tablet' ? Tablet : Monitor
                  const label = device === 'mobile' ? 'Mobil' : device === 'tablet' ? 'Tablet' : 'Masaüstü'
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
                          className="h-full bg-purple-400/60 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* OS Breakdown */}
          {Object.keys(activeOS).length > 0 && (
            <BreakdownPanel
              title="İşletim Sistemi"
              icon="💻"
              data={activeOS}
              nameMap={{ iOS: '📱 iOS (iPhone)', iPadOS: '📱 iPadOS', Android: '🤖 Android', Windows: '🪟 Windows', macOS: '🍎 macOS', Linux: '🐧 Linux', ChromeOS: '💻 ChromeOS', Other: '❓ Diğer', other: '❓ Diğer', 'Diğer': '❓ Diğer' }}
              barColor="bg-blue-400/50"
            />
          )}

          {/* Browser Breakdown */}
          {Object.keys(activeBrowsers).length > 0 && (
            <BreakdownPanel
              title="Tarayıcı"
              icon="🌐"
              data={activeBrowsers}
              nameMap={{ Chrome: '🟢 Chrome', Safari: '🔵 Safari', Firefox: '🟠 Firefox', Edge: '🔷 Edge', Opera: '🔴 Opera', Other: '❓ Diğer', other: '❓ Diğer', 'Diğer': '❓ Diğer' }}
              barColor="bg-gold-400/50"
            />
          )}

          {/* Language Breakdown */}
          {Object.keys(activeLanguages).length > 0 && (
            <BreakdownPanel
              title="Diller"
              icon="🗣️"
              data={activeLanguages}
              nameMap={{ tr: '🇹🇷 Türkçe', en: '🇬🇧 İngilizce', de: '🇩🇪 Almanca', es: '🇪🇸 İspanyolca', ar: '🇸🇦 Arapça', fr: '🇫🇷 Fransızca', ru: '🇷🇺 Rusça', zh: '🇨🇳 Çince', ja: '🇯🇵 Japonca', ko: '🇰🇷 Korece', pt: '🇧🇷 Portekizce', it: '🇮🇹 İtalyanca', nl: '🇳🇱 Felemenkçe', Other: '❓ Diğer', other: '❓ Diğer', 'Diğer': '❓ Diğer' }}
              barColor="bg-cyan-400/50"
            />
          )}

          {/* Referrers */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-green-400" />
                <h3 className="font-heading text-sm font-semibold text-white">Trafik Kaynakları</h3>
              </div>
            </div>

            {activeReferrers.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-white/20 text-xs font-mono">Henüz referans trafiği yok</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeReferrers.map((r, i) => {
                  const maxRef = activeReferrers[0]?.count || 1
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

          {/* Countries */}
          {activeCountries.length > 0 && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-cyan-400" />
                  <h3 className="font-heading text-sm font-semibold text-white">Ülkeler</h3>
                </div>
                <span className="text-white/20 text-[10px] font-mono">top {activeCountries.length}</span>
              </div>
              <div className="space-y-2">
                {activeCountries.map((c, i) => {
                  const maxC = activeCountries[0]?.count || 1
                  const cPct = (c.count / maxC) * 100
                  return (
                    <div key={c.country} className="group relative">
                      <div
                        className="absolute inset-0 rounded-lg bg-cyan-400/[0.04]"
                        style={{ width: `${cPct}%` }}
                      />
                      <div className="relative flex items-center justify-between px-2.5 py-1.5">
                        <span className="text-white/70 text-xs">
                          {COUNTRY_NAMES[c.country] || `🌍 ${c.country}`}
                        </span>
                        <span className="text-cyan-400 font-mono text-xs font-semibold">{c.count}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

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

      {/* Clear Data Confirmation */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowClearConfirm(false)}>
          <div className="bg-[#111] border border-red-500/20 rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-base font-semibold text-white mb-2">⚠️ Tüm Verileri Sıfırla</h3>
            <p className="text-white/40 text-sm mb-2">Tüm ziyaretçi verileri kalıcı olarak silinecek.</p>
            <p className="text-red-400/70 text-xs mb-6">Bu işlem geri alınamaz!</p>
            <div className="flex gap-3">
              <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-2.5 rounded-full border border-white/[0.08] text-white/60 text-sm hover:bg-white/[0.04]">İptal</button>
              <button onClick={handleClearData} disabled={clearing} className="flex-1 py-2.5 rounded-full bg-red-500 text-white text-sm hover:bg-red-600 disabled:opacity-50">
                {clearing ? 'Siliniyor...' : 'Evet, Sıfırla'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Reusable breakdown panel — OS, Browser, Language etc.
function BreakdownPanel({ title, icon, data, nameMap, barColor }: {
  title: string
  icon: string
  data: Record<string, number>
  nameMap: Record<string, string>
  barColor: string
}) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1])
  const total = entries.reduce((sum, [, count]) => sum + count, 0) || 1

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm">{icon}</span>
        <h3 className="font-heading text-sm font-semibold text-white">{title}</h3>
      </div>

      {entries.length === 0 ? (
        <p className="text-white/20 text-sm font-mono text-center py-4">Henüz veri yok</p>
      ) : (
        <div className="space-y-3">
          {entries.map(([key, count]) => {
            const pct = Math.round((count / total) * 100)
            const label = nameMap[key] || key
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white/70 text-xs truncate mr-2">{label}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-white/30 text-[10px] font-mono">{count}</span>
                    <span className="text-white text-xs font-mono font-semibold min-w-[2.5rem] text-right">%{pct}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Single metric card — shows views OR visitors based on active metric
function MetricCard({ icon: Icon, label, views, visitors, color, active, onClick, metric, sub, trend }: {
  icon: typeof Eye
  label: string
  views: number
  visitors: number
  color: string
  active?: boolean
  onClick?: () => void
  metric: Metric
  sub?: string
  trend?: number
}) {
  const value = metric === 'views' ? views : visitors
  const metricLabel = metric === 'views' ? 'görüntülenme' : 'tekil ziyaretçi'
  const metricColor = metric === 'views' ? 'text-white' : 'text-blue-400'

  return (
    <div onClick={onClick} className={`rounded-2xl p-4 transition-all cursor-pointer ${
      active ? 'bg-white/[0.06] border-2 border-gold-400/50 scale-[1.02]' : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05]'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg ${color.replace('text-', 'bg-')}/10 flex items-center justify-center`}>
            <Icon size={14} className={color} />
          </div>
          <span className="text-white/50 text-xs font-mono">{label}</span>
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
      <p className={`font-heading text-2xl md:text-3xl font-bold leading-none ${metricColor}`}>{formatNumber(value)}</p>
      <div className="flex items-center justify-between mt-1.5">
        <p className="text-white/30 text-[10px] font-mono">{metricLabel}</p>
        {sub && <p className="text-white/25 text-[10px] font-mono">{sub}</p>}
      </div>
    </div>
  )
}
