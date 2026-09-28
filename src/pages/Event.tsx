import { useParams } from 'react-router'
import { useEvents } from '../data/useEvents.ts'
import SyncedEventDetail from '../components/events/SyncedEventDetail.tsx'
import EventLoading from '../components/events/EventLoading.tsx'
import NotFound from './NotFound.tsx'

export default function Event() {
  const { slug } = useParams()
  const { events, loading } = useEvents()

  if (loading) return <EventLoading />

  const event = events.find((e) => e.id === slug)
  if (!event) return <NotFound />

  return <SyncedEventDetail event={event} />
}
