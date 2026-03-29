'use client'

import { Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const locales = ['tr', 'en', 'es', 'de', 'fr', 'ru', 'ar'] as const
const baseUrl = 'https://www.urlastone.com'

function HreflangTagsInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lang = searchParams.get('lang')

  const canonicalUrl = lang && locales.includes(lang as typeof locales[number])
    ? `${baseUrl}${pathname}?lang=${lang}`
    : `${baseUrl}${pathname}`

  return (
    <>
      <link rel="canonical" href={canonicalUrl} />
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

export default function HreflangTags() {
  return (
    <Suspense fallback={null}>
      <HreflangTagsInner />
    </Suspense>
  )
}
