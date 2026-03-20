'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Users, Eye, Smartphone, Monitor, Globe, TrendingUp, Loader2, ArrowUp, ArrowDown } from 'lucide-react'

interface AnalyticsData {
  today: { views: number; visitors: number }
  week: { views: number; visitors: number }
  month: { views: number; visitors: number }
  total: number
  topPages: { page: string; count: number }[]
  devices: Record<string, number>
  topReferrers: { source: string; count: number }[]
  dailyChart: { date: string; views: number; visitors: number }[]
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

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const pw = localStorage.getItem('admin_pw') || ''
    fetch('/api/analytics', { headers: { 'x-admin-password': pw } })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={20} className="animate-spin text-white/30" />
      </div>
    )
  }

  if (!data || !data.today) {
    return <p className="text-white/40 text-center py-10">Veri yüklenemedi</p>
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

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Eye}
          label="Bugün"
          value={today.views.toString()}
          sub={`${today.visitors} tekil`}
          color="text-gold-400"
        />
        <StatCard
          icon={Users}
          label="Bu Hafta"
          value={week.views.toString()}
          sub={`${week.visitors} tekil`}
          color="text-blue-400"
        />
        <StatCard
          icon={BarChart3}
          label="Bu Ay"
          value={month.views.toString()}
          sub={`${month.visitors} tekil`}
          color="text-purple-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Toplam"
          value={data.total.toString()}
          sub={weekChange >= 0 ? `+%${weekChange} haftalık` : `%${weekChange} haftalık`}
          color="text-green-400"
          trend={weekChange}
        />
      </div>

      {/* Daily Chart */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading text-sm md:text-base font-semibold text-white">Son 14 Gün</h3>
          <div className="flex items-center gap-4 text-[10px] font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gold-400" /> Görüntüleme
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" /> Tekil Ziyaretçi
            </span>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="flex items-end gap-1 md:gap-2 h-40 md:h-52">
          {dailyChart.map((day, i) => {
            const viewH = (day.views / maxChartViews) * 100
            const visitorH = (day.visitors / maxChartViews) * 100
            const dateObj = new Date(day.date)
            const dayLabel = dateObj.toLocaleDateString('tr-TR', { day: 'numeric' })
            const weekDay = dateObj.toLocaleDateString('tr-TR', { weekday: 'short' })
            const isToday = i === dailyChart.length - 1

            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-white/10 rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  <p className="text-white text-[10px] font-mono">{day.views} görüntüleme</p>
                  <p className="text-blue-400 text-[10px] font-mono">{day.visitors} ziyaretçi</p>
                </div>

                {/* Bars */}
                <div className="w-full flex gap-px items-end h-full">
                  <div
                    className={`flex-1 rounded-t transition-all duration-300 ${isToday ? 'bg-gold-400' : 'bg-gold-400/40'}`}
                    style={{ height: `${Math.max(viewH, 2)}%` }}
                  />
                  <div
                    className={`flex-1 rounded-t transition-all duration-300 ${isToday ? 'bg-blue-400' : 'bg-blue-400/40'}`}
                    style={{ height: `${Math.max(visitorH, 2)}%` }}
                  />
                </div>

                {/* Labels */}
                <span className={`text-[8px] md:text-[10px] font-mono ${isToday ? 'text-gold-400' : 'text-white/30'}`}>
                  <span className="hidden md:inline">{weekDay}</span>
                  <span className="md:hidden">{dayLabel}</span>
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Top Pages */}
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-sm md:text-base font-semibold text-white">En Çok Ziyaret Edilen Sayfalar</h3>
            <span className="text-white/30 text-[10px] font-mono">bu ay</span>
          </div>

          {topPages.length === 0 ? (
            <p className="text-white/20 text-sm font-mono text-center py-8">Henüz veri yok</p>
          ) : (
            <div className="space-y-3">
              {topPages.map((p, i) => {
                const maxCount = topPages[0]?.count || 1
                const pct = (p.count / maxCount) * 100
                return (
                  <div key={p.page} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-sm font-bold text-white/20 w-5">{i + 1}</span>
                        <span className="text-white text-sm">{PAGE_NAMES[p.page] || p.page}</span>
                        <span className="text-white/20 text-[10px] font-mono hidden sm:inline">{p.page}</span>
                      </div>
                      <span className="text-gold-400 text-sm font-mono font-semibold">{p.count}</span>
                    </div>
                    <div className="ml-7 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-gold-400/60 to-gold-400/30 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 md:space-y-6">
          {/* Device Breakdown */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-6">
            <h3 className="font-heading text-sm md:text-base font-semibold text-white mb-4">Cihaz Dağılımı</h3>

            {totalDevices <= 1 && Object.keys(devices).length === 0 ? (
              <p className="text-white/20 text-sm font-mono text-center py-4">Henüz veri yok</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(devices).sort((a, b) => b[1] - a[1]).map(([device, count]) => {
                  const pct = Math.round((count / totalDevices) * 100)
                  const Icon = device === 'mobile' ? Smartphone : Monitor
                  const label = device === 'mobile' ? 'Mobil' : device === 'tablet' ? 'Tablet' : 'Masaüstü'
                  return (
                    <div key={device} className="flex items-center gap-3">
                      <Icon size={14} className="text-white/40" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white/70 text-xs">{label}</span>
                          <span className="text-white text-xs font-mono">%{pct}</span>
                        </div>
                        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-400/60 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Referrers */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-sm md:text-base font-semibold text-white">Trafik Kaynakları</h3>
              <Globe size={14} className="text-green-400" />
            </div>

            {topReferrers.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-white/20 text-sm font-mono">Henüz veri yok</p>
                <p className="text-white/10 text-[10px] font-mono mt-1">Direkt ziyaretler burada görünmez</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {topReferrers.map(r => (
                  <div key={r.source} className="flex items-center justify-between">
                    <span className="text-white/60 text-xs truncate max-w-[140px]">{r.source}</span>
                    <span className="text-white font-mono text-xs">{r.count}</span>
                  </div>
                ))}
              </div>
            )}
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
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <Icon size={18} className={color} />
        {trend !== undefined ? (
          <span className={`flex items-center gap-0.5 text-[10px] font-mono ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
            {sub}
          </span>
        ) : (
          <span className="text-white/40 text-[10px] font-mono">{sub}</span>
        )}
      </div>
      <p className="font-heading text-xl md:text-2xl font-bold text-white">{value}</p>
      <p className="text-white/40 text-[10px] md:text-xs font-mono mt-1">{label}</p>
    </div>
  )
}
