import About from '../components/home/About.tsx'
import Events from '../components/home/Events.tsx'
import Hero from '../components/home/Hero.tsx'

export default function Home() {
  return (
    <>
      <Hero />
      <div className="-mx-4 -mb-8 sm:-mx-8 soil-bg-layer px-4 pt-10 pb-8 sm:px-8 sm:pt-14">
        <About />
        <Events />
      </div>
    </>
  )
}
