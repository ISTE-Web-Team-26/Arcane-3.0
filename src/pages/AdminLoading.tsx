import BackgroundParticles from '../components/BackgroundParticles.tsx'

/** Full-viewport loading state for the chromeless /admin route. */
export default function AdminLoading() {
  return (
    <div className="relative -mx-4 -mt-[4.5rem] -mb-8 flex min-h-svh flex-col items-center justify-center overflow-hidden soil-bg-layer px-4 py-8 sm:-mx-8 sm:-mt-[5rem] sm:px-8">
      <BackgroundParticles density={10} className="z-0" />
      <div
        role="status"
        aria-label="Loading admin"
        className="relative z-10 flex flex-col items-center justify-center gap-4"
      >
        <div
          aria-hidden="true"
          className="h-10 w-10 animate-spin rounded-full border-2 border-dark-red/40 border-t-medium-red"
        />
        <p className="font-mono text-xs font-semibold tracking-[0.25em] text-mist/70 uppercase">
          Loading admin…
        </p>
      </div>
    </div>
  )
}
