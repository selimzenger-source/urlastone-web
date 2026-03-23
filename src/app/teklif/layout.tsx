import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ücretsiz Teklif Al - Doğal Taş Fiyat',
  description: 'Doğal taş projeniz için ücretsiz teklif alın. Rockshell, traverten, bazalt, kalker cephe kaplama, zemin döşeme, peyzaj fiyatları. Hızlı ve güvenilir teklif. URLASTONE, Urla, İzmir.',
  openGraph: {
    title: 'Ücretsiz Teklif Al | URLASTONE - Doğal Taş',
    description: 'Doğal taş projeniz için ücretsiz teklif alın. Urla, İzmir.',
    url: 'https://urlastone.com/teklif',
  },
  alternates: {
    canonical: 'https://urlastone.com/teklif',
  },
}

export default function TeklifLayout({ children }: { children: React.ReactNode }) {
  return children
}
