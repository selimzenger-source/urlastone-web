'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Locale, getTranslations } from '@/lib/i18n'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: ReturnType<typeof getTranslations>
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'tr',
  setLocale: () => {},
  t: getTranslations('tr'),
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('tr')

  useEffect(() => {
    const saved = localStorage.getItem('urlastone-lang') as Locale | null
    if (saved && ['tr', 'en', 'es', 'de', 'fr', 'ru', 'ar'].includes(saved)) {
      setLocaleState(saved)
      if (saved === 'ar') document.documentElement.dir = 'rtl'
    } else {
      // Tarayıcı diline göre otomatik dil seçimi
      const browserLang = (navigator.language || '').toLowerCase()
      let detected: Locale = 'en' // Varsayılan: İngilizce
      if (browserLang.startsWith('tr')) detected = 'tr'
      else if (browserLang.startsWith('de')) detected = 'de'
      else if (browserLang.startsWith('es')) detected = 'es'
      else if (browserLang.startsWith('fr')) detected = 'fr'
      else if (browserLang.startsWith('ru')) detected = 'ru'
      else if (browserLang.startsWith('ar')) detected = 'ar'
      setLocaleState(detected)
      if (detected === 'ar') document.documentElement.dir = 'rtl'
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('urlastone-lang', newLocale)
    // Set dir for RTL (Arabic)
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr'
  }

  const t = getTranslations(locale)

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
