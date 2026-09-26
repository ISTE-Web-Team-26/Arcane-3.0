import { useId, useState } from 'react'
import { Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { DEFAULT_EVENTS, type EventItem } from '../../data/events.ts'

interface EventsProps {
  events?: EventItem[]
}

const CATEGORIES = [
  { id: 'ALL', label: 'ALL TRACKS' },
  { id: '01 // CODE', label: 'CODE / HACK' },
  { id: '02 // GAME', label: 'GAMING / FPS' },
  { id: '03 // ROBO', label: 'ROBOTICS' },
  { id: '04 // SEC', label: 'CYBERSEC / CTF' },
  { id: '05 // AI', label: 'AI / SYNTH' },
  { id: '06 // DSGN', label: 'DESIGN / UX' },
]

export default function Events({ events = DEFAULT_EVENTS }: EventsProps) {
  const sectionId = useId()
  const [activeCategory, setActiveCategory] = useState('ALL')

  const filteredEvents =
    activeCategory === 'ALL'
      ? events
      : events.filter((e) => e.track === activeCategory)

  return (
    <section
      id="events"
      aria-labelledby={`${sectionId}-heading`}
      className="relative w-full scroll-mt-20 py-8 sm:py-10"
    >
      {/* Header with Scroll Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] as const }}
      >
        {/* Header Tag */}
        <div className="mb-2 flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-medium-red uppercase">
          <span
            className="inline-block h-2 w-2 bg-medium-red"
            aria-hidden="true"
          />
          <span>Arena // Featured Experiences</span>
        </div>

        {/* Main Section Heading */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:mb-10 lg:flex-row lg:items-end">
          <div>
            <h2
              id={`${sectionId}-heading`}
              className="font-heading text-3xl font-bold tracking-tight text-mist sm:text-4xl md:text-5xl dark:text-mist"
            >
              FEATURED{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e05652] via-[#ea6e6b] to-[#f4938f]">
                EVENTS
              </span>{' '}
              & ARENAS
            </h2>
            <p className="mt-2 max-w-2xl font-content text-xs text-mist/70 sm:text-sm md:text-base">
              High-stakes competitive hackathons, esports tournaments, kinetic
              robotics clashes, and cybersecurity challenges designed for elite
              builders.
            </p>
          </div>

          <h2
            id={`${sectionId}-heading`}
            className="font-heading text-3xl font-bold text-mist underline underline-offset-8 decoration-medium-red sm:text-4xl md:text-5xl"
          >
            EVENTS
          </h2>
        </div>

        {/* Category Filter Pills with interactive animation */}
        <div className="mb-8 flex flex-wrap gap-2 sm:gap-2.5 font-mono text-xs">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`relative rounded-lg border px-3 py-1.5 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'border-medium-red bg-medium-red/20 font-bold text-mist shadow-[0_0_12px_rgba(170,52,48,0.4)]'
                    : 'border-dark-red/30 bg-near-black/60 text-mist/60 hover:border-dark-red/60 hover:text-mist'
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Events Grid with Scroll Entrance & Card Hover Physics */}
      <motion.div
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6"
      >
        <AnimatePresence mode="sync">
          {filteredEvents.map((event, index) => {
            const isLocked =
              event.actionText === 'LOCKED' || event.status === 'FULL'

            return (
              <motion.article
                key={event.id}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{
                  duration: 0.5,
                  delay: (index % 3) * 0.08,
                  ease: [0.16, 1, 0.3, 1] as const,
                }}
                whileHover={{ y: -6, scale: 1.015 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-dark-red/30 bg-near-black/80 transition-colors duration-300 hover:border-medium-red/60 hover:shadow-[0_0_25px_rgba(170,52,48,0.2)]"
              >
                <div>
                  {/* Poster Image Container */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-dark-red/30 bg-black">
                    <img
                      src={event.image}
                      alt={event.title}
                      loading="lazy"
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Vignette & CRT Scanline Gradient */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-near-black via-transparent to-near-black/40"
                    />

                    {/* Overlay Badges */}
                    {/* <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                      <span className="rounded-md border border-dark-red/50 bg-near-black/90 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-medium-red backdrop-blur-xs">
                        {event.code}
                      </span>

                      Status Pill
                      <span
                        className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider backdrop-blur-xs ${
                          event.status === 'FULL'
                            ? 'border-red-900 bg-red-950/90 text-red-400'
                            : event.status === 'SLOTS_LOW' ||
                                event.status === 'LIMITED'
                              ? 'border-amber-700/60 bg-amber-950/80 text-amber-300'
                              : 'border-emerald-800/60 bg-emerald-950/80 text-emerald-300'
                        }`}
                      >
                        ● {event.status}
                      </span>
                    </div> */}

                    {/* Prize Badge in Image corner */}
                    {event.prize && (
                      <div className="absolute bottom-2.5 right-2.5 rounded-md border border-medium-red/60 bg-near-black/90 px-2.5 py-0.5 font-mono text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#e05652] to-[#f4938f] backdrop-blur-xs shadow-[0_0_10px_rgba(170,52,48,0.3)]">
                        PRIZE: {event.prize}
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5">
                    {/* Track & Squad Info Row */}
                    {/* <div className="mb-2 flex items-center justify-between font-mono text-[11px] text-mist/60">
                      <span className="text-medium-red font-semibold uppercase">
                        {event.track}
                      </span>
                      <span>
                        {event.squadLabel || 'SQUAD'}: {event.squad}
                      </span>
                    </div> */}

                    {/* Title */}
                    <h3 className="font-heading text-xl font-bold tracking-wide text-mist transition-colors group-hover:text-white uppercase sm:text-2xl">
                      {event.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 font-content text-xs leading-relaxed text-mist/70 line-clamp-2 sm:text-sm">
                      {event.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 pt-0 sm:p-5 sm:pt-0">
                  <div className="flex items-center justify-between border-t border-dark-red/25 pt-3.5">
                    <div className="flex flex-col font-mono text-[11px] text-mist/70">
                      <span className="font-semibold text-mist/90">
                        TIME: {event.time}
                      </span>
                      <span className="text-mist/50">VENUE: {event.venue}</span>
                    </div>

                    <Link
                      to={event.to}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 font-mono text-xs font-bold tracking-wider uppercase transition-all duration-200 active:scale-95 sm:text-sm ${
                        isLocked
                          ? 'border-dark-red/30 bg-near-black/50 text-mist/40 hover:border-dark-red/50 hover:text-mist/60 cursor-not-allowed'
                          : 'border-medium-red bg-medium-red/15 text-mist hover:bg-medium-red hover:text-mist hover:shadow-[0_0_16px_rgba(170,52,48,0.5)]'
                      }`}
                    >
                      <span>{event.actionText || 'REGISTER'} ▶</span>
                    </Link>
                  </div>

                  {/* Bottom Red Accent Indicator Bar */}
                  <div className="mt-4 h-[2px] w-full overflow-hidden rounded-full bg-dark-red/30">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-dark-red to-medium-red transition-all duration-500 group-hover:w-full" />
                  </div>
                </div>
              </motion.article>
            )
          })}
        </AnimatePresence>
      </motion.div>
    </section>
  )
}
