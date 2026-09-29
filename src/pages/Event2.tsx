import EventDetailPage from '../components/events/EventDetailPage.tsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'

export default function Event2() {
  useDocumentTitle('BYTE_SURGE | Arcane 3.0')
  return <EventDetailPage />
}
