export default function EventLoading() {
  return (
    <div className="relative -mx-4 -mt-[4.5rem] -mb-8 soil-bg-layer px-4 pt-[calc(4.5rem+2rem)] pb-16 sm:-mx-8 sm:-mt-[5rem] sm:px-8 sm:pt-[calc(5rem+3rem)]">
      <div
        role="status"
        aria-label="Loading event"
        className="mx-auto flex min-h-[40vh] w-full max-w-7xl flex-col items-center justify-center gap-4"
      >
        <div
          aria-hidden="true"
          className="h-10 w-10 animate-spin rounded-full border-2 border-dark-red/40 border-t-medium-red"
        />
        <p className="font-mono text-xs font-semibold tracking-[0.25em] text-mist/70 uppercase">
          Loading event…
        </p>
      </div>
    </div>
  )
}
