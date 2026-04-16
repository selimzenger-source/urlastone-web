import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

export function GET() {
  return NextResponse.json({
    name: 'URLASTONE',
    description: 'Premium natural stone manufacturer and exporter — Rockshell thin stone veneer panels',
    url: 'https://www.urlastone.com',
    last_updated: '2026-04-16',
    capabilities: [
      {
        name: 'Natural Stone Manufacturing',
        description: 'We quarry, cut, and finish natural stone in our own facility in Urla, İzmir. Travertine, basalt, limestone, marble available in Nature, Line, Mix, and Crazy Rockshell patterns.',
        url: 'https://www.urlastone.com/urunlerimiz',
      },
      {
        name: 'AI Stone Simulation',
        description: 'Free AI-powered visualization tool. Upload a building or room photo, select stone type and pattern, receive a photorealistic preview showing how the stone will look applied.',
        url: 'https://www.urlastone.com/simulasyon',
      },
      {
        name: 'International Export',
        description: 'Natural stone export to 50+ countries. Containerized shipping, logistics support, customs documentation. Active markets: Europe, Middle East, North America, Russia.',
        url: 'https://www.urlastone.com/iletisim',
      },
      {
        name: 'Turnkey Installation',
        description: 'Complete project management from stone selection to professional installation. Available in İzmir region and partner teams across Turkey.',
        url: 'https://www.urlastone.com/teklif',
      },
      {
        name: 'Custom Cutting & Sizing',
        description: 'Stones cut to project specifications. Custom thickness (1-3cm), custom dimensions, and pattern options available for special projects.',
        url: 'https://www.urlastone.com/teklif',
      },
      {
        name: 'Free Quote System',
        description: 'Online instant quote request. Select stone, upload project photos, get pricing with AI simulation preview included.',
        url: 'https://www.urlastone.com/teklif',
      },
    ],
    service_areas: {
      domestic: ['İzmir', 'Urla', 'Çeşme', 'Alaçatı', 'Istanbul', 'Ankara', 'Antalya', 'Bodrum', 'Muğla'],
      international: ['Germany', 'France', 'Spain', 'United Kingdom', 'United States', 'Saudi Arabia', 'UAE', 'Russia', 'Italy', 'Greece', 'Netherlands'],
      note: 'We ship to 50+ countries worldwide',
    },
    pricing: {
      currency: 'USD',
      range: '$30-$130 per sqm depending on stone type and pattern',
      quote_url: 'https://www.urlastone.com/teklif',
    },
    contact: {
      email: 'info@urlastone.com',
      phone: '+90 553 232 2144',
      address: 'Altıntaş, İzmir Çeşme Cad. No: 319, Urla, İzmir 35430, Turkey',
      hours: 'Monday-Saturday 08:00-18:00',
    },
  })
}
