export default function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative w-full scroll-mt-20 py-12 sm:py-16"
    >
      {/* Top Header Tag */}
      <div className="mb-4 flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-medium-red uppercase">
        <span
          className="inline-block h-2 w-2 bg-medium-red"
          aria-hidden="true"
        />
        <span>System Overview</span>
      </div>

      {/* Main High-Impact Headline */}
      <h2
        id="about-heading"
        className="font-heading text-3xl font-bold tracking-tight text-mist sm:text-4xl md:text-5xl lg:text-6xl leading-[1.12]"
      >
        Arcane 3.0, the{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e05652] via-[#ea6e6b] to-[#f4938f]">
        Premier {' '}
        </span>
        technical fest organized by ISTE FISAT.
      </h2>

      {/* Narrative Paragraphs */}
      <div className="mt-6 space-y-4 text-sm sm:text-base md:text-lg text-mist/80 leading-relaxed max-w-5xl">
        <p>
          Welcome to <strong className="font-semibold text-mist">ARCANE 3.0</strong> the premier technical fest organized by ISTE FISAT. This two-day extravaganza brings together the brightest minds to explore the latest in technology, innovation, and creativity.
        </p>
        <p className="text-mist/70 text-xs sm:text-sm md:text-base">
        With a perfect blend of technical competitions, workshops, and networking opportunities, Arcane 2.0 promises to be an unforgettable experience for all tech enthusiasts. Get ready to witness cutting-edge innovations, participate in challenging competitions, and learn from industry experts.
        </p>
      </div>

      {/* Quick Action Badges / Technical Links */}
      <div className="mt-8 flex flex-wrap items-center gap-5 sm:gap-8 font-mono text-xs sm:text-sm">
        <a
          href="#events"
          className="group inline-flex items-center gap-1.5 text-medium-red transition-colors hover:text-[#f4938f]"
        >
          <span className="transition-transform duration-200 group-hover:translate-y-0.5">↓</span>
          <span>Explore Technical Events</span>
        </a>
        <a
          href="#events"
          className="group inline-flex items-center gap-1.5 text-mist/80 transition-colors hover:text-mist"
        >
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          <span>Review Tracks & Arenas</span>
        </a>
        <div className="inline-flex items-center gap-1.5 text-mist/60">
          <span className="text-medium-red">⬡</span>
          <span>Format & Live Labs</span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
        {/* Card 1: Attendance / Delegates */}
        <div className="group relative flex flex-col justify-between rounded-xl border border-dark-red/30 bg-near-black/80 p-5 backdrop-blur-md transition-all duration-300 hover:border-medium-red/60 hover:shadow-[0_0_25px_rgba(170,52,48,0.18)]">
          <div>
            <div className="flex items-center justify-between pb-3">
              <span className="font-mono text-[11px] font-semibold tracking-widest text-mist/60 uppercase">
                ATTENDANCE
              </span>
              {/* Users Icon */}
              <svg
                className="h-4 w-4 text-medium-red/80 transition-colors group-hover:text-medium-red"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>

            <p className="font-heading text-3xl font-bold tracking-tight text-mist sm:text-4xl">
              1.5K+
            </p>

            <p className="mt-2 font-content text-xs leading-relaxed text-mist/70">
              Delegates, developers & innovators competing from across the nation.
            </p>
          </div>

          {/* Bottom red accent indicator */}
          <div className="mt-5 h-[2px] w-full overflow-hidden rounded-full bg-dark-red/30">
            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-dark-red to-medium-red transition-all duration-500 group-hover:w-full" />
          </div>
        </div>

        {/* Card 2: Deep-Dive Events */}
        <div className="group relative flex flex-col justify-between rounded-xl border border-dark-red/30 bg-near-black/80 p-5 backdrop-blur-md transition-all duration-300 hover:border-medium-red/60 hover:shadow-[0_0_25px_rgba(170,52,48,0.18)]">
          <div>
            <div className="flex items-center justify-between pb-3">
              <span className="font-mono text-[11px] font-semibold tracking-widest text-mist/60 uppercase">
                EVENTS & TRACKS
              </span>
              {/* Terminal / Code Icon */}
              <svg
                className="h-4 w-4 text-medium-red/80 transition-colors group-hover:text-medium-red"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM8 9l3 3-3 3M13 15h3"
                />
              </svg>
            </div>

            <p className="font-heading text-3xl font-bold tracking-tight text-mist sm:text-4xl">
              20+
            </p>

            <p className="mt-2 font-content text-xs leading-relaxed text-mist/70">
              Cutting-edge hackathons, design sprints, esports battles & code showdowns.
            </p>
          </div>

          {/* Bottom red accent indicator */}
          <div className="mt-5 h-[2px] w-full overflow-hidden rounded-full bg-dark-red/30">
            <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-dark-red to-medium-red transition-all duration-500 group-hover:w-full" />
          </div>
        </div>

        {/* Card 3: Prize Pool */}
        <div className="group relative flex flex-col justify-between rounded-xl border border-dark-red/30 bg-near-black/80 p-5 backdrop-blur-md transition-all duration-300 hover:border-medium-red/60 hover:shadow-[0_0_25px_rgba(170,52,48,0.18)]">
          <div>
            <div className="flex items-center justify-between pb-3">
              <span className="font-mono text-[11px] font-semibold tracking-widest text-mist/60 uppercase">
                PRIZE POOL
              </span>
              {/* Trophy / Bounty Icon */}
              <svg
                className="h-4 w-4 text-medium-red/80 transition-colors group-hover:text-medium-red"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <p className="font-heading text-3xl font-bold tracking-tight text-mist sm:text-4xl">
              ₹100K+
            </p>

            <p className="mt-2 font-content text-xs leading-relaxed text-mist/70">
              Cash rewards, sponsor bounties & accolades for top-tier winners.
            </p>
          </div>

          {/* Bottom red accent indicator */}
          <div className="mt-5 h-[2px] w-full overflow-hidden rounded-full bg-dark-red/30">
            <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-dark-red to-medium-red transition-all duration-500 group-hover:w-full" />
          </div>
        </div>

        {/* Card 4: Non-Stop Marathon */}
        <div className="group relative flex flex-col justify-between rounded-xl border border-dark-red/30 bg-near-black/80 p-5 backdrop-blur-md transition-all duration-300 hover:border-medium-red/60 hover:shadow-[0_0_25px_rgba(170,52,48,0.18)]">
          <div>
            <div className="flex items-center justify-between pb-3">
              <span className="font-mono text-[11px] font-semibold tracking-widest text-mist/60 uppercase">
                RIGOROUS MARATHON
              </span>
              {/* Shield Check Icon */}
              <svg
                className="h-4 w-4 text-medium-red/80 transition-colors group-hover:text-medium-red"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>

            <p className="font-heading text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#e05652] to-[#f4938f] sm:text-4xl">
              48H
            </p>

            <p className="mt-2 font-content text-xs leading-relaxed text-mist/70">
              Non-Stop empirical engineering, pure technical friction & zero fluff.
            </p>
          </div>

          {/* Bottom red accent indicator */}
          <div className="mt-5 h-[2px] w-full overflow-hidden rounded-full bg-dark-red/30">
            <div className="h-full w-full rounded-full bg-gradient-to-r from-dark-red to-medium-red" />
          </div>
        </div>
      </div>
    </section>
  )
}


