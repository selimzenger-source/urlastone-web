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

const rockshellModels = [
  {
    id: 'nature',
    ad: 'Nature',
    slogan: 'Doğanın ham güzelliği.',
    aciklama: 'Doğal taşların üretim için kırılma sürecinden geçtikten sonraki yüzey formlarını olduğu gibi koruyarak inceltilmesiyle ortaya çıkar. En organik ve doğal görünümü sunan modelimizdir.',
    ozellikler: ['Doğal kırık yüzey', 'Organik formlar', 'Cephe & iç mekan'],
    kalinlik: '1.5 – 3 cm',
    renk: '/rockshell-nature.jpg',
  },
  {
    id: 'mix',
    ad: 'Mix',
    slogan: 'Düzenli ve düzensizin uyumu.',
    aciklama: 'Bir kısmı ince ve yatay düzlemlerde ebatlanmış taşlarla, ebatlanmamış tombul taşların inceltilip karışımı sonucu ortaya çıkar. Modern ve geleneksel arası dengeyi yakalayan modeldir.',
    ozellikler: ['Karma doku', 'Farklı ebatlar', 'Esnek uygulama'],
    kalinlik: '1.5 – 3 cm',
    renk: '/rockshell-mix.jpg',
  },
  {
    id: 'geo',
    ad: 'Geo',
    slogan: 'Geometrik düzen, doğal doku.',
    aciklama: 'Doğal taşların yatay düzlemde iki taraflı 5, 10 ve 15 cm yükseklikte ebatlanıp boy serbest olarak inceltilmesi sonucu ortaya çıkar. Düzenli çizgilerin doğal taş ile buluşmasıdır.',
    ozellikler: ['3 farklı yükseklik', 'Serbest boy', 'Geometrik düzen'],
    kalinlik: '1.5 – 2.5 cm',
    renk: '/rockshell-geo.jpg',
  },
  {
    id: 'line',
    ad: 'Line',
    slogan: 'İnce çizgilerin zarafeti.',
    aciklama: 'Doğal taşların yatay düzlemde iki taraflı 3 cm yükseklikte ebatlanıp boy serbest olarak inceltilmesi sonucu ortaya çıkar. Minimal ve modern mekânlara mükemmel uyum sağlar.',
    ozellikler: ['3 cm sabit yükseklik', 'Serbest boy', 'Minimal çizgiler'],
    kalinlik: '1 – 2 cm',
    renk: '/rockshell-line.jpg',
  },
]

const tasSerileri = [
  {
    ad: 'Traverten',
    kategori: 'Kireçtaşı',
    renk: 'Bej / Krem / Fildişi',
    foto: '/tas-traverten.jpg',
    aciklama: 'Doğal gözenekli yapısıyla sıcak ve otantik bir görünüm sunar. Villa cepheleri ve havuz kenarlarının vazgeçilmezi.',
    kullanim: ['Cephe Kaplama', 'Havuz Kenarı', 'Zemin Döşeme', 'İç Mekan'],
  },
  {
    ad: 'Mermer',
    kategori: 'Metamorfik',
    renk: 'Beyaz / Gri / Yeşil',
    foto: '/tas-mermer.jpg',
    aciklama: 'Zarif damarlarıyla lüks mekânların vazgeçilmez taşı. Her parça benzersiz bir doğa eseridir.',
    kullanim: ['İç Mekan', 'Tezgah', 'Banyo', 'Merdiven'],
  },
  {
    ad: 'Bazalt',
    kategori: 'Volkanik',
    renk: 'Koyu Gri / Antrasit / Siyah',
    foto: '/tas-bazalt.jpg',
    aciklama: 'Yüksek dayanıklılığıyla dış mekân projelerinde idealdir. Sert iklim koşullarına dayanıklı yapısıyla öne çıkar.',
    kullanim: ['Cephe Kaplama', 'Bahçe & Peyzaj', 'Yürüyüş Yolu'],
  },
  {
    ad: 'Granit',
    kategori: 'Plütonik',
    renk: 'Gri / Pembe / Siyah',
    foto: '/tas-granit.jpg',
    aciklama: 'En sert doğal taşlardan biri. Aşınmaya son derece dayanıklı yapısıyla yoğun kullanım alanları için idealdir.',
    kullanim: ['Zemin Döşeme', 'Tezgah', 'Merdiven', 'Dış Cephe'],
  },
  {
    ad: 'Kayrak',
    kategori: 'Metamorfik',
    renk: 'Yeşil / Gri / Kahverengi',
    foto: '/tas-kayrak.jpg',
    aciklama: 'Tabakalı yapısıyla rustik ve doğal bir atmosfer yaratır. Bahçe projelerinin en sevilen taşıdır.',
    kullanim: ['Bahçe & Peyzaj', 'Duvar Kaplama', 'Zemin Döşeme'],
  },
  {
    ad: 'Kuvarsit',
    kategori: 'Metamorfik',
    renk: 'Beyaz / Gümüş / Altın',
    foto: '/tas-kuvarsit.jpg',
    aciklama: 'Parlak yüzeyi ve sert yapısıyla modern projelerde tercih edilir. Işıkla etkileşimi benzersiz bir görünüm sağlar.',
    kullanim: ['İç Mekan', 'Duvar Kaplama', 'Özel Projeler'],
  },
]

const kullanimAlanlari = [
  { baslik: 'Cephe Kaplama', icon: Layers },
  { baslik: 'İç Mekan', icon: Palette },
  { baslik: 'Zemin Döşeme', icon: Ruler },
  { baslik: 'Bahçe & Peyzaj', icon: Shield },
]

export default function TaslarPage() {
  const [activeModel, setActiveModel] = useState('nature')
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
              Ürün Koleksiyonu
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              Doğanın milyonlarca yıllık
              <span className="block hero-gold-text">eşsiz taşları.</span>
            </h1>
            <p className="text-white/50 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Rockshell teknolojisi ile doğal taşın eşsiz dokusunu ultra ince
              panellere dönüştürüyoruz. Her model, farklı bir estetik anlayışı yansıtır.
            </p>
          </div>
        </div>
      </section>

      {/* Rockshell Serisi */}
      <section className="py-20 md:py-28 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-gold-400 text-xs font-mono tracking-[0.3em] uppercase mb-4">
              Rockshell Serisi
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
              4 farklı model, sonsuz olasılık.
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
                  Ürün görseli eklenecek
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
                  <p className="text-white/30 text-[10px] font-mono uppercase">Kalınlık</p>
                  <p className="text-white font-medium text-sm mt-1">{aktifModel.kalinlik}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <p className="text-white/30 text-[10px] font-mono uppercase">Teknoloji</p>
                  <p className="text-white font-medium text-sm mt-1">Rockshell</p>
                </div>
              </div>

              <Link
                href="/iletisim"
                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-stone-200 transition-colors"
              >
                Bu model için teklif al <ArrowRight size={16} />
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
              Taş Koleksiyonu
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
              Doğal taş çeşitlerimiz.
            </h2>
            <p className="text-white/40 text-sm max-w-xl mx-auto">
              Her biri milyonlarca yılda oluşmuş, benzersiz dokuya sahip doğal taşlarımız
              projenize karakter katar.
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
                    Teklif Al <ChevronRight size={12} />
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
              Uygulama Alanları
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
              Hayalinizde ne varsa.
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
            Projenize en uygun taşı birlikte seçelim.
          </h2>
          <p className="text-white/40 text-sm sm:text-base mb-8 max-w-xl mx-auto">
            Numune talebi, fiyat teklifi veya teknik danışmanlık için
            ekibimizle iletişime geçin.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/iletisim"
              className="inline-flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-full text-sm font-medium hover:bg-stone-200 transition-colors"
            >
              Teklif Al <ArrowRight size={16} />
            </Link>
            <a
              href="https://wa.me/905532322144"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-white/[0.12] text-white/70 px-8 py-3.5 rounded-full text-sm hover:bg-white/[0.04] transition-colors"
            >
              WhatsApp ile Ulaşın
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
