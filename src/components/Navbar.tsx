import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import arcaneLogo from '../assets/arcane-logo.png'

const navLinks = [
  { id: 'home', label: 'HOME' },
  { id: 'about', label: 'ABOUT' },
  { id: 'events', label: 'EVENTS' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'CONTACT' },
]

export default function Navbar() {
  const { pathname, hash } = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  // Auto close mobile menu when path or hash changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname, hash])

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
    <header className="fixed inset-x-0 top-0 z-50 flex min-h-[4.5rem] flex-col border-b border-white/10 bg-near-black/55 font-content text-mist shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:min-h-[5rem]">
      <div className="flex w-full items-center justify-between px-4 py-3.5 sm:px-8">
        {/* Left: Non-rounded Logo */}
        <Link
          to="/"
          onClick={() => handleClick('home')}
          className="group flex items-center gap-3 transition-transform active:scale-95"
          aria-label="Arcane 3.0 Home"
        >
          <div className="relative flex items-center">
            <img
              src={arcaneLogo}
              alt="Arcane 3.0 Logo"
              className="h-9 w-auto sm:h-12 object-contain drop-shadow-[0_0_10px_rgba(170,52,48,0.35)] transition-all duration-300 group-hover:brightness-110 group-hover:drop-shadow-[0_0_22px_rgba(238,39,33,0.65)]"
            />
            <span
              className="pointer-events-none absolute inset-0 overflow-hidden opacity-70 mix-blend-screen transition-opacity duration-300 group-hover:opacity-100"
              style={{
                maskImage: `url(${arcaneLogo})`,
                WebkitMaskImage: `url(${arcaneLogo})`,
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
              }}
              aria-hidden="true"
            >
              <span
                className="animate-logo-shimmer absolute inset-y-0 left-0 w-[45%]"
                aria-hidden="true"
              />
            </span>
          </div>
        </Link>

        {/* Right Desktop: Nav Links + Register Button */}
        <div className="hidden items-center gap-5 md:flex lg:gap-8">
          <nav className="flex items-center gap-4 font-mono text-xs font-semibold tracking-widest sm:gap-6 sm:text-sm">
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
                      : 'text-mist/75 hover:text-medium-red'
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

          {/* Desktop Only: Register Button */}
          <Link
            to="/#events"
            onClick={() => handleClick('events')}
            className="rounded-xs border border-medium-red px-4 py-1.5 font-mono text-xs font-bold tracking-widest text-mist uppercase transition-all duration-200 hover:bg-medium-red hover:text-mist hover:shadow-[0_0_14px_rgba(170,52,48,0.45)] active:scale-95 sm:text-sm"
          >
            REGISTER
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-dark-red/40 bg-near-black/80 text-mist transition-colors hover:border-medium-red hover:text-white md:hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-medium-red"
        >
          <div className="flex h-4 w-5 flex-col justify-between">
            <span
              className={`h-0.5 w-full bg-current transition-all duration-300 ${
                isOpen ? 'translate-y-1.5 rotate-45 bg-medium-red' : ''
              }`}
            />
            <span
              className={`h-0.5 w-full bg-current transition-opacity duration-300 ${
                isOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`h-0.5 w-full bg-current transition-all duration-300 ${
                isOpen ? '-translate-y-2 -rotate-45 bg-medium-red' : ''
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <div
        className={`overflow-hidden bg-near-black/55 backdrop-blur-xl transition-all duration-300 ease-in-out md:hidden ${
          isOpen ? 'max-h-72 border-t border-white/10 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="flex flex-col space-y-1 px-4 py-3 font-mono text-xs font-semibold tracking-wider">
          {navLinks.map((link, index) => {
            const active = isLinkActive(link.id)
            return (
              <Link
                key={link.id}
                to={`/#${link.id}`}
                onClick={() => handleClick(link.id)}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 uppercase transition-colors ${
                  active
                    ? 'bg-medium-red/15 font-bold text-medium-red'
                    : 'text-mist/75 hover:bg-near-black/60 hover:text-mist'
                }`}
              >
                <span>{link.label}</span>
                <span className="font-mono text-[10px] text-medium-red/60">
                  [0{index + 1}]
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

