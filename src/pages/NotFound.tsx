import { Link } from 'react-router'

export default function NotFound() {
  return (
    <section>
      <h1 className="font-heading text-4xl font-medium text-mist sm:text-5xl">
        404 — Not found
      </h1>
      <p className="mt-4 leading-relaxed">This page doesn&apos;t exist.</p>
      <Link
        to="/"
        className="mt-6 inline-block text-sm font-medium text-mist hover:text-medium-red hover:underline"
      >
        ← Back to Home
      </Link>
    </section>
  )
}
