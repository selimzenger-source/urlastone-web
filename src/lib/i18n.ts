export type Locale = 'tr' | 'en' | 'es' | 'ar' | 'de'

export interface LangOption {
  code: Locale
  label: string
  flag: string
  dir?: 'rtl' | 'ltr'
}

export const languages: LangOption[] = [
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
]

type TranslationKeys = {
  // Navbar
  nav_taslarimiz: string
  nav_simulasyon: string
  nav_uygulamalar: string
  nav_hakkimizda: string
  nav_iletisim: string
  nav_teklif: string

  // Hero
  hero_tag: string
  hero_title1: string
  hero_title2: string
  hero_desc: string
  hero_btn_simulasyon: string
  hero_btn_koleksiyon: string
  hero_stat_proje: string
  hero_stat_ulke: string
  hero_stat_yil: string

  // Featured Stones
  featured_tag: string
  featured_title: string
  featured_btn: string

  // Process
  process_tag: string
  process_title: string
  process_step1_title: string
  process_step1_desc: string
  process_step2_title: string
  process_step2_desc: string
  process_step3_title: string
  process_step3_desc: string
  process_step4_title: string
  process_step4_desc: string

  // Why Us
  why_tag: string
  why_title: string
  why1_title: string
  why1_desc: string
  why2_title: string
  why2_desc: string
  why3_title: string
  why3_desc: string
  why4_title: string
  why4_desc: string

  // CTA
  cta_title: string
  cta_sim_title: string
  cta_sim_step1: string
  cta_sim_step2: string
  cta_sim_step3: string
  cta_sim_btn: string
  cta_teklif_title: string
  cta_teklif_btn: string
  cta_whatsapp: string
  cta_kesif: string
  cta_fiyat: string
  cta_danismanlik: string
  cta_nakliye: string

  // Footer
  footer_desc: string
  footer_links: string
  footer_iletisim: string
  footer_rights: string

  // Hakkımızda
  about_tag: string
  about_title1: string
  about_title2: string
  about_desc: string
  about_stat1: string
  about_stat2: string
  about_stat3: string
  about_stat4: string
  about_story_tag: string
  about_story_title: string
  about_story_gold: string
  about_team_tag: string
  about_team_title: string
  about_values_tag: string
  about_values_title: string
  about_val1: string
  about_val2: string
  about_val3: string
  about_val4: string
  about_loc_tag: string
  about_loc_title: string
  about_loc_gold: string
  about_cta_title: string
  about_cta_desc: string
  about_cta_btn: string

  // Taşlar
  stones_tag: string
  stones_title1: string
  stones_title2: string
  stones_desc: string
  stones_rockshell_tag: string
  stones_rockshell_title: string
  stones_collection_tag: string
  stones_collection_title: string
  stones_collection_desc: string
  stones_cta_title: string
  stones_cta_desc: string
  stones_teklif_btn: string

  // İletişim
  contact_tag: string
  contact_title: string
  contact_desc: string

  // Common
  common_teklif_al: string
  common_whatsapp: string
  common_iletisim: string
}

const translations: Record<Locale, TranslationKeys> = {
  tr: {
    nav_taslarimiz: 'Taşlarımız',
    nav_simulasyon: 'AI Simülasyon',
    nav_uygulamalar: 'Uygulamalarım',
    nav_hakkimizda: 'Hakkımızda',
    nav_iletisim: 'İletişim',
    nav_teklif: 'Teklif Al',
    hero_tag: 'CEPHE KAPLAMA',
    hero_title1: 'Doğanın milyonlarca yıllık',
    hero_title2: 'Eşsiz taşları.',
    hero_desc: 'Türkiye\'nin en seçkin doğal taş koleksiyonu. Travertenden bazalta, mermerden granite — her projenize özel çözümler üretiyoruz.',
    hero_btn_simulasyon: 'AI Simülasyon',
    hero_btn_koleksiyon: 'Koleksiyonu Keşfet',
    hero_stat_proje: 'Proje',
    hero_stat_ulke: 'İhracat Ülkesi',
    hero_stat_yil: 'Yıllık Tecrübe',
    featured_tag: 'KOLEKSİYON',
    featured_title: 'Öne Çıkan Taşlarımız',
    featured_btn: 'Tümünü Gör',
    process_tag: 'SÜREÇ',
    process_title: 'Nasıl Çalışıyoruz?',
    process_step1_title: 'Keşif & Analiz',
    process_step1_desc: 'Projenizi yerinde inceliyor, ihtiyaçlarınızı analiz ediyoruz.',
    process_step2_title: 'Taş Seçimi',
    process_step2_desc: 'Projenize en uygun doğal taşı birlikte belirliyoruz.',
    process_step3_title: 'Üretim',
    process_step3_desc: 'Özel kesim ve işleme ile taşlarınızı hazırlıyoruz.',
    process_step4_title: 'Uygulama',
    process_step4_desc: 'Uzman ekibimiz ile kusursuz montaj gerçekleştiriyoruz.',
    why_tag: 'NEDEN BİZ',
    why_title: 'Farkımız ne?',
    why1_title: 'Doğrudan Üretici',
    why1_desc: 'Aracı olmadan, kendi tesislerimizde üretim yapıyoruz.',
    why2_title: 'Rockshell Teknolojisi',
    why2_desc: 'Patentli ultra ince doğal taş panelleri ile sektörde öncüyüz.',
    why3_title: '15+ Yıl Deneyim',
    why3_desc: 'Sektörün en deneyimli ekibiyle hizmet veriyoruz.',
    why4_title: 'Global İhracat',
    why4_desc: '50\'den fazla ülkeye ihracat yapan güçlü bir ağa sahibiz.',
    cta_title: 'Hayalinizdeki mekânı birlikte tasarlayalım.',
    cta_sim_title: 'AI Simülasyon',
    cta_sim_step1: 'Fotoğraf yükle',
    cta_sim_step2: 'Taş seç',
    cta_sim_step3: 'Sonucu gör',
    cta_sim_btn: 'Simülasyonu Dene',
    cta_teklif_title: 'Teklif Al',
    cta_teklif_btn: 'Teklif Formu',
    cta_whatsapp: 'WhatsApp',
    cta_kesif: 'Ücretsiz keşif',
    cta_fiyat: 'Detaylı fiyat',
    cta_danismanlik: 'Taş danışmanlığı',
    cta_nakliye: 'Nakliye & montaj',
    footer_desc: 'Doğal taşın eşsiz güzelliğini modern mimariyle buluşturuyoruz.',
    footer_links: 'Hızlı Linkler',
    footer_iletisim: 'İletişim',
    footer_rights: 'Tüm hakları saklıdır.',
    about_tag: 'Hakkımızda',
    about_title1: 'Doğal taşa',
    about_title2: 'tutku ile bağlıyız.',
    about_desc: 'Urla Stone, 15 yılı aşkın sektör deneyimine sahip üç kurucunun ortak vizyonuyla doğdu.',
    about_stat1: 'Yıllık Sektör Deneyimi',
    about_stat2: 'Tamamlanan Proje',
    about_stat3: 'İhracat Ülkesi',
    about_stat4: 'Doğal Taş Çeşidi',
    about_story_tag: 'Hikayemiz',
    about_story_title: 'Urla\'nın kalbinden',
    about_story_gold: 'dünyaya.',
    about_team_tag: 'Ekibimiz',
    about_team_title: 'Kurucularımız',
    about_values_tag: 'Değerlerimiz',
    about_values_title: 'Bizi biz yapan ilkeler.',
    about_val1: 'Kalite',
    about_val2: 'Yenilikçilik',
    about_val3: 'Güven',
    about_val4: 'Küresel Vizyon',
    about_loc_tag: 'Merkezimiz',
    about_loc_title: 'Urla\'dan dünyaya',
    about_loc_gold: 'uzanan yolculuk.',
    about_cta_title: 'Projeniz için bizimle iletişime geçin.',
    about_cta_desc: 'Ücretsiz keşif ve fiyat teklifi için hemen formumuzu doldurun.',
    about_cta_btn: 'Teklif Al',
    stones_tag: 'Ürün Koleksiyonu',
    stones_title1: 'Doğanın milyonlarca yıllık',
    stones_title2: 'eşsiz taşları.',
    stones_desc: 'Rockshell teknolojisi ile doğal taşın eşsiz dokusunu ultra ince panellere dönüştürüyoruz.',
    stones_rockshell_tag: 'Rockshell Serisi',
    stones_rockshell_title: '4 farklı model, sonsuz olasılık.',
    stones_collection_tag: 'Taş Koleksiyonu',
    stones_collection_title: 'Doğal taş çeşitlerimiz.',
    stones_collection_desc: 'Her biri milyonlarca yılda oluşmuş, benzersiz dokuya sahip doğal taşlarımız projenize karakter katar.',
    stones_cta_title: 'Projenize en uygun taşı birlikte seçelim.',
    stones_cta_desc: 'Numune talebi, fiyat teklifi veya teknik danışmanlık için ekibimizle iletişime geçin.',
    stones_teklif_btn: 'Bu model için teklif al',
    contact_tag: 'İletişim',
    contact_title: 'Bizimle İletişime Geçin',
    contact_desc: 'Projeniz hakkında konuşalım.',
    common_teklif_al: 'Teklif Al',
    common_whatsapp: 'WhatsApp ile Ulaşın',
    common_iletisim: 'İletişime Geç',
  },

  en: {
    nav_taslarimiz: 'Our Stones',
    nav_simulasyon: 'AI Simulation',
    nav_uygulamalar: 'Applications',
    nav_hakkimizda: 'About Us',
    nav_iletisim: 'Contact',
    nav_teklif: 'Get Quote',
    hero_tag: 'FACADE CLADDING',
    hero_title1: 'Nature\'s millions of years old',
    hero_title2: 'Unique stones.',
    hero_desc: 'Turkey\'s finest natural stone collection. From travertine to basalt, marble to granite — we create custom solutions for every project.',
    hero_btn_simulasyon: 'AI Simulation',
    hero_btn_koleksiyon: 'Explore Collection',
    hero_stat_proje: 'Projects',
    hero_stat_ulke: 'Export Countries',
    hero_stat_yil: 'Years Experience',
    featured_tag: 'COLLECTION',
    featured_title: 'Featured Stones',
    featured_btn: 'View All',
    process_tag: 'PROCESS',
    process_title: 'How We Work',
    process_step1_title: 'Discovery & Analysis',
    process_step1_desc: 'We inspect your project on-site and analyze your needs.',
    process_step2_title: 'Stone Selection',
    process_step2_desc: 'We help you choose the perfect natural stone for your project.',
    process_step3_title: 'Production',
    process_step3_desc: 'We prepare your stones with custom cutting and processing.',
    process_step4_title: 'Installation',
    process_step4_desc: 'Our expert team delivers flawless installation.',
    why_tag: 'WHY US',
    why_title: 'What makes us different?',
    why1_title: 'Direct Manufacturer',
    why1_desc: 'We produce in our own facilities, without intermediaries.',
    why2_title: 'Rockshell Technology',
    why2_desc: 'We lead the industry with patented ultra-thin natural stone panels.',
    why3_title: '15+ Years Experience',
    why3_desc: 'We serve with the most experienced team in the industry.',
    why4_title: 'Global Export',
    why4_desc: 'We have a strong network exporting to over 50 countries.',
    cta_title: 'Let\'s design your dream space together.',
    cta_sim_title: 'AI Simulation',
    cta_sim_step1: 'Upload photo',
    cta_sim_step2: 'Select stone',
    cta_sim_step3: 'See result',
    cta_sim_btn: 'Try Simulation',
    cta_teklif_title: 'Get Quote',
    cta_teklif_btn: 'Quote Form',
    cta_whatsapp: 'WhatsApp',
    cta_kesif: 'Free site visit',
    cta_fiyat: 'Detailed pricing',
    cta_danismanlik: 'Stone consulting',
    cta_nakliye: 'Shipping & installation',
    footer_desc: 'We bring the unique beauty of natural stone together with modern architecture.',
    footer_links: 'Quick Links',
    footer_iletisim: 'Contact',
    footer_rights: 'All rights reserved.',
    about_tag: 'About Us',
    about_title1: 'Passionate about',
    about_title2: 'natural stone.',
    about_desc: 'Urla Stone was born from the shared vision of three founders with over 15 years of industry experience.',
    about_stat1: 'Years of Experience',
    about_stat2: 'Completed Projects',
    about_stat3: 'Export Countries',
    about_stat4: 'Stone Varieties',
    about_story_tag: 'Our Story',
    about_story_title: 'From the heart of Urla',
    about_story_gold: 'to the world.',
    about_team_tag: 'Our Team',
    about_team_title: 'Our Founders',
    about_values_tag: 'Our Values',
    about_values_title: 'The principles that define us.',
    about_val1: 'Quality',
    about_val2: 'Innovation',
    about_val3: 'Trust',
    about_val4: 'Global Vision',
    about_loc_tag: 'Headquarters',
    about_loc_title: 'A journey from Urla',
    about_loc_gold: 'to the world.',
    about_cta_title: 'Get in touch for your project.',
    about_cta_desc: 'Fill out our form for a free site visit and price quote.',
    about_cta_btn: 'Get Quote',
    stones_tag: 'Product Collection',
    stones_title1: 'Nature\'s millions of years old',
    stones_title2: 'unique stones.',
    stones_desc: 'We transform the unique texture of natural stone into ultra-thin panels with Rockshell technology.',
    stones_rockshell_tag: 'Rockshell Series',
    stones_rockshell_title: '4 models, infinite possibilities.',
    stones_collection_tag: 'Stone Collection',
    stones_collection_title: 'Our natural stone varieties.',
    stones_collection_desc: 'Each formed over millions of years, our uniquely textured natural stones add character to your project.',
    stones_cta_title: 'Let\'s choose the perfect stone for your project.',
    stones_cta_desc: 'Contact our team for samples, pricing, or technical consulting.',
    stones_teklif_btn: 'Get quote for this model',
    contact_tag: 'Contact',
    contact_title: 'Get in Touch',
    contact_desc: 'Let\'s talk about your project.',
    common_teklif_al: 'Get Quote',
    common_whatsapp: 'Reach via WhatsApp',
    common_iletisim: 'Contact Us',
  },

  es: {
    nav_taslarimiz: 'Piedras',
    nav_simulasyon: 'Simulación IA',
    nav_uygulamalar: 'Aplicaciones',
    nav_hakkimizda: 'Sobre Nosotros',
    nav_iletisim: 'Contacto',
    nav_teklif: 'Cotización',
    hero_tag: 'REVESTIMIENTO DE FACHADAS',
    hero_title1: 'Piedras únicas de',
    hero_title2: 'millones de años.',
    hero_desc: 'La mejor colección de piedra natural de Turquía. Del travertino al basalto, del mármol al granito — creamos soluciones a medida.',
    hero_btn_simulasyon: 'Simulación IA',
    hero_btn_koleksiyon: 'Explorar Colección',
    hero_stat_proje: 'Proyectos',
    hero_stat_ulke: 'Países de Exportación',
    hero_stat_yil: 'Años de Experiencia',
    featured_tag: 'COLECCIÓN',
    featured_title: 'Piedras Destacadas',
    featured_btn: 'Ver Todas',
    process_tag: 'PROCESO',
    process_title: '¿Cómo Trabajamos?',
    process_step1_title: 'Análisis',
    process_step1_desc: 'Inspeccionamos su proyecto in situ y analizamos sus necesidades.',
    process_step2_title: 'Selección de Piedra',
    process_step2_desc: 'Le ayudamos a elegir la piedra natural perfecta.',
    process_step3_title: 'Producción',
    process_step3_desc: 'Preparamos sus piedras con corte y procesamiento personalizado.',
    process_step4_title: 'Instalación',
    process_step4_desc: 'Nuestro equipo experto realiza una instalación impecable.',
    why_tag: 'POR QUÉ NOSOTROS',
    why_title: '¿Qué nos diferencia?',
    why1_title: 'Fabricante Directo',
    why1_desc: 'Producimos en nuestras propias instalaciones, sin intermediarios.',
    why2_title: 'Tecnología Rockshell',
    why2_desc: 'Lideramos con paneles ultrafinos de piedra natural patentados.',
    why3_title: '+15 Años de Experiencia',
    why3_desc: 'Servimos con el equipo más experimentado del sector.',
    why4_title: 'Exportación Global',
    why4_desc: 'Exportamos a más de 50 países.',
    cta_title: 'Diseñemos juntos el espacio de sus sueños.',
    cta_sim_title: 'Simulación IA',
    cta_sim_step1: 'Subir foto',
    cta_sim_step2: 'Elegir piedra',
    cta_sim_step3: 'Ver resultado',
    cta_sim_btn: 'Probar Simulación',
    cta_teklif_title: 'Cotización',
    cta_teklif_btn: 'Formulario',
    cta_whatsapp: 'WhatsApp',
    cta_kesif: 'Visita gratuita',
    cta_fiyat: 'Precios detallados',
    cta_danismanlik: 'Asesoría en piedra',
    cta_nakliye: 'Envío e instalación',
    footer_desc: 'Unimos la belleza de la piedra natural con la arquitectura moderna.',
    footer_links: 'Enlaces Rápidos',
    footer_iletisim: 'Contacto',
    footer_rights: 'Todos los derechos reservados.',
    about_tag: 'Sobre Nosotros',
    about_title1: 'Apasionados por',
    about_title2: 'la piedra natural.',
    about_desc: 'Urla Stone nació de la visión compartida de tres fundadores con más de 15 años de experiencia.',
    about_stat1: 'Años de Experiencia',
    about_stat2: 'Proyectos Completados',
    about_stat3: 'Países de Exportación',
    about_stat4: 'Variedades de Piedra',
    about_story_tag: 'Nuestra Historia',
    about_story_title: 'Desde el corazón de Urla',
    about_story_gold: 'al mundo.',
    about_team_tag: 'Nuestro Equipo',
    about_team_title: 'Fundadores',
    about_values_tag: 'Valores',
    about_values_title: 'Los principios que nos definen.',
    about_val1: 'Calidad',
    about_val2: 'Innovación',
    about_val3: 'Confianza',
    about_val4: 'Visión Global',
    about_loc_tag: 'Sede Central',
    about_loc_title: 'Un viaje desde Urla',
    about_loc_gold: 'al mundo.',
    about_cta_title: 'Contáctenos para su proyecto.',
    about_cta_desc: 'Complete nuestro formulario para una visita gratuita.',
    about_cta_btn: 'Cotización',
    stones_tag: 'Colección de Productos',
    stones_title1: 'Piedras únicas de',
    stones_title2: 'millones de años.',
    stones_desc: 'Transformamos la textura de la piedra natural en paneles ultrafinos con tecnología Rockshell.',
    stones_rockshell_tag: 'Serie Rockshell',
    stones_rockshell_title: '4 modelos, infinitas posibilidades.',
    stones_collection_tag: 'Colección de Piedra',
    stones_collection_title: 'Nuestras variedades.',
    stones_collection_desc: 'Cada una formada durante millones de años, nuestras piedras añaden carácter a su proyecto.',
    stones_cta_title: 'Elijamos juntos la piedra perfecta.',
    stones_cta_desc: 'Contacte a nuestro equipo para muestras o asesoría técnica.',
    stones_teklif_btn: 'Cotizar este modelo',
    contact_tag: 'Contacto',
    contact_title: 'Contáctenos',
    contact_desc: 'Hablemos de su proyecto.',
    common_teklif_al: 'Cotización',
    common_whatsapp: 'Contactar por WhatsApp',
    common_iletisim: 'Contacto',
  },

  ar: {
    nav_taslarimiz: 'أحجارنا',
    nav_simulasyon: 'محاكاة ذكية',
    nav_uygulamalar: 'التطبيقات',
    nav_hakkimizda: 'من نحن',
    nav_iletisim: 'اتصل بنا',
    nav_teklif: 'طلب عرض سعر',
    hero_tag: 'تكسية الواجهات',
    hero_title1: 'أحجار طبيعية فريدة',
    hero_title2: 'عمرها ملايين السنين.',
    hero_desc: 'أفضل مجموعة أحجار طبيعية في تركيا. من الترافرتين إلى البازلت، من الرخام إلى الجرانيت — نصنع حلولاً مخصصة لكل مشروع.',
    hero_btn_simulasyon: 'محاكاة ذكية',
    hero_btn_koleksiyon: 'استكشف المجموعة',
    hero_stat_proje: 'مشروع',
    hero_stat_ulke: 'دولة تصدير',
    hero_stat_yil: 'سنة خبرة',
    featured_tag: 'المجموعة',
    featured_title: 'الأحجار المميزة',
    featured_btn: 'عرض الكل',
    process_tag: 'العملية',
    process_title: 'كيف نعمل؟',
    process_step1_title: 'الاكتشاف والتحليل',
    process_step1_desc: 'نفحص مشروعك في الموقع ونحلل احتياجاتك.',
    process_step2_title: 'اختيار الحجر',
    process_step2_desc: 'نساعدك في اختيار الحجر الطبيعي المثالي.',
    process_step3_title: 'الإنتاج',
    process_step3_desc: 'نحضر أحجارك بقص ومعالجة مخصصة.',
    process_step4_title: 'التركيب',
    process_step4_desc: 'فريقنا الخبير يقدم تركيباً مثالياً.',
    why_tag: 'لماذا نحن',
    why_title: 'ما الذي يميزنا؟',
    why1_title: 'مصنع مباشر',
    why1_desc: 'ننتج في مرافقنا الخاصة بدون وسطاء.',
    why2_title: 'تقنية روكشل',
    why2_desc: 'نقود الصناعة بألواح حجرية رقيقة للغاية حاصلة على براءة اختراع.',
    why3_title: '+15 سنة خبرة',
    why3_desc: 'نخدم بأكثر فريق خبرة في الصناعة.',
    why4_title: 'تصدير عالمي',
    why4_desc: 'نصدر إلى أكثر من 50 دولة.',
    cta_title: 'لنصمم معاً مساحة أحلامك.',
    cta_sim_title: 'محاكاة ذكية',
    cta_sim_step1: 'ارفع صورة',
    cta_sim_step2: 'اختر حجراً',
    cta_sim_step3: 'شاهد النتيجة',
    cta_sim_btn: 'جرب المحاكاة',
    cta_teklif_title: 'طلب عرض سعر',
    cta_teklif_btn: 'نموذج العرض',
    cta_whatsapp: 'واتساب',
    cta_kesif: 'زيارة مجانية',
    cta_fiyat: 'أسعار مفصلة',
    cta_danismanlik: 'استشارة حجرية',
    cta_nakliye: 'شحن وتركيب',
    footer_desc: 'نجمع بين جمال الحجر الطبيعي والعمارة الحديثة.',
    footer_links: 'روابط سريعة',
    footer_iletisim: 'اتصل بنا',
    footer_rights: 'جميع الحقوق محفوظة.',
    about_tag: 'من نحن',
    about_title1: 'شغوفون',
    about_title2: 'بالحجر الطبيعي.',
    about_desc: 'ولدت أورلا ستون من رؤية مشتركة لثلاثة مؤسسين بخبرة تزيد عن 15 عاماً.',
    about_stat1: 'سنة خبرة',
    about_stat2: 'مشروع مكتمل',
    about_stat3: 'دولة تصدير',
    about_stat4: 'نوع حجر',
    about_story_tag: 'قصتنا',
    about_story_title: 'من قلب أورلا',
    about_story_gold: 'إلى العالم.',
    about_team_tag: 'فريقنا',
    about_team_title: 'المؤسسون',
    about_values_tag: 'قيمنا',
    about_values_title: 'المبادئ التي تعرّفنا.',
    about_val1: 'الجودة',
    about_val2: 'الابتكار',
    about_val3: 'الثقة',
    about_val4: 'رؤية عالمية',
    about_loc_tag: 'المقر الرئيسي',
    about_loc_title: 'رحلة من أورلا',
    about_loc_gold: 'إلى العالم.',
    about_cta_title: 'تواصل معنا لمشروعك.',
    about_cta_desc: 'املأ النموذج للحصول على زيارة مجانية وعرض سعر.',
    about_cta_btn: 'طلب عرض سعر',
    stones_tag: 'مجموعة المنتجات',
    stones_title1: 'أحجار فريدة عمرها',
    stones_title2: 'ملايين السنين.',
    stones_desc: 'نحول نسيج الحجر الطبيعي إلى ألواح رقيقة للغاية بتقنية روكشل.',
    stones_rockshell_tag: 'سلسلة روكشل',
    stones_rockshell_title: '4 نماذج، إمكانيات لا نهائية.',
    stones_collection_tag: 'مجموعة الأحجار',
    stones_collection_title: 'أنواع أحجارنا الطبيعية.',
    stones_collection_desc: 'كل منها تشكل على مدى ملايين السنين، أحجارنا تضيف طابعاً لمشروعك.',
    stones_cta_title: 'لنختر معاً الحجر المثالي لمشروعك.',
    stones_cta_desc: 'تواصل مع فريقنا للعينات أو الاستشارة الفنية.',
    stones_teklif_btn: 'اطلب عرض سعر لهذا النموذج',
    contact_tag: 'اتصل بنا',
    contact_title: 'تواصل معنا',
    contact_desc: 'لنتحدث عن مشروعك.',
    common_teklif_al: 'طلب عرض سعر',
    common_whatsapp: 'تواصل عبر واتساب',
    common_iletisim: 'اتصل بنا',
  },

  de: {
    nav_taslarimiz: 'Unsere Steine',
    nav_simulasyon: 'KI-Simulation',
    nav_uygulamalar: 'Anwendungen',
    nav_hakkimizda: 'Über Uns',
    nav_iletisim: 'Kontakt',
    nav_teklif: 'Angebot',
    hero_tag: 'FASSADENVERKLEIDUNG',
    hero_title1: 'Einzigartige Steine,',
    hero_title2: 'Millionen Jahre alt.',
    hero_desc: 'Die feinste Natursteinkollektion der Türkei. Von Travertin bis Basalt, Marmor bis Granit — maßgeschneiderte Lösungen für jedes Projekt.',
    hero_btn_simulasyon: 'KI-Simulation',
    hero_btn_koleksiyon: 'Kollektion Entdecken',
    hero_stat_proje: 'Projekte',
    hero_stat_ulke: 'Exportländer',
    hero_stat_yil: 'Jahre Erfahrung',
    featured_tag: 'KOLLEKTION',
    featured_title: 'Ausgewählte Steine',
    featured_btn: 'Alle Anzeigen',
    process_tag: 'PROZESS',
    process_title: 'Wie wir arbeiten',
    process_step1_title: 'Analyse',
    process_step1_desc: 'Wir besichtigen Ihr Projekt vor Ort und analysieren Ihre Bedürfnisse.',
    process_step2_title: 'Steinauswahl',
    process_step2_desc: 'Wir helfen Ihnen, den perfekten Naturstein auszuwählen.',
    process_step3_title: 'Produktion',
    process_step3_desc: 'Wir bereiten Ihre Steine mit individuellem Zuschnitt vor.',
    process_step4_title: 'Installation',
    process_step4_desc: 'Unser Expertenteam liefert makellose Montage.',
    why_tag: 'WARUM WIR',
    why_title: 'Was uns unterscheidet',
    why1_title: 'Direkter Hersteller',
    why1_desc: 'Wir produzieren in eigenen Anlagen ohne Zwischenhändler.',
    why2_title: 'Rockshell-Technologie',
    why2_desc: 'Wir führen mit patentierten ultradünnen Natursteinpaneelen.',
    why3_title: '15+ Jahre Erfahrung',
    why3_desc: 'Wir dienen mit dem erfahrensten Team der Branche.',
    why4_title: 'Globaler Export',
    why4_desc: 'Wir exportieren in über 50 Länder.',
    cta_title: 'Gestalten wir Ihren Traumraum gemeinsam.',
    cta_sim_title: 'KI-Simulation',
    cta_sim_step1: 'Foto hochladen',
    cta_sim_step2: 'Stein wählen',
    cta_sim_step3: 'Ergebnis sehen',
    cta_sim_btn: 'Simulation Testen',
    cta_teklif_title: 'Angebot',
    cta_teklif_btn: 'Angebotsformular',
    cta_whatsapp: 'WhatsApp',
    cta_kesif: 'Kostenlose Besichtigung',
    cta_fiyat: 'Detaillierte Preise',
    cta_danismanlik: 'Steinberatung',
    cta_nakliye: 'Versand & Montage',
    footer_desc: 'Wir vereinen die Schönheit von Naturstein mit moderner Architektur.',
    footer_links: 'Schnelllinks',
    footer_iletisim: 'Kontakt',
    footer_rights: 'Alle Rechte vorbehalten.',
    about_tag: 'Über Uns',
    about_title1: 'Leidenschaftlich für',
    about_title2: 'Naturstein.',
    about_desc: 'Urla Stone wurde aus der gemeinsamen Vision dreier Gründer mit über 15 Jahren Erfahrung geboren.',
    about_stat1: 'Jahre Erfahrung',
    about_stat2: 'Abgeschlossene Projekte',
    about_stat3: 'Exportländer',
    about_stat4: 'Steinvarianten',
    about_story_tag: 'Unsere Geschichte',
    about_story_title: 'Aus dem Herzen von Urla',
    about_story_gold: 'in die Welt.',
    about_team_tag: 'Unser Team',
    about_team_title: 'Unsere Gründer',
    about_values_tag: 'Unsere Werte',
    about_values_title: 'Die Prinzipien, die uns ausmachen.',
    about_val1: 'Qualität',
    about_val2: 'Innovation',
    about_val3: 'Vertrauen',
    about_val4: 'Globale Vision',
    about_loc_tag: 'Hauptsitz',
    about_loc_title: 'Eine Reise von Urla',
    about_loc_gold: 'in die Welt.',
    about_cta_title: 'Kontaktieren Sie uns für Ihr Projekt.',
    about_cta_desc: 'Füllen Sie unser Formular für eine kostenlose Besichtigung aus.',
    about_cta_btn: 'Angebot',
    stones_tag: 'Produktkollektion',
    stones_title1: 'Einzigartige Steine,',
    stones_title2: 'Millionen Jahre alt.',
    stones_desc: 'Wir verwandeln die Textur von Naturstein mit Rockshell-Technologie in ultradünne Paneele.',
    stones_rockshell_tag: 'Rockshell-Serie',
    stones_rockshell_title: '4 Modelle, unendliche Möglichkeiten.',
    stones_collection_tag: 'Steinkollektion',
    stones_collection_title: 'Unsere Natursteinvarianten.',
    stones_collection_desc: 'Jeder über Millionen von Jahren geformt — unsere Steine verleihen Ihrem Projekt Charakter.',
    stones_cta_title: 'Wählen wir gemeinsam den perfekten Stein.',
    stones_cta_desc: 'Kontaktieren Sie unser Team für Muster oder technische Beratung.',
    stones_teklif_btn: 'Angebot für dieses Modell',
    contact_tag: 'Kontakt',
    contact_title: 'Kontaktieren Sie Uns',
    contact_desc: 'Lassen Sie uns über Ihr Projekt sprechen.',
    common_teklif_al: 'Angebot',
    common_whatsapp: 'Über WhatsApp Kontaktieren',
    common_iletisim: 'Kontakt',
  },
}

export function getTranslations(locale: Locale) {
  return translations[locale] || translations.tr
}
