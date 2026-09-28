import { useParams } from 'react-router'
import { useEvents } from '../data/useEvents.ts'
import SyncedEventDetail from '../components/events/SyncedEventDetail.tsx'
import NotFound from './NotFound.tsx'

function LoadingSkeleton() {
  return (
    <div className="relative -mx-4 -mt-[4.5rem] sm:-mx-8 sm:-mt-[5rem] -mb-8 soil-bg-layer px-4 pt-[calc(4.5rem+2rem)] pb-16 sm:px-8 sm:pt-[calc(5rem+3rem)]">
      <div className="mx-auto max-w-6xl animate-pulse space-y-6">
        <div className="h-8 w-48 rounded-lg bg-dark-red/20" />
        <div className="h-16 w-3/4 rounded-xl bg-dark-red/20 sm:h-20" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
          <div className="h-28 rounded-xl bg-dark-red/20" />
          <div className="h-28 rounded-xl bg-dark-red/20" />
          <div className="h-28 rounded-xl bg-dark-red/20" />
          <div className="h-28 rounded-xl bg-dark-red/20" />
        </div>
        <div className="h-64 rounded-2xl bg-dark-red/20" />
      </div>
    </div>
  )
}

export default function Event() {
  const { slug } = useParams()
  const { events, loading } = useEvents()

  if (loading) return <LoadingSkeleton />

  const event = events.find((e) => e.id === slug)
  if (!event) return <NotFound />

  return <SyncedEventDetail event={event} />
}
