import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Teklif Al',
  description: 'Doğal taş projeniz için ücretsiz teklif alın. Cephe kaplama, zemin döşeme, peyzaj ve daha fazlası. URLASTONE - Urla, İzmir.',
  openGraph: {
    title: 'Teklif Al | URLASTONE',
    description: 'Doğal taş projeniz için ücretsiz teklif alın.',
    url: 'https://urlastone.com/teklif',
  },
  alternates: {
    canonical: 'https://urlastone.com/teklif',
  },
}

export default function TeklifLayout({ children }: { children: React.ReactNode }) {
  return children
}
