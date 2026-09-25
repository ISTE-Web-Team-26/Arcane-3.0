import Countdown from './Countdown.tsx'
import HeroLogo3D from './HeroLogo3D.tsx'

export default function Hero() {
  return (
    <section
      id="home"
      className="relative -mx-4 -mt-[4.5rem] flex h-[100svh] max-w-none flex-col items-center justify-end overflow-x-clip text-center sm:-mx-8 sm:-mt-[5rem]"
    >
      <h1 className="sr-only">Arcane 3.0</h1>
      <HeroLogo3D />
      <div className="relative z-10 flex flex-col items-center px-4 pb-[7svh]">
        <p className="flex items-center gap-2.5 font-mono text-[11px] font-semibold tracking-[0.3em] text-medium-red uppercase sm:text-xs dark:text-mist/80">
          <span
            className="inline-block h-1.5 w-1.5 animate-pulse bg-medium-red"
            aria-hidden="true"
          />
          Save the date
          <span
            className="inline-block h-1.5 w-1.5 animate-pulse bg-medium-red"
            aria-hidden="true"
          />
        </p>
        <p className="mt-4 font-content text-4xl font-bold tracking-normal text-near-black [text-shadow:0_0_28px_rgba(170,52,48,0.45)] sm:text-6xl dark:text-mist">
          29<sup className="text-[0.55em]">TH</sup> SEPTEMBER 2026
        </p>
        <p className="mt-4 flex items-center gap-2 font-mono text-sm font-semibold tracking-[0.25em] text-near-black/70 uppercase sm:text-base dark:text-mist/70">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="text-medium-red"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          FISAT, Angamaly
        </p>
        <p className="mt-5 max-w-xl font-heading text-sm tracking-wide text-near-black/80 sm:text-base dark:text-mist/80">
          Sparks to ignite. Limits to break.{' '}
          <span className="text-medium-red dark:text-mist">
            One arena, endless ascents.
          </span>
        </p>
        <div className="mt-6">
          <Countdown />
        </div>
      </div>
    </section>
  )
}
