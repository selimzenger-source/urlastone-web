import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Doğal Taş Simülasyonu - Ücretsiz',
  description: 'Yapay zeka ile cephenizde doğal taş simülasyonu. Fotoğrafınızı yükleyin, taşın nasıl görüneceğini görün. Rockshell, traverten, bazalt. Ücretsiz.',
  openGraph: {
    title: 'AI Doğal Taş Simülasyonu | URLASTONE',
    description: 'Yapay zeka ile cephenizde doğal taşı önceden görün. Ücretsiz simülasyon.',
    url: 'https://www.urlastone.com/simulasyon',
    images: [
      {
        url: 'https://www.urlastone.com/sim-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Urlastone AI Doğal Taş Simülasyonu',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.urlastone.com/simulasyon',
  },
}

export default function SimulasyonLayout({ children }: { children: React.ReactNode }) {
  return children
}
