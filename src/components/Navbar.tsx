'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ArrowRight } from 'lucide-react'
import LanguageSwitcher from './LanguageSwitcher'
import { useLanguage } from '@/context/LanguageContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { t } = useLanguage()

  const navLinks = [
    { href: '/urunlerimiz', label: t.nav_taslarimiz },
    { href: '/simulasyon', label: t.nav_simulasyon },
    { href: '/projelerimiz', label: t.nav_uygulamalar },
    { href: '/hakkimizda', label: t.nav_hakkimizda },
    { href: '/iletisim', label: t.nav_iletisim },
    { href: '/blog', label: t.nav_blog },
  ]

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-700 ${
        scrolled
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/[0.06] py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ur2-dark.png" alt="Urlastone" className="h-9 md:h-10 w-9 md:w-10 object-contain" />
          <span className="text-white text-xl md:text-2xl tracking-[0.15em] font-light" style={{ fontFamily: 'Inter, sans-serif' }}>
            <span className="font-bold">URLA</span>
            <span className="font-light">STONE</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] text-white/60 font-medium tracking-wide hover:text-white transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
          <LanguageSwitcher />
          <Link href="/teklif" className="btn-primary text-[13px] px-6 py-3">
            {t.nav_teklif}
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 text-white"
          aria-label="Menü"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-500 ${
          isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-[#0a0a0a] border-t border-white/[0.06] px-6 py-8 space-y-2">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 py-3 text-white/70 font-medium text-lg hover:text-white transition-colors"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ur2-dark.png" alt="Urlastone Doğal Taş" className="w-7 h-7 object-contain" />
            {t.nav_anasayfa}
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block py-3 text-white/70 font-medium text-lg hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 space-y-4">
            <LanguageSwitcher variant="inline" />
            <Link
              href="/teklif"
              onClick={() => setIsOpen(false)}
              className="btn-primary w-full justify-center text-base py-4"
            >
              {t.nav_teklif}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
