import Link from 'next/link'
import { ArrowRight, Globe2, MapPin, Home } from 'lucide-react'

// ————————————————————————————————————————————————————————————
// Pillar SEO sayfalari icin paylasilan bolumler (server component)
// Gorunur, indexlenebilir icerik — GEO/AEO icin AI motorlarinin
// dogrudan alintilayabilecegi yapida tutulur
// ————————————————————————————————————————————————————————————

const PRICE_ROWS = [
  { stone: 'Traverten', panel: '$30 – $70', applied: '$80 – $140', note: 'En çok tercih edilen — Akdeniz ve klasik mimari' },
  { stone: 'Kalker', panel: '$35 – $75', applied: '$85 – $150', note: 'Yumuşak bej tonlar — sahil villaları' },
  { stone: 'Bazalt', panel: '$40 – $90', applied: '$95 – $170', note: 'En dayanıklı — modern cepheler, sert iklim' },
  { stone: 'Mermer', panel: '$60 – $130', applied: '$120 – $200', note: 'Premium — lobi, lüks konut, iç mekan' },
]

export function PricingSection() {
  return (
    <section className="px-6 py-20 border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">
        <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-4">Güncel Fiyat Aralıkları</p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Doğal taş m² fiyatları 2026</h2>
        <p className="text-white/55 max-w-2xl mb-10">
          Rockshell ince doğal taş panel fiyatları taş türü, desen, kalınlık ve metraja göre değişir.
          Aşağıdaki aralıklar yön göstermesi içindir — net fiyat için ücretsiz teklif alın:
        </p>
        <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.04] text-left">
                <th className="font-heading font-semibold px-5 py-4">Taş Türü</th>
                <th className="font-heading font-semibold px-5 py-4 whitespace-nowrap">Panel (m²)</th>
                <th className="font-heading font-semibold px-5 py-4 whitespace-nowrap">Uygulama Dahil (m²)</th>
                <th className="font-heading font-semibold px-5 py-4 hidden md:table-cell">Öne Çıkan Kullanım</th>
              </tr>
            </thead>
            <tbody>
              {PRICE_ROWS.map(({ stone, panel, applied, note }) => (
                <tr key={stone} className="border-t border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4 font-heading font-semibold">{stone}</td>
                  <td className="px-5 py-4 font-mono text-gold-400 whitespace-nowrap">{panel}</td>
                  <td className="px-5 py-4 font-mono text-white/80 whitespace-nowrap">{applied}</td>
                  <td className="px-5 py-4 text-white/50 hidden md:table-cell">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-white/35 text-xs font-mono mt-4">
          * USD/m², fabrika çıkışı panel ve İzmir bölgesi anahtar teslim uygulama referans aralıkları. Nakliye, metraj indirimi ve özel kesim teklifte netleşir.
        </p>
        <div className="flex flex-wrap gap-3 mt-8">
          <Link href="/teklif" className="inline-flex items-center gap-2 bg-gold-400 text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-[#c9a855] transition-all">
            Ücretsiz Net Fiyat Al <ArrowRight size={16} />
          </Link>
          <Link href="/urunlerimiz" className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.12] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-white/[0.1] transition-all">
            Ürünleri İncele
          </Link>
        </div>
      </div>
    </section>
  )
}

const EGE_CITIES = [
  { name: 'İzmir', href: '/projelerimiz/izmir-dogal-tas' },
  { name: 'Muğla / Bodrum', href: '/projelerimiz/mugla-dogal-tas' },
  { name: 'Aydın / Kuşadası', href: '/projelerimiz/aydin-dogal-tas' },
  { name: 'Balıkesir / Ayvalık', href: '/projelerimiz/balikesir-dogal-tas' },
]

const OTHER_CITIES = [
  { name: 'İstanbul', href: '/projelerimiz/istanbul-dogal-tas' },
  { name: 'Antalya', href: '/projelerimiz/antalya-dogal-tas' },
  { name: 'Bursa', href: '/projelerimiz/bursa-dogal-tas' },
  { name: 'Kocaeli', href: '/projelerimiz/kocaeli-dogal-tas' },
  { name: 'Hatay', href: '/projelerimiz/hatay-dogal-tas' },
]

export function EgeSection() {
  return (
    <section className="px-6 py-20 border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">
        <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-4">Bölgesel Uzmanlık</p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Ege Bölgesi doğal taşın kalbi</h2>
        <p className="text-white/55 max-w-3xl mb-10">
          Üretim tesisimiz Ege&apos;nin merkezinde, İzmir Urla&apos;da. Çeşme&apos;den Bodrum&apos;a, Ayvalık&apos;tan
          Kuşadası&apos;na — Ege&apos;nin sahil mimarisini en iyi bilen ekibiz. Tuzlu deniz havasına dayanıklı emprenye,
          Akdeniz tarzına uygun traverten ve kalker kombinasyonları bölge projelerimizin imzasıdır. Şehrinizdeki
          projelerimizi inceleyin:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-gold-400" /> Ege Bölgesi
            </h3>
            <div className="flex flex-wrap gap-2">
              {EGE_CITIES.map(({ name, href }) => (
                <Link key={name} href={href} className="bg-gold-400/[0.08] border border-gold-400/[0.25] rounded-full px-4 py-2 text-sm text-gold-400 hover:bg-gold-400/[0.15] hover:border-gold-400/40 transition-all">
                  {name}
                </Link>
              ))}
              <span className="bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-2 text-sm text-white/50">Denizli</span>
              <span className="bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-2 text-sm text-white/50">Manisa</span>
              <span className="bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-2 text-sm text-white/50">Çanakkale</span>
            </div>
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-gold-400" /> Türkiye Geneli
            </h3>
            <div className="flex flex-wrap gap-2">
              {OTHER_CITIES.map(({ name, href }) => (
                <Link key={name} href={href} className="bg-white/[0.04] border border-white/[0.10] rounded-full px-4 py-2 text-sm text-white/70 hover:border-gold-400/30 hover:text-gold-400 transition-all">
                  {name}
                </Link>
              ))}
              <Link href="/projelerimiz" className="bg-white/[0.04] border border-white/[0.10] rounded-full px-4 py-2 text-sm text-white/70 hover:border-gold-400/30 hover:text-gold-400 transition-all">
                Tüm Şehirler →
              </Link>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-10 text-sm font-mono">
          <Link href="/izmir-dogal-tas-ureticisi" className="text-white/50 hover:text-gold-400 transition-colors">İzmir doğal taş üreticisi →</Link>
          <Link href="/izmir-dogal-tas-uygulamasi" className="text-white/50 hover:text-gold-400 transition-colors">İzmir doğal taş uygulaması →</Link>
        </div>
      </div>
    </section>
  )
}

const GLOBAL_BLOCKS: Array<{ lang: string; flag: string; heading: string; text: string; cta: string; dir?: 'rtl' }> = [
  {
    lang: 'English', flag: 'EN',
    heading: 'Natural Stone Manufacturer in Turkey',
    text: 'URLASTONE manufactures patented Rockshell thin natural stone panels (travertine, basalt, limestone, marble) at its factory in Izmir, Turkey, and exports to 50+ countries across 5 continents. Container shipping, customs documentation, CAD files and installation guides included. 500+ completed projects since 2015.',
    cta: 'Get a Free Quote',
  },
  {
    lang: 'Deutsch', flag: 'DE',
    heading: 'Naturstein-Hersteller aus der Türkei',
    text: 'URLASTONE produziert patentierte Rockshell-Dünnsteinpaneele (Travertin, Basalt, Kalkstein, Marmor) im eigenen Werk in Izmir und exportiert in über 50 Länder — darunter Deutschland, Österreich und die Schweiz. Containerversand, Zolldokumentation, CAD-Dateien und Montageanleitung inklusive.',
    cta: 'Kostenloses Angebot anfordern',
  },
  {
    lang: 'Français', flag: 'FR',
    heading: 'Fabricant de pierre naturelle en Turquie',
    text: 'URLASTONE fabrique des panneaux de pierre naturelle mince Rockshell brevetés (travertin, basalte, calcaire, marbre) dans son usine d’Izmir et exporte vers plus de 50 pays, dont la France, la Belgique et la Suisse. Expédition par conteneur, documentation douanière, fichiers CAO et guide de pose inclus.',
    cta: 'Demander un devis gratuit',
  },
  {
    lang: 'Español', flag: 'ES',
    heading: 'Fabricante de piedra natural en Turquía',
    text: 'URLASTONE fabrica paneles de piedra natural fina Rockshell patentados (travertino, basalto, caliza, mármol) en su fábrica de Izmir y exporta a más de 50 países, incluida España. Envío en contenedor, documentación aduanera, archivos CAD y guía de instalación incluidos.',
    cta: 'Solicitar presupuesto gratuito',
  },
  {
    lang: 'Русский', flag: 'RU',
    heading: 'Производитель натурального камня из Турции',
    text: 'URLASTONE производит запатентованные тонкие каменные панели Rockshell (травертин, базальт, известняк, мрамор) на собственном заводе в Измире и экспортирует более чем в 50 стран, включая Россию и СНГ. Контейнерная доставка, таможенная документация, CAD-файлы и инструкция по монтажу включены.',
    cta: 'Получить бесплатное предложение',
  },
  {
    lang: 'العربية', flag: 'AR', dir: 'rtl',
    heading: 'مُصنّع الحجر الطبيعي من تركيا',
    text: 'تنتج URLASTONE ألواح الحجر الطبيعي الرقيقة Rockshell الحاصلة على براءة اختراع (ترافرتين، بازلت، حجر جيري، رخام) في مصنعها بمدينة إزمير، وتصدّر إلى أكثر من 50 دولة بما فيها السعودية والإمارات وقطر والكويت. شحن بالحاويات، وثائق جمركية، ملفات CAD ودليل تركيب.',
    cta: 'اطلب عرض سعر مجاني',
  },
]

export function GlobalSection() {
  return (
    <section className="px-6 py-20 border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">
        <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-4 flex items-center gap-2">
          <Globe2 size={14} /> International · 7 Languages
        </p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Tüm dünyaya ihracat 7 dilde hizmet</h2>
        <p className="text-white/55 max-w-3xl mb-12">
          Web sitemiz Türkçe, İngilizce, Almanca, Fransızca, İspanyolca, Rusça ve Arapça hizmet verir.
          İhracat ekibimiz teklif, teknik dokümantasyon ve lojistik süreçlerini kendi dilinizde yürütür:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GLOBAL_BLOCKS.map(({ lang, flag, heading, text, cta, dir }) => (
            <div key={flag} dir={dir} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-gold-400/25 transition-colors">
              <div className="flex items-center justify-between mb-3" dir="ltr">
                <span className="font-mono text-[10px] tracking-[0.2em] text-gold-400 border border-gold-400/30 rounded-full px-3 py-1">{flag}</span>
                <span className="text-white/30 text-xs font-mono">{lang}</span>
              </div>
              <h3 className="font-heading text-lg font-semibold mb-2">{heading}</h3>
              <p className="text-white/55 text-sm leading-relaxed mb-4">{text}</p>
              <Link href="/teklif" className="inline-flex items-center gap-2 text-gold-400 text-sm font-medium hover:text-[#c9a855] transition-colors">
                {cta} <ArrowRight size={14} className={dir === 'rtl' ? 'rotate-180' : ''} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HomeCTASection() {
  return (
    <section className="px-6 py-20 border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="group block relative overflow-hidden rounded-3xl border border-gold-400/20 hover:border-gold-400/50 transition-all duration-500">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/slide-7.jpg" alt="URLASTONE doğal taş — ana sayfa" loading="lazy"
            className="w-full h-[280px] md:h-[340px] object-cover group-hover:scale-[1.03] transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/20" />
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-14">
            <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase mb-4 flex items-center gap-2">
              <Home size={13} /> URLASTONE
            </p>
            <h2 className="font-heading text-3xl md:text-5xl font-bold leading-[1.1] mb-4 max-w-lg">
              Doğal taşın <span className="text-gold-400">tüm dünyasını</span> keşfedin
            </h2>
            <p className="text-white/60 text-sm md:text-base max-w-md mb-7">
              Hero projeler, AI simülasyon, katalog ve daha fazlası ana sayfamızda
            </p>
            <span className="inline-flex items-center gap-2 self-start bg-white text-black px-7 py-3.5 rounded-full text-sm font-medium group-hover:bg-gold-400 transition-colors duration-500">
              Ana Sayfaya Git <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  )
}
