import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'İletişim',
  description: 'URLASTONE ile iletişime geçin. Altıntaş, İzmir Çeşme Cad. No: 319, Urla/İzmir. Tel: +90 553 232 2144. Doğal taş projeniz için bize ulaşın.',
  openGraph: {
    title: 'İletişim | URLASTONE',
    description: 'Doğal taş projeniz için bize ulaşın. Urla, İzmir.',
    url: 'https://urlastone.com/iletisim',
  },
  alternates: {
    canonical: 'https://urlastone.com/iletisim',
  },
}

export default function IletisimLayout({ children }: { children: React.ReactNode }) {
  return children
}
