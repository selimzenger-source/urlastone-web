import Link from 'next/link'
import { ArrowRight, MapPin, Phone, Mail, Factory, Truck, ShieldCheck, Award, Gem, Layers, Hammer, Building2, Globe2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const URL = 'https://www.urlastone.com/izmir-dogal-tas-ureticisi'

// ─────────────────────── DATA ───────────────────────
const SERVICE_AREAS = [
  'Urla', 'Çeşme', 'Karaburun', 'Seferihisar', 'Menderes', 'Selçuk',
  'Bornova', 'Karşıyaka', 'Konak', 'Buca', 'Gaziemir', 'Çiğli',
  'Balçova', 'Narlıdere', 'Güzelbahçe', 'Bayraklı', 'Foça', 'Aliağa',
]

const STONES = [
  { name: 'Traverten', desc: 'Denizli\'den getirilen sıcak krem, fildişi ve bal tonlarında doğal traverten. Cephede klasik premium görünüm.', icon: '🟫' },
  { name: 'Bazalt', desc: 'Anadolu\'nun volkanik kayasından üretilen koyu antrasit bazalt. Modern ve dayanıklı.', icon: '⬛' },
  { name: 'Kalker', desc: 'Yumuşak kum bej tonlarında fosil izli kalker. Akdeniz mimarisi için ideal.', icon: '⚪' },
  { name: 'Mermer', desc: 'Beyaz ve krem zeminde gri damarlı doğal mermer. Lüks projelerin tercihi.', icon: '◽' },
]

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: 'URLASTONE İzmir\'de doğal taş üreticisi midir?',
    a: 'Evet. URLASTONE, İzmir Urla\'da bulunan kendi üretim tesisinde Rockshell patentli ince doğal taş paneller üreten bir doğal taş üreticisidir. Bayilik veya aracılık değil, fabrika doğrudan üreticidir. Ham bloğun ocaktan alınmasından panelin paketlenmesine kadar tüm süreç fabrikamızda yürütülür.',
  },
  {
    q: 'İzmir\'in hangi ilçelerine hizmet veriyorsunuz?',
    a: 'İzmir\'in tüm ilçelerine hizmet vermekteyiz. Urla, Çeşme, Karaburun, Seferihisar, Menderes, Selçuk, Bornova, Karşıyaka, Konak, Buca, Gaziemir, Çiğli, Balçova, Narlıdere, Güzelbahçe, Bayraklı, Foça ve Aliağa başta olmak üzere tüm İzmir bölgesinde projelerimiz bulunmaktadır.',
  },
  {
    q: 'URLASTONE hangi doğal taş türlerini üretiyor?',
    a: 'Dört ana doğal taş türünü üretiyoruz: Traverten (Denizli kaynaklı, krem-fildişi tonlar), Bazalt (Anadolu volkanik kayası, koyu antrasit), Kalker (yumuşak bej fosil izli) ve Mermer (beyaz/krem zeminde gri damarlı). Her tür için Nature, Line, Mix ve Crazy olmak üzere 4 farklı Rockshell deseni mevcuttur.',
  },
  {
    q: 'Rockshell nedir? Klasik doğal taştan farkı nedir?',
    a: 'Rockshell, URLASTONE\'un patentli ince doğal taş kaplama panel teknolojisidir. Klasik 5-10 cm kalınlığındaki doğal taşın aksine 1-3 cm kalınlığa indirilerek metrekare başına 100-150 kg yerine 15-30 kg ağırlığa düşürülmüştür. Yapıya ek yük bindirmediği için hem yeni binalarda hem de eski cephelerin yenilenmesinde güvenle kullanılır.',
  },
  {
    q: 'İzmir\'de teklif almak için ne yapmam gerekir?',
    a: 'urlastone.com/teklif sayfasından 2 dakikada ücretsiz teklif alabilirsiniz. Form bina fotoğrafınızı, m² bilgisini ve istediğiniz taş türünü sorar; ekibimiz 24 saat içinde detaylı fiyat ve teknik bilgi ile döner. Alternatif olarak +90 553 232 21 44 numarasından WhatsApp ile de iletişime geçebilirsiniz.',
  },
  {
    q: 'AI taş simülasyonu nedir? Nasıl çalışır?',
    a: 'urlastone.com/simulasyon adresinde mekanınızın fotoğrafını yükleyip uygulamak istediğiniz taşı seçtiğinizde yapay zeka (Google Gemini + Replicate nano-banana-pro) o taşın binanızda nasıl görüneceğini fotogerçekçi olarak simüle eder. Ücretsizdir, günlük 3 simülasyon hakkınız vardır. İzmir\'deki müşterilerimiz teklif almadan önce 4 farklı taşı kendi binalarında görme imkanı bulur.',
  },
  {
    q: 'İzmir doğal taş fiyatları ne kadar?',
    a: 'Rockshell panellerin metrekare fiyatı taş türüne ve desene göre $30-$130 USD aralığındadır. Traverten ekonomik segmentten başlar, mermer üst segmentte yer alır. Fiyata fabrika çıkışı, ambalaj ve İzmir genelinde teslimat dahildir. Anahtar teslim uygulama isterseniz ayrıca usta + montaj kalemi eklenir. Net fiyat için teklif formundan ya da WhatsApp\'tan ulaşabilirsiniz.',
  },
  {
    q: 'URLASTONE ne kadar süredir İzmir\'de faaliyette?',
    a: 'URLASTONE markası 2015\'te kurulmuş, kurucu ortaklar Cihan Zenger ve Selim Zenger\'in 11+ yıllık Daymar Stone tecrübesinin üzerine inşa edilmiştir. 500\'den fazla tamamlanmış proje ve 50+ ülkeye ihracat ile İzmir\'in köklü doğal taş üreticilerindendir.',
  },
  {
    q: 'Sadece İzmir\'e mi hizmet veriyorsunuz?',
    a: 'Hayır. İzmir bizim merkezimiz ve üretim tesisimizdir ancak Türkiye geneline ve 50+ ülkeye ihracat yapıyoruz. Almanya, İspanya, Fransa, İngiltere, ABD, Suudi Arabistan, BAE, Rusya, İtalya, Yunanistan ve Hollanda başlıca pazarlarımızdır. Konteyner sevkiyatı ve gümrük desteği sağlıyoruz.',
  },
  {
    q: 'Cephe kaplama için doğal taş mı seramik mi?',
    a: 'Doğal taş seramik kaplamaya göre daha pahalıdır ancak 50+ yıl ömür, doğal renk varyasyonu, yüksek görsel değer ve binaya kazandırdığı emlak değeri ile uzun vadede daha ekonomik bir tercih olabilir. Seramik 10-15 yılda solgun görünür, doğal taş ise yıllar geçtikçe karakter kazanır. Premium villa ve hospitality projelerde tercih edilmesinin sebebi budur.',
  },
  {
    q: 'Hangi yüzeylere doğal taş uygulanır?',
    a: 'Dış cephe kaplamaları (villa, otel, ofis), iç mekan duvar kaplamaları (salon, lobi, restoran), şömine etrafı, zemin döşemeleri, peyzaj duvarları ve bahçe elemanları için doğal taş uygun bir tercihtir. Rockshell ince paneller sayesinde yapıya ek yük bindirmeden hem yeni hem yenileme projelerinde kullanılabilir.',
  },
  {
    q: 'Numune gönderiyor musunuz?',
    a: 'Evet, İzmir bölgesindeki ciddi projeler için ücretsiz numune (10x10 cm) gönderiyoruz. Numune talebinizi teklif formundan veya WhatsApp\'tan iletebilirsiniz. Showroom\'umuzdaki tüm taş ve desenleri Urla\'daki tesisimizde yerinde görme imkanı da vardır (randevu ile).',
  },
  {
    q: 'Sertifika ve teknik dokümanlar veriyor musunuz?',
    a: 'Her ürün için kesim spesifikasyonu, ağırlık hesabı, donma-çözünme dayanımı, su emme oranı ve montaj kılavuzu içeren teknik dokümantasyon sağlıyoruz. ISO uyumlu üretim standartlarımız ve mimar/inşaat firmaları için detaylı CAD dosyaları talep üzerine paylaşılır.',
  },
  {
    q: 'Mimari ofisler ve müteahhitlerle iş birliği yapıyor musunuz?',
    a: 'Evet. İzmir, İstanbul ve diğer şehirlerdeki mimari ofisler ve müteahhit firmalarla düzenli iş birliğimiz vardır. Proje bazlı özel desen, ölçü ve renk tonu üretimi, mockup hazırlama, teknik destek ve montaj eğitimi sağlıyoruz. B2B iş birliği için info@urlastone.com adresinden iletişime geçebilirsiniz.',
  },
  {
    q: 'Doğal taş bakımı zor mudur?',
    a: 'Hayır. Doğal taş cephe kaplamaları doğru emprenye uygulandığında neredeyse bakım gerektirmez. Yılda bir kez basınçlı suyla temizleme ve 5-10 yılda bir koruyucu emprenye yenilemesi yeterlidir. Boyalı cephelere göre çok daha düşük bakım maliyeti vardır.',
  },
  {
    q: 'Anahtar teslim uygulama yapıyor musunuz?',
    a: 'Evet, İzmir bölgesinde kendi teknik ekibimizle anahtar teslim uygulama hizmeti sunuyoruz. Ölçüm, hazırlık, montaj ve teslimat süreçlerini biz yönetiyoruz. Detaylı uygulama hizmetleri için urlastone.com/izmir-dogal-tas-uygulamasi sayfasına göz atabilirsiniz.',
  },
]

// ───────────────── JSON-LD SCHEMAS ─────────────────
const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://www.urlastone.com' },
    { '@type': 'ListItem', position: 2, name: 'İzmir Doğal Taş Üreticisi', item: URL },
  ],
}

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Doğal Taş Üretimi ve Cephe Kaplama Sistemleri',
  provider: {
    '@type': 'LocalBusiness',
    name: 'URLASTONE',
    url: 'https://www.urlastone.com',
    telephone: '+90 553 232 2144',
    email: 'info@urlastone.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Altıntaş, İzmir Çeşme Cad. No: 319',
      addressLocality: 'Urla',
      addressRegion: 'İzmir',
      postalCode: '35430',
      addressCountry: 'TR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 38.3220, longitude: 26.7636 },
    areaServed: { '@type': 'AdministrativeArea', name: 'İzmir' },
  },
  areaServed: SERVICE_AREAS.map((name) => ({ '@type': 'City', name })),
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Doğal Taş Ürünleri',
    itemListElement: STONES.map(({ name, desc }) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Product', name: `${name} Doğal Taş Kaplama`, description: desc },
    })),
  },
}

// ────────────────── PAGE COMPONENT ──────────────────
export default function IzmirUreticiPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />

      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
        <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-6">
          İzmir · Urla · Üretim &amp; İhracat
        </p>
        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">
          İzmir Doğal Taş Üreticisi <br/>
          <span className="text-gold-400">URLASTONE</span>
        </h1>
        <p className="text-white/60 text-lg leading-relaxed max-w-3xl">
          URLASTONE, İzmir Urla\'da bulunan kendi üretim tesisinde patentli{' '}
          <strong className="text-white">Rockshell ince doğal taş paneller</strong> üreten, 2015\'ten
          bu yana 500+ projeyi tamamlayan, 50+ ülkeye ihracat yapan tam donanımlı bir{' '}
          <strong className="text-white">doğal taş üreticisi</strong>dir. Ham bloğun ocaktan
          alınmasından panelin paketlenmesine kadar tüm süreç fabrikamızda yürütülür — aracı veya
          bayilik değil, fabrika-doğrudan üretim.
        </p>
        <div className="flex flex-wrap gap-3 mt-10">
          <Link href="/teklif" className="inline-flex items-center gap-2 bg-gold-400 text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-[#c9a855] transition-all">
            Ücretsiz Teklif Al <ArrowRight size={16} />
          </Link>
          <Link href="/simulasyon" className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.12] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-white/[0.1] transition-all">
            AI Taş Simülasyonu
          </Link>
          <Link href="/izmir-dogal-tas-uygulamasi" className="inline-flex items-center gap-2 text-white/60 px-4 py-3 text-sm font-mono hover:text-gold-400 transition-colors">
            Uygulama hizmetlerimiz →
          </Link>
        </div>
      </section>

      {/* WHY URLASTONE */}
      <section className="px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-4">Neden URLASTONE</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-12">İzmir\'de doğal taş üreticisi seçerken</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Factory, title: 'Kendi fabrikamız', desc: 'Urla\'daki üretim tesisinde tüm süreç — ham blok kesimi, kalibrasyon, paketleme. Aracı yok.' },
              { icon: Award, title: 'Patentli Rockshell', desc: 'İnce panel teknolojimiz (1-3 cm) klasik 5-10 cm taşın 5-7\'de bir ağırlığında.' },
              { icon: Building2, title: '500+ proje', desc: 'Villa, otel, ofis ve hospitality projelerinde 11+ yıllık deneyim.' },
              { icon: Globe2, title: '50+ ülkeye ihracat', desc: 'Almanya, İspanya, Fransa, İngiltere, ABD, BAE başlıca pazarlarımız.' },
              { icon: ShieldCheck, title: 'Teknik dokümantasyon', desc: 'Kesim spesifikasyonu, ağırlık hesabı, montaj kılavuzu her ürün için sağlanır.' },
              { icon: Truck, title: 'İzmir geneli teslim', desc: 'Tüm ilçelerde fabrika çıkışı + ambalajlı teslimat dahil. Anahtar teslim opsiyonu mevcut.' },
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

      {/* PRODUCT RANGE */}
      <section className="px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-4">Ürün Gamı</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">4 doğal taş, 4 Rockshell deseni</h2>
          <p className="text-white/55 max-w-2xl mb-12">
            URLASTONE üretim hattında <strong className="text-white">100+ farklı taş-desen kombinasyonu</strong> hazırlanır.
            Her taş türü için Nature, Line, Mix ve Crazy olmak üzere 4 ana desen ailesi mevcuttur.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STONES.map(({ name, desc, icon }) => (
              <div key={name} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{icon}</span>
                  <div>
                    <h3 className="font-heading text-xl font-semibold mb-2">{name}</h3>
                    <p className="text-white/55 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link href="/urunlerimiz" className="inline-flex items-center gap-2 mt-8 text-gold-400 text-sm font-medium hover:text-[#c9a855] transition-colors">
            Tüm ürünleri incele <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* SERVICE AREAS */}
      <section className="px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-4">Hizmet Bölgeleri</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">İzmir\'in tüm ilçelerinde</h2>
          <p className="text-white/55 max-w-2xl mb-12">
            Üretim tesisimiz Urla\'da olmakla birlikte İzmir\'in tüm ilçelerine teslimat ve uygulama hizmeti sunuyoruz.
            Sahil ilçelerinde villa cephesi, merkez ilçelerde apartman ve ticari yapı projelerimiz bulunmaktadır.
          </p>
          <div className="flex flex-wrap gap-2">
            {SERVICE_AREAS.map((c) => (
              <span key={c} className="bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-2 text-sm text-white/70">
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-4">Üretim Süreci</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-12">Ocaktan cepheye 5 adım</h2>
          <div className="space-y-5">
            {[
              { n: '01', title: 'Ocak seçimi', desc: 'Denizli traverten, Anadolu bazalt, Bursa kalker ve Afyon mermer ocakları arasından proje rengine uygun ham blok seçimi.' },
              { n: '02', title: 'İnce panel kesimi', desc: 'Rockshell teknolojisi ile 1-3 cm kalınlığa kesim. CNC kalibrasyon ile yüzey düzlüğü garantilenir.' },
              { n: '03', title: 'Desen montajı', desc: 'Nature, Line, Mix veya Crazy desenine göre el işçiliği ile panel kompozisyonu hazırlanır.' },
              { n: '04', title: 'Paketleme + sevkiyat', desc: 'EPAL paletlerde dış cephe için stretch wrap koruması. İzmir içi 1-3 iş günü, Türkiye geneli 3-7 gün teslim.' },
              { n: '05', title: 'Anahtar teslim uygulama (opsiyonel)', desc: 'İzmir bölgesinde teknik ekibimizle montaj, derz dolgusu ve emprenye dahil anahtar teslim hizmet.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex gap-6 items-start">
                <span className="font-heading text-3xl text-gold-400 w-12 flex-shrink-0">{n}</span>
                <div>
                  <h3 className="font-heading text-lg font-semibold mb-1">{title}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CUSTOMER TYPES */}
      <section className="px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-4">Kimler İçin</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-12">Müşteri profilimiz</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { title: 'Villa &amp; konut sahipleri', desc: 'Çeşme, Urla, Karaburun sahil villalarından Bornova-Karşıyaka müstakil konutlarına kadar premium dış cephe projeleri.' },
              { title: 'Otel &amp; hospitality', desc: 'Boutique otel, butik pansiyon, tatil köyü ve restoran cephesi. Karakteristik doğal görünüm ile yıldız markalama.' },
              { title: 'Mimari ofisler', desc: 'İzmir, İstanbul ve diğer şehirlerdeki mimari firmalar ile düzenli iş birliği. Proje bazlı özel kesim ve teknik destek.' },
              { title: 'Müteahhitler', desc: 'Site, rezidans ve ticari yapı projelerinde toplu sipariş, mockup hazırlama ve montaj eğitimi.' },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                <h3 className="font-heading text-lg font-semibold mb-2" dangerouslySetInnerHTML={{ __html: title }} />
                <p className="text-white/55 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICE */}
      <section className="px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-4">Şeffaf Fiyat</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Doğal taş fiyat aralığı</h2>
          <p className="text-white/55 max-w-2xl mb-10">
            Rockshell panellerin metrekare fiyatı taş türüne ve desene göre değişir.
            Fiyata fabrika çıkışı, EPAL paletli ambalaj ve İzmir genelinde teslimat dahildir.
          </p>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.04] text-white/40 font-mono text-[11px] uppercase">
                  <th className="text-left px-5 py-3">Taş Türü</th>
                  <th className="text-left px-5 py-3">Desen</th>
                  <th className="text-right px-5 py-3">Fiyat (USD/m²)</th>
                </tr>
              </thead>
              <tbody className="text-white/70">
                <tr className="border-t border-white/[0.05]"><td className="px-5 py-3">Traverten</td><td className="px-5 py-3">Nature / Mix</td><td className="text-right px-5 py-3">$30 – $65</td></tr>
                <tr className="border-t border-white/[0.05]"><td className="px-5 py-3">Bazalt</td><td className="px-5 py-3">Line / Crazy</td><td className="text-right px-5 py-3">$45 – $90</td></tr>
                <tr className="border-t border-white/[0.05]"><td className="px-5 py-3">Kalker</td><td className="px-5 py-3">Nature / Line</td><td className="text-right px-5 py-3">$35 – $70</td></tr>
                <tr className="border-t border-white/[0.05]"><td className="px-5 py-3">Mermer</td><td className="px-5 py-3">Tüm desenler</td><td className="text-right px-5 py-3">$60 – $130</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-white/35 text-xs font-mono mt-4">Net fiyat için proje detayları gerekir — teklif formundan iletin.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-4">Sıkça Sorulan Sorular</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-12">İzmir doğal taş üreticisi hakkında</h2>
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

      {/* CTA */}
      <section className="px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
            İzmir\'deki projeniz için <span className="text-gold-400">ücretsiz teklif</span>
          </h2>
          <p className="text-white/55 mb-10">
            Bina fotoğrafınızı paylaşın, 24 saat içinde detaylı teklif gönderelim.
            Veya AI simülasyonu ile taşı binanızda önce görün.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/teklif" className="inline-flex items-center gap-2 bg-gold-400 text-black px-7 py-4 rounded-full text-sm font-medium hover:bg-[#c9a855] transition-all">
              Ücretsiz Teklif Al <ArrowRight size={16} />
            </Link>
            <Link href="/simulasyon" className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.12] text-white px-7 py-4 rounded-full text-sm font-medium hover:bg-white/[0.1] transition-all">
              AI Taş Simülasyonu
            </Link>
            <Link href="/izmir-dogal-tas-uygulamasi" className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] text-white px-7 py-4 rounded-full text-sm font-medium hover:bg-white/[0.08] transition-all">
              <Hammer size={16} /> Uygulama Hizmetleri
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
