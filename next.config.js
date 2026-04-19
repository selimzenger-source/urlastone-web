/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Eski site URL'lerini yeni sayfalara yönlendir (301 permanent)
      // Türkçe karakterli ve büyük harfli eski URL'ler
      { source: '/Hakk%C4%B1m%C4%B1zda', destination: '/hakkimizda', permanent: true },
      { source: '/%C3%9Cr%C3%BCnler', destination: '/urunlerimiz', permanent: true},
      { source: '/Line-Rockshell', destination: '/urunlerimiz', permanent: true},
      { source: '/Nature-Rockshell', destination: '/urunlerimiz', permanent: true},
      { source: '/Line-Rockshell/:slug', destination: '/urunlerimiz', permanent: true},
      { source: '/Nature-Rockshell/:slug', destination: '/urunlerimiz', permanent: true},
      { source: '/Classic-Nature-Rockshell', destination: '/urunlerimiz', permanent: true},
      { source: '/Mix-Rockshell', destination: '/urunlerimiz', permanent: true},
      { source: '/%C4%B0leti%C5%9Fim', destination: '/iletisim', permanent: true },
      { source: '/Referanslar%C4%B1m%C4%B1z', destination: '/projelerimiz', permanent: true },
      // Küçük harfli versiyonlar
      { source: '/urunler', destination: '/urunlerimiz', permanent: true},
      { source: '/line-rockshell', destination: '/urunlerimiz', permanent: true},
      { source: '/nature-rockshell', destination: '/urunlerimiz', permanent: true},
      { source: '/line-rockshell/:slug', destination: '/urunlerimiz', permanent: true},
      { source: '/nature-rockshell/:slug', destination: '/urunlerimiz', permanent: true},
      { source: '/ai-simulasyon', destination: '/simulasyon', permanent: true },
      // Eski route'ları yeni isimlere yönlendir
      { source: '/taslar', destination: '/urunlerimiz', permanent: true },
      { source: '/taslar/:slug', destination: '/urunlerimiz/:slug', permanent: true },
      { source: '/uygulamalarimiz', destination: '/projelerimiz', permanent: true },
      { source: '/uygulamalarimiz/:slug', destination: '/projelerimiz/:slug', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/:all*(jpg|jpeg|png|webp|gif|svg|ico|woff|woff2)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // api-catalog Content-Type (RFC 9727)
        source: '/.well-known/api-catalog',
        headers: [
          { key: 'Content-Type', value: 'application/linkset+json; charset=utf-8' },
        ],
      },
      {
        // Agent discovery Link headers (RFC 8288) — sitenin her sayfasinda
        source: '/:path*',
        headers: [
          {
            key: 'Link',
            value: [
              '</llms.txt>; rel="describedby"; type="text/plain"',
              '</ai/summary.json>; rel="alternate"; type="application/json"; title="AI Summary"',
              '</ai/faq.json>; rel="alternate"; type="application/json"; title="AI FAQ"',
              '</ai/service.json>; rel="alternate"; type="application/json"; title="AI Service Catalog"',
              '</feed.xml>; rel="alternate"; type="application/rss+xml"; title="URLASTONE Blog RSS"',
              '</sitemap.xml>; rel="sitemap"; type="application/xml"',
              '</.well-known/ai.txt>; rel="ai-info"',
            ].join(', '),
          },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'urlastone.com',
      },
      {
        protocol: 'https',
        hostname: 'scontent.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
      },
      {
        protocol: 'https',
        hostname: '**.replicate.delivery',
      },
    ],
  },
}

module.exports = nextConfig
