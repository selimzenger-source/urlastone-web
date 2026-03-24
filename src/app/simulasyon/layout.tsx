import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Doğal Taş Simülasyonu - Cephenizde Taş Görün',
  description: 'Yapay zeka ile doğal taş simülasyonu. Evinizin veya projenizin cephesinde rockshell, traverten, bazalt, kalker taşların nasıl görüneceğini önceden görün. Ücretsiz AI simülasyon. URLASTONE, Urla, İzmir.',
  openGraph: {
    title: 'AI Doğal Taş Simülasyonu | URLASTONE',
    description: 'Yapay zeka ile cephenizde doğal taşı önceden görün. Ücretsiz simülasyon.',
    url: 'https://www.urlastone.com/simulasyon',
  },
  alternates: {
    canonical: 'https://www.urlastone.com/simulasyon',
  },
}

export default function SimulasyonLayout({ children }: { children: React.ReactNode }) {
  return children
}
