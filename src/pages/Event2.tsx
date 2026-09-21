import { Link } from 'react-router'

export default function Event2() {
  return (
    <section>
      <h1>Event 2</h1>
      <p>
        This is the <code>/event2</code> page. Replace this with your real
        Event 2 content.
      </p>
      <Link to="/" className="back-link">
        ← Back to Home
      </Link>
    </section>
  )
}
