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

const ekip = [
  {
    ad: 'Fatih At',
    unvan: 'İhracat ve Toptan Satış Sorumlusu',
    foto: '/ekip-fatih.jpg',
    bio: 'Afyon Kocatepe Üniversitesi Doğal Taş Teknikerliği mezunu. 15 yıl boyunca TUREKS bünyesinde ihracat biriminden üretim sorumluluğuna kadar önemli pozisyonlarda görev aldı. Daymar Stone firmasını kurarak ihracat ve iç piyasaya yönelik üretim gerçekleştirdi. Rockshell ürünlerinin üretimine öncülük ederek Urla Stone\'un kurucuları arasında yerini aldı.',
    linkedin: '#',
  },
  {
    ad: 'Özer Demirkırkan',
    unvan: 'Üretim ve AR-GE Sorumlusu',
    foto: '/ekip-ozer.jpg',
    bio: 'Kocaeli Üniversitesi Endüstri Mühendisliği mezunu. 13 yıl boyunca TUREKS bünyesinde ihracat ve üretim alanlarında deneyim kazandı. Daymar Stone firmasını kurarak Rockshell ürün serisinin geliştirilmesine öncülük etti. Üretim süreçlerindeki AR-GE çalışmalarıyla Urla Stone\'un kurucuları arasında yerini aldı.',
    linkedin: '#',
  },
  {
    ad: 'Cihan Zenger',
    unvan: 'Perakende ve Proje Sorumlusu',
    foto: '/ekip-cihan.jpg',
    bio: 'Yeditepe Üniversitesi Mimarlık Fakültesi mezunu. Regen Cons.&Arch. şirketini kurarak 6 yıl boyunca mimari proje hazırlığı ve uygulamaları gerçekleştirdi. İnşaat sektöründe yenilikçi ürünlerin tanıtımı ve uygulanmasıyla Kayseri ve İç Anadolu Bölgesi\'nde faaliyet gösterdi. Urla Stone\'un kurucu ortağı olarak perakende ve proje yönetimini üstleniyor.',
    linkedin: '#',
  },
]

const stats = [
  { sayi: '15+', etiket: 'Yıllık Sektör Deneyimi', icon: Award },
  { sayi: '500+', etiket: 'Tamamlanan Proje', icon: Building2 },
  { sayi: '50+', etiket: 'İhracat Ülkesi', icon: Globe },
  { sayi: '20+', etiket: 'Doğal Taş Çeşidi', icon: Gem },
]

const degerler = [
  {
    baslik: 'Kalite',
    aciklama: 'Her projede en yüksek kalite standartlarını uyguluyoruz. Doğal taşın doğasına saygı duyarak, kusursuz sonuçlar üretiyoruz.',
    icon: Award,
  },
  {
    baslik: 'Yenilikçilik',
    aciklama: 'Rockshell teknolojisi ile doğal taş sektöründe yeni bir çağ başlattık. AR-GE yatırımlarımızla sürekli gelişiyoruz.',
    icon: Hammer,
  },
  {
    baslik: 'Güven',
    aciklama: '15 yılı aşkın sektör deneyimimiz ve yüzlerce başarılı proje ile müşterilerimizin güvenini kazandık.',
    icon: Users,
  },
  {
    baslik: 'Küresel Vizyon',
    aciklama: '50\'den fazla ülkeye ihracat yapan yapımızla, Türk doğal taşını dünyaya tanıtıyoruz.',
    icon: Globe,
  },
]

export default function HakkimizdaPage() {
  return (
    <main className="bg-[#0a0a0a] min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-400/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-gold-400 text-xs font-mono tracking-[0.3em] uppercase mb-4">
              Hakkımızda
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              Doğal taşa
              <span className="block hero-gold-text">tutku ile bağlıyız.</span>
            </h1>
            <p className="text-white/50 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Urla Stone, 15 yılı aşkın sektör deneyimine sahip üç kurucunun
              ortak vizyonuyla doğdu. Doğal taşın eşsiz güzelliğini modern
              mimariyle buluşturuyoruz.
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
                Hikayemiz
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
                Urla&apos;nın kalbinden
                <span className="text-gold-400"> dünyaya.</span>
              </h2>
              <div className="space-y-4 text-white/50 text-sm sm:text-base leading-relaxed">
                <p>
                  Urla Stone, doğal taş sektöründe uzun yıllar farklı alanlarda
                  deneyim kazanmış üç ortağın bir araya gelmesiyle kurulmuştur.
                  İhracat, üretim ve mimari proje yönetimi alanlarında birbirini
                  tamamlayan bu üç isim, sektöre yenilikçi bir bakış açısı
                  getirmek amacıyla güçlerini birleştirmiştir.
                </p>
                <p>
                  TUREKS gibi Türkiye&apos;nin önde gelen ihracatçı firmalarında
                  edinilen tecrübe, Daymar Stone ile üretim süreçlerinde
                  mükemmelleştirilen uzmanlık ve Rockshell gibi yenilikçi ürün
                  serilerinin geliştirilmesi — tüm bu birikim Urla Stone
                  çatısı altında buluşmuştur.
                </p>
                <p>
                  Bugün İzmir Urla&apos;daki merkezimizden, Türkiye genelinde
                  ve 50&apos;den fazla ülkede projelerimizle doğal taşın
                  eşsiz dokusunu modern yaşam alanlarına taşıyoruz.
                </p>
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
              Ekibimiz
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
              Kurucularımız
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
              Değerlerimiz
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
              Bizi biz yapan ilkeler.
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
                Merkezimiz
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
                Urla&apos;dan dünyaya
                <span className="text-gold-400"> uzanan yolculuk.</span>
              </h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin size={16} className="text-gold-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Adres</p>
                    <p className="text-white/40 text-sm">Altıntaş, İzmir Çeşme Cd. NO: 319, Urla/İzmir</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Globe size={16} className="text-gold-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">İhracat Ağı</p>
                    <p className="text-white/40 text-sm">Avrupa, Ortadoğu, Kuzey Afrika ve daha fazlası</p>
                  </div>
                </div>
              </div>
              <Link
                href="/iletisim"
                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-stone-200 transition-colors"
              >
                İletişime Geç <ArrowRight size={16} />
              </Link>
            </div>

            {/* Harita */}
            <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-white/[0.06]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3130.5!2d26.7645!3d38.3560!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14bbc1e10e11a3a7%3A0x5b0f0f0f0f0f0f0f!2sUrla%2C%20%C4%B0zmir!5e0!3m2!1str!2str!4v1"
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
            Projeniz için bizimle iletişime geçin.
          </h2>
          <p className="text-white/40 text-sm sm:text-base mb-8 max-w-xl mx-auto">
            Ücretsiz keşif ve fiyat teklifi için hemen formumuzu doldurun.
            Uzman ekibimiz en kısa sürede size dönüş yapacaktır.
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
