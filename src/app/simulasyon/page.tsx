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
      <section className="relative pt-32 md:pt-40 pb-10 md:pb-14 px-6 md:px-12 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/sim-hero.png)' }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="max-w-7xl mx-auto text-center relative">
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

      {/* Simulation Wizard */}
      <section className="px-4 md:px-12 pt-12 md:pt-16 pb-24 md:pb-32">
        <SimulationWizard />
      </section>

      <Footer />
    </main>
  )
}
