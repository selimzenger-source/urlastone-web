import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Referanslarımız - İş Ortakları ve Projeler',
  description: 'URLASTONE referansları ve iş ortakları. Doğal taş sektöründe tamamladığımız cephe kaplama, zemin döşeme ve peyzaj projeleri. Güvenilir doğal taş tedarikçisi. Urla, İzmir.',
  openGraph: {
    title: 'Referanslarımız | URLASTONE - Doğal Taş',
    description: 'İş ortaklarımız ve tamamladığımız doğal taş projeleri.',
    url: 'https://urlastone.com/referanslarimiz',
  },
  alternates: {
    canonical: 'https://urlastone.com/referanslarimiz',
  },
}

export default function ReferanslarimizLayout({ children }: { children: React.ReactNode }) {
  return children
}
