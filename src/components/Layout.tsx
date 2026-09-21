import { NavLink, Outlet } from 'react-router'

const linkBase =
  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
const linkActive =
  'bg-purple-500/10 text-purple-600 dark:bg-purple-400/15 dark:text-purple-300'

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? `${linkBase} ${linkActive}` : linkBase
}

export default function Layout() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col border-x border-zinc-200 bg-white text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-8 dark:border-zinc-800 dark:bg-zinc-950/90">
        <NavLink
          to="/"
          className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50"
        >
          Arcane 3.0
        </NavLink>
        <nav className="flex flex-wrap gap-1">
          <NavLink to="/" end className={navClass}>
            Home
          </NavLink>
          <NavLink to="/event1" className={navClass}>
            Event 1
          </NavLink>
          <NavLink to="/event2" className={navClass}>
            Event 2
          </NavLink>
          <NavLink to="/event3" className={navClass}>
            Event 3
          </NavLink>
        </nav>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-8">
        <Outlet />
      </main>
    </div>
  )
}
