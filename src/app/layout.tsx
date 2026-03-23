import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/context/LanguageContext'
// PWA Install Prompt kaldirildi - mobilde gereksiz cikiyordu
// import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import PageTracker from '@/components/PageTracker'
import Script from 'next/script'

export const metadata: Metadata = {
  metadataBase: new URL('https://urlastone.com'),
  title: {
    default: 'URLASTONE | Doğal Taş Üreticisi - Traverten, Bazalt, Kalker | Urla, İzmir',
    template: '%s | URLASTONE - Doğal Taş',
  },
  description: 'Urla Doğal Taş Pazarı - Rockshell, traverten, bazalt, kalker ve mermer doğal taş üretimi ve ihracatı. Cephe kaplama, zemin döşeme, bahçe peyzaj taşı. Nature, Line, Mix, Classic, Crazy ebat seçenekleri. Çeşme, Urla, İzmir, Turkey.',
  keywords: ['doğal taş', 'natural stone', 'pierre naturelle', 'натуральный камень', 'piedra natural', 'Naturstein', 'حجر طبيعي', 'urla', 'izmir', 'çeşme', 'turkey', 'türkiye', 'cephe kaplama', 'facade cladding', 'revêtement de façade', 'облицовка фасадов', 'traverten', 'travertine', 'travertin', 'травертин', 'mermer', 'marble', 'marbre', 'мрамор', 'bazalt', 'basalt', 'basalte', 'базальт', 'kalker', 'limestone', 'calcaire', 'известняк', 'taş kaplama', 'stone cladding', 'zemin döşeme', 'floor tiling', 'urlastone', 'doğal taş pazarı', 'rockshell', 'nature rockshell', 'line rockshell', 'mix rockshell', 'doğal taş üretici', 'natural stone manufacturer', 'fabricant de pierre naturelle', 'производитель натурального камня', 'turkish natural stone', 'dış cephe taş kaplama', 'exterior stone cladding', 'peyzaj taşı', 'landscape stone'],
  authors: [{ name: 'URLASTONE' }],
  creator: 'URLASTONE',
  openGraph: {
    title: 'URLASTONE | Doğal Taş Üreticisi - Urla, İzmir',
    description: 'Rockshell, traverten, bazalt, kalker doğal taş üretimi. Cephe kaplama, zemin döşeme, peyzaj çözümleri. Urla, İzmir.',
    url: 'https://urlastone.com',
    siteName: 'URLASTONE',
    locale: 'tr_TR',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1080,
        height: 1080,
        alt: 'URLASTONE - Doğal Taş Üreticisi Urla İzmir',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'URLASTONE | Doğal Taş Üreticisi - Urla, İzmir',
    description: 'Rockshell, traverten, bazalt, kalker doğal taş. Cephe kaplama ve peyzaj çözümleri.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/og-image.jpg',
    apple: '/apple-touch-icon.jpg',
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://urlastone.com',
  },
  verification: {
    google: 'google3f6fffccc6484188',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'LocalBusiness',
      '@id': 'https://urlastone.com/#business',
      name: 'URLASTONE - Doğal Taş Pazarı',
      alternateName: 'Urlastone',
      description: 'Natural stone manufacturer based in Urla, Çeşme, İzmir, Turkey. Rockshell, travertine, basalt, limestone and marble production. Facade cladding, floor tiling, landscape stone. Doğal taş üreticisi.',
      url: 'https://urlastone.com',
      telephone: '+905532322144',
      email: 'info@urlastone.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Altıntaş, İzmir Çeşme Cad. No: 319',
        addressLocality: 'Urla',
        addressRegion: 'İzmir',
        postalCode: '35430',
        addressCountry: 'TR',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 38.3220,
        longitude: 26.7636,
      },
      image: 'https://urlastone.com/og-image.jpg',
      logo: 'https://urlastone.com/logo-white.png',
      priceRange: '$$',
      currenciesAccepted: 'TRY, USD, EUR',
      paymentAccepted: 'Cash, Credit Card, Bank Transfer',
      areaServed: [
        { '@type': 'Country', name: 'Turkey' },
        { '@type': 'Country', name: 'Germany' },
        { '@type': 'Country', name: 'Spain' },
        { '@type': 'Country', name: 'Saudi Arabia' },
        { '@type': 'Country', name: 'United Arab Emirates' },
        { '@type': 'Country', name: 'United Kingdom' },
        { '@type': 'Country', name: 'United States' },
        { '@type': 'Country', name: 'France' },
        { '@type': 'Country', name: 'Russia' },
      ],
      knowsLanguage: ['tr', 'en', 'es', 'de', 'fr', 'ru', 'ar'],
      sameAs: [
        'https://www.instagram.com/urlastone/',
      ],
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '08:00',
          closes: '18:00',
        },
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Doğal Taş Ürünleri',
        itemListElement: [
          { '@type': 'OfferCatalog', name: 'Traverten Doğal Taş' },
          { '@type': 'OfferCatalog', name: 'Bazalt Doğal Taş' },
          { '@type': 'OfferCatalog', name: 'Kalker Doğal Taş' },
          { '@type': 'OfferCatalog', name: 'Mermer Doğal Taş' },
        ],
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://urlastone.com/#website',
      url: 'https://urlastone.com',
      name: 'URLASTONE',
      description: 'Doğal taş üreticisi - Urla, İzmir',
      publisher: { '@id': 'https://urlastone.com/#business' },
      inLanguage: ['tr', 'en', 'es', 'de', 'fr', 'ru', 'ar'],
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <head>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          strategy="afterInteractive"
        />
      </head>
      <body>
        <LanguageProvider>
          {children}
          <PageTracker />
        </LanguageProvider>
      </body>
    </html>
  )
}
