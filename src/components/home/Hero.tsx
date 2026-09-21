import { Link } from 'react-router'

export default function Hero() {
  return (
    <section className="text-center sm:text-left">
      <h1 className="font-heading text-4xl font-medium tracking-tight text-near-black sm:text-5xl dark:text-mist">
        Arcane 3.0
      </h1>
      <p className="mt-4 leading-relaxed">
        TODO: Hero placeholder — headline, subcopy, and primary call to action.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
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
