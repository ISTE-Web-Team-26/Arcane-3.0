import { Link } from 'react-router'
import art from '../../assets/arcane-3.0.txt?raw'

export default function Hero() {
  return (
    <section
      id="home"
      className="flex min-h-[62svh] w-full scroll-mt-20 flex-col items-center justify-center text-center"
    >
      <h1 className="sr-only">Arcane 3.0</h1>
      <pre
        aria-label="Arcane 3.0"
        className="mx-auto w-fit max-w-full overflow-x-auto font-mono text-xs leading-[1.4] text-medium-red sm:text-sm md:text-base selection:bg-medium-red selection:text-mist dark:text-mist"
      >
        {art}
      </pre>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          to="/event1"
          className="rounded-lg bg-medium-red px-4 py-2 text-sm font-medium text-mist transition-colors hover:bg-dark-red"
        >
          Explore events
        </Link>
        <a
          href="#about"
          className="rounded-lg border border-dark-red/30 bg-near-black/5 px-4 py-2 text-sm font-medium text-near-black transition-shadow hover:shadow-lg dark:border-mist/20 dark:bg-mist/10 dark:text-mist"
        >
          Learn more
        </a>
      </div>
    </section>
  )
}
