import { Link, useParams } from 'react-router'
import { useEvents } from '../data/useEvents.ts'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import EventRegister from '../components/events/EventRegister.tsx'
import EventLoading from '../components/events/EventLoading.tsx'
import BackgroundParticles from '../components/BackgroundParticles.tsx'
import NotFound from './NotFound.tsx'

export default function Register() {
  const { slug } = useParams()
  const { events, loading } = useEvents()
  const event = !loading ? events.find((e) => e.id === slug) : undefined
  useDocumentTitle(
    event ? `Register for ${event.title} | Arcane 3.0` : 'Register | Arcane 3.0',
  )

  if (loading) return <EventLoading />

  if (!event) return <NotFound />

  // Closed events keep their detail page but no registration form —
  // the Edge Function rejects direct submissions as well.
  if (event.enabled === false || event.status === 'CLOSED') {
    return (
      <div className="relative -mx-4 -mt-[4.5rem] -mb-8 overflow-hidden soil-bg-layer px-4 pt-[calc(4.5rem+2rem)] pb-16 sm:-mx-8 sm:-mt-[5rem] sm:px-8 sm:pt-[calc(5rem+3rem)]">
        <BackgroundParticles density={10} className="z-0" />
        <div className="relative z-10 mx-auto w-full max-w-xl text-center">
          <p className="font-mono text-xs font-semibold tracking-[0.25em] text-medium-red uppercase">
            Registration // {event.code || 'ARCANE'}
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight text-mist uppercase sm:text-5xl">
            Registrations closed
          </h1>
          <p className="mt-3 font-content text-sm text-mist/60">
            Online registration for {event.title} has closed.
          </p>
          <Link
            to={`/events/${event.id}`}
            className="mt-6 inline-flex items-center justify-center rounded-xl border border-dark-red/40 bg-near-black/80 px-6 py-3 font-mono text-xs font-bold tracking-wider text-mist/75 uppercase hover:border-medium-red/60 hover:text-mist"
          >
            ← Back to event
          </Link>
        </div>
      </div>
    )
  }

  return <EventRegister key={event.id} event={event} />
}
