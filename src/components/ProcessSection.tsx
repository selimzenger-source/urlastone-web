'use client'

import { useLanguage } from '@/context/LanguageContext'

/* Custom SVG icons — stone industry specific */
const IconKesifAnaliz = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Magnifying glass over stone slab */}
    <rect x="4" y="22" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
    <line x1="8" y1="26" x2="14" y2="26" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    <line x1="8" y1="29" x2="18" y2="29" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    <line x1="8" y1="32" x2="12" y2="32" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    <circle cx="26" cy="16" r="9" stroke="currentColor" strokeWidth="1.8" />
    <line x1="32.5" y1="22.5" x2="37" y2="27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Stone texture inside magnifier */}
    <path d="M20 13 L23 11 L27 14 L30 12 L32 15" stroke="currentColor" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
    <path d="M21 17 L25 19 L29 16 L31 18" stroke="currentColor" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
  </svg>
)

const IconUretimTermin = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Chisel cutting stone block */}
    <rect x="6" y="18" width="22" height="18" rx="1" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
    {/* Stone texture lines */}
    <line x1="10" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="1" opacity="0.25" />
    <line x1="10" y1="27" x2="24" y2="27" stroke="currentColor" strokeWidth="1" opacity="0.25" />
    <line x1="10" y1="31" x2="20" y2="31" stroke="currentColor" strokeWidth="1" opacity="0.25" />
    {/* Chisel tool */}
    <path d="M28 20 L34 8 L36 9 L30 21 Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.7" />
    {/* Sparks */}
    <circle cx="28" cy="18" r="1" fill="currentColor" opacity="0.6" />
    <circle cx="31" cy="16" r="0.7" fill="currentColor" opacity="0.4" />
    <circle cx="26" cy="16" r="0.7" fill="currentColor" opacity="0.4" />
    {/* Cut line on stone */}
    <line x1="28" y1="20" x2="28" y2="36" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
  </svg>
)

const IconUygulama = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Building wall with stone pattern */}
    <rect x="6" y="10" width="28" height="26" rx="1" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
    {/* Stone brick pattern */}
    <rect x="8" y="12" width="11" height="5" rx="0.5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <rect x="21" y="12" width="11" height="5" rx="0.5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <rect x="8" y="19" width="7" height="5" rx="0.5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <rect x="17" y="19" width="7" height="5" rx="0.5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <rect x="26" y="19" width="6" height="5" rx="0.5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <rect x="8" y="26" width="11" height="5" rx="0.5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <rect x="21" y="26" width="11" height="5" rx="0.5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <rect x="8" y="33" width="8" height="3" rx="0.5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <rect x="18" y="33" width="6" height="3" rx="0.5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <rect x="26" y="33" width="6" height="3" rx="0.5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    {/* Trowel */}
    <path d="M30 4 L36 2 L38 4 L32 8 Z" fill="currentColor" opacity="0.7" />
    <line x1="30" y1="4" x2="26" y2="8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
  </svg>
)

const icons = [IconKesifAnaliz, IconUretimTermin, IconUygulama]

export default function ProcessSection() {
  const { t } = useLanguage()

  const steps = [
    {
      title: t.process_step1_title,
      description: t.process_step1_desc,
      number: '01',
    },
    {
      title: t.process_step2_title,
      description: t.process_step2_desc,
      number: '02',
    },
    {
      title: t.process_step3_title,
      description: t.process_step3_desc,
      number: '03',
    },
  ]

  return (
    <section className="section-padding border-t border-white/[0.06]" style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1510 50%, #0a0a0a 100%)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 md:mb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
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

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => {
            const Icon = icons[index]
            return (
              <div key={index} className="glass-card p-8 md:p-10 group hover:bg-white/[0.06] transition-all duration-500 relative overflow-hidden">
                {/* Step number watermark */}
                <div className="absolute top-4 right-6 font-heading text-6xl md:text-7xl font-bold text-white/[0.03] group-hover:text-white/[0.06] transition-colors duration-500">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400/15 to-gold-600/10 border border-gold-400/20 flex items-center justify-center mb-8 group-hover:from-gold-400/25 group-hover:to-gold-600/15 group-hover:border-gold-400/35 transition-all duration-500 text-gold-400">
                  <Icon />
                </div>

                {/* Content */}
                <h3 className="text-white font-heading text-xl font-semibold mb-4">
                  {step.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  {step.description}
                </p>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-gold-400/0 via-gold-400/40 to-gold-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
