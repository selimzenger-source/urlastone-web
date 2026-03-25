'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { MapPin, Building2, Globe, ArrowRight, Clock, Loader2, Filter, Play, X, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import dynamic from 'next/dynamic'
import type { Project } from '@/types/project'
import type { Locale } from '@/lib/i18n'
import { generateSlug } from '@/lib/slug'

const ProjectMap = dynamic(() => import('@/components/ProjectMap'), { ssr: false })

/** Video modal with URLASTONE intro */
function VideoModal({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  const [phase, setPhase] = useState<'intro' | 'fade' | 'playing'>('intro')
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const video = videoRef.current
    let t1: NodeJS.Timeout, t2: NodeJS.Timeout

    // Intro animasyonu bitince video'yu başlat — ama video hazır değilse bekle
    const startVideo = () => {
      setPhase('playing')
      video?.play().catch(() => {})
      // Arka plan müziği başlat
      if (audioRef.current) {
        audioRef.current.volume = 0.3
        audioRef.current.play().catch(() => {})
      }
    }

    t1 = setTimeout(() => setPhase('fade'), 1500)
    t2 = setTimeout(() => {
      // Video yüklendiyse hemen başlat, yoksa canplay event'i bekle
      if (video && video.readyState >= 3) {
        startVideo()
      } else {
        video?.addEventListener('canplay', startVideo, { once: true })
      }
    }, 2000)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      video?.removeEventListener('canplay', startVideo)
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors z-10">
          <X size={28} />
        </button>
        <p className="absolute -top-12 left-0 text-white/80 text-sm font-heading font-semibold">{name}</p>
        <div className="rounded-2xl overflow-hidden bg-black border border-white/[0.08] shadow-2xl relative" style={{ minHeight: '40vh' }}>
          {/* Intro overlay */}
          {phase !== 'playing' && (
            <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center bg-black gap-4 transition-opacity duration-500 ${phase === 'fade' ? 'opacity-0' : 'opacity-100'}`}>
              <div className="flex items-center gap-3 animate-[fadeInScale_1.2s_ease-out_forwards]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/ur2-dark.png" alt="" className="w-10 h-10 md:w-12 md:h-12 object-contain rounded-lg" />
                <span className="font-heading text-xl md:text-2xl font-bold tracking-wider">
                  <span className="text-gold-400">URLA</span><span className="text-white">STONE</span>
                </span>
              </div>
              <style>{`
                @keyframes fadeInScale {
                  0% { opacity: 0; transform: scale(0.8); }
                  60% { opacity: 1; transform: scale(1.02); }
                  100% { opacity: 1; transform: scale(1); }
                }
              `}</style>
            </div>
          )}
          <video ref={videoRef} src={url} controls playsInline loop preload="auto" className="w-full" style={{ maxHeight: '80vh' }} />
          {/* Arka plan müziği */}
          <audio ref={audioRef} src="/audio/project-ambient.mp3" loop preload="auto" />
          {/* Sağ üst URLASTONE logosu — video oynarken */}
          {phase === 'playing' && (
            <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-lg px-2.5 py-1.5 pointer-events-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ur2-dark.png" alt="" className="w-5 h-5 object-contain" />
              <span className="font-heading text-[11px] font-bold tracking-wider">
                <span className="text-gold-400">URLA</span><span className="text-white/80">STONE</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatDate(dateStr: string, locale: string) {
  try {
    const d = new Date(dateStr)
    const locMap: Record<string, string> = { tr: 'tr-TR', de: 'de-DE', es: 'es-ES', fr: 'fr-FR', ru: 'ru-RU', ar: 'ar-SA' }
    const loc = locMap[locale] || 'en-US'
    return d.toLocaleDateString(loc, { year: 'numeric', month: 'long' })
  } catch {
    return dateStr
  }
}

function getTranslated(project: Project, field: 'project_name' | 'description', locale: Locale): string {
  if (locale === 'tr') return (project[field] as string) || ''
  const t = project.translations
  if (t && t[locale as keyof typeof t]) {
    const val = t[locale as keyof typeof t]?.[field]
    if (val) return val
  }
  return (project[field] as string) || ''
}

export default function UygulamalarimPage() {
  const router = useRouter()
  const { t, locale } = useLanguage()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [showCount, setShowCount] = useState(12)
  const [videoModal, setVideoModal] = useState<{ urls: string[]; name: string } | null>(null)

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
    project_name: getTranslated(p, 'project_name', locale),
    address: p.address,
    description: getTranslated(p, 'description', locale),
    category: p.category,
    photos: p.photos || [],
  }))

  // Şehir sayısını doğru hesapla - "Çeşme, İzmir" ve "İzmir" aynı şehir olmalı
  // Şehir alanındaki son parçayı (il adını) al: "Çeşme, İzmir" → "İzmir", "İzmir" → "İzmir"
  const normalizeCity = (city: string) => {
    if (!city) return ''
    // Split by comma or slash, take the last part (main city)
    const parts = city.split(/[,\/]/).map(s => s.trim().toLowerCase())
    return parts[parts.length - 1] || parts[0] || ''
  }
  const uniqueCities = new Set(projects.map((p) => normalizeCity(p.city))).size
  const uniqueCountries = new Set(projects.map((p) => (p.country || 'Türkiye').trim().toLowerCase())).size
  const stats = [
    { value: `${projects.length}`, label: t.apps_total_projects, icon: Building2 },
    { value: `${uniqueCities}`, label: t.apps_total_cities, icon: MapPin },
    { value: `${uniqueCountries}`, label: t.apps_total_countries, icon: Globe },
  ]

  // Get unique categories from projects
  const categories = Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))
  const filteredProjects = activeCategory === 'all' ? projects : projects.filter((p) => p.category === activeCategory)

  // City list for SEO dropdown — extract unique main cities
  const cityList = Array.from(
    new Map(
      projects
        .filter((p) => p.city)
        .map((p) => {
          // Get last part as main city: "Cesme, Izmir" -> "Izmir"
          const parts = p.city.split(/[,\/]/).map(s => s.trim())
          const mainCity = parts[parts.length - 1] || parts[0]
          return [generateSlug(mainCity), mainCity] as [string, string]
        })
    ).entries()
  ).map(([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name, 'tr'))

  // Harita ile senkronize — filtre haritayı da etkiler
  const filteredLocations = filteredProjects.map((p) => ({
    id: p.id,
    city: p.city,
    lat: p.lat,
    lng: p.lng,
    project_name: getTranslated(p, 'project_name', locale),
    address: p.address,
    description: getTranslated(p, 'description', locale),
    category: p.category,
    photos: p.photos || [],
  }))

  return (
    <main className="bg-[#0a0a0a] text-white min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-40 pb-16 md:pb-24 px-6 md:px-12 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-[65%_15%] md:bg-center"
          style={{ backgroundImage: 'url(/apps-hero.jpg)' }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="max-w-7xl mx-auto relative">
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
      <section className="px-6 md:px-12 pt-12 md:pt-16 pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card overflow-hidden">
            <div className="p-6 md:p-8 border-b border-white/[0.06]">
              <h2 className="font-heading text-xl md:text-2xl font-bold">{t.apps_map_title}</h2>
              <p className="text-white/40 text-sm mt-1">{t.apps_map_desc}</p>
            </div>
            <div className="h-[500px] md:h-[600px]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={32} className="animate-spin text-white/20" />
                </div>
              ) : (
                <ProjectMap
                  locations={filteredLocations}
                  labels={{ details: t.apps_details, navigate: t.apps_navigate, focus: t.apps_focus_densest }}
                />
              )}
            </div>
          </div>
          {/* Harita ipucu yazısı */}
          <div className="text-center py-3">
            <span className="text-[11px] text-white/30 font-body">
              📍 {t.apps_map_hint}
            </span>
          </div>
        </div>
      </section>

      {/* Project Gallery */}
      {projects.length > 0 ? (
        <section className="px-6 md:px-12 pb-24 md:pb-32">
          <div className="max-w-7xl mx-auto">
            {/* Section Header + Category Filter */}
            <div className="mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <div>
                  <h2 className="font-heading text-xl md:text-2xl font-bold">{t.apps_gallery_title}</h2>
                  <p className="text-white/40 text-sm mt-1">
                    {filteredProjects.length} {t.apps_showing_count}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-white/30">
                  <Filter size={14} />
                  <span className="text-xs font-mono uppercase tracking-wider">{activeCategory === 'all' ? t.apps_filter_all : activeCategory}</span>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => { setActiveCategory('all'); setShowCount(12) }}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-mono transition-all ${
                    activeCategory === 'all'
                      ? 'bg-gold-400/20 text-gold-400 border border-gold-400/30'
                      : 'bg-white/[0.04] text-white/50 border border-white/[0.08] hover:bg-white/[0.08]'
                  }`}
                >
                  {t.apps_filter_all} ({projects.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setShowCount(12) }}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-mono transition-all ${
                      activeCategory === cat
                        ? 'bg-gold-400/20 text-gold-400 border border-gold-400/30'
                        : 'bg-white/[0.04] text-white/50 border border-white/[0.08] hover:bg-white/[0.08]'
                    }`}
                  >
                    {cat} ({projects.filter((p) => p.category === cat).length})
                  </button>
                ))}
              </div>

              {/* City SEO Dropdown */}
              {cityList.length > 0 && (
                <div className="flex items-center gap-3 mt-4">
                  <MapPin size={14} className="text-gold-400 flex-shrink-0" />
                  <span className="text-white/40 text-xs font-mono whitespace-nowrap">{t.apps_city_select}</span>
                  <div className="relative">
                    <select
                      onChange={(e) => {
                        if (e.target.value) router.push(`/projelerimiz/${e.target.value}-dogal-tas`)
                      }}
                      defaultValue=""
                      className="appearance-none bg-white/[0.04] border border-white/[0.08] rounded-full pl-4 pr-9 py-2 text-xs font-mono text-white/70 cursor-pointer hover:bg-white/[0.08] transition-colors focus:outline-none focus:border-gold-400/30"
                    >
                      <option value="" disabled className="bg-[#0a0a0a]">--</option>
                      {cityList.map((c) => (
                        <option key={c.slug} value={c.slug} className="bg-[#0a0a0a]">{c.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.slice(0, showCount).map((project) => (
                <div key={project.id} className="glass-card-hover overflow-hidden group">
                  {/* Photo */}
                  <div className="aspect-[16/10] overflow-hidden relative">
                    {project.photos?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={project.photos[0]}
                        alt={getTranslated(project, 'project_name', locale)}
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
                      {getTranslated(project, 'project_name', locale)}
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
                          {formatDate(project.project_date, locale)}
                        </span>
                      )}
                    </div>
                    {getTranslated(project, 'description', locale) && (
                      <p className="text-white/40 text-sm leading-relaxed line-clamp-2 mb-4">
                        {getTranslated(project, 'description', locale)}
                      </p>
                    )}
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/projelerimiz/${generateSlug(project.project_name)}`}
                        className="inline-flex items-center gap-2 text-white text-xs font-mono bg-white/[0.06] hover:bg-white/[0.12] px-3 py-1.5 rounded-full transition-colors"
                      >
                        {t.apps_details}
                        <ArrowRight size={10} />
                      </Link>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${project.lat},${project.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-gold-400 text-xs font-mono hover:text-gold-300 transition-colors"
                      >
                        <MapPin size={12} />
                        {t.apps_navigate}
                      </a>
                      {project.video_urls?.length ? (
                        <button
                          onClick={() => setVideoModal({ urls: project.video_urls!, name: getTranslated(project, 'project_name', locale) })}
                          className="group relative inline-flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full transition-all overflow-hidden
                            bg-gradient-to-r from-[#b39345] to-[#d2b96e] text-black font-semibold
                            hover:from-[#c9a84f] hover:to-[#e0c97a] hover:shadow-[0_0_20px_rgba(179,147,69,0.3)]"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                          <Play size={11} className="fill-current" />
                          {t.apps_video}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Daha Fazla Göster butonu */}
            {filteredProjects.length > showCount && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setShowCount(prev => prev + 12)}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white/70 text-sm font-mono transition-all"
                >
                  {t.apps_load_more || 'Daha Fazla Göster'} ({filteredProjects.length - showCount})
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
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
              <Link href="/teklif" className="btn-primary text-sm">
                {t.common_teklif_al}
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Video Modal with Intro */}
      {videoModal && (
        <VideoModal
          url={videoModal.urls[0]}
          name={videoModal.name}
          onClose={() => setVideoModal(null)}
        />
      )}

      <Footer />
    </main>
  )
}
