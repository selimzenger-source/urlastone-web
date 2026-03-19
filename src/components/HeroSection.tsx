'use client'

import { useEffect, useState, useCallback } from 'react'
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const slides = [
  {
    image: '/hero-1.png',
    tag: 'Cephe Kaplama',
    subtitle: 'Doğanın milyonlarca yıllık',
    title: ['Eşsiz', 'taşları.'],
    description: 'Türkiye\'nin en seçkin madenlerinden çıkarılan doğal taş blokları, fabrikamızda teknolojik kesim bantları ve el işçiliği ile işlenerek projenize özel çözümler halinde sunulur.',
  },
  {
    image: '/hero-2.png',
    tag: 'Doğal Taş',
    subtitle: 'Her mekânda farklı bir hikaye',
    title: ['Zamansız', 'elegans.'],
    description: 'Traverten, mermer, bazalt ve daha fazlası — her taş kendi benzersiz hikayesini taşır.',
  },
  {
    image: '/hero-3.png',
    tag: 'Villa Projesi',
    subtitle: 'Madenden mekânınıza',
    title: ['Kusursuz', 'işçilik.'],
    description: 'Çeşitli teknolojik kesim bantları ve el işçiliğiyle, doğal taş yüzeylerini projenize özel hale getiriyoruz.',
  },
  {
    image: '/hero-4.png',
    tag: 'Usta İşi',
    subtitle: 'Lüksü hissedin',
    title: ['Doğal', 'zarafet.'],
    description: 'Usta ellerden çıkan her taş, yılların deneyimini ve doğanın eşsiz dokusunu taşır.',
  },
  {
    image: '/hero-5.png',
    tag: 'Atölye',
    subtitle: 'Sonsuz süreli garanti',
    title: ['Kalıcı', 'güzellik.'],
    description: 'Tabiatın bize vermiş olduğu doğal taşın milyon yıllık sürecine güvenerek, sonsuz süreli garantiyi veriyoruz.',
  },
]

export default function HeroSection() {
  const [current, setCurrent] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [animating, setAnimating] = useState(false)

  const goTo = useCallback((index: number) => {
    if (animating) return
    setAnimating(true)
    setCurrent(index)
    setTimeout(() => setAnimating(false), 800)
  }, [animating])

  const next = useCallback(() => {
    goTo((current + 1) % slides.length)
  }, [current, goTo])

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length)
  }, [current, goTo])

  useEffect(() => { setLoaded(true) }, [])

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Slides */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms] ease-out"
            style={{
              backgroundImage: `url(${slide.image})`,
              transform: i === current ? 'scale(1.08)' : 'scale(1)',
            }}
          />
        </div>
      ))}

      {/* Dark overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-black/40 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 to-transparent z-[1]" />

      {/* Grain texture */}
      <div className="absolute inset-0 z-[2] grain-overlay pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-20">
        <div className="min-h-[70vh] flex flex-col justify-center">
          {/* Tag */}
          <div className={`mb-8 transition-all duration-1000 delay-300 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="inline-flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-2">
              <div className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
              <span className="font-mono text-[10px] text-white/50 tracking-wider uppercase">
                {slides[current].tag}
              </span>
            </div>
          </div>

          {/* Subtitle */}
          <p
            key={`sub-${current}`}
            className="text-white/60 font-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal mb-3 md:mb-4 animate-fade-in-up"
          >
            {slides[current].subtitle}
          </p>

          {/* Title */}
          <h1 key={`title-${current}`} className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <span className="block font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold hero-gold-text leading-[1.3]">
              {slides[current].title[0]}
            </span>
            <span className="block font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold hero-gold-text leading-[1.3]">
              {slides[current].title[1]}
            </span>
          </h1>

          {/* Description */}
          <div className="mt-10 md:mt-12 max-w-xl">
            <p
              key={`desc-${current}`}
              className="font-mono text-[13px] md:text-sm text-white/50 leading-relaxed animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              {slides[current].description}
            </p>
          </div>

          {/* CTA */}
          <div className={`mt-10 flex flex-col sm:flex-row gap-4 transition-all duration-1000 delay-[1100ms] ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Link href="/simulasyon" className="btn-primary text-sm px-8 py-4">
              <Sparkles size={16} />
              AI Simülasyon
              <ArrowRight size={16} />
            </Link>
            <Link href="/taslar" className="btn-outline text-sm px-8 py-4">
              Koleksiyonu Keşfet
            </Link>
          </div>

          {/* Bottom stats */}
          <div className={`mt-20 md:mt-28 pt-8 border-t border-white/[0.06] grid grid-cols-3 gap-8 max-w-2xl transition-all duration-1000 delay-[1300ms] ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {[
              { number: '500+', label: 'Tamamlanan Proje' },
              { number: '50+', label: 'Taş Çeşidi' },
              { number: '15+', label: 'Yıllık Deneyim' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-heading text-2xl md:text-3xl font-bold text-white">
                  {stat.number}
                </div>
                <div className="text-white/30 text-[11px] md:text-xs tracking-wider uppercase mt-1 font-mono">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide Navigation */}
      <div className={`absolute right-6 md:right-12 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-4 transition-all duration-1000 delay-[1500ms] ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* Current number */}
        <div className="flex items-baseline gap-1">
          <span className="font-heading text-4xl font-bold text-white">
            {String(current + 1).padStart(2, '0')}
          </span>
          <span className="font-mono text-xs text-white/30">
            /{String(slides.length).padStart(2, '0')}
          </span>
        </div>

        {/* Arrows */}
        <div className="flex gap-2">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300"
            aria-label="Önceki slayt"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={next}
            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300"
            aria-label="Sonraki slayt"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Dots */}
        <div className="flex flex-col gap-2 mt-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current ? 'bg-gold-400 scale-125' : 'bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Slayt ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
