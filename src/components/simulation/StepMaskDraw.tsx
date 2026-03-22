'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowLeft, Paintbrush, RotateCcw, Trash2, Sparkles, AlertCircle, Mic, MicOff } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface Props {
  imageDataUrl: string
  imageWidth: number
  imageHeight: number
  stoneName: string
  onSubmit: (maskDataUrl: string, userNote?: string) => void
  onBack: () => void
  error: string | null
}

const LOCALE_MAP: Record<string, string> = {
  tr: 'tr-TR',
  en: 'en-US',
  es: 'es-ES',
  ar: 'ar-SA',
  de: 'de-DE',
}

const MASK_TEXTS: Record<string, {
  title: string; desc: string; brush: string; undo: string; clear: string
  submit: string; back: string; hint: string; notePlaceholder: string; micTooltip: string; micListening: string
}> = {
  tr: {
    title: 'Alanı İşaretleyin',
    desc: 'Parmağınızla veya farenizle taş uygulamak istediğiniz duvar bölgelerini boyayın. Fırça boyutunu kaydırıcıyla ayarlayabilirsiniz. Pencere, kapı, gökyüzü ve zemin gibi alanları boyamayın — sadece taş kaplamak istediğiniz duvar yüzeylerini işaretleyin',
    brush: 'Fırça',
    undo: 'Geri Al',
    clear: 'Temizle',
    submit: 'AI ile Uygula',
    back: 'Geri',
    hint: 'Fırçayı büyütüp taş uygulanacak duvar alanlarını boyayın',
    notePlaceholder: 'Opsiyonel: AI\'ya ek talimat yazın veya sesli not bırakın (🎤). Örn: "Sadece zemin kata uygula", "Köşeleri boş bırak", "Balkon altlarını kapla"',
    micTooltip: 'Mikrofona basıp konuşarak not ekleyin',
    micListening: 'Dinliyor... Konuşmayı bitirince otomatik duracak',
  },
  en: {
    title: 'Mark the Area',
    desc: 'Use your finger or mouse to paint the wall areas where you want stone applied. Adjust brush size with the slider. Avoid painting windows, doors, sky, and ground — only mark the wall surfaces you want clad with stone',
    brush: 'Brush',
    undo: 'Undo',
    clear: 'Clear',
    submit: 'Apply with AI',
    back: 'Back',
    hint: 'Increase brush size and paint the wall areas for stone cladding',
    notePlaceholder: 'Optional: Add instructions for AI or use voice (🎤). E.g. "Only apply to ground floor", "Skip the corners", "Cover balcony walls too"',
    micTooltip: 'Tap and speak to add a voice note',
    micListening: 'Listening... Will stop automatically when you finish',
  },
  es: {
    title: 'Marque el area',
    desc: 'Use su dedo o raton para pintar las areas de pared donde desea aplicar piedra. Ajuste el tamano del pincel con el control deslizante. Evite pintar ventanas, puertas, cielo y suelo — solo marque las superficies de pared que desea revestir',
    brush: 'Pincel',
    undo: 'Deshacer',
    clear: 'Limpiar',
    submit: 'Aplicar con IA',
    back: 'Atras',
    hint: 'Aumente el tamano del pincel y pinte las areas de pared para revestimiento',
    notePlaceholder: 'Opcional: Instrucciones para IA o use voz (🎤). Ej: "Solo planta baja", "Dejar las esquinas", "Cubrir balcones"',
    micTooltip: 'Toque y hable para agregar una nota de voz',
    micListening: 'Escuchando... Se detendra automaticamente',
  },
  ar: {
    title: 'حدد المنطقة',
    desc: 'استخدم إصبعك أو الماوس لرسم مناطق الجدران التي تريد تطبيق الحجر عليها. اضبط حجم الفرشاة باستخدام شريط التمرير. تجنب رسم النوافذ والأبواب والسماء والأرض — حدد فقط أسطح الجدران المراد تكسيتها',
    brush: 'فرشاة',
    undo: 'تراجع',
    clear: 'مسح',
    submit: 'تطبيق بالذكاء الاصطناعي',
    back: 'رجوع',
    hint: 'كبّر الفرشاة وارسم على مناطق الجدران المراد تكسيتها بالحجر',
    notePlaceholder: 'اختياري: أضف تعليمات للذكاء الاصطناعي أو استخدم الصوت (🎤). مثال: "الطابق الأرضي فقط"، "اترك الزوايا"',
    micTooltip: 'اضغط وتحدث لإضافة ملاحظة صوتية',
    micListening: 'جارٍ الاستماع... سيتوقف تلقائياً',
  },
  de: {
    title: 'Bereich markieren',
    desc: 'Verwenden Sie Ihren Finger oder die Maus, um die Wandbereiche zu markieren, auf denen Stein angebracht werden soll. Passen Sie die Pinselgrosse mit dem Schieberegler an. Vermeiden Sie Fenster, Turen, Himmel und Boden — markieren Sie nur die Wandflachen fur die Steinverkleidung',
    brush: 'Pinsel',
    undo: 'Ruckgangig',
    clear: 'Loschen',
    submit: 'Mit KI anwenden',
    back: 'Zuruck',
    hint: 'Pinselgrosse erhohen und Wandflachen fur Steinverkleidung bemalen',
    notePlaceholder: 'Optional: Anweisungen fur KI oder Sprachnotiz (🎤). Z.B. "Nur Erdgeschoss", "Ecken auslassen", "Balkone abdecken"',
    micTooltip: 'Tippen und sprechen Sie fur eine Sprachnotiz',
    micListening: 'Hort zu... Stoppt automatisch',
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

  // User note + speech
  const [userNote, setUserNote] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const recognitionRef = useRef<ReturnType<typeof createRecognition> | null>(null)

  // Check speech API support on mount
  useEffect(() => {
    const supported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    setSpeechSupported(supported)
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

  // Speech recognition toggle
  const toggleSpeech = useCallback(() => {
    if (isListening) {
      // Stop
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    // Start
    const recognition = createRecognition(locale)
    if (!recognition) return

    recognitionRef.current = recognition
    recognition.lang = LOCALE_MAP[locale] || 'tr-TR'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setUserNote(prev => prev ? prev + ' ' + transcript : transcript)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.start()
    setIsListening(true)
  }, [isListening, locale])

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  const handleSubmit = useCallback(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    // Read the drawing canvas pixels (gold overlay with alpha)
    const srcData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    // Create mask at original image dimensions
    const maskCanvas = document.createElement('canvas')
    maskCanvas.width = imageWidth
    maskCanvas.height = imageHeight
    const maskCtx = maskCanvas.getContext('2d')!

    // Fill entire mask with black (= keep original)
    maskCtx.fillStyle = '#000000'
    maskCtx.fillRect(0, 0, imageWidth, imageHeight)

    // Scale factors from drawing canvas → original image
    const scaleX = imageWidth / canvas.width
    const scaleY = imageHeight / canvas.height

    // For each pixel in the drawing canvas, if it has alpha > 10,
    // fill a scaled rectangle with white in the mask
    maskCtx.fillStyle = '#ffffff'
    const step = 2 // Process every 2nd pixel for performance
    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        const idx = (y * canvas.width + x) * 4
        if (srcData.data[idx + 3] > 10) {
          maskCtx.fillRect(
            Math.floor(x * scaleX),
            Math.floor(y * scaleY),
            Math.ceil(step * scaleX),
            Math.ceil(step * scaleY)
          )
        }
      }
    }

    const maskDataUrl = maskCanvas.toDataURL('image/png')
    onSubmit(maskDataUrl, userNote.trim() || undefined)
  }, [imageWidth, imageHeight, onSubmit, userNote])

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

      {/* User note textarea + microphone */}
      <div className="mt-4 relative">
        <textarea
          value={userNote}
          onChange={(e) => setUserNote(e.target.value)}
          placeholder={t.notePlaceholder}
          rows={2}
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 pr-12 text-white/80 text-sm font-body placeholder:text-white/20 resize-none focus:outline-none focus:border-gold-400/30 transition-colors"
        />
        {speechSupported && (
          <button
            onClick={toggleSpeech}
            className={`absolute right-3 top-3 p-1.5 rounded-lg transition-all ${
              isListening
                ? 'text-red-400 bg-red-400/10 animate-pulse'
                : 'text-white/30 hover:text-gold-400 hover:bg-white/[0.06]'
            }`}
            title={isListening ? t.micListening : t.micTooltip}
            type="button"
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
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

// Helper to create SpeechRecognition instance (browser compat)
function createRecognition(locale: string) {
  if (typeof window === 'undefined') return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SpeechRecognition) return null
  const recognition = new SpeechRecognition()
  recognition.lang = LOCALE_MAP[locale] || 'tr-TR'
  recognition.continuous = false
  recognition.interimResults = false
  return recognition
}
