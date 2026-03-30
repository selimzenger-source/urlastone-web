import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Taş Kataloğu - Traverten, Bazalt, Kalker, Mermer Detayları',
  description: 'URLASTONE taş kataloğu. Her taş türünün teknik özellikleri, renk seçenekleri ve uygulama fotoğrafları. Scabas, Silver, Noche, Toros, Antico, Carbon renkleri. Nature, Line, Mix, Crazy kesim modelleri detaylı inceleme.',
  openGraph: {
    title: 'Taş Kataloğu - Detaylı İnceleme | URLASTONE',
    description: 'Traverten, bazalt, kalker, mermer teknik detaylar ve renk seçenekleri. Urla, İzmir.',
    url: 'https://www.urlastone.com/taslar',
  },
  alternates: {
    canonical: 'https://www.urlastone.com/taslar',
  },
}

export default function TaslarLayout({ children }: { children: React.ReactNode }) {
  return children
}
