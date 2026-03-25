'use client'

import { useLanguage } from '@/context/LanguageContext'
import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'

export default function ProcessSection() {
  const { t } = useLanguage()
  const [activeStep, setActiveStep] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const nextStep = useCallback(() => {
    setActiveStep(prev => (prev >= 3 ? 0 : prev + 1))
  }, [])

  // Section görünür olduğunda step 0'dan başla, çıkınca durdur
  const sectionRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Section görününce step 0'dan başla
          setActiveStep(0)
          if (timerRef.current) clearInterval(timerRef.current)
          timerRef.current = setInterval(nextStep, 4250)
        } else {
          // Section görünmeyince durdur
          if (timerRef.current) clearInterval(timerRef.current)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(section)
    return () => { observer.disconnect(); if (timerRef.current) clearInterval(timerRef.current) }
  }, [nextStep])

  const goToStep = (step: number) => {
    setActiveStep(step)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(nextStep, 4000)
  }

  const steps = [
    { title: t.process_step1_title, desc: t.process_step1_desc, number: '1' },
    { title: t.process_step2_title, desc: t.process_step2_desc, number: '2' },
    { title: t.process_step3_title, desc: t.process_step3_desc, number: '3' },
  ]

  const logoParts = [
    { clipPath: 'polygon(0% 58%, 100% 58%, 100% 100%, 0% 100%)', step: 1 },
    { clipPath: 'polygon(0% 25%, 100% 25%, 100% 58%, 0% 58%)', step: 2 },
    { clipPath: 'polygon(0% 0%, 100% 0%, 100% 25%, 0% 25%)', step: 3 },
  ]

  // Gold filter: white outlines on black bg → gold tones
  const goldFilter = 'sepia(1) hue-rotate(10deg) saturate(2) brightness(1.2)'

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

        {/* İçerik: Metin + Logo yan yana */}
        <div className="flex flex-col-reverse md:flex-row items-center gap-10 md:gap-14 lg:gap-20">

          {/* Metin tarafı */}
          <div className="flex-1 w-full" style={{ minHeight: '180px' }}>
            {activeStep === 0 && (
              <div className="animate-fadeIn">
                <h3 className="text-white font-heading text-xl md:text-2xl font-semibold mt-10 mb-4 leading-relaxed">
                  {t.process_subtitle}
                </h3>
              </div>
            )}

            {steps.map((step, i) => (
              activeStep === i + 1 && (
                <div key={i} className="animate-fadeIn">
                  <span className="text-gold-400/20 font-heading text-6xl md:text-7xl font-bold block">
                    {step.number}
                  </span>
                  <h3 className="text-white font-heading text-xl md:text-2xl font-semibold mt-3 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-white/45 text-sm md:text-base font-body leading-relaxed max-w-md">
                    {step.desc}
                  </p>
                </div>
              )
            ))}
          </div>

          {/* Logo tarafı + dots altında */}
          <div className="flex-shrink-0 flex flex-col items-center">
            {/* Logo container */}
            <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 relative">
              {/* Yıkık taş yığını — step 0 */}
              <div
                className="absolute inset-0 flex items-end justify-center"
                style={{
                  opacity: activeStep === 0 ? 1 : 0,
                  transform: activeStep === 0 ? 'scale(1)' : 'scale(0.85)',
                  transition: 'all 800ms ease',
                }}
              >
                <Image
                  src="/logo-rubble-v2.png"
                  alt="Taş yığını"
                  fill
                  className="object-contain object-bottom"
                  style={{ filter: 'none' }}
                />
              </div>

              {/* Logo parçaları */}
              {logoParts.map((part, i) => (
                <div
                  key={i}
                  className="absolute inset-0"
                  style={{
                    clipPath: part.clipPath,
                    opacity: activeStep >= part.step ? 1 : 0,
                    transform: activeStep >= part.step
                      ? 'translateY(0) scale(1)'
                      : `translateY(${40 + i * 15}px) scale(0.85)`,
                    transition: 'all 1000ms cubic-bezier(0.22, 1, 0.36, 1)',
                    transitionDelay: activeStep >= part.step ? `${i * 150}ms` : '0ms',
                  }}
                >
                  <Image
                    src="/logo-outline.png"
                    alt=""
                    fill
                    className="object-contain"
                    style={{ filter: 'none' }}
                  />
                </div>
              ))}

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

            {/* Progress dots — logo altında */}
            <div className="flex items-center gap-2 mt-6">
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
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 600ms ease forwards;
        }
      `}</style>
    </section>
  )
}
