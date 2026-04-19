import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/context/LanguageContext'
// PWA Install Prompt kaldirildi - mobilde gereksiz cikiyordu
// import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import HreflangTags from '@/components/HreflangTags'
import ChatWidget from '@/components/ChatWidget'
// Script import removed — using plain <script> for JSON-LD (afterInteractive delays structured data for bots)
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.urlastone.com'),
  title: {
    // 58 chars — Google SERP uyumlu
    default: 'URLASTONE | Doğal Taş Üreticisi İzmir Urla | Rockshell',
    // Alt sayfa basligi max ~55 char olmali, sonuna kisa marka eklenir (toplam ~60)
    template: '%s | URLASTONE',
  },
  // 155 chars — Google meta description uyumlu, anahtar kelimeler + CTA
  description: 'İzmir Urla\'dan doğal taş üreticisi. Traverten, bazalt, kalker, mermer cephe kaplama. Rockshell ince panel + AI simülasyon. 50+ ülkeye ihracat.',
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
    title: 'URLASTONE | Doğal Taş Üreticisi İzmir - Rockshell',
    description: 'Traverten, bazalt, kalker, mermer doğal taş cephe kaplama. Rockshell ince panel teknolojisi + AI simülasyon. 50+ ülkeye ihracat.',
    url: 'https://www.urlastone.com',
    siteName: 'URLASTONE',
    locale: 'tr_TR',
    type: 'website',
    images: [
      {
        url: 'https://www.urlastone.com/og-image.jpg',
        width: 1200,
        height: 630,
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
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
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
    canonical: 'https://www.urlastone.com',
  },
  verification: {
    google: 'google3f6fffccc6484188',
    yandex: 'e14c6016e881bc8b',
  },
  other: {
    'msvalidate.01': 'BBF3A8F51F0E48A60E4666D80C0D4603',
  },
}

// Build zamanini ISO tarih olarak al — dateModified icin kullanilir
const BUILD_DATE = new Date().toISOString()

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    // ══ Organization / Business ══
    {
      '@type': ['LocalBusiness', 'Organization', 'Store'],
      '@id': 'https://www.urlastone.com/#business',
      name: 'URLASTONE',
      dateModified: BUILD_DATE,
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
      sameAs: [
        'https://www.instagram.com/urlastone/',
        'https://www.linkedin.com/company/urlastone/',
        'https://www.facebook.com/urlastone/',
      ],
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
      dateModified: BUILD_DATE,
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
      image: ['https://www.urlastone.com/featured-traverten.jpg', 'https://www.urlastone.com/og-image.jpg'],
      aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '24', bestRating: '5' },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: 35,
        highPrice: 120,
        offerCount: 12,
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'URLASTONE', url: 'https://www.urlastone.com' },
      },
    },
    {
      '@type': 'Product',
      name: 'Line Rockshell - Modern Taş Kaplama',
      description: 'Thin horizontal stone strips for modern minimalist facades. Linear pattern, 1-2cm thick. Clean contemporary design.',
      brand: { '@type': 'Brand', name: 'URLASTONE' },
      manufacturer: { '@id': 'https://www.urlastone.com/#business' },
      category: 'Natural Stone Cladding',
      material: 'Natural Stone',
      image: ['https://www.urlastone.com/featured-bazalt.jpg', 'https://www.urlastone.com/og-image.jpg'],
      aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.7', reviewCount: '18', bestRating: '5' },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: 40,
        highPrice: 130,
        offerCount: 8,
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'URLASTONE', url: 'https://www.urlastone.com' },
      },
    },
    {
      '@type': 'Product',
      name: 'Mix Rockshell - Karışık Taş Kaplama',
      description: 'Combination of horizontal strips and irregular pieces. Versatile natural stone veneer for facades and interiors. 1.5-3cm thick.',
      brand: { '@type': 'Brand', name: 'URLASTONE' },
      manufacturer: { '@id': 'https://www.urlastone.com/#business' },
      category: 'Natural Stone Cladding',
      material: 'Natural Stone',
      image: ['https://www.urlastone.com/featured-kalker.jpg', 'https://www.urlastone.com/og-image.jpg'],
      aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '21', bestRating: '5' },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: 35,
        highPrice: 110,
        offerCount: 10,
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'URLASTONE', url: 'https://www.urlastone.com' },
      },
    },
    {
      '@type': 'Product',
      name: 'Crazy Rockshell - Mozaik Taş Kaplama',
      description: 'Dense mosaic of small irregular stone pieces. Artistic cobblestone-like appearance. 1.5-2.5cm thick.',
      brand: { '@type': 'Brand', name: 'URLASTONE' },
      manufacturer: { '@id': 'https://www.urlastone.com/#business' },
      category: 'Natural Stone Cladding',
      material: 'Natural Stone',
      image: ['https://www.urlastone.com/featured-mermer.jpg', 'https://www.urlastone.com/og-image.jpg'],
      aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.6', reviewCount: '15', bestRating: '5' },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: 30,
        highPrice: 100,
        offerCount: 6,
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'URLASTONE', url: 'https://www.urlastone.com' },
      },
    },
    // ══ BreadcrumbList ══
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://www.urlastone.com' },
        { '@type': 'ListItem', position: 2, name: 'Ürünlerimiz', item: 'https://www.urlastone.com/urunlerimiz' },
        { '@type': 'ListItem', position: 3, name: 'Projelerimiz', item: 'https://www.urlastone.com/projelerimiz' },
        { '@type': 'ListItem', position: 4, name: 'Blog', item: 'https://www.urlastone.com/blog' },
        { '@type': 'ListItem', position: 5, name: 'Teklif Al', item: 'https://www.urlastone.com/teklif' },
        { '@type': 'ListItem', position: 6, name: 'İletişim', item: 'https://www.urlastone.com/iletisim' },
      ],
    },
    // ══ FAQ ══
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'URLASTONE nerede? Doğal taş nereden alınır?',
          acceptedAnswer: { '@type': 'Answer', text: 'URLASTONE, İzmir Urla\'da bulunan doğal taş üretim tesisindedir. Adres: Altıntaş, İzmir Çeşme Cad. No: 319, Urla, İzmir 35430. Showroom ziyareti için randevu alabilirsiniz. 2015\'ten bu yana 500+ projede kullanılmıştır.' },
        },
        {
          '@type': 'Question',
          name: 'Hangi taş türleri mevcut?',
          acceptedAnswer: { '@type': 'Answer', text: 'Traverten, bazalt, kalker ve mermer olmak üzere 4 ana taş türü ve Nature, Line, Mix, Crazy olmak üzere 4 farklı kesim modeli mevcuttur. Classic, Scabas, Silver, Noche, Antico, Toros renk seçenekleri vardır. Toplam 100+ kombinasyon sunulur.' },
        },
        {
          '@type': 'Question',
          name: 'Yurt dışına ihracat yapıyor musunuz?',
          acceptedAnswer: { '@type': 'Answer', text: 'Evet, 50\'den fazla ülkeye doğal taş ihracatı yapıyoruz. Almanya, Fransa, İspanya, İngiltere, ABD, Suudi Arabistan, BAE, Rusya, İtalya, Yunanistan ve Hollanda başlıca pazarlarımızdır. Konteyner sevkiyatı ve gümrük desteği sağlıyoruz.' },
        },
        {
          '@type': 'Question',
          name: 'AI simülasyon nasıl çalışır?',
          acceptedAnswer: { '@type': 'Answer', text: 'Binanızın veya mekanınızın fotoğrafını yükleyin, istediğiniz taş modelini seçin. Yapay zeka (Google Gemini + Replicate nano-banana-pro), taşın binaya nasıl görüneceğini fotogerçekçi olarak simüle eder. Ücretsizdir, günlük 10 simülasyon hakkınız vardır.' },
        },
        {
          '@type': 'Question',
          name: 'What is Rockshell technology?',
          acceptedAnswer: { '@type': 'Answer', text: 'Rockshell is URLASTONE\'s patented thin stone veneer technology. Natural stones are precisely cut into thin panels (1-3cm) that can be easily applied to any wall surface without structural modifications. Lightweight (15-30 kg/m²), durable, and authentic natural stone appearance. Available in grouted (derzli) or groutless (derzsiz) installation.' },
        },
        {
          '@type': 'Question',
          name: 'Where to buy natural stone in İzmir?',
          acceptedAnswer: { '@type': 'Answer', text: 'URLASTONE is a leading natural stone manufacturer in İzmir, located in Urla. Founded 2015 under Daymar Stone heritage. We offer travertine, basalt, limestone and marble with direct factory pricing ($30-$130/m²). Visit our showroom or request a free quote online at urlastone.com/teklif.' },
        },
        {
          '@type': 'Question',
          name: 'Doğal taş kaplama m² fiyatı ne kadar?',
          acceptedAnswer: { '@type': 'Answer', text: 'Doğal taş kaplama fiyatları m² başına $30-$130 USD arasında değişir. Taş türüne (traverten, bazalt, kalker, mermer), kesim modeline (Nature, Line, Mix, Crazy) ve kalınlığa (1-3cm) göre fiyat belirlenir. Ücretsiz teklif için urlastone.com/teklif sayfasını kullanın.' },
        },
        {
          '@type': 'Question',
          name: 'Traverten mi mermer mi daha iyi?',
          acceptedAnswer: { '@type': 'Answer', text: 'Seçim uygulama alanına bağlıdır. Traverten sıcak krem-bej tonlarıyla villa ve otel dış cephelerde tercih edilir, doğal gözenekli dokuya sahiptir. Mermer beyaz-krem damarlı yapısıyla iç mekan ve lüks mekanlarda kullanılır. Traverten genellikle daha ekonomik, mermer daha prestijli bir görünüm sunar.' },
        },
        {
          '@type': 'Question',
          name: 'Dış cephe taş kaplama kaç yıl dayanır?',
          acceptedAnswer: { '@type': 'Answer', text: 'Doğal taş dış cephe kaplama, doğru uygulandığında 50+ yıl dayanır. Rockshell ince taş veneer teknolojisi geleneksel taşa göre daha hafif (15-30 kg/m²) ve montajı daha kolaydır. Bazalt en dayanıklı, traverten ve kalker orta dayanıklılık, mermer estetik olarak en seçkin seçenektir.' },
        },
        {
          '@type': 'Question',
          name: 'Şömine için hangi taş uygundur?',
          acceptedAnswer: { '@type': 'Answer', text: 'Şömine kaplama için ısıya dayanıklı bazalt (volkanik), sıcak görünümlü traverten veya doğal fosilli kalker tercih edilir. URLASTONE\'un Nature Rockshell modeli (1.5-3cm) şömine kaplaması için en popüler üründür. Mermer de iç mekan şömineleri için estetik bir seçenek.' },
        },
        {
          '@type': 'Question',
          name: 'Havuz kenarına hangi taş kullanılır?',
          acceptedAnswer: { '@type': 'Answer', text: 'Havuz kenarı için kaydırmaz yüzeyli traverten veya kalker önerilir. Bu taşlar suya dayanıklıdır, ısıyı tutmaz ve güneş altında ısınıp cildi yakmaz. URLASTONE\'un Crazy Rockshell mozaik deseni havuz deck uygulamaları için idealdir.' },
        },
        {
          '@type': 'Question',
          name: 'Derzli mi derzsiz mi kaplama daha iyi?',
          acceptedAnswer: { '@type': 'Answer', text: 'Derzli uygulama geleneksel görünüm ve esneklik sunar, uygulama hataları toleranslıdır. Derzsiz (fayans gibi) daha modern, minimalist ve temizlemesi kolaydır ama hassas montaj gerektirir. URLASTONE tüm modellerini her iki stil ile sunar — AI simülasyonda ikisini de önizleyebilirsiniz.' },
        },
        {
          '@type': 'Question',
          name: 'Rockshell kalınlığı nedir?',
          acceptedAnswer: { '@type': 'Answer', text: 'URLASTONE Rockshell panelleri 1cm ile 3cm arasında kalınlıklarda üretilir. Line Rockshell: 1-2cm (modern minimalist), Nature Rockshell: 1.5-3cm (doğal), Mix Rockshell: 1.5-3cm (çok yönlü), Crazy Rockshell: 1.5-2.5cm (mozaik). Proje isteğine göre özel kesim yapılabilir.' },
        },
        {
          '@type': 'Question',
          name: 'URLASTONE kaç dil destekliyor?',
          acceptedAnswer: { '@type': 'Answer', text: 'URLASTONE web sitesi ve müşteri desteği 7 dilde hizmet verir: Türkçe, İngilizce, İspanyolca, Almanca, Fransızca, Rusça ve Arapça. 50+ ülkeye ihracat yapan uluslararası bir üretici olarak çok dilli destek standarttır.' },
        },
        {
          '@type': 'Question',
          name: 'Kaç proje tamamladınız?',
          acceptedAnswer: { '@type': 'Answer', text: 'URLASTONE 2015\'ten bu yana (Daymar Stone mirası ile 11+ yıl) 500\'den fazla projede görev almıştır. Villa, otel, apartman, ticari bina, restoran, AVM, konut ve peyzaj projeleri arasında Türkiye ve 50+ ülke vardır. Referans projeler urlastone.com/projelerimiz sayfasında görülebilir.' },
        },
        {
          '@type': 'Question',
          name: 'Anahtar teslim uygulama yapıyor musunuz?',
          acceptedAnswer: { '@type': 'Answer', text: 'Evet, İzmir, Çeşme, Urla, Alaçatı ve çevresinde anahtar teslim doğal taş kaplama uygulaması sunuyoruz. Türkiye genelinde partner montaj ekiplerimiz bulunur. Alternatif olarak sadece taş satışı (stone-only) seçeneği ile kendi ekibinizle de çalışabilirsiniz.' },
        },
        {
          '@type': 'Question',
          name: 'What natural stone is best for modern facades?',
          acceptedAnswer: { '@type': 'Answer', text: 'For modern facades, basalt (dark charcoal grey) and limestone (sandy beige) are most popular. URLASTONE\'s Line Rockshell (thin horizontal strips, 1-2cm) creates contemporary minimalist aesthetics. Nature Rockshell with irregular polygonal stones works for rustic-modern hybrid designs. Free AI simulation available at urlastone.com/simulasyon.' },
        },
        {
          '@type': 'Question',
          name: 'Which Turkish natural stone is most exported?',
          acceptedAnswer: { '@type': 'Answer', text: 'Turkish travertine from Denizli is the most exported natural stone worldwide, with warm cream, ivory and honey tones prized for luxury facades and interiors. URLASTONE exports travertine, basalt (Anatolian volcanic), limestone and marble to 50+ countries including Germany, France, USA, UAE, Saudi Arabia.' },
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
        <link rel="alternate" type="application/rss+xml" title="URLASTONE Blog RSS" href="https://www.urlastone.com/feed.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <LanguageProvider>
          <HreflangTags />
          {children}
          <ChatWidget />
          <Analytics />
        </LanguageProvider>
      </body>
    </html>
  )
}
