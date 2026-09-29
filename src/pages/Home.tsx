import { lazy, Suspense } from 'react'
import BackgroundParticles from '../components/BackgroundParticles.tsx'
import Hero from '../components/home/Hero.tsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'

// Lazy-load below-the-fold sections so they don't block first paint
const About = lazy(() => import('../components/home/About.tsx'))
const Events = lazy(() => import('../components/home/Events.tsx'))
const FAQ = lazy(() => import('../components/home/FAQ.tsx'))

export default function Home() {
  useDocumentTitle('Arcane 3.0')
  return (
    <>
      <Hero />
      <div className="relative -mx-4 -mb-8 overflow-hidden sm:-mx-8 soil-bg-layer px-4 pt-10 pb-8 sm:px-8 sm:pt-14">
        {/* Floating atmospheric ember particles */}
        <BackgroundParticles density={18} />

        <Suspense fallback={null}>
          <div className="relative z-10 space-y-8 sm:space-y-12">
            <About />

            {/* Strata Transition Line */}
            <div
              aria-hidden="true"
              className="my-4 h-[1px] w-full bg-gradient-to-r from-transparent via-dark-red/30 to-transparent animate-strata-pulse sm:my-8"
            />

            <Events />

            {/* Strata Transition Line */}
            <div
              aria-hidden="true"
              className="my-4 h-[1px] w-full bg-gradient-to-r from-transparent via-dark-red/30 to-transparent animate-strata-pulse sm:my-8"
            />

            <FAQ />
          </div>
        </Suspense>
      </div>
    </>
  )
}
