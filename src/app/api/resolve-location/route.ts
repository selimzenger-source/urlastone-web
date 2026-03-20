import { NextRequest, NextResponse } from 'next/server'

// POST /api/resolve-location - Google Maps URL'den veya Place ID'den koordinat çöz
export async function POST(req: NextRequest) {
  try {
    const { url, query } = await req.json()

    // 1. Google Maps URL varsa, takip edip koordinat çıkar
    if (url) {
      // Place ID hex'ten CID çıkar
      const cidMatch = url.match(/0x[0-9a-f]+:0x([0-9a-f]+)/i)
      if (cidMatch) {
        const cidHex = cidMatch[1]
        const cidDecimal = BigInt('0x' + cidHex).toString()
        // CID ile Google Maps URL oluştur ve fetch et
        const mapsUrl = `https://www.google.com/maps?cid=${cidDecimal}`
        try {
          const res = await fetch(mapsUrl, {
            redirect: 'follow',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
          })
          const finalUrl = res.url
          const html = await res.text()

          // Final URL'den koordinat çek
          const coordPatterns = [
            /@(-?\d+\.?\d+),(-?\d+\.?\d+)/,
            /!3d(-?\d+\.?\d+)!4d(-?\d+\.?\d+)/,
            /center=(-?\d+\.?\d+),(-?\d+\.?\d+)/,
          ]
          for (const p of coordPatterns) {
            const m = finalUrl.match(p)
            if (m) {
              return NextResponse.json({ lat: parseFloat(m[1]), lng: parseFloat(m[2]) })
            }
          }

          // HTML içinden koordinat çek
          const htmlPatterns = [
            /\[null,null,(-?\d+\.\d+),(-?\d+\.\d+)\]/,
            /"(-?\d+\.\d{4,})",\s*"(-?\d+\.\d{4,})"/,
            /center\\u003d(-?\d+\.\d+)%2C(-?\d+\.\d+)/,
            /@(-?\d+\.\d{4,}),(-?\d+\.\d{4,})/,
          ]
          for (const p of htmlPatterns) {
            const m = html.match(p)
            if (m) {
              const lat = parseFloat(m[1])
              const lng = parseFloat(m[2])
              if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                return NextResponse.json({ lat, lng })
              }
            }
          }
        } catch (e) {
          // Google Maps fetch başarısız - devam et
        }
      }

      // Doğrudan URL'yi takip et
      try {
        const res = await fetch(url, {
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })
        const finalUrl = res.url
        const coordMatch = finalUrl.match(/@(-?\d+\.?\d+),(-?\d+\.?\d+)/)
        if (coordMatch) {
          return NextResponse.json({ lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) })
        }

        // HTML'den koordinat çek
        const html = await res.text()
        const htmlMatch = html.match(/\[null,null,(-?\d+\.\d+),(-?\d+\.\d+)\]/) ||
          html.match(/@(-?\d+\.\d{4,}),(-?\d+\.\d{4,})/)
        if (htmlMatch) {
          return NextResponse.json({ lat: parseFloat(htmlMatch[1]), lng: parseFloat(htmlMatch[2]) })
        }
      } catch (e) {
        // URL fetch başarısız
      }

      // URL'den yer adını çıkar ve Nominatim'de ara
      const placeMatch = url.match(/\/place\/([^/]+)/)
      if (placeMatch) {
        const placeName = decodeURIComponent(placeMatch[1]).replace(/\+/g, ' ')
        if (placeName) {
          const nomRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}&limit=1&addressdetails=1`,
            { headers: { 'Accept-Language': 'tr', 'User-Agent': 'UrlastoneAdmin/1.0' } }
          )
          const nomData = await nomRes.json()
          if (nomData && nomData.length > 0) {
            const r = nomData[0]
            const addr = r.address || {}
            const province = addr.province || addr.state || ''
            const town = addr.city || addr.town || addr.county || ''
            return NextResponse.json({
              lat: parseFloat(r.lat),
              lng: parseFloat(r.lon),
              city: province || town || '',
              country: addr.country || 'Türkiye',
              address: r.display_name?.split(',').slice(0, 3).join(',') || '',
            })
          }
        }
      }
    }

    // 2. Metin araması (Nominatim)
    if (query) {
      const nomRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'tr', 'User-Agent': 'UrlastoneAdmin/1.0' } }
      )
      const nomData = await nomRes.json()
      if (nomData && nomData.length > 0) {
        const r = nomData[0]
        const addr = r.address || {}
        // İl seviyesinde şehir
        const province = addr.province || addr.state || ''
        const town = addr.city || addr.town || addr.county || ''
        const city = province || town || ''
        const country = addr.country || 'Türkiye'
        const district = addr.suburb || addr.district || addr.town || addr.village || ''
        const shortAddress = [district, town !== city ? town : ''].filter(Boolean).join(', ')
        return NextResponse.json({
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon),
          city,
          country,
          address: shortAddress || r.display_name?.split(',').slice(0, 3).join(',') || '',
        })
      }
    }

    return NextResponse.json({ error: 'Konum bulunamadı' }, { status: 404 })
  } catch (e) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
