'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Wand2, Paintbrush, Building2, Home, Camera } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import type { ApplyMode, SurfaceContext, GroutStyle } from '@/lib/simulation'

interface Props {
  imagePreview: string
  stoneName: string
  onSelect: (mode: ApplyMode, context?: SurfaceContext, grout?: GroutStyle) => void
  onBack: () => void
}

const MODE_TEXTS: Record<string, Record<string, string>> = {
  tr: {
    title: 'Uygulama Yöntemi',
    desc: 'Taşı nasıl uygulamak istediğinizi seçin',
    back: 'Geri',
    fullTitle: 'Tüm Alana Uygula',
    fullDesc: 'AI yapıyı koruyarak taşı akıllıca tüm yüzeye uygular',
    brushTitle: 'Fırça ile Seç',
    brushDesc: 'Taş uygulanacak alanı elle işaretleyin',
    fullExBefore: 'Önce',
    fullExAfter: 'Sonra',
    brushExBefore: 'Boyayın',
    brushExAfter: 'Sonuç',
    brushHint: 'Parmağınızla taş uygulamak istediğiniz alanı boyayın',
    comingSoon: 'Yakında',
    photoTip: 'En iyi sonuç için: Düz açıdan, iyi aydınlatılmış, net bir fotoğraf çekin',
    contextTitle: 'Yüzey Türü',
    contextDesc: 'AI doğru alanları tespit etsin — ne tür bir yüzey bu?',
    apply: 'AI ile Uygula',
    facade: 'Dış Cephe',
    fireplace: 'Şömine',
    bathroom: 'Banyo',
    interior: 'İç Duvar',
    floor: 'Zemin',
    facadeDesc: 'Bina dış cephesi, duvar yüzeyi',
    fireplaceDesc: 'Şömine çevresi ve mantosu',
    bathroomDesc: 'Banyo duvarı, duş alanı',
    interiorDesc: 'İç mekan duvar yüzeyi',
    floorDesc: 'Zemin, döşeme alanı',
    groutTitle: 'Derz Stili',
    grouted: 'Derzli',
    groutless: 'Derzsiz',
    groutedDesc: 'Taşlar arasında görünür derz çizgileri',
    groutlessDesc: 'Taşlar sıkı birbirine yapışık, derz yok',
  },
  en: {
    title: 'Application Method',
    desc: 'Choose how you want to apply the stone',
    back: 'Back',
    fullTitle: 'Apply to Full Surface',
    fullDesc: 'AI intelligently applies stone while preserving structure',
    brushTitle: 'Select with Brush',
    brushDesc: 'Manually mark the area for stone application',
    fullExBefore: 'Before',
    fullExAfter: 'After',
    brushExBefore: 'Paint',
    brushExAfter: 'Result',
    brushHint: 'Use your finger to paint the area where you want stone applied',
    comingSoon: 'Coming Soon',
    photoTip: 'For best results: Take a clear, well-lit photo from a straight angle',
    contextTitle: 'Surface Type',
    contextDesc: 'Help the AI detect the right areas — what type of surface is this?',
    apply: 'Apply with AI',
    facade: 'Exterior Facade',
    fireplace: 'Fireplace',
    bathroom: 'Bathroom',
    interior: 'Interior Wall',
    floor: 'Floor',
    facadeDesc: 'Building exterior, wall surface',
    fireplaceDesc: 'Fireplace surround and mantel',
    bathroomDesc: 'Bathroom wall, shower area',
    interiorDesc: 'Interior wall surface',
    floorDesc: 'Floor, ground surface',
    groutTitle: 'Grout Style',
    grouted: 'With Grout',
    groutless: 'No Grout',
    groutedDesc: 'Visible grout lines between stones',
    groutlessDesc: 'Stones tightly fitted, no visible grout',
  },
  es: {
    title: 'Método de aplicación',
    desc: 'Elija cómo desea aplicar la piedra',
    back: 'Atrás',
    fullTitle: 'Aplicar a toda la superficie',
    fullDesc: 'La IA aplica la piedra de forma inteligente preservando la estructura',
    brushTitle: 'Seleccionar con pincel',
    brushDesc: 'Marque manualmente el área para la aplicación',
    fullExBefore: 'Antes',
    fullExAfter: 'Después',
    brushExBefore: 'Pintar',
    brushExAfter: 'Resultado',
    brushHint: 'Use su dedo para pintar el área donde desea aplicar piedra',
    photoTip: 'Para mejores resultados: Tome una foto clara, bien iluminada, desde un ángulo recto',
    contextTitle: 'Tipo de superficie',
    contextDesc: 'Ayude a la IA a detectar las áreas correctas — ¿qué tipo de superficie es?',
    apply: 'Aplicar con IA',
    facade: 'Fachada exterior',
    fireplace: 'Chimenea',
    bathroom: 'Baño',
    interior: 'Pared interior',
    floor: 'Suelo',
    facadeDesc: 'Exterior del edificio',
    fireplaceDesc: 'Marco y repisa de chimenea',
    bathroomDesc: 'Pared de baño, área de ducha',
    interiorDesc: 'Pared interior',
    floorDesc: 'Suelo, superficie del piso',
    groutTitle: 'Estilo de juntas',
    grouted: 'Con juntas',
    groutless: 'Sin juntas',
    groutedDesc: 'Líneas de junta visibles entre piedras',
    groutlessDesc: 'Piedras ajustadas, sin juntas visibles',
  },
  ar: {
    title: 'طريقة التطبيق',
    desc: 'اختر كيف تريد تطبيق الحجر',
    back: 'رجوع',
    fullTitle: 'تطبيق على كامل السطح',
    fullDesc: 'الذكاء الاصطناعي يطبق الحجر بذكاء مع الحفاظ على البنية',
    brushTitle: 'اختيار بالفرشاة',
    brushDesc: 'حدد المنطقة يدوياً لتطبيق الحجر',
    fullExBefore: 'قبل',
    fullExAfter: 'بعد',
    brushExBefore: 'ارسم',
    brushExAfter: 'النتيجة',
    brushHint: 'استخدم إصبعك لتلوين المنطقة التي تريد تطبيق الحجر عليها',
    photoTip: 'للحصول على أفضل النتائج: التقط صورة واضحة وجيدة الإضاءة من زاوية مستقيمة',
    contextTitle: 'نوع السطح',
    contextDesc: 'ساعد الذكاء الاصطناعي في تحديد المناطق الصحيحة',
    apply: 'تطبيق بالذكاء الاصطناعي',
    facade: 'واجهة خارجية',
    fireplace: 'مدفأة',
    bathroom: 'حمام',
    interior: 'جدار داخلي',
    floor: 'أرضية',
    facadeDesc: 'واجهة المبنى الخارجية',
    fireplaceDesc: 'إطار المدفأة والرف',
    bathroomDesc: 'جدار الحمام، منطقة الدش',
    interiorDesc: 'سطح الجدار الداخلي',
    floorDesc: 'الأرضية، سطح الأرض',
    groutTitle: 'نمط المفاصل',
    grouted: 'مع مفاصل',
    groutless: 'بدون مفاصل',
    groutedDesc: 'خطوط مفاصل مرئية بين الأحجار',
    groutlessDesc: 'أحجار متلاصقة بإحكام، بدون مفاصل',
  },
  de: {
    title: 'Anwendungsmethode',
    desc: 'Wählen Sie, wie der Stein angewendet werden soll',
    back: 'Zurück',
    fullTitle: 'Auf gesamte Fläche anwenden',
    fullDesc: 'KI wendet Stein intelligent an und bewahrt die Struktur',
    brushTitle: 'Mit Pinsel auswählen',
    brushDesc: 'Markieren Sie den Bereich manuell',
    fullExBefore: 'Vorher',
    fullExAfter: 'Nachher',
    brushExBefore: 'Malen',
    brushExAfter: 'Ergebnis',
    brushHint: 'Malen Sie mit dem Finger den Bereich, auf den Stein aufgetragen werden soll',
    photoTip: 'Für beste Ergebnisse: Machen Sie ein klares, gut beleuchtetes Foto aus geradem Winkel',
    contextTitle: 'Oberflächentyp',
    contextDesc: 'Helfen Sie der KI die richtigen Bereiche zu erkennen',
    apply: 'Mit KI anwenden',
    facade: 'Außenfassade',
    fireplace: 'Kamin',
    bathroom: 'Badezimmer',
    interior: 'Innenwand',
    floor: 'Boden',
    facadeDesc: 'Gebäudeaußenseite, Wandfläche',
    fireplaceDesc: 'Kaminumrandung und Kaminsims',
    bathroomDesc: 'Badezimmerwand, Duschbereich',
    interiorDesc: 'Innenwandfläche',
    floorDesc: 'Boden, Grundfläche',
    groutTitle: 'Fugenstil',
    grouted: 'Mit Fugen',
    groutless: 'Ohne Fugen',
    groutedDesc: 'Sichtbare Fugenlinien zwischen Steinen',
    groutlessDesc: 'Steine eng anliegend, keine sichtbaren Fugen',
  },
}

const SURFACE_OPTIONS: { key: SurfaceContext; icon: typeof Building2 }[] = [
  { key: 'facade', icon: Building2 },
  { key: 'interior', icon: Home },
]

export default function StepApplyMode({ imagePreview, stoneName, onSelect, onBack }: Props) {
  const { locale } = useLanguage()
  const t = MODE_TEXTS[locale] || MODE_TEXTS.tr
  const [showContextPicker, setShowContextPicker] = useState(false)
  const [selectedContext, setSelectedContext] = useState<SurfaceContext>('facade')
  const [groutStyle, setGroutStyle] = useState<GroutStyle>('grouted')

  const contextLabels: Record<SurfaceContext, { name: string; desc: string }> = {
    facade: { name: t.facade, desc: t.facadeDesc },
    fireplace: { name: t.fireplace, desc: t.fireplaceDesc },
    bathroom: { name: t.bathroom, desc: t.bathroomDesc },
    interior: { name: t.interior, desc: t.interiorDesc },
    floor: { name: t.floor, desc: t.floorDesc },
  }

  return (
    <div className="glass-card p-6 md:p-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex gap-4 items-start">
          {/* Mini preview */}
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border border-white/[0.08] flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-1">
              {t.title}
            </h2>
            <p className="text-white/40 text-sm font-body">{t.desc}</p>
            <p className="text-gold-400 text-xs font-mono mt-1">{stoneName}</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-white/30 text-xs hover:text-white/60 transition-colors"
        >
          <ArrowLeft size={12} /> {t.back}
        </button>
      </div>

      {!showContextPicker ? (
        /* Mode selection */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Apply Mode */}
          <button
            onClick={() => setShowContextPicker(true)}
            className="group relative rounded-2xl border-2 border-white/[0.08] hover:border-gold-400/50 bg-white/[0.02] hover:bg-gold-400/[0.03] transition-all duration-300 text-left overflow-hidden"
          >
            {/* Before/After preview */}
            <div className="relative h-36 md:h-44 overflow-hidden">
              <div className="absolute inset-0 flex">
                {/* Before half */}
                <div className="w-1/2 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/simulation-examples/ex-original.jpg" alt="" className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 text-[9px] text-white/80 font-mono bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full">{t.fullExBefore}</span>
                </div>
                {/* After half */}
                <div className="w-1/2 relative border-l-2 border-gold-400/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/simulation-examples/ex-full-result.jpg" alt="" className="w-full h-full object-cover" />
                  <span className="absolute top-2 right-2 text-[9px] text-gold-400 font-mono bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full">{t.fullExAfter}</span>
                </div>
              </div>
            </div>
            {/* Text content */}
            <div className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center group-hover:bg-gold-400/20 transition-colors flex-shrink-0">
                  <Wand2 size={18} className="text-gold-400" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-white">{t.fullTitle}</h3>
                  <p className="text-white/40 text-xs font-body">{t.fullDesc}</p>
                </div>
              </div>
            </div>
            {/* AI badge */}
            <div className="absolute top-2 right-2 bg-gold-400/20 text-gold-400 text-[9px] font-mono px-2.5 py-1 rounded-full border border-gold-400/30 backdrop-blur-sm z-10">
              AI
            </div>
          </button>

          {/* Brush Mode — coming soon */}
          <div className="relative p-6 md:p-8 rounded-2xl border-2 border-white/[0.05] bg-white/[0.01] text-left opacity-40 cursor-not-allowed">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
              <Paintbrush size={24} className="text-white/30" />
            </div>
            <h3 className="font-heading text-lg font-bold text-white/50 mb-2">{t.brushTitle}</h3>
            <p className="text-white/30 text-sm font-body">{t.brushDesc}</p>
            <div className="absolute top-4 right-4 bg-white/10 text-white/40 text-[9px] font-mono px-2.5 py-1 rounded-full border border-white/10">
              {t.comingSoon || 'Yakında'}
            </div>
          </div>

          {/* Photo tip */}
          <div className="md:col-span-2 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-2.5">
            <p className="text-white/30 text-[10px] font-body leading-relaxed text-center">
              <Camera size={10} className="inline mr-1 opacity-60" />
              {t.photoTip}
            </p>
          </div>
        </div>
      ) : (
        /* Surface context picker */
        <div>
          <div className="mb-6">
            <h3 className="font-heading text-lg font-bold text-white mb-1">
              {t.contextTitle}
            </h3>
            <p className="text-white/40 text-sm font-body">{t.contextDesc}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
            {SURFACE_OPTIONS.map(({ key, icon: Icon }) => {
              const isActive = selectedContext === key
              const label = contextLabels[key]
              return (
                <button
                  key={key}
                  onClick={() => setSelectedContext(key)}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                    isActive
                      ? 'border-gold-400 bg-gold-400/[0.06] scale-[1.02]'
                      : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15]'
                  }`}
                >
                  <Icon
                    size={24}
                    className={`mx-auto mb-2 ${isActive ? 'text-gold-400' : 'text-white/30'}`}
                  />
                  <span className={`block text-xs font-medium ${isActive ? 'text-gold-400' : 'text-white/60'}`}>
                    {label.name}
                  </span>
                  <span className="block text-[9px] text-white/25 font-mono mt-1">
                    {label.desc}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Grout style toggle */}
          <div className="mb-8">
            <h3 className="font-heading text-sm font-bold text-white/60 mb-3 text-center">
              {t.groutTitle}
            </h3>
            <div className="flex gap-3 max-w-md mx-auto">
              {(['grouted', 'groutless'] as GroutStyle[]).map((style) => {
                const isActive = groutStyle === style
                return (
                  <button
                    key={style}
                    onClick={() => setGroutStyle(style)}
                    className={`flex-1 p-3 rounded-xl border-2 transition-all duration-300 text-center ${
                      isActive
                        ? 'border-gold-400 bg-gold-400/[0.06]'
                        : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15]'
                    }`}
                  >
                    <span className={`block text-xs font-medium ${isActive ? 'text-gold-400' : 'text-white/60'}`}>
                      {t[style]}
                    </span>
                    <span className="block text-[9px] text-white/25 font-mono mt-1">
                      {t[`${style}Desc`]}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setShowContextPicker(false)}
              className="text-white/30 text-xs hover:text-white/60 transition-colors"
            >
              <ArrowLeft size={12} className="inline mr-1" />
              {t.back}
            </button>
            <button
              onClick={() => onSelect('full', selectedContext, groutStyle)}
              className="inline-flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-full text-sm font-medium hover:bg-stone-200 transition-colors"
            >
              <Wand2 size={16} />
              {t.apply}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
