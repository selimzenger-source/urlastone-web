'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { MapPin, ArrowLeft, ArrowRight, Building2, Calendar, Hammer, Layers, ChevronLeft, ChevronRight, X, ZoomIn, Play } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import type { Project } from '@/types/project'
import type { Locale } from '@/lib/i18n'


function getTranslated(project: Project, field: 'project_name' | 'description', locale: Locale): string {
  if (locale === 'tr') return (project[field] as string) || ''
  const t = project.translations
  if (t && t[locale as keyof typeof t]) {
    const val = t[locale as keyof typeof t]?.[field]
    if (val) return val
  }
  return (project[field] as string) || ''
}

export default function ProjectDetailPage() {
  const params = useParams()
  const { t, locale } = useLanguage()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPhoto, setCurrentPhoto] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  useEffect(() => {
    if (!params.id) return
    fetch(`/api/projects/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) setProject(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <main className="bg-[#0a0a0a] text-white min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin" />
        </div>
        <Footer />
      </main>
    )
  }

  if (!project) {
    return (
      <main className="bg-[#0a0a0a] text-white min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Building2 size={48} className="text-white/10" />
          <p className="text-white/30">{t.apps_not_found}</p>
          <Link href="/projelerimiz" className="text-gold-400 text-sm font-mono hover:text-gold-300 transition-colors flex items-center gap-2">
            <ArrowLeft size={14} />
            {t.apps_back_all}
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  const photos = project.photos || []
  const prevPhoto = () => setCurrentPhoto((c) => (c - 1 + photos.length) % photos.length)
  const nextPhoto = () => setCurrentPhoto((c) => (c + 1) % photos.length)

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      const locMap: Record<string, string> = { tr: 'tr-TR', de: 'de-DE', es: 'es-ES', fr: 'fr-FR', ru: 'ru-RU', ar: 'ar-SA' }
      const loc = locMap[locale] || 'en-US'
      return d.toLocaleDateString(loc, { year: 'numeric', month: 'long', day: 'numeric' })
    } catch {
      return dateStr
    }
  }

  const projectName = getTranslated(project, 'project_name', locale)
  const projectDesc = getTranslated(project, 'description', locale)

  return (
    <main className="bg-[#0a0a0a] text-white min-h-screen">
      <Navbar />

      <section className="pt-28 md:pt-36 pb-16 md:pb-24 px-4 md:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Back link */}
          <Link
            href="/projelerimiz"
            className="inline-flex items-center gap-2 text-white/40 text-sm font-mono hover:text-gold-400 transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            {t.apps_all_projects}
          </Link>

          {/* Video Banner */}
          {project.video_urls?.length ? (
            <div className="mb-8 rounded-2xl overflow-hidden border border-gold-400/20 bg-gradient-to-r from-[#b39345]/10 via-transparent to-[#d2b96e]/10">
              <div className="p-4 md:p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#b39345] to-[#d2b96e] flex items-center justify-center">
                    <Play size={18} className="text-black fill-current ml-0.5" />
                  </div>
                  <div>
                    <h3 className="text-white font-heading font-semibold text-sm">{t.apps_video}</h3>
                    <p className="text-white/40 text-xs">{t.apps_video_desc}</p>
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden bg-black">
                  <video
                    src={project.video_urls[0]}
                    controls
                    playsInline
                    loop
                    className="w-full"
                    style={{ maxHeight: '50vh' }}
                    poster={photos[0]}
                  />
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Photo Gallery */}
            <div>
              {photos.length > 0 ? (
                <div className="space-y-3">
                  {/* Main Photo - responsive aspect ratio */}
                  <div className="relative rounded-2xl overflow-hidden bg-white/[0.04] cursor-pointer group" onClick={() => setLightbox(true)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photos[currentPhoto]}
                      alt={projectName}
                      className="w-full h-auto max-h-[70vh] object-contain"
                    />
                    {/* Zoom overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <ZoomIn size={32} className="text-white opacity-0 group-hover:opacity-70 transition-opacity" />
                    </div>
                    {photos.length > 1 && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); prevPhoto() }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); nextPhoto() }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                        >
                          <ChevronRight size={20} />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white/70 text-xs font-mono">
                          {currentPhoto + 1} / {photos.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {photos.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {photos.map((photo, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPhoto(i)}
                          className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                            i === currentPhoto ? 'border-gold-400' : 'border-transparent opacity-50 hover:opacity-80'
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-[4/3] rounded-2xl bg-white/[0.04] flex items-center justify-center">
                  <Building2 size={48} className="text-white/10" />
                </div>
              )}
            </div>

            {/* Project Info */}
            <div className="space-y-6">
              {/* Category badge */}
              {project.category && (
                <span className="inline-block px-3 py-1 rounded-full bg-gold-400/10 text-gold-400 text-xs font-mono">
                  {project.category}
                </span>
              )}

              {/* Title */}
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold">
                {projectName}
              </h1>

              {/* Location */}
              <div className="flex items-center gap-2 text-white/50">
                <MapPin size={16} className="text-gold-400" />
                <span className="font-mono text-sm">{project.city}</span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                {project.product && (
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                    <div className="flex items-center gap-2 text-white/30 text-xs font-mono mb-2">
                      <Layers size={12} />
                      {t.apps_product}
                    </div>
                    <p className="text-white text-sm font-medium">{project.product}</p>
                  </div>
                )}
                {project.application_type && (
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                    <div className="flex items-center gap-2 text-white/30 text-xs font-mono mb-2">
                      <Hammer size={12} />
                      {t.apps_app_type}
                    </div>
                    <p className="text-white text-sm font-medium">{project.application_type}</p>
                  </div>
                )}
                {project.contractor && (
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                    <div className="flex items-center gap-2 text-white/30 text-xs font-mono mb-2">
                      <Building2 size={12} />
                      {t.apps_contractor}
                    </div>
                    <p className="text-white text-sm font-medium">{project.contractor}</p>
                  </div>
                )}
                {project.project_date && (
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                    <div className="flex items-center gap-2 text-white/30 text-xs font-mono mb-2">
                      <Calendar size={12} />
                      {t.apps_delivery_date}
                    </div>
                    <p className="text-white text-sm font-medium">{formatDate(project.project_date)}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {projectDesc && (
                <div>
                  <h3 className="text-white/30 text-xs font-mono mb-2">{t.apps_description}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {projectDesc}
                  </p>
                </div>
              )}

              {/* Address & Navigate */}
              {project.address && (
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <p className="text-white/40 text-xs font-mono mb-2">{t.apps_address}</p>
                  <p className="text-white/70 text-sm mb-3">{project.address}</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${project.lat},${project.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-sm font-mono hover:bg-gold-400/20 transition-colors"
                  >
                    {t.apps_navigate}
                    <ArrowRight size={12} />
                  </a>
                </div>
              )}

              {/* Navigate button if no address */}
              {!project.address && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${project.lat},${project.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-sm font-mono hover:bg-gold-400/20 transition-colors"
                >
                  {t.apps_navigate}
                  <ArrowRight size={12} />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Fullscreen Lightbox */}
      {lightbox && photos.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X size={24} />
          </button>

          {/* Navigation */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevPhoto() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextPhoto() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}

          {/* Full image */}
          <div className="max-w-[95vw] max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[currentPhoto]}
              alt={projectName}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>

          {/* Counter */}
          {photos.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-mono">
              {currentPhoto + 1} / {photos.length}
            </div>
          )}
        </div>
      )}
    </main>
  )
}
