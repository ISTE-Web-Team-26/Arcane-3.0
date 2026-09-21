import { Link } from 'react-router'

export default function Hero() {
  return (
    <section className="text-center sm:text-left">
      <h1 className="font-heading text-4xl font-medium tracking-tight text-zinc-950 sm:text-5xl dark:text-zinc-50">
        Arcane 3.0
      </h1>
      <p className="mt-4 leading-relaxed">
        TODO: Hero placeholder — headline, subcopy, and primary call to action.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
        <Link
          to="/event1"
          className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-zinc-50 dark:text-zinc-950"
        >
          Explore events
        </Link>
        <a
          href="#about"
          className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 transition-shadow hover:shadow-lg dark:bg-zinc-800 dark:text-zinc-50"
        >
          Learn more
        </a>
      </div>
    </section>
  )
}
