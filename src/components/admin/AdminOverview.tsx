'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, MessageSquare, Loader2, Star, FolderOpen, Users, Eye, Globe, Monitor, Smartphone, Tablet, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface Teklif {
  id: string
  ad_soyad: string
  il: string
  proje_tipi: string
  durum: string
  tas_tercihi: string[]
  kaynak: string | null
  created_at: string
}

const durumRenk: Record<string, string> = {
  'Yeni': 'bg-blue-400/10 text-blue-400',
  'İletişime Geçildi': 'bg-yellow-400/10 text-yellow-400',
  'Teklif Verildi': 'bg-purple-400/10 text-purple-400',
  'Onaylandı': 'bg-green-400/10 text-green-400',
  'Reddedildi': 'bg-red-400/10 text-red-400',
}

const PAGE_LABELS: Record<string, string> = {
  '/': 'Ana Sayfa',
  '/taslar': 'Taşlarımız',
  '/simulasyon': 'Simülasyon',
  '/uygulamalarimiz': 'Uygulamalar',
  '/hakkimizda': 'Hakkımızda',
  '/iletisim': 'İletişim',
  '/teklif': 'Teklif',
  '/blog': 'Blog',
  '/projelerimiz': 'Projeler',
}

const COUNTRY_FLAGS: Record<string, string> = {
  TR: '🇹🇷', DE: '🇩🇪', US: '🇺🇸', GB: '🇬🇧',
  FR: '🇫🇷', ES: '🇪🇸', SA: '🇸🇦', AE: '🇦🇪',
  RU: '🇷🇺', NL: '🇳🇱', IT: '🇮🇹', JP: '🇯🇵',
  CN: '🇨🇳', AU: '🇦🇺', CA: '🇨🇦',
}

const PERIOD_OPTIONS = [
  { value: '7d', label: '7G' },
  { value: '30d', label: '30G' },
  { value: '90d', label: '90G' },
]

interface AnalyticsData {
  overview: { total: number; devices: number; bounceRate: number }
  prevOverview: { total: number; devices: number; bounceRate: number }
  timeseries: { data: { groups: { all: { key: string; total: number; devices: number }[] } } }
  paths: { data: { key: string; total: number; devices: number }[] }
  countries: { data: { key: string; total: number; devices: number }[] }
  devices: { data: { key: string; total: number; devices: number }[] }
  referrers: { data: { key: string; total: number; devices: number }[] }
  period: string
}

function ChangeIndicator({ current, prev }: { current: number; prev: number }) {
  if (prev === 0) return null
  const pct = Math.round(((current - prev) / prev) * 100)
  if (pct === 0) return null
  const up = pct > 0
  return (
    <span className={`flex items-center gap-0.5 text-[10px] font-mono ${up ? 'text-green-400' : 'text-red-400'}`}>
      {up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
      {Math.abs(pct)}%
    </span>
  )
}

function MiniBarChart({ data }: { data: { key: string; total: number; devices: number }[] }) {
  if (!data?.length) return null
  const max = Math.max(...data.map(d => d.total), 1)
  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((d) => (
        <div
          key={d.key}
          className="flex-1 bg-gold-400/40 rounded-sm hover:bg-gold-400/70 transition-colors"
          style={{ height: `${Math.max(4, (d.total / max) * 32)}px` }}
          title={`${d.key}: ${d.total}`}
        />
      ))}
    </div>
  )
}

export default function AdminOverview() {
  const [teklifler, setTeklifler] = useState<Teklif[]>([])
  const [referansCount, setReferansCount] = useState(0)
  const [projectCount, setProjectCount] = useState(0)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loadingTeklifler, setLoadingTeklifler] = useState(true)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)
  const [period, setPeriod] = useState('30d')

  useEffect(() => {
    const pw = localStorage.getItem('admin_pw') || ''
    Promise.all([
      fetch('/api/teklifler', { headers: { 'x-admin-password': pw } }).then(r => r.json()),
      fetch('/api/referanslar').then(r => r.json()),
      fetch('/api/projects').then(r => r.json()),
    ]).then(([tData, rData, pData]) => {
      if (Array.isArray(tData)) setTeklifler(tData)
      if (Array.isArray(rData)) setReferansCount(rData.length)
      if (Array.isArray(pData)) setProjectCount(pData.length)
      setLoadingTeklifler(false)
    }).catch(() => setLoadingTeklifler(false))
  }, [])

  useEffect(() => {
    setLoadingAnalytics(true)
    fetch(`/api/vercel-analytics?period=${period}`)
      .then(r => r.json())
      .then(data => { setAnalytics(data); setLoadingAnalytics(false) })
      .catch(() => setLoadingAnalytics(false))
  }, [period])

  if (loadingTeklifler) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={20} className="animate-spin text-white/30" />
      </div>
    )
  }

  const yeniCount = teklifler.filter(t => t.durum === 'Yeni').length
  const onayCount = teklifler.filter(t => t.durum === 'Onaylandı').length
  const conversionRate = teklifler.length > 0 ? ((onayCount / teklifler.length) * 100).toFixed(1) : '0'

  const recentTeklifler = teklifler.slice(0, 5)

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diffHrs = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60))
    if (diffHrs < 1) return 'Az önce'
    if (diffHrs < 24) return `${diffHrs}s önce`
    const diffDays = Math.floor(diffHrs / 24)
    if (diffDays < 7) return `${diffDays}g önce`
    return d.toLocaleDateString('tr-TR')
  }

  const stats = [
    { label: 'Teklif Talepleri', value: teklifler.length.toString(), change: `${yeniCount} yeni`, icon: MessageSquare, color: 'text-gold-400' },
    { label: 'Onaylanan', value: onayCount.toString(), change: `%${conversionRate}`, icon: TrendingUp, color: 'text-green-400' },
    { label: 'Projeler', value: projectCount.toString(), change: 'kayıtlı', icon: FolderOpen, color: 'text-purple-400' },
    { label: 'Referanslar', value: referansCount.toString(), change: 'aktif', icon: Star, color: 'text-blue-400' },
  ]

  const ov = analytics?.overview
  const prevOv = analytics?.prevOverview
  const timeseriesData = analytics?.timeseries?.data?.groups?.all || []
  const pathsData = analytics?.paths?.data || []
  const countriesData = analytics?.countries?.data || []
  const devicesData = analytics?.devices?.data || []
  const referrersData = analytics?.referrers?.data || []

  const deviceIcon = (name: string) => {
    const n = name?.toLowerCase()
    if (n?.includes('mobile')) return <Smartphone size={12} />
    if (n?.includes('tablet')) return <Tablet size={12} />
    return <Monitor size={12} />
  }

  const maxPaths = pathsData.length > 0 ? Math.max(...pathsData.map(p => p.total)) : 1

  return (
    <div className="space-y-6">
      {/* Teklif İstatistikleri */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon size={18} className={stat.color} />
                <span className="text-white/40 text-[10px] font-mono">{stat.change}</span>
              </div>
              <p className="font-heading text-xl md:text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-white/40 text-[10px] md:text-xs font-mono mt-1 truncate">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Analytics Başlık */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-semibold text-white/60">Site Trafiği</h3>
        <div className="flex gap-1">
          {PERIOD_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1 rounded-lg text-[11px] font-mono transition-all ${
                period === opt.value
                  ? 'bg-gold-400/20 text-gold-400 border border-gold-400/30'
                  : 'text-white/30 hover:text-white/60 border border-white/[0.06]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Kartlar - Özet */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Sayfa Görüntüleme',
            value: loadingAnalytics ? '—' : (ov?.total ?? 0).toLocaleString(),
            icon: Eye,
            color: 'text-gold-400',
            current: ov?.total ?? 0,
            prev: prevOv?.total ?? 0,
          },
          {
            label: 'Tekil Ziyaretçi',
            value: loadingAnalytics ? '—' : (ov?.devices ?? 0).toLocaleString(),
            icon: Users,
            color: 'text-blue-400',
            current: ov?.devices ?? 0,
            prev: prevOv?.devices ?? 0,
          },
          {
            label: 'Ülkeler',
            value: loadingAnalytics ? '—' : countriesData.length.toString(),
            icon: Globe,
            color: 'text-purple-400',
            current: countriesData.length,
            prev: 0,
          },
          {
            label: 'Hemen Çıkma',
            value: loadingAnalytics ? '—' : `%${Math.round((ov?.bounceRate ?? 0) * 100)}`,
            icon: ArrowUpRight,
            color: 'text-orange-400',
            current: 0,
            prev: 0,
          },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon size={18} className={stat.color} />
                {!loadingAnalytics && <ChangeIndicator current={stat.current} prev={stat.prev} />}
              </div>
              {loadingAnalytics ? (
                <div className="h-7 w-12 bg-white/[0.05] rounded animate-pulse mt-1" />
              ) : (
                <p className="font-heading text-xl md:text-2xl font-bold text-white">{stat.value}</p>
              )}
              <p className="text-white/40 text-[10px] md:text-xs font-mono mt-1 truncate">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Grafik + İçerik */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

        {/* Sol: Timeseries + Sayfa Görüntüleme */}
        <div className="lg:col-span-2 space-y-4">
          {/* Timeseries Mini Chart */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-sm md:text-base font-semibold text-white">Ziyaret Grafiği</h3>
              {!loadingAnalytics && ov && (
                <span className="text-white/30 text-[10px] font-mono">{ov.total} toplam görüntüleme</span>
              )}
            </div>
            {loadingAnalytics ? (
              <div className="h-16 bg-white/[0.03] rounded animate-pulse" />
            ) : timeseriesData.length > 0 ? (
              <div className="flex items-end gap-0.5 h-16">
                {timeseriesData.filter(d => d.total >= 0).map((d) => {
                  const maxV = Math.max(...timeseriesData.map(x => x.total), 1)
                  return (
                    <div
                      key={d.key}
                      className="flex-1 bg-gold-400/30 hover:bg-gold-400/60 rounded-sm transition-colors cursor-default"
                      style={{ height: `${Math.max(2, (d.total / maxV) * 64)}px` }}
                      title={`${d.key.slice(5)}: ${d.total}`}
                    />
                  )
                })}
              </div>
            ) : (
              <p className="text-white/20 text-sm font-mono text-center py-4">Henüz veri yok</p>
            )}
          </div>

          {/* En Çok Ziyaret Edilen Sayfalar */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-6">
            <h3 className="font-heading text-sm md:text-base font-semibold text-white mb-4">En Çok Ziyaret Edilen Sayfalar</h3>
            {loadingAnalytics ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 bg-white/[0.03] rounded animate-pulse" />
                ))}
              </div>
            ) : pathsData.length === 0 ? (
              <p className="text-white/20 text-sm font-mono text-center py-4">Henüz veri yok</p>
            ) : (
              <div className="space-y-2">
                {pathsData.map(p => (
                  <div key={p.key} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/70 text-xs font-mono truncate">
                          {PAGE_LABELS[p.key] || p.key}
                        </span>
                        <span className="text-white text-xs font-mono ml-2 shrink-0">{p.total}</span>
                      </div>
                      <div className="h-1 bg-white/[0.05] rounded-full">
                        <div
                          className="h-1 bg-gold-400/60 rounded-full transition-all"
                          style={{ width: `${(p.total / maxPaths) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Son Teklif Talepleri */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-6 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-sm md:text-base font-semibold text-white">Son Teklif Talepleri</h3>
              <span className="text-white/30 text-[10px] font-mono">{teklifler.length} toplam</span>
            </div>
            {recentTeklifler.length === 0 ? (
              <p className="text-white/20 text-sm font-mono text-center py-8">Henüz teklif talebi yok</p>
            ) : (
              <div className="space-y-3">
                {recentTeklifler.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{t.ad_soyad}</p>
                      <p className="text-white/40 text-xs font-mono">{t.il} · {t.proje_tipi}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono ${durumRenk[t.durum] || 'bg-white/10 text-white/40'}`}>
                        {t.durum}
                      </span>
                      <span className="text-white/30 text-[10px] font-mono hidden sm:block">{formatDate(t.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sağ: Ülkeler + Cihazlar + Kaynaklar */}
        <div className="space-y-4">
          {/* Ülkeler */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-6">
            <h3 className="font-heading text-sm font-semibold text-white mb-4">Ülkeler</h3>
            {loadingAnalytics ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-6 bg-white/[0.03] rounded animate-pulse" />)}
              </div>
            ) : countriesData.length === 0 ? (
              <p className="text-white/20 text-xs font-mono text-center py-3">Veri yok</p>
            ) : (
              <div className="space-y-2.5">
                {countriesData.map(c => (
                  <div key={c.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">{COUNTRY_FLAGS[c.key] || '🌐'}</span>
                      <span className="text-white/60 text-xs font-mono">{c.key}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-white/[0.05] rounded-full">
                        <div
                          className="h-1 bg-blue-400/50 rounded-full"
                          style={{ width: `${(c.total / (countriesData[0]?.total || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-white text-xs font-mono w-6 text-right">{c.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cihazlar */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-6">
            <h3 className="font-heading text-sm font-semibold text-white mb-4">Cihaz Türleri</h3>
            {loadingAnalytics ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-6 bg-white/[0.03] rounded animate-pulse" />)}
              </div>
            ) : devicesData.length === 0 ? (
              <p className="text-white/20 text-xs font-mono text-center py-3">Veri yok</p>
            ) : (
              <div className="space-y-2.5">
                {devicesData.map(d => {
                  const total = devicesData.reduce((s, x) => s + x.total, 0)
                  const pct = total > 0 ? Math.round((d.total / total) * 100) : 0
                  return (
                    <div key={d.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white/60">
                        {deviceIcon(d.key)}
                        <span className="text-xs font-mono capitalize">{d.key?.toLowerCase() || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-white/[0.05] rounded-full">
                          <div
                            className="h-1 bg-purple-400/50 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-white/60 text-[10px] font-mono w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Trafik Kaynakları */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-6">
            <h3 className="font-heading text-sm font-semibold text-white mb-4">Trafik Kaynakları</h3>
            {loadingAnalytics ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-6 bg-white/[0.03] rounded animate-pulse" />)}
              </div>
            ) : referrersData.length === 0 ? (
              <p className="text-white/20 text-xs font-mono text-center py-3">Veri yok</p>
            ) : (
              <div className="space-y-2.5">
                {referrersData.map(r => (
                  <div key={r.key} className="flex items-center justify-between">
                    <span className="text-white/60 text-xs font-mono truncate max-w-[120px]">
                      {r.key || 'Direkt'}
                    </span>
                    <span className="text-white text-xs font-mono">{r.total}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mini Bar Chart - Ülke dağılımı */}
          {!loadingAnalytics && countriesData.length > 0 && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
              <p className="text-white/30 text-[10px] font-mono mb-3">Ülke dağılımı (görüntüleme)</p>
              <MiniBarChart data={countriesData} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
