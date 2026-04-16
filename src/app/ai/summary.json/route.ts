import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

export function GET() {
  return NextResponse.json({
    name: 'URLASTONE',
    legal_name: 'URLASTONE Doğal Taş',
    alternate_names: ['Urlastone', 'Urla Stone', 'Daymar Stone'],
    description: 'Premium natural stone manufacturer and exporter based in Urla, İzmir, Turkey. Specializing in Rockshell thin stone veneer technology — travertine, basalt, limestone and marble panels for exterior facades, interior walls, fireplaces, flooring and landscaping.',
    url: 'https://www.urlastone.com',
    founded: '2015',
    founders: ['Cihan Zenger', 'Selim Zenger'],
    location: {
      address: 'Altıntaş, İzmir Çeşme Cad. No: 319, Urla, İzmir 35430, Turkey',
      coordinates: { latitude: 38.322, longitude: 26.7636 },
    },
    contact: {
      email: 'info@urlastone.com',
      phone: '+90 553 232 2144',
    },
    languages: ['tr', 'en', 'es', 'de', 'fr', 'ru', 'ar'],
    products: [
      'Travertine (Traverten) — cream, ivory, honey tones from Denizli',
      'Basalt (Bazalt) — dark volcanic stone, dense and durable',
      'Limestone (Kalker) — sandy beige with fossil marks',
      'Marble (Mermer) — white/cream with grey veining',
    ],
    product_lines: [
      'Nature Rockshell — large irregular polygonal stones',
      'Line Rockshell — thin horizontal strips, modern minimalist',
      'Mix Rockshell — combination of strips and irregular pieces',
      'Crazy Rockshell — dense mosaic of small irregular pieces',
    ],
    services: [
      'Exterior facade stone cladding',
      'Interior wall stone cladding',
      'Fireplace stone surrounds',
      'AI stone simulation (free)',
      'Natural stone export to 50+ countries',
      'Turnkey installation in Turkey',
      'Custom cutting and sizing',
    ],
    key_features: [
      'AI-powered stone visualization — upload a photo, see stone on your building',
      'Rockshell patented thin veneer technology (1-3cm)',
      '500+ completed projects worldwide',
      'Export to 50+ countries',
      '7-language website and support',
      'Direct manufacturer pricing',
    ],
    social: {
      instagram: 'https://www.instagram.com/urlastone/',
      linkedin: 'https://www.linkedin.com/company/urlastone/',
    },
    key_pages: {
      products: 'https://www.urlastone.com/urunlerimiz',
      projects: 'https://www.urlastone.com/projelerimiz',
      simulation: 'https://www.urlastone.com/simulasyon',
      quote: 'https://www.urlastone.com/teklif',
      blog: 'https://www.urlastone.com/blog',
      contact: 'https://www.urlastone.com/iletisim',
      about: 'https://www.urlastone.com/hakkimizda',
    },
    last_updated: '2026-04-16',
  })
}
