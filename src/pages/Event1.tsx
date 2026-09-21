import { Link } from 'react-router'

export default function Event1() {
  return (
    <section>
      <h1 className="font-heading text-4xl font-medium tracking-tight text-near-black sm:text-5xl dark:text-mist">
        Event 1
      </h1>
      <p className="mt-4 leading-relaxed">
        This is the{' '}
        <code className="rounded bg-near-black/5 px-1.5 py-0.5 font-mono text-sm text-near-black dark:bg-mist/10 dark:text-mist">
          /event1
        </code>{' '}
        page. Replace this with your real Event 1 content.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block text-sm font-medium text-medium-red hover:text-dark-red hover:underline dark:text-mist dark:hover:text-medium-red"
      >
        ← Back to Home
      </Link>
    </section>
  )
}
