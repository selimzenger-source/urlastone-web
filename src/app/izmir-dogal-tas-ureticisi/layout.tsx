import type { Metadata } from 'next'

const URL = 'https://www.urlastone.com/izmir-dogal-tas-ureticisi'
const TITLE = 'İzmir Doğal Taş Üreticisi ve Uygulayıcısı | URLASTONE'
const DESC = 'İzmir Urla\'da doğal taş üreticisi ve uygulayıcısı URLASTONE. Traverten, bazalt, kalker ve mermer Rockshell ince taş panellerini fabrikamızda üretip İzmir genelinde profesyonel ekibimizle cephe, iç mekan, şömine ve peyzaj uygulamalarımızı anahtar teslim sunuyoruz. 500+ proje, 50+ ülkeye ihracat.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: [
    'izmir doğal taş üreticisi',
    'izmir doğal taş',
    'izmir cephe kaplama',
    'izmir doğal taş uygulama',
    'urla doğal taş',
    'çeşme doğal taş',
    'doğal taş üreticisi izmir',
    'rockshell',
    'traverten cephe',
    'bazalt cephe',
    'doğal taş fabrika izmir',
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
