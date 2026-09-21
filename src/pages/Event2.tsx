import { Link } from 'react-router'

export default function Event2() {
  return (
    <section>
      <h1 className="text-4xl font-medium tracking-tight text-zinc-950 sm:text-5xl dark:text-zinc-50">
        Event 2
      </h1>
      <p className="mt-4 leading-relaxed">
        This is the{' '}
        <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50">
          /event2
        </code>{' '}
        page. Replace this with your real Event 2 content.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block text-sm font-medium text-purple-600 hover:underline dark:text-purple-300"
      >
        ← Back to Home
      </Link>
    </section>
  )
}
