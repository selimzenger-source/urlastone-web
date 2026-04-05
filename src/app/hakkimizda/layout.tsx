import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hakkımızda - Doğal Taş Üreticisi Urla',
  description: 'URLASTONE - Urla Doğal Taş Pazarı. 11 yıllık Daymar Stone markasıyla doğal taş üretim sektöründe. Traverten, bazalt, kalker, mermer üretimi ve ihracatı. Urla, İzmir.',
  openGraph: {
    title: 'Hakkımızda | URLASTONE - Doğal Taş Üreticisi',
    description: 'Urla Doğal Taş Pazarı - Doğal taş üretimi ve ihracatı. Urla, İzmir.',
    url: 'https://www.urlastone.com/hakkimizda',
    images: [
      {
        url: 'https://www.urlastone.com/about-story.jpg',
        width: 1200,
        height: 630,
        alt: 'Urlastone Hakkımızda',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.urlastone.com/hakkimizda',
  },
}

export default function HakkimizdaLayout({ children }: { children: React.ReactNode }) {
  return children
}
