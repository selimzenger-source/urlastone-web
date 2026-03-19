'use client'

import { useLanguage } from '@/context/LanguageContext'

export default function ProcessSection() {
  const { t } = useLanguage()

  const steps = [
    {
      icon: 'https://urlastone.com/gallery_gen/979c8820cdc3da9b25c94ed8d9ec8232_220x220_fit.png?ts=1753707019',
      title: t.process_step1_title,
      description: t.process_step1_desc,
    },
    {
      icon: 'https://urlastone.com/gallery_gen/ea2ff6c22b9e8750def2dc51b2bc6604_220x220_fit.png?ts=1753707019',
      title: t.process_step2_title,
      description: t.process_step2_desc,
    },
    {
      icon: 'https://urlastone.com/gallery_gen/daf5632161f33be4e8ce1be73f2d8714_220x220_fit.png?ts=1753707019',
      title: t.process_step3_title,
      description: t.process_step3_desc,
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
            Her adımı titizlikle yönetilen bir süreçle,
            doğal taşı projenize taşıyoruz.
          </p>
        </div>

        {/* Steps with client's own icons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="glass-card p-10 text-center group hover:bg-white/[0.06] transition-all duration-500">
              {/* Client's icon */}
              <div className="flex justify-center mb-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={step.icon}
                  alt={step.title}
                  className="w-20 h-20 md:w-24 md:h-24 object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                />
              </div>

              {/* Content */}
              <h3 className="text-white font-heading text-xl font-semibold mb-4">
                {step.title}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
