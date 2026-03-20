import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Simülasyon',
  description: 'Yapay zeka ile doğal taş simülasyonu. Projenizde taşların nasıl görüneceğini önceden görün. URLASTONE - Urla, İzmir.',
  openGraph: {
    title: 'AI Simülasyon | URLASTONE',
    description: 'Yapay zeka ile doğal taş simülasyonu.',
    url: 'https://urlastone.com/simulasyon',
  },
  alternates: {
    canonical: 'https://urlastone.com/simulasyon',
  },
}

export default function SimulasyonLayout({ children }: { children: React.ReactNode }) {
  return children
}
