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
    { href: '/taslar', label: t.nav_taslarimiz },
    { href: '/simulasyon', label: t.nav_simulasyon },
    { href: '/uygulamalarimiz', label: t.nav_uygulamalar },
    { href: '/hakkimizda', label: t.nav_hakkimizda },
    { href: '/iletisim', label: t.nav_iletisim },
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
        {/* Logo - müşterinin kendi logosu */}
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://urlastone.com/gallery_gen/5957649f2c824ca9999a9f80034d42af_400x48_fit.png?ts=1753707019"
            alt="Urlastone"
            className="h-8 md:h-10"
            style={{ filter: 'brightness(10)' }}
          />
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[13px] text-white/60 font-medium tracking-wide hover:text-white transition-colors duration-300"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ur2-dark.png" alt="" className="w-6 h-6 rounded" />
          </Link>
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
            <img src="/ur2-dark.png" alt="" className="w-7 h-7 rounded" />
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
