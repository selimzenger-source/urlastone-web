import { NextResponse } from 'next/server'

const INDEXNOW_KEY = '3bb5b687c4c1628360b44325fb6f6bda'
const HOST = 'www.urlastone.com'

// Tüm önemli sayfaları Bing/Yandex'e bildir
export async function POST() {
  const urls = [
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

  try {
    const res = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    })

    console.log(`[IndexNow] Submitted ${urls.length} URLs, status: ${res.status}`)
    return NextResponse.json({ ok: true, status: res.status, urlCount: urls.length })
  } catch (err) {
    console.error('[IndexNow] Error:', err)
    return NextResponse.json({ ok: false, error: 'IndexNow submission failed' }, { status: 500 })
  }
}
