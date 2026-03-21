'use client'

import { useState } from 'react'
import { Download, RefreshCw, RotateCcw, ArrowRight, Move } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import Link from 'next/link'

interface Props {
  originalUrl: string
  resultUrl: string
  stoneName: string
  onTryAnother: () => void
  onReset: () => void
}

const RESULT_TEXTS: Record<string, { title: string; before: string; after: string; download: string; tryAnother: string; newPhoto: string; quote: string; slider: string }> = {
  tr: {
    title: 'İşte Sonuç',
    before: 'Önce',
    after: 'Sonra',
    download: 'Sonucu İndir',
    tryAnother: 'Başka Taş Dene',
    newPhoto: 'Yeni Fotoğraf',
    quote: 'Teklif Al',
    slider: 'Kaydırarak karşılaştırın',
  },
  en: {
    title: 'Here\'s the Result',
    before: 'Before',
    after: 'After',
    download: 'Download Result',
    tryAnother: 'Try Another Stone',
    newPhoto: 'New Photo',
    quote: 'Get Quote',
    slider: 'Slide to compare',
  },
  es: {
    title: 'Aquí está el resultado',
    before: 'Antes',
    after: 'Después',
    download: 'Descargar resultado',
    tryAnother: 'Probar otra piedra',
    newPhoto: 'Nueva foto',
    quote: 'Solicitar presupuesto',
    slider: 'Deslice para comparar',
  },
  ar: {
    title: 'هذه هي النتيجة',
    before: 'قبل',
    after: 'بعد',
    download: 'تحميل النتيجة',
    tryAnother: 'جرب حجراً آخر',
    newPhoto: 'صورة جديدة',
    quote: 'طلب عرض سعر',
    slider: 'اسحب للمقارنة',
  },
  de: {
    title: 'Hier ist das Ergebnis',
    before: 'Vorher',
    after: 'Nachher',
    download: 'Ergebnis herunterladen',
    tryAnother: 'Anderen Stein testen',
    newPhoto: 'Neues Foto',
    quote: 'Angebot anfordern',
    slider: 'Zum Vergleichen schieben',
  },
}

export default function StepResult({ originalUrl, resultUrl, stoneName, onTryAnother, onReset }: Props) {
  const { locale } = useLanguage()
  const t = RESULT_TEXTS[locale] || RESULT_TEXTS.tr
  const [sliderPos, setSliderPos] = useState(50)
  const [isDragging, setIsDragging] = useState(false)

  const handleSliderMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging && e.type !== 'click') return
    const container = (e.currentTarget as HTMLElement)
    const rect = container.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const pos = ((clientX - rect.left) / rect.width) * 100
    setSliderPos(Math.max(2, Math.min(98, pos)))
  }

  const handleDownload = async () => {
    try {
      const res = await fetch(resultUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `urlastone-simulation-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // Fallback: open in new tab
      window.open(resultUrl, '_blank')
    }
  }

  return (
    <div className="glass-card p-6 md:p-10">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-1">
          {t.title} ✨
        </h2>
        <p className="text-gold-400 text-sm font-mono">{stoneName}</p>
      </div>

      {/* Before/After Slider */}
      <div
        className="relative rounded-2xl overflow-hidden border border-white/[0.08] cursor-col-resize select-none"
        onClick={(e) => { handleSliderMove(e) }}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleSliderMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleSliderMove}
      >
        {/* After image (full width background) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resultUrl}
          alt="After"
          className="w-full h-auto block select-none pointer-events-none"
          draggable={false}
        />

        {/* Before image (clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={originalUrl}
            alt="Before"
            className="w-full h-full object-cover select-none pointer-events-none"
            style={{ width: `${10000 / sliderPos}%`, maxWidth: 'none' }}
            draggable={false}
          />
        </div>

        {/* Slider line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg shadow-black/50 z-10"
          style={{ left: `${sliderPos}%` }}
        >
          {/* Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center">
            <Move size={16} className="text-black" />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-white text-[10px] font-mono tracking-wider">{t.before}</span>
        </div>
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-gold-400 text-[10px] font-mono tracking-wider">{t.after}</span>
        </div>
      </div>

      {/* Hint */}
      <p className="text-white/20 text-[10px] font-mono text-center mt-3">{t.slider}</p>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-stone-200 transition-colors"
        >
          <Download size={16} />
          {t.download}
        </button>

        <Link
          href="/teklif"
          className="inline-flex items-center gap-2 bg-gold-400/20 text-gold-400 px-6 py-3 rounded-full text-sm font-medium hover:bg-gold-400/30 transition-colors border border-gold-400/30"
        >
          {t.quote}
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          onClick={onTryAnother}
          className="inline-flex items-center gap-1.5 text-white/40 text-xs hover:text-white/70 transition-colors"
        >
          <RefreshCw size={12} />
          {t.tryAnother}
        </button>
        <span className="text-white/10">|</span>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-white/40 text-xs hover:text-white/70 transition-colors"
        >
          <RotateCcw size={12} />
          {t.newPhoto}
        </button>
      </div>
    </div>
  )
}
