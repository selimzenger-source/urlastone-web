import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/hero-slides/setup - Create table and seed existing slides (admin only, run once)
export async function POST(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Create table via raw SQL
  const { error: createError } = await supabaseAdmin.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS hero_slides (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        image_url text NOT NULL,
        bg_position text DEFAULT 'center center',
        tag_tr text DEFAULT '', tag_en text DEFAULT '', tag_es text DEFAULT '', tag_de text DEFAULT '', tag_fr text DEFAULT '', tag_ru text DEFAULT '', tag_ar text DEFAULT '',
        subtitle_tr text DEFAULT '', subtitle_en text DEFAULT '', subtitle_es text DEFAULT '', subtitle_de text DEFAULT '', subtitle_fr text DEFAULT '', subtitle_ru text DEFAULT '', subtitle_ar text DEFAULT '',
        gold_tr text DEFAULT '', gold_en text DEFAULT '', gold_es text DEFAULT '', gold_de text DEFAULT '', gold_fr text DEFAULT '', gold_ru text DEFAULT '', gold_ar text DEFAULT '',
        desc_tr text DEFAULT '', desc_en text DEFAULT '', desc_es text DEFAULT '', desc_de text DEFAULT '', desc_fr text DEFAULT '', desc_ru text DEFAULT '', desc_ar text DEFAULT '',
        sort_order integer DEFAULT 0,
        active boolean DEFAULT true,
        transition_seconds integer DEFAULT 7,
        created_at timestamptz DEFAULT now()
      );
    `
  })

  if (createError) {
    // Table might already exist or RPC not available - try direct approach
    // If the table already exists, try to check
    const { data: existing } = await supabaseAdmin
      .from('hero_slides')
      .select('id')
      .limit(1)

    if (existing === null) {
      return NextResponse.json({
        error: 'Could not create table. Please run the SQL manually in Supabase dashboard.',
        sql_error: createError.message,
        manual_sql: getCreateTableSQL()
      }, { status: 500 })
    }

    // Table exists, check if already seeded
    if (existing.length > 0) {
      return NextResponse.json({ message: 'Table already exists and has data', count: existing.length })
    }
  }

  // Seed with existing 8 slides
  const slides = getSeedData()
  const { error: seedError } = await supabaseAdmin
    .from('hero_slides')
    .insert(slides)

  if (seedError) {
    return NextResponse.json({ error: 'Seed failed: ' + seedError.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Table created and seeded with 8 slides', count: slides.length })
}

function getCreateTableSQL() {
  return `
CREATE TABLE IF NOT EXISTS hero_slides (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url text NOT NULL,
  bg_position text DEFAULT 'center center',
  tag_tr text DEFAULT '', tag_en text DEFAULT '', tag_es text DEFAULT '', tag_de text DEFAULT '', tag_fr text DEFAULT '', tag_ru text DEFAULT '', tag_ar text DEFAULT '',
  subtitle_tr text DEFAULT '', subtitle_en text DEFAULT '', subtitle_es text DEFAULT '', subtitle_de text DEFAULT '', subtitle_fr text DEFAULT '', subtitle_ru text DEFAULT '', subtitle_ar text DEFAULT '',
  gold_tr text DEFAULT '', gold_en text DEFAULT '', gold_es text DEFAULT '', gold_de text DEFAULT '', gold_fr text DEFAULT '', gold_ru text DEFAULT '', gold_ar text DEFAULT '',
  desc_tr text DEFAULT '', desc_en text DEFAULT '', desc_es text DEFAULT '', desc_de text DEFAULT '', desc_fr text DEFAULT '', desc_ru text DEFAULT '', desc_ar text DEFAULT '',
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "hero_slides_public_read" ON hero_slides FOR SELECT USING (true);
`
}

function getSeedData() {
  return [
    {
      image_url: '/slide-1.jpg', bg_position: 'center center', sort_order: 1, active: true,
      tag_tr: 'CEPHE KAPLAMA', tag_en: 'FACADE CLADDING', tag_es: 'REVESTIMIENTO DE FACHADA', tag_ar: 'تكسية الواجهات', tag_de: 'FASSADENVERKLEIDUNG',
      subtitle_tr: 'Doğadan cepheye', subtitle_en: 'From nature to facade', subtitle_es: 'De la naturaleza a la fachada', subtitle_ar: 'من الطبيعة إلى الواجهة', subtitle_de: 'Von der Natur zur Fassade',
      gold_tr: 'Rockshell', gold_en: 'Rockshell', gold_es: 'Rockshell', gold_ar: 'Rockshell', gold_de: 'Rockshell',
      desc_tr: 'Nature, Mix, Crazy, Line — 4 farklı ebat kategorisi. Traverten, mermer, bazalt, kalker — her projenize özel doğal taş çözümleri.',
      desc_en: 'Nature, Mix, Crazy, Line — 4 different size categories. Travertine, marble, basalt, limestone — custom natural stone solutions for every project.',
      desc_es: 'Nature, Mix, Crazy, Line — 4 categorías de tamaño diferentes. Travertino, mármol, basalto, caliza — soluciones de piedra natural para cada proyecto.',
      desc_ar: 'Nature، Mix، Crazy، Line — 4 فئات مقاسات مختلفة. ترافرتين، رخام، بازلت، حجر جيري — حلول حجر طبيعي مخصصة لكل مشروع.',
      desc_de: 'Nature, Mix, Crazy, Line — 4 verschiedene Größenkategorien. Travertin, Marmor, Basalt, Kalkstein — maßgeschneiderte Natursteinlösungen für jedes Projekt.',
    },
    {
      image_url: '/slide-2.jpg', bg_position: 'center 45%', sort_order: 2, active: true,
      tag_tr: 'DIŞ CEPHE', tag_en: 'EXTERIOR', tag_es: 'EXTERIOR', tag_ar: 'الواجهات الخارجية', tag_de: 'AUSSENFASSADE',
      subtitle_tr: 'Geleneksel ve modern mimari', subtitle_en: 'Traditional and modern architecture', subtitle_es: 'Arquitectura tradicional y moderna', subtitle_ar: 'العمارة التقليدية والحديثة', subtitle_de: 'Traditionelle und moderne Architektur',
      gold_tr: 'Yeni bir çehre', gold_en: 'A new face', gold_es: 'Un nuevo rostro', gold_ar: 'وجه جديد', gold_de: 'Ein neues Gesicht',
      desc_tr: 'Dış cephelerde doğal taş uygulamalarıyla yapıların çehresini değiştiriyoruz. Gelenekselden moderne, her stile uyum.',
      desc_en: 'We transform the appearance of buildings with natural stone applications on exterior facades. Harmony with every style, from traditional to modern.',
      desc_es: 'Transformamos la apariencia de los edificios con aplicaciones de piedra natural en fachadas exteriores.',
      desc_ar: 'نحول مظهر المباني بتطبيقات الحجر الطبيعي على الواجهات الخارجية.',
      desc_de: 'Wir verwandeln das Erscheinungsbild von Gebäuden mit Natursteinanwendungen an Außenfassaden.',
    },
    {
      image_url: '/slide-3.jpg', bg_position: 'center 45%', sort_order: 3, active: true,
      tag_tr: 'TİCARİ PROJELER', tag_en: 'COMMERCIAL PROJECTS', tag_es: 'PROYECTOS COMERCIALES', tag_ar: 'المشاريع التجارية', tag_de: 'GEWERBLICHE PROJEKTE',
      subtitle_tr: 'İşletmelere doğal güzellikler', subtitle_en: 'Natural beauty for businesses', subtitle_es: 'Belleza natural para empresas', subtitle_ar: 'جمال طبيعي للأعمال', subtitle_de: 'Natürliche Schönheit für Unternehmen',
      gold_tr: 'Kalıcı izlenim', gold_en: 'Lasting impression', gold_es: 'Impresión duradera', gold_ar: 'انطباع دائم', gold_de: 'Bleibender Eindruck',
      desc_tr: 'Otel, restoran, villa — işletmelerinize Rockshell ürünlerimizle zamansız bir karakter kazandırıyoruz.',
      desc_en: 'Hotels, restaurants, villas — we give your businesses a timeless character with our Rockshell products.',
      desc_es: 'Hoteles, restaurantes, villas — damos a sus negocios un carácter atemporal con nuestros productos Rockshell.',
      desc_ar: 'فنادق، مطاعم، فلل — نمنح أعمالكم طابعاً خالداً مع منتجات Rockshell.',
      desc_de: 'Hotels, Restaurants, Villen — wir verleihen Ihren Unternehmen mit unseren Rockshell-Produkten zeitlosen Charakter.',
    },
    {
      image_url: '/slide-4.jpg', bg_position: 'center center', sort_order: 4, active: true,
      tag_tr: 'RESTORASYON', tag_en: 'RESTORATION', tag_es: 'RESTAURACIÓN', tag_ar: 'الترميم', tag_de: 'RESTAURIERUNG',
      subtitle_tr: 'Tarihi dokuları koruyarak', subtitle_en: 'Preserving historical textures', subtitle_es: 'Preservando texturas históricas', subtitle_ar: 'الحفاظ على الملمس التاريخي', subtitle_de: 'Historische Texturen bewahren',
      gold_tr: 'Estetik tasarımlar', gold_en: 'Aesthetic designs', gold_es: 'Diseños estéticos', gold_ar: 'تصاميم جمالية', gold_de: 'Ästhetische Designs',
      desc_tr: 'Tarihi yapıların özgün dokusunu koruyarak, doğal taşla modern estetik tasarımlar üretiyoruz.',
      desc_en: 'We create modern aesthetic designs with natural stone while preserving the authentic texture of historical buildings.',
      desc_es: 'Creamos diseños estéticos modernos con piedra natural mientras preservamos la textura auténtica de edificios históricos.',
      desc_ar: 'نبتكر تصاميم جمالية عصرية بالحجر الطبيعي مع الحفاظ على الملمس الأصيل للمباني التاريخية.',
      desc_de: 'Wir schaffen moderne ästhetische Designs mit Naturstein und bewahren dabei die authentische Textur historischer Gebäude.',
    },
    {
      image_url: '/slide-5.jpg', bg_position: 'center 55%', sort_order: 5, active: true,
      tag_tr: 'İÇ MEKAN', tag_en: 'INTERIOR', tag_es: 'INTERIOR', tag_ar: 'التصميم الداخلي', tag_de: 'INNENRAUM',
      subtitle_tr: 'Yaşam alanlarınıza', subtitle_en: 'For your living spaces', subtitle_es: 'Para sus espacios de vida', subtitle_ar: 'لمساحات معيشتكم', subtitle_de: 'Für Ihre Wohnräume',
      gold_tr: 'Doğal dokunuş', gold_en: 'Natural touch', gold_es: 'Toque natural', gold_ar: 'لمسة طبيعية', gold_de: 'Ein Hauch Natur',
      desc_tr: 'İç mekanlarda traverten, mermer ve kalker uygulamalarıyla yaşam alanlarınızı estetik hale getiriyoruz.',
      desc_en: 'We elevate your living spaces with travertine, marble and limestone applications in interior designs.',
      desc_es: 'Elevamos sus espacios con aplicaciones de travertino, mármol y caliza en diseños interiores.',
      desc_ar: 'نرتقي بمساحات معيشتكم بتطبيقات الترافرتين والرخام والحجر الجيري في التصميم الداخلي.',
      desc_de: 'Wir werten Ihre Wohnräume mit Travertin-, Marmor- und Kalksteinanwendungen im Innendesign auf.',
    },
    {
      image_url: '/slide-6.png', bg_position: 'center center', sort_order: 6, active: true,
      tag_tr: 'USTA İŞÇİLİK', tag_en: 'CRAFTSMANSHIP', tag_es: 'ARTESANÍA', tag_ar: 'الحرفية', tag_de: 'HANDWERKSKUNST',
      subtitle_tr: '25 yıllık birikimle', subtitle_en: 'With 25 years of expertise', subtitle_es: 'Con 25 años de experiencia', subtitle_ar: 'بخبرة 25 عاماً', subtitle_de: 'Mit 25 Jahren Erfahrung',
      gold_tr: 'Her detaya hakimiyet', gold_en: 'Mastery in every detail', gold_es: 'Dominio en cada detalle', gold_ar: 'إتقان كل التفاصيل', gold_de: 'Meisterschaft in jedem Detail',
      desc_tr: 'Deneyimli ustalarımızla doğal taşın her detayına hakim, kusursuz işçilik sunuyoruz.',
      desc_en: 'With our experienced craftsmen, we deliver flawless workmanship with mastery over every detail of natural stone.',
      desc_es: 'Con nuestros artesanos experimentados, ofrecemos una mano de obra impecable con dominio de cada detalle.',
      desc_ar: 'مع حرفيينا ذوي الخبرة، نقدم صنعة لا تشوبها شائبة مع إتقان كل تفاصيل الحجر الطبيعي.',
      desc_de: 'Mit unseren erfahrenen Handwerkern liefern wir makellose Arbeit mit Beherrschung jedes Details des Natursteins.',
    },
    {
      image_url: '/slide-7.jpg', bg_position: 'center 40%', sort_order: 7, active: true,
      tag_tr: "URLA'DAN DÜNYAYA", tag_en: 'FROM URLA TO THE WORLD', tag_es: 'DE URLA AL MUNDO', tag_ar: 'من أورلا إلى العالم', tag_de: 'VON URLA IN DIE WELT',
      subtitle_tr: "Yapılarınızda Urla'nın", subtitle_en: 'The historic texture of Urla', subtitle_es: 'La textura histórica de Urla', subtitle_ar: 'ملمس أورلا التاريخي', subtitle_de: 'Die historische Textur von Urla',
      gold_tr: 'Tarihi dokusu', gold_en: 'In your buildings', gold_es: 'En sus edificios', gold_ar: 'في مبانيكم', gold_de: 'In Ihren Gebäuden',
      desc_tr: "İzmir Urla'nın eşsiz taş dokusunu projelerinize taşıyoruz. Yerel malzeme, küresel kalite.",
      desc_en: 'We bring the unique stone texture of Izmir Urla to your projects. Local material, global quality.',
      desc_es: 'Llevamos la textura de piedra única de Izmir Urla a sus proyectos. Material local, calidad global.',
      desc_ar: 'ننقل ملمس حجر إزمير أورلا الفريد إلى مشاريعكم. مواد محلية، جودة عالمية.',
      desc_de: 'Wir bringen die einzigartige Steintextur von Izmir Urla in Ihre Projekte. Lokales Material, globale Qualität.',
    },
    {
      image_url: '/slide-8.jpg', bg_position: 'center 70%', sort_order: 8, active: true,
      tag_tr: 'ÖZEL UYGULAMALAR', tag_en: 'SPECIAL APPLICATIONS', tag_es: 'APLICACIONES ESPECIALES', tag_ar: 'تطبيقات خاصة', tag_de: 'SPEZIALANWENDUNGEN',
      subtitle_tr: 'Şömine, banyo ve daha fazlası', subtitle_en: 'Fireplace, bathroom and more', subtitle_es: 'Chimenea, baño y más', subtitle_ar: 'مدفأة، حمام والمزيد', subtitle_de: 'Kamin, Bad und mehr',
      gold_tr: 'Doğal vurgu', gold_en: 'Natural accent', gold_es: 'Acento natural', gold_ar: 'لمسة طبيعية مميزة', gold_de: 'Natürlicher Akzent',
      desc_tr: 'Şömine kaplamaları, banyo tasarımları ve özel lokal uygulamalarla mekanlarınıza doğal taşın sıcaklığını katıyoruz.',
      desc_en: 'We add the warmth of natural stone to your spaces with fireplace cladding, bathroom designs and bespoke installations.',
      desc_es: 'Añadimos la calidez de la piedra natural con revestimientos de chimenea, diseños de baño y aplicaciones locales especiales.',
      desc_ar: 'نضيف دفء الحجر الطبيعي لمساحاتكم مع تكسية المدافئ وتصاميم الحمامات والتطبيقات المحلية الخاصة.',
      desc_de: 'Wir verleihen Ihren Räumen die Wärme des Natursteins mit Kaminverkleidungen, Baddesigns und speziellen lokalen Anwendungen.',
    },
  ]
}
