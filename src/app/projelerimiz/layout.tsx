import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projelerimiz - Doğal Taş Cephe Kaplama Referansları',
  description: 'URLASTONE tamamlanmış doğal taş projeleri. Villa, otel, rezidans dış cephe kaplama, iç mekan duvar ve peyzaj uygulamaları. İzmir, İstanbul, Ankara, Bodrum, Çeşme ve yurt dışı referanslar. Harita üzerinde 500+ proje.',
  openGraph: {
    title: 'Projelerimiz - Doğal Taş Referansları | URLASTONE',
    description: 'Villa, otel, rezidans doğal taş cephe kaplama projeleri. 500+ tamamlanmış proje.',
    url: 'https://www.urlastone.com/projelerimiz',
    images: [
      {
        url: 'https://www.urlastone.com/slide-1.jpg',
        width: 1200,
        height: 630,
        alt: 'Urlastone Projeleri',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.urlastone.com/projelerimiz',
    languages: {
      'en': 'https://www.urlastone.com/projelerimiz?lang=en',
      'es': 'https://www.urlastone.com/projelerimiz?lang=es',
      'de': 'https://www.urlastone.com/projelerimiz?lang=de',
      'fr': 'https://www.urlastone.com/projelerimiz?lang=fr',
      'ru': 'https://www.urlastone.com/projelerimiz?lang=ru',
      'ar': 'https://www.urlastone.com/projelerimiz?lang=ar',
      'x-default': 'https://www.urlastone.com/projelerimiz',
    },
  },
}

export default function ProjelerimizLayout({ children }: { children: React.ReactNode }) {
  return children
}
