import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Uygulama Alanları - Dış Cephe, İç Mekan, Şömine, Peyzaj',
  description: 'URLASTONE doğal taş uygulama alanları. Dış cephe kaplama, iç mekan duvar, şömine çevresi, havuz kenarı, bahçe peyzaj ve zemin döşeme çözümleri. Traverten, bazalt, kalker, mermer ile her mekana uygun doğal taş.',
  openGraph: {
    title: 'Uygulama Alanları - Dış Cephe, İç Mekan, Şömine | URLASTONE',
    description: 'Dış cephe kaplama, iç mekan duvar, şömine, peyzaj doğal taş uygulama alanları.',
    url: 'https://www.urlastone.com/uygulamalarimiz',
    images: [
      {
        url: 'https://www.urlastone.com/apps-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Urlastone Uygulama Alanları',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.urlastone.com/uygulamalarimiz',
  },
}

export default function UygulamalarimizLayout({ children }: { children: React.ReactNode }) {
  return children
}
