'use client'

import { useLanguage } from '@/context/LanguageContext'
import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'

export default function ProcessSection() {
  const { t } = useLanguage()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [activeStep, setActiveStep] = useState(0) // 0=yıkık, 1,2,3=adımlar
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Otomatik carousel — 4 sn'de bir (0→1→2→3→0)
  const nextStep = useCallback(() => {
    setActiveStep(prev => (prev >= 3 ? 0 : prev + 1))
  }, [])

  useEffect(() => {
    timerRef.current = setInterval(nextStep, 4000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [nextStep])

  // Manuel tıklama — timer'ı sıfırla
  const goToStep = (step: number) => {
    setActiveStep(step)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(nextStep, 4000)
  }

  const steps = [
    { title: t.process_step1_title, desc: t.process_step1_desc, number: '01' },
    { title: t.process_step2_title, desc: t.process_step2_desc, number: '02' },
    { title: t.process_step3_title, desc: t.process_step3_desc, number: '03' },
  ]

  const logoParts = [
    {
      clipPath: 'polygon(0% 58%, 100% 58%, 100% 100%, 0% 100%)',
      step: 1,
    },
    {
      clipPath: 'polygon(0% 25%, 100% 25%, 100% 58%, 0% 58%)',
      step: 2,
    },
    {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 25%, 0% 25%)',
      step: 3,
    },
  ]

  return (
    <section
      ref={sectionRef}
      className="section-padding border-t border-white/[0.06] overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1510 50%, #0a0a0a 100%)' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 md:mb-14">
          <p className="font-mono text-[11px] text-white/40 tracking-wider uppercase mb-4">
            {t.process_tag}
          </p>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            {t.process_title}
          </h2>
        </div>

        {/* Ana içerik — Logo + Metin yan yana */}
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16">

          {/* Sol: Logo/Yıkık görsel alanı */}
          <div className="flex-shrink-0 w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 relative">
            {/* Yıkık taş yığını — step 0'da görünür */}
            <div
              className="absolute inset-0 flex items-end justify-center"
              style={{
                opacity: activeStep === 0 ? 1 : 0,
                transform: activeStep === 0 ? 'scale(1)' : 'scale(0.8)',
                transition: 'all 800ms ease',
              }}
            >
              <Image
                src="/logo-rubble.png"
                alt="Taş yığını"
                fill
                className="object-contain object-bottom"
                style={{
                  filter: 'brightness(0.7) sepia(0.3) hue-rotate(10deg) saturate(1.5)',
                }}
              />
            </div>

            {/* Logo parçaları — step 1,2,3'te sırayla belirir */}
            {logoParts.map((part, i) => {
              const isVisible = activeStep >= part.step
              return (
                <div
                  key={i}
                  className="absolute inset-0"
                  style={{
                    clipPath: part.clipPath,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible
                      ? 'translateY(0) scale(1)'
                      : `translateY(${30 + i * 10}px) scale(0.9)`,
                    transition: 'all 1000ms cubic-bezier(0.22, 1, 0.36, 1)',
                    transitionDelay: isVisible ? `${i * 150}ms` : '0ms',
                  }}
                >
                  <Image
                    src="/logo-outline.png"
                    alt="URLASTONE"
                    fill
                    className="object-contain"
                    style={{
                      filter: 'brightness(1.1) sepia(0.5) hue-rotate(10deg) saturate(1.8)',
                    }}
                  />
                </div>
              )
            })}

            {/* Glow — logo tamamlanınca */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                opacity: activeStep >= 3 ? 0.3 : 0,
                background: 'radial-gradient(circle, rgba(179,147,69,0.3) 0%, transparent 65%)',
                transition: 'opacity 1500ms ease',
              }}
            />
          </div>

          {/* Sağ: Metin carousel */}
          <div className="flex-1 min-w-0 relative overflow-hidden" style={{ minHeight: '200px' }}>
            {/* Step 0 — başlangıç mesajı */}
            <div
              className="transition-all duration-700 absolute inset-0 flex items-center"
              style={{
                opacity: activeStep === 0 ? 1 : 0,
                transform: activeStep === 0 ? 'translateX(0)' : 'translateX(-40px)',
                pointerEvents: activeStep === 0 ? 'auto' : 'none',
              }}
            >
              <p className="text-white/30 text-sm md:text-base font-mono leading-relaxed max-w-md">
                {t.process_subtitle}
              </p>
            </div>

            {/* Step 1, 2, 3 — adımlar */}
            {steps.map((step, i) => {
              const stepNum = i + 1
              const isActive = activeStep === stepNum
              return (
                <div
                  key={i}
                  className="transition-all duration-700 absolute inset-0 flex items-center"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? 'translateX(0)' : activeStep > stepNum ? 'translateX(-60px)' : 'translateX(60px)',
                    pointerEvents: isActive ? 'auto' : 'none',
                  }}
                >
                  <div>
                    <span className="text-gold-400/25 font-heading text-6xl md:text-7xl font-bold block">
                      {step.number}
                    </span>
                    <h3 className="text-white font-heading text-xl md:text-2xl font-semibold mt-2 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-white/45 text-sm md:text-base leading-relaxed max-w-md">
                      {step.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Alt: Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-10">
          {[0, 1, 2, 3].map(i => (
            <button
              key={i}
              onClick={() => goToStep(i)}
              className={`rounded-full transition-all duration-300 ${
                activeStep === i
                  ? 'w-8 h-2 bg-gold-400/60'
                  : 'w-2 h-2 bg-white/15 hover:bg-white/30'
              }`}
              aria-label={i === 0 ? 'Başlangıç' : `Adım ${i}`}
            />
          ))}
        </div>

        {/* URLASTONE yazısı */}
        <div
          className="text-center mt-6"
          style={{
            opacity: activeStep >= 3 ? 0.5 : 0,
            transition: 'opacity 1000ms ease',
          }}
        >
          <p className="font-heading text-sm tracking-[0.3em] text-gold-400/40 uppercase">URLASTONE</p>
        </div>
      </div>
    </section>
  )
}
