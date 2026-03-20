'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Users, Eye, MessageSquare, Gem, Loader2, Star, FolderOpen } from 'lucide-react'

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

export default function AdminOverview() {
  const [teklifler, setTeklifler] = useState<Teklif[]>([])
  const [loading, setLoading] = useState(true)
  const [referansCount, setReferansCount] = useState(0)
  const [projectCount, setProjectCount] = useState(0)

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
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={20} className="animate-spin text-white/30" />
      </div>
    )
  }

  const yeniCount = teklifler.filter(t => t.durum === 'Yeni').length
  const onayCount = teklifler.filter(t => t.durum === 'Onaylandı').length
  const conversionRate = teklifler.length > 0 ? ((onayCount / teklifler.length) * 100).toFixed(1) : '0'

  // Count stone preferences across all teklifler
  const tasCounts: Record<string, number> = {}
  teklifler.forEach(t => {
    t.tas_tercihi?.forEach(tas => {
      tasCounts[tas] = (tasCounts[tas] || 0) + 1
    })
  })
  const popularTaslar = Object.entries(tasCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
  const maxTasCount = popularTaslar.length > 0 ? popularTaslar[0][1] : 1

  // Count sources
  const kaynakCounts: Record<string, number> = {}
  teklifler.forEach(t => {
    if (t.kaynak) kaynakCounts[t.kaynak] = (kaynakCounts[t.kaynak] || 0) + 1
  })

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHrs < 1) return 'Az önce'
    if (diffHrs < 24) return `${diffHrs} saat önce`
    const diffDays = Math.floor(diffHrs / 24)
    if (diffDays < 7) return `${diffDays} gün önce`
    return d.toLocaleDateString('tr-TR')
  }

  const recentTeklifler = teklifler.slice(0, 5)

  const stats = [
    { label: 'Teklif Talepleri', value: teklifler.length.toString(), change: `${yeniCount} yeni`, icon: MessageSquare, color: 'text-gold-400' },
    { label: 'Onaylanan', value: onayCount.toString(), change: `%${conversionRate}`, icon: TrendingUp, color: 'text-green-400' },
    { label: 'Projeler', value: projectCount.toString(), change: 'kayıtlı', icon: FolderOpen, color: 'text-purple-400' },
    { label: 'Referanslar', value: referansCount.toString(), change: 'aktif', icon: Star, color: 'text-blue-400' },
  ]

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Son Teklif Talepleri */}
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-6 min-w-0">
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

        {/* Sidebar Stats */}
        <div className="space-y-6">
          {/* Popüler Taşlar */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-base font-semibold text-white">Popüler Taşlar</h3>
              <Gem size={16} className="text-gold-400" />
            </div>

            {popularTaslar.length === 0 ? (
              <p className="text-white/20 text-sm font-mono text-center py-4">Veri yok</p>
            ) : (
              <div className="space-y-4">
                {popularTaslar.map(([name, count], i) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="font-heading text-lg font-bold text-white/20 w-6">{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-white text-sm">{name}</p>
                      <span className="text-gold-400/60 text-[10px] font-mono">{count} teklif</span>
                    </div>
                    <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold-400/60 rounded-full"
                        style={{ width: `${(count / maxTasCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Kaynak Dağılımı */}
          {Object.keys(kaynakCounts).length > 0 && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
              <h3 className="font-heading text-base font-semibold text-white mb-4">Ziyaretçi Kaynağı</h3>
              <div className="space-y-3">
                {Object.entries(kaynakCounts).sort((a, b) => b[1] - a[1]).map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">{name}</span>
                    <span className="text-white font-mono text-sm">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
