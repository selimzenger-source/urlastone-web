'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  ArrowRight,
  Layers,
  Shield,
  Ruler,
  Palette,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

export default function TaslarPage() {
  const { t } = useLanguage()
  const [activeModel, setActiveModel] = useState('nature')

  const rockshellModels = [
    {
      id: 'nature',
      ad: 'Nature',
      slogan: t.stones_nature_slogan,
      aciklama: t.stones_nature_desc,
      ozellikler: [t.stones_nature_f1, t.stones_nature_f2, t.stones_nature_f3],
      kalinlik: '1.5 – 3 cm',
      renk: '/rockshell-nature.jpg',
    },
    {
      id: 'mix',
      ad: 'Mix',
      slogan: t.stones_mix_slogan,
      aciklama: t.stones_mix_desc,
      ozellikler: [t.stones_mix_f1, t.stones_mix_f2, t.stones_mix_f3],
      kalinlik: '1.5 – 3 cm',
      renk: '/rockshell-mix.jpg',
    },
    {
      id: 'geo',
      ad: 'Geo',
      slogan: t.stones_geo_slogan,
      aciklama: t.stones_geo_desc,
      ozellikler: [t.stones_geo_f1, t.stones_geo_f2, t.stones_geo_f3],
      kalinlik: '1.5 – 2.5 cm',
      renk: '/rockshell-geo.jpg',
    },
    {
      id: 'line',
      ad: 'Line',
      slogan: t.stones_line_slogan,
      aciklama: t.stones_line_desc,
      ozellikler: [t.stones_line_f1, t.stones_line_f2, t.stones_line_f3],
      kalinlik: '1 – 2 cm',
      renk: '/rockshell-line.jpg',
    },
  ]

  const tasSerileri = [
    {
      ad: t.stones_traverten_name,
      kategori: t.stones_traverten_category,
      renk: t.stones_traverten_color,
      foto: '/tas-traverten.jpg',
      aciklama: t.stones_traverten_desc,
      kullanim: [t.stones_usage_cephe, t.stones_usage_havuz, t.stones_usage_zemin, t.stones_usage_ic_mekan],
    },
    {
      ad: t.stones_mermer_name,
      kategori: t.stones_mermer_category,
      renk: t.stones_mermer_color,
      foto: '/tas-mermer.jpg',
      aciklama: t.stones_mermer_desc,
      kullanim: [t.stones_usage_ic_mekan, t.stones_usage_tezgah, t.stones_usage_banyo, t.stones_usage_merdiven],
    },
    {
      ad: t.stones_bazalt_name,
      kategori: t.stones_bazalt_category,
      renk: t.stones_bazalt_color,
      foto: '/tas-bazalt.jpg',
      aciklama: t.stones_bazalt_desc,
      kullanim: [t.stones_usage_cephe, t.stones_usage_bahce, t.stones_usage_yuruyus],
    },
    {
      ad: t.stones_granit_name,
      kategori: t.stones_granit_category,
      renk: t.stones_granit_color,
      foto: '/tas-granit.jpg',
      aciklama: t.stones_granit_desc,
      kullanim: [t.stones_usage_zemin, t.stones_usage_tezgah, t.stones_usage_merdiven, t.stones_usage_dis_cephe],
    },
    {
      ad: t.stones_kayrak_name,
      kategori: t.stones_kayrak_category,
      renk: t.stones_kayrak_color,
      foto: '/tas-kayrak.jpg',
      aciklama: t.stones_kayrak_desc,
      kullanim: [t.stones_usage_bahce, t.stones_usage_duvar, t.stones_usage_zemin],
    },
    {
      ad: t.stones_kuvarsit_name,
      kategori: t.stones_kuvarsit_category,
      renk: t.stones_kuvarsit_color,
      foto: '/tas-kuvarsit.jpg',
      aciklama: t.stones_kuvarsit_desc,
      kullanim: [t.stones_usage_ic_mekan, t.stones_usage_duvar, t.stones_usage_ozel],
    },
  ]

  const kullanimAlanlari = [
    { baslik: t.stones_usage1_name, icon: Layers },
    { baslik: t.stones_usage2_name, icon: Palette },
    { baslik: t.stones_usage3_name, icon: Ruler },
    { baslik: t.stones_usage4_name, icon: Shield },
  ]

  const aktifModel = rockshellModels.find((m) => m.id === activeModel)!

  return (
    <main className="bg-[#0a0a0a] min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-400/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-gold-400 text-xs font-mono tracking-[0.3em] uppercase mb-4">
              {t.stones_tag}
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              {t.stones_title1}
              <span className="block hero-gold-text">{t.stones_title2}</span>
            </h1>
            <p className="text-white/50 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              {t.stones_desc}
            </p>
          </div>
        </div>
      </section>

      {/* Rockshell Serisi */}
      <section className="py-20 md:py-28 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-gold-400 text-xs font-mono tracking-[0.3em] uppercase mb-4">
              {t.stones_rockshell_tag}
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
              {t.stones_rockshell_title}
            </h2>
          </div>

          {/* Model Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {rockshellModels.map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveModel(m.id)}
                className={`px-6 py-3 rounded-full text-sm font-mono transition-all duration-300 ${
                  activeModel === m.id
                    ? 'bg-white text-black'
                    : 'bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
                }`}
              >
                {m.ad}
              </button>
            ))}
          </div>

          {/* Active Model Detail */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Sol - Görsel */}
            <div className="aspect-square rounded-3xl bg-white/[0.04] border border-white/[0.06] overflow-hidden flex items-center justify-center relative">
              <div className="text-center">
                <p className="text-gold-400 font-heading text-6xl sm:text-8xl font-bold opacity-20">
                  {aktifModel.ad}
                </p>
                <p className="text-white/20 text-xs font-mono mt-2">
                  {t.stones_image_placeholder}
                </p>
              </div>
            </div>

            {/* Sağ - Detay */}
            <div>
              <p className="text-gold-400 text-xs font-mono tracking-[0.2em] uppercase mb-2">
                Rockshell
              </p>
              <h3 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-2">
                {aktifModel.ad}
              </h3>
              <p className="text-white/60 text-lg italic mb-6">{aktifModel.slogan}</p>
              <p className="text-white/50 text-sm sm:text-base leading-relaxed mb-8">
                {aktifModel.aciklama}
              </p>

              {/* Özellikler */}
              <div className="space-y-3 mb-8">
                {aktifModel.ozellikler.map((oz) => (
                  <div key={oz} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                    <span className="text-white/60 text-sm">{oz}</span>
                  </div>
                ))}
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <p className="text-white/30 text-[10px] font-mono uppercase">{t.stones_thickness}</p>
                  <p className="text-white font-medium text-sm mt-1">{aktifModel.kalinlik}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <p className="text-white/30 text-[10px] font-mono uppercase">{t.stones_technology}</p>
                  <p className="text-white font-medium text-sm mt-1">Rockshell</p>
                </div>
              </div>

              <Link
                href="/iletisim"
                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-stone-200 transition-colors"
              >
                {t.stones_teklif_btn} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Taş Serileri */}
      <section className="py-20 md:py-28 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-gold-400 text-xs font-mono tracking-[0.3em] uppercase mb-4">
              {t.stones_collection_tag}
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
              {t.stones_collection_title}
            </h2>
            <p className="text-white/40 text-sm max-w-xl mx-auto">
              {t.stones_collection_desc}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasSerileri.map((tas) => (
              <div
                key={tas.ad}
                className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-gold-400/20 transition-all duration-300"
              >
                {/* Image */}
                <div className="aspect-[16/10] bg-white/[0.04] relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tas.foto}
                    alt={tas.ad}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-white">{tas.ad}</h3>
                      <p className="text-white/30 text-xs font-mono">{tas.kategori} · {tas.renk}</p>
                    </div>
                  </div>

                  <p className="text-white/40 text-sm leading-relaxed mb-4">
                    {tas.aciklama}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {tas.kullanim.map((k) => (
                      <span
                        key={k}
                        className="px-2.5 py-1 rounded-full bg-gold-400/10 text-gold-400 text-[10px] font-mono"
                      >
                        {k}
                      </span>
                    ))}
                  </div>

                  <Link
                    href="/iletisim"
                    className="flex items-center gap-1 text-white/40 text-xs font-mono hover:text-gold-400 transition-colors"
                  >
                    {t.common_teklif_al} <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kullanım Alanları */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-gold-400 text-xs font-mono tracking-[0.3em] uppercase mb-4">
              {t.stones_tag}
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
              {t.stones_usage_title}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kullanimAlanlari.map((alan) => {
              const Icon = alan.icon
              return (
                <div
                  key={alan.baslik}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 text-center hover:border-gold-400/20 transition-all duration-300 group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gold-400/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-gold-400/20 transition-colors">
                    <Icon size={28} className="text-gold-400" />
                  </div>
                  <h3 className="font-heading text-base font-semibold text-white">
                    {alan.baslik}
                  </h3>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-24 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
            {t.stones_cta_title}
          </h2>
          <p className="text-white/40 text-sm sm:text-base mb-8 max-w-xl mx-auto">
            {t.stones_cta_desc}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/iletisim"
              className="inline-flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-full text-sm font-medium hover:bg-stone-200 transition-colors"
            >
              {t.common_teklif_al} <ArrowRight size={16} />
            </Link>
            <a
              href="https://wa.me/905532322144"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-white/[0.12] text-white/70 px-8 py-3.5 rounded-full text-sm hover:bg-white/[0.04] transition-colors"
            >
              {t.common_whatsapp}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
