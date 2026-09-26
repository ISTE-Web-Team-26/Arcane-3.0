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
    <header className="sticky top-0 z-50 flex min-h-[4.5rem] items-center justify-between gap-4 border-b border-dark-red/30 bg-mist/95 px-4 py-3.5 font-content backdrop-blur-md sm:min-h-[5rem] sm:px-8 dark:border-dark-red/40 dark:bg-near-black/95">
      {/* Left: Non-rounded Logo & System Tag */}
      <Link
        to="/"
        onClick={() => handleClick('home')}
        className="group flex items-center gap-3 transition-transform active:scale-95"
        aria-label="Arcane 3.0 Home"
      >
        <div
          className="logo-shimmer relative flex items-center"
          style={{ '--logo-url': `url(${arcaneLogo})` } as React.CSSProperties}
        >
          <img
            src={arcaneLogo}
            alt="Arcane 3.0 Logo"
            className="h-8 w-auto sm:h-9 object-contain drop-shadow-[0_0_8px_rgba(170,52,48,0.3)] transition-all duration-300 group-hover:brightness-110 group-hover:drop-shadow-[0_0_16px_rgba(238,39,33,0.6)]"
          />
        </div>
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
                className={`group/navlink relative inline-block py-1 uppercase transition-all duration-200 hover:scale-105 active:scale-95 ${
                  active
                    ? 'font-bold text-medium-red'
                    : 'text-near-black/70 hover:text-medium-red dark:text-mist/70 dark:hover:text-medium-red'
                }`}
              >
                {link.label}
                <span
                  className={`absolute bottom-0 left-0 h-[2px] bg-medium-red transition-all duration-300 ease-out ${
                    active
                      ? 'w-full shadow-[0_0_8px_rgba(170,52,48,0.6)]'
                      : 'w-0 group-hover/navlink:w-full shadow-[0_0_8px_rgba(170,52,48,0.4)]'
                  }`}
                />
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
