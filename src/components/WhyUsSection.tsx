'use client'

import { Shield, Gem, Truck, Clock, Award, Sparkles } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function WhyUsSection() {
  const { t } = useLanguage()

  const features = [
    {
      icon: Gem,
      title: t.why1_title,
      description: t.why1_desc,
    },
    {
      icon: Sparkles,
      title: t.why2_title,
      description: t.why2_desc,
    },
    {
      icon: Award,
      title: t.why3_title,
      description: t.why3_desc,
    },
    {
      icon: Truck,
      title: t.why4_title,
      description: t.why4_desc,
    },
  ]
  return (
    <section className="section-padding border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 md:mb-20">
          <p className="font-mono text-[11px] text-white/40 tracking-wider uppercase mb-4">
            {t.why_tag}
          </p>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            {t.why_title}
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="glass-card-hover p-8 group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center mb-6 group-hover:bg-gold-400/20 transition-colors duration-500">
                  <Icon
                    size={22}
                    className="text-white/40 group-hover:text-gold-400 transition-colors duration-500"
                  />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
