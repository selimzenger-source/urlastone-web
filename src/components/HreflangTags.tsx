'use client'

import { Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const locales = ['tr', 'en', 'es', 'de', 'fr', 'ru', 'ar'] as const
const baseUrl = 'https://www.urlastone.com'

function HreflangTagsInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lang = searchParams.get('lang')

  // Admin sayfalarında hreflang gereksiz
  if (pathname.startsWith('/admin')) return null

  // Canonical URL'yi hesapla (layout metadata'da da var ama dynamic sayfalar için fallback)
  const cleanPath = pathname === '/' ? '' : pathname
  const canonicalUrl = lang && locales.includes(lang as typeof locales[number])
    ? `${baseUrl}${cleanPath}?lang=${lang}`
    : `${baseUrl}${cleanPath}`

  return (
    <>
      {/* Canonical - sadece layout'ta metadata.alternates.canonical yoksa devreye girer */}
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${cleanPath}`} />
      <link rel="alternate" hrefLang="tr" href={`${baseUrl}${cleanPath}`} />
      {locales.filter(l => l !== 'tr').map(loc => (
        <link
          key={loc}
          rel="alternate"
          hrefLang={loc}
          href={`${baseUrl}${cleanPath}?lang=${loc}`}
        />
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
