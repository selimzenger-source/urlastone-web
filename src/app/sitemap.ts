import { MetadataRoute } from 'next'
import { generateSlug } from '@/lib/slug'

// Supabase REST API ile bloglari cek
async function getBlogs(): Promise<Array<{ slug: string; updated_at: string }>> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) return []

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/blogs?is_published=eq.true&select=slug,updated_at`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 3600 },
      }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

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
        next: { revalidate: 3600 },
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
  const altLocales = ['en', 'es', 'de', 'fr', 'ru', 'ar']

  // Dil alternatifleri oluştur
  function langAlternates(path: string) {
    const languages: Record<string, string> = {
      tr: `${baseUrl}${path}`,
    }
    for (const lang of altLocales) {
      languages[lang] = `${baseUrl}${path}${path.includes('?') ? '&' : '?'}lang=${lang}`
    }
    return { languages }
  }

  // Statik sayfalar
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1, alternates: langAlternates('/') },
    { url: `${baseUrl}/urunlerimiz`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.95, alternates: langAlternates('/urunlerimiz') },
    { url: `${baseUrl}/projelerimiz`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9, alternates: langAlternates('/projelerimiz') },
    { url: `${baseUrl}/simulasyon`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85, alternates: langAlternates('/simulasyon') },
    { url: `${baseUrl}/teklif`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85, alternates: langAlternates('/teklif') },
    { url: `${baseUrl}/hakkimizda`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7, alternates: langAlternates('/hakkimizda') },
    { url: `${baseUrl}/iletisim`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7, alternates: langAlternates('/iletisim') },
    { url: `${baseUrl}/referanslarimiz`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7, alternates: langAlternates('/referanslarimiz') },
    { url: `${baseUrl}/uygulamalarimiz`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8, alternates: langAlternates('/uygulamalarimiz') },
    { url: `${baseUrl}/taslar`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.75, alternates: langAlternates('/taslar') },
  ]

  // Dinamik proje sayfalari — artık dil alternatifleri ile
  const projects = await getProjects()
  const projectPages: MetadataRoute.Sitemap = projects.map((p) => {
    const projectPath = `/projelerimiz/${generateSlug(p.project_name)}`
    return {
      url: `${baseUrl}${projectPath}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      alternates: langAlternates(projectPath),
    }
  })

  // Sehir bazli SEO sayfalari — artık dil alternatifleri ile
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

  const cityPages: MetadataRoute.Sitemap = Array.from(cityMap.keys()).map((citySlug) => {
    const cityPath = `/projelerimiz/${citySlug}-dogal-tas`
    return {
      url: `${baseUrl}${cityPath}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
      alternates: langAlternates(cityPath),
    }
  })

  // Blog sayfalari
  const blogs = await getBlogs()
  const blogPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8, alternates: langAlternates('/blog') },
    ...blogs.map((b) => {
      const blogPath = `/blog/${b.slug}`
      return {
        url: `${baseUrl}${blogPath}`,
        lastModified: new Date(b.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
        alternates: langAlternates(blogPath),
      }
    }),
  ]

  return [...staticPages, ...projectPages, ...cityPages, ...blogPages]
}
