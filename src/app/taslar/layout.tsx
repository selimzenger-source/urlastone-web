import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Taş Kataloğu - Traverten, Bazalt, Kalker',
  description: 'Taş kataloğu: teknik özellikler, renk seçenekleri. Scabas, Silver, Noche, Toros, Antico. Nature, Line, Mix, Crazy kesim modelleri.',
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
  },
}

export default function TaslarLayout({ children }: { children: React.ReactNode }) {
  return children
}
