import { useParams } from 'react-router'
import { useEvents } from '../data/useEvents.ts'
import EventRegister from '../components/events/EventRegister.tsx'
import EventLoading from '../components/events/EventLoading.tsx'
import NotFound from './NotFound.tsx'

export default function Register() {
  const { slug } = useParams()
  const { events, loading } = useEvents()

  if (loading) return <EventLoading />

  const event = events.find((e) => e.id === slug)
  if (!event) return <NotFound />

  return <EventRegister key={event.id} event={event} />
}
