'use client'

import { ArrowUpRight } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function SisterBrand() {
  const { locale } = useLanguage()
  const tr = locale === 'tr'

  return (
    <section className="relative py-20 md:py-28 px-6 md:px-12 overflow-hidden border-t border-white/[0.06]">
      {/* terracotta glow accents — distinct from the site's gold */}
      <div className="absolute top-0 right-0 w-[520px] h-[520px] bg-[#d2613a]/[0.10] rounded-full blur-[130px]" />
      <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-[#a8462a]/[0.08] rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <a
          href="https://urlaklinker.com"
          target="_blank"
          rel="noopener"
          className="group block rounded-3xl overflow-hidden border border-[#d2613a]/25 hover:border-[#d2613a]/50 transition-all duration-500"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* LEFT — copy */}
            <div className="relative bg-gradient-to-br from-[#1a0f0a] via-[#150d08] to-[#0c0a08] p-8 md:p-14 flex flex-col justify-center">
              <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-[#e8a786] mb-5">
                {tr ? 'URLASTONE GROUP · YENİ MARKA' : 'URLASTONE GROUP · NEW BRAND'}
              </p>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-white leading-[1.05] mb-5">
                URLA<span className="text-[#d2613a]">KLINKER</span>
              </h2>
              <p className="text-white/55 text-sm md:text-base leading-relaxed max-w-md mb-8 font-mono">
                {tr
                  ? 'Doğal taşın yanında, ateşte pişen el yapımı klinker tuğla. Urla\'nın toprağından, aynı zanaatkâr ellerden — dış cephe, iç mekan ve peyzaj için.'
                  : 'Beyond natural stone — handmade clinker brick fired in flame. From Urla\'s soil, by the same craftsmen — for facade, interior and landscape.'}
              </p>
              <span className="inline-flex items-center gap-2 self-start px-7 py-3.5 rounded-full bg-[#d2613a] text-white font-medium text-sm group-hover:bg-[#b84e2c] transition-colors">
                {tr ? 'URLAKLINKER\'ı Keşfet' : 'Discover URLAKLINKER'}
                <ArrowUpRight size={17} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </div>

            {/* RIGHT — brick image */}
            <div className="relative min-h-[260px] lg:min-h-0 overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-[1.2s] ease-out"
                style={{ backgroundImage: 'url(https://urlaklinker.com/assets/series-handmade.jpg)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0c0a08] via-transparent to-transparent lg:from-[#150d08]/80" />
            </div>
          </div>
        </a>
      </div>
    </section>
  )
}
