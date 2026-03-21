'use client'

import { useState, useEffect } from 'react'
import { Award, Building2, Globe, Gem } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import Link from 'next/link'

export default function MiniStats() {
  const { t } = useLanguage()
  const [projectCount, setProjectCount] = useState(0)
  const [productCount, setProductCount] = useState(0)

  const yearsExperience = new Date().getFullYear() - 2000

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProjectCount(data.length)
      })
      .catch(() => {})

    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProductCount(data.length)
      })
      .catch(() => {})
  }, [])

  const stats = [
    { value: `${yearsExperience}+`, label: t.about_stat1, icon: Award, href: '/hakkimizda' },
    { value: projectCount > 0 ? `${projectCount}+` : '...', label: t.about_stat2, icon: Building2, href: '/uygulamalarimiz' },
    { value: '15+', label: t.about_stat3, icon: Globe, href: '/referanslarimiz' },
    { value: productCount > 0 ? `${productCount}+` : '...', label: t.about_stat4, icon: Gem, href: '/taslar' },
  ]

  return (
    <section className="py-10 md:py-14 border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Link key={stat.label} href={stat.href} className="text-center group cursor-pointer">
                <Icon size={16} className="mx-auto mb-2 text-gold-400/70 group-hover:text-gold-400 transition-colors" strokeWidth={1.5} />
                <p className="font-heading text-2xl md:text-3xl font-bold text-gold-400 group-hover:scale-105 transition-transform">
                  {stat.value}
                </p>
                <p className="text-white/30 text-[10px] md:text-xs font-mono mt-1 tracking-wide group-hover:text-white/50 transition-colors">
                  {stat.label}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
