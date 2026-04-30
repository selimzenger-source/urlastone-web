'use client'

import { useState, useEffect } from 'react'
import { Eye, Users, Globe, Monitor, Smartphone, Tablet, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react'

const PAGE_LABELS: Record<string, string> = {
  '/': 'Ana Sayfa',
  '/urunlerimiz': 'Ürünlerimiz',
  '/taslar': 'Taşlarımız',
  '/simulasyon': 'Simülasyon',
  '/projelerimiz': 'Projeler',
  '/uygulamalarimiz': 'Uygulamalar',
  '/hakkimizda': 'Hakkımızda',
  '/iletisim': 'İletişim',
  '/teklif': 'Teklif',
  '/blog': 'Blog',
}

const COUNTRY_FLAGS: Record<string, string> = {
  TR: '🇹🇷', DE: '🇩🇪', US: '🇺🇸', GB: '🇬🇧',
  FR: '🇫🇷', ES: '🇪🇸', SA: '🇸🇦', AE: '🇦🇪',
  RU: '🇷🇺', NL: '🇳🇱', IT: '🇮🇹', JP: '🇯🇵',
  CN: '🇨🇳', AU: '🇦🇺', CA: '🇨🇦', KW: '🇰🇼',
  QA: '🇶🇦', IN: '🇮🇳', BR: '🇧🇷', PL: '🇵🇱',
  AT: '🇦🇹', SE: '🇸🇪', NO: '🇳🇴', DK: '🇩🇰',
  CH: '🇨🇭', BE: '🇧🇪', GR: '🇬🇷', PT: '🇵🇹',
  MX: '🇲🇽', AR: '🇦🇷', ZA: '🇿🇦', SG: '🇸🇬',
  UA: '🇺🇦', RO: '🇷🇴', CZ: '🇨🇿', HU: '🇭🇺',
  IL: '🇮🇱', IR: '🇮🇷', PK: '🇵🇰', BD: '🇧🇩',
}

const COUNTRY_NAMES: Record<string, string> = {
  TR: 'Türkiye', DE: 'Almanya', US: 'Amerika Birleşik Devletleri', GB: 'Birleşik Krallık',
  FR: 'Fransa', ES: 'İspanya', SA: 'Suudi Arabistan', AE: 'Birleşik Arap Emirlikleri',
  RU: 'Rusya', NL: 'Hollanda', IT: 'İtalya', JP: 'Japonya',
  CN: 'Çin', AU: 'Avustralya', CA: 'Kanada', KW: 'Kuveyt',
  QA: 'Katar', IN: 'Hindistan', BR: 'Brezilya', PL: 'Polonya',
  AT: 'Avusturya', SE: 'İsveç', NO: 'Norveç', DK: 'Danimarka',
  CH: 'İsviçre', BE: 'Belçika', GR: 'Yunanistan', PT: 'Portekiz',
  MX: 'Meksika', AR: 'Arjantin', ZA: 'Güney Afrika', SG: 'Singapur',
  UA: 'Ukrayna', RO: 'Romanya', CZ: 'Çekya', HU: 'Macaristan',
  IL: 'İsrail', IR: 'İran', PK: 'Pakistan', BD: 'Bangladeş',
}

const PERIOD_OPTIONS = [
  { value: '1d', label: 'Son 24 Saat' },
  { value: '7d', label: 'Son 7 Gün' },
  { value: '30d', label: 'Son 30 Gün' },
  { value: '90d', label: 'Son 90 Gün' },
]

interface AnalyticsData {
  overview: { total: number; devices: number; bounceRate: number }
  prevOverview: { total: number; devices: number; bounceRate: number }
  timeseries: { data: { groups: { all: { key: string; total: number; devices: number }[] } } }
  paths: { data: { key: string; total: number; devices: number }[] }
  countries: { data: { key: string; total: number; devices: number }[] }
  devices: { data: { key: string; total: number; devices: number }[] }
  referrers: { data: { key: string; total: number; devices: number }[] }
}

function ChangeIndicator({ current, prev, reverseColor = false }: { current: number; prev: number; reverseColor?: boolean }) {
  if (prev === 0) return null
  const pct = Math.round(((current - prev) / prev) * 100)
  if (pct === 0) return null
  const up = pct > 0
  // reverseColor: bounce rate'de artış kötü, azalış iyi
  const isGood = reverseColor ? !up : up
  return (
    <span className={`flex items-center gap-0.5 text-[10px] font-mono ${isGood ? 'text-green-400' : 'text-red-400'}`}>
      {up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
      {Math.abs(pct)}%
    </span>
  )
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7d')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/vercel-analytics?period=${period}`)
      .then(r => r.json())
      .then(data => { setAnalytics(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [period])

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={20} className="animate-spin text-white/30" />
      </div>
    )
  }

  const ov = analytics?.overview
  const prevOv = analytics?.prevOverview
  const timeseriesData = analytics?.timeseries?.data?.groups?.all || []
  const pathsData = analytics?.paths?.data || []
  const countriesData = analytics?.countries?.data || []
  const devicesData = analytics?.devices?.data || []
  const referrersData = analytics?.referrers?.data || []
  const maxPaths = pathsData.length > 0 ? Math.max(...pathsData.map(p => p.total)) : 1

  const deviceIcon = (name: string) => {
    const n = name?.toLowerCase()
    if (n?.includes('mobile')) return <Smartphone size={14} />
    if (n?.includes('tablet')) return <Tablet size={14} />
    return <Monitor size={14} />
  }

  return (
    <div className="space-y-6">
      {/* Dönem Seçici */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
          <span className="text-white/30 text-xs font-mono">{loading ? 'Yükleniyor...' : 'Vercel Analytics'}</span>
        </div>
        <div className="flex gap-1">
          {PERIOD_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
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

      {/* Özet Kartlar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Sayfa Görüntüleme', value: (ov?.total ?? 0).toLocaleString(), icon: Eye, color: 'text-gold-400', current: ov?.total ?? 0, prev: prevOv?.total ?? 0 },
          { label: 'Tekil Ziyaretçi', value: (ov?.devices ?? 0).toLocaleString(), icon: Users, color: 'text-blue-400', current: ov?.devices ?? 0, prev: prevOv?.devices ?? 0 },
          { label: 'Ülkeler', value: countriesData.length.toString(), icon: Globe, color: 'text-purple-400', current: 0, prev: 0, reverseColor: false },
          { label: 'Hemen Çıkma', value: `%${Math.round(ov?.bounceRate ?? 0)}`, icon: ArrowUpRight, color: 'text-orange-400', current: ov?.bounceRate ?? 0, prev: prevOv?.bounceRate ?? 0, reverseColor: true },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <Icon size={20} className={stat.color} />
                <ChangeIndicator current={stat.current} prev={stat.prev} reverseColor={stat.reverseColor} />
              </div>
              <p className="font-heading text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-white/40 text-xs font-mono mt-1">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Ziyaret Grafiği */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 md:p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading text-base font-semibold text-white">Günlük Ziyaretler</h3>
          {ov && <span className="text-white/30 text-xs font-mono">{ov.total} toplam</span>}
        </div>
        {timeseriesData.length > 0 ? (
          <div>
            <div className="flex items-end gap-[2px] h-32">
              {timeseriesData.map((d) => {
                const maxV = Math.max(...timeseriesData.map(x => x.total), 1)
                const h = Math.max(2, (d.total / maxV) * 128)
                return (
                  <div key={d.key} className="flex-1 group relative">
                    <div
                      className="w-full bg-gold-400/30 hover:bg-gold-400/60 rounded-sm transition-colors cursor-default"
                      style={{ height: `${h}px` }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-2 py-1 text-[10px] font-mono text-white whitespace-nowrap">
                        {d.key.slice(5)} — {d.total} görüntüleme
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-2 px-1">
              <span className="text-white/20 text-[9px] font-mono">{timeseriesData[0]?.key?.slice(5)}</span>
              <span className="text-white/20 text-[9px] font-mono">{timeseriesData[timeseriesData.length - 1]?.key?.slice(5)}</span>
            </div>
          </div>
        ) : (
          <p className="text-white/20 text-sm font-mono text-center py-8">Henüz veri yok</p>
        )}
      </div>

      {/* Sayfalar + Ülkeler + Cihazlar + Kaynaklar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Sayfalar */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 md:p-6">
          <h3 className="font-heading text-base font-semibold text-white mb-5">En Çok Ziyaret Edilen Sayfalar</h3>
          {pathsData.length === 0 ? (
            <p className="text-white/20 text-sm font-mono text-center py-6">Veri yok</p>
          ) : (
            <div className="space-y-3">
              {pathsData.map((p, i) => (
                <div key={p.key} className="flex items-center gap-3">
                  <span className="text-white/20 text-xs font-mono w-4 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-white/70 text-sm truncate">{PAGE_LABELS[p.key] || p.key}</span>
                      <div className="flex items-center gap-2 ml-3 shrink-0">
                        <span className="text-white font-mono text-sm">{p.total}</span>
                        <span className="text-white/30 text-[10px] font-mono">{p.devices} kişi</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/[0.05] rounded-full">
                      <div className="h-1.5 bg-gold-400/50 rounded-full transition-all" style={{ width: `${(p.total / maxPaths) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ülkeler */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 md:p-6">
          <h3 className="font-heading text-base font-semibold text-white mb-5">Ülke Dağılımı</h3>
          {countriesData.length === 0 ? (
            <p className="text-white/20 text-sm font-mono text-center py-6">Veri yok</p>
          ) : (
            <div className="space-y-3">
              {countriesData.map(c => {
                const total = countriesData.reduce((s, x) => s + x.total, 0)
                const pct = total > 0 ? Math.round((c.total / total) * 100) : 0
                return (
                  <div key={c.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl leading-none">{COUNTRY_FLAGS[c.key] || '🌐'}</span>
                      <span className="text-white/60 text-sm">{COUNTRY_NAMES[c.key] || c.key}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-white/[0.05] rounded-full">
                        <div className="h-1.5 bg-blue-400/50 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-white font-mono text-sm w-8 text-right">{c.total}</span>
                      <span className="text-white/30 text-[10px] font-mono w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Cihazlar */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 md:p-6">
          <h3 className="font-heading text-base font-semibold text-white mb-5">Cihaz Türleri</h3>
          {devicesData.length === 0 ? (
            <p className="text-white/20 text-sm font-mono text-center py-6">Veri yok</p>
          ) : (
            <div className="space-y-4">
              {devicesData.map(d => {
                const total = devicesData.reduce((s, x) => s + x.total, 0)
                const pct = total > 0 ? Math.round((d.total / total) * 100) : 0
                return (
                  <div key={d.key}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-white/70">
                        {deviceIcon(d.key)}
                        <span className="text-sm font-mono capitalize">{d.key?.toLowerCase() || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-mono text-sm">{d.total}</span>
                        <span className="text-white/30 text-[10px] font-mono">({pct}%)</span>
                      </div>
                    </div>
                    <div className="h-2 bg-white/[0.05] rounded-full">
                      <div className="h-2 bg-purple-400/50 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Kaynaklar */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 md:p-6">
          <h3 className="font-heading text-base font-semibold text-white mb-5">Trafik Kaynakları</h3>
          {referrersData.length === 0 ? (
            <p className="text-white/20 text-sm font-mono text-center py-6">Direkt ziyaretler</p>
          ) : (
            <div className="space-y-3">
              {referrersData.map(r => {
                const maxRef = referrersData[0]?.total || 1
                return (
                  <div key={r.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-white/60 text-sm font-mono truncate max-w-[200px]">{r.key || 'Direkt'}</span>
                      <span className="text-white font-mono text-sm ml-2">{r.total}</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.05] rounded-full">
                      <div className="h-1.5 bg-green-400/40 rounded-full" style={{ width: `${(r.total / maxRef) * 100}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
