'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { MapPin, Building2, Globe, ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import dynamic from 'next/dynamic'

const ProjectMap = dynamic(() => import('@/components/ProjectMap'), { ssr: false })

// Örnek proje lokasyonları - müşteriden detaylar gelecek
const projectLocations = [
  { city: 'İzmir', lat: 38.4237, lng: 27.1428, projects: 12, desc: 'Merkez ofis & showroom' },
  { city: 'İstanbul', lat: 41.0082, lng: 28.9784, projects: 28, desc: 'Konut & ticari projeler' },
  { city: 'Ankara', lat: 39.9334, lng: 32.8597, projects: 8, desc: 'Kamu & özel sektör' },
  { city: 'Antalya', lat: 36.8969, lng: 30.7133, projects: 15, desc: 'Otel & villa projeleri' },
  { city: 'Muğla', lat: 37.2153, lng: 28.3636, projects: 10, desc: 'Villa & tatil köyleri' },
  { city: 'Bursa', lat: 40.1885, lng: 29.0610, projects: 6, desc: 'Konut projeleri' },
  { city: 'Denizli', lat: 37.7765, lng: 29.0864, projects: 5, desc: 'Traverten kaynağı & projeler' },
  { city: 'Trabzon', lat: 41.0027, lng: 39.7168, projects: 3, desc: 'Bölgesel projeler' },
  { city: 'Gaziantep', lat: 37.0662, lng: 37.3833, projects: 4, desc: 'Ticari projeler' },
  { city: 'Lefkoşa', lat: 35.1856, lng: 33.3823, projects: 7, desc: 'KKTC projeleri' },
]

export default function UygulamalarimPage() {
  const { t } = useLanguage()

  const stats = [
    { value: '150+', label: t.apps_total_projects, icon: Building2 },
    { value: '35+', label: t.apps_total_cities, icon: MapPin },
    { value: '12+', label: t.apps_total_countries, icon: Globe },
  ]

  return (
    <main className="bg-[#0a0a0a] text-white min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 md:pt-40 pb-16 md:pb-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
              <span className="font-mono text-[10px] text-white/50 tracking-wider uppercase">
                {t.apps_tag}
              </span>
            </div>
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold mb-4">
              {t.apps_title}{' '}
              <span className="text-gradient-gold">{t.apps_gold}</span>
            </h1>
            <p className="text-white/50 text-base md:text-lg max-w-2xl">
              {t.apps_desc}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-12 max-w-2xl">
            {stats.map((stat, i) => (
              <div key={i} className="text-center md:text-left">
                <stat.icon size={20} className="text-gold-400 mb-2 mx-auto md:mx-0" />
                <div className="font-heading text-2xl md:text-4xl font-bold text-white">{stat.value}</div>
                <div className="font-mono text-[10px] md:text-xs text-white/40 tracking-wider uppercase mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="px-6 md:px-12 pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card overflow-hidden">
            <div className="p-6 md:p-8 border-b border-white/[0.06]">
              <h2 className="font-heading text-xl md:text-2xl font-bold">{t.apps_map_title}</h2>
              <p className="text-white/40 text-sm mt-1">{t.apps_map_desc}</p>
            </div>
            <div className="h-[400px] md:h-[600px]">
              <ProjectMap locations={projectLocations} />
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon - Project Gallery */}
      <section className="px-6 md:px-12 pb-24 md:pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card p-12 md:p-20 text-center">
            <div className="w-16 h-16 rounded-full bg-gold-400/10 flex items-center justify-center mx-auto mb-6">
              <Clock size={28} className="text-gold-400" />
            </div>
            <h3 className="font-heading text-2xl md:text-3xl font-bold mb-4">{t.apps_coming_soon}</h3>
            <p className="text-white/40 text-sm md:text-base max-w-lg mx-auto mb-8">
              {t.apps_coming_desc}
            </p>
            <Link href="/iletisim" className="btn-primary text-sm">
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
