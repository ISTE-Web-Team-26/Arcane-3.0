import { useParams } from 'react-router'
import { useEvents } from '../data/useEvents.ts'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import EventRegister from '../components/events/EventRegister.tsx'
import EventLoading from '../components/events/EventLoading.tsx'
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

  return <EventRegister key={event.id} event={event} />
}
