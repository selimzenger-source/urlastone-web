import type { Metadata } from 'next'

const URL = 'https://www.urlastone.com/turkiye-dogal-tas-uygulamasi'
const TITLE = 'Türkiye Doğal Taş Uygulaması ve Cephe Kaplama | URLASTONE'
const DESC = 'Türkiye geneli doğal taş cephe kaplama uygulaması — URLASTONE fabrikamızda ürettiğimiz Rockshell ince taş panelleri İzmir bölgesinde kendi teknik ekibimizle anahtar teslim, diğer şehirlerde panel + teknik destek modeliyle uyguluyoruz. İstanbul, Ankara, Antalya, Bursa dahil tüm Türkiye için.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: [
    'türkiye doğal taş uygulaması',
    'türkiye cephe kaplama',
    'doğal taş uygulayıcı',
    'cephe taş kaplama firma',
    'türkiye taş cephe',
    'villa cephe kaplama',
    'anahtar teslim cephe kaplama',
    'türkiye doğal taş montaj',
  ],
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESC, url: URL, siteName: 'URLASTONE', type: 'website', locale: 'tr_TR' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESC },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
