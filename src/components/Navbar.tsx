import { Link, useLocation } from 'react-router'
import arcaneLogo from '../assets/arcane-logo.png'

const navLinks = [
  { id: 'home', label: 'HOME' },
  { id: 'events', label: 'EVENTS' },
  { id: 'about', label: 'ABOUT' },
  { id: 'contact', label: 'CONTACT' },
]

export default function Navbar() {
  const { pathname, hash } = useLocation()

  const handleClick = (id: string) => {
    // Link won't navigate when the hash is unchanged — scroll manually.
    if (pathname === '/' && (hash === `#${id}` || (!hash && id === 'home'))) {
      const targetId = id === 'home' ? 'home' : id
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const isLinkActive = (id: string) => {
    if (pathname === '/') {
      if (id === 'home') return !hash || hash === '#home'
      return hash === `#${id}`
    }
    return false
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex min-h-[4.5rem] w-full items-center justify-between gap-4 border-b border-dark-red/15 bg-mist/20 px-4 py-3.5 font-content backdrop-blur-sm sm:min-h-[5rem] sm:px-8 dark:border-white/10 dark:bg-near-black/20">
      {/* Left: Non-rounded Logo & System Tag */}
      <Link
        to="/"
        onClick={() => handleClick('home')}
        className="group flex items-center gap-3 transition-transform active:scale-95"
        aria-label="Arcane 3.0 Home"
      >
        <img
          src={arcaneLogo}
          alt="Arcane 3.0 Logo"
          className="h-10 w-auto sm:h-12 object-contain"
        />

        {/* <span className="hidden rounded-xs border border-mist/10 bg-near-black/80 px-2 py-0.5 font-mono text-[11px] font-semibold tracking-widest text-mist/70 uppercase sm:inline-block">
          //:SYS.RUN
        </span> */}
      </Link>

      {/* Right: Nav Links + Register Button */}
      <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
        <nav className="flex items-center gap-3 sm:gap-5 md:gap-6 font-mono text-xs font-semibold tracking-widest sm:text-sm">
          {navLinks.map((link) => {
            const active = isLinkActive(link.id)
            return (
              <Link
                key={link.id}
                to={`/#${link.id}`}
                onClick={() => handleClick(link.id)}
                className={`transition-colors uppercase ${
                  active
                    ? 'text-medium-red dark:text-mist font-bold'
                    : 'text-near-black/70 hover:text-near-black dark:text-mist/60 dark:hover:text-mist'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Register Button in Red Border Box */}
        <Link
          to="/#events"
          onClick={() => handleClick('events')}
          className="rounded-xs border border-medium-red px-4 py-1.5 font-mono text-xs font-bold tracking-widest text-medium-red uppercase transition-all duration-200 hover:bg-medium-red hover:text-mist hover:shadow-[0_0_14px_rgba(170,52,48,0.45)] active:scale-95 sm:text-sm dark:text-mist dark:hover:bg-medium-red dark:hover:text-mist"
        >
          REGISTER
        </Link>
      </div>
    </header>
  )
}
