'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'

const locales = ['tr', 'en', 'es', 'de', 'fr', 'ru', 'ar'] as const
const baseUrl = 'https://www.urlastone.com'

// Statik sayfalar (layout metadata'da alternates.languages var — duplicate olmasın)
const staticPages = new Set([
  '/', '/urunlerimiz', '/projelerimiz', '/referanslarimiz', '/blog',
  '/hakkimizda', '/iletisim', '/simulasyon', '/teklif', '/uygulamalarimiz', '/taslar',
])

function HreflangTagsInner() {
  const pathname = usePathname()
  // Admin sayfalarında hreflang gereksiz
  if (pathname.startsWith('/admin')) return null
  // Statik sayfalarda layout metadata zaten hreflang veriyor
  if (staticPages.has(pathname)) return null

  const cleanPath = pathname === '/' ? '' : pathname

  return (
    <>
      {/* hreflang - layout metadata'daki alternates.languages ile aynı, dynamic sayfalar için fallback */}
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
