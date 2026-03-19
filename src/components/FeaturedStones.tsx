'use client'

import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

export default function FeaturedStones() {
  const { t } = useLanguage()
  const [hovered, setHovered] = useState<string | null>(null)

  const stones = [
    {
      id: 'traverten',
      name: t.featured_traverten_name,
      description: t.featured_traverten_desc,
      origin: t.featured_traverten_origin,
      image: '/featured-traverten.jpg',
      bgSize: 'cover',
      bgPos: 'center',
    },
    {
      id: 'mermer',
      name: t.featured_mermer_name,
      description: t.featured_mermer_desc,
      origin: t.featured_mermer_origin,
      image: '/featured-mermer.jpg',
      bgSize: '140%',
      bgPos: 'center 60%',
    },
    {
      id: 'bazalt',
      name: t.featured_bazalt_name,
      description: t.featured_bazalt_desc,
      origin: t.featured_bazalt_origin,
      image: '/featured-bazalt.jpg',
      bgSize: 'cover',
      bgPos: 'center',
    },
    {
      id: 'kalker',
      name: t.featured_kalker_name,
      description: t.featured_kalker_desc,
      origin: t.featured_kalker_origin,
      image: '/featured-kalker.jpg',
      bgSize: 'cover',
      bgPos: 'center',
    },
  ]

  return (
    <section className="section-padding" id="taslar">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto mb-16 md:mb-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] text-white/40 tracking-wider uppercase mb-4">
              {t.featured_tag}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              {t.featured_title}
            </h2>
          </div>
          <p className="text-white/40 text-sm max-w-md font-mono leading-relaxed">
            {t.featured_subtitle}
          </p>
        </div>
      </div>

      {/* Stones Grid - 2x2 layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
        {stones.map((stone) => (
          <Link
            key={stone.id}
            href={`/taslar#${stone.id}`}
            className="group relative overflow-hidden rounded-2xl aspect-[4/3] cursor-pointer"
            onMouseEnter={() => setHovered(stone.id)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Image background */}
            <div
              className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
              style={{
                backgroundImage: `url(${stone.image})`,
                backgroundSize: stone.bgSize || 'cover',
                backgroundPosition: stone.bgPos || 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 group-hover:from-black/95 group-hover:via-black/50 transition-all duration-500" />

            {/* Content */}
            <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
              {/* Top */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-white/50 tracking-wider uppercase bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    {stone.origin}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500">
                  <ArrowUpRight size={16} className="text-white group-hover:text-black transition-colors" />
                </div>
              </div>

              {/* Bottom */}
              <div>
                <h3 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2">
                  {stone.name}
                </h3>
                <p className={`text-white/60 text-sm leading-relaxed transition-all duration-500 max-w-md ${
                  hovered === stone.id ? 'opacity-100 translate-y-0' : 'sm:opacity-0 sm:translate-y-4 opacity-100'
                }`}>
                  {stone.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* View All */}
      <div className="max-w-7xl mx-auto mt-12 text-center">
        <Link href="/taslar" className="btn-outline">
          {t.featured_btn}
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </section>
  )
}
