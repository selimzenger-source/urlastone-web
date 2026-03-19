import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'URLASTONE | Doğal Taş - Urla, İzmir',
  description: 'Urla Doğal Taş Pazarı - Milyon yıllık doğal taşları, modern mimariye taşıyoruz. Cephe kaplama, zemin döşeme ve peyzaj çözümleri.',
  keywords: 'doğal taş, urla, izmir, cephe kaplama, traverten, mermer, bazalt, granit, taş kaplama',
  openGraph: {
    title: 'URLASTONE | Doğal Taş',
    description: 'Milyon yıllık doğal taşları, modern mimariye taşıyoruz.',
    url: 'https://urlastone.com',
    siteName: 'URLASTONE',
    locale: 'tr_TR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}
