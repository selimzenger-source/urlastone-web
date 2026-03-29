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
    const validLocales = ['tr', 'en', 'es', 'de', 'fr', 'ru', 'ar']

    // 1. URL ?lang=xx parametresi en yüksek öncelik
    const urlParams = new URLSearchParams(window.location.search)
    const urlLang = urlParams.get('lang') as Locale | null
    if (urlLang && validLocales.includes(urlLang)) {
      setLocaleState(urlLang)
      localStorage.setItem('urlastone-lang', urlLang)
      document.documentElement.lang = urlLang
      if (urlLang === 'ar') document.documentElement.dir = 'rtl'
      return
    }

    // 2. localStorage'dan kayıtlı dil
    const saved = localStorage.getItem('urlastone-lang') as Locale | null
    if (saved && validLocales.includes(saved)) {
      setLocaleState(saved)
      document.documentElement.lang = saved
      if (saved === 'ar') document.documentElement.dir = 'rtl'
    } else {
      // 3. Tarayıcı diline göre otomatik dil seçimi
      const browserLang = (navigator.language || '').toLowerCase()
      let detected: Locale = 'en'
      if (browserLang.startsWith('tr')) detected = 'tr'
      else if (browserLang.startsWith('de')) detected = 'de'
      else if (browserLang.startsWith('es')) detected = 'es'
      else if (browserLang.startsWith('fr')) detected = 'fr'
      else if (browserLang.startsWith('ru')) detected = 'ru'
      else if (browserLang.startsWith('ar')) detected = 'ar'
      setLocaleState(detected)
      document.documentElement.lang = detected
      if (detected === 'ar') document.documentElement.dir = 'rtl'
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('urlastone-lang', newLocale)
    document.documentElement.lang = newLocale
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
