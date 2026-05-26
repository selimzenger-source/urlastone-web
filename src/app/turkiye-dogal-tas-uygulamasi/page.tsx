import Link from 'next/link'
import { ArrowRight, MapPin, Phone, Mail, Hammer, Ruler, Sparkles, ShieldCheck, Award, Wrench, Home, Building, Flame, Trees } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const URL = 'https://www.urlastone.com/turkiye-dogal-tas-uygulamasi'

const CITIES = [
  'İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa', 'Adana', 'Konya', 'Gaziantep',
  'Kayseri', 'Mersin', 'Eskişehir', 'Samsun', 'Trabzon', 'Sakarya', 'Kocaeli',
  'Tekirdağ', 'Manisa', 'Muğla', 'Aydın', 'Denizli', 'Balıkesir', 'Çanakkale',
  'Hatay', 'Şanlıurfa', 'Diyarbakır', 'Yalova',
]

const APPLICATIONS = [
  { icon: Building, title: 'Dış Cephe Kaplama', desc: 'Villa, apartman, otel, ofis ve ticari yapı dış cephelerinde doğal taş kaplama. Türkiye geneli proje deneyimi.' },
  { icon: Home, title: 'İç Mekan Duvar', desc: 'Salon, lobi, restoran ve aksan duvar uygulamaları. Konut ve hospitality projeler.' },
  { icon: Flame, title: 'Şömine Kaplama', desc: 'Geleneksel veya modern şömine etrafı, baca duvarı, dekoratif odak noktası.' },
  { icon: Trees, title: 'Peyzaj &amp; Bahçe', desc: 'Havuz çevresi, istinat duvarı, açık alan oturma grupları, sahil villalarında deniz manzaralı uygulamalar.' },
]

const SERVICE_MODELS = [
  {
    title: 'İzmir Bölgesi: Anahtar Teslim',
    desc: 'İzmir ve çevre illerde URLASTONE kendi teknik ekibiyle yerinde keşif, mockup, montaj, derz ve emprenye dahil tam paket hizmet sunar. Tek elden sorumluluk, tek garanti.',
    badge: 'Tek Elden',
  },
  {
    title: 'Diğer Şehirler: Panel + Teknik Destek',
    desc: 'Türkiye\'nin diğer illerinde Rockshell paneller + detaylı montaj kılavuzu + CAD dosyaları + teknik destek paketi sunulur. Yerel ustanız bizim talimatlarımızla uygular. Talep üzerine ustabaşınız için ücretsiz bir günlük teknik eğitim düzenlenir.',
    badge: 'Hibrit Model',
  },
  {
    title: 'Büyük Projeler: Saha Süpervizörü',
    desc: 'İstanbul, Ankara, Antalya, Bodrum gibi büyük şehirlerdeki 500 m² üzeri projelerde URLASTONE teknik süpervizörü saha başında işin başlangıç ve kritik aşamalarında bulunur. Yerel ekiple koordineli çalışır.',
    badge: '500m²+',
  },
]

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: 'URLASTONE Türkiye genelinde doğal taş uygulaması yapıyor mu?',
    a: 'Evet, ama hizmet modeli şehre göre değişir. İzmir bölgesinde URLASTONE kendi ekibiyle anahtar teslim uygulama yapar. Diğer şehirlerde panel + teknik destek + montaj kılavuzu paketiyle yerel ustanızla çalışırız. Büyük projelerde (500m² üstü) İstanbul, Ankara, Antalya gibi şehirlere saha süpervizörü gönderebiliriz.',
  },
  {
    q: 'İstanbul\'da cephe kaplama yapıyor musunuz?',
    a: 'İstanbul\'daki projeler için Rockshell panel + detaylı montaj kılavuzu + CAD dosyaları + telefon/video teknik destek paketi sunuyoruz. Yerel ustanız bizim talimatlarımızla uygular. 500m² üstü projelerde saha süpervizörümüz İstanbul\'a gelir. Anahtar teslim hizmet için İstanbul\'da partner uygulamacı firmalarımızla yönlendirme de yapabiliriz.',
  },
  {
    q: 'Ankara\'da doğal taş uygulaması için ne öneriyorsunuz?',
    a: 'Ankara projeleri için aynı hibrit model — panel + teknik destek + opsiyonel süpervizör. Ankara\'nın sert kış iklimi nedeniyle bazalt veya yüksek dayanımlı traverten önerilir. Donma-çözünme dayanımı yüksek paneller hazırlanır.',
  },
  {
    q: 'Antalya / Bodrum / Çeşme sahil projelerine uygulama mümkün mü?',
    a: 'Tabii ki. Antalya, Bodrum (Muğla), Çeşme, Marmaris gibi sahil destinasyonlarındaki villa cephesi projelerimiz çoktur. Tuzlu deniz havasına dayanıklı emprenye uygulanır. Traverten ve kalker bu bölgelerin Akdeniz mimarisine en uyumlu seçeneklerdir.',
  },
  {
    q: 'Türkiye doğal taş cephe kaplama fiyatı m² ne kadar?',
    a: 'Türkiye genelinde Rockshell panel + tipik uygulama maliyeti (yerel usta dahil) m² başına $80-$200 USD aralığındadır. İzmir bölgesinde URLASTONE anahtar teslim uygulamasında işçilik fiyat üzerinden hesaplanır. Net fiyat için yerinde keşif (İzmir) veya fotoğraf + ölçü ile uzaktan değerlendirme (diğer şehirler) sonrası teklif sunulur.',
  },
  {
    q: 'Eski cephemin üzerine doğal taş uygulanır mı?',
    a: 'Evet. Rockshell\'in ince ve hafif olması (15-30 kg/m²) eski cephelere yenileme imkanı sağlar. Mevcut sıva veya boyalı yüzey sağlamsa üzerine direkt uygulanır; gevşek ise mekanik sabitleme ile güvence altına alınır. Yapıya ek yük bindirmez, statik analiz gerektirmez.',
  },
  {
    q: 'Mockup hizmeti veriyor musunuz?',
    a: 'Evet. İzmir\'deki anahtar teslim projelerde yerinde mockup hazırlarız. Diğer şehirlerdeki büyük projelerde (300m²+) sahaya örnek panel kombinasyonu gönderir, yerel ustaya 1 m² test uygulaması yaptırırız. Bu sayede renk, derz ve kompozisyon kararı önceden netleşir.',
  },
  {
    q: 'Uygulama ne kadar sürer?',
    a: 'Süre yüzey büyüklüğüne ve karmaşıklığa bağlıdır. Tipik bir villa cephesi (300-500 m²) için 7-15 iş günü, lobi/iç mekan duvarı (50-100 m²) için 3-5 iş günü, şömine kaplama için 1-2 iş günü yeterlidir.',
  },
  {
    q: 'Garanti süresi nedir?',
    a: 'Ürün dayanıklılığı 50+ yıl garanti altındadır. Anahtar teslim uygulamada (İzmir) montaj işçiliği 5 yıl garantilidir. Diğer şehirlerde yerel ustayla yapılan uygulamada montaj garantisi yerel uygulamacının sorumluluğundadır, ancak biz panel + teknik dokümantasyon garantisini sağlarız.',
  },
  {
    q: 'Hangi yüzeylere uygulanır?',
    a: 'Beton, tuğla, briket, betopan, OSB, çimentolu yonga levha, sağlam sıvalı yüzey, mevcut boyalı dış cephe — tüm yapı yüzeylerine uygulanır. Yumuşak alçıpan tek başına önerilmez; mekanik sabitleme veya destek levhası ile uygulanabilir.',
  },
  {
    q: 'Müteahhit ve mimarlar için özel hizmetiniz var mı?',
    a: 'Evet. Türkiye genelindeki mimari ofisler ve müteahhit firmalarla aktif iş birliğimiz var. Proje bazlı özel kesim, CAD/BIM dosyaları, mockup, montaj eğitimi, tedarik koordinasyonu ve teknik süpervizör hizmeti sağlıyoruz. B2B iş birliği için info@urlastone.com.',
  },
  {
    q: 'Bakım nasıl yapılır?',
    a: 'Doğal taş cephe kaplamaları neredeyse bakım gerektirmez. Yılda bir kez basınçlı suyla (orta basınç) temizleme, 5-10 yılda bir koruyucu emprenye yenilemesi yeterlidir. Boyalı cephelere göre ömür boyu maliyet çok daha düşüktür.',
  },
  {
    q: 'AI simülasyon ile cepheyi önce görebilir miyim?',
    a: 'Evet. urlastone.com/simulasyon adresinde binanızın fotoğrafını yükleyip uygulamak istediğiniz taşı seçtiğinizde, yapay zeka o taşın cephenizde nasıl görüneceğini birkaç saniyede simüle eder. Ücretsizdir, günlük 3 simülasyon hakkınız vardır. Uygulama kararı öncesi 4-5 farklı taş denemenizi tavsiye ediyoruz.',
  },
  {
    q: 'Sadece pano sipariş edip kendim mi monte etsem?',
    a: 'Tabii. Türkiye geneline Rockshell panel sevkiyatı yapıyoruz. Her sevkiyatla detaylı montaj kılavuzu, yapıştırıcı önerisi, derz spesifikasyonu ve emprenye reçetesi paylaşılır. Yerel ustanız bu dokümantasyonla uygulayabilir. Talep üzerine telefon/video destek hattımız aktiftir.',
  },
  {
    q: 'Türkiye dışına uygulama ekibi gönderiyor musunuz?',
    a: 'Çok büyük projeler (1000m²+) için yurt dışına teknik süpervizör gönderebiliriz. Almanya, Suudi Arabistan, BAE projelerimizde bu modelle çalıştık. Standart ihracat projelerinde panel + CAD + montaj kılavuzu + uzaktan destek paketi sunuluyor; yerel uygulamacı ile koordineli yürütülür.',
  },
  {
    q: 'Uygulama öncesi yerinde keşif yapıyor musunuz?',
    a: 'İzmir ve yakın illerde yerinde ücretsiz keşif yapılır. Diğer şehirlerde fotoğraf + ölçü ile uzaktan değerlendirme yapılır; mimari ofis veya müteahhitle koordineli plan çıkarılır. Büyük projelerde ön keşif için sahaya gidilebilir (seyahat masrafı projeye yansıtılır veya teklif kapsamında değerlendirilir).',
  },
]

const breadcrumbLd = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://www.urlastone.com' },
    { '@type': 'ListItem', position: 2, name: 'Türkiye Doğal Taş Uygulaması', item: URL },
  ],
}

const faqLd = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: FAQS.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
}

const serviceLd = {
  '@context': 'https://schema.org', '@type': 'Service',
  serviceType: 'Doğal Taş Cephe Kaplama Uygulaması',
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
}

export default function TurkiyeUygulamaPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />

      <Navbar />

      <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
        <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-6">
          Türkiye · 81 İl · Cephe Kaplama
        </p>
        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">
          Türkiye Doğal Taş <br/>
          <span className="text-gold-400">Uygulaması</span>
        </h1>
        <p className="text-white/60 text-lg leading-relaxed max-w-3xl">
          URLASTONE, Türkiye genelinde <strong className="text-white">doğal taş cephe kaplama uygulaması</strong>{' '}
          için üç farklı hizmet modeli sunar: İzmir bölgesinde kendi ekibimizle anahtar teslim, diğer şehirlerde
          panel + teknik destek, büyük projelerde saha süpervizörü. Hangi şehirde olursanız olun, projeniz
          için doğru çözümü tasarlıyoruz.
        </p>
        <div className="flex flex-wrap gap-3 mt-10">
          <Link href="/teklif" className="inline-flex items-center gap-2 bg-gold-400 text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-[#c9a855] transition-all">
            Teklif Al <ArrowRight size={16} />
          </Link>
          <Link href="/simulasyon" className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.12] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-white/[0.1] transition-all">
            AI Simülasyon
          </Link>
          <Link href="/turkiye-dogal-tas-ureticisi" className="inline-flex items-center gap-2 text-white/60 px-4 py-3 text-sm font-mono hover:text-gold-400 transition-colors">
            Üretici sayfamız →
          </Link>
        </div>
      </section>

      <section className="px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-4">Hizmet Modelleri</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-12">Her şehir için doğru hizmet</h2>
          <div className="space-y-5">
            {SERVICE_MODELS.map(({ title, desc, badge }) => (
              <div key={title} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7 hover:border-gold-400/30 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-heading text-xl font-semibold">{title}</h3>
                  <span className="font-mono text-[10px] text-gold-400 px-3 py-1 rounded-full border border-gold-400/30 bg-gold-400/[0.08] whitespace-nowrap">{badge}</span>
                </div>
                <p className="text-white/55 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-4">Uygulama Alanları</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-12">Nereye uyguluyoruz?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {APPLICATIONS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                <Icon size={22} className="text-gold-400 mb-4" />
                <h3 className="font-heading text-lg font-semibold mb-2" dangerouslySetInnerHTML={{ __html: title }} />
                <p className="text-white/55 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: desc }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-4">Türkiye Geneli Bölgeler</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Her şehre çözümümüz var</h2>
          <p className="text-white/55 max-w-2xl mb-10">
            Aşağıdaki şehirlerde projelerimiz bulunmaktadır. Sizin şehrinizde projemiz olmasa bile teklif alabilir, hizmet modelimizi planlayabiliriz:
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
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-4">Sıkça Sorulan Sorular</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-12">Türkiye doğal taş uygulaması hakkında</h2>
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
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
            Türkiye\'deki projeniz için <span className="text-gold-400">ücretsiz teklif</span>
          </h2>
          <p className="text-white/55 mb-10">
            Şehrinizi ve proje detaylarınızı paylaşın, size en uygun hizmet modelini önerelim.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/teklif" className="inline-flex items-center gap-2 bg-gold-400 text-black px-7 py-4 rounded-full text-sm font-medium hover:bg-[#c9a855] transition-all">
              Teklif Al <ArrowRight size={16} />
            </Link>
            <Link href="/simulasyon" className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.12] text-white px-7 py-4 rounded-full text-sm font-medium hover:bg-white/[0.1] transition-all">
              AI Simülasyon
            </Link>
            <Link href="/turkiye-dogal-tas-ureticisi" className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] text-white px-7 py-4 rounded-full text-sm font-medium hover:bg-white/[0.08] transition-all">
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
