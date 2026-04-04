import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Referanslarımız - İş Ortakları ve Projeler',
  description: 'URLASTONE referansları ve iş ortakları. Doğal taş sektöründe tamamladığımız cephe kaplama, zemin döşeme ve peyzaj projeleri. Güvenilir doğal taş tedarikçisi. Urla, İzmir.',
  openGraph: {
    title: 'Referanslarımız | URLASTONE - Doğal Taş',
    description: 'İş ortaklarımız ve tamamladığımız doğal taş projeleri.',
    url: 'https://www.urlastone.com/referanslarimiz',
    images: [
      {
        url: 'https://www.urlastone.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Urlastone Referansları',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.urlastone.com/referanslarimiz',
    languages: {
      'en': 'https://www.urlastone.com/referanslarimiz?lang=en',
      'es': 'https://www.urlastone.com/referanslarimiz?lang=es',
      'de': 'https://www.urlastone.com/referanslarimiz?lang=de',
      'fr': 'https://www.urlastone.com/referanslarimiz?lang=fr',
      'ru': 'https://www.urlastone.com/referanslarimiz?lang=ru',
      'ar': 'https://www.urlastone.com/referanslarimiz?lang=ar',
      'x-default': 'https://www.urlastone.com/referanslarimiz',
    },
  },
}

export default function ReferanslarimizLayout({ children }: { children: React.ReactNode }) {
  return children
}
