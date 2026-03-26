import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog - Doğal Taş Trendleri ve Mimari İpuçları | URLASTONE',
  description: 'URLASTONE Blog - Doğal taş dış cephe kaplama, mimari trendler, Rockshell teknolojisi, traverten, bazalt, mermer ve kalker rehberleri. SEO uyumlu güncel içerikler.',
  openGraph: {
    title: 'Blog | URLASTONE - Doğal Taş Üreticisi',
    description: 'Doğal taş sektöründe güncel trendler, mimari rehberler ve Rockshell teknolojisi hakkında bilgilendirici içerikler.',
    url: 'https://www.urlastone.com/blog',
  },
  alternates: {
    canonical: 'https://www.urlastone.com/blog',
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
