import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import FeaturedStones from '@/components/FeaturedStones'
import ProcessSection from '@/components/ProcessSection'
import ReferansMarquee from '@/components/ReferansMarquee'
import InstagramFeed from '@/components/InstagramFeed'
import CTASection from '@/components/CTASection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <InstagramFeed />
      <FeaturedStones />
      <ProcessSection />
      <ReferansMarquee />
      <CTASection />
      <Footer />
    </main>
  )
}
