'use client'

import { Suspense } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import TeklifForm from '@/components/TeklifForm'
import UrlastoneLoader from '@/components/UrlastoneLoader'
import { useLanguage } from '@/context/LanguageContext'

export default function TeklifPage() {
  const { t } = useLanguage()

  return (
    <main>
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-16 md:pt-48 md:pb-20 px-6 md:px-12 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-[center_20%]"
          style={{ backgroundImage: 'url(/teklif-hero.jpg)' }}
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="max-w-3xl mx-auto text-center relative">
          <p className="font-mono text-[11px] text-white/40 tracking-wider uppercase mb-4">
            {t.form_free_quote}
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            <span className="text-gradient-gold">{t.cta_teklif_title}</span>
          </h1>
          <p className="text-white/40 text-sm md:text-base max-w-xl mx-auto font-mono">
            {t.form_title} <span className="text-gradient-gold">{t.form_title_gold}</span>
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="px-6 md:px-12 pt-12 md:pt-16 pb-20">
        <div className="max-w-3xl mx-auto">
          <Suspense fallback={<div className="flex justify-center py-12"><UrlastoneLoader size="md" /></div>}>
            <TeklifForm />
          </Suspense>
        </div>
      </section>

      <Footer />
    </main>
  )
}
