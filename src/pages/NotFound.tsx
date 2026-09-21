import { Link } from 'react-router'

export default function NotFound() {
  return (
    <section>
      <h1>404 — Not found</h1>
      <p>This page doesn&apos;t exist.</p>
      <Link to="/" className="back-link">
        ← Back to Home
      </Link>
    </section>
  )
}
