import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Doğal Taş Çeşitleri - Traverten, Bazalt, Kalker',
  description: 'Doğal taş: Rockshell, traverten, bazalt, kalker, mermer. Nature, Line, Mix, Crazy ebatlar. Cephe ve zemin döşeme. Scabas, Silver, Noche renkler.',
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
