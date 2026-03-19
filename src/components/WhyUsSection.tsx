'use client'

import { Shield, Gem, Truck, Clock, Award, Sparkles } from 'lucide-react'

const features = [
  {
    icon: Gem,
    title: 'Premium Kalite',
    description: 'En seçkin madenlerden, özenle seçilmiş doğal taşlar.',
  },
  {
    icon: Shield,
    title: 'Sonsuz Garanti',
    description: 'Doğal taşın milyon yıllık ömrüne güvenerek garanti sunuyoruz.',
  },
  {
    icon: Sparkles,
    title: 'El İşçiliği',
    description: 'Teknolojik kesim bantları ve usta el işçiliği.',
  },
  {
    icon: Truck,
    title: 'Türkiye Geneli',
    description: 'Güvenli paketleme ile her yere teslimat.',
  },
  {
    icon: Clock,
    title: 'Hızlı Üretim',
    description: 'Geniş stok alanı ile kısa sürede hazırlık.',
  },
  {
    icon: Award,
    title: '15+ Yıl',
    description: 'Yüzlerce başarılı proje deneyimi.',
  },
]

export default function WhyUsSection() {
  return (
    <section className="section-padding border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 md:mb-20">
          <p className="font-mono text-[11px] text-white/40 tracking-wider uppercase mb-4">
            Avantajlar
          </p>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Neden <span className="italic text-gradient-gold">Urlastone?</span>
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
