import { Metadata } from 'next'
import { generateSlug } from '@/lib/slug'
import ProjectPageClient from './ProjectPageClient'

const CITY_SUFFIX = '-dogal-tas'
const BASE_URL = 'https://www.urlastone.com'

// Supabase REST API ile proje verisini çek (server-side)
async function getProjectBySlug(slug: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) return null

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/projects?active=eq.true&select=project_name,city,description,photos,category,product`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 60 },
      }
    )
    if (!res.ok) return null
    const projects = await res.json()
    return projects.find((p: { project_name: string }) => generateSlug(p.project_name) === slug) || null
  } catch {
    return null
  }
}

// Şehir sayfası için projeleri çek
async function getCityInfo(citySlug: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) return { count: 0, cityName: citySlug }

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/projects?active=eq.true&select=city`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 60 },
      }
    )
    if (!res.ok) return { count: 0, cityName: citySlug }
    const projects = await res.json()

    let cityName = citySlug.charAt(0).toUpperCase() + citySlug.slice(1)
    let count = 0

    for (const p of projects) {
      if (!p.city) continue
      const parts = p.city.split(/[,\/]/).map((s: string) => s.trim())
      for (const part of parts) {
        if (generateSlug(part) === citySlug) {
          cityName = part
          count++
          break
        }
      }
    }

    return { count, cityName }
  } catch {
    return { count: 0, cityName: citySlug }
  }
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const slug = params.slug
  const isCityPage = slug.endsWith(CITY_SUFFIX)

  if (isCityPage) {
    const citySlug = slug.replace(CITY_SUFFIX, '')
    const { count, cityName } = await getCityInfo(citySlug)

    const title = `${cityName} Doğal Taş Projeleri - Cephe Kaplama Uygulamaları`
    const description = `${cityName} bölgesindeki ${count > 0 ? count + ' ' : ''}doğal taş projemiz. Traverten, bazalt, kalker, mermer dış cephe kaplama, iç mekan ve peyzaj uygulamaları. URLASTONE ${cityName} referansları.`

    return {
      title,
      description,
      openGraph: {
        title: `${cityName} Doğal Taş Projeleri | URLASTONE`,
        description,
        url: `${BASE_URL}/projelerimiz/${slug}`,
      },
      alternates: {
        canonical: `${BASE_URL}/projelerimiz/${slug}`,
      },
    }
  }

  // Normal proje detay sayfası
  const project = await getProjectBySlug(slug)

  if (!project) {
    return {
      title: 'Proje Bulunamadı',
    }
  }

  const title = `${project.project_name} - ${project.city || 'Doğal Taş'} Projesi`
  const description = project.description
    ? project.description.slice(0, 155) + (project.description.length > 155 ? '...' : '')
    : `${project.project_name} doğal taş projesi. ${project.city ? project.city + ' bölgesi.' : ''} ${project.product ? project.product + ' uygulaması.' : ''} ${project.category ? project.category + '.' : ''} URLASTONE referans projeler.`

  const ogImage = project.photos?.[0] || '/og-image.jpg'

  return {
    title,
    description,
    openGraph: {
      title: `${project.project_name} | URLASTONE Projeler`,
      description,
      url: `${BASE_URL}/projelerimiz/${slug}`,
      images: [{ url: ogImage, alt: project.project_name }],
    },
    alternates: {
      canonical: `${BASE_URL}/projelerimiz/${slug}`,
    },
  }
}

// Server-side SEO content — Google bot client-side React'i çalıştırmadan ham HTML
// gördüğünde her proje/şehir sayfası AYNI gövdeyi gösteriyordu (sadece <title> farklı).
// → Google 'duplicate' sayıp canonical olarak rastgele şehir sayfasını seçiyordu.
// Şimdi her sayfa için server-rendered ayırt edici içerik HTML'de var; bot doğru
// canonical kararı verir, ProjectPageClient kullanıcıya zengin UI'yı yine sunar.
export default async function ProjectSlugPage(
  { params }: { params: { slug: string } }
) {
  const slug = params.slug
  const isCityPage = slug.endsWith(CITY_SUFFIX)

  let seoContent: React.ReactNode = null

  if (isCityPage) {
    const citySlug = slug.replace(CITY_SUFFIX, '')
    const { count, cityName } = await getCityInfo(citySlug)

    // Şehir bazlı FAQ — her şehir için aynı kalıp, sadece şehir adı değişir.
    // FAQPage JSON-LD + sr-only HTML olarak basılır → AI engines ve Google
    // "People Also Ask" için kaynak gösterir; UI'a dokunulmaz.
    const cityFaqs = [
      {
        q: `${cityName}'da doğal taş üreticisi var mı?`,
        a: `URLASTONE, İzmir Urla'da bulunan kendi üretim tesisinden ${cityName} dahil tüm Türkiye'ye doğal taş paneli sevkiyatı yapan tam donanımlı bir üreticidir. Traverten, bazalt, kalker ve mermer Rockshell ince paneller (1-3 cm) ${cityName}'a 3-7 iş günü içinde teslim edilir.`,
      },
      {
        q: `${cityName}'da doğal taş cephe kaplama uygulaması yapıyor musunuz?`,
        a: `Evet. ${cityName} bölgesinde URLASTONE teknik ekibi ile anahtar teslim cephe kaplama uygulaması mümkündür. Yerinde keşif, mockup, montaj, derz ve emprenye dahil tek elden hizmet. ${count > 0 ? `${cityName} bölgesinde tamamlanmış ${count} referans projemiz bulunmaktadır.` : 'Bölgenizdeki ilk projelerinizden biri için bize ulaşabilirsiniz.'}`,
      },
      {
        q: `${cityName} için hangi doğal taş türleri uygundur?`,
        a: `${cityName}'nın iklim ve mimari karakterine göre traverten (sıcak, klasik), bazalt (modern, dayanıklı), kalker (Akdeniz, fosil dokulu) ve mermer (lüks, damarlı) seçenekleri kullanılabilir. URLASTONE her dört taş türünde de 4 farklı desen ailesi (Nature, Line, Mix, Crazy) sunar.`,
      },
      {
        q: `${cityName}'da doğal taş fiyatları ne kadar?`,
        a: `Rockshell doğal taş panellerin m² fiyatı $30-$130 USD aralığındadır. ${cityName} dahil Türkiye geneline fabrika çıkışı + ambalaj + sevkiyat ücreti dahildir. Anahtar teslim uygulama isterseniz işçilik kalemi ayrıca eklenir. Net fiyat için urlastone.com/teklif sayfasından bilgi formu doldurun.`,
      },
      {
        q: `${cityName}'a doğal taş ne kadar sürede teslim edilir?`,
        a: `Stoktaki ürünler için ${cityName} bölgesine 3-7 iş günü içinde teslim. Özel kesim ve büyük projeler için 10-21 iş günü hazırlık süresi gerekebilir. Sevkiyat EPAL paletli, stretch wrap korumalı yapılır.`,
      },
      {
        q: `${cityName}'da projemiz için ücretsiz numune alabilir miyim?`,
        a: `Evet, ${cityName} dahil tüm Türkiye'ye ciddi projeler için ücretsiz 10x10 cm numune gönderiyoruz. Numune talebinizi urlastone.com/teklif veya WhatsApp +90 553 232 21 44 üzerinden iletebilirsiniz.`,
      },
    ]

    const faqLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: cityFaqs.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    }

    seoContent = (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
        <section className="sr-only" aria-hidden="true">
          <h1>{cityName} Doğal Taş Projeleri — URLASTONE</h1>
          <p>
            {cityName} bölgesinde URLASTONE doğal taş cephe kaplama ve uygulamaları.
            {count > 0 ? ` ${cityName} şehrinde tamamlanmış ${count} referans projemiz bulunmaktadır.` : ''} Traverten, bazalt, kalker ve mermer dış cephe seçenekleri,
            iç mekan kaplamaları ve peyzaj çözümleri. {cityName} için doğal taş danışmanlığı,
            numune ve teklif alma imkanı.
          </p>
          <p>Bölge: {cityName}. Hizmet: Dış cephe kaplama, iç mekan duvar, zemin, peyzaj. Ürünler: Doğal taş — traverten, mermer, bazalt, kalker.</p>
          <h2>{cityName} Doğal Taş — Sıkça Sorulan Sorular</h2>
          {cityFaqs.map((f, i) => (
            <div key={i}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </section>
      </>
    )
  } else {
    const project = await getProjectBySlug(slug)
    if (project) {
      const photos: string[] = Array.isArray(project.photos) ? project.photos : []
      seoContent = (
        <section className="sr-only" aria-hidden="true">
          <h1>{project.project_name}</h1>
          {project.city && <p>Konum: {project.city}</p>}
          {project.category && <p>Kategori: {project.category}</p>}
          {project.product && <p>Ürün: {project.product}</p>}
          {project.description && <p>{project.description}</p>}
          <p>URLASTONE doğal taş referans projesi: {project.project_name}{project.city ? `, ${project.city}` : ''}. {project.product ? `${project.product} uygulaması. ` : ''}{project.category ? `${project.category} kategorisinde.` : ''}</p>
          {photos.slice(0, 6).map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={p} alt={`${project.project_name} - fotoğraf ${i + 1}`} />
          ))}
        </section>
      )
    }
  }

  return (
    <>
      {seoContent}
      <ProjectPageClient />
    </>
  )
}
