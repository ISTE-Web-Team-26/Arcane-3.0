import EventDetailPage from '../components/events/EventDetailPage.tsx'

export default function Event3() {
  return (
    <section>
      <h1 className="font-heading text-4xl font-medium text-mist sm:text-5xl">
        Event 3
      </h1>
      <p className="mt-4 leading-relaxed">
        This is the{' '}
        <code className="rounded bg-mist/10 px-1.5 py-0.5 font-mono text-sm text-mist">
          /event3
        </code>{' '}
        page. Replace this with your real Event 3 content.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block text-sm font-medium text-mist hover:text-medium-red hover:underline"
      >
        ← Back to Home
      </Link>
    </section>
  )
}
