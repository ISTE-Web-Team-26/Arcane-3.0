import { Link } from 'react-router'
import arcaneLogo from '../../assets/arcane-logo.png'

export default function Hero() {
  return (
    <section
      id="home"
      className="flex min-h-[62svh] w-full scroll-mt-20 flex-col items-center justify-center px-4 py-10 text-center"
    >
      <h1 className="sr-only">Arcane 3.0</h1>

      {/* Hero Logo with Ambient Glow & Shimmer Effect */}
      <div className="relative mx-auto flex items-center justify-center">
        {/* Persistent Ambient Glow Aura behind logo */}
        <div
          className="pointer-events-none absolute -inset-4 sm:-inset-8 -z-10 rounded-full bg-radial from-medium-red/30 via-dark-red/15 to-transparent blur-2xl sm:blur-3xl animate-pulse"
          style={{ animationDuration: '4s' }}
        />

        <div
          className="logo-shimmer relative flex items-center justify-center"
          style={{ '--logo-url': `url(${arcaneLogo})` } as React.CSSProperties}
        >
          <img
            src={arcaneLogo}
            alt="Arcane 3.0 Logo"
            className="h-auto w-full max-w-[280px] xs:max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl object-contain drop-shadow-[0_0_18px_rgba(238,39,33,0.45)] drop-shadow-[0_0_36px_rgba(170,52,48,0.3)] transition-all duration-300 hover:scale-[1.02] hover:drop-shadow-[0_0_28px_rgba(238,39,33,0.7)] hover:drop-shadow-[0_0_55px_rgba(170,52,48,0.5)]"
          />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/event1"
          className="rounded-lg bg-medium-red px-5 py-2.5 text-sm font-semibold text-mist transition-all duration-200 hover:bg-dark-red hover:shadow-[0_0_15px_rgba(170,52,48,0.4)] active:scale-95"
        >
          Explore events
        </Link>
        <a
          href="#about"
          className="rounded-lg border border-dark-red/30 bg-near-black/5 px-5 py-2.5 text-sm font-semibold text-near-black transition-all duration-200 hover:bg-near-black/10 hover:shadow-lg active:scale-95 dark:border-mist/20 dark:bg-mist/10 dark:text-mist dark:hover:bg-mist/20"
        >
          Learn more
        </a>
      </div>
    </section>
  )
}

