// Supabase Pro tier ($25) — kendi CDN'imiz var, Vercel origin transfer tasarrufu icin
// Supabase URL'leri DIREKT servis edilir, /api/img proxy artik gerekli degil.
//
// Not: /api/img route'u silinmedi (backward compat ve fallback icin duruyor).
// Yeni istekler direkt Supabase CDN'e gidecek.

export function cdnImg(url: string | null | undefined): string {
  if (!url) return ''
  // Tum URL'ler direkt (Supabase dahil) — proxy bypass
  return url
}
