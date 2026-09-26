import { useId } from 'react'
import { Link } from 'react-router'
import { DEFAULT_EVENTS, type EventItem } from '../../data/events.ts'

interface EventsProps {
  events?: EventItem[]
}

export default function Events({
  events = DEFAULT_EVENTS,
}: EventsProps) {
  const sectionId = useId()

  return (
    <section
      id="events"
      aria-labelledby={`${sectionId}-heading`}
      className="relative w-full scroll-mt-20 py-12 sm:py-16"
    >
      {/* Header section */}
      <div className="flex shrink-0 flex-col justify-between gap-2 px-2 pb-6 sm:flex-row sm:items-end sm:pb-8">
        <div>
          <div className="mb-1 flex items-center gap-1.5 font-mono text-xs font-semibold tracking-wider text-medium-red uppercase">
            <span
              className="inline-block h-2 w-2 bg-medium-red"
              aria-hidden="true"
            />
            <span>Featured Experiences</span>
          </div>

          <h2
            id={`${sectionId}-heading`}
            className="font-heading text-3xl font-bold text-near-black underline underline-offset-8 decoration-medium-red sm:text-4xl md:text-5xl dark:text-mist"
          >
            EVENTS
          </h2>
        </div>
      </div>

      {/* Cyberpunk HUD Events Grid - 3 cards per row on desktop */}
      <div className="grid grid-cols-1 gap-3.5 sm:gap-4 lg:grid-cols-3 lg:gap-5">
        {events.map((event) => {
          const isLocked = event.actionText === 'LOCKED' || event.status === 'FULL'

          return (
            <article
              key={event.id}
              className="group relative flex flex-col rounded-xs border border-dark-red/40 bg-near-black text-mist transition-all duration-300 hover:border-medium-red hover:shadow-[0_0_20px_rgba(170,52,48,0.25)]"
            >
              {/* Poster Image Container */}
              <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-dark-red/40 bg-black">
                <img
                  src={event.image}
                  alt={event.title}
                  loading="lazy"
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />

                {/* Vignette & CRT Scanline Gradient */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-near-black via-transparent to-near-black/30"
                />
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col justify-between gap-3 p-3.5 sm:p-4">
                <div className="space-y-1.5">
                  {/* Title & Prize Row */}
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-heading text-base font-bold tracking-wider text-mist transition-colors group-hover:text-white uppercase sm:text-lg">
                      {event.title}
                    </h3>
                    {/* <span className="font-mono text-xs font-bold tracking-widest text-medium-red sm:text-sm">
                      {event.prize}
                    </span> */}
                  </div>

                  {/* Description */}
                  <p className="font-content text-xs leading-snug text-mist/75 line-clamp-2 h-[2.25rem]">
                    {event.description}
                  </p>
                </div>

                {/* Card Action & Time Footer Bar */}
                <div className="flex items-center justify-between border-t border-dark-red/30 pt-3">
                  <span className="font-mono text-xs font-bold tracking-wider text-mist/75 sm:text-sm">
                    TIME::{event.time}
                  </span>

                  <Link
                    to={event.to}
                    className={`inline-flex items-center gap-1.5 border px-3.5 py-1.5 font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200 active:scale-95 sm:text-sm ${
                      isLocked
                        ? 'border-dark-red/40 text-mist/40 hover:border-dark-red/70 hover:text-mist/70'
                        : 'border-medium-red bg-medium-red/10 text-mist hover:bg-medium-red hover:text-mist hover:shadow-[0_0_16px_rgba(170,52,48,0.5)]'
                    }`}
                  >
                    <span> {event.actionText || 'REGISTER'} ▶ </span>
                  </Link>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

