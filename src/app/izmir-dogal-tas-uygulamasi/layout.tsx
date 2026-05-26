import type { Metadata } from 'next'

const URL = 'https://www.urlastone.com/izmir-dogal-tas-uygulamasi'
const TITLE = 'İzmir Doğal Taş Uygulaması ve Cephe Kaplama | URLASTONE'
const DESC = 'İzmir\'de doğal taş cephe kaplama uygulaması yapan firma URLASTONE. Kendi ürettiğimiz Rockshell ince taş panellerini teknik ekibimizle anahtar teslim monte ediyoruz. Ölçüm, montaj, derz dolgusu ve emprenye dahil. Villa, otel, konut ve ticari projeler için İzmir genelinde uygulama hizmeti.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: [
    'izmir doğal taş uygulaması',
    'izmir cephe kaplama',
    'izmir doğal taş uygulayıcı',
    'izmir cephe taş kaplama',
    'doğal taş ustası izmir',
    'izmir taş cephe',
    'izmir villa cephe',
    'izmir doğal taş montaj',
    'anahtar teslim cephe kaplama',
    'urla cephe kaplama',
    'çeşme cephe kaplama',
  ],
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: URL,
    siteName: 'URLASTONE',
    type: 'website',
    locale: 'tr_TR',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESC,
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
