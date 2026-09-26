export default function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative flex h-[calc(100svh-5.5rem)] min-h-[540px] max-h-[960px] w-full scroll-mt-16 flex-col justify-between overflow-hidden py-2 sm:py-4"
    >
      {/* Header section matching Events heading style */}
      <div className="flex shrink-0 flex-col justify-between gap-2 px-2 pb-2 sm:flex-row sm:items-end sm:pb-4">
        <div>
          <div className="mb-1 flex items-center gap-1.5 font-mono text-xs font-semibold tracking-wider text-medium-red uppercase">
            <span
              className="inline-block h-2 w-2 bg-medium-red"
              aria-hidden="true"
            />
            <span>System Overview</span>
          </div>

          <h2
            id="about-heading"
            className="font-heading text-3xl font-bold text-near-black underline underline-offset-8 decoration-medium-red sm:text-4xl md:text-5xl dark:text-mist"
          >
            ABOUT
          </h2>
        </div>
      </div>

      {/* Main Content Panel taking 60% width and filling remaining viewport height */}
      <div className="relative flex flex-1 min-h-0 w-full items-stretch px-2 pb-2">
        <div className="flex h-full w-full flex-col justify-between rounded-xs border border-dark-red/30 bg-near-black/5 p-6 backdrop-blur-xs md:w-[60%] sm:p-8 md:p-10 dark:border-dark-red/40 dark:bg-near-black/60">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-medium-red uppercase">
              <span className="h-[1px] flex-1 bg-dark-red/30 dark:bg-dark-red/50" />
            </div>

            <p className="font-content text-base leading-relaxed text-near-black/90 sm:text-lg md:text-xl lg:text-2xl dark:text-mist/90">
              <strong className="text-medium-red">ARCANE 3.0</strong> is the premier national-level technical and gaming symposium designed to ignite curiosity, foster relentless innovation, and challenge the brightest minds across domains.
            </p>

            <p className="text-xs leading-relaxed text-near-black/70 sm:text-sm md:text-base lg:text-lg dark:text-mist/70">
              Blending high-stakes competitive programming, cutting-edge engineering hackathons, design sprints, and intense esports battles, Arcane delivers an electrifying arena where technology meets culture.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-dark-red/20 pt-6 sm:grid-cols-4 dark:border-dark-red/30">
            <div>
              <p className="font-heading text-2xl font-bold text-medium-red sm:text-3xl lg:text-4xl">20+</p>
              <p className="font-mono text-[10px] font-semibold tracking-wider text-near-black/60 uppercase sm:text-xs dark:text-mist/60">Events</p>
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-medium-red sm:text-3xl lg:text-4xl">1.5K+</p>
              <p className="font-mono text-[10px] font-semibold tracking-wider text-near-black/60 uppercase sm:text-xs dark:text-mist/60">Delegates</p>
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-medium-red sm:text-3xl lg:text-4xl">₹100K</p>
              <p className="font-mono text-[10px] font-semibold tracking-wider text-near-black/60 uppercase sm:text-xs dark:text-mist/60">Prize Pool</p>
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-medium-red sm:text-3xl lg:text-4xl">48H</p>
              <p className="font-mono text-[10px] font-semibold tracking-wider text-near-black/60 uppercase sm:text-xs dark:text-mist/60">Non-Stop</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

