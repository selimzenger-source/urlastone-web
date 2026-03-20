import { NextRequest, NextResponse } from 'next/server'

// Google Maps URL'den koordinat çıkar
function extractCoordsFromUrl(url: string): { lat: number; lng: number } | null {
  const text = decodeURIComponent(url)
  const patterns = [
    /@(-?\d+\.?\d+),(-?\d+\.?\d+)/,              // @38.123,26.456
    /!3d(-?\d+\.?\d+)!4d(-?\d+\.?\d+)/,           // !3d38.123!4d26.456
    /q=(-?\d+\.?\d+),(-?\d+\.?\d+)/,              // q=38.123,26.456
    /center=(-?\d+\.?\d+),(-?\d+\.?\d+)/,         // center=38.123,26.456
    /ll=(-?\d+\.?\d+),(-?\d+\.?\d+)/,             // ll=38.123,26.456
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) {
      const lat = parseFloat(m[1])
      const lng = parseFloat(m[2])
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng }
      }
    }
  }
  return null
}

// Google Maps URL'den yer adını çıkar
function extractPlaceNameFromUrl(url: string): string | null {
  const text = decodeURIComponent(url)
  // /place/Samadhi+Alaçatı/@ veya /place/Samadhi+Alaçatı/data
  const m = text.match(/\/place\/([^/@]+)/)
  if (m && m[1]) {
    const name = m[1].replace(/\+/g, ' ').trim()
    if (name.length > 1) return name
  }
  return null
}

// Nominatim ile ters geocoding (koordinattan adres bilgisi al)
async function reverseGeocode(lat: number, lng: number) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      { headers: { 'Accept-Language': 'tr', 'User-Agent': 'UrlastoneAdmin/1.0' } }
    )
    const data = await res.json()
    const addr = data?.address || {}
    const province = addr.province || addr.state || ''
    const town = addr.city || addr.town || addr.county || ''
    const city = province || town || ''
    const country = addr.country || 'Türkiye'
    const district = addr.suburb || addr.district || addr.town || addr.village || ''
    const shortAddress = [district, town !== city ? town : ''].filter(Boolean).join(', ')
    return { city, country, address: shortAddress }
  } catch {
    return { city: '', country: 'Türkiye', address: '' }
  }
}

// Nominatim ile metin araması
async function searchNominatim(query: string) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
    { headers: { 'Accept-Language': 'tr', 'User-Agent': 'UrlastoneAdmin/1.0' } }
  )
  const data = await res.json()
  if (data && data.length > 0) {
    const r = data[0]
    const addr = r.address || {}
    const province = addr.province || addr.state || ''
    const town = addr.city || addr.town || addr.county || ''
    const city = province || town || ''
    const country = addr.country || 'Türkiye'
    const district = addr.suburb || addr.district || addr.town || addr.village || ''
    const shortAddress = [district, town !== city ? town : ''].filter(Boolean).join(', ')
    return {
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      city,
      country,
      address: shortAddress || r.display_name?.split(',').slice(0, 3).join(',') || '',
    }
  }
  return null
}

// POST /api/resolve-location
export async function POST(req: NextRequest) {
  try {
    const { url, query } = await req.json()

    if (url) {
      // 1. URL'den koordinat çıkarmayı dene
      const coords = extractCoordsFromUrl(url)
      if (coords) {
        const geo = await reverseGeocode(coords.lat, coords.lng)
        return NextResponse.json({ ...coords, ...geo })
      }

      // 2. URL'den yer adı çıkar, Nominatim'de ara
      const placeName = extractPlaceNameFromUrl(url)
      if (placeName) {
        const result = await searchNominatim(placeName)
        if (result) return NextResponse.json(result)
      }

      // 3. URL'de ne koordinat ne isim var - hata dön
      return NextResponse.json(
        { error: 'Bu linkte koordinat bulunamadı. Lütfen mekan adını yazıp "Bul" tuşuna basın.' },
        { status: 404 }
      )
    }

    // Metin araması
    if (query) {
      const result = await searchNominatim(query)
      if (result) return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Konum bulunamadı' }, { status: 404 })
  } catch (e) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
