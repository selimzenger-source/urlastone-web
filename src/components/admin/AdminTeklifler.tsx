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
  Download,
  ZoomIn,
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
  cephe_metre: number | null
  tas_tercihi: string[]
  aciklama: string | null
  kaynak: string | null
  fiyat_tipi: string | null
  iletisim_turu: string | null
  tercih_dil: string | null
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
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

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

  const deleteAllPhotos = async (teklifId: string, fotoUrls: string[]) => {
    if (fotoUrls.length === 0) return
    for (const url of fotoUrls) {
      await fetch('/api/teklifler/delete-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ teklif_id: teklifId, photo_url: url }),
      })
    }
  }

  const updateDurum = async (id: string, yeniDurum: Durum) => {
    await fetch(`/api/teklifler/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ durum: yeniDurum }),
    })

    // Auto-delete photos when status is Reddedildi or Onaylandı (no longer needed)
    if (yeniDurum === 'Reddedildi' || yeniDurum === 'Onaylandı') {
      const teklif = teklifler.find(t => t.id === id)
      if (teklif && teklif.foto_urls.length > 0) {
        await deleteAllPhotos(id, teklif.foto_urls)
      }
    }

    const clearedPhotos = yeniDurum === 'Reddedildi' || yeniDurum === 'Onaylandı'
    setTeklifler((prev) =>
      prev.map((t) => (t.id === id ? { ...t, durum: yeniDurum, ...(clearedPhotos ? { foto_urls: [] } : {}) } : t))
    )
    if (selectedTeklif?.id === id) {
      setSelectedTeklif((prev) => prev ? { ...prev, durum: yeniDurum, ...(clearedPhotos ? { foto_urls: [] } : {}) } : null)
    }
  }

  const handleDeletePhoto = async (teklifId: string, photoUrl: string) => {
    await fetch('/api/teklifler/delete-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ teklif_id: teklifId, photo_url: photoUrl }),
    })
    // Update local state
    const updatedUrls = (selectedTeklif?.foto_urls || []).filter(u => u !== photoUrl)
    setSelectedTeklif(prev => prev ? { ...prev, foto_urls: updatedUrls } : null)
    setTeklifler(prev => prev.map(t => t.id === teklifId ? { ...t, foto_urls: updatedUrls } : t))
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
    const date = d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const time = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    return `${date} ${time}`
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

      {/* Search + Excel Export */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ad, il veya proje tipi ara..."
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/[0.12] transition-colors"
          />
        </div>
        <button
          onClick={async () => {
            // Gercek .xlsx olustur (kolon genislikleri + baslik stili)
            const XLSX = await import('xlsx')
            const headers = ['Tarih', 'Saat', 'Ad Soyad', 'Telefon', 'E-posta', 'Ülke', 'İl', 'İlçe', 'Proje Tipi', 'Metrekare', 'Taş Tercihi', 'Fiyat Kapsamı', 'İletişim Tercihi', 'Kaynak', 'Açıklama', 'Durum']
            const data = teklifler.map(t => {
              const d = new Date(t.created_at)
              return {
                Tarih: d.toLocaleDateString('tr-TR'),
                Saat: d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                'Ad Soyad': t.ad_soyad,
                Telefon: t.telefon,
                'E-posta': t.email || '',
                Ülke: t.ulke,
                İl: t.il,
                İlçe: t.ilce || '',
                'Proje Tipi': t.proje_tipi,
                Metrekare: t.metrekare || '',
                'Taş Tercihi': t.tas_tercihi?.join(', ') || '',
                'Fiyat Kapsamı': t.fiyat_tipi === 'sadece_tas' ? 'Sadece Taş' : t.fiyat_tipi === 'tas_ve_malzeme' ? 'Taş + Yapıştırıcı + Derz' : (t.fiyat_tipi || ''),
                'İletişim Tercihi': ({ phone: 'Telefon', email: 'E-posta', whatsapp: 'WhatsApp' } as Record<string, string>)[t.iletisim_turu || ''] || t.iletisim_turu || '',
                Kaynak: t.kaynak || '',
                Açıklama: t.aciklama || '',
                Durum: t.durum,
              }
            })

            const ws = XLSX.utils.json_to_sheet(data, { header: headers })

            // Kolon genislikleri — her kolon icin ideal genislik (wch = karakter birimi)
            ws['!cols'] = [
              { wch: 12 },  // Tarih
              { wch: 8 },   // Saat
              { wch: 22 },  // Ad Soyad
              { wch: 18 },  // Telefon
              { wch: 28 },  // E-posta
              { wch: 12 },  // Ülke
              { wch: 14 },  // İl
              { wch: 14 },  // İlçe
              { wch: 16 },  // Proje Tipi
              { wch: 10 },  // Metrekare
              { wch: 25 },  // Taş Tercihi
              { wch: 26 },  // Fiyat Kapsamı
              { wch: 16 },  // İletişim Tercihi
              { wch: 14 },  // Kaynak
              { wch: 40 },  // Açıklama
              { wch: 18 },  // Durum
            ]

            // Tum hucrelere metin formati + icerik wrap (uzun aciklamalar icin)
            const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
            for (let R = range.s.r; R <= range.e.r; ++R) {
              for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
                if (ws[cellRef]) {
                  ws[cellRef].s = ws[cellRef].s || {}
                  if (R === 0) {
                    // Baslik satiri
                    ws[cellRef].s = { font: { bold: true }, alignment: { wrapText: true, vertical: 'center' } }
                  } else {
                    ws[cellRef].s = { alignment: { wrapText: true, vertical: 'top' } }
                  }
                }
              }
            }

            // Ilk satir yuksekligi
            ws['!rows'] = [{ hpt: 24 }]

            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, 'Teklifler')

            XLSX.writeFile(wb, `urlastone-teklifler-${new Date().toISOString().split('T')[0]}.xlsx`)
          }}
          className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs font-mono hover:bg-green-500/20 transition-colors whitespace-nowrap"
        >
          <Download size={14} />
          Excel İndir
        </button>
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
                  <div className="flex items-center gap-2">
                    <a href={`tel:${selectedTeklif.telefon.replace(/[\s\-\(\)]/g, '')}`} className="flex items-center gap-3 text-white/70 text-sm hover:text-white transition-colors">
                      <Phone size={14} className="text-green-400" />{selectedTeklif.telefon}
                    </a>
                    <a href={`https://wa.me/${(() => {
                      const clean = selectedTeklif.telefon.replace(/[\s\-\(\)]/g, '')
                      // + ile baslayan: uluslararasi format, oldugu gibi kullan (+'i kaldir)
                      if (clean.startsWith('+')) return clean.slice(1)
                      // 0 ile baslayan: Turkce yerel format (05xx), 90 prefix ekle
                      if (clean.startsWith('0')) return '90' + clean.replace(/^0+/, '')
                      // Ne + ne 0: zaten ulke kodu ile gelmis (90, 33, 49 vb.), direkt kullan
                      return clean
                    })()}`}
                      target="_blank" rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-colors" title="WhatsApp">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </a>
                  </div>
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
                    <p className="text-white text-sm mt-1">{selectedTeklif.cephe_metre ? `${selectedTeklif.cephe_metre} m²` : (selectedTeklif.metrekare || '—')}</p>
                  </div>
                </div>
              </div>

              {/* Fiyat Kapsamı + İletişim Tercihi + Kaynak */}
              <div className="grid grid-cols-3 gap-3">
                {selectedTeklif.fiyat_tipi && (
                  <div className="bg-white/[0.03] rounded-xl p-3">
                    <p className="text-white/30 text-[10px] font-mono">Fiyat Kapsamı</p>
                    <p className="text-white text-sm mt-1">{selectedTeklif.fiyat_tipi === 'sadece_tas' ? 'Sadece Taş' : 'Taş + Yapıştırıcı + Derz'}</p>
                  </div>
                )}
                {selectedTeklif.iletisim_turu && (
                  <div className="bg-white/[0.03] rounded-xl p-3">
                    <p className="text-white/30 text-[10px] font-mono">İletişim Tercihi</p>
                    <p className="text-white text-sm mt-1">{{ phone: 'Telefon', email: 'E-posta', whatsapp: 'WhatsApp' }[selectedTeklif.iletisim_turu] || selectedTeklif.iletisim_turu}</p>
                  </div>
                )}
                {selectedTeklif.kaynak && (
                  <div className="bg-white/[0.03] rounded-xl p-3">
                    <p className="text-white/30 text-[10px] font-mono">Nerden Buldu</p>
                    <p className="text-white text-sm mt-1">{selectedTeklif.kaynak}</p>
                  </div>
                )}
              </div>

              {/* İletişim Dil Tercihi */}
              {selectedTeklif.tercih_dil && (
                <div className="bg-white/[0.03] rounded-xl p-3 flex items-center gap-3">
                  <span className="text-lg">
                    {{ tr: '🇹🇷', en: '🇬🇧', es: '🇪🇸', de: '🇩🇪', fr: '🇫🇷', ru: '🇷🇺', ar: '🇸🇦' }[selectedTeklif.tercih_dil] || '🌐'}
                  </span>
                  <div>
                    <p className="text-white/30 text-[10px] font-mono">İletişim Dili</p>
                    <p className="text-white text-sm mt-0.5">
                      {{ tr: 'Türkçe', en: 'İngilizce', es: 'İspanyolca', de: 'Almanca', fr: 'Fransızca', ru: 'Rusça', ar: 'Arapça' }[selectedTeklif.tercih_dil] || selectedTeklif.tercih_dil.toUpperCase()}
                    </p>
                  </div>
                </div>
              )}

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

              {/* Fotoğraflar */}
              {selectedTeklif.foto_urls.length > 0 && (
                <div className="space-y-2">
                  <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider">
                    Fotoğraflar ({selectedTeklif.foto_urls.length})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedTeklif.foto_urls.map((url, i) => (
                      <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.08]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Fotoğraf ${i + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); setLightboxUrl(url) }}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                            title="Büyüt"
                          >
                            <ZoomIn size={14} className="text-white" />
                          </button>
                          <a
                            href={url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                            title="İndir"
                          >
                            <Download size={14} className="text-white" />
                          </a>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeletePhoto(selectedTeklif.id, url) }}
                            className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={14} className="text-red-400" />
                          </button>
                        </div>
                      </div>
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

      {/* Image Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center">
            <div className="absolute top-0 right-0 flex items-center gap-2 z-10">
              <a
                href={lightboxUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                title="İndir"
              >
                <Download size={20} className="text-white" />
              </a>
              <button
                onClick={() => setLightboxUrl(null)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxUrl}
              alt="Fotoğraf"
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
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
