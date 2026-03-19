import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import TeklifForm from '@/components/TeklifForm'
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react'

export default function IletisimPage() {
  return (
    <main>
      <Navbar />

      <section className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-16">
            <p className="font-mono text-[11px] text-white/40 tracking-wider uppercase mb-4">
              İletişim
            </p>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Projeniz için <span className="italic text-gradient-gold">teklif alın.</span>
            </h1>
            <p className="text-white/40 text-sm md:text-base max-w-xl font-mono">
              Formu doldurun, 24 saat içinde detaylı teklifinizi hazırlayalım.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Sol: Form */}
            <div className="lg:col-span-2">
              <TeklifForm />
            </div>

            {/* Sağ: İletişim Bilgileri + Süreç */}
            <div className="space-y-8">
              {/* İletişim Kartı */}
              <div className="glass-card p-8">
                <h3 className="font-heading text-lg font-bold text-white mb-6">
                  Doğrudan Ulaşın
                </h3>
                <ul className="space-y-5">
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center flex-shrink-0">
                      <Phone size={16} className="text-gold-400" />
                    </div>
                    <div>
                      <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider mb-1">Telefon</p>
                      <a href="tel:+905532322144" className="text-white text-sm hover:text-gold-400 transition-colors">
                        +90 553 232 2144
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center flex-shrink-0">
                      <MessageCircle size={16} className="text-gold-400" />
                    </div>
                    <div>
                      <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider mb-1">WhatsApp</p>
                      <a
                        href="https://wa.me/905532322144?text=Merhaba%2C%20do%C4%9Fal%20ta%C5%9F%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white text-sm hover:text-gold-400 transition-colors"
                      >
                        Mesaj Gönder
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center flex-shrink-0">
                      <Mail size={16} className="text-gold-400" />
                    </div>
                    <div>
                      <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider mb-1">E-posta</p>
                      <a href="mailto:info@urlastone.com" className="text-white text-sm hover:text-gold-400 transition-colors">
                        info@urlastone.com
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center flex-shrink-0">
                      <MapPin size={16} className="text-gold-400" />
                    </div>
                    <div>
                      <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider mb-1">Adres</p>
                      <p className="text-white text-sm">
                        Altıntaş, İzmir Çeşme Cad.<br />No: 319, Urla/İzmir
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center flex-shrink-0">
                      <Clock size={16} className="text-gold-400" />
                    </div>
                    <div>
                      <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider mb-1">Çalışma Saatleri</p>
                      <p className="text-white text-sm">Pzt — Cmt: 08:00 — 18:00</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Süreç Kartı */}
              <div className="glass-card p-8">
                <h3 className="font-heading text-lg font-bold text-white mb-6">
                  Nasıl İlerliyor?
                </h3>
                <div className="space-y-6">
                  {[
                    {
                      step: '01',
                      title: 'Formu Doldurun',
                      desc: 'Proje detaylarınızı ve taş tercihlerinizi belirtin.',
                    },
                    {
                      step: '02',
                      title: 'Sizi Arayalım',
                      desc: '24 saat içinde uzman ekibimiz sizinle iletişime geçer.',
                    },
                    {
                      step: '03',
                      title: 'Keşif Ziyareti',
                      desc: 'Gerekirse proje alanını yerinde inceleyerek ölçü alırız.',
                    },
                    {
                      step: '04',
                      title: 'Detaylı Teklif',
                      desc: 'Taş seçimi, işçilik ve nakliye dahil fiyat teklifi sunulur.',
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <span className="font-heading text-2xl font-bold text-gold-400/30">
                          {item.step}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm mb-1">{item.title}</p>
                        <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Google Maps */}
          <div className="mt-20">
            <div className="glass-card overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3131.1!2d26.7636!3d38.3227!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14bbd862ed0fab99%3A0x2a65e5fbb7d4fb31!2sUrla%20Do%C4%9Fal%20Ta%C5%9F%20Pazar%C4%B1!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str"
                width="100%"
                height="400"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.8) contrast(1.2)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Urlastone Konum"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
