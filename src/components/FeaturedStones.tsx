'use client'

import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

// Müşterinin sitesindeki galeri resimleri + Unsplash'tan taş texture'ları
const stones = [
  {
    id: 'traverten',
    name: 'Traverten',
    description: 'Sıcak tonları ve doğal damar desenleri ile klasik elegansın simgesi.',
    image: 'https://urlastone.com/gallery_gen/8ccbd6ae39b954bc229c6a14843279da_710.78055555556x474_fill.jpg',
    origin: 'Denizli',
  },
  {
    id: 'mermer',
    name: 'Mermer',
    description: 'Zamansız güzelliği ve benzersiz damar yapısı ile lüksün tanımı.',
    image: 'https://urlastone.com/gallery_gen/eeddd2b45b0ecf935a10c0f45b881921_710.28971028971x474_fill.jpeg',
    origin: 'Afyon',
  },
  {
    id: 'bazalt',
    name: 'Bazalt',
    description: 'Sert yapısı ve koyu tonu ile modern mimarinin vazgeçilmezi.',
    image: 'https://urlastone.com/gallery_gen/012ae6766e4edfc6f176c5fb07bfc105_631.98165137615x534_fill.jpeg',
    origin: 'Diyarbakır',
  },
  {
    id: 'granit',
    name: 'Granit',
    description: 'Dayanıklılığı ve çeşitli desenleri ile her mekana uyum sağlar.',
    image: 'https://urlastone.com/gallery_gen/300d46424fd1b779b67c1c81b00fb994_710.7969151671x474_fill.jpeg',
    origin: 'Aksaray',
  },
  {
    id: 'limestone',
    name: 'Limestone',
    description: 'Yumuşak dokusu ve doğal renkleri ile huzur veren atmosferler yaratır.',
    image: 'https://urlastone.com/gallery_gen/20b79f4a146989f0a21c302df0ceb9dd_711x474_fill.jpg',
    origin: 'Burdur',
  },
  {
    id: 'oniks',
    name: 'Oniks',
    description: 'Yarı saydam yapısı ile ışıkla buluştuğunda büyüleyici bir görsellik sunar.',
    image: 'https://urlastone.com/gallery_gen/24b7f4a577b3cd59a478262a6b25ab20_700x420_fit.png?ts=1753707019',
    origin: 'Erzurum',
  },
]

export default function FeaturedStones() {
  const { t } = useLanguage()
  const [hovered, setHovered] = useState<string | null>(null)

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
            Türkiye&apos;nin en seçkin madenlerinden, her biri benzersiz
            dokuya sahip doğal taşlarımızı keşfedin.
          </p>
        </div>
      </div>

      {/* Stones Grid with real images */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stones.map((stone) => (
          <Link
            key={stone.id}
            href={`/taslar/${stone.id}`}
            className="group relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer"
            onMouseEnter={() => setHovered(stone.id)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Real image background */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url(${stone.image})` }}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

            {/* Content */}
            <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
              {/* Top */}
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] text-white/50 tracking-wider uppercase bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  {stone.origin}
                </span>
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500">
                  <ArrowUpRight size={16} className="text-white group-hover:text-black transition-colors" />
                </div>
              </div>

              {/* Bottom */}
              <div>
                <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">
                  {stone.name}
                </h3>
                <p className={`text-white/60 text-sm leading-relaxed transition-all duration-500 ${
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
