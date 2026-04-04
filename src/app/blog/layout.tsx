import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog - Doğal Taş Trendleri ve Mimari İpuçları | URLASTONE',
  description: 'URLASTONE Blog - Doğal taş dış cephe kaplama, mimari trendler, Rockshell teknolojisi, traverten, bazalt, mermer ve kalker rehberleri. SEO uyumlu güncel içerikler.',
  openGraph: {
    title: 'Blog | URLASTONE - Doğal Taş Üreticisi',
    description: 'Doğal taş sektöründe güncel trendler, mimari rehberler ve Rockshell teknolojisi hakkında bilgilendirici içerikler.',
    url: 'https://www.urlastone.com/blog',
    images: [
      {
        url: 'https://www.urlastone.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Urlastone Blog - Doğal Taş Rehberleri',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.urlastone.com/blog',
    languages: {
      'en': 'https://www.urlastone.com/blog?lang=en',
      'es': 'https://www.urlastone.com/blog?lang=es',
      'de': 'https://www.urlastone.com/blog?lang=de',
      'fr': 'https://www.urlastone.com/blog?lang=fr',
      'ru': 'https://www.urlastone.com/blog?lang=ru',
      'ar': 'https://www.urlastone.com/blog?lang=ar',
      'x-default': 'https://www.urlastone.com/blog',
    },
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
