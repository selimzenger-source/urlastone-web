'use client'

import { Sparkles, ArrowRight, Upload } from 'lucide-react'
import Link from 'next/link'

export default function SimulationBanner() {
  return (
    <section className="section-padding border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto">
        <Link href="/simulasyon" className="block group">
          <div className="relative overflow-hidden rounded-3xl p-8 md:p-14 lg:p-20">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold-400/10 via-gold-400/5 to-transparent" />
            <div className="absolute inset-0 border border-gold-400/10 rounded-3xl" />

            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gold-400/[0.06] rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-gold-400/[0.04] rounded-full blur-[80px]" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
              {/* Left content */}
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gold-400/20 flex items-center justify-center">
                    <Sparkles size={18} className="text-gold-400" />
                  </div>
                  <span className="font-mono text-[11px] text-gold-400 tracking-wider uppercase">
                    Yapay Zeka Destekli
                  </span>
                </div>

                <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                  Taşı binanızda
                  <br />
                  <span className="italic text-gradient-gold">görün.</span>
                </h2>

                <p className="text-white/50 text-sm md:text-base font-mono leading-relaxed max-w-lg">
                  Bina cephenizin fotoğrafını yükleyin, yapay zeka ile
                  koleksiyonumuzdaki taşların binanıza nasıl görüneceğini
                  anında keşfedin.
                </p>

                {/* Steps mini */}
                <div className="mt-8 flex flex-wrap gap-6">
                  {[
                    { icon: Upload, text: 'Fotoğraf yükle' },
                    { icon: Sparkles, text: 'Taş seç' },
                    { icon: ArrowRight, text: 'Sonucu gör' },
                  ].map((step, i) => {
                    const Icon = step.icon
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                          <Icon size={14} className="text-gold-400" />
                        </div>
                        <span className="text-white/60 text-xs font-mono">{step.text}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right - CTA */}
              <div className="flex-shrink-0">
                <div className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-medium text-sm group-hover:bg-gold-400 transition-colors duration-500">
                  Simülasyonu Dene
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  )
}
