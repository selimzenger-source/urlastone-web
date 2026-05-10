'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, AlertCircle, Check, Camera } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface Props {
  onUpload: (dataUrl: string) => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MIN_DIMENSION = 400
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface Texts {
  stepBadge: string
  title: string
  desc: string
  chooseBtn: string
  dragHint: string
  cameraBtn: string
  galleryBtn: string
  tipsTitle: string
  tips: Array<{ bold: string; rest: string }>
  examplesTitle: string
  examplesSub: string
  beforeLabel: string
  afterLabel: string
  quotaLabel: string
  errors: { type: string; size: string; dimension: string; generic: string }
}

const TEXTS: Record<string, Texts> = {
  tr: {
    stepBadge: 'ADIM 01 · FOTOĞRAF',
    title: 'Mekânınızın fotoğrafını yükleyin',
    desc: 'Düz, iyi aydınlatılmış bir duvarın ya da zeminin tek karesi yeterli. Sürükle bırak ya da dosya seç.',
    chooseBtn: 'Dosya Seç',
    dragHint: 'veya buraya sürükleyin',
    cameraBtn: 'Fotoğraf Çek',
    galleryBtn: 'Galeriden Yükle',
    tipsTitle: 'İyi bir fotoğraf için',
    tips: [
      { bold: 'Düz bir yüzey', rest: ' — duvar, zemin ya da cephe doğrudan görünür olsun.' },
      { bold: 'Bol ışık', rest: ' — gün ışığı en iyi sonucu verir.' },
      { bold: '1–2 metre mesafe', rest: ' — yüzeyin tamamı görünmeli.' },
      { bold: 'Min 400×400 px', rest: ' · JPG, PNG, WebP — 10 MB\'a kadar.' },
    ],
    examplesTitle: 'Önce / Sonra',
    examplesSub: 'Çıplak beton → URLA STONE doğal taş cephe',
    beforeLabel: 'ÖNCE',
    afterLabel: 'SONRA',
    quotaLabel: 'Bugün Kullanım Hakkı',
    errors: {
      type: 'Sadece JPG, PNG ve WebP formatları desteklenir',
      size: 'Dosya boyutu max 10MB olmalıdır',
      dimension: 'Fotoğraf en az 400x400 piksel olmalıdır',
      generic: 'Fotoğraf yüklenemedi',
    },
  },
  en: {
    stepBadge: 'STEP 01 · PHOTO',
    title: 'Upload a photo of your space',
    desc: 'A single shot of a flat, well-lit wall or floor is enough. Drag and drop or choose a file.',
    chooseBtn: 'Choose File',
    dragHint: 'or drop one here',
    cameraBtn: 'Take Photo',
    galleryBtn: 'Upload from Gallery',
    tipsTitle: 'For a good photo',
    tips: [
      { bold: 'Flat surface', rest: ' — wall, floor or facade should be directly visible.' },
      { bold: 'Plenty of light', rest: ' — daylight gives the best result.' },
      { bold: '1–2 meters away', rest: ' — the entire surface should be visible.' },
      { bold: 'Min 400×400 px', rest: ' · JPG, PNG, WebP — up to 10 MB.' },
    ],
    examplesTitle: 'Before / After',
    examplesSub: 'Bare concrete → URLA STONE natural stone facade',
    beforeLabel: 'BEFORE',
    afterLabel: 'AFTER',
    quotaLabel: 'Today\'s Usage Quota',
    errors: {
      type: 'Only JPG, PNG, and WebP formats are supported',
      size: 'File size must be under 10MB',
      dimension: 'Photo must be at least 400x400 pixels',
      generic: 'Could not upload photo',
    },
  },
  es: {
    stepBadge: 'PASO 01 · FOTO',
    title: 'Sube una foto de tu espacio',
    desc: 'Una sola toma de una pared o piso plano y bien iluminado es suficiente. Arrastra y suelta o elige un archivo.',
    chooseBtn: 'Elegir Archivo',
    dragHint: 'o suéltalo aquí',
    cameraBtn: 'Tomar Foto',
    galleryBtn: 'Subir desde Galería',
    tipsTitle: 'Para una buena foto',
    tips: [
      { bold: 'Superficie plana', rest: ' — pared, piso o fachada visible directamente.' },
      { bold: 'Mucha luz', rest: ' — la luz natural da el mejor resultado.' },
      { bold: '1–2 metros de distancia', rest: ' — la superficie completa debe verse.' },
      { bold: 'Mín 400×400 px', rest: ' · JPG, PNG, WebP — hasta 10 MB.' },
    ],
    examplesTitle: 'Antes / Después',
    examplesSub: 'Hormigón desnudo → fachada de piedra natural URLA STONE',
    beforeLabel: 'ANTES',
    afterLabel: 'DESPUÉS',
    quotaLabel: 'Cupo de uso de hoy',
    errors: {
      type: 'Solo se admiten formatos JPG, PNG y WebP',
      size: 'El tamaño del archivo debe ser inferior a 10MB',
      dimension: 'La foto debe ser de al menos 400x400 píxeles',
      generic: 'No se pudo subir la foto',
    },
  },
  ar: {
    stepBadge: 'الخطوة 01 · صورة',
    title: 'ارفع صورة مكانك',
    desc: 'صورة واحدة لجدار أو أرضية مستوية ومضاءة جيدًا تكفي. اسحب وأفلت أو اختر ملفًا.',
    chooseBtn: 'اختر ملفًا',
    dragHint: 'أو أفلته هنا',
    cameraBtn: 'التقط صورة',
    galleryBtn: 'تحميل من المعرض',
    tipsTitle: 'لصورة جيدة',
    tips: [
      { bold: 'سطح مستوٍ', rest: ' — جدار أو أرضية أو واجهة مرئية مباشرة.' },
      { bold: 'إضاءة وفيرة', rest: ' — ضوء النهار يعطي أفضل نتيجة.' },
      { bold: 'مسافة 1–2 متر', rest: ' — يجب أن يكون السطح كاملاً مرئياً.' },
      { bold: 'الحد الأدنى 400×400 بكسل', rest: ' · JPG, PNG, WebP — حتى 10 ميجابايت.' },
    ],
    examplesTitle: 'قبل / بعد',
    examplesSub: 'خرسانة عارية ← واجهة حجر طبيعي URLA STONE',
    beforeLabel: 'قبل',
    afterLabel: 'بعد',
    quotaLabel: 'حصة الاستخدام اليوم',
    errors: {
      type: 'يتم دعم صيغ JPG وPNG وWebP فقط',
      size: 'يجب أن يكون حجم الملف أقل من 10MB',
      dimension: 'يجب أن تكون الصورة 400×400 بكسل على الأقل',
      generic: 'تعذر رفع الصورة',
    },
  },
  de: {
    stepBadge: 'SCHRITT 01 · FOTO',
    title: 'Foto Ihres Raumes hochladen',
    desc: 'Eine einzige Aufnahme einer flachen, gut beleuchteten Wand oder eines Bodens reicht. Per Drag & Drop oder Datei auswählen.',
    chooseBtn: 'Datei wählen',
    dragHint: 'oder hier ablegen',
    cameraBtn: 'Foto aufnehmen',
    galleryBtn: 'Aus Galerie hochladen',
    tipsTitle: 'Für ein gutes Foto',
    tips: [
      { bold: 'Ebene Fläche', rest: ' — Wand, Boden oder Fassade direkt sichtbar.' },
      { bold: 'Viel Licht', rest: ' — Tageslicht ergibt das beste Ergebnis.' },
      { bold: '1–2 Meter Abstand', rest: ' — die gesamte Fläche muss sichtbar sein.' },
      { bold: 'Min 400×400 px', rest: ' · JPG, PNG, WebP — bis zu 10 MB.' },
    ],
    examplesTitle: 'Vorher / Nachher',
    examplesSub: 'Roher Beton → URLA STONE Natursteinfassade',
    beforeLabel: 'VORHER',
    afterLabel: 'NACHHER',
    quotaLabel: 'Heutiges Nutzungskontingent',
    errors: {
      type: 'Nur JPG, PNG und WebP werden unterstützt',
      size: 'Die Dateigröße muss unter 10MB liegen',
      dimension: 'Das Foto muss mindestens 400×400 Pixel groß sein',
      generic: 'Foto konnte nicht hochgeladen werden',
    },
  },
  fr: {
    stepBadge: 'ÉTAPE 01 · PHOTO',
    title: 'Téléchargez une photo de votre espace',
    desc: 'Une seule prise d\'un mur ou d\'un sol plat et bien éclairé suffit. Glissez-déposez ou choisissez un fichier.',
    chooseBtn: 'Choisir le fichier',
    dragHint: 'ou déposez-le ici',
    cameraBtn: 'Prendre une photo',
    galleryBtn: 'Charger depuis la galerie',
    tipsTitle: 'Pour une bonne photo',
    tips: [
      { bold: 'Surface plane', rest: ' — mur, sol ou façade directement visible.' },
      { bold: 'Beaucoup de lumière', rest: ' — la lumière du jour donne le meilleur résultat.' },
      { bold: '1–2 mètres de distance', rest: ' — toute la surface doit être visible.' },
      { bold: 'Min 400×400 px', rest: ' · JPG, PNG, WebP — jusqu\'à 10 Mo.' },
    ],
    examplesTitle: 'Avant / Après',
    examplesSub: 'Béton brut → façade en pierre naturelle URLA STONE',
    beforeLabel: 'AVANT',
    afterLabel: 'APRÈS',
    quotaLabel: 'Quota d\'utilisation du jour',
    errors: {
      type: 'Seuls les formats JPG, PNG et WebP sont pris en charge',
      size: 'La taille du fichier doit être inférieure à 10 Mo',
      dimension: 'La photo doit faire au moins 400×400 pixels',
      generic: 'Impossible de télécharger la photo',
    },
  },
  ru: {
    stepBadge: 'ШАГ 01 · ФОТО',
    title: 'Загрузите фото вашего пространства',
    desc: 'Достаточно одного снимка ровной, хорошо освещённой стены или пола. Перетащите или выберите файл.',
    chooseBtn: 'Выбрать файл',
    dragHint: 'или перетащите сюда',
    cameraBtn: 'Сделать фото',
    galleryBtn: 'Загрузить из галереи',
    tipsTitle: 'Для хорошего фото',
    tips: [
      { bold: 'Ровная поверхность', rest: ' — стена, пол или фасад должны быть видны напрямую.' },
      { bold: 'Много света', rest: ' — дневной свет даёт лучший результат.' },
      { bold: '1–2 метра дистанция', rest: ' — должна быть видна вся поверхность.' },
      { bold: 'Мин 400×400 px', rest: ' · JPG, PNG, WebP — до 10 МБ.' },
    ],
    examplesTitle: 'До / После',
    examplesSub: 'Голый бетон → фасад из натурального камня URLA STONE',
    beforeLabel: 'ДО',
    afterLabel: 'ПОСЛЕ',
    quotaLabel: 'Лимит использования на сегодня',
    errors: {
      type: 'Поддерживаются только форматы JPG, PNG и WebP',
      size: 'Размер файла должен быть менее 10 МБ',
      dimension: 'Фото должно быть не менее 400×400 пикселей',
      generic: 'Не удалось загрузить фото',
    },
  },
}

const BEFORE_SRC = '/sim-example-before.jpg'
const AFTER_SRC = '/sim-example-after.jpg'

export default function StepUpload({ onUpload }: Props) {
  const { locale } = useLanguage()
  const t = TEXTS[locale] || TEXTS.tr
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback((file: File) => {
    setError(null)

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(t.errors.type)
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(t.errors.size)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      const img = new window.Image()
      img.onload = () => {
        if (img.width < MIN_DIMENSION || img.height < MIN_DIMENSION) {
          setError(t.errors.dimension)
          return
        }
        onUpload(dataUrl)
      }
      img.onerror = () => setError(t.errors.generic)
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  }, [onUpload, t])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }, [processFile])

  const openFile = () => fileRef.current?.click()
  const openCamera = () => cameraRef.current?.click()

  return (
    <div className="w-full">
      {/* Hidden inputs (shared by desktop + mobile) */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* ───── Desktop: V3 Live Tray ───── */}
      <div className="hidden md:grid grid-cols-[1fr_360px] gap-0 rounded-3xl overflow-hidden border border-white/[0.07] bg-[#0a0a0a]">
        {/* Left: cinematic viewport */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className="relative min-h-[560px] flex items-center justify-center bg-black overflow-hidden"
        >
          {/* Background image */}
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: 'url(/sim-upload-bg.jpg)', opacity: 0.22, filter: 'saturate(0.6) blur(2.5px)' }}
          />
          {/* Vignette */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.85) 100%)' }} />
          {/* Gold corner brackets */}
          <div className="absolute inset-[18px] pointer-events-none">
            <span className="absolute top-0 left-0 w-8 h-8 border-l-[1.5px] border-t-[1.5px] border-gold-400" />
            <span className="absolute top-0 right-0 w-8 h-8 border-r-[1.5px] border-t-[1.5px] border-gold-400" />
            <span className="absolute bottom-0 left-0 w-8 h-8 border-l-[1.5px] border-b-[1.5px] border-gold-400" />
            <span className="absolute bottom-0 right-0 w-8 h-8 border-r-[1.5px] border-b-[1.5px] border-gold-400" />
          </div>

          {/* Drag-over overlay */}
          {dragging && (
            <div className="absolute inset-4 rounded-2xl border-2 border-dashed border-gold-400 bg-gold-400/[0.06] z-10" />
          )}

          {/* Center content */}
          <div className="relative z-[2] text-center px-8 max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-gold-400/30 rounded-full font-mono text-[10px] tracking-[0.2em] text-gold-400 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
              {t.stepBadge}
            </div>
            <h2 className="font-heading text-3xl lg:text-4xl font-medium text-white mb-3">{t.title}</h2>
            <p className="text-white/55 text-sm leading-relaxed mb-7">{t.desc}</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={openFile}
                className="inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-gold-400 text-black text-sm font-medium hover:bg-[#c9a855] hover:-translate-y-0.5 transition-all"
              >
                <Upload size={18} />
                {t.chooseBtn}
              </button>
              <button
                onClick={openCamera}
                className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/[0.06] border border-white/[0.12] text-white text-sm font-medium hover:bg-white/[0.1] hover:-translate-y-0.5 transition-all"
              >
                <Camera size={18} className="text-gold-400" />
                {t.cameraBtn}
              </button>
            </div>
            <div className="mt-4 text-white/35 font-mono text-[11px] tracking-[0.2em] uppercase text-center">
              {t.dragHint}
            </div>
          </div>
        </div>

        {/* Right: tray */}
        <div className="border-l border-white/[0.05] bg-white/[0.015] p-7 flex flex-col gap-6 overflow-y-auto">
          <div>
            <h4 className="font-mono text-[10px] tracking-[0.25em] text-white/50 uppercase mb-3.5 m-0">
              {t.tipsTitle}
            </h4>
            <div className="flex flex-col gap-3">
              {t.tips.map((tip, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="w-[22px] h-[22px] rounded-full bg-gold-400/[0.12] text-gold-400 flex items-center justify-center flex-shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className="text-[12px] text-white/65 leading-[1.5]">
                    <b className="text-white font-medium">{tip.bold}</b>{tip.rest}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-mono text-[10px] tracking-[0.25em] text-white/50 uppercase mb-3.5 m-0">
              {t.examplesTitle}
            </h4>
            <div className="rounded-[14px] overflow-hidden border border-white/[0.06] bg-black">
              <div className="grid grid-cols-2 relative aspect-[16/10]">
                {/* Before */}
                <div className="relative overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${BEFORE_SRC})`, filter: 'saturate(0.4) brightness(0.7)' }}
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.85))' }} />
                  <span className="absolute left-2 top-2 z-[1] font-mono text-[9px] tracking-[0.2em] text-white/60 px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-sm">
                    {t.beforeLabel}
                  </span>
                </div>
                {/* After */}
                <div className="relative overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${AFTER_SRC})` }}
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.7))' }} />
                  <span className="absolute left-2 top-2 z-[1] font-mono text-[9px] tracking-[0.2em] text-gold-400 px-1.5 py-0.5 rounded bg-gold-400/15 border border-gold-400/30 backdrop-blur-sm">
                    {t.afterLabel}
                  </span>
                </div>
                {/* Center divider */}
                <span className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-gold-400/60 to-transparent" />
              </div>
              <p className="text-[11px] text-white/45 leading-snug px-3 py-2.5 border-t border-white/[0.05]">
                {t.examplesSub}
              </p>
            </div>
          </div>

          <div className="mt-auto p-3.5 rounded-[14px] bg-gold-400/[0.05] border border-gold-400/[0.12] flex items-center justify-between">
            <span className="text-[11px] text-white/50">{t.quotaLabel}</span>
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
            </span>
          </div>
        </div>
      </div>

      {/* ───── Mobile: M3 Camera-First ───── */}
      <div className="md:hidden flex flex-col gap-4">
        {/* Step badge */}
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] text-gold-400">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
            {t.stepBadge}
          </span>
        </div>

        {/* Cinematic viewport */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className="relative aspect-[4/5] rounded-[28px] bg-black overflow-hidden"
        >
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: 'url(/sim-upload-bg.jpg)', opacity: 0.26, filter: 'saturate(0.5) blur(2px)' }}
          />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, transparent 25%, rgba(0,0,0,0.95) 100%)' }} />
          <div className="absolute inset-3.5 pointer-events-none">
            <span className="absolute top-0 left-0 w-6 h-6 border-l-[1.5px] border-t-[1.5px] border-gold-400" />
            <span className="absolute top-0 right-0 w-6 h-6 border-r-[1.5px] border-t-[1.5px] border-gold-400" />
            <span className="absolute bottom-0 left-0 w-6 h-6 border-l-[1.5px] border-b-[1.5px] border-gold-400" />
            <span className="absolute bottom-0 right-0 w-6 h-6 border-r-[1.5px] border-b-[1.5px] border-gold-400" />
          </div>
          {dragging && <div className="absolute inset-4 rounded-2xl border-2 border-dashed border-gold-400 bg-gold-400/[0.06]" />}

          <div className="relative z-[2] h-full flex flex-col items-center justify-center text-center px-6">
            <h3 className="font-heading text-2xl text-white mb-2 font-medium">{t.title}</h3>
            <p className="text-white/55 text-xs leading-[1.5] max-w-xs">{t.desc}</p>
          </div>
        </div>

        {/* Camera-first controls — shutter centered, gallery as full-width labeled button below */}
        <div className="flex flex-col items-center gap-3 pt-1">
          {/* Big shutter — kamera açar */}
          <button
            onClick={openCamera}
            className="relative w-[78px] h-[78px] rounded-full bg-white flex items-center justify-center active:scale-95 transition-transform"
            aria-label={t.cameraBtn}
          >
            <span className="absolute -inset-1.5 rounded-full border-[1.5px] border-gold-400" />
            <span className="w-[60px] h-[60px] rounded-full bg-gold-400" />
          </button>
          <span className="font-mono text-[10px] tracking-[0.2em] text-white/40 uppercase">
            {t.cameraBtn}
          </span>

          {/* Belirgin Galeri butonu — tam genişlik, ikon + yazı */}
          <button
            onClick={openFile}
            className="w-full mt-2 inline-flex items-center justify-center gap-3 px-5 py-4 rounded-2xl bg-white/[0.06] border border-white/[0.12] text-white text-[14px] font-medium active:scale-[0.99] hover:bg-white/[0.09] transition-all"
          >
            <Upload size={18} className="text-gold-400" />
            {t.galleryBtn}
          </button>
        </div>

        {/* Tips — 4 maddenin tamamı (desktop ile aynı içerik) */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 flex flex-col gap-2.5">
          <h4 className="font-mono text-[9px] tracking-[0.25em] text-white/50 uppercase m-0">
            {t.tipsTitle}
          </h4>
          <div className="flex flex-col gap-2">
            {t.tips.map((tip, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-gold-400/[0.12] text-gold-400 flex items-center justify-center flex-shrink-0">
                  <Check size={10} strokeWidth={3} />
                </span>
                <span className="text-[11.5px] text-white/65 leading-[1.45]">
                  <b className="text-white font-medium">{tip.bold}</b>{tip.rest}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Before / After — desktop ile aynı kart */}
        <div>
          <h4 className="font-mono text-[9px] tracking-[0.25em] text-white/50 uppercase mb-3 m-0">
            {t.examplesTitle}
          </h4>
          <div className="rounded-[14px] overflow-hidden border border-white/[0.06] bg-black">
            <div className="grid grid-cols-2 relative aspect-[16/10]">
              <div className="relative overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${BEFORE_SRC})`, filter: 'saturate(0.4) brightness(0.7)' }}
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.85))' }} />
                <span className="absolute left-2 top-2 z-[1] font-mono text-[9px] tracking-[0.2em] text-white/60 px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-sm">
                  {t.beforeLabel}
                </span>
              </div>
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${AFTER_SRC})` }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.7))' }} />
                <span className="absolute left-2 top-2 z-[1] font-mono text-[9px] tracking-[0.2em] text-gold-400 px-1.5 py-0.5 rounded bg-gold-400/15 border border-gold-400/30 backdrop-blur-sm">
                  {t.afterLabel}
                </span>
              </div>
              <span className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-gold-400/60 to-transparent" />
            </div>
            <p className="text-[11px] text-white/45 leading-snug px-3 py-2.5 border-t border-white/[0.05]">
              {t.examplesSub}
            </p>
          </div>
        </div>

        {/* Quota strip */}
        <div className="rounded-[14px] bg-gold-400/[0.05] border border-gold-400/[0.12] px-4 py-3 flex items-center justify-between">
          <span className="text-[11px] text-white/60">{t.quotaLabel}</span>
          <span className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
          </span>
        </div>
      </div>

      {/* Error (shared) */}
      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-400/[0.06] rounded-xl px-4 py-3">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
