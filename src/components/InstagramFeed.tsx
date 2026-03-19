'use client'

import { useEffect } from 'react'
import { Instagram, ExternalLink } from 'lucide-react'

export default function InstagramFeed() {
  useEffect(() => {
    // ElfSight platform script'ini dinamik olarak yükle
    if (typeof window !== 'undefined') {
      const existingScript = document.querySelector('script[src="https://elfsightcdn.com/platform.js"]')
      if (!existingScript) {
        const script = document.createElement('script')
        script.src = 'https://elfsightcdn.com/platform.js'
        script.async = true
        document.body.appendChild(script)
      }
    }
  }, [])

  return (
    <section className="section-padding border-t border-white/[0.06]">
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
              Instagram&apos;dan
              <br />
              <span className="italic text-gradient-gold">canlı</span>
            </h2>
            <p className="text-white/30 text-sm font-mono mt-4 max-w-md">
              Projelerimizi, üretim süreçlerimizi ve yeni taşlarımızı
              Instagram hesabımızdan takip edin.
            </p>
          </div>
          <a
            href="https://www.instagram.com/urladogaltaspazari/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-[13px]"
          >
            Profili Görüntüle
            <ExternalLink size={14} />
          </a>
        </div>

        {/* ElfSight Instagram Feed Widget */}
        <div className="elfsight-app-5b69cc52-8d39-4e4d-aec9-8b290e0dfe72" data-elfsight-app-lazy />
      </div>
    </section>
  )
}
