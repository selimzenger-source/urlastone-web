'use client'

import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  Award,
  Globe,
  Hammer,
  Users,
  MapPin,
  Building2,
  Gem,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

export default function HakkimizdaPage() {
  const { t } = useLanguage()

  const ekip = [
    {
      ad: 'Fatih At',
      unvan: t.about_team_fatih_title,
      foto: '/ekip-fatih.jpg',
      bio: t.about_team_fatih_bio,
      linkedin: '#',
    },
    {
      ad: 'Özer Demirkırkan',
      unvan: t.about_team_ozer_title,
      foto: '/ekip-ozer.jpg',
      bio: t.about_team_ozer_bio,
      linkedin: '#',
    },
    {
      ad: 'Cihan Zenger',
      unvan: t.about_team_cihan_title,
      foto: '/ekip-cihan.jpg',
      bio: t.about_team_cihan_bio,
      linkedin: '#',
    },
  ]

  const stats = [
    { sayi: '15+', etiket: t.about_stat1, icon: Award },
    { sayi: '500+', etiket: t.about_stat2, icon: Building2 },
    { sayi: '50+', etiket: t.about_stat3, icon: Globe },
    { sayi: '20+', etiket: t.about_stat4, icon: Gem },
  ]

  const degerler = [
    {
      baslik: t.about_val1,
      aciklama: t.about_val1_desc,
      icon: Award,
    },
    {
      baslik: t.about_val2,
      aciklama: t.about_val2_desc,
      icon: Hammer,
    },
    {
      baslik: t.about_val3,
      aciklama: t.about_val3_desc,
      icon: Users,
    },
    {
      baslik: t.about_val4,
      aciklama: t.about_val4_desc,
      icon: Globe,
    },
  ]

  return (
    <main className="bg-[#0a0a0a] min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-400/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-gold-400 text-xs font-mono tracking-[0.3em] uppercase mb-4">
              {t.about_tag}
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              {t.about_title1}
              <span className="block hero-gold-text">{t.about_title2}</span>
            </h1>
            <p className="text-white/50 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              {t.about_desc}
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.etiket} className="text-center">
                  <Icon size={24} className="mx-auto text-gold-400 mb-3" />
                  <p className="font-heading text-3xl sm:text-4xl font-bold text-white mb-1">
                    {s.sayi}
                  </p>
                  <p className="text-white/40 text-xs font-mono">{s.etiket}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Hikayemiz */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Sol - Görsel */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-white/[0.04] border border-white/[0.06]">
                <img
                  src="/hero-1.png"
                  alt="Urla Stone Atölye"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -right-4 sm:right-4 bg-[#111] border border-white/[0.08] rounded-2xl p-5 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gold-400/10 flex items-center justify-center">
                    <MapPin size={20} className="text-gold-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Urla, İzmir</p>
                    <p className="text-white/40 text-xs font-mono">Türkiye</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sağ - Metin */}
            <div>
              <p className="text-gold-400 text-xs font-mono tracking-[0.3em] uppercase mb-4">
                {t.about_story_tag}
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
                {t.about_story_title}
                <span className="text-gold-400"> {t.about_story_gold}</span>
              </h2>
              <div className="space-y-4 text-white/50 text-sm sm:text-base leading-relaxed">
                <p>{t.about_story_p1}</p>
                <p>{t.about_story_p2}</p>
                <p>{t.about_story_p3}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ekibimiz */}
      <section className="py-20 md:py-28 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-gold-400 text-xs font-mono tracking-[0.3em] uppercase mb-4">
              {t.about_team_tag}
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
              {t.about_team_title}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {ekip.map((kisi) => (
              <div
                key={kisi.ad}
                className="group bg-white/[0.03] border border-white/[0.06] rounded-3xl overflow-hidden hover:border-white/[0.12] transition-all duration-300"
              >
                {/* Fotoğraf */}
                <div className="aspect-[3/4] bg-white/[0.06] relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Users size={48} className="text-white/10" />
                  </div>
                  {/* Gerçek fotoğraf eklenince buraya img gelecek */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                </div>

                {/* Bilgi */}
                <div className="p-6 -mt-12 relative">
                  <h3 className="font-heading text-xl font-bold text-white mb-1">
                    {kisi.ad}
                  </h3>
                  <p className="text-gold-400 text-xs font-mono mb-4">
                    {kisi.unvan}
                  </p>
                  <p className="text-white/40 text-sm leading-relaxed">
                    {kisi.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Değerlerimiz */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-gold-400 text-xs font-mono tracking-[0.3em] uppercase mb-4">
              {t.about_values_tag}
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
              {t.about_values_title}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {degerler.map((d) => {
              const Icon = d.icon
              return (
                <div
                  key={d.baslik}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-gold-400/20 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gold-400/10 flex items-center justify-center mb-4">
                    <Icon size={20} className="text-gold-400" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-white mb-2">
                    {d.baslik}
                  </h3>
                  <p className="text-white/40 text-sm leading-relaxed">
                    {d.aciklama}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Lokasyon */}
      <section className="py-20 md:py-28 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gold-400 text-xs font-mono tracking-[0.3em] uppercase mb-4">
                {t.about_loc_tag}
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
                {t.about_loc_title}
                <span className="text-gold-400"> {t.about_loc_gold}</span>
              </h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin size={16} className="text-gold-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{t.about_loc_address_label}</p>
                    <p className="text-white/40 text-sm">{t.about_loc_address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Globe size={16} className="text-gold-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{t.about_loc_export_label}</p>
                    <p className="text-white/40 text-sm">{t.about_loc_export_desc}</p>
                  </div>
                </div>
              </div>
              <Link
                href="/iletisim"
                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-stone-200 transition-colors"
              >
                {t.common_iletisim} <ArrowRight size={16} />
              </Link>
            </div>

            {/* Harita */}
            <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-white/[0.06]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3131.5!2d26.734641!3d38.3248805!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14bb932e921f61b1%3A0xa0c4c3685f54e796!2sURLA%20DO%C4%9EAL%20TA%C5%9E%20PAZARI%20-%20URLA%20STONE!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.8) contrast(1.2)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
            {t.about_cta_title}
          </h2>
          <p className="text-white/40 text-sm sm:text-base mb-8 max-w-xl mx-auto">
            {t.about_cta_desc}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/teklif"
              className="inline-flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-full text-sm font-medium hover:bg-stone-200 transition-colors"
            >
              {t.about_cta_btn} <ArrowRight size={16} />
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
