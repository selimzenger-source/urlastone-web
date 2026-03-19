'use client'

import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { languages, Locale } from '@/lib/i18n'
import { ChevronDown } from 'lucide-react'

// Dil kodu → ülke kodu eşlemesi (bayrak CDN için)
const countryCodeMap: Record<string, string> = {
  tr: 'tr',
  en: 'gb',
  es: 'es',
  ar: 'sa',
  de: 'de',
}

function getFlagUrl(langCode: string, width = 40) {
  const cc = countryCodeMap[langCode] || langCode
  return `https://flagcdn.com/w${width}/${cc}.png`
}

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'inline'
}

export default function LanguageSwitcher({ variant = 'dropdown' }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = languages.find((l) => l.code === locale) || languages[0]

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Mobil: inline bayrak butonları (yan yana)
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLocale(lang.code as Locale)}
            className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              locale === lang.code
                ? 'bg-white/[0.12] ring-2 ring-gold-400/50'
                : 'bg-white/[0.04] hover:bg-white/[0.08]'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getFlagUrl(lang.code, 40)}
              alt={lang.label}
              className="w-5 h-3.5 object-cover rounded-[2px]"
            />
            {locale === lang.code && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold-400" />
            )}
          </button>
        ))}
      </div>
    )
  }

  // Masaüstü: dropdown
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.10] transition-colors text-sm"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getFlagUrl(current.code)}
          alt={current.label}
          className="w-5 h-3.5 object-cover rounded-[2px]"
        />
        <span className="text-white/60 text-xs font-mono hidden sm:inline">{current.code.toUpperCase()}</span>
        <ChevronDown size={12} className={`text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-[#111] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl min-w-[180px] z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { setLocale(lang.code as Locale); setOpen(false) }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                locale === lang.code
                  ? 'bg-white/[0.08] text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getFlagUrl(lang.code, 40)}
                alt={lang.label}
                className="w-6 h-4 object-cover rounded-[2px]"
              />
              <span className="font-mono text-xs">{lang.label}</span>
              {locale === lang.code && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
