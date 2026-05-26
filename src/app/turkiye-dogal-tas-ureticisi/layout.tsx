import type { Metadata } from 'next'

const URL = 'https://www.urlastone.com/turkiye-dogal-tas-ureticisi'
const TITLE = 'Türkiye Doğal Taş Üreticisi ve İhracatçısı | URLASTONE'
const DESC = 'Türkiye\'nin önde gelen doğal taş üreticisi URLASTONE — İzmir Urla\'daki fabrikamızda traverten, bazalt, kalker ve mermer Rockshell ince taş paneller üretiyoruz. 500+ proje, 50+ ülkeye ihracat. İstanbul, Ankara, Antalya, Bursa dahil Türkiye genelinde 3-7 iş günü teslimat.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: [
    'türkiye doğal taş üreticisi',
    'türkiye doğal taş',
    'doğal taş üreticisi',
    'doğal taş fabrika',
    'türkiye traverten üreticisi',
    'türkiye mermer üreticisi',
    'doğal taş ihracatı',
    'türk doğal taş firması',
    'rockshell',
    'türkiye cephe kaplama doğal taş',
  ],
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESC, url: URL, siteName: 'URLASTONE', type: 'website', locale: 'tr_TR' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESC },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
