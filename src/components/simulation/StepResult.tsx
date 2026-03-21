'use client'

import { useState, useCallback } from 'react'
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

// Draw watermark on canvas
function drawWatermarks(ctx: CanvasRenderingContext2D, width: number, height: number, logoImg: HTMLImageElement | null) {
  ctx.save()

  // --- Corner watermark: logo + text (bottom-right) ---
  const cornerSize = Math.min(width, height) * 0.12
  const padding = cornerSize * 0.4
  const logoSize = cornerSize * 0.5

  ctx.globalAlpha = 0.25

  // Draw logo icon if loaded
  if (logoImg) {
    ctx.drawImage(
      logoImg,
      width - padding - cornerSize,
      height - padding - logoSize - 8,
      logoSize,
      logoSize
    )
  }

  // Draw "URLASTONE" text next to logo
  ctx.globalAlpha = 0.3
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${Math.round(cornerSize * 0.28)}px Inter, sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'

  const textX = logoImg ? width - padding - cornerSize + logoSize + 6 : width - padding - cornerSize
  const textY = height - padding - logoSize / 2 - 8

  // Text shadow for visibility on light/dark backgrounds
  ctx.shadowColor = 'rgba(0,0,0,0.5)'
  ctx.shadowBlur = 4
  ctx.shadowOffsetX = 1
  ctx.shadowOffsetY = 1
  ctx.fillText('URLASTONE', textX, textY)

  // Subtitle
  ctx.font = `${Math.round(cornerSize * 0.14)}px Inter, sans-serif`
  ctx.globalAlpha = 0.2
  ctx.fillText('urlastone.com', textX, textY + cornerSize * 0.22)

  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  // --- Diagonal repeating hologram watermarks ---
  ctx.globalAlpha = 0.06
  ctx.fillStyle = '#ffffff'
  const fontSize = Math.round(Math.min(width, height) * 0.04)
  ctx.font = `bold ${fontSize}px Inter, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Rotate -30 degrees for diagonal pattern
  const angle = -30 * (Math.PI / 180)
  const spacingX = fontSize * 10
  const spacingY = fontSize * 6

  for (let row = -2; row < Math.ceil(height / spacingY) + 2; row++) {
    for (let col = -2; col < Math.ceil(width / spacingX) + 2; col++) {
      const x = col * spacingX + (row % 2) * (spacingX / 2)
      const y = row * spacingY
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.fillText('URLASTONE', 0, 0)
      ctx.restore()
    }
  }

  ctx.restore()
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

  const handleDownload = useCallback(async () => {
    try {
      // Load result image
      const img = new window.Image()
      img.crossOrigin = 'anonymous'

      // Load logo
      const logoImg = new window.Image()
      logoImg.crossOrigin = 'anonymous'

      await Promise.all([
        new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = reject
          img.src = resultUrl
        }),
        new Promise<void>((resolve) => {
          logoImg.onload = () => resolve()
          logoImg.onerror = () => resolve() // Don't fail if logo can't load
          logoImg.src = '/logo.png'
        }),
      ])

      // Create canvas with watermarks burned in
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!

      // Draw result image
      ctx.drawImage(img, 0, 0)

      // Draw watermarks
      drawWatermarks(ctx, canvas.width, canvas.height, logoImg.complete && logoImg.naturalWidth > 0 ? logoImg : null)

      // Download
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `urlastone-simulation-${Date.now()}.jpg`
        a.click()
        URL.revokeObjectURL(url)
      }, 'image/jpeg', 0.92)
    } catch {
      // Fallback: open in new tab
      window.open(resultUrl, '_blank')
    }
  }, [resultUrl])

  return (
    <div className="glass-card p-6 md:p-10">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-1">
          {t.title}
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

        {/* Watermark overlay (CSS — visible on screen) */}
        <div className="absolute inset-0 pointer-events-none z-[5]" style={{ mixBlendMode: 'overlay' }}>
          {/* Corner watermark */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 opacity-30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" className="w-6 h-6 md:w-8 md:h-8 brightness-[10] drop-shadow-lg" draggable={false} />
            <div className="drop-shadow-lg">
              <span className="text-white text-[10px] md:text-xs font-bold tracking-wider block leading-tight">URLASTONE</span>
              <span className="text-white/70 text-[7px] md:text-[8px] font-mono block leading-tight">urlastone.com</span>
            </div>
          </div>

          {/* Diagonal hologram pattern */}
          <div className="absolute inset-0 overflow-hidden opacity-[0.04]" style={{ transform: 'rotate(-30deg)', transformOrigin: 'center' }}>
            <div className="absolute inset-[-50%] flex flex-wrap gap-y-16 gap-x-24 items-center justify-center">
              {Array.from({ length: 40 }).map((_, i) => (
                <span key={i} className="text-white text-sm md:text-base font-bold tracking-[0.2em] whitespace-nowrap">
                  URLASTONE
                </span>
              ))}
            </div>
          </div>
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
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full z-[6]">
          <span className="text-white text-[10px] font-mono tracking-wider">{t.before}</span>
        </div>
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full z-[6]">
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
