'use client'

import { usePathname } from 'next/navigation'

const locales = ['tr', 'en', 'es', 'de', 'fr', 'ru', 'ar'] as const
const baseUrl = 'https://www.urlastone.com'

export default function HreflangTags() {
  const pathname = usePathname()

  return (
    <>
      {/* x-default = Türkçe (ana dil) */}
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${pathname}`} />
      <link rel="alternate" hrefLang="tr" href={`${baseUrl}${pathname}`} />
      {locales.filter(l => l !== 'tr').map(lang => (
        <link
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={`${baseUrl}${pathname}?lang=${lang}`}
        />
      ))}
    </>
  )
}
