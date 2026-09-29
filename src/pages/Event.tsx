import { useParams } from 'react-router'
import { useEvents } from '../data/useEvents.ts'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import SyncedEventDetail from '../components/events/SyncedEventDetail.tsx'
import EventLoading from '../components/events/EventLoading.tsx'
import NotFound from './NotFound.tsx'

export default function Event() {
  const { slug } = useParams()
  const { events, loading } = useEvents()
  const event = !loading
    ? events.find((e) => e.id === slug)
    : undefined
  useDocumentTitle(
    event ? `${event.title} | Arcane 3.0` : 'Event | Arcane 3.0',
  )

  if (loading) return <EventLoading />

  if (!event) return <NotFound />

  return <SyncedEventDetail event={event} />
}
