import { NavLink } from 'react-router'

const linkBase =
  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors text-near-black/70 hover:bg-medium-red/10 hover:text-medium-red dark:text-mist/70 dark:hover:bg-medium-red/20 dark:hover:text-mist'
const linkActive =
  'bg-medium-red/15 text-dark-red dark:bg-medium-red/25 dark:text-mist'

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? `${linkBase} ${linkActive}` : linkBase
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-dark-red/30 bg-mist/90 px-4 py-3 font-content backdrop-blur sm:px-8 dark:border-dark-red/30 dark:bg-near-black/90">
      <NavLink
        to="/"
        className="font-heading text-lg font-semibold tracking-tight text-near-black dark:text-mist"
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
