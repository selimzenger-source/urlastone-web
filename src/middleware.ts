import { NextRequest, NextResponse } from 'next/server'

const validLocales = ['tr', 'en', 'es', 'de', 'fr', 'ru', 'ar']

export function middleware(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const lang = searchParams.get('lang')

  const response = NextResponse.next()

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
