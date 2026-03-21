'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowLeft, Paintbrush, RotateCcw, Trash2, Sparkles, AlertCircle, Maximize, Square } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface Props {
  imageDataUrl: string
  imageWidth: number
  imageHeight: number
  stoneName: string
  onSubmit: (maskDataUrl: string) => void
  onBack: () => void
  error: string | null
}

const MASK_TEXTS: Record<string, { title: string; desc: string; brush: string; undo: string; clear: string; submit: string; back: string; hint: string; fillAll: string; fillAllDesc: string }> = {
  tr: {
    title: 'Alanı İşaretleyin',
    desc: 'Taş uygulamak istediğiniz yüzeyleri boyayın — tüm cephe için "Tümünü Boya" butonunu kullanın',
    brush: 'Fırça',
    undo: 'Geri Al',
    clear: 'Temizle',
    submit: 'AI ile Uygula',
    back: 'Geri',
    hint: 'Fırça ile boyayın veya "Tümünü Boya" butonuna tıklayın',
    fillAll: 'Tümünü Boya',
    fillAllDesc: 'Tüm yüzeyi seç',
  },
  en: {
    title: 'Mark the Area',
    desc: 'Paint the surfaces where you want stone applied — use "Fill All" for the entire facade',
    brush: 'Brush',
    undo: 'Undo',
    clear: 'Clear',
    submit: 'Apply with AI',
    back: 'Back',
    hint: 'Paint with brush or click "Fill All"',
    fillAll: 'Fill All',
    fillAllDesc: 'Select entire surface',
  },
  es: {
    title: 'Marque el área',
    desc: 'Pinte las superficies donde desea aplicar piedra — use "Pintar Todo" para toda la fachada',
    brush: 'Pincel',
    undo: 'Deshacer',
    clear: 'Limpiar',
    submit: 'Aplicar con IA',
    back: 'Atrás',
    hint: 'Pinte con el pincel o haga clic en "Pintar Todo"',
    fillAll: 'Pintar Todo',
    fillAllDesc: 'Seleccionar toda la superficie',
  },
  ar: {
    title: 'حدد المنطقة',
    desc: 'ارسم على الأسطح التي تريد تطبيق الحجر عليها — استخدم "طلاء الكل" للواجهة بأكملها',
    brush: 'فرشاة',
    undo: 'تراجع',
    clear: 'مسح',
    submit: 'تطبيق بالذكاء الاصطناعي',
    back: 'رجوع',
    hint: 'ارسم بالفرشاة أو انقر "طلاء الكل"',
    fillAll: 'طلاء الكل',
    fillAllDesc: 'تحديد كامل السطح',
  },
  de: {
    title: 'Bereich markieren',
    desc: 'Malen Sie die Flächen, auf die Stein aufgetragen werden soll — verwenden Sie "Alles füllen" für die gesamte Fassade',
    brush: 'Pinsel',
    undo: 'Rückgängig',
    clear: 'Löschen',
    submit: 'Mit KI anwenden',
    back: 'Zurück',
    hint: 'Mit Pinsel malen oder "Alles füllen" klicken',
    fillAll: 'Alles füllen',
    fillAllDesc: 'Gesamte Fläche auswählen',
  },
}

export default function StepMaskDraw({ imageDataUrl, imageWidth, imageHeight, stoneName, onSubmit, onBack, error }: Props) {
  const { locale } = useLanguage()
  const t = MASK_TEXTS[locale] || MASK_TEXTS.tr

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushSize, setBrushSize] = useState(60)
  const [history, setHistory] = useState<ImageData[]>([])
  const [hasMask, setHasMask] = useState(false)

  // Fill entire canvas with mask
  const handleFillAll = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    // Save state for undo
    setHistory(prev => [...prev, ctx.getImageData(0, 0, canvas.width, canvas.height)])
    ctx.fillStyle = 'rgba(179, 147, 69, 0.45)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasMask(true)
  }, [])

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    // Set canvas size to match image
    const container = canvas.parentElement!
    const maxW = container.clientWidth
    const scale = Math.min(maxW / imageWidth, 600 / imageHeight)
    canvas.width = Math.round(imageWidth * scale)
    canvas.height = Math.round(imageHeight * scale)

    // Clear with transparent
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }, [imageWidth, imageHeight])

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    }
  }, [])

  const drawCircle = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = 'rgba(179, 147, 69, 0.45)' // gold with transparency
    ctx.beginPath()
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
    ctx.fill()
    setHasMask(true)
  }, [brushSize])

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    // Save state for undo
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    setHistory(prev => [...prev, ctx.getImageData(0, 0, canvas.width, canvas.height)])

    setIsDrawing(true)
    const pos = getPos(e)
    drawCircle(pos.x, pos.y)
  }, [getPos, drawCircle])

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!isDrawing) return
    const pos = getPos(e)
    drawCircle(pos.x, pos.y)
  }, [isDrawing, getPos, drawCircle])

  const handleEnd = useCallback(() => {
    setIsDrawing(false)
  }, [])

  const handleUndo = useCallback(() => {
    if (history.length === 0) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const prev = history[history.length - 1]
    ctx.putImageData(prev, 0, 0)
    setHistory(h => h.slice(0, -1))
    // Check if any mask remains
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    setHasMask(data.some((v, i) => i % 4 === 3 && v > 0))
  }, [history])

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHistory([])
    setHasMask(false)
  }, [])

  const handleSubmit = useCallback(() => {
    const canvas = canvasRef.current!

    // Create mask: white where painted, black everywhere else
    const maskCanvas = document.createElement('canvas')
    maskCanvas.width = imageWidth
    maskCanvas.height = imageHeight
    const maskCtx = maskCanvas.getContext('2d')!

    // Fill black background
    maskCtx.fillStyle = '#000000'
    maskCtx.fillRect(0, 0, imageWidth, imageHeight)

    // Draw the overlay canvas scaled up to original image size → white areas = mask
    // This preserves the exact painted shape
    maskCtx.drawImage(canvas, 0, 0, imageWidth, imageHeight)

    // Convert: any non-black pixel → white (the gold overlay becomes white mask)
    const imgData = maskCtx.getImageData(0, 0, imageWidth, imageHeight)
    const data = imgData.data
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 10) {
        // Has alpha / color → make pure white
        data[i] = 255
        data[i + 1] = 255
        data[i + 2] = 255
        data[i + 3] = 255
      } else {
        // Transparent → make pure black
        data[i] = 0
        data[i + 1] = 0
        data[i + 2] = 0
        data[i + 3] = 255
      }
    }
    maskCtx.putImageData(imgData, 0, 0)

    const maskDataUrl = maskCanvas.toDataURL('image/png')
    onSubmit(maskDataUrl)
  }, [imageWidth, imageHeight, onSubmit])

  return (
    <div className="glass-card p-6 md:p-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-1">
            {t.title}
          </h2>
          <p className="text-white/40 text-sm font-body">{t.desc}</p>
          <p className="text-gold-400 text-xs font-mono mt-1">{stoneName}</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-white/30 text-xs hover:text-white/60 transition-colors"
        >
          <ArrowLeft size={12} /> {t.back}
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
        <Paintbrush size={14} className="text-gold-400" />
        <span className="text-white/40 text-xs font-mono">{t.brush}:</span>
        <input
          type="range"
          min={10}
          max={200}
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold-400"
        />
        <span className="text-white/30 text-[10px] font-mono w-6 text-right">{brushSize}</span>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Fill All button */}
        <button
          onClick={handleFillAll}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-400/10 text-gold-400 text-[11px] font-medium hover:bg-gold-400/20 transition-colors border border-gold-400/20"
          title={t.fillAllDesc}
        >
          <Maximize size={12} />
          {t.fillAll}
        </button>

        <div className="w-px h-5 bg-white/10 mx-1" />

        <button
          onClick={handleUndo}
          disabled={history.length === 0}
          className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-20"
          title={t.undo}
        >
          <RotateCcw size={14} />
        </button>
        <button
          onClick={handleClear}
          disabled={!hasMask}
          className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/[0.06] transition-colors disabled:opacity-20"
          title={t.clear}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Canvas area */}
      <div className="relative rounded-xl overflow-hidden border border-white/[0.08] bg-black">
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageDataUrl}
          alt="Source"
          className="w-full h-auto block select-none pointer-events-none"
          draggable={false}
        />

        {/* Drawing canvas overlay */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
          style={{ mixBlendMode: 'normal' }}
        />

        {/* Hint overlay when no mask */}
        {!hasMask && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-white/60 text-xs font-mono">{t.hint}</span>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-400/[0.06] rounded-xl px-4 py-3">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Submit button */}
      <div className="mt-6 text-center">
        <button
          onClick={handleSubmit}
          disabled={!hasMask}
          className="inline-flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-full text-sm font-medium hover:bg-stone-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Sparkles size={16} />
          {t.submit}
        </button>
      </div>
    </div>
  )
}
