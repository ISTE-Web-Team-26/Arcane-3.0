import EventDetailPage from '../components/events/EventDetailPage.tsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'

export default function Event3() {
  useDocumentTitle('BYTE_SURGE | Arcane 3.0')
  return <EventDetailPage />
}
