'use client'

import { useState } from 'react'
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Image as ImageIcon,
  Eye,
  EyeOff,
  GripVertical,
} from 'lucide-react'

interface Tas {
  id: number
  ad: string
  kategori: string
  renk: string
  aciklama: string
  kullanim: string[]
  aktif: boolean
  sira: number
}

const mockTaslar: Tas[] = [
  {
    id: 1, ad: 'Traverten', kategori: 'Kireçtaşı', renk: 'Bej / Krem',
    aciklama: 'Doğal gözenekli yapısıyla sıcak ve otantik bir görünüm sunar.',
    kullanim: ['Cephe Kaplama', 'Zemin Döşeme', 'Havuz Kenarı'], aktif: true, sira: 1,
  },
  {
    id: 2, ad: 'Mermer', kategori: 'Metamorfik', renk: 'Beyaz / Gri',
    aciklama: 'Zarif damarlarıyla lüks mekânların vazgeçilmez taşı.',
    kullanim: ['İç Mekan', 'Tezgah', 'Banyo'], aktif: true, sira: 2,
  },
  {
    id: 3, ad: 'Bazalt', kategori: 'Volkanik', renk: 'Koyu Gri / Siyah',
    aciklama: 'Yüksek dayanıklılığıyla dış mekan projelerinde ideal.',
    kullanim: ['Cephe Kaplama', 'Bahçe & Peyzaj', 'Yürüyüş Yolu'], aktif: true, sira: 3,
  },
  {
    id: 4, ad: 'Granit', kategori: 'Plütonik', renk: 'Gri / Pembe / Siyah',
    aciklama: 'En sert doğal taşlardan biri, aşınmaya son derece dayanıklı.',
    kullanim: ['Zemin Döşeme', 'Tezgah', 'Merdiven'], aktif: true, sira: 4,
  },
  {
    id: 5, ad: 'Kayrak', kategori: 'Metamorfik', renk: 'Yeşil / Gri',
    aciklama: 'Tabakalı yapısıyla rustik ve doğal bir atmosfer yaratır.',
    kullanim: ['Bahçe & Peyzaj', 'Duvar Kaplama'], aktif: false, sira: 5,
  },
]

const kategoriler = ['Kireçtaşı', 'Metamorfik', 'Volkanik', 'Plütonik', 'Sedimanter']

const emptyTas: Omit<Tas, 'id' | 'sira'> = {
  ad: '', kategori: '', renk: '', aciklama: '', kullanim: [], aktif: true,
}

export default function AdminTaslar() {
  const [taslar, setTaslar] = useState(mockTaslar)
  const [search, setSearch] = useState('')
  const [editTas, setEditTas] = useState<Tas | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [kullanimInput, setKullanimInput] = useState('')

  const filtered = taslar.filter((t) =>
    t.ad.toLowerCase().includes(search.toLowerCase()) ||
    t.kategori.toLowerCase().includes(search.toLowerCase())
  )

  const openNew = () => {
    setEditTas({
      id: Math.max(...taslar.map((t) => t.id), 0) + 1,
      sira: taslar.length + 1,
      ...emptyTas,
    })
    setIsNew(true)
    setKullanimInput('')
  }

  const openEdit = (tas: Tas) => {
    setEditTas({ ...tas })
    setIsNew(false)
    setKullanimInput('')
  }

  const saveTas = () => {
    if (!editTas || !editTas.ad.trim()) return
    if (isNew) {
      setTaslar((prev) => [...prev, editTas])
    } else {
      setTaslar((prev) => prev.map((t) => (t.id === editTas.id ? editTas : t)))
    }
    setEditTas(null)
  }

  const deleteTas = (id: number) => {
    setTaslar((prev) => prev.filter((t) => t.id !== id))
    setDeleteConfirm(null)
  }

  const toggleAktif = (id: number) => {
    setTaslar((prev) =>
      prev.map((t) => (t.id === id ? { ...t, aktif: !t.aktif } : t))
    )
  }

  const addKullanim = () => {
    if (!kullanimInput.trim() || !editTas) return
    setEditTas({ ...editTas, kullanim: [...editTas.kullanim, kullanimInput.trim()] })
    setKullanimInput('')
  }

  const removeKullanim = (index: number) => {
    if (!editTas) return
    setEditTas({
      ...editTas,
      kullanim: editTas.kullanim.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-white/40 text-xs font-mono">{taslar.length} taş · {taslar.filter(t => t.aktif).length} aktif</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-medium hover:bg-stone-200 transition-colors"
        >
          <Plus size={16} />
          Yeni Taş Ekle
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Taş adı veya kategori ara..."
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/[0.12] transition-colors"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tas) => (
          <div
            key={tas.id}
            className={`bg-white/[0.03] border rounded-2xl overflow-hidden transition-all ${
              tas.aktif ? 'border-white/[0.06]' : 'border-white/[0.03] opacity-50'
            }`}
          >
            {/* Image Placeholder */}
            <div className="aspect-[4/3] bg-white/[0.04] flex items-center justify-center relative">
              <ImageIcon size={32} className="text-white/10" />
              {!tas.aktif && (
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-red-400/10 text-red-400 text-[10px] font-mono">
                  Pasif
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-white font-medium text-sm">{tas.ad}</h4>
                  <p className="text-white/30 text-xs font-mono">{tas.kategori} · {tas.renk}</p>
                </div>
              </div>

              <p className="text-white/40 text-xs leading-relaxed mb-3 line-clamp-2">{tas.aciklama}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {tas.kullanim.slice(0, 3).map((k) => (
                  <span key={k} className="px-2 py-0.5 rounded-full bg-gold-400/10 text-gold-400 text-[10px] font-mono">
                    {k}
                  </span>
                ))}
                {tas.kullanim.length > 3 && (
                  <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-white/30 text-[10px] font-mono">
                    +{tas.kullanim.length - 3}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
                <button
                  onClick={() => openEdit(tas)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/[0.04] text-white/50 text-xs hover:bg-white/[0.08] hover:text-white transition-all"
                >
                  <Edit3 size={12} />Düzenle
                </button>
                <button
                  onClick={() => toggleAktif(tas.id)}
                  className="p-2 rounded-lg bg-white/[0.04] text-white/30 hover:bg-white/[0.08] hover:text-white transition-all"
                  title={tas.aktif ? 'Pasife Al' : 'Aktife Al'}
                >
                  {tas.aktif ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  onClick={() => setDeleteConfirm(tas.id)}
                  className="p-2 rounded-lg bg-white/[0.04] text-white/30 hover:bg-red-400/10 hover:text-red-400 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-base font-semibold text-white mb-2">Taşı Sil</h3>
            <p className="text-white/40 text-sm mb-6">
              Bu taşı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-full border border-white/[0.08] text-white/60 text-sm hover:bg-white/[0.04] transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => deleteTas(deleteConfirm)}
                className="flex-1 py-2.5 rounded-full bg-red-500 text-white text-sm hover:bg-red-600 transition-colors"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / New Modal */}
      {editTas && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setEditTas(null)}>
          <div
            className="bg-[#111] border border-white/[0.08] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
              <h3 className="font-heading text-lg font-semibold text-white">
                {isNew ? 'Yeni Taş Ekle' : 'Taşı Düzenle'}
              </h3>
              <button onClick={() => setEditTas(null)} className="text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* Ad */}
              <div>
                <label className="block text-white/40 text-xs font-mono mb-1.5">Taş Adı *</label>
                <input
                  type="text"
                  value={editTas.ad}
                  onChange={(e) => setEditTas({ ...editTas, ad: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/[0.15] transition-colors"
                  placeholder="ör. Traverten"
                />
              </div>

              {/* Kategori & Renk */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/40 text-xs font-mono mb-1.5">Kategori</label>
                  <select
                    value={editTas.kategori}
                    onChange={(e) => setEditTas({ ...editTas, kategori: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/[0.15] transition-colors appearance-none"
                  >
                    <option value="" className="bg-[#111]">Seçin</option>
                    {kategoriler.map((k) => (
                      <option key={k} value={k} className="bg-[#111]">{k}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white/40 text-xs font-mono mb-1.5">Renk</label>
                  <input
                    type="text"
                    value={editTas.renk}
                    onChange={(e) => setEditTas({ ...editTas, renk: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/[0.15] transition-colors"
                    placeholder="ör. Bej / Krem"
                  />
                </div>
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-white/40 text-xs font-mono mb-1.5">Açıklama</label>
                <textarea
                  value={editTas.aciklama}
                  onChange={(e) => setEditTas({ ...editTas, aciklama: e.target.value })}
                  rows={3}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/[0.15] transition-colors resize-none"
                  placeholder="Taş hakkında kısa açıklama..."
                />
              </div>

              {/* Kullanım Alanları */}
              <div>
                <label className="block text-white/40 text-xs font-mono mb-1.5">Kullanım Alanları</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editTas.kullanim.map((k, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-400/10 text-gold-400 text-xs font-mono">
                      {k}
                      <button onClick={() => removeKullanim(i)} className="hover:text-gold-200">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={kullanimInput}
                    onChange={(e) => setKullanimInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKullanim())}
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/[0.15] transition-colors"
                    placeholder="ör. Cephe Kaplama"
                  />
                  <button
                    onClick={addKullanim}
                    className="px-4 py-2 rounded-xl bg-white/[0.06] text-white/60 text-sm hover:bg-white/[0.10] transition-colors"
                  >
                    Ekle
                  </button>
                </div>
              </div>

              {/* Fotoğraf */}
              <div>
                <label className="block text-white/40 text-xs font-mono mb-1.5">Fotoğraf</label>
                <div className="border-2 border-dashed border-white/[0.08] rounded-xl p-8 text-center hover:border-white/[0.15] transition-colors cursor-pointer">
                  <ImageIcon size={24} className="mx-auto text-white/20 mb-2" />
                  <p className="text-white/30 text-xs font-mono">Fotoğraf yüklemek için tıklayın</p>
                  <p className="text-white/15 text-[10px] font-mono mt-1">PNG, JPG · Max 5MB</p>
                </div>
              </div>

              {/* Aktif */}
              <div className="flex items-center justify-between py-2">
                <span className="text-white/50 text-sm">Sitede Göster</span>
                <button
                  onClick={() => setEditTas({ ...editTas, aktif: !editTas.aktif })}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    editTas.aktif ? 'bg-green-500' : 'bg-white/10'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    editTas.aktif ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-white/[0.06]">
              <button
                onClick={() => setEditTas(null)}
                className="flex-1 py-3 rounded-full border border-white/[0.08] text-white/60 text-sm hover:bg-white/[0.04] transition-colors"
              >
                İptal
              </button>
              <button
                onClick={saveTas}
                className="flex-1 py-3 rounded-full bg-white text-black text-sm font-medium hover:bg-stone-200 transition-colors"
              >
                {isNew ? 'Ekle' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
