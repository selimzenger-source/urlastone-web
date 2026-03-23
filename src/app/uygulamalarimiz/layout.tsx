import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Doğal Taş Uygulamalarımız - Cephe Kaplama, Zemin Döşeme',
  description: 'URLASTONE doğal taş uygulama projeleri. Dış cephe taş kaplama, zemin döşeme, havuz kenarı, bahçe peyzaj taşı, merdiven basamak uygulamaları. Rockshell, traverten, bazalt projeler. Urla, İzmir.',
  openGraph: {
    title: 'Doğal Taş Uygulamalarımız | URLASTONE',
    description: 'Cephe kaplama, zemin döşeme, peyzaj doğal taş projeleri. Urla, İzmir.',
    url: 'https://urlastone.com/uygulamalarimiz',
  },
  alternates: {
    canonical: 'https://urlastone.com/uygulamalarimiz',
  },
}

export default function UygulamalarimizLayout({ children }: { children: React.ReactNode }) {
  return children
}
