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
      <div className="relative z-10 flex flex-col items-center px-4 pb-[8svh]">
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
        <p className="mt-3 font-heading text-4xl font-bold tracking-tight text-near-black [text-shadow:0_0_28px_rgba(170,52,48,0.45)] sm:text-6xl dark:text-mist">
          29<sup className="text-[0.55em]">TH</sup> SEPTEMBER 2026
        </p>
        <div className="mt-5">
          <Countdown />
        </div>
      </div>
    </section>
  )
}
