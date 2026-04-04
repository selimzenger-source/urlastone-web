import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Taş Kataloğu - Traverten, Bazalt, Kalker, Mermer Detayları',
  description: 'URLASTONE taş kataloğu. Her taş türünün teknik özellikleri, renk seçenekleri ve uygulama fotoğrafları. Scabas, Silver, Noche, Toros, Antico, Carbon renkleri. Nature, Line, Mix, Crazy kesim modelleri detaylı inceleme.',
  openGraph: {
    title: 'Taş Kataloğu - Detaylı İnceleme | URLASTONE',
    description: 'Traverten, bazalt, kalker, mermer teknik detaylar ve renk seçenekleri. Urla, İzmir.',
    url: 'https://www.urlastone.com/taslar',
    images: [
      {
        url: 'https://www.urlastone.com/featured-bazalt.jpg',
        width: 1200,
        height: 630,
        alt: 'Urlastone Taş Kataloğu',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.urlastone.com/taslar',
    languages: {
      'en': 'https://www.urlastone.com/taslar?lang=en',
      'es': 'https://www.urlastone.com/taslar?lang=es',
      'de': 'https://www.urlastone.com/taslar?lang=de',
      'fr': 'https://www.urlastone.com/taslar?lang=fr',
      'ru': 'https://www.urlastone.com/taslar?lang=ru',
      'ar': 'https://www.urlastone.com/taslar?lang=ar',
      'x-default': 'https://www.urlastone.com/taslar',
    },
  },
}

export default function TaslarLayout({ children }: { children: React.ReactNode }) {
  return children
}
