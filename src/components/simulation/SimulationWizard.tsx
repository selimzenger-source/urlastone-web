'use client'

import { useState, useEffect, useCallback } from 'react'
import { Upload, Gem, Wand2, Sparkles, Eye, Info } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import type { SimStep, StoneOption, ApplyMode, SurfaceContext } from '@/lib/simulation'
import { resizeImage } from '@/lib/simulation'
import StepUpload from './StepUpload'
import StepSelectStone from './StepSelectStone'
import StepApplyMode from './StepApplyMode'
import StepMaskDraw from './StepMaskDraw'
import StepResult from './StepResult'

const DAILY_LOCAL_LIMIT = 3

const STEPS: { key: SimStep; icon: typeof Upload }[] = [
  { key: 'upload', icon: Upload },
  { key: 'select', icon: Gem },
  { key: 'mode', icon: Wand2 },
  { key: 'result', icon: Eye },
]

const STEP_LABELS: Record<string, Record<SimStep, string>> = {
  tr: { upload: 'Fotoğraf', select: 'Taş Seç', mode: 'Uygulama', mask: 'Alan İşaretle', processing: 'İşleniyor', result: 'Sonuç' },
  en: { upload: 'Photo', select: 'Select Stone', mode: 'Apply', mask: 'Mark Area', processing: 'Processing', result: 'Result' },
  es: { upload: 'Foto', select: 'Seleccionar', mode: 'Aplicar', mask: 'Marcar Área', processing: 'Procesando', result: 'Resultado' },
  ar: { upload: 'صورة', select: 'اختر حجر', mode: 'تطبيق', mask: 'حدد المنطقة', processing: 'جاري المعالجة', result: 'النتيجة' },
  de: { upload: 'Foto', select: 'Stein wählen', mode: 'Anwenden', mask: 'Bereich markieren', processing: 'Verarbeitung', result: 'Ergebnis' },
}

const INFO_TEXTS: Record<string, { limit: string; daily: string; free: string }> = {
  tr: {
    limit: 'Günlük 3 simülasyon hakkınız bulunmaktadır',
    daily: 'Limitler her gün gece yarısı sıfırlanır',
    free: 'Ücretsiz',
  },
  en: {
    limit: 'You have 3 simulations per day',
    daily: 'Limits reset every day at midnight',
    free: 'Free',
  },
  es: {
    limit: 'Tiene 3 simulaciones por día',
    daily: 'Los límites se restablecen cada día a medianoche',
    free: 'Gratis',
  },
  ar: {
    limit: 'لديك 3 محاكاات يومياً',
    daily: 'تتم إعادة تعيين الحدود كل يوم عند منتصف الليل',
    free: 'مجاني',
  },
  de: {
    limit: 'Sie haben 3 Simulationen pro Tag',
    daily: 'Limits werden jeden Tag um Mitternacht zurückgesetzt',
    free: 'Kostenlos',
  },
}

// localStorage helpers for client-side rate limiting
function getLocalUsageKey(): string {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  return `urlastone_sim_${today}`
}

function getLocalUsageCount(): number {
  try {
    const val = localStorage.getItem(getLocalUsageKey())
    return val ? parseInt(val, 10) : 0
  } catch {
    return 0
  }
}

function incrementLocalUsage(): void {
  try {
    const key = getLocalUsageKey()
    const current = getLocalUsageCount()
    localStorage.setItem(key, String(current + 1))
  } catch { /* ignore */ }
}

function isLocalLimitReached(): boolean {
  return getLocalUsageCount() >= DAILY_LOCAL_LIMIT
}

export default function SimulationWizard() {
  const { locale } = useLanguage()
  const [step, setStep] = useState<SimStep>('upload')
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [imageWidth, setImageWidth] = useState(0)
  const [imageHeight, setImageHeight] = useState(0)
  const [selectedStone, setSelectedStone] = useState<StoneOption | null>(null)
  const [applyMode, setApplyMode] = useState<ApplyMode | null>(null)
  const [surfaceContext, setSurfaceContext] = useState<SurfaceContext | null>(null)
  const [maskDataUrl, setMaskDataUrl] = useState<string | null>(null)
  const [predictionId, setPredictionId] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [localUsage, setLocalUsage] = useState(0)

  const labels = STEP_LABELS[locale] || STEP_LABELS.tr
  const info = INFO_TEXTS[locale] || INFO_TEXTS.tr

  // Load local usage count on mount
  useEffect(() => {
    setLocalUsage(getLocalUsageCount())
  }, [])

  // Check local limit before API call
  const checkLocalLimit = useCallback((): boolean => {
    if (isLocalLimitReached()) {
      const msgs: Record<string, string> = {
        tr: 'Günlük simülasyon hakkınız doldu. Yarın tekrar deneyin',
        en: 'Your daily simulation limit reached. Please try again tomorrow',
        es: 'Su límite diario de simulación se alcanzó. Inténtelo mañana',
        ar: 'تم الوصول إلى الحد اليومي للمحاكاة. حاول مرة أخرى غداً',
        de: 'Ihr tägliches Simulationslimit erreicht. Versuchen Sie es morgen erneut',
      }
      setError(msgs[locale] || msgs.tr)
      return false
    }
    return true
  }, [locale])

  // Handle image upload
  const handleImageUpload = useCallback(async (dataUrl: string) => {
    const resized = await resizeImage(dataUrl, 1024)
    setImageDataUrl(resized.dataUrl)
    setImageWidth(resized.width)
    setImageHeight(resized.height)
    setStep('select')
  }, [])

  // Handle stone selection
  const handleStoneSelect = useCallback((stone: StoneOption) => {
    setSelectedStone(stone)
    setStep('mode')
  }, [])

  // Handle apply mode selection
  const handleModeSelect = useCallback(async (mode: ApplyMode, context?: SurfaceContext) => {
    setApplyMode(mode)
    setSurfaceContext(context || null)

    if (mode === 'brush') {
      setStep('mask')
    } else {
      // Check local limit first
      if (!checkLocalLimit()) return

      setStep('processing')
      setError(null)
      setProgress(0)

      if (!imageDataUrl || !selectedStone) return

      try {
        const res = await fetch('/api/simulation/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: imageDataUrl,
            stoneCode: selectedStone.code,
            categorySlug: selectedStone.categorySlug,
            locale,
            applyMode: 'full',
            surfaceContext: context || 'facade',
          }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'API error')
        }

        const { id } = await res.json()
        setPredictionId(id)
        incrementLocalUsage()
        setLocalUsage(getLocalUsageCount())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu')
        setStep('mode')
      }
    }
  }, [imageDataUrl, selectedStone, locale, checkLocalLimit])

  // Handle mask submit — start AI generation (brush mode)
  const handleMaskSubmit = useCallback(async (mask: string) => {
    // Check local limit first
    if (!checkLocalLimit()) return

    setMaskDataUrl(mask)
    setStep('processing')
    setError(null)
    setProgress(0)

    if (!imageDataUrl || !selectedStone) return

    try {
      const res = await fetch('/api/simulation/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageDataUrl,
          mask,
          stoneCode: selectedStone.code,
          categorySlug: selectedStone.categorySlug,
          locale,
          applyMode: 'brush',
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'API error')
      }

      const { id } = await res.json()
      setPredictionId(id)
      incrementLocalUsage()
      setLocalUsage(getLocalUsageCount())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
      setStep('mask')
    }
  }, [imageDataUrl, selectedStone, locale, checkLocalLimit])

  // Poll for result
  useEffect(() => {
    if (step !== 'processing' || !predictionId) return

    let cancelled = false
    let pollCount = 0
    const MAX_POLLS = 40

    const poll = async () => {
      try {
        const res = await fetch(`/api/simulation/status/${predictionId}`)
        const data = await res.json()

        if (cancelled) return

        pollCount++
        setProgress(Math.min(90, pollCount * 5))

        if (data.status === 'succeeded' && data.output) {
          setResultUrl(data.output)
          setProgress(100)
          setTimeout(() => {
            if (!cancelled) setStep('result')
          }, 500)
        } else if (data.status === 'failed' || data.status === 'canceled') {
          setError(data.error || 'İşlem başarısız oldu')
          setStep(applyMode === 'brush' ? 'mask' : 'mode')
        } else if (pollCount >= MAX_POLLS) {
          setError('İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.')
          setStep(applyMode === 'brush' ? 'mask' : 'mode')
        } else {
          setTimeout(poll, 3000)
        }
      } catch {
        if (!cancelled) {
          setError('Bağlantı hatası')
          setStep(applyMode === 'brush' ? 'mask' : 'mode')
        }
      }
    }

    setTimeout(poll, 2000)

    return () => { cancelled = true }
  }, [step, predictionId, applyMode])

  // Reset
  const handleReset = useCallback(() => {
    setStep('upload')
    setImageDataUrl(null)
    setSelectedStone(null)
    setApplyMode(null)
    setSurfaceContext(null)
    setMaskDataUrl(null)
    setPredictionId(null)
    setResultUrl(null)
    setError(null)
    setProgress(0)
  }, [])

  // Try another stone
  const handleTryAnother = useCallback(() => {
    setSelectedStone(null)
    setApplyMode(null)
    setSurfaceContext(null)
    setMaskDataUrl(null)
    setPredictionId(null)
    setResultUrl(null)
    setError(null)
    setProgress(0)
    setStep('select')
  }, [])

  // Calculate step index for progress indicator
  const getStepIndex = () => {
    if (step === 'upload') return 0
    if (step === 'select') return 1
    if (step === 'mode' || step === 'mask') return 2
    if (step === 'processing' || step === 'result') return 3
    return 0
  }
  const stepIndex = getStepIndex()

  const remaining = DAILY_LOCAL_LIMIT - localUsage

  return (
    <div className="max-w-5xl mx-auto">
      {/* Usage info banner */}
      <div className="flex items-center justify-center gap-6 mb-6 p-3 bg-white/[0.02] rounded-xl border border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Info size={13} className="text-gold-400" />
          <span className="text-white/40 text-[11px] font-mono">{info.limit}</span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: DAILY_LOCAL_LIMIT }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < remaining ? 'bg-gold-400' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
          <span className="text-white/30 text-[10px] font-mono">
            {remaining}/{DAILY_LOCAL_LIMIT}
          </span>
        </div>
        <div className="w-px h-4 bg-white/10 hidden sm:block" />
        <span className="text-white/20 text-[10px] font-mono hidden sm:block">{info.daily}</span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 md:gap-4 mb-10">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const isActive = i === stepIndex
          const isDone = i < stepIndex
          const label = labels[s.key]

          return (
            <div key={s.key} className="flex items-center gap-2 md:gap-4">
              {i > 0 && (
                <div className={`hidden sm:block w-8 md:w-16 h-px ${isDone ? 'bg-gold-400' : 'bg-white/10'}`} />
              )}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isActive
                      ? 'bg-gold-400/20 border-2 border-gold-400 text-gold-400 scale-110'
                      : isDone
                      ? 'bg-gold-400 text-black'
                      : 'bg-white/[0.04] border border-white/[0.08] text-white/20'
                  }`}
                >
                  <Icon size={16} />
                </div>
                <span className={`text-[9px] md:text-[10px] font-mono tracking-wider ${
                  isActive ? 'text-gold-400' : isDone ? 'text-white/50' : 'text-white/20'
                }`}>
                  {label}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <div className="relative">
        {step === 'upload' && (
          <StepUpload onUpload={handleImageUpload} />
        )}

        {step === 'select' && imageDataUrl && (
          <StepSelectStone
            imagePreview={imageDataUrl}
            onSelect={handleStoneSelect}
            onBack={() => setStep('upload')}
          />
        )}

        {step === 'mode' && imageDataUrl && selectedStone && (
          <StepApplyMode
            imagePreview={imageDataUrl}
            stoneName={selectedStone.name}
            onSelect={handleModeSelect}
            onBack={() => setStep('select')}
          />
        )}

        {step === 'mask' && imageDataUrl && selectedStone && (
          <StepMaskDraw
            imageDataUrl={imageDataUrl}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            stoneName={selectedStone.name}
            onSubmit={handleMaskSubmit}
            onBack={() => setStep('mode')}
            error={error}
          />
        )}

        {step === 'processing' && (
          <ProcessingView progress={progress} mode={applyMode} />
        )}

        {step === 'result' && resultUrl && imageDataUrl && (
          <StepResult
            originalUrl={imageDataUrl}
            resultUrl={resultUrl}
            stoneName={selectedStone?.name || ''}
            onTryAnother={handleTryAnother}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  )
}

// Processing animation
function ProcessingView({ progress, mode }: { progress: number; mode: ApplyMode | null }) {
  const messagesFull = [
    'Yapı analiz ediliyor...',
    'Kenarlar ve yapı tespit ediliyor...',
    'Taş dokusu oluşturuluyor...',
    'Yüzey eşleştiriliyor...',
    'Son rötuşlar yapılıyor...',
  ]
  const messagesBrush = [
    'Fotoğraf analiz ediliyor...',
    'Taş dokusu oluşturuluyor...',
    'Yüzey eşleştiriliyor...',
    'Işık ve gölge hesaplanıyor...',
    'Son rötuşlar yapılıyor...',
  ]
  const messages = mode === 'full' ? messagesFull : messagesBrush
  const msgIndex = Math.min(Math.floor(progress / 20), messages.length - 1)

  return (
    <div className="glass-card p-12 md:p-20 text-center">
      <div className="relative w-24 h-24 mx-auto mb-8">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold-400/20 to-gold-400/5 animate-pulse" />
        <div className="absolute inset-2 rounded-xl border-2 border-gold-400/30 border-t-gold-400 animate-spin" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles size={24} className="text-gold-400 animate-pulse" />
        </div>
      </div>

      <div className="max-w-md mx-auto mb-6">
        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold-400/60 to-gold-400 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="font-mono text-[10px] text-white/30">
            {mode === 'full' ? 'FLUX AI' : 'AI'} İşleniyor
          </span>
          <span className="font-mono text-[10px] text-gold-400">{progress}%</span>
        </div>
      </div>

      <p className="text-white/50 text-sm font-body animate-pulse">
        {messages[msgIndex]}
      </p>
      <p className="text-white/20 text-xs font-mono mt-3">
        Ortalama süre: {mode === 'full' ? '10-20' : '15-30'} saniye
      </p>
    </div>
  )
}
