import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/context/LanguageContext'

export const metadata: Metadata = {
  metadataBase: new URL('https://urlastone.com'),
  title: {
    default: 'URLASTONE | Doğal Taş - Urla, İzmir',
    template: '%s | URLASTONE',
  },
  description: 'Urla Doğal Taş Pazarı - Milyon yıllık doğal taşları, modern mimariye taşıyoruz. Traverten, mermer, bazalt ve kalker ile cephe kaplama, zemin döşeme ve peyzaj çözümleri. Urla, İzmir.',
  keywords: ['doğal taş', 'urla', 'izmir', 'cephe kaplama', 'traverten', 'mermer', 'bazalt', 'kalker', 'taş kaplama', 'zemin döşeme', 'natural stone', 'facade cladding', 'urlastone', 'doğal taş pazarı'],
  authors: [{ name: 'URLASTONE' }],
  creator: 'URLASTONE',
  openGraph: {
    title: 'URLASTONE | Doğal Taş - Urla, İzmir',
    description: 'Milyon yıllık doğal taşları, modern mimariye taşıyoruz. Traverten, mermer, bazalt ve kalker çözümleri.',
    url: 'https://urlastone.com',
    siteName: 'URLASTONE',
    locale: 'tr_TR',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1080,
        height: 1080,
        alt: 'URLASTONE - Doğal Taş',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'URLASTONE | Doğal Taş - Urla, İzmir',
    description: 'Milyon yıllık doğal taşları, modern mimariye taşıyoruz.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/og-image.jpg',
    apple: '/apple-touch-icon.jpg',
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://urlastone.com',
  },
  verification: {
    google: '',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
