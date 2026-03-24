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
      const progress = Math.max(0, Math.min(1, (windowH - rect.top) / (windowH + rect.height * 0.5)))

      if (progress > 0.55) setActiveStep(3)
      else if (progress > 0.3) setActiveStep(2)
      else if (progress > 0.12) setActiveStep(1)
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

  // 3 logo parçası — her biri başta "yıkılmış" pozisyonda
  const logoParts = [
    {
      // Alt kısım (temel) — aşağı kaymış, sağa eğilmiş
      clipPath: 'polygon(0% 55%, 100% 55%, 100% 100%, 0% 100%)',
      scattered: 'translate(15px, 60px) rotate(8deg)',
      settled: 'translate(0, 0) rotate(0deg)',
      step: 1,
      delay: 0,
    },
    {
      // Orta kısım (gövde) — sola kaymış, hafif eğik
      clipPath: 'polygon(0% 22%, 100% 22%, 100% 55%, 0% 55%)',
      scattered: 'translate(-20px, 35px) rotate(-5deg)',
      settled: 'translate(0, 0) rotate(0deg)',
      step: 2,
      delay: 150,
    },
    {
      // Üst kısım (çatı) — yukarı-sağa dağılmış, ters eğik
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 22%, 0% 22%)',
      scattered: 'translate(10px, -40px) rotate(12deg)',
      settled: 'translate(0, 0) rotate(0deg)',
      step: 3,
      delay: 300,
    },
  ]

  const renderLogo = (size: string) => (
    <div className={`${size} relative`}>
      {logoParts.map((part, i) => {
        const isActive = activeStep >= part.step
        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              clipPath: part.clipPath,
              transform: isActive ? part.settled : part.scattered,
              opacity: isActive ? 1 : 0.15,
              transition: `all 1000ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
              transitionDelay: isActive ? `${part.delay}ms` : '0ms',
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
                  : 'brightness(0.3)',
                transition: 'filter 800ms ease',
              }}
            />
          </div>
        )
      })}

      {/* Glow efekti — logo tamamlanınca */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          opacity: activeStep >= 3 ? 0.25 : 0,
          background: 'radial-gradient(circle, rgba(179,147,69,0.3) 0%, transparent 65%)',
          transition: 'opacity 1200ms ease',
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
        {/* Header */}
        <div className="mb-12 md:mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
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

        {/* ═══ Desktop Layout ═══ */}
        <div className="hidden lg:flex items-center">
          {/* Sol: Adım 1 */}
          <div className="flex-1 pr-12">
            <div
              className="text-right max-w-xs ml-auto"
              style={{
                opacity: activeStep >= 1 ? 1 : 0,
                transform: activeStep >= 1 ? 'translateX(0)' : 'translateX(-30px)',
                transition: 'all 700ms ease',
              }}
            >
              <span className="text-gold-400/20 font-heading text-6xl font-bold block">{steps[0].number}</span>
              <h3 className="text-white font-heading text-xl font-semibold mt-2 mb-3">{steps[0].title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{steps[0].desc}</p>
            </div>
          </div>

          {/* Orta: Logo */}
          <div className="flex-shrink-0 mx-10">
            {renderLogo('w-64 h-64 xl:w-72 xl:h-72')}
          </div>

          {/* Sağ: Adım 2 + 3 */}
          <div className="flex-1 pl-12 space-y-14">
            <div
              className="max-w-xs"
              style={{
                opacity: activeStep >= 2 ? 1 : 0,
                transform: activeStep >= 2 ? 'translateX(0)' : 'translateX(30px)',
                transition: 'all 700ms ease',
              }}
            >
              <span className="text-gold-400/20 font-heading text-6xl font-bold block">{steps[1].number}</span>
              <h3 className="text-white font-heading text-xl font-semibold mt-2 mb-3">{steps[1].title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{steps[1].desc}</p>
            </div>

            <div
              className="max-w-xs"
              style={{
                opacity: activeStep >= 3 ? 1 : 0,
                transform: activeStep >= 3 ? 'translateX(0)' : 'translateX(30px)',
                transition: 'all 700ms ease',
                transitionDelay: activeStep >= 3 ? '200ms' : '0ms',
              }}
            >
              <span className="text-gold-400/20 font-heading text-6xl font-bold block">{steps[2].number}</span>
              <h3 className="text-white font-heading text-xl font-semibold mt-2 mb-3">{steps[2].title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{steps[2].desc}</p>
            </div>
          </div>
        </div>

        {/* ═══ Mobile Layout ═══ */}
        <div className="lg:hidden">
          <div className="flex justify-center mb-10">
            {renderLogo('w-40 h-40 sm:w-48 sm:h-48')}
          </div>

          <div className="space-y-8">
            {steps.map((step, i) => (
              <div
                key={i}
                className="text-center"
                style={{
                  opacity: activeStep >= i + 1 ? 1 : 0,
                  transform: activeStep >= i + 1 ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 600ms ease',
                  transitionDelay: activeStep >= i + 1 ? `${i * 150}ms` : '0ms',
                }}
              >
                <span className="text-gold-400/20 font-heading text-5xl font-bold">{step.number}</span>
                <h3 className="text-white font-heading text-lg font-semibold mt-1 mb-2">{step.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* URLASTONE yazısı — tamamlanınca */}
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
