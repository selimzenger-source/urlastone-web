import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Doğal Taş Çeşitleri',
  description: 'Traverten, mermer, bazalt ve kalker doğal taş ürünlerimizi keşfedin. Nature, Mix, Crazy ve Line ebat kategorilerinde yüzlerce ürün. Urla, İzmir.',
  openGraph: {
    title: 'Doğal Taş Çeşitleri | URLASTONE',
    description: 'Traverten, mermer, bazalt ve kalker doğal taş ürünlerimizi keşfedin.',
    url: 'https://urlastone.com/taslar',
  },
  alternates: {
    canonical: 'https://urlastone.com/taslar',
  },
}

export default function TaslarLayout({ children }: { children: React.ReactNode }) {
  return children
}
