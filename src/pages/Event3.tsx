import { Link } from 'react-router'

export default function Event3() {
  return (
    <section>
      <h1>Event 3</h1>
      <p>
        This is the <code>/event3</code> page. Replace this with your real
        Event 3 content.
      </p>
      <Link to="/" className="back-link">
        ← Back to Home
      </Link>
    </section>
  )
}
