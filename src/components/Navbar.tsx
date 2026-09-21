import { NavLink } from 'react-router'

const linkBase =
  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
const linkActive =
  'bg-purple-500/10 text-purple-600 dark:bg-purple-400/15 dark:text-purple-300'

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? `${linkBase} ${linkActive}` : linkBase
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-zinc-200 bg-white/90 px-4 py-3 font-primary backdrop-blur sm:px-8 dark:border-zinc-800 dark:bg-zinc-950/90">
      <NavLink
        to="/"
        className="font-secondary text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50"
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
  )
}
