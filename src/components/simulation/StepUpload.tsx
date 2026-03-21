'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, ImagePlus, AlertCircle, Camera } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface Props {
  onUpload: (dataUrl: string) => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MIN_DIMENSION = 400
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const TEXTS: Record<string, { title: string; desc: string; drag: string; formats: string; btn: string; cameraBtn: string; galleryBtn: string; or: string; errors: Record<string, string> }> = {
  tr: {
    title: 'Mekanınızın Fotoğrafını Yükleyin',
    desc: 'Duvar, zemin veya cephe fotoğrafı yükleyerek AI simülasyonunu başlatın',
    drag: 'Fotoğrafı buraya sürükleyin',
    formats: 'JPG, PNG, WebP — Max 10MB',
    btn: 'Fotoğraf Seç',
    cameraBtn: 'Fotoğraf Çek',
    galleryBtn: 'Galeriden Seç',
    or: 'veya',
    errors: {
      type: 'Sadece JPG, PNG ve WebP formatları desteklenir',
      size: 'Dosya boyutu max 10MB olmalıdır',
      dimension: 'Fotoğraf en az 400x400 piksel olmalıdır',
      generic: 'Fotoğraf yüklenemedi',
    },
  },
  en: {
    title: 'Upload Your Space Photo',
    desc: 'Upload a photo of your wall, floor, or facade to start the AI simulation',
    drag: 'Drag and drop your photo here',
    formats: 'JPG, PNG, WebP — Max 10MB',
    btn: 'Choose Photo',
    cameraBtn: 'Take Photo',
    galleryBtn: 'From Gallery',
    or: 'or',
    errors: {
      type: 'Only JPG, PNG, and WebP formats are supported',
      size: 'File size must be under 10MB',
      dimension: 'Photo must be at least 400x400 pixels',
      generic: 'Could not upload photo',
    },
  },
  es: {
    title: 'Suba la foto de su espacio',
    desc: 'Suba una foto de su pared, piso o fachada para iniciar la simulación',
    drag: 'Arrastre y suelte su foto aquí',
    formats: 'JPG, PNG, WebP — Máx 10MB',
    btn: 'Elegir foto',
    cameraBtn: 'Tomar foto',
    galleryBtn: 'Desde galería',
    or: 'o',
    errors: {
      type: 'Solo se admiten formatos JPG, PNG y WebP',
      size: 'El tamaño del archivo debe ser inferior a 10MB',
      dimension: 'La foto debe ser de al menos 400x400 píxeles',
      generic: 'No se pudo subir la foto',
    },
  },
  ar: {
    title: 'ارفع صورة مكانك',
    desc: 'ارفع صورة جدار أو أرضية أو واجهة لبدء محاكاة الذكاء الاصطناعي',
    drag: 'اسحب وأفلت صورتك هنا',
    formats: 'JPG, PNG, WebP — حد أقصى 10MB',
    btn: 'اختر صورة',
    cameraBtn: 'التقط صورة',
    galleryBtn: 'من المعرض',
    or: 'أو',
    errors: {
      type: 'يتم دعم صيغ JPG وPNG وWebP فقط',
      size: 'يجب أن يكون حجم الملف أقل من 10MB',
      dimension: 'يجب أن تكون الصورة 400×400 بكسل على الأقل',
      generic: 'تعذر رفع الصورة',
    },
  },
  de: {
    title: 'Laden Sie Ihr Raumfoto hoch',
    desc: 'Laden Sie ein Foto Ihrer Wand, Ihres Bodens oder Ihrer Fassade hoch, um die Simulation zu starten',
    drag: 'Ziehen Sie Ihr Foto hierher',
    formats: 'JPG, PNG, WebP — Max. 10MB',
    btn: 'Foto auswählen',
    cameraBtn: 'Foto aufnehmen',
    galleryBtn: 'Aus Galerie',
    or: 'oder',
    errors: {
      type: 'Nur JPG, PNG und WebP werden unterstützt',
      size: 'Die Dateigröße muss unter 10MB liegen',
      dimension: 'Das Foto muss mindestens 400×400 Pixel groß sein',
      generic: 'Foto konnte nicht hochgeladen werden',
    },
  },
}

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
      // Validate dimensions
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

  return (
    <div className="glass-card p-8 md:p-12">
      <div className="text-center mb-8">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">
          {t.title}
        </h2>
        <p className="text-white/40 text-sm font-body">{t.desc}</p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-12 md:p-20 text-center transition-all duration-300 ${
          dragging
            ? 'border-gold-400 bg-gold-400/[0.05] scale-[1.01]'
            : 'border-white/[0.1] hover:border-gold-400/40 hover:bg-white/[0.02]'
        }`}
      >
        {/* File input — gallery/file picker */}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
        {/* Camera input — opens camera directly on mobile */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300 ${
          dragging ? 'bg-gold-400/20 scale-110' : 'bg-white/[0.04]'
        }`}>
          {dragging ? (
            <ImagePlus size={28} className="text-gold-400" />
          ) : (
            <Camera size={28} className="text-white/20" />
          )}
        </div>

        <p className="text-white/50 text-sm mb-2">{t.drag}</p>
        <p className="text-white/20 text-xs font-mono mb-6">{t.or}</p>

        {/* Buttons: Camera + Gallery on mobile, single button on desktop */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* Camera button — primarily for mobile */}
          <button
            onClick={(e) => { e.stopPropagation(); cameraRef.current?.click() }}
            className="inline-flex items-center gap-2 bg-gold-400/20 text-gold-400 px-6 py-3 rounded-full text-sm font-medium hover:bg-gold-400/30 transition-colors border border-gold-400/30"
          >
            <Camera size={16} />
            {t.cameraBtn}
          </button>

          {/* Gallery / file picker button */}
          <button
            onClick={(e) => { e.stopPropagation(); fileRef.current?.click() }}
            className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-stone-200 transition-colors"
          >
            <Upload size={16} />
            {t.galleryBtn}
          </button>
        </div>

        <p className="text-white/15 text-[10px] font-mono mt-6 tracking-wider">{t.formats}</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-400/[0.06] rounded-xl px-4 py-3">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}

    </div>
  )
}
