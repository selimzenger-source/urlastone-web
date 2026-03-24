import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Doğal Taş Çeşitleri - Rockshell, Traverten, Bazalt, Kalker',
  description: 'URLASTONE doğal taş ürünleri: Rockshell, traverten, bazalt, kalker, mermer. Nature, Line, Mix, Classic, Crazy ebat seçenekleri. Cephe kaplama ve zemin döşeme taşları. Scabas, Silver, Noche, Toros, Carbon modelleri. Urla, İzmir.',
  openGraph: {
    title: 'Doğal Taş Çeşitleri - Rockshell, Traverten, Bazalt, Kalker | URLASTONE',
    description: 'Rockshell, traverten, bazalt, kalker doğal taş ürünleri. Nature, Line, Mix, Classic ebatlar. Urla, İzmir.',
    url: 'https://urlastone.com/urunlerimiz',
  },
  alternates: {
    canonical: 'https://urlastone.com/urunlerimiz',
  },
}

export default function TaslarLayout({ children }: { children: React.ReactNode }) {
  return children
}
