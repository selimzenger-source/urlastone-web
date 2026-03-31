// Supabase storage URL'lerini Vercel CDN proxy üzerinden servis et
// Bu sayede Supabase egress azalır, görseller Vercel Edge'den cache'lenir

export function cdnImg(url: string | null | undefined): string {
  if (!url) return ''
  // Sadece Supabase storage URL'lerini proxy'le
  if (url.includes('supabase.co/storage')) {
    return `/api/img?url=${encodeURIComponent(url)}`
  }
  // Diğer URL'ler (local, clearbit vb.) olduğu gibi döner
  return url
}
