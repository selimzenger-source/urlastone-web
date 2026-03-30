import { Metadata } from 'next'
import { generateSlug } from '@/lib/slug'
import AppDetailClient from './AppDetailClient'

const BASE_URL = 'https://www.urlastone.com'

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
        next: { revalidate: 3600 },
      }
    )
    if (!res.ok) return null
    const projects = await res.json()
    return projects.find((p: { project_name: string }) => generateSlug(p.project_name) === slug) || null
  } catch {
    return null
  }
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug)

  if (!project) {
    return { title: 'Uygulama Bulunamadı' }
  }

  const title = `${project.project_name} - ${project.category || 'Doğal Taş'} Uygulaması`
  const description = project.description
    ? project.description.slice(0, 155) + (project.description.length > 155 ? '...' : '')
    : `${project.project_name} doğal taş uygulaması. ${project.city ? project.city + '.' : ''} ${project.product || ''} ${project.category || ''}. URLASTONE referans projeler.`

  const ogImage = project.photos?.[0] || '/og-image.jpg'

  return {
    title,
    description,
    openGraph: {
      title: `${project.project_name} | URLASTONE Uygulamalar`,
      description,
      url: `${BASE_URL}/uygulamalarimiz/${params.slug}`,
      images: [{ url: ogImage, alt: project.project_name }],
    },
    alternates: {
      canonical: `${BASE_URL}/uygulamalarimiz/${params.slug}`,
    },
  }
}

export default function AppDetailPage() {
  return <AppDetailClient />
}
