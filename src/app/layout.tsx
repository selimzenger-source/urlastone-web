import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/context/LanguageContext'
// PWA Install Prompt kaldirildi - mobilde gereksiz cikiyordu
// import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import PageTracker from '@/components/PageTracker'
import Script from 'next/script'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.urlastone.com'),
  title: {
    default: 'URLASTONE | Doğal Taş Üreticisi & İhracatçı - Traverten, Bazalt, Kalker, Mermer | Urla, Çeşme, İzmir',
    template: '%s | URLASTONE - Doğal Taş Üreticisi İzmir',
  },
  description: 'Türkiye\'nin önde gelen doğal taş üreticisi URLASTONE. Traverten, bazalt, kalker ve mermer ile dış cephe kaplama, iç mekan duvar kaplama, şömine ve peyzaj taşı çözümleri. Rockshell teknolojisi ile ince taş kaplama panelleri. AI simülasyon ile taşınızı binanızda görün. 50+ ülkeye ihracat. Urla, Çeşme, İzmir.',
  keywords: [
    // TR
    'doğal taş', 'traverten', 'bazalt', 'kalker', 'mermer', 'taş kaplama', 'cephe kaplama', 'dış cephe taş kaplama', 'iç mekan taş', 'şömine taş kaplama', 'peyzaj taşı', 'doğal taş üretici', 'doğal taş fabrikası', 'doğal taş fiyat', 'taş duvar kaplama', 'villa taş', 'otel taş cephe', 'doğal taş ihracat', 'urlastone', 'rockshell', 'urla', 'izmir', 'çeşme', 'alaçatı',
    // EN
    'natural stone', 'travertine', 'basalt', 'limestone', 'marble', 'stone cladding', 'facade cladding', 'stone veneer', 'natural stone manufacturer', 'turkish natural stone', 'natural stone exporter Turkey', 'exterior stone cladding', 'interior stone wall', 'stone veneer panels',
    // ES
    'piedra natural', 'travertino turco', 'revestimiento piedra', 'fabricante piedra natural',
    // DE
    'Naturstein', 'Naturstein Türkei', 'Travertin', 'Fassadenverkleidung', 'Steinverblender', 'Naturstein Hersteller',
    // FR
    'pierre naturelle', 'travertin turc', 'revêtement façade', 'fabricant pierre naturelle', 'parement pierre',
    // RU
    'натуральный камень', 'травертин', 'облицовка фасадов', 'производитель натурального камня', 'купить камень Турция',
    // AR
    'حجر طبيعي', 'ترافرتين تركي', 'كسوة واجهات', 'حجر طبيعي تركيا',
  ],
  authors: [{ name: 'URLASTONE' }],
  creator: 'URLASTONE',
  openGraph: {
    title: 'URLASTONE | Doğal Taş Üreticisi & İhracatçı - Urla, Çeşme, İzmir',
    description: 'Traverten, bazalt, kalker, mermer doğal taş üretimi ve ihracatı. Dış cephe kaplama, iç mekan, şömine, peyzaj taşı. AI simülasyon. 50+ ülkeye ihracat.',
    url: 'https://www.urlastone.com',
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
    // ══ Organization / Business ══
    {
      '@type': ['LocalBusiness', 'Organization', 'Store'],
      '@id': 'https://www.urlastone.com/#business',
      name: 'URLASTONE',
      alternateName: ['Urlastone', 'Urla Stone', 'URLASTONE Doğal Taş', 'Daymar Stone'],
      description: 'URLASTONE is a premium natural stone manufacturer and exporter based in Urla, İzmir, Turkey. Specializing in Rockshell technology — thin natural stone veneer panels made from travertine, basalt, limestone and marble. Products include exterior facade cladding, interior wall cladding, fireplace surrounds, bathroom walls, floor tiling and landscape stone. Serving 50+ countries with AI-powered stone visualization technology.',
      url: 'https://www.urlastone.com',
      telephone: '+905532322144',
      email: 'info@urlastone.com',
      foundingDate: '2015',
      founder: [
        { '@type': 'Person', name: 'Cihan Zenger', jobTitle: 'Co-Founder' },
        { '@type': 'Person', name: 'Selim Zenger', jobTitle: 'Co-Founder' },
      ],
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Altıntaş, İzmir Çeşme Cad. No: 319',
        addressLocality: 'Urla',
        addressRegion: 'İzmir',
        postalCode: '35430',
        addressCountry: 'TR',
      },
      geo: { '@type': 'GeoCoordinates', latitude: 38.3220, longitude: 26.7636 },
      image: 'https://www.urlastone.com/og-image.jpg',
      logo: 'https://www.urlastone.com/logo-white.png',
      priceRange: '$$',
      currenciesAccepted: 'TRY, USD, EUR',
      paymentAccepted: 'Cash, Credit Card, Bank Transfer',
      numberOfEmployees: { '@type': 'QuantitativeValue', minValue: 10, maxValue: 50 },
      slogan: '500+ completed projects worldwide — Premium Turkish natural stone manufacturer',
      areaServed: [
        { '@type': 'Country', name: 'Turkey' }, { '@type': 'Country', name: 'Germany' },
        { '@type': 'Country', name: 'Spain' }, { '@type': 'Country', name: 'France' },
        { '@type': 'Country', name: 'Russia' }, { '@type': 'Country', name: 'Saudi Arabia' },
        { '@type': 'Country', name: 'United Arab Emirates' }, { '@type': 'Country', name: 'United Kingdom' },
        { '@type': 'Country', name: 'United States' }, { '@type': 'Country', name: 'Italy' },
        { '@type': 'Country', name: 'Greece' }, { '@type': 'Country', name: 'Netherlands' },
      ],
      knowsLanguage: ['tr', 'en', 'es', 'de', 'fr', 'ru', 'ar'],
      sameAs: ['https://www.instagram.com/urlastone/'],
      openingHoursSpecification: [{
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '08:00', closes: '18:00',
      }],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Natural Stone Products',
        itemListElement: [
          { '@type': 'OfferCatalog', name: 'Travertine Natural Stone - Traverten Doğal Taş', description: 'Premium Turkish travertine from Denizli. Warm cream, ivory and honey tones.' },
          { '@type': 'OfferCatalog', name: 'Basalt Natural Stone - Bazalt Doğal Taş', description: 'Dark volcanic basalt. Dense and durable for modern facades.' },
          { '@type': 'OfferCatalog', name: 'Limestone Natural Stone - Kalker Doğal Taş', description: 'Soft sandy beige limestone with natural fossil marks.' },
          { '@type': 'OfferCatalog', name: 'Marble Natural Stone - Mermer Doğal Taş', description: 'Elegant marble with flowing grey veining patterns.' },
        ],
      },
      makesOffer: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Dış Cephe Taş Kaplama - Exterior Facade Stone Cladding', description: 'Natural stone veneer cladding for building exteriors. Rockshell thin stone panels.' }},
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'İç Mekan Taş Kaplama - Interior Wall Stone Cladding', description: 'Natural stone wall cladding for interior spaces, living rooms, lobbies.' }},
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Şömine Taş Kaplama - Fireplace Stone Cladding', description: 'Natural stone surrounds for fireplaces and chimney walls.' }},
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'AI Taş Simülasyonu - AI Stone Simulation', description: 'Upload your building photo and see how natural stone will look with AI visualization.' }},
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Doğal Taş İhracat - Natural Stone Export', description: 'International natural stone export to 50+ countries worldwide.' }},
      ],
    },
    // ══ Website ══
    {
      '@type': 'WebSite',
      '@id': 'https://www.urlastone.com/#website',
      url: 'https://www.urlastone.com',
      name: 'URLASTONE - Doğal Taş Üreticisi',
      description: 'Premium natural stone manufacturer in Urla, İzmir, Turkey. Travertine, basalt, limestone, marble facade cladding and interior design solutions.',
      publisher: { '@id': 'https://www.urlastone.com/#business' },
      inLanguage: ['tr', 'en', 'es', 'de', 'fr', 'ru', 'ar'],
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://www.urlastone.com/urunlerimiz?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    // ══ Products ══
    {
      '@type': 'Product',
      name: 'Nature Rockshell - Doğal Taş Kaplama',
      description: 'Large irregular polygonal natural stone veneer. Organic appearance with thick grout lines. Available in travertine, basalt, limestone and marble. 1.5-3cm thick.',
      brand: { '@type': 'Brand', name: 'URLASTONE' },
      manufacturer: { '@id': 'https://www.urlastone.com/#business' },
      category: 'Natural Stone Cladding',
      material: 'Natural Stone',
      url: 'https://www.urlastone.com/urunlerimiz',
      image: 'https://www.urlastone.com/pattern-nature.png',
    },
    {
      '@type': 'Product',
      name: 'Line Rockshell - Modern Taş Kaplama',
      description: 'Thin horizontal stone strips for modern minimalist facades. Linear pattern, 1-2cm thick. Clean contemporary design.',
      brand: { '@type': 'Brand', name: 'URLASTONE' },
      manufacturer: { '@id': 'https://www.urlastone.com/#business' },
      category: 'Natural Stone Cladding',
      url: 'https://www.urlastone.com/urunlerimiz',
    },
    {
      '@type': 'Product',
      name: 'Mix Rockshell - Karışık Taş Kaplama',
      description: 'Combination of horizontal strips and irregular pieces. Versatile natural stone veneer for facades and interiors. 1.5-3cm thick.',
      brand: { '@type': 'Brand', name: 'URLASTONE' },
      manufacturer: { '@id': 'https://www.urlastone.com/#business' },
      category: 'Natural Stone Cladding',
      url: 'https://www.urlastone.com/urunlerimiz',
    },
    {
      '@type': 'Product',
      name: 'Crazy Rockshell - Mozaik Taş Kaplama',
      description: 'Dense mosaic of small irregular stone pieces. Artistic cobblestone-like appearance. 1.5-2.5cm thick.',
      brand: { '@type': 'Brand', name: 'URLASTONE' },
      manufacturer: { '@id': 'https://www.urlastone.com/#business' },
      category: 'Natural Stone Cladding',
      url: 'https://www.urlastone.com/urunlerimiz',
    },
    // ══ FAQ ══
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'URLASTONE nerede? Doğal taş nereden alınır?',
          acceptedAnswer: { '@type': 'Answer', text: 'URLASTONE, İzmir Urla\'da bulunan doğal taş üretim tesisindedir. Adres: Altıntaş, İzmir Çeşme Cad. No: 319, Urla, İzmir. Showroom ziyareti için randevu alabilirsiniz.' },
        },
        {
          '@type': 'Question',
          name: 'Hangi taş türleri mevcut?',
          acceptedAnswer: { '@type': 'Answer', text: 'Traverten, bazalt, kalker ve mermer olmak üzere 4 ana taş türü ve Nature, Line, Mix, Crazy olmak üzere 4 farklı kesim modeli mevcuttur. Classic, Scabas, Silver, Noche, Antico, Toros renk seçenekleri vardır.' },
        },
        {
          '@type': 'Question',
          name: 'Yurt dışına ihracat yapıyor musunuz?',
          acceptedAnswer: { '@type': 'Answer', text: 'Evet, 50\'den fazla ülkeye doğal taş ihracatı yapıyoruz. Almanya, Fransa, İspanya, İngiltere, ABD, Suudi Arabistan, BAE ve daha birçok ülkeye gönderim yapıyoruz.' },
        },
        {
          '@type': 'Question',
          name: 'AI simülasyon nasıl çalışır?',
          acceptedAnswer: { '@type': 'Answer', text: 'Binanızın veya mekanınızın fotoğrafını yükleyin, istediğiniz taş modelini seçin. Yapay zeka, taşın binaya nasıl görüneceğini fotogerçekçi olarak simüle eder. Ücretsizdir.' },
        },
        {
          '@type': 'Question',
          name: 'What is Rockshell technology?',
          acceptedAnswer: { '@type': 'Answer', text: 'Rockshell is URLASTONE\'s patented thin stone veneer technology. Natural stones are precisely cut into thin panels (1-3cm) that can be easily applied to any wall surface. Lightweight, durable, and authentic natural stone appearance.' },
        },
        {
          '@type': 'Question',
          name: 'Where to buy natural stone in İzmir?',
          acceptedAnswer: { '@type': 'Answer', text: 'URLASTONE is a leading natural stone manufacturer in İzmir, located in Urla. We offer travertine, basalt, limestone and marble with direct factory pricing. Visit our showroom or request a free quote online at urlastone.com.' },
        },
      ],
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
