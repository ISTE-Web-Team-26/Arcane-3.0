import { Link } from 'react-router'

export default function NotFound() {
  return (
    <section>
      <h1 className="text-4xl font-medium tracking-tight text-zinc-950 sm:text-5xl dark:text-zinc-50">
        404 — Not found
      </h1>
      <p className="mt-4 leading-relaxed">This page doesn&apos;t exist.</p>
      <Link
        to="/"
        className="mt-6 inline-block text-sm font-medium text-purple-600 hover:underline dark:text-purple-300"
      >
        ← Back to Home
      </Link>
    </section>
  )
}
