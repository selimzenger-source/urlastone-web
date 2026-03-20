import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Uygulamalarımız',
  description: 'URLASTONE doğal taş uygulama projelerimizi inceleyin. Cephe kaplama, zemin döşeme, havuz kenarı ve peyzaj projeleri. Urla, İzmir.',
  openGraph: {
    title: 'Uygulamalarımız | URLASTONE',
    description: 'Doğal taş uygulama projelerimizi inceleyin.',
    url: 'https://urlastone.com/uygulamalarimiz',
  },
  alternates: {
    canonical: 'https://urlastone.com/uygulamalarimiz',
  },
}

export default function UygulamalarimizLayout({ children }: { children: React.ReactNode }) {
  return children
}
