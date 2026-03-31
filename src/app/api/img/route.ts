import { NextRequest, NextResponse } from 'next/server'

// Supabase görselleri için CDN proxy
// İlk istek: Supabase'den çeker, Vercel CDN 1 yıl cache'ler
// Sonraki istekler: Vercel Edge'den servis edilir (Supabase egress sıfır)
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')

  if (!url) {
    return new NextResponse('URL gerekli', { status: 400 })
  }

  // Sadece Supabase URL'lerini proxy'le (güvenlik)
  if (!url.includes('supabase.co/storage')) {
    return new NextResponse('Sadece Supabase storage URL desteklenir', { status: 403 })
  }

  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'image/*' },
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      return new NextResponse('Görsel bulunamadı', { status: 404 })
    }

    const buffer = await res.arrayBuffer()
    const contentType = res.headers.get('content-type') || 'image/jpeg'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
        'CDN-Cache-Control': 'public, max-age=31536000, immutable',
        'Vercel-CDN-Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    // Proxy başarısız olursa orijinal URL'e yönlendir (fallback)
    return NextResponse.redirect(url, { status: 302 })
  }
}
