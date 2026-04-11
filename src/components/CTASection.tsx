'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, MessageCircle, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { cdnImg } from '@/lib/cdn'

const FALLBACK_PHOTOS = ['/slide-1.jpg', '/slide-3.jpg', '/slide-6.jpg']

export default function CTASection() {
  const { t } = useLanguage()
  const [photos, setPhotos] = useState<string[]>(FALLBACK_PHOTOS)
  const [current, setCurrent] = useState(0)

  // Projelerden 3 rastgele fotoğraf çek
  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then((data: Array<{ photos?: string[] }>) => {
        if (!Array.isArray(data)) return
        const all = data.flatMap(p => (p.photos || []).slice(0, 1)).filter(Boolean)
        const picked = all.sort(() => Math.random() - 0.5).slice(0, 3)
        if (picked.length >= 2) setPhotos(picked)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (photos.length < 2) return
    const timer = setInterval(() => setCurrent(p => (p + 1) % photos.length), 6000)
    return () => clearInterval(timer)
  }, [photos])

  return (
    <section className="relative py-24 md:py-32 px-6 md:px-12 overflow-hidden border-t border-white/[0.06]">
      {/* Background accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-400/[0.04] rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-mono text-[11px] text-white/40 tracking-wider uppercase mb-4">
            {t.cta_teklif_title}
          </p>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {t.cta_title}
          </h2>
          <p className="text-white/40 text-sm md:text-base max-w-xl mx-auto font-mono">
            {t.cta_kesif} &mdash; {t.cta_fiyat}
          </p>
        </div>

        {/* Two Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Projelerimizi Keşfedin */}
          <Link href="/projelerimiz" className="group">
            <div className="relative overflow-hidden rounded-2xl h-full min-h-[380px] border border-gold-400/10 hover:border-gold-400/20 transition-all duration-500">
              {/* Background slideshow — 3 statik görsel, hafif */}
              <div className="absolute inset-0">
                {photos.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={cdnImg(src)} alt="" loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
                    style={{ opacity: i === current ? 1 : 0 }}
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
              </div>

              <div className="relative z-10 p-8 md:p-10 h-full flex flex-col justify-end">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gold-400/20 backdrop-blur-sm flex items-center justify-center">
                    <MapPin size={18} className="text-gold-400" />
                  </div>
                  <span className="font-mono text-[11px] text-gold-400 tracking-wider uppercase">
                    500+ {t.cta_proje_alt || 'Proje'}
                  </span>
                </div>

                <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3">
                  {t.cta_proje_title || 'Projelerimizi Keşfedin'}
                </h3>

                <p className="text-white/60 text-sm font-mono leading-relaxed mb-8 max-w-md">
                  {t.cta_proje_desc || 'Villa, otel, rezidans projelerimizi harita üzerinde keşfedin'}
                </p>

                <div className="inline-flex items-center gap-3 bg-white text-black px-8 py-3.5 rounded-full font-medium text-sm group-hover:bg-gold-400 transition-colors duration-500 w-fit">
                  {t.cta_proje_btn || 'Projeleri Gör'}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          {/* Card 2: Teklif Al + WhatsApp */}
          <div className="relative overflow-hidden rounded-2xl h-full min-h-[380px] border border-white/[0.08]">
            {/* Background image */}
            <div className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/slide-4.jpg" alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
            </div>

            <div className="relative z-10 p-8 md:p-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <MessageCircle size={18} className="text-gold-400" />
                  </div>
                  <span className="font-mono text-[11px] text-gold-400 tracking-wider uppercase">
                    {t.cta_teklif_title}
                  </span>
                </div>

                <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3">
                  {t.cta_teklif_title}
                </h3>

                <ul className="space-y-3 mb-10">
                  {[
                    t.cta_kesif,
                    t.cta_fiyat,
                    t.cta_danismanlik,
                    t.cta_nakliye,
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold-400/60" />
                      <span className="text-white/70 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/teklif" className="btn-primary text-sm px-8 py-3.5 justify-center">
                  {t.cta_teklif_btn}
                  <ArrowRight size={16} />
                </Link>
                <a
                  href="https://wa.me/905532322144?text=Merhaba%2C%20do%C4%9Fal%20ta%C5%9F%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline text-sm px-8 py-3.5 justify-center"
                >
                  <MessageCircle size={16} />
                  {t.cta_whatsapp}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
