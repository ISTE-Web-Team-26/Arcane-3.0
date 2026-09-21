import { Link } from 'react-router'

export default function Home() {
  return (
    <section>
      <h1>Home</h1>
      <p>
        Welcome to Arcane 3.0. This is the root <code>/</code> page of the
        single-page application.
      </p>
      <p style={{ marginTop: 12 }}>
        Navigate to one of the event pages — client-side routing means no full
        page reload:
      </p>
      <div className="page-links">
        <Link to="/event1">Go to Event 1</Link>
        <Link to="/event2">Go to Event 2</Link>
        <Link to="/event3">Go to Event 3</Link>
      </div>
    </section>
  )
}
