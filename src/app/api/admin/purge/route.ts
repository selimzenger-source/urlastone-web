import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/admin/purge — admin password ile çağrılır, verilen path listesini
// Vercel CDN cache'inden temizler. revalidatePath Next.js cache invalidation
// API'sini kullanır; ardından gelen ilk istek fresh content alır.
//
// Kullanım:
//   curl -X POST https://www.urlastone.com/api/admin/purge \
//     -H "x-admin-password: $PW" -H "Content-Type: application/json" \
//     -d '{"paths": ["/izmir-dogal-tas-ureticisi", "/blog/foo"]}'
export async function POST(req: NextRequest) {
  const pw = req.headers.get('x-admin-password')
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { paths?: string[] } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 })
  }

  if (!Array.isArray(body.paths) || body.paths.length === 0) {
    return NextResponse.json({ error: '`paths` array gerekli' }, { status: 400 })
  }

  const purged: string[] = []
  for (const p of body.paths) {
    if (typeof p !== 'string' || !p.startsWith('/')) continue
    try {
      revalidatePath(p)
      purged.push(p)
    } catch (err) {
      console.error('[purge] failed for', p, err)
    }
  }

  return NextResponse.json({ ok: true, purged })
}
