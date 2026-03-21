'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Sparkles } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import PageTracker from '@/components/PageTracker'
import SimulationWizard from '@/components/simulation/SimulationWizard'

const HERO_TEXTS: Record<string, { tag: string; title: string; gold: string; desc: string }> = {
  tr: {
    tag: 'AI SİMÜLASYON',
    title: 'Mekanınızda Taşı',
    gold: 'Önceden Görün',
    desc: 'Yapay zeka ile duvarınıza, zemininize veya cephenize doğal taş nasıl görünür, anında deneyimleyin',
  },
  en: {
    tag: 'AI SIMULATION',
    title: 'Preview Stone in',
    gold: 'Your Space',
    desc: 'Experience how natural stone will look on your wall, floor, or facade with artificial intelligence',
  },
  es: {
    tag: 'SIMULACIÓN IA',
    title: 'Vista previa de piedra en',
    gold: 'su espacio',
    desc: 'Experimente cómo se verá la piedra natural en su pared, piso o fachada con inteligencia artificial',
  },
  ar: {
    tag: 'محاكاة ذكية',
    title: 'معاينة الحجر في',
    gold: 'مكانك',
    desc: 'اختبر كيف سيبدو الحجر الطبيعي على جدارك أو أرضيتك أو واجهتك بالذكاء الاصطناعي',
  },
  de: {
    tag: 'KI-SIMULATION',
    title: 'Stein-Vorschau in',
    gold: 'Ihrem Raum',
    desc: 'Erleben Sie, wie Naturstein an Ihrer Wand, Ihrem Boden oder Ihrer Fassade aussehen wird — mit künstlicher Intelligenz',
  },
}

export default function SimulasyonPage() {
  const { locale } = useLanguage()
  const t = HERO_TEXTS[locale] || HERO_TEXTS.tr

  return (
    <main className="bg-[#0a0a0a] text-white min-h-screen">
      <PageTracker />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 md:pt-40 pb-10 md:pb-14 px-6 md:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-2 mb-6">
            <Sparkles size={14} className="text-gold-400" />
            <span className="font-mono text-[10px] text-white/50 tracking-wider uppercase">
              {t.tag}
            </span>
          </div>
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold mb-4">
            {t.title}{' '}
            <span className="text-gradient-gold">{t.gold}</span>
          </h1>
          <p className="text-white/50 text-base md:text-lg max-w-2xl mx-auto">
            {t.desc}
          </p>
        </div>
      </section>

      {/* Coming Soon — wizard geliştirme aşamasında, yakında aktif */}
      <section className="px-4 md:px-12 pb-24 md:pb-32">
        <div className="max-w-2xl mx-auto text-center py-24">
          <div className="glass-card rounded-2xl p-12 border border-white/[0.08]">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold-400/10 flex items-center justify-center">
              <Sparkles size={28} className="text-gold-400" />
            </div>
            <h2 className="font-heading text-3xl font-bold mb-4 text-white">
              {locale === 'tr' ? 'Yakında' :
               locale === 'de' ? 'Demnächst' :
               locale === 'ar' ? 'قريباً' :
               locale === 'es' ? 'Próximamente' : 'Coming Soon'}
            </h2>
            <p className="text-white/50 text-base leading-relaxed">
              {locale === 'tr' ? 'AI simülasyon aracımız hazırlanıyor. Çok yakında hizmetinizde olacak.' :
               locale === 'de' ? 'Unser KI-Simulationswerkzeug wird vorbereitet. Bald verfügbar.' :
               locale === 'ar' ? 'أداة المحاكاة بالذكاء الاصطناعي قيد الإعداد. ستكون متاحة قريباً.' :
               locale === 'es' ? 'Nuestra herramienta de simulación IA se está preparando. Disponible muy pronto.' :
               'Our AI simulation tool is being prepared. Coming very soon.'}
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
