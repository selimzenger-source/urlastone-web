'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Upload, Gem, Eye, ArrowRight, Sparkles, Clock } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

export default function SimulasyonPage() {
  const { t } = useLanguage()

  const features = [
    { icon: Upload, title: t.sim_feature1_title, desc: t.sim_feature1_desc, step: '01' },
    { icon: Gem, title: t.sim_feature2_title, desc: t.sim_feature2_desc, step: '02' },
    { icon: Eye, title: t.sim_feature3_title, desc: t.sim_feature3_desc, step: '03' },
  ]

  return (
    <main className="bg-[#0a0a0a] text-white min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 md:pt-40 pb-16 md:pb-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-2 mb-6">
            <Sparkles size={14} className="text-gold-400" />
            <span className="font-mono text-[10px] text-white/50 tracking-wider uppercase">
              {t.sim_tag}
            </span>
          </div>
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold mb-4">
            {t.sim_title}{' '}
            <span className="text-gradient-gold">{t.sim_gold}</span>
          </h1>
          <p className="text-white/50 text-base md:text-lg max-w-2xl mx-auto">
            {t.sim_desc}
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 md:px-12 pb-16 md:pb-24">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="glass-card p-8 text-center">
              <div className="font-mono text-[10px] text-gold-400 tracking-wider mb-4">{feature.step}</div>
              <div className="w-14 h-14 rounded-full bg-gold-400/10 flex items-center justify-center mx-auto mb-5">
                <feature.icon size={24} className="text-gold-400" />
              </div>
              <h3 className="font-heading text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-white/40 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Coming Soon */}
      <section className="px-6 md:px-12 pb-24 md:pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card p-12 md:p-20 text-center">
            <div className="w-16 h-16 rounded-full bg-gold-400/10 flex items-center justify-center mx-auto mb-6">
              <Clock size={28} className="text-gold-400" />
            </div>
            <h3 className="font-heading text-2xl md:text-3xl font-bold mb-4">{t.sim_coming_soon}</h3>
            <p className="text-white/40 text-sm md:text-base max-w-lg mx-auto mb-8">
              {t.sim_coming_desc}
            </p>
            <Link href="/teklif" className="btn-primary text-sm">
              {t.common_teklif_al}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
