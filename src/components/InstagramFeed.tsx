'use client'

import { useEffect, useRef, useState } from 'react'
import { Instagram, ExternalLink } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function InstagramFeed() {
  const { t } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)
  const widgetRef = useRef<HTMLDivElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [showFallback, setShowFallback] = useState(false)

  // 1) IntersectionObserver: kullanıcı yaklaşmadan ElfSight'ı hiç yükleme
  useEffect(() => {
    if (typeof window === 'undefined') return
    const sec = sectionRef.current
    if (!sec) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      // 600px önceden tetikle (kullanıcı yaklaşırken hazırlamaya başla)
      { rootMargin: '600px 0px' }
    )
    observer.observe(sec)
    return () => observer.disconnect()
  }, [])

  // 2) Yaklaşınca ElfSight script'i yükle + 7sn fallback
  useEffect(() => {
    if (!shouldLoad || typeof window === 'undefined') return

    const SCRIPT_SRC = 'https://elfsightcdn.com/platform.js'
    let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
    if (!script) {
      script = document.createElement('script')
      script.src = SCRIPT_SRC
      script.async = true
      document.body.appendChild(script)
    }

    // Fallback: 7 sn sonra hâlâ render etmediyse görsel grid göster
    const fallbackTimer = setTimeout(() => {
      const el = widgetRef.current
      if (!el || el.children.length === 0 || el.offsetHeight < 60) {
        setShowFallback(true)
      }
    }, 7000)

    return () => clearTimeout(fallbackTimer)
  }, [shouldLoad])

  return (
    <section ref={sectionRef} className="section-padding border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 md:mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Instagram className="text-white/40" size={18} />
              <span className="font-mono text-[11px] text-white/40 tracking-wider">
                @urladogaltaspazari
              </span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              {t.insta_title1}
              <br />
              <span className="text-gradient-gold">{t.insta_title2}</span>
            </h2>
            <p className="text-white/30 text-sm font-mono mt-4 max-w-md">
              {t.insta_desc}
            </p>
          </div>
          <a
            href="https://www.instagram.com/urladogaltaspazari/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-[13px]"
          >
            {t.insta_btn}
            <ExternalLink size={14} />
          </a>
        </div>

        {/* ElfSight widget — sadece scroll yaklaşınca render edilir */}
        {shouldLoad && !showFallback && (
          <div
            ref={widgetRef}
            className="elfsight-app-5b69cc52-8d39-4e4d-aec9-8b290e0dfe72 min-h-[120px]"
          />
        )}

        {/* Fallback: ElfSight render edemezse görsel grid */}
        {showFallback && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {['/slide-3.jpg', '/slide-5.jpg', '/slide-7.jpg', '/slide-2.jpg'].map((src, i) => (
              <a
                key={i}
                href="https://www.instagram.com/urladogaltaspazari/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square rounded-xl overflow-hidden border border-white/[0.06] hover:border-gold-400/40 transition-colors"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${src})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <Instagram size={28} className="text-white" />
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Placeholder (shouldLoad olana kadar) — yer tutucu, layout shift önler */}
        {!shouldLoad && (
          <div className="min-h-[300px] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-gold-400/60 animate-spin" />
          </div>
        )}
      </div>
    </section>
  )
}
