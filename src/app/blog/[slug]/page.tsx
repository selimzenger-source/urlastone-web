import BlogPostClient from './BlogPostClient'

// Server component for SEO metadata
async function getBlog(slug: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) return null

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/blogs?slug=eq.${slug}&is_published=eq.true&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 60 },
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data?.[0] || null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const blog = await getBlog(slug)

  if (!blog) {
    return { title: 'Blog Yazısı Bulunamadı | URLASTONE' }
  }

  return {
    title: `${blog.title} | URLASTONE Blog`,
    description: blog.meta_description || blog.title,
    openGraph: {
      title: blog.title,
      description: blog.meta_description || blog.title,
      url: `https://www.urlastone.com/blog/${slug}`,
      images: blog.cover_image_url ? [{ url: blog.cover_image_url, width: 1200, height: 630 }] : undefined,
      type: 'article',
      publishedTime: blog.published_at,
      authors: [blog.author_name],
    },
    alternates: {
      canonical: `https://www.urlastone.com/blog/${slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const blog = await getBlog(slug)

  return <BlogPostClient blog={blog} slug={slug} />
}
