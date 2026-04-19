import { MetadataRoute } from 'next'

// NOT: Next.js MetadataRoute.Robots custom direktifleri (Content-Signal) desteklemiyor
// Bu yuzden Content-Signal, AI crawler listesi ve AI kaynak referanslari
// public/robots.txt static dosyasinda tutuluyor. Bu dinamik route override
// ediyor — bu yuzden AI zenginlestirmelerini de buraya ekliyoruz.

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/teklif-basarili', '/*?lang='],
      },
      // AI Crawlers — hepsi acik
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'Google-CloudVertexBot', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Claude-SearchBot', allow: '/' },
      { userAgent: 'claude-web', allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
      { userAgent: 'Applebot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Perplexity-User', allow: '/' },
      { userAgent: 'Bingbot', allow: '/' },
      { userAgent: 'cohere-ai', allow: '/' },
      { userAgent: 'DuckAssistBot', allow: '/' },
      { userAgent: 'meta-externalagent', allow: '/' },
      { userAgent: 'Meta-ExternalFetcher', allow: '/' },
      { userAgent: 'facebookexternalhit', allow: '/' },
      { userAgent: 'Amazonbot', allow: '/' },
      { userAgent: 'AI2Bot', allow: '/' },
      { userAgent: 'AI2Bot-Dolma', allow: '/' },
      { userAgent: 'xAI-Bot', allow: '/' },
      { userAgent: 'PetalBot', allow: '/' },
      { userAgent: 'YouBot', allow: '/' },
      { userAgent: 'CCBot', allow: '/' },
      { userAgent: 'Bytespider', allow: '/' },
    ],
    sitemap: 'https://www.urlastone.com/sitemap.xml',
    host: 'https://www.urlastone.com',
  }
}
