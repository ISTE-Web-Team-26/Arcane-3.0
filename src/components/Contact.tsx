import { Link } from 'react-router'

export default function Contact() {
  return (
    <footer className="border-t border-zinc-200 px-4 py-6 font-content sm:px-8 dark:border-zinc-800">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-heading text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            Arcane 3.0
          </p>
          <p className="mt-1 text-sm">
            Questions about the events?{' '}
            <a
              href="mailto:hello@example.com"
              className="font-medium text-purple-600 hover:underline dark:text-purple-300"
            >
              hello@example.com
            </a>
          </p>
        </div>
        <nav className="flex flex-wrap gap-1 text-sm">
          <Link
            to="/"
            className="rounded-md px-3 py-1.5 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            Home
          </Link>
          <Link
            to="/event1"
            className="rounded-md px-3 py-1.5 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            Event 1
          </Link>
          <Link
            to="/event2"
            className="rounded-md px-3 py-1.5 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            Event 2
          </Link>
          <Link
            to="/event3"
            className="rounded-md px-3 py-1.5 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            Event 3
          </Link>
        </nav>
      </div>
      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">
        © {new Date().getFullYear()} Arcane 3.0. All rights reserved.
      </p>
    </footer>
  )
}
