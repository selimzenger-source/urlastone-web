import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ücretsiz Teklif Al - Doğal Taş Fiyat',
  description: 'Doğal taş projeniz için ücretsiz teklif alın. Rockshell, traverten, bazalt, kalker cephe kaplama, zemin döşeme, peyzaj fiyatları. Hızlı ve güvenilir teklif. URLASTONE, Urla, İzmir.',
  openGraph: {
    title: 'Ücretsiz Teklif Al | URLASTONE - Doğal Taş',
    description: 'Doğal taş projeniz için ücretsiz teklif alın. Urla, İzmir.',
    url: 'https://www.urlastone.com/teklif',
    images: [
      {
        url: 'https://www.urlastone.com/teklif-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Urlastone Ücretsiz Teklif Al',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.urlastone.com/teklif',
  },
}

export default function TeklifLayout({ children }: { children: React.ReactNode }) {
  return children
}
