'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { MapPin, Building2, Globe, ArrowRight, Clock, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import dynamic from 'next/dynamic'
import type { Project } from '@/types/project'

const ProjectMap = dynamic(() => import('@/components/ProjectMap'), { ssr: false })

export default function UygulamalarimPage() {
  const { t } = useLanguage()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProjects(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const locations = projects.map((p) => ({
    id: p.id,
    city: p.city,
    lat: p.lat,
    lng: p.lng,
    project_name: p.project_name,
    address: p.address,
    description: p.description,
    category: p.category,
    photos: p.photos || [],
  }))

  const stats = [
    { value: projects.length > 0 ? `${projects.length}` : '150+', label: t.apps_total_projects, icon: Building2 },
    { value: projects.length > 0 ? `${new Set(projects.map((p) => p.city)).size}` : '35+', label: t.apps_total_cities, icon: MapPin },
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
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={32} className="animate-spin text-white/20" />
                </div>
              ) : (
                <ProjectMap locations={locations} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Project Gallery */}
      {projects.length > 0 ? (
        <section className="px-6 md:px-12 pb-24 md:pb-32">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="glass-card-hover overflow-hidden group">
                  {/* Photo */}
                  <div className="aspect-[16/10] overflow-hidden relative">
                    {project.photos?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={project.photos[0]}
                        alt={project.project_name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/[0.04] flex items-center justify-center">
                        <Building2 size={32} className="text-white/10" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-gold-400 text-[10px] font-mono">
                        {project.category}
                      </span>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-heading text-lg font-bold text-white mb-1">
                      {project.project_name}
                    </h3>
                    <div className="flex items-center gap-1.5 mb-2">
                      <MapPin size={12} className="text-gold-400" />
                      <span className="text-white/40 text-xs font-mono">{project.city}</span>
                    </div>
                    {project.product && (
                      <p className="text-white/50 text-xs font-mono mb-2">{project.product}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {project.application_type && (
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-white/40 text-[10px] font-mono">
                          {project.application_type}
                        </span>
                      )}
                      {project.contractor && (
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-white/40 text-[10px] font-mono">
                          {project.contractor}
                        </span>
                      )}
                      {project.project_date && (
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-white/40 text-[10px] font-mono">
                          {project.project_date}
                        </span>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-white/40 text-sm leading-relaxed line-clamp-2 mb-4">
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/uygulamalarimiz/${project.id}`}
                        className="inline-flex items-center gap-2 text-white text-xs font-mono bg-white/[0.06] hover:bg-white/[0.12] px-3 py-1.5 rounded-full transition-colors"
                      >
                        Detayları Gör
                        <ArrowRight size={10} />
                      </Link>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${project.lat},${project.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-gold-400 text-xs font-mono hover:text-gold-300 transition-colors"
                      >
                        <MapPin size={12} />
                        Konuma Git
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
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
      )}

      <Footer />
    </main>
  )
}
