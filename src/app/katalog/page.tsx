import type { Metadata } from 'next'
import KatalogViewer from './KatalogViewer'

export const metadata: Metadata = {
  title: 'Katalog — Doğal Taş Koleksiyonu | URLA STONE',
  description: 'URLA STONE doğal taş kataloğu. Tüm serileri sayfa sayfa inceleyin veya PDF olarak indirin.',
  alternates: { canonical: 'https://urlastone.com/katalog' },
  openGraph: {
    title: 'URLA STONE Katalog — Doğal Taş Koleksiyonu',
    description: 'Tüm doğal taş serileri, sayfa sayfa. İnceleyin veya PDF indirin.',
    url: 'https://urlastone.com/katalog',
    images: ['https://urlastone.com/katalog/pages/p01.webp'],
    type: 'website',
  },
}

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Anasayfa', item: 'https://urlastone.com/' },
    { '@type': 'ListItem', position: 2, name: 'Katalog', item: 'https://urlastone.com/katalog' },
  ],
}

export default function KatalogPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <KatalogViewer />
    </>
  )
}
