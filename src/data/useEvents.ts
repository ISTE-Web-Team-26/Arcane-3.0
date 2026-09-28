import { useEffect, useState } from 'react'
import { DEFAULT_EVENTS, type EventItem } from './events.ts'

export type EventsSource = 'supabase' | 'fallback'

interface UseEventsResult {
  events: EventItem[]
  /** 'supabase' when public/events.json (written at build time) loaded. */
  source: EventsSource
  loading: boolean
}

/**
 * Loads the build-time generated `/events.json` (see scripts/fetch-events.ts).
 * Falls back to the bundled DEFAULT_EVENTS when the file is missing or
 * invalid — e.g. local dev without Supabase credentials.
 */
export function useEvents(): UseEventsResult {
  const [events, setEvents] = useState<EventItem[]>(DEFAULT_EVENTS)
  const [source, setSource] = useState<EventsSource>('fallback')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/events.json', { headers: { Accept: 'application/json' } })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: unknown) => {
        const list = Array.isArray(data)
          ? data
          : (data as { events?: unknown }).events
        if (!cancelled && Array.isArray(list) && list.length > 0) {
          setEvents(list as EventItem[])
          setSource('supabase')
        }
      })
      .catch(() => {
        // Keep DEFAULT_EVENTS fallback.
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { events, source, loading }
}
