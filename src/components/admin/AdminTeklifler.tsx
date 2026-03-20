'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Image as ImageIcon,
  X,
  Eye,
  Loader2,
  Trash2,
} from 'lucide-react'

type Durum = 'Yeni' | 'İletişime Geçildi' | 'Teklif Verildi' | 'Onaylandı' | 'Reddedildi'

interface Teklif {
  id: string
  ad_soyad: string
  telefon: string
  email: string | null
  ulke: string
  il: string
  ilce: string | null
  proje_tipi: string
  metrekare: string | null
  tas_tercihi: string[]
  aciklama: string | null
  kaynak: string | null
  foto_urls: string[]
  durum: Durum
  created_at: string
}

const durumRenk: Record<Durum, string> = {
  'Yeni': 'bg-blue-400/10 text-blue-400',
  'İletişime Geçildi': 'bg-yellow-400/10 text-yellow-400',
  'Teklif Verildi': 'bg-purple-400/10 text-purple-400',
  'Onaylandı': 'bg-green-400/10 text-green-400',
  'Reddedildi': 'bg-red-400/10 text-red-400',
}

const durumlar: Durum[] = ['Yeni', 'İletişime Geçildi', 'Teklif Verildi', 'Onaylandı', 'Reddedildi']

export default function AdminTeklifler() {
  const [teklifler, setTeklifler] = useState<Teklif[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterDurum, setFilterDurum] = useState<Durum | 'Tümü'>('Tümü')
  const [selectedTeklif, setSelectedTeklif] = useState<Teklif | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const password = typeof window !== 'undefined' ? localStorage.getItem('admin_pw') || '' : ''

  const fetchTeklifler = async () => {
    setLoading(true)
    const res = await fetch('/api/teklifler', {
      headers: { 'x-admin-password': password },
    })
    const data = await res.json()
    if (Array.isArray(data)) setTeklifler(data)
    setLoading(false)
  }

  useEffect(() => { fetchTeklifler() }, [])

  const filtered = teklifler.filter((t) => {
    const matchSearch =
      t.ad_soyad.toLowerCase().includes(search.toLowerCase()) ||
      t.il.toLowerCase().includes(search.toLowerCase()) ||
      t.proje_tipi.toLowerCase().includes(search.toLowerCase())
    const matchDurum = filterDurum === 'Tümü' || t.durum === filterDurum
    return matchSearch && matchDurum
  })

  const updateDurum = async (id: string, yeniDurum: Durum) => {
    await fetch(`/api/teklifler/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ durum: yeniDurum }),
    })
    setTeklifler((prev) =>
      prev.map((t) => (t.id === id ? { ...t, durum: yeniDurum } : t))
    )
    if (selectedTeklif?.id === id) {
      setSelectedTeklif((prev) => prev ? { ...prev, durum: yeniDurum } : null)
    }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/teklifler/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': password },
    })
    setDeleteConfirm(null)
    setSelectedTeklif(null)
    fetchTeklifler()
  }

  const durumCounts = durumlar.reduce((acc, d) => {
    acc[d] = teklifler.filter((t) => t.durum === d).length
    return acc
  }, {} as Record<Durum, number>)

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={20} className="animate-spin text-white/30" />
      </div>
    )
  }

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

      {/* Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-white/30 font-mono text-sm">
            {teklifler.length === 0 ? 'Henüz teklif talebi yok.' : 'Sonuç bulunamadı.'}
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
                    <p className="text-white font-medium text-sm truncate">{t.ad_soyad}</p>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono ${durumRenk[t.durum]}`}>
                      {t.durum}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-white/40 text-xs font-mono">
                    <span className="flex items-center gap-1"><MapPin size={12} />{t.il}{t.ilce ? `, ${t.ilce}` : ''}</span>
                    <span>{t.proje_tipi}</span>
                    {t.metrekare && <span>{t.metrekare}</span>}
                    <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(t.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {t.foto_urls.length > 0 && (
                    <span className="flex items-center gap-1 text-white/30 text-xs font-mono">
                      <ImageIcon size={12} />{t.foto_urls.length}
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
                <h3 className="font-heading text-lg font-semibold text-white">{selectedTeklif.ad_soyad}</h3>
                <p className="text-white/40 text-xs font-mono mt-1">{formatDate(selectedTeklif.created_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDeleteConfirm(selectedTeklif.id)}
                  className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/[0.05] transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                <button onClick={() => setSelectedTeklif(null)} className="text-white/40 hover:text-white">
                  <X size={20} />
                </button>
              </div>
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
                  {selectedTeklif.email && (
                    <a href={`mailto:${selectedTeklif.email}`} className="flex items-center gap-3 text-white/70 text-sm hover:text-white transition-colors">
                      <Mail size={14} className="text-blue-400" />{selectedTeklif.email}
                    </a>
                  )}
                  <p className="flex items-center gap-3 text-white/70 text-sm">
                    <MapPin size={14} className="text-gold-400" />{selectedTeklif.il}{selectedTeklif.ilce ? `, ${selectedTeklif.ilce}` : ''} · {selectedTeklif.ulke}
                  </p>
                </div>
              </div>

              {/* Proje Detayları */}
              <div className="space-y-2">
                <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider">Proje Detayları</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/[0.03] rounded-xl p-3">
                    <p className="text-white/30 text-[10px] font-mono">Proje Tipi</p>
                    <p className="text-white text-sm mt-1">{selectedTeklif.proje_tipi}</p>
                  </div>
                  <div className="bg-white/[0.03] rounded-xl p-3">
                    <p className="text-white/30 text-[10px] font-mono">Metrekare</p>
                    <p className="text-white text-sm mt-1">{selectedTeklif.metrekare || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Taş Tercihleri */}
              {selectedTeklif.tas_tercihi.length > 0 && (
                <div className="space-y-2">
                  <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider">Taş Tercihleri</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeklif.tas_tercihi.map((tas) => (
                      <span key={tas} className="px-3 py-1.5 rounded-full bg-gold-400/10 text-gold-400 text-xs font-mono">
                        {tas}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Açıklama */}
              {selectedTeklif.aciklama && (
                <div className="space-y-2">
                  <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider">Açıklama</p>
                  <p className="text-white/60 text-sm leading-relaxed">{selectedTeklif.aciklama}</p>
                </div>
              )}

              {/* Kaynak */}
              {selectedTeklif.kaynak && (
                <div className="flex items-center justify-between">
                  <p className="text-white/30 text-[10px] font-mono">Kaynak: {selectedTeklif.kaynak}</p>
                </div>
              )}

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

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-white font-medium mb-2">Teklif Talebini Sil</h3>
            <p className="text-white/40 text-sm mb-6">Bu teklif talebi kalıcı olarak silinecek. Emin misiniz?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 rounded-xl bg-white/[0.06] text-white/60 text-sm hover:bg-white/[0.1]"
              >
                İptal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
