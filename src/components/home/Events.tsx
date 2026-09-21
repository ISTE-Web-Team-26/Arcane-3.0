import { Link } from 'react-router'

const events = [
  { to: '/event1', title: 'Event 1', blurb: 'TODO: Event 1 short blurb.' },
  { to: '/event2', title: 'Event 2', blurb: 'TODO: Event 2 short blurb.' },
  { to: '/event3', title: 'Event 3', blurb: 'TODO: Event 3 short blurb.' },
]

export default function Events() {
  return (
    <section className="mt-12">
      <h2 className="font-heading text-2xl font-medium tracking-tight text-near-black dark:text-mist">
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
            className="rounded-xl border border-dark-red/25 p-4 transition-all hover:border-medium-red hover:shadow-lg dark:border-dark-red/30 dark:hover:border-medium-red"
          >
            <p className="font-heading font-medium text-near-black dark:text-mist">
              {e.title}
            </p>
            <p className="mt-1 text-sm">{e.blurb}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
