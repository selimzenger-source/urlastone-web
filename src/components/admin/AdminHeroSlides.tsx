'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Trash2, Save, Upload, ChevronUp, ChevronDown,
  Eye, EyeOff, Languages, Loader2, Image as ImageIcon,
  Timer, AlertCircle, Check, Crosshair, Monitor, Smartphone
} from 'lucide-react'

interface HeroSlide {
  id: string
  image_url: string
  bg_position: string
  tag_tr: string; tag_en: string; tag_es: string; tag_ar: string; tag_de: string
  subtitle_tr: string; subtitle_en: string; subtitle_es: string; subtitle_ar: string; subtitle_de: string
  gold_tr: string; gold_en: string; gold_es: string; gold_ar: string; gold_de: string
  desc_tr: string; desc_en: string; desc_es: string; desc_ar: string; desc_de: string
  sort_order: number
  active: boolean
  transition_seconds: number
  created_at: string
}

const LANGS = ['tr', 'en', 'es', 'ar', 'de'] as const
const LANG_LABELS: Record<string, string> = { tr: 'Türkçe', en: 'English', es: 'Español', ar: 'العربية', de: 'Deutsch' }
const TEXT_FIELDS = ['tag', 'subtitle', 'gold', 'desc'] as const
const FIELD_LABELS: Record<string, string> = { tag: 'Etiket', subtitle: 'Alt Başlık', gold: 'Ana Başlık (Gold)', desc: 'Açıklama' }

export default function AdminHeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [translating, setTranslating] = useState<string | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)
  const [editSlide, setEditSlide] = useState<HeroSlide | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [transitionSeconds, setTransitionSeconds] = useState(7)
  const [setupNeeded, setSetupNeeded] = useState(false)
  const [settingUp, setSettingUp] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const pw = typeof window !== 'undefined' ? localStorage.getItem('admin_pw') || '' : ''

  const fetchSlides = useCallback(async () => {
    try {
      const res = await fetch('/api/hero-slides')
      if (!res.ok) {
        setSetupNeeded(true)
        setLoading(false)
        return
      }
      const data = await res.json()
      if (Array.isArray(data)) {
        setSlides(data)
        if (data.length > 0 && data[0].transition_seconds) {
          setTransitionSeconds(data[0].transition_seconds)
        }
        setSetupNeeded(false)
      } else {
        setSetupNeeded(true)
      }
    } catch {
      setSetupNeeded(true)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchSlides() }, [fetchSlides])

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const runSetup = async () => {
    setSettingUp(true)
    try {
      const res = await fetch('/api/hero-slides/setup', {
        method: 'POST',
        headers: { 'x-admin-password': pw }
      })
      const data = await res.json()
      if (res.ok) {
        showMsg('success', data.message || 'Tablo oluşturuldu')
        await fetchSlides()
      } else {
        showMsg('error', data.error || 'Setup başarısız')
        if (data.manual_sql) {
          console.log('Manual SQL:', data.manual_sql)
        }
      }
    } catch (err) {
      showMsg('error', 'Setup hatası')
    }
    setSettingUp(false)
  }

  const saveSlide = async (slide: HeroSlide) => {
    setSaving(slide.id)
    try {
      const { id, created_at, ...body } = slide
      const res = await fetch(`/api/hero-slides/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
        body: JSON.stringify(body)
      })
      if (res.ok) {
        showMsg('success', 'Slayt kaydedildi')
        await fetchSlides()
        setEditSlide(null)
      } else {
        const data = await res.json()
        showMsg('error', data.error || 'Kayıt başarısız')
      }
    } catch {
      showMsg('error', 'Kayıt hatası')
    }
    setSaving(null)
  }

  const deleteSlide = async (id: string) => {
    if (!confirm('Bu slaytı silmek istediğinize emin misiniz?')) return
    try {
      const res = await fetch(`/api/hero-slides/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': pw }
      })
      if (res.ok) {
        showMsg('success', 'Slayt silindi')
        await fetchSlides()
        if (editSlide?.id === id) setEditSlide(null)
      } else {
        showMsg('error', 'Silme başarısız')
      }
    } catch {
      showMsg('error', 'Silme hatası')
    }
  }

  const moveSlide = async (slide: HeroSlide, direction: 'up' | 'down') => {
    const idx = slides.findIndex(s => s.id === slide.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= slides.length) return

    const other = slides[swapIdx]
    // Swap sort_order values
    await Promise.all([
      fetch(`/api/hero-slides/${slide.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
        body: JSON.stringify({ sort_order: other.sort_order })
      }),
      fetch(`/api/hero-slides/${other.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
        body: JSON.stringify({ sort_order: slide.sort_order })
      })
    ])
    await fetchSlides()
  }

  const toggleActive = async (slide: HeroSlide) => {
    await fetch(`/api/hero-slides/${slide.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
      body: JSON.stringify({ active: !slide.active })
    })
    await fetchSlides()
  }

  const uploadImage = async (slideId: string, file: File) => {
    setUploading(slideId)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/hero-slides/upload', {
        method: 'POST',
        headers: { 'x-admin-password': pw },
        body: formData
      })
      if (res.ok) {
        const { url } = await res.json()
        // Update slide with new image
        await fetch(`/api/hero-slides/${slideId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
          body: JSON.stringify({ image_url: url })
        })
        showMsg('success', 'Görsel yüklendi')
        await fetchSlides()
        if (editSlide?.id === slideId) {
          setEditSlide(prev => prev ? { ...prev, image_url: url } : null)
        }
      } else {
        const data = await res.json()
        showMsg('error', data.error || 'Yükleme başarısız')
      }
    } catch {
      showMsg('error', 'Yükleme hatası')
    }
    setUploading(null)
  }

  const translateSlide = async (slide: HeroSlide) => {
    setTranslating(slide.id)
    try {
      const res = await fetch('/api/hero-slides/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
        body: JSON.stringify({
          tag: slide.tag_tr,
          subtitle: slide.subtitle_tr,
          gold: slide.gold_tr,
          desc: slide.desc_tr
        })
      })
      if (res.ok) {
        const translations = await res.json()
        const updated: Partial<HeroSlide> = {}
        for (const lang of ['en', 'es', 'ar', 'de'] as const) {
          if (translations[lang]) {
            if (translations[lang].tag) (updated as any)[`tag_${lang}`] = translations[lang].tag
            if (translations[lang].subtitle) (updated as any)[`subtitle_${lang}`] = translations[lang].subtitle
            if (translations[lang].gold) (updated as any)[`gold_${lang}`] = translations[lang].gold
            if (translations[lang].desc) (updated as any)[`desc_${lang}`] = translations[lang].desc
          }
        }
        // Save translations
        await fetch(`/api/hero-slides/${slide.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
          body: JSON.stringify(updated)
        })
        showMsg('success', 'Çeviriler kaydedildi')
        await fetchSlides()
        if (editSlide?.id === slide.id) {
          setEditSlide(prev => prev ? { ...prev, ...updated } : null)
        }
      } else {
        showMsg('error', 'Çeviri başarısız')
      }
    } catch {
      showMsg('error', 'Çeviri hatası')
    }
    setTranslating(null)
  }

  const addNewSlide = async (imageUrl: string) => {
    try {
      const res = await fetch('/api/hero-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
        body: JSON.stringify({
          image_url: imageUrl,
          bg_position: 'center center',
          tag_tr: '', tag_en: '', tag_es: '', tag_ar: '', tag_de: '',
          subtitle_tr: '', subtitle_en: '', subtitle_es: '', subtitle_ar: '', subtitle_de: '',
          gold_tr: '', gold_en: '', gold_es: '', gold_ar: '', gold_de: '',
          desc_tr: '', desc_en: '', desc_es: '', desc_ar: '', desc_de: '',
          active: true,
          transition_seconds: transitionSeconds
        })
      })
      if (res.ok) {
        showMsg('success', 'Yeni slayt eklendi')
        await fetchSlides()
        setShowAdd(false)
      } else {
        const data = await res.json()
        showMsg('error', data.error || 'Ekleme başarısız')
      }
    } catch {
      showMsg('error', 'Ekleme hatası')
    }
  }

  const handleNewImageUpload = async (file: File) => {
    setUploading('new')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/hero-slides/upload', {
        method: 'POST',
        headers: { 'x-admin-password': pw },
        body: formData
      })
      if (res.ok) {
        const { url } = await res.json()
        await addNewSlide(url)
      } else {
        const data = await res.json()
        showMsg('error', data.error || 'Yükleme başarısız')
      }
    } catch {
      showMsg('error', 'Yükleme hatası')
    }
    setUploading(null)
  }

  const updateTransitionSeconds = async (seconds: number) => {
    setTransitionSeconds(seconds)
    // Update all slides with new transition time
    try {
      await Promise.all(
        slides.map(s =>
          fetch(`/api/hero-slides/${s.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
            body: JSON.stringify({ transition_seconds: seconds })
          })
        )
      )
    } catch {
      // Silent fail for transition update
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#b39345]" size={32} />
      </div>
    )
  }

  if (setupNeeded) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <AlertCircle className="mx-auto text-[#b39345] mb-4" size={48} />
        <h2 className="font-heading text-xl text-white mb-2">Hero Slayt Tablosu Bulunamadı</h2>
        <p className="text-white/50 text-sm mb-6">
          Veritabanında hero_slides tablosu henüz oluşturulmamış. Tabloyu oluşturup mevcut 8 slaytı aktarmak için aşağıdaki butona tıklayın.
        </p>
        <button
          onClick={runSetup}
          disabled={settingUp}
          className="px-6 py-3 bg-[#b39345] text-black font-semibold rounded-xl hover:bg-[#d2b96e] transition-all disabled:opacity-50"
        >
          {settingUp ? <Loader2 className="animate-spin inline mr-2" size={16} /> : null}
          {settingUp ? 'Kuruluyor...' : 'Tabloyu Oluştur ve Verileri Aktar'}
        </button>
        {message && (
          <p className={`mt-4 text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {message.text}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Message Toast */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg ${
          message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl text-white">Hero Slaytları</h2>
          <p className="text-white/40 text-sm mt-1">{slides.length} / 10 slayt</p>
        </div>
        {slides.length < 10 && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#b39345] text-black font-semibold rounded-xl hover:bg-[#d2b96e] transition-all text-sm"
          >
            <Plus size={16} />
            Yeni Slayt
          </button>
        )}
      </div>

      {/* Transition Duration Setting */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <Timer size={18} className="text-[#b39345]" />
          <span className="text-white font-medium text-sm">Slayt Geçiş Süresi</span>
          <span className="text-[#b39345] font-mono text-sm ml-auto">{transitionSeconds} saniye</span>
        </div>
        <input
          type="range"
          min={3}
          max={10}
          step={1}
          value={transitionSeconds}
          onChange={(e) => updateTransitionSeconds(Number(e.target.value))}
          className="w-full accent-[#b39345] cursor-pointer"
        />
        <div className="flex justify-between text-white/30 text-xs mt-1">
          <span>3s</span>
          <span>10s</span>
        </div>
      </div>

      {/* Add New Slide */}
      {showAdd && (
        <div className="bg-white/[0.03] border border-[#b39345]/30 rounded-2xl p-6">
          <h3 className="text-white font-medium mb-4">Yeni Slayt Ekle</h3>
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-[#b39345]/50 transition-all">
            {uploading === 'new' ? (
              <Loader2 className="animate-spin text-[#b39345]" size={32} />
            ) : (
              <>
                <Upload size={32} className="text-white/30 mb-2" />
                <span className="text-white/40 text-sm">Görsel yüklemek için tıklayın</span>
                <span className="text-white/20 text-xs mt-1">JPG, PNG — Max 10MB</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleNewImageUpload(file)
              }}
            />
          </label>
          <button
            onClick={() => setShowAdd(false)}
            className="mt-3 text-white/40 text-sm hover:text-white/60"
          >
            İptal
          </button>
        </div>
      )}

      {/* Slides List */}
      <div className="space-y-3">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`bg-white/[0.03] border rounded-2xl overflow-hidden transition-all ${
              editSlide?.id === slide.id ? 'border-[#b39345]/40' : 'border-white/[0.06]'
            } ${!slide.active ? 'opacity-50' : ''}`}
          >
            {/* Slide Row */}
            <div className="flex items-center gap-4 p-4">
              {/* Order Controls */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveSlide(slide, 'up')}
                  disabled={idx === 0}
                  className="p-1 text-white/30 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <ChevronUp size={16} />
                </button>
                <span className="text-center text-white/40 text-xs font-mono">{idx + 1}</span>
                <button
                  onClick={() => moveSlide(slide, 'down')}
                  disabled={idx === slides.length - 1}
                  className="p-1 text-white/30 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              {/* Thumbnail */}
              <div className="w-32 h-20 rounded-lg overflow-hidden bg-black/40 flex-shrink-0 relative">
                <img
                  src={slide.image_url}
                  alt={slide.tag_tr}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: slide.bg_position }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  {slide.gold_tr || 'Başlık yok'}
                </p>
                <p className="text-white/40 text-xs truncate mt-0.5">
                  {slide.tag_tr} — {slide.subtitle_tr}
                </p>
                <p className="text-white/20 text-xs mt-1 font-mono">
                  bg: {slide.bg_position}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleActive(slide)}
                  className={`p-2 rounded-lg transition-all ${slide.active ? 'text-green-400 hover:bg-green-400/10' : 'text-white/30 hover:bg-white/5'}`}
                  title={slide.active ? 'Aktif — Pasif yap' : 'Pasif — Aktif yap'}
                >
                  {slide.active ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button
                  onClick={() => setEditSlide(editSlide?.id === slide.id ? null : { ...slide })}
                  className="p-2 rounded-lg text-white/40 hover:text-[#b39345] hover:bg-[#b39345]/10 transition-all"
                  title="Düzenle"
                >
                  <ImageIcon size={16} />
                </button>
                <button
                  onClick={() => deleteSlide(slide.id)}
                  className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all"
                  title="Sil"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Edit Panel */}
            {editSlide?.id === slide.id && (
              <div className="border-t border-white/[0.06] p-5 space-y-5">
                {/* Image Upload */}
                <div>
                  <label className="text-white/60 text-xs font-medium block mb-2">Görsel Değiştir</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:border-[#b39345]/50 transition-all text-sm text-white/60">
                      {uploading === slide.id ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <Upload size={14} />
                      )}
                      Yeni Görsel Yükle
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) uploadImage(slide.id, file)
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Focal Point & Preview */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-white/60 text-xs font-medium flex items-center gap-1.5">
                      <Crosshair size={12} />
                      Odak Noktası Ayarla
                    </label>
                    <span className="text-[#b39345] text-xs font-mono">{editSlide.bg_position}</span>
                  </div>

                  {/* Vertical slider to move focus up/down */}
                  {(() => {
                    const parts = editSlide.bg_position.split(/\s+/)
                    let yPct = 50
                    if (parts[1]) {
                      if (parts[1] === 'center') yPct = 50
                      else if (parts[1] === 'top') yPct = 0
                      else if (parts[1] === 'bottom') yPct = 100
                      else yPct = parseFloat(parts[1]) || 50
                    }
                    const xPart = parts[0] || '50%'
                    return (
                      <div className="space-y-3">
                        {/* Slider + big image */}
                        <div className="flex gap-3 items-stretch">
                          {/* Vertical range slider */}
                          <div className="flex flex-col items-center gap-1 py-1">
                            <ChevronUp size={14} className="text-white/30" />
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={yPct}
                              onChange={(e) => setEditSlide({ ...editSlide, bg_position: `${xPart} ${e.target.value}%` })}
                              className="accent-[#b39345] cursor-pointer"
                              style={{
                                writingMode: 'vertical-lr' as any,
                                direction: 'rtl',
                                height: '160px',
                                width: '20px',
                              }}
                            />
                            <ChevronDown size={14} className="text-white/30" />
                            <span className="text-[#b39345] text-[10px] font-mono mt-1">{yPct}%</span>
                          </div>
                          {/* Large clickable image */}
                          <div
                            className="relative flex-1 rounded-xl overflow-hidden border border-white/10 cursor-crosshair group"
                            style={{ minHeight: '200px' }}
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect()
                              const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
                              const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
                              setEditSlide({ ...editSlide, bg_position: `${x}% ${y}%` })
                            }}
                          >
                            <img
                              src={editSlide.image_url}
                              alt="Focal point"
                              className="w-full h-full object-cover pointer-events-none"
                              draggable={false}
                            />
                            {/* Horizontal focus line */}
                            <div className="absolute left-0 right-0 h-0.5 bg-[#b39345]/70 pointer-events-none shadow-sm shadow-black/50" style={{ top: `${yPct}%` }} />
                            {/* Center dot */}
                            <div
                              className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                              style={{ left: xPart.includes('%') ? xPart : '50%', top: `${yPct}%` }}
                            >
                              <div className="w-full h-full rounded-full border-2 border-[#b39345] bg-[#b39345]/30 shadow-lg shadow-black/50" />
                            </div>
                            {/* Hover hint */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all pointer-events-none flex items-center justify-center">
                              <span className="opacity-0 group-hover:opacity-100 text-white text-[10px] font-medium bg-black/60 px-2 py-1 rounded-full transition-opacity">
                                Tıkla veya slider ile ayarla
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Previews: Desktop & Mobile side by side, equal height */}
                        <div className="flex gap-3 items-start">
                          {/* Desktop */}
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1.5">
                              <Monitor size={12} />
                              Masaüstü
                            </div>
                            <div className="w-full rounded-xl overflow-hidden border border-white/[0.08] bg-black relative" style={{ aspectRatio: '16/9' }}>
                              <div className="w-full h-full" style={{ backgroundImage: `url(${editSlide.image_url})`, backgroundSize: 'cover', backgroundPosition: editSlide.bg_position }} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                              <div className="absolute bottom-2 left-2">
                                <p className="text-white/50 text-[7px] font-serif">{editSlide.subtitle_tr || 'Alt başlık'}</p>
                                <p className="text-[#b39345] text-[10px] font-bold font-serif">{editSlide.gold_tr || 'Ana başlık'}</p>
                              </div>
                            </div>
                          </div>
                          {/* Mobile */}
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1.5">
                              <Smartphone size={12} />
                              Mobil
                            </div>
                            <div className="w-full rounded-xl overflow-hidden border border-white/[0.08] bg-black relative" style={{ aspectRatio: '9/16' }}>
                              <div className="w-full h-full" style={{ backgroundImage: `url(${editSlide.image_url})`, backgroundSize: 'cover', backgroundPosition: editSlide.bg_position }} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                              <div className="absolute bottom-4 left-3 right-3">
                                <p className="text-white/50 text-[9px] font-serif">{editSlide.subtitle_tr || 'Alt başlık'}</p>
                                <p className="text-[#b39345] text-sm font-bold font-serif">{editSlide.gold_tr || 'Ana başlık'}</p>
                                <p className="text-white/30 text-[7px] font-mono mt-1 line-clamp-2">{editSlide.desc_tr || ''}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Text Fields - Turkish First */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-white/60 text-xs font-medium">Metinler (Türkçe)</label>
                    <button
                      onClick={() => translateSlide(editSlide)}
                      disabled={translating === slide.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#b39345]/20 text-[#b39345] rounded-lg text-xs font-medium hover:bg-[#b39345]/30 transition-all disabled:opacity-50"
                    >
                      {translating === slide.id ? (
                        <Loader2 className="animate-spin" size={12} />
                      ) : (
                        <Languages size={12} />
                      )}
                      {translating === slide.id ? 'Çevriliyor...' : 'Otomatik Çevir'}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {TEXT_FIELDS.map(field => (
                      <div key={field}>
                        <label className="text-white/30 text-xs block mb-1">{FIELD_LABELS[field]}</label>
                        {field === 'desc' ? (
                          <textarea
                            value={(editSlide as any)[`${field}_tr`] || ''}
                            onChange={(e) => setEditSlide({ ...editSlide, [`${field}_tr`]: e.target.value })}
                            rows={2}
                            className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:border-[#b39345]/50 outline-none resize-none"
                          />
                        ) : (
                          <input
                            type="text"
                            value={(editSlide as any)[`${field}_tr`] || ''}
                            onChange={(e) => setEditSlide({ ...editSlide, [`${field}_tr`]: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:border-[#b39345]/50 outline-none"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Other Languages (Collapsible) */}
                {LANGS.filter(l => l !== 'tr').map(lang => (
                  <details key={lang} className="group">
                    <summary className="cursor-pointer text-white/40 text-xs font-medium hover:text-white/60 flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded">{lang.toUpperCase()}</span>
                      {LANG_LABELS[lang]}
                    </summary>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pl-6">
                      {TEXT_FIELDS.map(field => (
                        <div key={field}>
                          <label className="text-white/20 text-xs block mb-1">{FIELD_LABELS[field]}</label>
                          {field === 'desc' ? (
                            <textarea
                              value={(editSlide as any)[`${field}_${lang}`] || ''}
                              onChange={(e) => setEditSlide({ ...editSlide, [`${field}_${lang}`]: e.target.value })}
                              rows={2}
                              className="w-full bg-white/5 border border-white/10 text-white/70 text-sm rounded-lg px-3 py-2 focus:border-[#b39345]/50 outline-none resize-none"
                            />
                          ) : (
                            <input
                              type="text"
                              value={(editSlide as any)[`${field}_${lang}`] || ''}
                              onChange={(e) => setEditSlide({ ...editSlide, [`${field}_${lang}`]: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 text-white/70 text-sm rounded-lg px-3 py-2 focus:border-[#b39345]/50 outline-none"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                ))}

                {/* Save Button */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => saveSlide(editSlide)}
                    disabled={saving === slide.id}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#b39345] text-black font-semibold rounded-xl hover:bg-[#d2b96e] transition-all text-sm disabled:opacity-50"
                  >
                    {saving === slide.id ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <Save size={14} />
                    )}
                    Kaydet
                  </button>
                  <button
                    onClick={() => setEditSlide(null)}
                    className="px-4 py-2.5 text-white/40 text-sm hover:text-white/60"
                  >
                    İptal
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {slides.length === 0 && !showAdd && (
        <div className="text-center py-16 text-white/30">
          <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
          <p>Henüz slayt eklenmemiş</p>
        </div>
      )}
    </div>
  )
}
