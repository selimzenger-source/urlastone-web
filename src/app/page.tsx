import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import FeaturedStones from '@/components/FeaturedStones'
import ProcessSection from '@/components/ProcessSection'
import ReferansMarquee from '@/components/ReferansMarquee'
import MiniStats from '@/components/MiniStats'
import InstagramFeed from '@/components/InstagramFeed'
import CTASection from '@/components/CTASection'
import Footer from '@/components/Footer'

// Admin'in yüklediği taş türü resimleri 5 dk cache'lensin; upload sonrası
// revalidatePath('/') ile anında invalidate olur.
export const revalidate = 300

async function getStoneTypeImages(): Promise<Record<string, string>> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) return {}
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/stone_types?select=code,image_url`,
      {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
        next: { revalidate: 300 },
      }
    )
    if (!res.ok) return {}
    const rows: Array<{ code: string; image_url: string | null }> = await res.json()
    return Object.fromEntries(rows.filter(r => r.image_url).map(r => [r.code, r.image_url as string]))
  } catch {
    return {}
  }
}

export default async function Home() {
  const stoneImages = await getStoneTypeImages()
  return (
    <main>
      <Navbar />
      <HeroSection />
      <MiniStats />
      <InstagramFeed />
      <FeaturedStones stoneImages={stoneImages} />
      <ProcessSection />
      <ReferansMarquee />
      <CTASection />
      <Footer />
    </main>
  )
}
