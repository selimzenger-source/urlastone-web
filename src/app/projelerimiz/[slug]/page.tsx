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
    seoContent = (
      <section className="sr-only" aria-hidden="true">
        <h1>{cityName} Doğal Taş Projeleri — URLASTONE</h1>
        <p>
          {cityName} bölgesinde URLASTONE doğal taş cephe kaplama ve uygulamaları.
          {count > 0 ? ` ${cityName} şehrinde tamamlanmış ${count} referans projemiz bulunmaktadır.` : ''} Traverten, bazalt, kalker ve mermer dış cephe seçenekleri,
          iç mekan kaplamaları ve peyzaj çözümleri. {cityName} için doğal taş danışmanlığı,
          numune ve teklif alma imkanı.
        </p>
        <p>Bölge: {cityName}. Hizmet: Dış cephe kaplama, iç mekan duvar, zemin, peyzaj. Ürünler: Doğal taş — traverten, mermer, bazalt, kalker.</p>
      </section>
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
