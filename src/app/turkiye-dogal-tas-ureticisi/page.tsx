import Link from 'next/link'
import { ArrowRight, MapPin, Phone, Mail, Factory, Truck, ShieldCheck, Award, Building2, Globe2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const URL = 'https://www.urlastone.com/turkiye-dogal-tas-ureticisi'

const CITIES = [
  'İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa', 'Adana', 'Konya', 'Gaziantep',
  'Kayseri', 'Mersin', 'Eskişehir', 'Samsun', 'Trabzon', 'Sakarya', 'Kocaeli',
  'Tekirdağ', 'Manisa', 'Muğla', 'Aydın', 'Denizli', 'Balıkesir', 'Çanakkale',
  'Hatay', 'Şanlıurfa', 'Diyarbakır', 'Yalova',
]

const EXPORT_COUNTRIES = [
  'Almanya', 'Fransa', 'İspanya', 'İngiltere', 'ABD', 'Suudi Arabistan',
  'BAE', 'Rusya', 'İtalya', 'Yunanistan', 'Hollanda', 'Avusturya',
  'Belçika', 'İsviçre', 'Norveç', 'Danimarka', 'İsveç', 'Kuveyt',
  'Katar', 'İsrail', 'Ukrayna', 'Polonya',
]

const STONES = [
  { name: 'Traverten', img: '/featured-traverten.jpg', desc: 'Denizli\'den çıkarılan, dünya pazarında "Turkish Travertine" olarak tanınan premium taş. Krem, fildişi, bal tonları.' },
  { name: 'Bazalt', img: '/featured-bazalt.jpg', desc: 'Anadolu volkanik kayasından üretilen koyu antrasit bazalt. En dayanıklı doğal taş — donma-çözülmeye en güçlü.' },
  { name: 'Kalker', img: '/featured-kalker.jpg', desc: 'Burdur, Antalya ve Adıyaman ocaklarından çıkarılan yumuşak bej kalker. Akdeniz tarzı için ideal.' },
  { name: 'Mermer', img: '/featured-mermer.jpg', desc: 'Afyon ve Muğla ocaklarından premium beyaz/krem mermer. Lüks projelerin tartışmasız tercihi.' },
]

const PROJECT_PHOTOS = [
  { src: '/slide-1.jpg', alt: 'URLASTONE doğal taş cephe kaplama villa projesi' },
  { src: '/slide-3.jpg', alt: 'Doğal taş dış cephe uygulaması — Türkiye projesi' },
  { src: '/slide-5.jpg', alt: 'Traverten cephe kaplama lüks konut projesi' },
  { src: '/slide-6.jpg', alt: 'URLASTONE Rockshell panel uygulanmış bina cephesi' },
]

const EXPLORE_LINKS = [
  { href: '/', title: 'Ana Sayfa', desc: 'URLASTONE dünyasını keşfedin' },
  { href: '/urunlerimiz', title: 'Ürünlerimiz', desc: 'Tüm taş türleri, desenler ve renkler' },
  { href: '/projelerimiz', title: 'Projelerimiz', desc: '500+ proje harita üzerinde' },
  { href: '/referanslarimiz', title: 'Referanslarımız', desc: 'Otel, villa ve kurumsal referanslar' },
  { href: '/blog', title: 'Blog', desc: 'Doğal taş rehberleri ve karşılaştırmalar' },
  { href: '/iletisim', title: 'İletişim', desc: 'Showroom, telefon ve WhatsApp' },
]

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: 'URLASTONE Türkiye\'nin neresinde üretim yapıyor?',
    a: 'URLASTONE üretim tesisimiz İzmir Urla\'da bulunmaktadır (Altıntaş, İzmir Çeşme Cad. No: 319, Urla, İzmir 35430). Tüm Rockshell doğal taş panel üretimi burada yapılır; Türkiye geneline ve 50+ ülkeye buradan sevkiyat yapılır.',
  },
  {
    q: 'Türkiye\'nin hangi şehirlerine teslimat yapıyorsunuz?',
    a: 'Türkiye\'nin 81 iline sevkiyat yapıyoruz. İstanbul, Ankara, İzmir, Antalya, Bursa, Adana, Konya, Gaziantep, Kayseri, Mersin başta olmak üzere büyük şehirlere 3-5 iş günü, diğer şehirlere 5-7 iş günü içinde EPAL paletli teslimat sağlıyoruz.',
  },
  {
    q: 'Hangi ocaklardan taş tedarik ediyorsunuz?',
    a: 'Türkiye\'nin en önemli doğal taş ocaklarıyla çalışıyoruz: Traverten için Denizli (Honaz, Çakıroğlu), bazalt için Anadolu (Diyarbakır, Şanlıurfa, Kayseri), kalker için Burdur-Antalya-Adıyaman, mermer için Afyon-Muğla-Bilecik. Tedarik zincirimiz tamamen yerli ve şeffaftır.',
  },
  {
    q: 'Türkiye dışına ihracat yapıyor musunuz?',
    a: 'Evet. URLASTONE 50+ ülkeye doğal taş ihracatı yapan tam yetkilendirilmiş bir ihracatçıdır. Başlıca pazarlarımız: Almanya, Fransa, İspanya, İngiltere, ABD, Suudi Arabistan, BAE, Rusya, İtalya, Yunanistan, Hollanda. Konteyner sevkiyatı, gümrük dokümantasyonu ve uluslararası lojistik desteği sağlıyoruz.',
  },
  {
    q: 'Türkiye doğal taş fiyatları ne kadar?',
    a: 'Rockshell doğal taş panellerin m² fiyatı taş türüne ve desene göre $30-$130 USD aralığındadır. Fabrika çıkışı + EPAL paletli ambalaj + Türkiye geneli teslimat dahildir. Anahtar teslim uygulama (İzmir bölgesinde) ek olarak hesaplanır.',
  },
  {
    q: 'Mimari ofislerle ve müteahhitlerle iş birliği yapıyor musunuz?',
    a: 'Evet. Türkiye genelindeki mimari ofisler ve müteahhit firmalarla düzenli iş birliğimiz var. Proje bazlı özel kesim, CAD dosyaları, mockup, montaj eğitimi ve teknik destek sağlıyoruz. B2B iş birliği için info@urlastone.com adresinden iletişime geçebilirsiniz.',
  },
  {
    q: 'Sertifika ve teknik dokümantasyon veriyor musunuz?',
    a: 'Evet. Her ürün için kesim spesifikasyonu, ağırlık hesabı (15-30 kg/m²), donma-çözünme dayanımı (TS EN 12371), su emme oranı, eğilme dayanımı ve montaj kılavuzu içeren teknik döküman sağlıyoruz. ISO uyumlu üretim standartları ve uluslararası sevkiyat sertifikaları hazırdır.',
  },
  {
    q: 'Rockshell teknolojisi nedir?',
    a: 'Rockshell, URLASTONE\'un patentli ince doğal taş kaplama panel teknolojisidir. Klasik 5-10 cm doğal taşın aksine 1-3 cm kalınlığa indirilerek metrekare ağırlığı 100-150 kg yerine 15-30 kg\'a düşürülür. Bu sayede hem yeni binalarda hem eski cephelerin yenilenmesinde yapıya ek yük bindirmeden güvenle kullanılır.',
  },
  {
    q: 'AI taş simülasyonu nedir?',
    a: 'urlastone.com/simulasyon adresinde mekanınızın fotoğrafını yükleyip uygulamak istediğiniz taşı seçtiğinizde, yapay zeka (Google Gemini + Replicate nano-banana-pro) o taşın binanızda nasıl görüneceğini fotogerçekçi olarak simüle eder. Ücretsizdir, günlük 3 simülasyon hakkınız vardır. Türkiye\'nin ilk AI taş simülasyon platformlarındandır.',
  },
  {
    q: 'URLASTONE ne kadar süredir Türkiye\'de faaliyette?',
    a: 'URLASTONE markası 2015\'te kurulmuştur. Kurucu ortaklar Cihan Zenger ve Selim Zenger\'in 11+ yıllık Daymar Stone tecrübesi üzerine inşa edilmiştir. 500+ tamamlanmış proje ve 50+ ülkeye ihracat ile Türkiye\'nin köklü doğal taş üreticilerindendir.',
  },
  {
    q: 'Sadece doğal taş paneli mi satıyorsunuz?',
    a: 'Hayır. Türkiye genelinde panel satışı + İzmir bölgesinde anahtar teslim cephe kaplama uygulaması sunuyoruz. Diğer şehirlerde panel + montaj kılavuzu + teknik destek paketi ile çalışıyoruz; yerel ustanız bizim talimatlarımızla uygular. Türkiye dışında ihracat panel + CAD dosyaları + montaj kılavuzu olarak sevk edilir.',
  },
  {
    q: 'Numune gönderiyor musunuz?',
    a: 'Evet, Türkiye geneline ciddi projeler için ücretsiz 10x10 cm numune gönderiyoruz. Kargo süresi 2-4 iş günü. Numune talebinizi urlastone.com/teklif sayfasından veya WhatsApp +90 553 232 21 44 üzerinden iletebilirsiniz.',
  },
  {
    q: 'İstanbul\'da satış ofisiniz var mı?',
    a: 'İstanbul\'da kalıcı showroom\'umuz olmamakla birlikte, İstanbul\'daki mimari ofisler ve müteahhitler için randevulu numune ve proje görüşmesi düzenliyoruz. İstanbul projelerine 3-5 iş günü teslimat sağlanır. Detaylı showroom ziyareti için Urla\'daki üretim tesisimize randevu alabilirsiniz.',
  },
  {
    q: 'Doğal taş bakımı zor mudur?',
    a: 'Hayır. Doğru emprenye uygulandığında doğal taş cephe kaplamaları neredeyse bakım gerektirmez. Yılda bir kez basınçlı suyla temizleme, 5-10 yılda bir koruyucu emprenye yenilemesi yeterlidir. Boyalı cephelere göre ömür boyu maliyet çok daha düşüktür.',
  },
  {
    q: 'Hangi mimari tarzlara uygun?',
    a: 'Modern, klasik, neo-klasik, Akdeniz, endüstriyel, minimalist — tüm mimari tarzlara uygun çözümümüz var. Modern villalar için bazalt + Line/Crazy desen, Akdeniz villaları için traverten + Nature, lüks otel iç mekanları için mermer ideal kombinasyonlardır.',
  },
  {
    q: 'Türkiye\'deki diğer üreticilerden farkınız ne?',
    a: 'Üç temel farkımız var: (1) Kendi fabrikamız + üretim — aracılık yok, (2) Patentli Rockshell ince panel teknolojisi — yapıya yük bindirmez, (3) Üretici + uygulayıcı olarak tek elden hizmet (İzmir\'de) ya da ihracat + teknik destek (diğer şehirler/ülkeler). Detaylı kıyaslama için urlastone.com/blog/izmir-dogal-tas-ureticisi-secerken-10-kriter sayfasına bakabilirsiniz.',
  },
]

const breadcrumbLd = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://www.urlastone.com' },
    { '@type': 'ListItem', position: 2, name: 'Türkiye Doğal Taş Üreticisi', item: URL },
  ],
}

const faqLd = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: FAQS.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
}

const serviceLd = {
  '@context': 'https://schema.org', '@type': 'Service',
  serviceType: 'Doğal Taş Üretimi ve İhracatı',
  provider: {
    '@type': 'LocalBusiness', name: 'URLASTONE', url: 'https://www.urlastone.com',
    telephone: '+90 553 232 2144', email: 'info@urlastone.com',
    address: {
      '@type': 'PostalAddress', streetAddress: 'Altıntaş, İzmir Çeşme Cad. No: 319',
      addressLocality: 'Urla', addressRegion: 'İzmir', postalCode: '35430', addressCountry: 'TR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 38.3220, longitude: 26.7636 },
  },
  areaServed: { '@type': 'Country', name: 'Turkey' },
  hasOfferCatalog: {
    '@type': 'OfferCatalog', name: 'Doğal Taş Ürünleri',
    itemListElement: STONES.map(({ name, desc }) => ({
      '@type': 'Offer', itemOffered: { '@type': 'Product', name: `${name} Doğal Taş Kaplama`, description: desc },
    })),
  },
}

export default function TurkiyeUreticiPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />

      <Navbar />

      <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
        <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-6">
          Türkiye · 81 İl · 50+ Ülke İhracat
        </p>
        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">
          Türkiye Doğal Taş Üreticisi <br/>
          <span className="text-gold-400">URLASTONE</span>
        </h1>
        <p className="text-white/60 text-lg leading-relaxed max-w-3xl">
          URLASTONE, İzmir Urla&apos;daki fabrikasında patentli{' '}
          <strong className="text-white">Rockshell ince doğal taş paneller</strong> üreten, Türkiye&apos;nin
          81 iline ve 50+ ülkeye sevkiyat yapan tam donanımlı bir{' '}
          <strong className="text-white">doğal taş üreticisi ve ihracatçısıdır</strong>. 2015&apos;ten bu yana
          500+ tamamlanmış proje, doğrudan ocak-tan üretici ilişkisi ve uluslararası teknik standartlar.
        </p>
        <div className="flex flex-wrap gap-3 mt-10">
          <Link href="/teklif" className="inline-flex items-center gap-2 bg-gold-400 text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-[#c9a855] transition-all">
            Ücretsiz Teklif Al <ArrowRight size={16} />
          </Link>
          <Link href="/simulasyon" className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.12] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-white/[0.1] transition-all">
            AI Taş Simülasyonu
          </Link>
          <Link href="/turkiye-dogal-tas-uygulamasi" className="inline-flex items-center gap-2 text-white/60 px-4 py-3 text-sm font-mono hover:text-gold-400 transition-colors">
            Uygulama hizmetlerimiz →
          </Link>
        </div>
      </section>

      <section className="px-6 max-w-5xl mx-auto">
        <Link href="/projelerimiz" className="group block relative overflow-hidden rounded-3xl border border-white/[0.08] hover:border-gold-400/30 transition-all duration-500">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/slide-2.jpg" alt="URLASTONE Türkiye doğal taş üreticisi — Rockshell panel uygulanmış villa cephesi" loading="eager"
            className="w-full h-[260px] md:h-[380px] object-cover group-hover:scale-[1.02] transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between gap-4">
            <p className="font-mono text-[11px] tracking-[0.2em] text-white/70 uppercase">500+ Tamamlanmış Proje</p>
            <span className="inline-flex items-center gap-2 text-gold-400 text-sm font-medium">
              Projeleri Gör <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>
      </section>

      <section className="px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-4">Neden URLASTONE</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-12">Türkiye&apos;nin en güvenilir doğal taş üreticisi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Factory, title: 'Kendi fabrikamız', desc: 'İzmir Urla\'daki üretim tesisinde tüm süreç — ham blok kesimi, kalibrasyon, paketleme. Aracı yok.' },
              { icon: Award, title: 'Patentli Rockshell', desc: 'İnce panel teknolojimiz (1-3 cm) klasik 5-10 cm taşın 5-7\'de bir ağırlığında.' },
              { icon: Building2, title: '500+ proje', desc: 'Türkiye geneli ve 50+ ülkede villa, otel, ofis, hospitality projeleri.' },
              { icon: Globe2, title: '50+ ülkeye ihracat', desc: 'Almanya, Fransa, ABD, BAE, Suudi Arabistan dahil 5 kıtaya konteyner sevkiyat.' },
              { icon: ShieldCheck, title: 'TS EN sertifikalı', desc: 'TS EN 12371 (donma-çözünme), TS EN 1925 (su emme), ISO uyumlu üretim.' },
              { icon: Truck, title: '81 ile teslim', desc: 'Büyükşehirlere 3-5 iş günü, diğer illere 5-7 iş günü EPAL paletli teslim.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-gold-400/30 transition-colors">
                <Icon size={22} className="text-gold-400 mb-4" />
                <h3 className="font-heading text-lg font-semibold mb-2">{title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-4">Ürün Gamı</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">4 doğal taş, hepsi yerli ocak</h2>
          <p className="text-white/55 max-w-2xl mb-12">
            Türkiye&apos;nin en kaliteli ocaklarıyla doğrudan çalışıyoruz — tedarik zinciri tamamen yerli ve şeffaf.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STONES.map(({ name, img, desc }) => (
              <Link key={name} href="/urunlerimiz" className="group block overflow-hidden rounded-2xl border border-white/[0.06] hover:border-gold-400/40 transition-all duration-500 bg-white/[0.03]">
                <div className="relative h-44 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`${name} doğal taş cephe kaplama — Türkiye üretici URLASTONE`} loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <h3 className="absolute bottom-3 left-4 font-heading text-xl font-semibold">{name}</h3>
                </div>
                <p className="text-white/55 text-sm leading-relaxed p-5">{desc}</p>
              </Link>
            ))}
          </div>
          <Link href="/urunlerimiz" className="inline-flex items-center gap-2 mt-8 bg-white/[0.06] border border-white/[0.12] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-white/[0.1] hover:border-gold-400/30 transition-all">
            Tüm Ürünleri İncele <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <section className="px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-4">Teslim Edilen Şehirler</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Türkiye&apos;nin 81 iline ulaşıyoruz</h2>
          <p className="text-white/55 max-w-2xl mb-10">
            Üretim İzmir Urla&apos;da, sevkiyat Türkiye geneline. Aşağıdaki ana şehirlerde projelerimiz mevcut:
          </p>
          <div className="flex flex-wrap gap-2">
            {CITIES.map((c) => (
              <span key={c} className="bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-2 text-sm text-white/70">
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-4">Uluslararası Pazarlar</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">50+ ülkeye ihracat</h2>
          <p className="text-white/55 max-w-2xl mb-10">
            Konteyner sevkiyatı, gümrük dokümantasyonu ve uluslararası lojistik desteği ile başlıca pazarlarımız:
          </p>
          <div className="flex flex-wrap gap-2">
            {EXPORT_COUNTRIES.map((c) => (
              <span key={c} className="bg-gold-400/[0.06] border border-gold-400/[0.15] rounded-full px-4 py-2 text-sm text-gold-400">
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-4">Tamamlanan Projeler</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Üretimden cepheye</h2>
          <p className="text-white/55 max-w-2xl mb-10">
            Fabrikamızdan çıkan her panel bir projede hayat buluyor. Villa, otel ve rezidans projelerimizin tamamını harita üzerinde inceleyebilirsiniz:
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {PROJECT_PHOTOS.map(({ src, alt }) => (
              <Link key={src} href="/projelerimiz" className="group relative overflow-hidden rounded-2xl border border-white/[0.06] hover:border-gold-400/40 transition-all duration-500 aspect-[4/5]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={alt} loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link href="/projelerimiz" className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.12] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-white/[0.1] hover:border-gold-400/30 transition-all">
              Tüm Projeleri Gör <ArrowRight size={14} />
            </Link>
            <Link href="/referanslarimiz" className="inline-flex items-center gap-2 text-white/60 px-4 py-3 text-sm font-mono hover:text-gold-400 transition-colors">
              Referanslarımız →
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-4">Sıkça Sorulan Sorular</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-12">Türkiye doğal taş üreticisi hakkında</h2>
          <div className="space-y-3">
            {FAQS.map(({ q, a }, i) => (
              <details key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 group">
                <summary className="font-heading text-base font-semibold cursor-pointer list-none flex items-start justify-between gap-4">
                  <span>{q}</span>
                  <span className="text-gold-400 flex-shrink-0 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="text-white/60 text-sm leading-relaxed mt-4">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-4">Keşfet</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-12">URLASTONE'da sizi neler bekliyor</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EXPLORE_LINKS.map(({ href, title, desc }) => (
              <Link key={href} href={href} className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-gold-400/30 hover:bg-white/[0.05] transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-heading text-lg font-semibold">{title}</h3>
                  <ArrowRight size={16} className="text-gold-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-white/50 text-sm">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
            Türkiye&apos;deki projeniz için <span className="text-gold-400">ücretsiz teklif</span>
          </h2>
          <p className="text-white/55 mb-10">
            Bina fotoğrafınızı paylaşın, 24 saat içinde detaylı teklif gönderelim. Türkiye geneli teslim, dünya geneli ihracat.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/teklif" className="inline-flex items-center gap-2 bg-gold-400 text-black px-7 py-4 rounded-full text-sm font-medium hover:bg-[#c9a855] transition-all">
              Teklif Al <ArrowRight size={16} />
            </Link>
            <Link href="/turkiye-dogal-tas-uygulamasi" className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.12] text-white px-7 py-4 rounded-full text-sm font-medium hover:bg-white/[0.1] transition-all">
              Uygulama Hizmetleri
            </Link>
            <Link href="/izmir-dogal-tas-ureticisi" className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] text-white px-7 py-4 rounded-full text-sm font-medium hover:bg-white/[0.08] transition-all">
              İzmir Üretici Sayfası
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/40 text-sm">
            <span className="inline-flex items-center gap-2"><MapPin size={14} /> Altıntaş, Urla / İzmir</span>
            <span className="inline-flex items-center gap-2"><Phone size={14} /> +90 553 232 21 44</span>
            <span className="inline-flex items-center gap-2"><Mail size={14} /> info@urlastone.com</span>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
