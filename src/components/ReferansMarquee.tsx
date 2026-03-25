'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import Link from 'next/link'
import { generateSlug } from '@/lib/slug'

interface Referans {
  id: string
  name: string
  project_id: string | null
  project?: { id: string; project_name: string } | null
}

export default function ReferansMarquee() {
  const { t } = useLanguage()
  const [referanslar, setReferanslar] = useState<Referans[]>([])

  useEffect(() => {
    fetch('/api/referanslar')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setReferanslar(data)
        }
      })
      .catch(() => {})
  }, [])

  if (referanslar.length === 0) return null

  // Duplicate items enough times to fill the marquee smoothly
  const repeatCount = Math.max(6, Math.ceil(20 / referanslar.length))
  const items = Array.from({ length: repeatCount }, () => referanslar).flat()

  return (
    <section className="border-t border-b border-white/[0.06] py-14 md:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-10">
        <p className="font-mono text-[11px] text-white/40 tracking-wider uppercase mb-3">
          {t.ref_tag}
        </p>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-white">
          {t.ref_title} <span className="text-gradient-gold">{t.ref_gold}</span>
        </h2>
      </div>

      {/* Marquee */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee whitespace-nowrap items-center">
          {items.map((ref, i) => {
            const content = (
              <>
                <span className="w-2 h-2 rounded-full bg-gold-400/40 mr-4 group-hover:bg-gold-400 transition-colors duration-300" />
                <span className="font-heading text-lg md:text-xl text-white/40 group-hover:text-white/70 transition-colors duration-300 tracking-wide">
                  {ref.name}
                </span>
              </>
            )

            if (ref.project_id) {
              return (
                <Link
                  key={`${ref.id}-${i}`}
                  href={`/projelerimiz/${ref.project?.project_name ? generateSlug(ref.project.project_name) : ref.project_id}`}
                  className="inline-flex items-center mx-12 cursor-pointer group"
                >
                  {content}
                </Link>
              )
            }

            return (
              <span
                key={`${ref.id}-${i}`}
                className="inline-flex items-center mx-12 cursor-default group"
              >
                {content}
              </span>
            )
          })}
        </div>
      </div>
    </section>
  )
}
