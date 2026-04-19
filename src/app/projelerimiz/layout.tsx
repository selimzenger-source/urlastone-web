import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projelerimiz - Doğal Taş Cephe Referansları',
  description: '500+ tamamlanmış doğal taş projesi. Villa, otel, rezidans cephe kaplama + iç mekan. İzmir, İstanbul, Bodrum, Çeşme ve yurt dışı.',
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
  },
}

export default function ProjelerimizLayout({ children }: { children: React.ReactNode }) {
  return children
}
