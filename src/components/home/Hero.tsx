import { Link } from 'react-router'
import HeroLogo3D from './HeroLogo3D.tsx'

export default function Hero() {
  return (
    <section
      id="home"
      className="relative -mx-4 -mt-[4.5rem] flex h-[100svh] max-w-none flex-col items-center justify-end overflow-x-clip text-center sm:-mx-8 sm:-mt-[5rem]"
    >
      <h1 className="sr-only">Arcane 3.0</h1>
      <HeroLogo3D />
      <div className="relative z-10 flex flex-wrap justify-center gap-3 px-4 pb-[9svh]">
        <Link
          to="/event1"
          className="rounded-lg bg-medium-red px-4 py-2 text-sm font-medium text-mist transition-colors hover:bg-dark-red"
        >
          Explore events
        </Link>
        <a
          href="#about"
          className="rounded-lg border border-dark-red/30 bg-near-black/5 px-4 py-2 text-sm font-medium text-near-black backdrop-blur-sm transition-shadow hover:shadow-lg dark:border-mist/20 dark:bg-mist/10 dark:text-mist"
        >
          Learn more
        </a>
      </div>
    </section>
  )
}
