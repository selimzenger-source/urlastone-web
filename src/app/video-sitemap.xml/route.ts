// Google Video Sitemap — videolar Google Video / Discover sonuçlarında çıksın
// https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps

import { generateSlug } from '@/lib/slug'

export const revalidate = 600 // 10 dakika CDN cache

interface ProjectRow {
  project_name: string
  city: string
  description: string | null
  photos: string[] | null
  video_urls: string[] | null
  updated_at: string
}

async function getProjectsWithVideos(): Promise<ProjectRow[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) return []

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/projects?active=eq.true&video_urls=not.is.null&select=project_name,city,description,photos,video_urls,updated_at`,
      {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
        cache: 'no-store',
      }
    )
    if (!res.ok) return []
    const data = await res.json()
    // Filter: en az bir video_url'i olanlar
    return Array.isArray(data) ? data.filter((p: ProjectRow) => p.video_urls && p.video_urls.length > 0) : []
  } catch {
    return []
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const baseUrl = 'https://www.urlastone.com'
  const projects = await getProjectsWithVideos()

  const entries = projects.flatMap((p) => {
    const slug = generateSlug(p.project_name)
    const pageUrl = `${baseUrl}/projelerimiz/${slug}`
    const thumbnail = p.photos?.[0] || `${baseUrl}/featured-traverten.jpg`
    const description = (p.description || `${p.project_name} — ${p.city} doğal taş projesi`).slice(0, 2048)

    return p.video_urls!.map((videoUrl) => `
  <url>
    <loc>${escapeXml(pageUrl)}</loc>
    <video:video>
      <video:thumbnail_loc>${escapeXml(thumbnail)}</video:thumbnail_loc>
      <video:title>${escapeXml(p.project_name)}</video:title>
      <video:description>${escapeXml(description)}</video:description>
      <video:content_loc>${escapeXml(videoUrl)}</video:content_loc>
      <video:family_friendly>yes</video:family_friendly>
      <video:requires_subscription>no</video:requires_subscription>
      <video:live>no</video:live>
      <video:publication_date>${new Date(p.updated_at).toISOString()}</video:publication_date>
      <video:uploader info="${baseUrl}">URLA STONE</video:uploader>
    </video:video>
  </url>`).join('')
  }).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">${entries}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=600',
    },
  })
}
