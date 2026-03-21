'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import type { StoneOption } from '@/lib/simulation'

interface Product {
  id: string
  name: string
  image_url: string | null
  stone_type?: { id: string; name: string; code: string } | null
  category?: { id: string; name: string; slug: string; thickness?: string } | null
}

interface Props {
  imagePreview: string
  onSelect: (stone: StoneOption) => void
  onBack: () => void
}

const STONE_TYPES = [
  { code: 'TRV', label: { tr: 'Traverten', en: 'Travertine', es: 'Travertino', ar: 'ترافرتين', de: 'Travertin' } },
  { code: 'MRMR', label: { tr: 'Mermer', en: 'Marble', es: 'Mármol', ar: 'رخام', de: 'Marmor' } },
  { code: 'BZLT', label: { tr: 'Bazalt', en: 'Basalt', es: 'Basalto', ar: 'بازلت', de: 'Basalt' } },
  { code: 'KLKR', label: { tr: 'Kalker', en: 'Limestone', es: 'Caliza', ar: 'حجر جيري', de: 'Kalkstein' } },
]

const SELECT_TEXTS: Record<string, { title: string; desc: string; back: string; next: string }> = {
  tr: { title: 'Taş Türü Seçin', desc: 'Mekanınıza uygulamak istediğiniz doğal taş türünü seçin', back: 'Geri', next: 'Alan İşaretle' },
  en: { title: 'Select Stone Type', desc: 'Choose the natural stone you want to apply to your space', back: 'Back', next: 'Mark Area' },
  es: { title: 'Seleccione tipo de piedra', desc: 'Elija la piedra natural que desea aplicar', back: 'Atrás', next: 'Marcar área' },
  ar: { title: 'اختر نوع الحجر', desc: 'اختر الحجر الطبيعي الذي تريد تطبيقه', back: 'رجوع', next: 'حدد المنطقة' },
  de: { title: 'Steinart wählen', desc: 'Wählen Sie den Naturstein, den Sie anwenden möchten', back: 'Zurück', next: 'Bereich markieren' },
}

export default function StepSelectStone({ imagePreview, onSelect, onBack }: Props) {
  const { locale } = useLanguage()
  const t = SELECT_TEXTS[locale] || SELECT_TEXTS.tr
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState('TRV')
  const [selected, setSelected] = useState<Product | null>(null)

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = products.filter(p => p.stone_type?.code === activeType)

  const handleConfirm = () => {
    if (!selected || !selected.stone_type) return
    onSelect({
      code: selected.stone_type.code,
      name: selected.name,
      image_url: selected.image_url,
      categorySlug: selected.category?.slug,
    })
  }

  return (
    <div className="glass-card p-6 md:p-10">
      {/* Header with preview */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 mb-8">
        {/* Uploaded image preview */}
        <div className="w-full md:w-48 flex-shrink-0">
          <div className="aspect-[4/3] rounded-xl overflow-hidden border border-white/[0.08]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <button
            onClick={onBack}
            className="mt-3 flex items-center gap-1.5 text-white/30 text-xs hover:text-white/60 transition-colors"
          >
            <ArrowLeft size={12} /> {t.back}
          </button>
        </div>

        {/* Title */}
        <div className="flex-1">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">
            {t.title}
          </h2>
          <p className="text-white/40 text-sm font-body">{t.desc}</p>
        </div>
      </div>

      {/* Stone type tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {STONE_TYPES.map((st) => (
          <button
            key={st.code}
            onClick={() => { setActiveType(st.code); setSelected(null) }}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeType === st.code
                ? 'bg-gold-400/20 text-gold-400 border border-gold-400/30'
                : 'bg-white/[0.04] text-white/40 border border-white/[0.06] hover:border-white/[0.12]'
            }`}
          >
            {(st.label as Record<string, string>)[locale] || st.label.tr}
          </button>
        ))}
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 size={24} className="mx-auto text-gold-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-white/20 font-mono text-sm">
          Bu kategoride ürün bulunamadı
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.map((product) => {
            const isSelected = selected?.id === product.id
            return (
              <button
                key={product.id}
                onClick={() => setSelected(product)}
                className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                  isSelected
                    ? 'border-gold-400 ring-2 ring-gold-400/20 scale-[1.02]'
                    : 'border-white/[0.06] hover:border-white/[0.15]'
                }`}
              >
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white/[0.03] flex items-center justify-center">
                    <span className="text-white/10 text-xs font-mono">{product.name}</span>
                  </div>
                )}

                {/* Name overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <span className="text-white text-[10px] font-mono leading-tight line-clamp-1">
                    {product.name}
                  </span>
                </div>

                {/* Selection check */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gold-400 flex items-center justify-center">
                    <Check size={14} className="text-black" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Confirm button */}
      {selected && (
        <div className="mt-8 text-center">
          <button
            onClick={handleConfirm}
            className="inline-flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-full text-sm font-medium hover:bg-stone-200 transition-colors"
          >
            {t.next}
            <ArrowLeft size={16} className="rotate-180" />
          </button>
          <p className="text-white/20 text-[10px] font-mono mt-3">
            {selected.name}
          </p>
        </div>
      )}
    </div>
  )
}
