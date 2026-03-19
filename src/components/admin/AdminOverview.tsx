'use client'

import { TrendingUp, Users, FileText, Eye, MessageSquare, Gem } from 'lucide-react'

const stats = [
  { label: 'Toplam Ziyaretçi', value: '2.847', change: '+12%', icon: Users, color: 'text-blue-400' },
  { label: 'Sayfa Görüntüleme', value: '8.432', change: '+8%', icon: Eye, color: 'text-purple-400' },
  { label: 'Teklif Talepleri', value: '24', change: '+3', icon: MessageSquare, color: 'text-gold-400' },
  { label: 'Dönüşüm Oranı', value: '%2.4', change: '+0.3%', icon: TrendingUp, color: 'text-green-400' },
]

const recentTeklifler = [
  { id: 1, ad: 'Mehmet Yılmaz', il: 'İzmir', tip: 'Cephe Kaplama', tarih: '2 saat önce', durum: 'Yeni' },
  { id: 2, ad: 'Ayşe Kara', il: 'İstanbul', tip: 'İç Mekan', tarih: '5 saat önce', durum: 'İletişime Geçildi' },
  { id: 3, ad: 'Ali Demir', il: 'Ankara', tip: 'Zemin Döşeme', tarih: '1 gün önce', durum: 'Teklif Verildi' },
  { id: 4, ad: 'Fatma Öz', il: 'Muğla', tip: 'Bahçe & Peyzaj', tarih: '2 gün önce', durum: 'Onaylandı' },
]

const popularTaslar = [
  { name: 'Traverten', views: 342, teklifler: 8 },
  { name: 'Mermer', views: 287, teklifler: 6 },
  { name: 'Bazalt', views: 198, teklifler: 4 },
  { name: 'Granit', views: 156, teklifler: 3 },
]

const durumRenk: Record<string, string> = {
  'Yeni': 'bg-blue-400/10 text-blue-400',
  'İletişime Geçildi': 'bg-yellow-400/10 text-yellow-400',
  'Teklif Verildi': 'bg-purple-400/10 text-purple-400',
  'Onaylandı': 'bg-green-400/10 text-green-400',
  'Reddedildi': 'bg-red-400/10 text-red-400',
}

export default function AdminOverview() {
  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <Icon size={20} className={stat.color} />
                <span className="text-green-400 text-xs font-mono">{stat.change}</span>
              </div>
              <p className="font-heading text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-white/40 text-xs font-mono mt-1">{stat.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Son Teklif Talepleri */}
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading text-base font-semibold text-white">Son Teklif Talepleri</h3>
            <span className="text-white/30 text-xs font-mono">Son 7 gün</span>
          </div>

          <div className="space-y-3">
            {recentTeklifler.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{t.ad}</p>
                  <p className="text-white/40 text-xs font-mono">{t.il} · {t.tip}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono ${durumRenk[t.durum]}`}>
                    {t.durum}
                  </span>
                  <span className="text-white/30 text-[10px] font-mono hidden sm:block">{t.tarih}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popüler Taşlar */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading text-base font-semibold text-white">Popüler Taşlar</h3>
            <Gem size={16} className="text-gold-400" />
          </div>

          <div className="space-y-4">
            {popularTaslar.map((tas, i) => (
              <div key={tas.name} className="flex items-center gap-3">
                <span className="font-heading text-lg font-bold text-white/20 w-6">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-white text-sm">{tas.name}</p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-white/30 text-[10px] font-mono">{tas.views} görüntüleme</span>
                    <span className="text-gold-400/60 text-[10px] font-mono">{tas.teklifler} teklif</span>
                  </div>
                </div>
                <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold-400/60 rounded-full"
                    style={{ width: `${(tas.views / 342) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
