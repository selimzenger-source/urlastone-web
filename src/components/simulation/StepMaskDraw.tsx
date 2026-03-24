'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowLeft, Paintbrush, RotateCcw, Trash2, Sparkles, AlertCircle, Mic, MicOff, MessageSquare } from 'lucide-react'
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

const BRUSH_COLORS = [
  { color: 'rgba(179, 147, 69, 0.45)', label: 'Gold' },
  { color: 'rgba(59, 130, 246, 0.45)', label: 'Blue' },
  { color: 'rgba(239, 68, 68, 0.45)', label: 'Red' },
  { color: 'rgba(34, 197, 94, 0.45)', label: 'Green' },
]

const MASK_TEXTS: Record<string, {
  title: string; desc: string; brush: string; undo: string; clear: string; color: string
  submit: string; back: string; hint: string; chatPlaceholder: string; micTooltip: string; micListening: string
  instructionNote: string
}> = {
  tr: {
    title: 'Alanı İşaretleyin',
    desc: 'Taş kaplamak istediğiniz duvar yüzeylerini boyayın',
    brush: 'Fırça',
    color: 'Renk',
    undo: 'Geri Al',
    clear: 'Temizle',
    submit: 'AI ile Uygula',
    back: 'Geri',
    hint: 'Taş uygulamak istediğiniz duvar alanlarını boyayın',
    instructionNote: 'Pencere, kapı, gökyüzü ve zemini boyamayın — sadece taş kaplamak istediğiniz duvarları işaretleyin',
    brushNote: 'AI boyanan bölgeye yakın alanlara da uygulayabilir — tam hassas sonuç için "Tüm Alana Uygula" tercih edin',
    chatPlaceholder: 'AI\'ya ek talimat yazmak için buraya tıklayın... Örn: "Sadece zemin kata uygula"',
    micTooltip: 'Mikrofona basıp konuşarak not ekleyin',
    micListening: 'Dinliyor...',
  },
  en: {
    title: 'Mark the Area',
    desc: 'Paint the wall surfaces where you want stone applied',
    brush: 'Brush',
    color: 'Color',
    undo: 'Undo',
    clear: 'Clear',
    submit: 'Apply with AI',
    back: 'Back',
    hint: 'Paint the wall areas where you want stone applied',
    instructionNote: 'Avoid painting windows, doors, sky, and ground — only mark the walls you want clad',
    brushNote: 'AI may also apply to nearby areas — for precise full coverage use "Apply to Full Surface" instead',
    chatPlaceholder: 'Click here to add instructions for AI... E.g. "Only apply to ground floor"',
    micTooltip: 'Tap and speak to add a voice note',
    micListening: 'Listening...',
  },
  es: {
    title: 'Marque el area',
    desc: 'Pinte las superficies de pared donde desea aplicar piedra',
    brush: 'Pincel',
    color: 'Color',
    undo: 'Deshacer',
    clear: 'Limpiar',
    submit: 'Aplicar con IA',
    back: 'Atras',
    hint: 'Aumente el tamano del pincel y pinte las areas de pared',
    instructionNote: 'Evite pintar ventanas, puertas, cielo y suelo — solo marque las paredes',
    brushNote: 'La IA puede aplicar tambien a areas cercanas — para cobertura completa use "Aplicar a toda la superficie"',
    chatPlaceholder: 'Haga clic aqui para agregar instrucciones para IA... Ej: "Solo planta baja"',
    micTooltip: 'Toque y hable para agregar una nota de voz',
    micListening: 'Escuchando...',
  },
  ar: {
    title: 'حدد المنطقة',
    desc: 'ارسم على أسطح الجدران التي تريد تطبيق الحجر عليها',
    brush: 'فرشاة',
    color: 'لون',
    undo: 'تراجع',
    clear: 'مسح',
    submit: 'تطبيق بالذكاء الاصطناعي',
    back: 'رجوع',
    hint: 'كبّر الفرشاة وارسم على مناطق الجدران',
    instructionNote: 'تجنب رسم النوافذ والأبواب والسماء والأرض — حدد فقط الجدران',
    brushNote: 'قد يطبق الذكاء الاصطناعي على المناطق القريبة أيضًا — للتغطية الكاملة استخدم "تطبيق على كامل السطح"',
    chatPlaceholder: 'انقر هنا لإضافة تعليمات للذكاء الاصطناعي... مثال: "الطابق الأرضي فقط"',
    micTooltip: 'اضغط وتحدث لإضافة ملاحظة صوتية',
    micListening: 'جارٍ الاستماع...',
  },
  de: {
    title: 'Bereich markieren',
    desc: 'Markieren Sie die Wandflachen fur die Steinverkleidung',
    brush: 'Pinsel',
    color: 'Farbe',
    undo: 'Ruckgangig',
    clear: 'Loschen',
    submit: 'Mit KI anwenden',
    back: 'Zuruck',
    hint: 'Pinselgrosse erhohen und Wandflachen bemalen',
    instructionNote: 'Vermeiden Sie Fenster, Turen, Himmel und Boden — markieren Sie nur die Wandflachen',
    brushNote: 'KI kann auch auf nahe Bereiche anwenden — fur volle Abdeckung verwenden Sie "Auf gesamte Flache anwenden"',
    chatPlaceholder: 'Klicken Sie hier, um KI-Anweisungen hinzuzufugen... Z.B. "Nur Erdgeschoss"',
    micTooltip: 'Tippen und sprechen Sie fur eine Sprachnotiz',
    micListening: 'Hort zu...',
  },
}

export default function StepMaskDraw({ imageDataUrl, imageWidth, imageHeight, stoneName, onSubmit, onBack, error }: Props) {
  const { locale } = useLanguage()
  const t = MASK_TEXTS[locale] || MASK_TEXTS.tr

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushSize, setBrushSize] = useState(60)
  const [brushColor, setBrushColor] = useState(BRUSH_COLORS[0].color)
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
    ctx.fillStyle = brushColor
    ctx.beginPath()
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
    ctx.fill()
    setHasMask(true)
  }, [brushSize, brushColor])

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
      <div className="flex items-center gap-3 mb-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
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

        {/* Brush color picker */}
        <div className="flex items-center gap-1.5">
          {BRUSH_COLORS.map((bc) => (
            <button
              key={bc.label}
              onClick={() => setBrushColor(bc.color)}
              className={`w-5 h-5 rounded-full border-2 transition-all ${
                brushColor === bc.color ? 'border-white scale-110' : 'border-white/20 hover:border-white/50'
              }`}
              style={{ backgroundColor: bc.color.replace('0.45', '1') }}
              title={bc.label}
            />
          ))}
        </div>

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

      {/* Instruction note between toolbar and canvas */}
      <div className="flex items-start gap-2 mb-2 px-2 py-2 bg-gold-400/[0.06] rounded-lg border border-gold-400/[0.10]">
        <span className="text-base leading-none mt-0.5">📌</span>
        <p className="text-gold-400 text-[13px] font-body leading-snug">
          {t.instructionNote}
        </p>
      </div>
      <p className="text-white/25 text-[10px] font-body mb-3 px-2">
        {t.brushNote}
      </p>

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

      {/* Chat-style input box for AI instructions */}
      <div className="mt-4 relative">
        <div className="absolute left-4 top-4 text-white/20">
          <MessageSquare size={16} />
        </div>
        <textarea
          value={userNote}
          onChange={(e) => setUserNote(e.target.value)}
          placeholder={t.chatPlaceholder}
          rows={3}
          className="w-full bg-white/[0.04] border border-white/[0.10] rounded-2xl pl-11 pr-12 py-3.5 text-white/80 text-sm font-body placeholder:text-white/25 resize-none focus:outline-none focus:border-gold-400/40 focus:bg-white/[0.06] transition-all"
        />
        {speechSupported && (
          <button
            onClick={toggleSpeech}
            className={`absolute right-3 top-3.5 p-2 rounded-xl transition-all ${
              isListening
                ? 'text-red-400 bg-red-400/10 animate-pulse'
                : 'text-white/30 hover:text-gold-400 hover:bg-white/[0.06]'
            }`}
            title={isListening ? t.micListening : t.micTooltip}
            type="button"
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
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
