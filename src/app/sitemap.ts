import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.urlastone.com'

  return [
    // Ana sayfa
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },

    // Ürünlerimiz (eski: /taslar)
    { url: `${baseUrl}/urunlerimiz`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.95 },

    // Projelerimiz (eski: /uygulamalarimiz)
    { url: `${baseUrl}/projelerimiz`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },

    // AI Simülasyon
    { url: `${baseUrl}/simulasyon`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },

    // Teklif
    { url: `${baseUrl}/teklif`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },

    // Hakkımızda
    { url: `${baseUrl}/hakkimizda`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },

    // İletişim
    { url: `${baseUrl}/iletisim`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },

    // Referanslarımız
    { url: `${baseUrl}/referanslarimiz`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]
}
