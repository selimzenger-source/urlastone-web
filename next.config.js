/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Eski site URL'lerini yeni sayfalara yönlendir (301 permanent)
      // Türkçe karakterli ve büyük harfli eski URL'ler
      { source: '/Hakk%C4%B1m%C4%B1zda', destination: '/hakkimizda', permanent: true },
      { source: '/%C3%9Cr%C3%BCnler', destination: '/taslar', permanent: true },
      { source: '/Line-Rockshell', destination: '/taslar', permanent: true },
      { source: '/Nature-Rockshell', destination: '/taslar', permanent: true },
      { source: '/Line-Rockshell/:slug', destination: '/taslar', permanent: true },
      { source: '/Nature-Rockshell/:slug', destination: '/taslar', permanent: true },
      { source: '/%C4%B0leti%C5%9Fim', destination: '/iletisim', permanent: true },
      { source: '/Referanslar%C4%B1m%C4%B1z', destination: '/uygulamalarimiz', permanent: true },
      // Küçük harfli versiyonlar
      { source: '/urunler', destination: '/taslar', permanent: true },
      { source: '/line-rockshell', destination: '/taslar', permanent: true },
      { source: '/nature-rockshell', destination: '/taslar', permanent: true },
      { source: '/line-rockshell/:slug', destination: '/taslar', permanent: true },
      { source: '/nature-rockshell/:slug', destination: '/taslar', permanent: true },
      { source: '/ai-simulasyon', destination: '/simulasyon', permanent: true },
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
