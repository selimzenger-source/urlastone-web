'use client'

import { ArrowRight, MessageCircle, Sparkles, Upload } from 'lucide-react'
import Link from 'next/link'

export default function CTASection() {
  return (
    <section className="relative py-24 md:py-32 px-6 md:px-12 overflow-hidden border-t border-white/[0.06]">
      {/* Background accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-400/[0.04] rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-mono text-[11px] text-white/40 tracking-wider uppercase mb-4">
            Projeniz İçin
          </p>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Hayalinizdeki mekânı
            <br />
            <span className="italic text-gradient-gold">birlikte tasarlayalım.</span>
          </h2>
          <p className="text-white/40 text-sm md:text-base max-w-xl mx-auto font-mono">
            Ücretsiz keşif ve fiyat teklifi için hemen iletişime geçin.
          </p>
        </div>

        {/* Two Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: AI Simülasyon */}
          <Link href="/simulasyon" className="group">
            <div className="relative overflow-hidden rounded-2xl p-8 md:p-10 h-full border border-gold-400/10 bg-gradient-to-br from-gold-400/[0.08] via-gold-400/[0.03] to-transparent hover:border-gold-400/20 transition-all duration-500">
              <div className="absolute top-0 right-0 w-60 h-60 bg-gold-400/[0.06] rounded-full blur-[80px]" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gold-400/20 flex items-center justify-center">
                    <Sparkles size={18} className="text-gold-400" />
                  </div>
                  <span className="font-mono text-[11px] text-gold-400 tracking-wider uppercase">
                    Yapay Zeka Destekli
                  </span>
                </div>

                <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3">
                  Taşı binanızda{' '}
                  <span className="italic text-gradient-gold">görün.</span>
                </h3>

                <p className="text-white/50 text-sm font-mono leading-relaxed mb-8 max-w-md">
                  Bina cephenizin fotoğrafını yükleyin, yapay zeka ile taşların
                  binanıza nasıl görüneceğini anında keşfedin.
                </p>

                {/* Steps mini */}
                <div className="flex flex-wrap gap-5 mb-8">
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

                <div className="inline-flex items-center gap-3 bg-white text-black px-8 py-3.5 rounded-full font-medium text-sm group-hover:bg-gold-400 transition-colors duration-500">
                  Simülasyonu Dene
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          {/* Card 2: Teklif Al + WhatsApp */}
          <div className="relative overflow-hidden rounded-2xl p-8 md:p-10 h-full border border-white/[0.08] bg-white/[0.02] flex flex-col justify-between">
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-gold-400/[0.04] rounded-full blur-[80px]" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/[0.08] flex items-center justify-center">
                  <MessageCircle size={18} className="text-white/60" />
                </div>
                <span className="font-mono text-[11px] text-white/40 tracking-wider uppercase">
                  İletişim
                </span>
              </div>

              <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3">
                Hemen teklif{' '}
                <span className="italic text-gradient-gold">alın.</span>
              </h3>

              <p className="text-white/50 text-sm font-mono leading-relaxed mb-8 max-w-md">
                Projenizin detaylarını paylaşın, 24 saat içinde size özel
                fiyat teklifimizi hazırlayalım.
              </p>

              <ul className="space-y-3 mb-10">
                {[
                  'Ücretsiz keşif ziyareti',
                  'Detaylı fiyat teklifi',
                  'Taş seçimi danışmanlığı',
                  'Nakliye & montaj dahil',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold-400/60" />
                    <span className="text-white/50 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row gap-3">
              <Link href="/iletisim" className="btn-primary text-sm px-8 py-3.5 justify-center">
                Teklif Al
                <ArrowRight size={16} />
              </Link>
              <a
                href="https://wa.me/905532322144?text=Merhaba%2C%20do%C4%9Fal%20ta%C5%9F%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline text-sm px-8 py-3.5 justify-center"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
