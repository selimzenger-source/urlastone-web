import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Uygulama Alanları - Cephe, İç Mekan, Şömine',
  description: 'Doğal taş uygulama alanları: dış cephe, iç mekan duvar, şömine, havuz kenarı, peyzaj, zemin. Traverten, bazalt, kalker, mermer.',
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
