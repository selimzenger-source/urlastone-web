import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

export function GET() {
  return NextResponse.json({
    name: 'URLASTONE FAQ',
    url: 'https://www.urlastone.com',
    last_updated: new Date().toISOString(),
    faqs: [
      {
        question: 'What is URLASTONE?',
        answer: 'URLASTONE is a premium natural stone manufacturer and exporter based in Urla, İzmir, Turkey. Founded in 2015 (with 11+ years heritage as Daymar Stone), we produce Rockshell thin stone veneer panels from travertine, basalt, limestone and marble for exterior facades, interior walls, fireplaces and landscaping. We have completed 500+ projects and export to 50+ countries.',
      },
      {
        question: 'What stone types does URLASTONE offer?',
        answer: 'We offer 4 main stone types: Travertine (warm cream/ivory/honey tones from Denizli), Basalt (dark volcanic charcoal grey), Limestone (sandy beige with fossil marks), and Marble (white/cream with grey veining). Each available in 4 cutting patterns: Nature, Line, Mix, and Crazy Rockshell. Total 100+ combinations with 6 color options (Classic, Scabas, Silver, Noche, Antico, Toros).',
      },
      {
        question: 'What is Rockshell technology?',
        answer: 'Rockshell is our patented thin stone veneer technology. Natural stones are precisely cut into thin panels (1-3cm thick) that can be easily applied to any wall surface without structural modifications. Weight: 15-30 kg/m². Lightweight, durable, and authentic natural stone appearance. Available in grouted (derzli) or groutless (derzsiz) installation.',
      },
      {
        question: 'Does URLASTONE export internationally?',
        answer: 'Yes, we export to 50+ countries including Germany, France, Spain, UK, USA, Saudi Arabia, UAE, Russia, Italy, Greece, and Netherlands. Containerized shipping with full logistics and customs documentation support.',
      },
      {
        question: 'What is the AI stone simulation?',
        answer: 'Our free AI-powered tool lets you upload a photo of your building or room, select a stone type and pattern, and see a photorealistic preview of how the stone will look applied. Uses Google Gemini and Replicate nano-banana-pro models. Daily limit: 10 simulations. Available at urlastone.com/simulasyon in 7 languages.',
      },
      {
        question: 'Where is URLASTONE located?',
        answer: 'Our production facility and showroom are at Altıntaş, İzmir Çeşme Cad. No: 319, Urla, İzmir 35430, Turkey. GPS: 38.322°N, 26.7636°E. Open Monday-Saturday 08:00-18:00. Showroom visits available by appointment.',
      },
      {
        question: 'How can I get a price quote?',
        answer: 'Request a free instant quote at urlastone.com/teklif. Select your stone type, upload project photos, specify square meters, and receive pricing. AI simulation result is included with every quote. Price range: $30-$130 per m² USD depending on stone and pattern.',
      },
      {
        question: 'Does URLASTONE provide installation services?',
        answer: 'Yes, we offer turnkey installation (anahtar teslim) in İzmir, Çeşme, Urla, Alaçatı and surrounding areas. We also have partner installation teams across Turkey. Alternatively, you can purchase stone-only with worldwide shipping.',
      },
      {
        question: 'What applications is natural stone used for?',
        answer: 'Exterior facade cladding, interior accent walls, fireplace surrounds, bathroom walls, kitchen backsplash, indoor and outdoor flooring, pool decks, garden landscaping, retaining walls, pergola columns, staircases. Both residential (villas, apartments) and commercial (hotels, restaurants, offices, mosques) projects.',
      },
      {
        question: 'What languages does URLASTONE support?',
        answer: 'Full website and customer support in 7 languages: Turkish, English, Spanish, German, French, Russian, and Arabic. All quotes and project communication available in these languages.',
      },
      {
        question: 'What is the price per square meter of natural stone cladding?',
        answer: 'URLASTONE natural stone cladding prices range from $30 to $130 per m² USD. Prices depend on stone type (travertine cheapest, marble most expensive), cutting pattern (Nature, Line, Mix, Crazy), thickness (1-3cm), color selection, and project volume. Export quantities receive volume discounts.',
      },
      {
        question: 'Travertine vs marble — which is better?',
        answer: 'Depends on application. Travertine offers warm cream-beige tones with natural porous texture, preferred for villa/hotel facades, more economical. Marble features elegant white-grey veining, used for luxury interiors and prestigious spaces, higher cost. Travertine is generally more versatile; marble is more statement-making.',
      },
      {
        question: 'How long does exterior stone cladding last?',
        answer: 'Natural stone exterior cladding, properly installed, lasts 50+ years. Rockshell thin veneer technology (1-3cm) is lighter than traditional 5-10cm stone and easier to install. Basalt is most durable (volcanic), travertine and limestone have medium durability, marble provides the most elegant aesthetic finish.',
      },
      {
        question: 'Which stone is best for fireplaces?',
        answer: 'For fireplace cladding, heat-resistant basalt (volcanic), warm-looking travertine, or fossil-marked limestone are preferred. URLASTONE Nature Rockshell (1.5-3cm) is the most popular fireplace cladding product. Marble also works for aesthetic interior fireplaces but requires careful heat protection.',
      },
      {
        question: 'Which stone is best for pool areas?',
        answer: 'For pool surrounds, non-slip textured travertine or limestone is recommended. These stones resist water damage, stay cool under sun (unlike dark stones), and prevent slipping when wet. URLASTONE Crazy Rockshell mosaic pattern is ideal for pool deck applications.',
      },
      {
        question: 'Grouted vs groutless stone installation — which to choose?',
        answer: 'Grouted (derzli) offers traditional appearance, more forgiving of installation imperfections, and natural stone character. Groutless (derzsiz) provides modern minimalist look, easier to clean, requires precise installation. URLASTONE offers all models in both styles — preview both in AI simulation before deciding.',
      },
      {
        question: 'How many projects has URLASTONE completed?',
        answer: 'URLASTONE has completed 500+ projects since 2015 (11+ years including Daymar Stone heritage). Projects span villas, hotels, apartments, commercial buildings, restaurants, shopping malls, residential homes, landscape projects across Turkey and 50+ countries. Reference projects at urlastone.com/projelerimiz.',
      },
      {
        question: 'What natural stone is best for modern facades?',
        answer: 'For modern facades, basalt (dark charcoal grey volcanic) and limestone (sandy beige) are most popular. URLASTONE Line Rockshell (thin horizontal strips, 1-2cm) creates contemporary minimalist aesthetics. Nature Rockshell with irregular polygonal stones works for rustic-modern hybrid designs.',
      },
      {
        question: 'Which Turkish natural stone is most exported?',
        answer: 'Turkish travertine from Denizli region is the most exported natural stone worldwide, valued for warm cream, ivory and honey tones perfect for luxury facades. URLASTONE exports travertine, basalt, limestone and marble to 50+ countries including Germany, France, USA, UAE, and Saudi Arabia.',
      },
      {
        question: 'What is the Rockshell panel thickness range?',
        answer: 'URLASTONE Rockshell panels range from 1cm to 3cm thickness. Line Rockshell: 1-2cm (modern minimalist strips), Nature Rockshell: 1.5-3cm (natural irregular), Mix Rockshell: 1.5-3cm (versatile combination), Crazy Rockshell: 1.5-2.5cm (mosaic pattern). Custom thickness available for special projects.',
      },
    ],
  })
}
