import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Doğal Taş Simülasyonu - Cephenizde Taş Görün',
  description: 'Yapay zeka ile doğal taş simülasyonu. Evinizin veya projenizin cephesinde rockshell, traverten, bazalt, kalker taşların nasıl görüneceğini önceden görün. Ücretsiz AI simülasyon. URLASTONE, Urla, İzmir.',
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
    languages: {
      'en': 'https://www.urlastone.com/simulasyon?lang=en',
      'es': 'https://www.urlastone.com/simulasyon?lang=es',
      'de': 'https://www.urlastone.com/simulasyon?lang=de',
      'fr': 'https://www.urlastone.com/simulasyon?lang=fr',
      'ru': 'https://www.urlastone.com/simulasyon?lang=ru',
      'ar': 'https://www.urlastone.com/simulasyon?lang=ar',
      'x-default': 'https://www.urlastone.com/simulasyon',
    },
  },
}

export default function SimulasyonLayout({ children }: { children: React.ReactNode }) {
  return children
}
