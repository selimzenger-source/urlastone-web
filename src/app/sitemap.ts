import { MetadataRoute } from 'next'
import { generateSlug } from '@/lib/slug'

// Supabase REST API ile projeleri cek (build time'da calisir)
async function getProjects(): Promise<Array<{ project_name: string; city: string; updated_at: string }>> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) return []

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/projects?active=eq.true&select=project_name,city,updated_at`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 3600 }, // 1 saat cache
      }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.urlastone.com'

  // Statik sayfalar
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/urunlerimiz`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.95 },
    { url: `${baseUrl}/projelerimiz`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/simulasyon`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${baseUrl}/teklif`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${baseUrl}/hakkimizda`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/iletisim`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/referanslarimiz`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]

  // Dinamik proje sayfalari
  const projects = await getProjects()
  const projectPages: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${baseUrl}/projelerimiz/${generateSlug(p.project_name)}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  // Sehir bazli SEO sayfalari
  const cityMap = new Map<string, string>()
  for (const p of projects) {
    if (!p.city) continue
    const parts = p.city.split(/[,\/]/).map(s => s.trim())
    const mainCity = parts[parts.length - 1] || parts[0]
    const slug = generateSlug(mainCity)
    if (slug && !cityMap.has(slug)) {
      cityMap.set(slug, mainCity)
    }
  }

  const cityPages: MetadataRoute.Sitemap = Array.from(cityMap.keys()).map((citySlug) => ({
    url: `${baseUrl}/projelerimiz/${citySlug}-dogal-tas`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  return [...staticPages, ...projectPages, ...cityPages]
}
