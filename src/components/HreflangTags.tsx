'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'

const locales = ['tr', 'en', 'es', 'de', 'fr', 'ru', 'ar'] as const
const baseUrl = 'https://www.urlastone.com'

function HreflangTagsInner() {
  const pathname = usePathname()
  // Admin sayfalarında hreflang gereksiz
  if (pathname.startsWith('/admin')) return null

  const cleanPath = pathname === '/' ? '' : pathname

  // Site URL'lerinde dil ön eki yok (i18n client-side, LanguageContext üzerinden).
  // Eskiden ?lang=xx query'li alternates üretiyorduk → Google bunları ayrı URL gibi
  // tarayıp 'tarandı eklenmedi' / 'alternatif sayfa' olarak işaretliyordu. Şimdi tüm
  // diller AYNI URL'e işaret eder (self-referential hreflang), Google duplicate/alt
  // URL üretmez ama sayfanın çok dilli olduğunu bilir.
  const url = `${baseUrl}${cleanPath}`
  return (
    <>
      <link rel="alternate" hrefLang="x-default" href={url} />
      {locales.map(loc => (
        <link key={loc} rel="alternate" hrefLang={loc} href={url} />
      ))}
    </>
  )
}

export default function HreflangTags() {
  return (
    <Suspense fallback={null}>
      <HreflangTagsInner />
    </Suspense>
  )
}
