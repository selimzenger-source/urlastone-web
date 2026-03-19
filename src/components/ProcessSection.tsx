'use client'

import { Search, Factory, Hammer } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function ProcessSection() {
  const { t } = useLanguage()

  const steps = [
    {
      icon: Search,
      title: t.process_step1_title,
      description: t.process_step1_desc,
      number: '01',
    },
    {
      icon: Factory,
      title: t.process_step2_title,
      description: t.process_step2_desc,
      number: '02',
    },
    {
      icon: Hammer,
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
            const Icon = step.icon
            return (
              <div key={index} className="glass-card p-8 md:p-10 group hover:bg-white/[0.06] transition-all duration-500 relative overflow-hidden">
                {/* Step number watermark */}
                <div className="absolute top-4 right-6 font-heading text-6xl md:text-7xl font-bold text-white/[0.03] group-hover:text-white/[0.06] transition-colors duration-500">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center mb-6 group-hover:bg-gold-400/20 group-hover:border-gold-400/30 transition-all duration-500">
                  <Icon size={24} className="text-gold-400" />
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
