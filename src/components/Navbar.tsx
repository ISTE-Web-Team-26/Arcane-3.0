import { useState, useEffect } from 'react'
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
  const [isOpen, setIsOpen] = useState(false)

  // Close mobile dropdown on route or hash change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname, hash])

  // Close dropdown on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleClick = (id: string) => {
    setIsOpen(false)
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
      {/* Left: Logo */}
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

      {/* Desktop Navigation: Links + Register Button */}
      <div className="hidden md:flex items-center gap-6 lg:gap-8">
        <nav className="flex items-center gap-5 lg:gap-6 font-mono text-xs font-semibold tracking-widest sm:text-sm">
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

      {/* Mobile Hamburger / Close Button */}
      <div className="flex items-center md:hidden">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-xs border border-dark-red/40 bg-near-black/5 p-2 text-near-black transition-colors hover:border-medium-red hover:text-medium-red focus:outline-none dark:border-dark-red/50 dark:bg-mist/5 dark:text-mist"
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? (
            // Close (X) Icon
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            // Hamburger Icon
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 w-full border-b-2 border-dark-red/40 bg-mist/98 px-5 py-4 shadow-xl backdrop-blur-lg md:hidden dark:bg-near-black/98">
          <nav className="flex flex-col space-y-3 font-mono text-sm font-semibold tracking-wider">
            {navLinks.map((link) => {
              const active = isLinkActive(link.id)
              return (
                <Link
                  key={link.id}
                  to={`/#${link.id}`}
                  onClick={() => handleClick(link.id)}
                  className={`flex items-center justify-between border-l-2 py-2 pl-3 uppercase transition-colors duration-150 ${
                    active
                      ? 'border-medium-red bg-medium-red/10 font-bold text-medium-red'
                      : 'border-transparent text-near-black/80 hover:border-medium-red/50 hover:text-medium-red dark:text-mist/80 dark:hover:text-medium-red'
                  }`}
                >
                  <span>{link.label}</span>
                  {active && (
                    <span className="text-[10px] text-medium-red">// ACTIVE</span>
                  )}
                </Link>
              )
            })}

            <div className="pt-2">
              <Link
                to="/#events"
                onClick={() => handleClick('events')}
                className="flex w-full items-center justify-center rounded-xs border border-medium-red bg-medium-red px-4 py-2.5 text-center font-mono text-xs font-bold tracking-widest text-mist uppercase shadow-[0_0_12px_rgba(170,52,48,0.35)] transition-all hover:bg-dark-red active:scale-98"
              >
                REGISTER NOW
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
