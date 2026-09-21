import { Link } from 'react-router'

export default function Contact() {
  return (
    <footer className="border-t border-dark-red/30 px-4 py-6 font-content sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-heading text-sm font-semibold text-near-black dark:text-mist">
            Arcane 3.0
          </p>
          <p className="mt-1 text-sm">
            Questions about the events?{' '}
            <a
              href="mailto:hello@example.com"
              className="font-medium text-medium-red hover:text-dark-red hover:underline dark:text-mist dark:hover:text-medium-red"
            >
              hello@example.com
            </a>
          </p>
        </div>
        <nav className="flex flex-wrap gap-1 text-sm">
          <Link
            to="/"
            className="rounded-md px-3 py-1.5 transition-colors hover:bg-medium-red/10 hover:text-medium-red dark:hover:bg-medium-red/20 dark:hover:text-mist"
          >
            Home
          </Link>
          <Link
            to="/event1"
            className="rounded-md px-3 py-1.5 transition-colors hover:bg-medium-red/10 hover:text-medium-red dark:hover:bg-medium-red/20 dark:hover:text-mist"
          >
            Event 1
          </Link>
          <Link
            to="/event2"
            className="rounded-md px-3 py-1.5 transition-colors hover:bg-medium-red/10 hover:text-medium-red dark:hover:bg-medium-red/20 dark:hover:text-mist"
          >
            Event 2
          </Link>
          <Link
            to="/event3"
            className="rounded-md px-3 py-1.5 transition-colors hover:bg-medium-red/10 hover:text-medium-red dark:hover:bg-medium-red/20 dark:hover:text-mist"
          >
            Event 3
          </Link>
        </nav>
      </div>
      <p className="mt-4 text-xs text-near-black/50 dark:text-mist/50">
        © {new Date().getFullYear()} Arcane 3.0. All rights reserved.
      </p>
    </footer>
  )
}
