'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowLeft, Square, RotateCcw, Sparkles, AlertCircle, Mic, MicOff, MessageSquare, Move } from 'lucide-react'
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
  fr: 'fr-FR',
  ru: 'ru-RU',
}

const MASK_TEXTS: Record<string, {
  title: string; desc: string; clear: string
  submit: string; back: string; hint: string
  chatPlaceholder: string; micTooltip: string; micListening: string
  instructionNote: string; brushNote: string
}> = {
  tr: {
    title: 'Alanı Seçin',
    desc: 'Taş uygulamak istediğiniz alanı dikdörtgen ile seçin',
    clear: 'Temizle',
    submit: 'Seçili Alana Uygula',
    back: 'Geri',
    hint: 'Parmağınızla sürükleyerek alan seçin',
    instructionNote: 'Taş uygulamak istediğiniz duvar alanını dikdörtgen çizerek seçin',
    brushNote: 'AI seçilen bölgeye taş uygulayacak, diğer alanlar aynen kalacak',
    chatPlaceholder: 'AI\'ya ek talimat... Örn: "Sadece duvarlara uygula, pencereyi atla"',
    micTooltip: 'Mikrofona basıp konuşarak not ekleyin',
    micListening: 'Dinliyor...',
  },
  en: {
    title: 'Select Area',
    desc: 'Draw a rectangle to select the area for stone application',
    clear: 'Clear',
    submit: 'Apply to Selected Area',
    back: 'Back',
    hint: 'Drag to select an area',
    instructionNote: 'Draw a rectangle over the wall area where you want stone applied',
    brushNote: 'AI will apply stone to the selected area, other areas remain unchanged',
    chatPlaceholder: 'Add instructions for AI... E.g. "Only apply to walls, skip windows"',
    micTooltip: 'Tap and speak to add a voice note',
    micListening: 'Listening...',
  },
  es: {
    title: 'Seleccionar área',
    desc: 'Dibuje un rectángulo para seleccionar el área de aplicación',
    clear: 'Limpiar',
    submit: 'Aplicar al área seleccionada',
    back: 'Atrás',
    hint: 'Arrastre para seleccionar un área',
    instructionNote: 'Dibuje un rectángulo sobre el área de pared donde desea aplicar piedra',
    brushNote: 'La IA aplicará piedra al área seleccionada, otras áreas permanecerán sin cambios',
    chatPlaceholder: 'Instrucciones para IA... Ej: "Solo paredes, omitir ventanas"',
    micTooltip: 'Toque y hable para agregar nota de voz',
    micListening: 'Escuchando...',
  },
  ar: {
    title: 'حدد المنطقة',
    desc: 'ارسم مستطيلاً لتحديد منطقة تطبيق الحجر',
    clear: 'مسح',
    submit: 'تطبيق على المنطقة المحددة',
    back: 'رجوع',
    hint: 'اسحب لتحديد منطقة',
    instructionNote: 'ارسم مستطيلاً فوق منطقة الجدار التي تريد تطبيق الحجر عليها',
    brushNote: 'سيطبق الذكاء الاصطناعي الحجر على المنطقة المحددة فقط',
    chatPlaceholder: 'تعليمات للذكاء الاصطناعي... مثال: "فقط الجدران"',
    micTooltip: 'اضغط وتحدث لإضافة ملاحظة',
    micListening: 'جارٍ الاستماع...',
  },
  de: {
    title: 'Bereich auswählen',
    desc: 'Zeichnen Sie ein Rechteck, um den Bereich auszuwählen',
    clear: 'Löschen',
    submit: 'Auf ausgewählten Bereich anwenden',
    back: 'Zurück',
    hint: 'Ziehen Sie, um einen Bereich auszuwählen',
    instructionNote: 'Zeichnen Sie ein Rechteck über den Wandbereich für die Steinverkleidung',
    brushNote: 'KI wendet Stein nur auf den ausgewählten Bereich an',
    chatPlaceholder: 'KI-Anweisungen... Z.B. "Nur Wände, Fenster überspringen"',
    micTooltip: 'Tippen und sprechen für Sprachnotiz',
    micListening: 'Hört zu...',
  },
}

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export default function StepMaskDraw({ imageDataUrl, imageWidth, imageHeight, stoneName, onSubmit, onBack, error }: Props) {
  const { locale } = useLanguage()
  const t = MASK_TEXTS[locale] || MASK_TEXTS.tr

  const containerRef = useRef<HTMLDivElement>(null)
  const [rect, setRect] = useState<Rect | null>(null)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 })

  // User note + speech
  const [userNote, setUserNote] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const recognitionRef = useRef<ReturnType<typeof createRecognition> | null>(null)

  useEffect(() => {
    const supported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    setSpeechSupported(supported)
  }, [])

  // Measure container
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const updateSize = () => {
      const w = el.clientWidth
      const h = Math.round(w * (imageHeight / imageWidth))
      setContainerSize({ w, h })
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [imageWidth, imageHeight])

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const el = containerRef.current!
    const bounds = el.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    return {
      x: Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width)),
      y: Math.max(0, Math.min(1, (clientY - bounds.top) / bounds.height)),
    }
  }, [])

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const pos = getPos(e)
    setDragStart(pos)
    setIsDragging(true)
    setRect(null)
  }, [getPos])

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!isDragging || !dragStart) return
    const pos = getPos(e)
    setRect({
      x: Math.min(dragStart.x, pos.x),
      y: Math.min(dragStart.y, pos.y),
      w: Math.abs(pos.x - dragStart.x),
      h: Math.abs(pos.y - dragStart.y),
    })
  }, [isDragging, dragStart, getPos])

  const handleEnd = useCallback(() => {
    setIsDragging(false)
    setDragStart(null)
    // Remove tiny rectangles (accidental clicks)
    if (rect && (rect.w < 0.03 || rect.h < 0.03)) {
      setRect(null)
    }
  }, [rect])

  // Speech
  const toggleSpeech = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }
    const recognition = createRecognition(locale)
    if (!recognition) return
    recognitionRef.current = recognition
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setUserNote(prev => prev ? prev + ' ' + transcript : transcript)
    }
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)
    recognition.start()
    setIsListening(true)
  }, [isListening, locale])

  useEffect(() => {
    return () => { recognitionRef.current?.stop() }
  }, [])

  // Generate mask from rectangle
  const handleSubmit = useCallback(() => {
    if (!rect) return

    const maskCanvas = document.createElement('canvas')
    maskCanvas.width = imageWidth
    maskCanvas.height = imageHeight
    const ctx = maskCanvas.getContext('2d')!

    // Black background (= keep original)
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, imageWidth, imageHeight)

    // White rectangle (= apply stone)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(
      Math.round(rect.x * imageWidth),
      Math.round(rect.y * imageHeight),
      Math.round(rect.w * imageWidth),
      Math.round(rect.h * imageHeight),
    )

    const maskDataUrl = maskCanvas.toDataURL('image/png')
    onSubmit(maskDataUrl, userNote.trim() || undefined)
  }, [rect, imageWidth, imageHeight, onSubmit, userNote])

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

      {/* Instruction */}
      <div className="flex items-start gap-2 mb-2 px-2 py-2 bg-gold-400/[0.06] rounded-lg border border-gold-400/[0.10]">
        <Square size={14} className="text-gold-400 mt-0.5 flex-shrink-0" />
        <p className="text-gold-400 text-[13px] font-body leading-snug">
          {t.instructionNote}
        </p>
      </div>
      <p className="text-white/25 text-[10px] font-body mb-3 px-2">
        {t.brushNote}
      </p>

      {/* Image + Rectangle selection area */}
      <div
        ref={containerRef}
        className="relative rounded-xl overflow-hidden border border-white/[0.08] bg-black cursor-crosshair select-none touch-none"
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageDataUrl}
          alt="Source"
          className="w-full h-auto block select-none pointer-events-none"
          draggable={false}
        />

        {/* Semi-transparent overlay outside rectangle */}
        {rect && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/50" />
            {/* Clear window (the selected area) */}
            <div
              className="absolute bg-transparent border-2 border-gold-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
              style={{
                left: `${rect.x * 100}%`,
                top: `${rect.y * 100}%`,
                width: `${rect.w * 100}%`,
                height: `${rect.h * 100}%`,
              }}
            >
              {/* Corner handles */}
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-gold-400 rounded-sm" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gold-400 rounded-sm" />
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-gold-400 rounded-sm" />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-gold-400 rounded-sm" />
              {/* Center move icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Move size={20} className="text-gold-400/60" />
              </div>
            </div>
          </div>
        )}

        {/* Hint overlay when no rect */}
        {!rect && !isDragging && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
              <Square size={14} className="text-gold-400/60" />
              <span className="text-white/60 text-xs font-mono">{t.hint}</span>
            </div>
          </div>
        )}
      </div>

      {/* Clear button */}
      {rect && (
        <div className="mt-3 text-center">
          <button
            onClick={() => setRect(null)}
            className="inline-flex items-center gap-1.5 text-white/40 text-xs hover:text-white/70 transition-colors"
          >
            <RotateCcw size={12} />
            {t.clear}
          </button>
        </div>
      )}

      {/* Chat input */}
      <div className="mt-4 relative">
        <div className="absolute left-4 top-4 text-white/20">
          <MessageSquare size={16} />
        </div>
        <textarea
          value={userNote}
          onChange={(e) => setUserNote(e.target.value)}
          placeholder={t.chatPlaceholder}
          rows={2}
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

      {/* Submit */}
      <div className="mt-6 text-center">
        <button
          onClick={handleSubmit}
          disabled={!rect}
          className="inline-flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-full text-sm font-medium hover:bg-stone-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Sparkles size={16} />
          {t.submit}
        </button>
      </div>
    </div>
  )
}

// Helper to create SpeechRecognition instance
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
