'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Building2, ArrowRight, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { generateSlug } from '@/lib/slug'
import PageTracker from '@/components/PageTracker'
// PageTracker auto-detects pathname

interface Referans {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  project_id: string | null
  project?: { id: string; project_name: string } | null
}

export default function ReferanslarimizPage() {
  const { t } = useLanguage()
  const [referanslar, setReferanslar] = useState<Referans[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/referanslar')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setReferanslar(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageTracker />
      <Navbar />
      <main className="min-h-screen bg-[#0a0a0a] pt-32 pb-20">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 mb-16">
          <p className="font-mono text-[11px] text-gold-400/60 tracking-[0.2em] uppercase mb-4">
            {t.refs_tag}
          </p>
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-white mb-4">
            {t.refs_title}{' '}
            <span className="text-gradient-gold">{t.refs_gold}</span>
          </h1>
          <p className="text-white/40 text-sm md:text-base max-w-2xl leading-relaxed font-body">
            {t.refs_desc}
          </p>
        </section>

        {/* Referans Grid */}
        <section className="max-w-7xl mx-auto px-6 md:px-12">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin mx-auto" />
            </div>
          ) : referanslar.length === 0 ? (
            <div className="text-center py-20">
              <Building2 size={40} className="mx-auto text-white/10 mb-4" />
              <p className="text-white/30 font-mono text-sm">{t.refs_no_refs}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {referanslar.map((ref) => (
                <div
                  key={ref.id}
                  className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-gold-400/20 hover:bg-white/[0.05] transition-all duration-300"
                >
                  {/* Logo */}
                  <div className="w-20 h-20 mx-auto flex items-center justify-center mb-5 rounded-xl bg-white/[0.03] border border-white/[0.04] overflow-hidden">
                    {ref.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ref.logo_url}
                        alt={ref.name}
                        className="w-full h-full object-contain p-2 opacity-70 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <Building2 size={32} className="text-white/10" />
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="font-heading text-lg font-bold text-white mb-2 group-hover:text-gold-400 transition-colors">
                    {ref.name}
                  </h3>

                  {/* Description */}
                  {ref.description && (
                    <p className="text-white/40 text-sm leading-relaxed mb-4 line-clamp-3 font-body">
                      {ref.description}
                    </p>
                  )}

                  {/* Project link */}
                  {ref.project && ref.project_id && (
                    <Link
                      href={`/projelerimiz/${generateSlug(ref.project!.project_name)}`}
                      className="inline-flex items-center gap-2 text-gold-400/70 hover:text-gold-400 text-xs font-mono tracking-wide transition-colors"
                    >
                      <ExternalLink size={12} />
                      {t.refs_project}
                      <ArrowRight size={12} />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 mt-20">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 md:p-12 text-center">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4">
              {t.cta_teklif_title}
            </h2>
            <Link
              href="/teklif"
              className="btn-primary inline-flex items-center gap-2 mt-4"
            >
              {t.common_teklif_al}
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
