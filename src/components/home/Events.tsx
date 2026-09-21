import { Link } from 'react-router'

const events = [
  { to: '/event1', title: 'Event 1', blurb: 'TODO: Event 1 short blurb.' },
  { to: '/event2', title: 'Event 2', blurb: 'TODO: Event 2 short blurb.' },
  { to: '/event3', title: 'Event 3', blurb: 'TODO: Event 3 short blurb.' },
]

export default function Events() {
  return (
    <section className="mt-12">
      <h2 className="font-heading text-2xl font-medium tracking-tight text-zinc-950 dark:text-zinc-50">
        Events
      </h2>
      <p className="mt-3 leading-relaxed">
        TODO: Events placeholder — cards linking to each event page.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {events.map((e) => (
          <Link
            key={e.to}
            to={e.to}
            className="rounded-xl border border-zinc-200 p-4 transition-shadow hover:shadow-lg dark:border-zinc-800"
          >
            <p className="font-heading font-medium text-zinc-950 dark:text-zinc-50">
              {e.title}
            </p>
            <p className="mt-1 text-sm">{e.blurb}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
