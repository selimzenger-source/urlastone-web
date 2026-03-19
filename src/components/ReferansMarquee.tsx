'use client'

import { useLanguage } from '@/context/LanguageContext'

// Sembolik 10 referans - müşteriden gerçek logolar gelince güncellenecek
const referanslar = [
  'Kalyon İnşaat',
  'Limak Holding',
  'Rönesans İnşaat',
  'Tekfen İnşaat',
  'Mesa Mesken',
  'Ant Yapı',
  'Nef İnşaat',
  'Ege Yapı',
  'Folkart Yapı',
  'Sur Yapı',
]

export default function ReferansMarquee() {
  const { t } = useLanguage()
  const items = [...referanslar, ...referanslar]

  return (
    <section className="border-t border-b border-white/[0.06] py-14 md:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-10">
        <p className="font-mono text-[11px] text-white/40 tracking-wider uppercase mb-3">
          {t.ref_tag}
        </p>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-white">
          {t.ref_title} <span className="italic text-gradient-gold">{t.ref_gold}</span>
        </h2>
      </div>

      {/* Marquee */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee whitespace-nowrap items-center">
          {items.map((name, i) => (
            <span
              key={i}
              className="inline-flex items-center mx-12 cursor-default group"
            >
              <span className="w-2 h-2 rounded-full bg-gold-400/40 mr-4 group-hover:bg-gold-400 transition-colors duration-300" />
              <span className="font-heading text-lg md:text-xl text-white/40 group-hover:text-white/70 transition-colors duration-300 tracking-wide">
                {name}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
