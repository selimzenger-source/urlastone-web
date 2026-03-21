import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Referanslarımız',
  description: 'URLASTONE - Güvenilir iş ortaklarımız ve tamamladığımız projeler. Doğal taş sektöründe yılların deneyimi.',
  openGraph: {
    title: 'Referanslarımız | URLASTONE',
    description: 'Güvenilir iş ortaklarımız ve tamamladığımız projeler.',
    url: 'https://urlastone.com/referanslarimiz',
  },
  alternates: {
    canonical: 'https://urlastone.com/referanslarimiz',
  },
}

export default function ReferanslarimizLayout({ children }: { children: React.ReactNode }) {
  return children
}
