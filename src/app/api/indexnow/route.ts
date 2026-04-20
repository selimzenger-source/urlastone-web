import { NextRequest, NextResponse } from 'next/server'
import { pingIndexNow } from '@/lib/indexnow'

const DEFAULT_URLS = [
  'https://www.urlastone.com',
  'https://www.urlastone.com/urunlerimiz',
  'https://www.urlastone.com/projelerimiz',
  'https://www.urlastone.com/simulasyon',
  'https://www.urlastone.com/teklif',
  'https://www.urlastone.com/hakkimizda',
  'https://www.urlastone.com/iletisim',
  'https://www.urlastone.com/referanslarimiz',
  'https://www.urlastone.com/taslar',
  'https://www.urlastone.com/blog',
]

/**
 * Manuel tetik: body.urls varsa o URL'leri, yoksa default 10 sayfayi gonder.
 */
export async function POST(req: NextRequest) {
  let urls: string[] = DEFAULT_URLS
  try {
    const body = await req.json().catch(() => null)
    if (body?.urls && Array.isArray(body.urls) && body.urls.length > 0) {
      urls = body.urls
    }
  } catch { /* body yok — default */ }

  await pingIndexNow(urls)
  return NextResponse.json({ ok: true, urlCount: urls.length })
}
