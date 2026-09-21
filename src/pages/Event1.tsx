import { Link } from 'react-router'

export default function Event1() {
  return (
    <section>
      <h1>Event 1</h1>
      <p>
        This is the <code>/event1</code> page. Replace this with your real
        Event 1 content.
      </p>
      <Link to="/" className="back-link">
        ← Back to Home
      </Link>
    </section>
  )
}
