'use client'

import Link from 'next/link'
import { MapPin, Phone, Mail, Instagram, Linkedin, ArrowUp } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <span className="text-white text-2xl tracking-tight select-none inline-block mb-4">
              <span className="font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>URLA</span>
              <span className="font-light" style={{ fontFamily: 'Inter, sans-serif' }}>STONE</span>
            </span>
            <p className="font-mono text-[10px] text-white/30 tracking-wider uppercase mb-6">
              {t.footer_slogan}
            </p>
            <p className="text-white/40 text-sm leading-relaxed">
              {t.footer_desc}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-medium text-sm mb-6">{t.footer_links}</h4>
            <ul className="space-y-3">
              {[
                { href: '/taslar', label: t.nav_taslarimiz },
                { href: '/simulasyon', label: t.nav_simulasyon },
                { href: '/uygulamalarimiz', label: t.nav_uygulamalar },
                { href: '/hakkimizda', label: t.nav_hakkimizda },
                { href: '/iletisim', label: t.nav_iletisim },
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
            <h4 className="text-white font-medium text-sm mb-6">{t.footer_iletisim}</h4>
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
            <h4 className="text-white font-medium text-sm mb-6">{t.footer_follow}</h4>
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/urladogaltaspazari/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-gold-400/20 transition-colors"
              >
                <Instagram size={18} className="text-white/60" />
              </a>
              <a
                href="https://www.linkedin.com/company/urla-stone/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-gold-400/20 transition-colors"
              >
                <Linkedin size={18} className="text-white/60" />
              </a>
              <a
                href="https://tr.pinterest.com/urlastone/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-gold-400/20 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px] text-white/60">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
          <p className="text-white/20 text-xs font-mono">&copy; {new Date().getFullYear()} Urlastone. {t.footer_rights}</p>
          <button onClick={scrollToTop} className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.12] transition-colors" aria-label="Yukarı">
            <ArrowUp size={14} className="text-white/60" />
          </button>
        </div>
      </div>
    </footer>
  )
}
