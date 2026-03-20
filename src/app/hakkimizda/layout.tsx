import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hakkımızda',
  description: 'URLASTONE - Urla Doğal Taş Pazarı. Milyon yıllık doğal taşları modern mimariye taşıyan güvenilir çözüm ortağınız. Urla, İzmir.',
  openGraph: {
    title: 'Hakkımızda | URLASTONE',
    description: 'Urla Doğal Taş Pazarı - Güvenilir çözüm ortağınız.',
    url: 'https://urlastone.com/hakkimizda',
  },
  alternates: {
    canonical: 'https://urlastone.com/hakkimizda',
  },
}

export default function HakkimizdaLayout({ children }: { children: React.ReactNode }) {
  return children
}
