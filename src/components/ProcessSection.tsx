'use client'

import { useLanguage } from '@/context/LanguageContext'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export default function ProcessSection() {
  const { t } = useLanguage()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0) // 0 to 1

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const handleScroll = () => {
      const rect = section.getBoundingClientRect()
      const sectionHeight = rect.height
      const windowH = window.innerHeight
      // Progress: 0 = section just appeared, 1 = section almost gone
      const scrolled = windowH - rect.top
      const total = sectionHeight + windowH * 0.5
      setProgress(Math.max(0, Math.min(1, scrolled / total)))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // activeStep based on progress
  const activeStep = progress > 0.65 ? 3 : progress > 0.4 ? 2 : progress > 0.15 ? 1 : 0

  const steps = [
    { title: t.process_step1_title, desc: t.process_step1_desc, number: '01' },
    { title: t.process_step2_title, desc: t.process_step2_desc, number: '02' },
    { title: t.process_step3_title, desc: t.process_step3_desc, number: '03' },
  ]

  const logoParts = [
    {
      clipPath: 'polygon(0% 58%, 100% 58%, 100% 100%, 0% 100%)',
      scattered: 'translate(50px, 140px) rotate(30deg) scale(0.8)',
      settled: 'translate(0, 0) rotate(0deg) scale(1)',
      step: 1,
    },
    {
      clipPath: 'polygon(0% 25%, 100% 25%, 100% 58%, 0% 58%)',
      scattered: 'translate(-60px, 110px) rotate(-25deg) scale(0.75)',
      settled: 'translate(0, 0) rotate(0deg) scale(1)',
      step: 2,
    },
    {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 25%, 0% 25%)',
      scattered: 'translate(35px, 160px) rotate(40deg) scale(0.7)',
      settled: 'translate(0, 0) rotate(0deg) scale(1)',
      step: 3,
    },
  ]

  const renderLogo = (sizeClass: string) => (
    <div className={`${sizeClass} relative`}>
      {logoParts.map((part, i) => {
        const isActive = activeStep >= part.step
        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              clipPath: part.clipPath,
              transform: isActive ? part.settled : part.scattered,
              opacity: isActive ? 1 : 0.12,
              transition: 'all 1200ms cubic-bezier(0.22, 1, 0.36, 1)',
              transitionDelay: isActive ? `${i * 200}ms` : '0ms',
            }}
          >
            <Image
              src="/logo-outline.png"
              alt="URLASTONE"
              fill
              className="object-contain"
              style={{
                filter: isActive
                  ? 'brightness(1.1) sepia(0.5) hue-rotate(10deg) saturate(1.8)'
                  : 'brightness(0.25)',
                transition: 'filter 1000ms ease',
              }}
            />
          </div>
        )
      })}
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          opacity: activeStep >= 3 ? 0.3 : 0,
          background: 'radial-gradient(circle, rgba(179,147,69,0.3) 0%, transparent 65%)',
          transition: 'opacity 1500ms ease',
        }}
      />
    </div>
  )

  return (
    <section
      ref={sectionRef}
      className="border-t border-white/[0.06] overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1510 50%, #0a0a0a 100%)' }}
    >
      {/* ═══ Desktop: Sticky logo + scrolling steps ═══ */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="pt-20 pb-12 flex items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[11px] text-white/40 tracking-wider uppercase mb-4">
                {t.process_tag}
              </p>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                {t.process_title}
              </h2>
            </div>
            <p className="text-white/40 text-sm max-w-sm font-mono leading-relaxed">
              {t.process_subtitle}
            </p>
          </div>
        </div>

        {/* Sticky container */}
        <div className="relative" style={{ minHeight: '200vh' }}>
          <div className="sticky top-0 h-screen flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
              <div className="flex items-center">
                {/* Sol: Adımlar (sırayla belirir) */}
                <div className="flex-1 pr-16 space-y-16">
                  {steps.map((step, i) => (
                    <div
                      key={i}
                      className="text-right max-w-xs ml-auto"
                      style={{
                        opacity: activeStep >= i + 1 ? 1 : 0.08,
                        transform: activeStep >= i + 1 ? 'translateY(0)' : 'translateY(30px)',
                        transition: 'all 800ms ease',
                        transitionDelay: activeStep >= i + 1 ? `${i * 100}ms` : '0ms',
                      }}
                    >
                      <span className={`font-heading text-5xl font-bold block transition-colors duration-500 ${activeStep === i + 1 ? 'text-gold-400/40' : 'text-white/[0.06]'}`}>
                        {step.number}
                      </span>
                      <h3 className={`font-heading text-xl font-semibold mt-2 mb-3 transition-colors duration-500 ${activeStep === i + 1 ? 'text-white' : 'text-white/40'}`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm leading-relaxed transition-colors duration-500 ${activeStep === i + 1 ? 'text-white/50' : 'text-white/20'}`}>
                        {step.desc}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Sağ: Logo (taşlar birleşiyor) */}
                <div className="flex-shrink-0">
                  {renderLogo('w-72 h-72 xl:w-80 xl:h-80')}
                  {/* URLASTONE yazısı */}
                  <p
                    className="text-center mt-4 font-heading text-sm tracking-[0.3em] text-gold-400/40 uppercase"
                    style={{
                      opacity: activeStep >= 3 ? 0.6 : 0,
                      transition: 'opacity 1200ms ease',
                    }}
                  >
                    URLASTONE
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Mobile: Normal flow ═══ */}
      <div className="lg:hidden section-padding">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <p className="font-mono text-[11px] text-white/40 tracking-wider uppercase mb-4">
              {t.process_tag}
            </p>
            <h2 className="font-heading text-3xl font-bold text-white mb-4">
              {t.process_title}
            </h2>
            <p className="text-white/40 text-sm font-mono leading-relaxed">
              {t.process_subtitle}
            </p>
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-10">
            {renderLogo('w-44 h-44 sm:w-52 sm:h-52')}
          </div>

          {/* Steps */}
          <div className="space-y-8">
            {steps.map((step, i) => (
              <div
                key={i}
                className="text-center"
                style={{
                  opacity: activeStep >= i + 1 ? 1 : 0.1,
                  transform: activeStep >= i + 1 ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 600ms ease',
                  transitionDelay: `${i * 150}ms`,
                }}
              >
                <span className={`font-heading text-4xl font-bold ${activeStep === i + 1 ? 'text-gold-400/30' : 'text-white/[0.05]'}`}>
                  {step.number}
                </span>
                <h3 className="text-white font-heading text-lg font-semibold mt-1 mb-2">{step.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
