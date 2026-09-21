import { Link } from 'react-router'

export default function NotFound() {
  return (
    <section>
      <h1 className="font-heading text-4xl font-medium tracking-tight text-near-black sm:text-5xl dark:text-mist">
        404 — Not found
      </h1>
      <p className="mt-4 leading-relaxed">This page doesn&apos;t exist.</p>
      <Link
        to="/"
        className="mt-6 inline-block text-sm font-medium text-medium-red hover:text-dark-red hover:underline dark:text-mist dark:hover:text-medium-red"
      >
        ← Back to Home
      </Link>
    </section>
  )
}
