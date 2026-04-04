import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'İletişim - Doğal Taş Sipariş ve Bilgi',
  description: 'URLASTONE iletişim: Altıntaş, İzmir Çeşme Cad. No: 319, Urla/İzmir. Tel: +90 553 232 2144. Doğal taş cephe kaplama, zemin döşeme, peyzaj projeleriniz için bize ulaşın.',
  openGraph: {
    title: 'İletişim | URLASTONE - Doğal Taş',
    description: 'Doğal taş projeniz için bize ulaşın. Urla, İzmir.',
    url: 'https://www.urlastone.com/iletisim',
    images: [
      {
        url: 'https://www.urlastone.com/contact-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Urlastone İletişim',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.urlastone.com/iletisim',
    languages: {
      'en': 'https://www.urlastone.com/iletisim?lang=en',
      'es': 'https://www.urlastone.com/iletisim?lang=es',
      'de': 'https://www.urlastone.com/iletisim?lang=de',
      'fr': 'https://www.urlastone.com/iletisim?lang=fr',
      'ru': 'https://www.urlastone.com/iletisim?lang=ru',
      'ar': 'https://www.urlastone.com/iletisim?lang=ar',
      'x-default': 'https://www.urlastone.com/iletisim',
    },
  },
}

export default function IletisimLayout({ children }: { children: React.ReactNode }) {
  return children
}
