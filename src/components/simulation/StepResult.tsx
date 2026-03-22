'use client'

import { useState, useCallback } from 'react'
import { Download, RefreshCw, RotateCcw, ArrowRight, Move, ZoomIn, Loader2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import Link from 'next/link'

interface Props {
  originalUrl: string
  resultUrl: string
  stoneName: string
  stoneCode?: string
  onTryAnother: () => void
  onReset: () => void
}

const RESULT_TEXTS: Record<string, { title: string; before: string; after: string; download: string; downloadHd: string; upscaling: string; tryAnother: string; newPhoto: string; quote: string; slider: string }> = {
  tr: {
    title: 'İşte Sonuç',
    before: 'Önce',
    after: 'Sonra',
    download: 'İndir',
    downloadHd: 'HD İndir',
    upscaling: 'HD hazırlanıyor...',
    tryAnother: 'Başka Taş Dene',
    newPhoto: 'Yeni Fotoğraf',
    quote: 'Teklif Al',
    slider: 'Kaydırarak karşılaştırın',
  },
  en: {
    title: 'Here\'s the Result',
    before: 'Before',
    after: 'After',
    download: 'Download',
    downloadHd: 'HD Download',
    upscaling: 'Preparing HD...',
    tryAnother: 'Try Another Stone',
    newPhoto: 'New Photo',
    quote: 'Get Quote',
    slider: 'Slide to compare',
  },
  es: {
    title: 'Aquí está el resultado',
    before: 'Antes',
    after: 'Después',
    download: 'Descargar',
    downloadHd: 'Descargar HD',
    upscaling: 'Preparando HD...',
    tryAnother: 'Probar otra piedra',
    newPhoto: 'Nueva foto',
    quote: 'Solicitar presupuesto',
    slider: 'Deslice para comparar',
  },
  ar: {
    title: 'هذه هي النتيجة',
    before: 'قبل',
    after: 'بعد',
    download: 'تحميل',
    downloadHd: 'تحميل HD',
    upscaling: 'جاري تحضير HD...',
    tryAnother: 'جرب حجراً آخر',
    newPhoto: 'صورة جديدة',
    quote: 'طلب عرض سعر',
    slider: 'اسحب للمقارنة',
  },
  de: {
    title: 'Hier ist das Ergebnis',
    before: 'Vorher',
    after: 'Nachher',
    download: 'Herunterladen',
    downloadHd: 'HD Herunterladen',
    upscaling: 'HD wird vorbereitet...',
    tryAnother: 'Anderen Stein testen',
    newPhoto: 'Neues Foto',
    quote: 'Angebot anfordern',
    slider: 'Zum Vergleichen schieben',
  },
}

// Draw watermark on canvas
function drawWatermarks(ctx: CanvasRenderingContext2D, width: number, height: number, logoImg: HTMLImageElement | null) {
  ctx.save()

  // --- Corner watermark: text-only badge (top-right) ---
  const fontSize = Math.round(Math.min(width, height) * 0.018)
  const subFontSize = Math.round(fontSize * 0.6)
  const pad = fontSize * 0.8
  const margin = fontSize * 1.2

  // Measure text to size the badge
  ctx.font = `bold ${fontSize}px Inter, Arial, sans-serif`
  const mainWidth = ctx.measureText('URLASTONE').width
  ctx.font = `${subFontSize}px Inter, Arial, sans-serif`
  const subWidth = ctx.measureText('urlastone.com').width
  const textWidth = Math.max(mainWidth, subWidth)

  const logoW = logoImg ? fontSize * 1.3 : 0
  const logoGap = logoImg ? pad * 0.6 : 0
  const badgeW = pad + logoW + logoGap + textWidth + pad
  const badgeH = pad + fontSize + subFontSize * 0.8 + pad
  const badgeX = width - margin - badgeW
  const badgeY = margin

  // Draw rounded background
  ctx.globalAlpha = 0.45
  ctx.fillStyle = '#000000'
  const r = badgeH * 0.25
  ctx.beginPath()
  ctx.moveTo(badgeX + r, badgeY)
  ctx.lineTo(badgeX + badgeW - r, badgeY)
  ctx.quadraticCurveTo(badgeX + badgeW, badgeY, badgeX + badgeW, badgeY + r)
  ctx.lineTo(badgeX + badgeW, badgeY + badgeH - r)
  ctx.quadraticCurveTo(badgeX + badgeW, badgeY + badgeH, badgeX + badgeW - r, badgeY + badgeH)
  ctx.lineTo(badgeX + r, badgeY + badgeH)
  ctx.quadraticCurveTo(badgeX, badgeY + badgeH, badgeX, badgeY + badgeH - r)
  ctx.lineTo(badgeX, badgeY + r)
  ctx.quadraticCurveTo(badgeX, badgeY, badgeX + r, badgeY)
  ctx.fill()

  // Draw logo inside badge
  let contentX = badgeX + pad
  if (logoImg) {
    const logoH = logoW
    ctx.globalAlpha = 0.9
    ctx.drawImage(logoImg, contentX, badgeY + (badgeH - logoH) / 2, logoW, logoH)
    contentX += logoW + logoGap
  }

  // Draw "URLASTONE"
  ctx.fillStyle = '#ffffff'
  ctx.globalAlpha = 0.95
  ctx.font = `bold ${fontSize}px Inter, Arial, sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('URLASTONE', contentX, badgeY + pad)

  // Draw "urlastone.com"
  ctx.globalAlpha = 0.6
  ctx.font = `${subFontSize}px Inter, Arial, sans-serif`
  ctx.fillText('urlastone.com', contentX, badgeY + pad + fontSize * 1.05)

  // --- Diagonal repeating hologram watermarks ---
  ctx.globalAlpha = 0.06
  ctx.fillStyle = '#ffffff'
  const holoSize = Math.round(Math.min(width, height) * 0.04)
  ctx.font = `bold ${holoSize}px Inter, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Rotate -30 degrees for diagonal pattern
  const angle = -30 * (Math.PI / 180)
  const spacingX = holoSize * 10
  const spacingY = holoSize * 6

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

export default function StepResult({ originalUrl, resultUrl, stoneName, stoneCode, onTryAnother, onReset }: Props) {
  const { locale } = useLanguage()
  const t = RESULT_TEXTS[locale] || RESULT_TEXTS.tr
  const [sliderPos, setSliderPos] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [upscaling, setUpscaling] = useState(false)

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

      // Download — use Web Share API on mobile (saves to Photos on iOS)
      canvas.toBlob(async (blob) => {
        if (!blob) return
        const fileName = `urlastone-simulation-${Date.now()}.jpg`

        // Try Web Share API first (iOS/mobile — allows "Save to Photos")
        if (navigator.share && navigator.canShare) {
          try {
            const file = new File([blob], fileName, { type: 'image/jpeg' })
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({ files: [file], title: 'Urlastone Simulation' })
              return
            }
          } catch {
            // User cancelled or share failed — fall through to download
          }
        }

        // Fallback: standard download (desktop / Android)
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        a.click()
        URL.revokeObjectURL(url)
      }, 'image/jpeg', 0.92)
    } catch {
      // Fallback: open in new tab
      window.open(resultUrl, '_blank')
    }
  }, [resultUrl])

  // HD Download — upscale with Real-ESRGAN then download with watermark
  const handleHdDownload = useCallback(async () => {
    setUpscaling(true)
    try {
      // 1. Upscale via Replicate
      const res = await fetch('/api/simulation/upscale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: resultUrl, scale: 4 }),
      })

      if (!res.ok) throw new Error('Upscale failed')
      const { url: hdUrl } = await res.json()

      // 2. Load HD image + logo
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      const logoImg = new window.Image()
      logoImg.crossOrigin = 'anonymous'

      await Promise.all([
        new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = reject
          img.src = hdUrl
        }),
        new Promise<void>((resolve) => {
          logoImg.onload = () => resolve()
          logoImg.onerror = () => resolve()
          logoImg.src = '/logo.png'
        }),
      ])

      // 3. Create canvas with watermark
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      drawWatermarks(ctx, canvas.width, canvas.height, logoImg.complete && logoImg.naturalWidth > 0 ? logoImg : null)

      // 4. Download — use Web Share API on mobile
      canvas.toBlob(async (blob) => {
        if (!blob) return
        const fileName = `urlastone-simulation-HD-${Date.now()}.jpg`

        if (navigator.share && navigator.canShare) {
          try {
            const file = new File([blob], fileName, { type: 'image/jpeg' })
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({ files: [file], title: 'Urlastone Simulation HD' })
              return
            }
          } catch {
            // Fall through
          }
        }

        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        a.click()
        URL.revokeObjectURL(url)
      }, 'image/jpeg', 0.95)
    } catch {
      // Fallback to normal download
      handleDownload()
    } finally {
      setUpscaling(false)
    }
  }, [resultUrl, handleDownload])

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
          {/* Corner watermark — top-right */}
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/30 rounded-md px-1.5 py-0.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" className="w-4 h-4 md:w-5 md:h-5 brightness-[10] opacity-70" draggable={false} />
            <div>
              <span className="text-white/80 text-[7px] md:text-[9px] font-bold tracking-wider block leading-tight">URLASTONE</span>
              <span className="text-white/40 text-[5px] md:text-[6px] font-mono block leading-tight">urlastone.com</span>
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
          className="inline-flex items-center gap-2 bg-white/10 text-white px-5 py-3 rounded-full text-sm font-medium hover:bg-white/20 transition-colors border border-white/10"
        >
          <Download size={16} />
          {t.download}
        </button>

        <button
          onClick={handleHdDownload}
          disabled={upscaling}
          className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-stone-200 transition-colors disabled:opacity-50"
        >
          {upscaling ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {t.upscaling}
            </>
          ) : (
            <>
              <ZoomIn size={16} />
              {t.downloadHd}
            </>
          )}
        </button>

        <Link
          href={`/teklif${stoneCode ? `?product=${stoneCode}` : ''}`}
          onClick={() => {
            try {
              sessionStorage.setItem('simulationData', JSON.stringify({
                resultUrl,
                originalUrl,
                stoneName,
                stoneCode,
              }))
            } catch { /* ignore */ }
          }}
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
