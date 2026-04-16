export const dynamic = 'force-dynamic'

interface BlogPost {
  title: string
  slug: string
  meta_description: string | null
  cover_image_url: string | null
  published_at: string
  updated_at: string | null
  author_name: string | null
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let posts: BlogPost[] = []

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/blogs?is_published=eq.true&order=published_at.desc&limit=50&select=title,slug,meta_description,cover_image_url,published_at,updated_at,author_name`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          cache: 'no-store',
        }
      )
      if (res.ok) {
        posts = await res.json()
      }
    } catch {
      // fallback to empty
    }
  }

  const lastBuildDate = posts.length > 0
    ? new Date(posts[0].published_at).toUTCString()
    : new Date().toUTCString()

  const items = posts.map((post) => {
    const pubDate = new Date(post.published_at).toUTCString()
    const description = escapeXml(post.meta_description || post.title)
    const title = escapeXml(post.title)
    const link = `https://www.urlastone.com/blog/${post.slug}`

    return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
      <author>info@urlastone.com (${escapeXml(post.author_name || 'URLASTONE')})</author>${post.cover_image_url ? `
      <enclosure url="${escapeXml(post.cover_image_url)}" type="image/jpeg" />` : ''}
    </item>`
  }).join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>URLASTONE Blog - Doğal Taş, Mimarlık, Tasarım</title>
    <link>https://www.urlastone.com/blog</link>
    <description>URLASTONE doğal taş blog: traverten, bazalt, kalker, mermer hakkında makaleler. Cephe kaplama, iç mekan tasarım, mimari ilham ve uygulama rehberleri.</description>
    <language>tr</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="https://www.urlastone.com/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>https://www.urlastone.com/og-image.jpg</url>
      <title>URLASTONE Blog</title>
      <link>https://www.urlastone.com/blog</link>
    </image>
${items}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
