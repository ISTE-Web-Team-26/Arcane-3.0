import { Link, useLocation } from 'react-router'

const linkBase =
  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors text-near-black/70 hover:bg-medium-red/10 hover:text-medium-red dark:text-mist/70 dark:hover:bg-medium-red/20 dark:hover:text-mist'
const linkActive =
  'bg-medium-red/15 text-dark-red dark:bg-medium-red/25 dark:text-mist'

const links = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'events', label: 'Events' },
  { id: 'contact', label: 'Contact' },
]

export default function Navbar() {
  const { pathname, hash } = useLocation()

  const handleClick = (id: string) => {
    // Link won't navigate when the hash is unchanged — scroll manually.
    if (pathname === '/' && hash === `#${id}`) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-dark-red/30 bg-mist/90 px-4 py-3 font-content backdrop-blur sm:px-8 dark:border-dark-red/30 dark:bg-near-black/90">
      <Link
        to="/"
        className="font-heading text-lg font-semibold tracking-tight text-near-black dark:text-mist"
      >
        Arcane 3.0
      </Link>
      <nav className="flex flex-wrap gap-1">
        {links.map((link) => (
          <Link
            key={link.id}
            to={`/#${link.id}`}
            onClick={() => handleClick(link.id)}
            className={
              pathname === '/' && hash === `#${link.id}`
                ? `${linkBase} ${linkActive}`
                : linkBase
            }
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
