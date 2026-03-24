import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'İletişim - Doğal Taş Sipariş ve Bilgi',
  description: 'URLASTONE iletişim: Altıntaş, İzmir Çeşme Cad. No: 319, Urla/İzmir. Tel: +90 553 232 2144. Doğal taş cephe kaplama, zemin döşeme, peyzaj projeleriniz için bize ulaşın.',
  openGraph: {
    title: 'İletişim | URLASTONE - Doğal Taş',
    description: 'Doğal taş projeniz için bize ulaşın. Urla, İzmir.',
    url: 'https://www.urlastone.com/iletisim',
  },
  alternates: {
    canonical: 'https://www.urlastone.com/iletisim',
  },
}

export default function IletisimLayout({ children }: { children: React.ReactNode }) {
  return children
}
