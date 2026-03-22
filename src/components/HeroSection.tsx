'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

interface SlideData {
  image: string
  tag: string
  subtitle: string
  gold: string
  desc: string
  bgSize: string
  bgPos: string
}

// Fallback slides (mevcut hardcoded veriler)
function getFallbackSlides(t: any): SlideData[] {
  return [
    { image: '/slide-1.jpg', tag: t.slide1_tag, subtitle: t.slide1_subtitle, gold: t.slide1_gold, desc: t.slide1_desc, bgSize: 'cover', bgPos: 'center center' },
    { image: '/slide-2.jpg', tag: t.slide2_tag, subtitle: t.slide2_subtitle, gold: t.slide2_gold, desc: t.slide2_desc, bgSize: 'cover', bgPos: 'center 45%' },
    { image: '/slide-3.jpg', tag: t.slide3_tag, subtitle: t.slide3_subtitle, gold: t.slide3_gold, desc: t.slide3_desc, bgSize: 'cover', bgPos: 'center 45%' },
    { image: '/slide-4.jpg', tag: t.slide4_tag, subtitle: t.slide4_subtitle, gold: t.slide4_gold, desc: t.slide4_desc, bgSize: 'cover', bgPos: 'center center' },
    { image: '/slide-5.jpg', tag: t.slide5_tag, subtitle: t.slide5_subtitle, gold: t.slide5_gold, desc: t.slide5_desc, bgSize: 'cover', bgPos: 'center 55%' },
    { image: '/slide-6.png', tag: t.slide6_tag, subtitle: t.slide6_subtitle, gold: t.slide6_gold, desc: t.slide6_desc, bgSize: 'cover', bgPos: 'center center' },
    { image: '/slide-7.jpg', tag: t.slide7_tag, subtitle: t.slide7_subtitle, gold: t.slide7_gold, desc: t.slide7_desc, bgSize: 'cover', bgPos: 'center 40%' },
    { image: '/slide-8.jpg', tag: t.slide8_tag, subtitle: t.slide8_subtitle, gold: t.slide8_gold, desc: t.slide8_desc, bgSize: 'cover', bgPos: 'center 70%' },
  ]
}

export default function HeroSection() {
  const { t, locale } = useLanguage()
  const isRtl = locale === 'ar'

  const [slides, setSlides] = useState<SlideData[]>(() => getFallbackSlides(t))
  const [transitionMs, setTransitionMs] = useState(7000)
  const [current, setCurrent] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [animating, setAnimating] = useState(false)

  // Fetch slides from API
  useEffect(() => {
    let cancelled = false
    async function fetchSlides() {
      try {
        const res = await fetch('/api/hero-slides')
        if (!res.ok) return
        const data = await res.json()
        if (!Array.isArray(data) || data.length === 0 || cancelled) return

        const mapped: SlideData[] = data.map((s: any) => ({
          image: s.image_url,
          tag: s[`tag_${locale}`] || s.tag_tr || '',
          subtitle: s[`subtitle_${locale}`] || s.subtitle_tr || '',
          gold: s[`gold_${locale}`] || s.gold_tr || '',
          desc: s[`desc_${locale}`] || s.desc_tr || '',
          bgSize: 'cover',
          bgPos: s.bg_position || 'center center',
        }))
        if (!cancelled) {
          setSlides(mapped)
          if (data[0]?.transition_seconds) {
            setTransitionMs(data[0].transition_seconds * 1000)
          }
        }
      } catch {
        // Fallback slides already set
      }
    }
    fetchSlides()
    return () => { cancelled = true }
  }, [locale])

  // Update slide texts when locale changes and we have API data
  useEffect(() => {
    setSlides(prev => {
      // If slides are from fallback (i18n), update with new locale
      if (prev.length > 0 && prev[0].image.startsWith('/slide-')) {
        return getFallbackSlides(t)
      }
      return prev
    })
  }, [t])

  const goTo = useCallback((index: number) => {
    if (animating) return
    setAnimating(true)
    setCurrent(index)
    setTimeout(() => setAnimating(false), 800)
  }, [animating])

  const next = useCallback(() => {
    goTo((current + 1) % slides.length)
  }, [current, goTo, slides.length])

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length)
  }, [current, goTo, slides.length])

  // Touch swipe support
  const touchStartX = useRef<number | null>(null)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) next()
      else prev()
    }
    touchStartX.current = null
  }, [next, prev])

  useEffect(() => { setLoaded(true) }, [])

  // Auto-slide with configurable duration
  useEffect(() => {
    const timer = setInterval(next, transitionMs)
    return () => clearInterval(timer)
  }, [next, transitionMs])

  return (
    <section
      className="relative min-h-screen flex flex-col overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Slides */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <div
            className="absolute transition-transform duration-[8000ms] ease-out"
            style={{
              inset: '0',
              backgroundImage: `url(${slide.image})`,
              backgroundSize: slide.bgSize || 'cover',
              backgroundPosition: slide.bgPos || 'center center',
              backgroundRepeat: 'no-repeat',
              transform: i === current ? 'scale(1.03)' : 'scale(1)',
            }}
          />
        </div>
      ))}

      {/* Dark overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-black/20 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/70 to-transparent z-[1]" />

      {/* Grain texture */}
      <div className="absolute inset-0 z-[2] grain-overlay pointer-events-none" />

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col justify-end md:justify-center w-full max-w-7xl mx-auto px-6 md:px-12 pt-28 md:pt-32 pb-24 md:pb-20">
        {/* Subtitle */}
        <p
          key={`sub-${current}`}
          className="text-white/60 font-heading text-lg sm:text-2xl md:text-3xl lg:text-4xl font-normal mb-2 md:mb-4 animate-fade-in-up max-w-[75%] md:max-w-none"
        >
          {slides[current].subtitle}
        </p>

        {/* Gold Title */}
        <h1 key={`title-${current}`} className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <span className="block font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold hero-gold-text leading-[1.3] max-w-[80%] md:max-w-none">
            {slides[current].gold}
          </span>
        </h1>

        {/* Description */}
        <div className="mt-6 md:mt-12 max-w-xl">
          <p
            key={`desc-${current}`}
            className="font-mono text-[12px] md:text-sm text-white/50 leading-relaxed animate-fade-in-up max-w-[85%] md:max-w-none"
            style={{ animationDelay: '0.3s' }}
          >
            {slides[current].desc}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className={`mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 md:gap-4 max-w-[85%] sm:max-w-none transition-all duration-1000 delay-[1100ms] ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Link href="/simulasyon" className="btn-primary text-sm px-6 md:px-8 py-3.5 md:py-4">
            <Sparkles size={16} />
            {t.hero_btn_simulasyon}
            <ArrowRight size={16} />
          </Link>
          <Link href="/taslar" className="btn-outline text-sm px-6 md:px-8 py-3.5 md:py-4">
            {t.hero_btn_koleksiyon}
          </Link>
        </div>
      </div>

      {/* Mobile Navigation - Bottom center */}
      <div className={`md:hidden absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center gap-3 transition-all duration-1000 delay-[1500ms] ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* Arrows + Counter */}
        <div className="flex items-center gap-4">
          <button
            onClick={prev}
            className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center active:bg-white active:text-black transition-all duration-300"
            aria-label="Onceki slayt"
          >
            {isRtl ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          <div className="flex items-baseline gap-1">
            <span className="font-heading text-2xl font-bold text-white">
              {String(current + 1).padStart(2, '0')}
            </span>
            <span className="font-mono text-[10px] text-white/30">
              /{String(slides.length).padStart(2, '0')}
            </span>
          </div>

          <button
            onClick={next}
            className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center active:bg-white active:text-black transition-all duration-300"
            aria-label="Sonraki slayt"
          >
            {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>

        {/* Dots - Horizontal */}
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'bg-gold-400 w-6' : 'bg-white/20 w-1.5'
              }`}
              aria-label={`Slayt ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop Navigation - Right side (Left for RTL) */}
      <div className={`hidden md:flex absolute ${isRtl ? 'left-12' : 'right-12'} top-1/2 -translate-y-1/2 z-20 flex-col items-center gap-4 transition-all duration-1000 delay-[1500ms] ${loaded ? 'opacity-100' : 'opacity-0'}`}>
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
            aria-label="Onceki slayt"
          >
            {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button
            onClick={next}
            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300"
            aria-label="Sonraki slayt"
          >
            {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
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
