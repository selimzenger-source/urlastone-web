import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

export function GET() {
  return NextResponse.json({
    name: 'URLASTONE FAQ',
    url: 'https://www.urlastone.com',
    last_updated: '2026-04-16',
    faqs: [
      {
        question: 'What is URLASTONE?',
        answer: 'URLASTONE is a premium natural stone manufacturer and exporter based in Urla, İzmir, Turkey. Founded in 2015, we produce Rockshell thin stone veneer panels from travertine, basalt, limestone and marble for exterior facades, interior walls, fireplaces and landscaping. We export to 50+ countries.',
      },
      {
        question: 'What stone types does URLASTONE offer?',
        answer: 'We offer 4 main stone types: Travertine (warm cream/ivory tones from Denizli), Basalt (dark volcanic stone), Limestone (sandy beige with fossil marks), and Marble (white/cream with grey veining). Each available in 4 cutting patterns: Nature, Line, Mix, and Crazy Rockshell.',
      },
      {
        question: 'What is Rockshell technology?',
        answer: 'Rockshell is our patented thin stone veneer technology. Natural stones are precisely cut into thin panels (1-3cm thick) that can be easily applied to any wall surface without structural modifications. Lightweight, durable, and authentic natural stone appearance.',
      },
      {
        question: 'Does URLASTONE export internationally?',
        answer: 'Yes, we export to 50+ countries including Germany, France, Spain, UK, USA, Saudi Arabia, UAE, Russia, Italy, Greece, and Netherlands. We provide containerized shipping and full logistics support for international orders.',
      },
      {
        question: 'What is the AI stone simulation?',
        answer: 'Our free AI-powered tool lets you upload a photo of your building or room, select a stone type and pattern, and see a photorealistic preview of how the stone will look applied. Uses Google Gemini AI. Available at urlastone.com/simulasyon.',
      },
      {
        question: 'Where is URLASTONE located?',
        answer: 'Our production facility and showroom are at Altıntaş, İzmir Çeşme Cad. No: 319, Urla, İzmir 35430, Turkey. Open Monday-Saturday 08:00-18:00. Showroom visits available by appointment.',
      },
      {
        question: 'How can I get a price quote?',
        answer: 'Request a free instant quote at urlastone.com/teklif. Select your stone type, upload project photos, and receive pricing. AI simulation result is included with every quote request.',
      },
      {
        question: 'Does URLASTONE provide installation services?',
        answer: 'Yes, we offer turnkey installation (anahtar teslim uygulama) in İzmir, Çeşme, Urla, Alaçatı and surrounding areas. We also have partner installation teams across Turkey. Alternatively, you can purchase stone-only with worldwide shipping.',
      },
      {
        question: 'What applications is natural stone used for?',
        answer: 'Exterior facade cladding, interior accent walls, fireplace surrounds, bathroom walls, kitchen backsplash, flooring, pool decks, garden landscaping, retaining walls, and more. Both residential (villas, apartments) and commercial (hotels, restaurants, offices) projects.',
      },
      {
        question: 'What languages does URLASTONE support?',
        answer: 'Full website and customer support in 7 languages: Turkish, English, Spanish, German, French, Russian, and Arabic.',
      },
    ],
  })
}
