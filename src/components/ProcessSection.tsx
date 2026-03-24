'use client'

import { useLanguage } from '@/context/LanguageContext'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export default function ProcessSection() {
  const { t } = useLanguage()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const handleScroll = () => {
      const rect = section.getBoundingClientRect()
      const windowH = window.innerHeight
      const progress = Math.max(0, Math.min(1, (windowH - rect.top) / (windowH + rect.height * 0.3)))

      if (progress > 0.5) setActiveStep(3)
      else if (progress > 0.3) setActiveStep(2)
      else if (progress > 0.1) setActiveStep(1)
      else setActiveStep(0)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
      className="section-padding border-t border-white/[0.06] overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1510 50%, #0a0a0a 100%)' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header + Logo yan yana (desktop) / alt alta (mobil) */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-16 md:mb-20">
          <div className="lg:flex-1">
            <p className="font-mono text-[11px] text-white/40 tracking-wider uppercase mb-4">
              {t.process_tag}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {t.process_title}
            </h2>
            <p className="text-white/40 text-sm max-w-sm font-mono leading-relaxed">
              {t.process_subtitle}
            </p>
          </div>

          {/* Logo — ortada veya sağda */}
          <div className="flex justify-center lg:justify-end">
            {renderLogo('w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64')}
          </div>
        </div>

        {/* 3 Adım — yan yana (desktop) / alt alta (mobil) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, i) => {
            const isActive = activeStep >= i + 1
            const isCurrent = activeStep === i + 1
            return (
              <div
                key={i}
                className="relative glass-card p-8 md:p-10 group transition-all duration-700 overflow-hidden"
                style={{
                  opacity: isActive ? 1 : 0.15,
                  transform: isActive ? 'translateY(0)' : 'translateY(30px)',
                  borderColor: isCurrent ? 'rgba(179,147,69,0.3)' : undefined,
                }}
              >
                {/* Numara watermark */}
                <div className={`absolute top-4 right-6 font-heading text-6xl md:text-7xl font-bold transition-colors duration-500 ${isCurrent ? 'text-gold-400/10' : 'text-white/[0.03]'}`}>
                  {step.number}
                </div>

                {/* İçerik */}
                <h3 className={`font-heading text-xl font-semibold mb-4 transition-colors duration-500 ${isCurrent ? 'text-white' : 'text-white/60'}`}>
                  {step.title}
                </h3>
                <p className={`text-sm leading-relaxed transition-colors duration-500 ${isCurrent ? 'text-white/50' : 'text-white/25'}`}>
                  {step.desc}
                </p>

                {/* Alt gold çizgi — aktif adımda */}
                <div
                  className="absolute bottom-0 left-0 w-full h-[2px] transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(90deg, rgba(179,147,69,0) 0%, rgba(179,147,69,0.5) 50%, rgba(179,147,69,0) 100%)',
                    opacity: isCurrent ? 1 : 0,
                  }}
                />
              </div>
            )
          })}
        </div>

        {/* Logo tamamlandı yazısı */}
        <div
          className="text-center mt-10"
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
