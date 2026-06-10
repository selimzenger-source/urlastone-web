import Link from 'next/link'
import { ArrowRight, MapPin, Phone, Mail, Hammer, Ruler, Sparkles, ShieldCheck, Award, Wrench, Home, Building, Flame, Trees } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SisterBrand from '@/components/SisterBrand'
import { PricingSection, EgeSection, GlobalSection, HomeCTASection } from '@/components/pillar/PillarSections'

const URL = 'https://www.urlastone.com/izmir-dogal-tas-uygulamasi'

const SERVICE_AREAS = [
  'Urla', 'Çeşme', 'Karaburun', 'Seferihisar', 'Menderes', 'Selçuk',
  'Bornova', 'Karşıyaka', 'Konak', 'Buca', 'Gaziemir', 'Çiğli',
  'Balçova', 'Narlıdere', 'Güzelbahçe', 'Bayraklı', 'Foça', 'Aliağa',
]

const APPLICATIONS = [
  { icon: Building, title: 'Dış Cephe Kaplama', desc: 'Villa, apartman, otel, ofis ve ticari yapıların dış cephesinde doğal taş kaplama. Rockshell ince paneller yapıya ek yük bindirmez.' },
  { icon: Home, title: 'İç Mekan Duvar', desc: 'Salon, lobi, restoran, otel resepsiyon ve aksan duvar uygulamaları. TV ünitesi arkasından koridor duvarına kadar.' },
  { icon: Flame, title: 'Şömine Kaplama', desc: 'Geleneksel veya modern şömine etrafı, baca duvarı ve dekoratif odak noktası uygulamaları.' },
  { icon: Trees, title: 'Peyzaj &amp; Bahçe', desc: 'Havuz çevresi, istinat duvarı, bahçe duvarı, açık alan oturma grupları ve sahil villalarında deniz manzaralı tasarımlar.' },
]

const PROCESS_STEPS = [
  { icon: Ruler, title: 'Yerinde Ölçüm', desc: 'İzmir bölgesindeki projeler için teknik ekibimiz ücretsiz yerinde keşif ve ölçüm yapar. CAD\'de hazırlanan plan üzerinden m² ve fire hesabı netleşir.' },
  { icon: Sparkles, title: 'Numune &amp; Mockup', desc: 'Seçilen taş ve desenden 1 m² mockup hazırlanır, projede uygulanacak görüntü onayınıza sunulur. Renk ve doku tonu önceden netleşir.' },
  { icon: Hammer, title: 'Yüzey Hazırlığı', desc: 'Mevcut sıva veya beton yüzeyin temizliği, primer uygulaması, gerekirse mekanik sabitleme aksesuarlarının yerleştirilmesi.' },
  { icon: Wrench, title: 'Panel Montajı', desc: 'Rockshell paneller özel yapıştırıcı + mekanik destek ile döşenir. Profesyonel taş ustası ekibimiz kompozisyon hatasını engeller.' },
  { icon: ShieldCheck, title: 'Derz + Emprenye', desc: 'Derz dolgusu yapılır, ardından su itici ve kir tutmaz emprenye uygulanır. Cephe 24 saat sonra kullanıma hazır.' },
  { icon: Award, title: 'Teslim + Garanti', desc: 'İş bitiminde detaylı bakım kılavuzu teslim edilir. Montaj kalitesi 5 yıl, ürün dayanıklılığı 50+ yıl garanti altındadır.' },
]

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: 'URLASTONE İzmir\'de doğal taş uygulaması yapıyor mu?',
    a: 'Evet. URLASTONE hem doğal taş üreticisi hem de İzmir bölgesinde anahtar teslim cephe kaplama uygulayan bir firmadır. Kendi fabrikamızda ürettiğimiz Rockshell panelleri kendi teknik ekibimizle monte ediyoruz. Üretim + uygulama tek elden olduğu için kalite kontrolü ve fiyat avantajı sağlanır.',
  },
  {
    q: 'İzmir doğal taş uygulama fiyatı ne kadar?',
    a: 'Uygulama maliyeti, taş türü ve uygulama yüzeyinin durumuna göre değişir. Tipik bir villa cephesi için Rockshell panel + montaj + derz + emprenye dahil m² maliyeti 80-200 USD arasındadır. Net fiyat için yerinde ücretsiz keşif yapıyoruz. Teklif formundan iletişime geçebilirsiniz.',
  },
  {
    q: 'Anahtar teslim cephe kaplama hizmeti veriyor musunuz?',
    a: 'Evet, İzmir genelinde anahtar teslim doğal taş cephe kaplama hizmeti sunuyoruz. Yerinde ölçüm, mockup, panel sevkiyatı, montaj, derz, emprenye ve teslim — tüm süreç tek ekipten ve tek fiyattan. Mimar veya müteahhit aracısına gerek olmadan doğrudan üretici-uygulayıcı ile çalışırsınız.',
  },
  {
    q: 'Uygulama ne kadar sürer?',
    a: 'Süre yüzey büyüklüğüne ve karmaşıklığa bağlıdır. Tipik bir villa cephesi (300-500 m²) için 7-15 iş günü, lobi/iç mekan duvarı (50-100 m²) için 3-5 iş günü, şömine kaplama için 1-2 iş günü yeterlidir. Yerinde keşif sonrası net süre verilir.',
  },
  {
    q: 'Eski cephemin üzerine doğal taş uygulayabilir miyim?',
    a: 'Evet. Rockshell\'in ince ve hafif olması (15-30 kg/m²) eski cephelere yenileme imkanı sağlar. Mevcut sıva veya boyalı yüzey sağlamsa üzerine direkt uygulanır; gevşek ise mekanik sabitleme ile güvence altına alınır. Yapıya ek yük bindirmez, statik analiz gerektirmez.',
  },
  {
    q: 'İzmir\'in hangi ilçelerinde uygulama yapıyorsunuz?',
    a: 'İzmir\'in tüm ilçelerinde uygulama hizmeti veriyoruz. Urla, Çeşme, Karaburun, Seferihisar villa cepheleri; Bornova, Karşıyaka, Konak, Buca apartman ve konut; Foça, Aliağa, Menderes ticari proje uygulamalarımız bulunmaktadır.',
  },
  {
    q: 'Uygulama garantisi var mı?',
    a: 'Evet. Montaj işçiliği 5 yıl, ürün dayanıklılığı 50+ yıl garanti altındadır. Doğru yüzey hazırlığı ve emprenye uygulandığında doğal taş cepheler ömür boyu görsel değerini korur. Yıllık bakım gerektirmez, 5-10 yılda bir koruyucu emprenye yenilemesi yeterlidir.',
  },
  {
    q: 'Hangi yüzeylere doğal taş uygulanır?',
    a: 'Beton, tuğla, briket, betopan, OSB, çimentolu yonga levha, sağlam sıvalı yüzey ve mevcut boyalı dış cephe — tüm yapı yüzeylerine uygulanır. Yumuşak alçıpan tek başına önerilmez; mekanik sabitleme veya destek levhası ile uygulanabilir.',
  },
  {
    q: 'Mockup (örnek uygulama) yapıyor musunuz?',
    a: 'Evet, 100 m² ve üzeri projelerde 1 m² mockup hazırlıyoruz. Seçtiğiniz taş ve desenin gerçek ışıkta nasıl görüneceğini onayınıza sunarız. Bu sayede renk tonu, derz genişliği ve kompozisyon kararı önceden netleşir, sürpriz yaşanmaz.',
  },
  {
    q: 'Cephe kaplama doğal taş mı yoksa seramik mi tercih edilmeli?',
    a: 'Doğal taş seramik kaplamaya göre yatırım maliyeti yüksek olmakla birlikte 50+ yıl ömrü, doğal renk varyasyonu, yüksek emlak değeri ve premium görünüm avantajı sağlar. Seramik 10-15 yılda renk kaybeder, doğal taş ise yıllar geçtikçe karakter kazanır. Villa ve otel projelerinde doğal taş tercih edilmesinin sebebi budur.',
  },
  {
    q: 'AI simülasyonu ile sonucu önceden görebilir miyim?',
    a: 'Evet. urlastone.com/simulasyon adresinde binanızın fotoğrafını yükleyip uygulamak istediğiniz taşı seçtiğinizde, yapay zeka o taşın cephenizde nasıl görüneceğini birkaç saniyede simüle eder. Uygulama kararı öncesi 4-5 farklı taş denemenizi tavsiye ediyoruz. Ücretsizdir, günlük 3 simülasyon hakkınız vardır.',
  },
  {
    q: 'Bakım nasıl yapılır?',
    a: 'Doğal taş cephe kaplamaları neredeyse bakım gerektirmez. Yılda bir kez basınçlı suyla (orta basınç) genel temizleme yapılır. 5-10 yılda bir koruyucu emprenye yenilenir. Boyalı cephelere göre ömür boyu maliyet çok daha düşüktür — boya 5 yılda bir yenilenir, doğal taş 50 yıl dayanır.',
  },
  {
    q: 'Yağmurlu havada uygulama yapıyor musunuz?',
    a: 'Hayır. Doğal taş cephe uygulaması için kuru hava ve +5°C üzeri sıcaklık gerekir. Yağmur, kar veya don olan günlerde uygulama ertelenir. İzmir\'in iklim şartları nedeniyle yaz ve sonbahar ayları (Mart-Kasım) uygulama için ideal dönemdir.',
  },
  {
    q: 'Şantiye temizliği ve atık yönetimi nasıl yapılır?',
    a: 'Uygulama sonrası tüm ambalaj atıkları, kesim artıkları ve kullanılmayan paneller ekibimiz tarafından toplanır ve sahadan uzaklaştırılır. Şantiye teslim öncesi temizlenir. Komşu yapılara ve çevreye zarar vermeyecek şekilde çalışılır.',
  },
  {
    q: 'Müteahhit ve mimar ofisleri ile çalışıyor musunuz?',
    a: 'Evet, İzmir\'deki mimari ofisler ve müteahhit firmalarla aktif iş birliğimiz var. Proje bazlı özel kesim, CAD dosyaları, mockup, montaj eğitimi ve tedarik koordinasyonu sağlıyoruz. B2B iş birliği için info@urlastone.com adresinden iletişime geçebilirsiniz.',
  },
  {
    q: 'Sadece ürün almak isterim, uygulamayı kendi ekibim yapacak. Mümkün mü?',
    a: 'Tabii ki. Rockshell panellerini İzmir genelinde teslim ediyoruz, uygulama ekibinizle kendi montajınızı yapabilirsiniz. Her panelle birlikte detaylı montaj kılavuzu, yapıştırıcı önerisi, derz spesifikasyonu ve emprenye reçetesi paylaşılır. Talep üzerine ustabaşınız için ücretsiz tek günlük teknik eğitim de düzenliyoruz.',
  },
]

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://www.urlastone.com' },
    { '@type': 'ListItem', position: 2, name: 'İzmir Doğal Taş Uygulaması', item: URL },
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
  serviceType: 'Doğal Taş Cephe Kaplama Uygulaması',
  provider: {
    '@type': 'LocalBusiness',
    name: 'URLASTONE',
    url: 'https://www.urlastone.com',
    telephone: '+90 553 232 2144',
    priceRange: '$30 - $200 USD/m²',
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
    name: 'Doğal Taş Uygulama Hizmetleri',
    itemListElement: APPLICATIONS.map(({ title, desc }) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: title.replace(/&amp;/g, '&'), description: desc.replace(/&amp;/g, '&') },
    })),
  },
}

export default function IzmirUygulamaPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />

      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
        <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-6">
          İzmir · Anahtar Teslim · Cephe Kaplama
        </p>
        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">
          İzmir Doğal Taş <br/>
          <span className="text-gold-400">Uygulaması</span>
        </h1>
        <p className="text-white/60 text-lg leading-relaxed max-w-3xl">
          URLASTONE, İzmir genelinde <strong className="text-white">anahtar teslim doğal taş cephe kaplama</strong>{' '}
          uygulamasında deneyimli, kendi ürettiği Rockshell ince taş panellerini kendi teknik ekibiyle monte eden
          tam donanımlı bir doğal taş uygulayan firmadır. Ölçümden teslime kadar her aşamayı tek elden yönetiyoruz —
          mimar veya aracı koordinatöre ihtiyaç yok, doğrudan üretici-uygulayıcı.
        </p>
        <div className="flex flex-wrap gap-3 mt-10">
          <Link href="/teklif" className="inline-flex items-center gap-2 bg-gold-400 text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-[#c9a855] transition-all">
            Ücretsiz Keşif &amp; Teklif <ArrowRight size={16} />
          </Link>
          <Link href="/simulasyon" className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.12] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-white/[0.1] transition-all">
            AI Simülasyon
          </Link>
          <Link href="/izmir-dogal-tas-ureticisi" className="inline-flex items-center gap-2 text-white/60 px-4 py-3 text-sm font-mono hover:text-gold-400 transition-colors">
            Üretici sayfamız →
          </Link>
        </div>
      </section>

      {/* APPLICATIONS */}
      <section className="px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-4">Uygulama Alanları</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-12">Nereye doğal taş uyguluyoruz?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {APPLICATIONS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-gold-400/30 transition-colors">
                <Icon size={22} className="text-gold-400 mb-4" />
                <h3 className="font-heading text-lg font-semibold mb-2" dangerouslySetInnerHTML={{ __html: title }} />
                <p className="text-white/55 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: desc }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-4">Uygulama Süreci</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Keşiften teslime 6 adım</h2>
          <p className="text-white/55 max-w-2xl mb-12">
            Tüm süreç şeffaf — her aşamada onayınız alınır, sürprizle karşılaşmazsınız.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PROCESS_STEPS.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold-400/15 border border-gold-400/30 flex items-center justify-center">
                  <Icon size={18} className="text-gold-400" />
                </div>
                <div>
                  <span className="font-mono text-[10px] text-white/35">ADIM {String(i + 1).padStart(2, '0')}</span>
                  <h3 className="font-heading text-base font-semibold mb-2 mt-1">{title}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICE AREAS */}
      <section className="px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-4">İzmir Uygulama Bölgeleri</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Her ilçede uygulamadayız</h2>
          <p className="text-white/55 max-w-2xl mb-12">
            Üretim tesisimiz Urla&apos;da, uygulama ekibimiz İzmir&apos;in her ilçesinde mobilize.
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

      {/* WHY URLASTONE FOR APPLICATION */}
      <section className="px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-4">Neden URLASTONE</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-12">İzmir&apos;de uygulamacı seçerken</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { title: 'Üretici + Uygulayıcı — tek elden', desc: 'Aracı yok. Panel bizim fabrikamızdan çıkar, montajı bizim ekibimiz yapar. Kalite kontrol kapı dışına çıkmaz.' },
              { title: '11+ yıllık taş ustalığı', desc: 'Daymar Stone mirasından gelen tecrübeli ustabaşı + 500+ tamamlanmış proje. Karmaşık desenlerde ustalık şart.' },
              { title: '5 yıl montaj garantisi', desc: 'İşçilik 5 yıl, ürün 50+ yıl. Sözleşmede yazılı, görünmez garanti yok.' },
              { title: 'Mockup + onayınız', desc: '100 m² üstü projelerde 1 m² mockup hazırlanır. Renk, derz, kompozisyon kararı onayınızla netleşir.' },
              { title: 'Yerinde ücretsiz keşif', desc: 'İzmir bölgesinde ön keşif ve ölçüm ücretsizdir. Net teklif ancak yerinde gördükten sonra verilir.' },
              { title: 'Temiz şantiye + zamanında teslim', desc: 'Sözleşmede yazılı tarih ve şantiye temizliği. Komşu yapı ve çevreye zarar vermeden çalışılır.' },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                <h3 className="font-heading text-lg font-semibold mb-2">{title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-4">Sıkça Sorulan Sorular</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-12">İzmir doğal taş uygulaması hakkında</h2>
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
      <PricingSection />
      <EgeSection />
      <GlobalSection />
      <SisterBrand />
      <HomeCTASection />

      <section className="px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
            İzmir&apos;deki projenize <span className="text-gold-400">ücretsiz yerinde keşif</span>
          </h2>
          <p className="text-white/55 mb-10">
            Bina fotoğrafınızı ve adresinizi paylaşın, 48 saat içinde ekibimiz keşfe gelsin.
            Veya AI simülasyonu ile taşı binanızda önce görün.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/teklif" className="inline-flex items-center gap-2 bg-gold-400 text-black px-7 py-4 rounded-full text-sm font-medium hover:bg-[#c9a855] transition-all">
              Keşif &amp; Teklif Al <ArrowRight size={16} />
            </Link>
            <Link href="/simulasyon" className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.12] text-white px-7 py-4 rounded-full text-sm font-medium hover:bg-white/[0.1] transition-all">
              AI Simülasyon
            </Link>
            <Link href="/izmir-dogal-tas-ureticisi" className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] text-white px-7 py-4 rounded-full text-sm font-medium hover:bg-white/[0.08] transition-all">
              <Hammer size={16} /> Üretici Sayfası
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
