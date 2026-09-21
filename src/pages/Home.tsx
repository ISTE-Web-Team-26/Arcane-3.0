import { Link } from 'react-router'

const events = [
  { to: '/event1', label: 'Go to Event 1' },
  { to: '/event2', label: 'Go to Event 2' },
  { to: '/event3', label: 'Go to Event 3' },
]

export default function Home() {
  return (
    <section>
      <h1 className="text-4xl font-medium tracking-tight text-zinc-950 sm:text-5xl dark:text-zinc-50">
        Home
      </h1>
      <p className="mt-4 leading-relaxed">
        Welcome to Arcane 3.0. This is the root{' '}
        <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50">
          /
        </code>{' '}
        page of the single-page application.
      </p>
      <p className="mt-3 leading-relaxed">
        Navigate to one of the event pages — client-side routing means no full
        page reload:
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        {events.map((e) => (
          <Link
            key={e.to}
            to={e.to}
            className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 transition-shadow hover:shadow-lg dark:bg-zinc-800 dark:text-zinc-50"
          >
            {e.label}
          </Link>
        ))}
      </div>
    </section>
  )
}
