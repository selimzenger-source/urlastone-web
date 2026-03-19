'use client'

import { useState } from 'react'
import {
  Search,
  Filter,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Image as ImageIcon,
  X,
  Eye,
} from 'lucide-react'

type Durum = 'Yeni' | 'İletişime Geçildi' | 'Teklif Verildi' | 'Onaylandı' | 'Reddedildi'

interface Teklif {
  id: number
  ad: string
  telefon: string
  email: string
  il: string
  ilce: string
  projeTipi: string
  metrekare: string
  taslar: string[]
  aciklama: string
  kaynak: string
  tarih: string
  durum: Durum
  fotograflar: number
}

const mockTeklifler: Teklif[] = [
  {
    id: 1, ad: 'Mehmet Yılmaz', telefon: '0532 111 22 33', email: 'mehmet@email.com',
    il: 'İzmir', ilce: 'Urla', projeTipi: 'Cephe Kaplama', metrekare: '50-100 m²',
    taslar: ['Traverten', 'Mermer'], aciklama: 'Villa cephesi için doğal taş kaplama istiyorum.',
    kaynak: 'Google', tarih: '2026-03-19', durum: 'Yeni', fotograflar: 3,
  },
  {
    id: 2, ad: 'Ayşe Kara', telefon: '0544 222 33 44', email: 'ayse@email.com',
    il: 'İstanbul', ilce: 'Kadıköy', projeTipi: 'İç Mekan', metrekare: '20-50 m²',
    taslar: ['Mermer'], aciklama: 'Banyo ve mutfak tezgahı için mermer arıyorum.',
    kaynak: 'Instagram', tarih: '2026-03-18', durum: 'İletişime Geçildi', fotograflar: 1,
  },
  {
    id: 3, ad: 'Ali Demir', telefon: '0555 333 44 55', email: 'ali@email.com',
    il: 'Ankara', ilce: 'Çankaya', projeTipi: 'Zemin Döşeme', metrekare: '100-200 m²',
    taslar: ['Bazalt', 'Granit'], aciklama: 'Ofis zemin döşemesi yapılacak.',
    kaynak: 'Referans', tarih: '2026-03-17', durum: 'Teklif Verildi', fotograflar: 0,
  },
  {
    id: 4, ad: 'Fatma Öz', telefon: '0533 444 55 66', email: 'fatma@email.com',
    il: 'Muğla', ilce: 'Bodrum', projeTipi: 'Bahçe & Peyzaj', metrekare: '200+ m²',
    taslar: ['Traverten', 'Bazalt'], aciklama: 'Bahçe yürüyüş yolları ve havuz çevresi.',
    kaynak: 'Google', tarih: '2026-03-15', durum: 'Onaylandı', fotograflar: 5,
  },
  {
    id: 5, ad: 'Hasan Çelik', telefon: '0542 555 66 77', email: 'hasan@email.com',
    il: 'İzmir', ilce: 'Çeşme', projeTipi: 'Cephe Kaplama', metrekare: '100-200 m²',
    taslar: ['Granit'], aciklama: 'Otel cephesi yenileme projesi.',
    kaynak: 'Google', tarih: '2026-03-14', durum: 'Reddedildi', fotograflar: 2,
  },
]

const durumRenk: Record<Durum, string> = {
  'Yeni': 'bg-blue-400/10 text-blue-400',
  'İletişime Geçildi': 'bg-yellow-400/10 text-yellow-400',
  'Teklif Verildi': 'bg-purple-400/10 text-purple-400',
  'Onaylandı': 'bg-green-400/10 text-green-400',
  'Reddedildi': 'bg-red-400/10 text-red-400',
}

const durumlar: Durum[] = ['Yeni', 'İletişime Geçildi', 'Teklif Verildi', 'Onaylandı', 'Reddedildi']

export default function AdminTeklifler() {
  const [teklifler, setTeklifler] = useState(mockTeklifler)
  const [search, setSearch] = useState('')
  const [filterDurum, setFilterDurum] = useState<Durum | 'Tümü'>('Tümü')
  const [selectedTeklif, setSelectedTeklif] = useState<Teklif | null>(null)
  const [showFilter, setShowFilter] = useState(false)

  const filtered = teklifler.filter((t) => {
    const matchSearch =
      t.ad.toLowerCase().includes(search.toLowerCase()) ||
      t.il.toLowerCase().includes(search.toLowerCase()) ||
      t.projeTipi.toLowerCase().includes(search.toLowerCase())
    const matchDurum = filterDurum === 'Tümü' || t.durum === filterDurum
    return matchSearch && matchDurum
  })

  const updateDurum = (id: number, yeniDurum: Durum) => {
    setTeklifler((prev) =>
      prev.map((t) => (t.id === id ? { ...t, durum: yeniDurum } : t))
    )
    if (selectedTeklif?.id === id) {
      setSelectedTeklif((prev) => prev ? { ...prev, durum: yeniDurum } : null)
    }
  }

  const durumCounts = durumlar.reduce((acc, d) => {
    acc[d] = teklifler.filter((t) => t.durum === d).length
    return acc
  }, {} as Record<Durum, number>)

  return (
    <div className="space-y-6">
      {/* Status chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterDurum('Tümü')}
          className={`px-4 py-2 rounded-full text-xs font-mono transition-all ${
            filterDurum === 'Tümü'
              ? 'bg-white/10 text-white'
              : 'bg-white/[0.03] text-white/40 hover:text-white/60'
          }`}
        >
          Tümü ({teklifler.length})
        </button>
        {durumlar.map((d) => (
          <button
            key={d}
            onClick={() => setFilterDurum(d)}
            className={`px-4 py-2 rounded-full text-xs font-mono transition-all ${
              filterDurum === d
                ? durumRenk[d]
                : 'bg-white/[0.03] text-white/40 hover:text-white/60'
            }`}
          >
            {d} ({durumCounts[d]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ad, il veya proje tipi ara..."
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/[0.12] transition-colors"
        />
      </div>

      {/* Table / Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-white/30 font-mono text-sm">
            Sonuç bulunamadı.
          </div>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTeklif(t)}
              className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-all cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-white font-medium text-sm truncate">{t.ad}</p>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono ${durumRenk[t.durum]}`}>
                      {t.durum}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-white/40 text-xs font-mono">
                    <span className="flex items-center gap-1"><MapPin size={12} />{t.il}, {t.ilce}</span>
                    <span>{t.projeTipi}</span>
                    <span>{t.metrekare}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} />{t.tarih}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {t.fotograflar > 0 && (
                    <span className="flex items-center gap-1 text-white/30 text-xs font-mono">
                      <ImageIcon size={12} />{t.fotograflar}
                    </span>
                  )}
                  <Eye size={16} className="text-white/20 group-hover:text-white/50 transition-colors" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedTeklif && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTeklif(null)}>
          <div
            className="bg-[#111] border border-white/[0.08] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
              <div>
                <h3 className="font-heading text-lg font-semibold text-white">{selectedTeklif.ad}</h3>
                <p className="text-white/40 text-xs font-mono mt-1">#{selectedTeklif.id} · {selectedTeklif.tarih}</p>
              </div>
              <button onClick={() => setSelectedTeklif(null)} className="text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* İletişim */}
              <div className="space-y-2">
                <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider">İletişim</p>
                <div className="space-y-2">
                  <a href={`tel:${selectedTeklif.telefon}`} className="flex items-center gap-3 text-white/70 text-sm hover:text-white transition-colors">
                    <Phone size={14} className="text-green-400" />{selectedTeklif.telefon}
                  </a>
                  <a href={`mailto:${selectedTeklif.email}`} className="flex items-center gap-3 text-white/70 text-sm hover:text-white transition-colors">
                    <Mail size={14} className="text-blue-400" />{selectedTeklif.email}
                  </a>
                  <p className="flex items-center gap-3 text-white/70 text-sm">
                    <MapPin size={14} className="text-gold-400" />{selectedTeklif.il}, {selectedTeklif.ilce}
                  </p>
                </div>
              </div>

              {/* Proje Detayları */}
              <div className="space-y-2">
                <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider">Proje Detayları</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/[0.03] rounded-xl p-3">
                    <p className="text-white/30 text-[10px] font-mono">Proje Tipi</p>
                    <p className="text-white text-sm mt-1">{selectedTeklif.projeTipi}</p>
                  </div>
                  <div className="bg-white/[0.03] rounded-xl p-3">
                    <p className="text-white/30 text-[10px] font-mono">Metrekare</p>
                    <p className="text-white text-sm mt-1">{selectedTeklif.metrekare}</p>
                  </div>
                </div>
              </div>

              {/* Taş Tercihleri */}
              <div className="space-y-2">
                <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider">Taş Tercihleri</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTeklif.taslar.map((tas) => (
                    <span key={tas} className="px-3 py-1.5 rounded-full bg-gold-400/10 text-gold-400 text-xs font-mono">
                      {tas}
                    </span>
                  ))}
                </div>
              </div>

              {/* Açıklama */}
              <div className="space-y-2">
                <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider">Açıklama</p>
                <p className="text-white/60 text-sm leading-relaxed">{selectedTeklif.aciklama}</p>
              </div>

              {/* Fotoğraflar */}
              {selectedTeklif.fotograflar > 0 && (
                <div className="space-y-2">
                  <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider">Fotoğraflar ({selectedTeklif.fotograflar})</p>
                  <div className="flex gap-2">
                    {Array.from({ length: selectedTeklif.fotograflar }).map((_, i) => (
                      <div key={i} className="w-16 h-16 rounded-xl bg-white/[0.06] flex items-center justify-center">
                        <ImageIcon size={16} className="text-white/20" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Kaynak */}
              <div className="flex items-center justify-between">
                <p className="text-white/30 text-[10px] font-mono">Kaynak: {selectedTeklif.kaynak}</p>
              </div>

              {/* Durum Güncelle */}
              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider">Durumu Güncelle</p>
                <div className="flex flex-wrap gap-2">
                  {durumlar.map((d) => (
                    <button
                      key={d}
                      onClick={() => updateDurum(selectedTeklif.id, d)}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                        selectedTeklif.durum === d
                          ? durumRenk[d] + ' ring-1 ring-current'
                          : 'bg-white/[0.04] text-white/30 hover:text-white/60'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
