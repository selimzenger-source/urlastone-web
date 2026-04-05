import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Doğal Taş Çeşitleri - Rockshell, Traverten, Bazalt, Kalker',
  description: 'URLASTONE doğal taş ürünleri: Rockshell, traverten, bazalt, kalker, mermer. Nature, Line, Mix, Classic, Crazy ebat seçenekleri. Cephe kaplama ve zemin döşeme taşları. Scabas, Silver, Noche, Toros, Carbon modelleri. Urla, İzmir.',
  openGraph: {
    title: 'Doğal Taş Çeşitleri - Rockshell, Traverten, Bazalt, Kalker | URLASTONE',
    description: 'Rockshell, traverten, bazalt, kalker doğal taş ürünleri. Nature, Line, Mix, Classic ebatlar. Urla, İzmir.',
    url: 'https://www.urlastone.com/urunlerimiz',
    images: [
      {
        url: 'https://www.urlastone.com/featured-traverten.jpg',
        width: 1200,
        height: 630,
        alt: 'Urlastone Doğal Taş Ürünleri',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.urlastone.com/urunlerimiz',
  },
}

export default function TaslarLayout({ children }: { children: React.ReactNode }) {
  return children
}
