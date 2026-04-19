import { NextRequest, NextResponse } from 'next/server'

const validLocales = ['tr', 'en', 'es', 'de', 'fr', 'ru', 'ar']

export async function middleware(request: NextRequest) {
  const { searchParams, pathname } = request.nextUrl
  const lang = searchParams.get('lang')

  // Markdown for Agents (Cloudflare standardi)
  // Accept: text/markdown basligiyla gelen istekler icin markdown dondur.
  // Tarayicilar HTML almaya devam eder (default), AI agentlar markdown alir.
  const accept = request.headers.get('accept') || ''
  const wantsMarkdown =
    accept.includes('text/markdown') ||
    accept.startsWith('text/markdown')

  if (wantsMarkdown && (pathname === '/' || pathname === '')) {
    // Ana sayfa icin llms.txt icerigini markdown olarak dondur
    const llmsUrl = new URL('/llms.txt', request.url)
    const llmsRes = await fetch(llmsUrl.toString())
    if (llmsRes.ok) {
      const markdown = await llmsRes.text()
      return new NextResponse(markdown, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'X-Markdown-Source': 'llms.txt',
          Vary: 'Accept',
        },
      })
    }
  }

  const response = NextResponse.next()

  // Tum sayfalara Vary: Accept ekle (content negotiation icin)
  response.headers.set('Vary', 'Accept, Accept-Language')

  if (lang && validLocales.includes(lang)) {
    response.headers.set('Content-Language', lang)
    // Cookie ile dil tercihini persist et
    response.cookies.set('urlastone-lang', lang, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
    })
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|xml|txt|mp4|webm)).*)',
  ],
}
