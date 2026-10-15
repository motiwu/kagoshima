import { Hero } from '@/components/Hero'
import { Prep } from '@/components/Prep'
import { AreaCompare } from '@/components/AreaCompare'
import { Overview } from '@/components/Overview'
import { Hotels } from '@/components/Hotels'
import { FloatingLink } from '@/components/FloatingLink'
import { Footer } from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Hero />
      <Prep />
      <AreaCompare />
      <Overview />
      <Hotels />
      <Footer />
      <FloatingLink href="/days" label="旅の日程" direction="forward" afterHero />
    </main>
  )
}
