import EventDetailPage from '../components/events/EventDetailPage.tsx'

export default function Event1() {
  return (
    <section>
      <h1 className="font-heading text-4xl font-medium text-mist sm:text-5xl">
        Event 1
      </h1>
      <p className="mt-4 leading-relaxed">
        This is the{' '}
        <code className="rounded bg-mist/10 px-1.5 py-0.5 font-mono text-sm text-mist">
          /event1
        </code>{' '}
        page. Replace this with your real Event 1 content.
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
