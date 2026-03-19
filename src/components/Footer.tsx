'use client'

import Link from 'next/link'
import { MapPin, Phone, Mail, Instagram, ArrowUp } from 'lucide-react'

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://urlastone.com/gallery_gen/5957649f2c824ca9999a9f80034d42af_400x48_fit.png?ts=1753707019"
              alt="Urlastone"
              className="h-10 mb-4"
              style={{ filter: 'brightness(10)' }}
            />
            <p className="font-mono text-[10px] text-white/30 tracking-wider uppercase mb-6">
              Doğal Taş Pazarı &mdash; Urla, İzmir
            </p>
            <p className="text-white/40 text-sm leading-relaxed">
              Milyon yıllık doğal taşları, modern mimariye taşıyoruz.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-medium text-sm mb-6">Sayfalar</h4>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Ana Sayfa' },
                { href: '/taslar', label: 'Taşlarımız' },
                { href: '/simulasyon', label: 'AI Simülasyon' },
                { href: '/uygulamalarim', label: 'Uygulamalarım' },
                { href: '/iletisim', label: 'İletişim' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/40 hover:text-white transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-medium text-sm mb-6">İletişim</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-gold-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/40 text-sm">Altıntaş, İzmir Çeşme Cad. No: 319, Urla/İzmir</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-gold-400 flex-shrink-0" />
                <a href="tel:+905532322144" className="text-white/40 text-sm hover:text-white transition-colors">+90 553 232 2144</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-gold-400 flex-shrink-0" />
                <a href="mailto:info@urlastone.com" className="text-white/40 text-sm hover:text-white transition-colors">info@urlastone.com</a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-medium text-sm mb-6">Takip</h4>
            <a
              href="https://www.instagram.com/urladogaltaspazari/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-gold-400/20 transition-colors"
            >
              <Instagram size={18} className="text-white/60" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
          <p className="text-white/20 text-xs font-mono">&copy; {new Date().getFullYear()} Urlastone</p>
          <button onClick={scrollToTop} className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.12] transition-colors" aria-label="Yukarı">
            <ArrowUp size={14} className="text-white/60" />
          </button>
        </div>
      </div>
    </footer>
  )
}
