import { motion, type Variants } from 'framer-motion'
import FlashCollage from './FlashCollage.tsx'

export default function About() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  }

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative w-full scroll-mt-20 py-8 sm:py-10"
    >
      {/* Top Header Tag & Intro */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={containerVariants}
      >
        <motion.div
          variants={itemVariants}
          className="mb-4 flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-medium-red uppercase"
        >
          <span
            className="inline-block h-2 w-2 bg-medium-red"
            aria-hidden="true"
          />
          <span>System Overview</span>
        </motion.div>

          <h2
            id="about-heading"
            className="font-heading text-3xl font-bold text-mist underline underline-offset-8 decoration-medium-red sm:text-4xl md:text-5xl"
          >
            <span className="transition-transform duration-200 group-hover:translate-y-0.5">
              ↓
            </span>
            <span>Explore Technical Events</span>
          </a>
          <a
            href="#events"
            className="group inline-flex items-center gap-1.5 text-mist/80 transition-colors hover:text-mist"
          >
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
            <span>Review Tracks & Arenas</span>
          </a>
          <div className="inline-flex items-center gap-1.5 text-mist/60">
            <span className="text-medium-red">⬡</span>
            <span>Format & Live Labs</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Content Panel taking 60% width and filling remaining viewport height */}
      <div className="relative flex flex-1 min-h-0 w-full items-stretch px-2 pb-2">
        <div className="flex h-full w-full flex-col justify-between rounded-xs border border-dark-red/40 bg-near-black/60 p-6 backdrop-blur-xs md:w-[60%] sm:p-8 md:p-10">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-medium-red uppercase">
              <span className="h-[1px] flex-1 bg-dark-red/50" />
            </div>

            <p className="font-content text-base leading-relaxed text-mist/90 sm:text-lg md:text-xl lg:text-2xl">
              <strong className="text-medium-red">ARCANE 3.0</strong> is the premier national-level technical and gaming symposium designed to ignite curiosity, foster relentless innovation, and challenge the brightest minds across domains.
            </p>

            <p className="text-xs leading-relaxed text-mist/70 sm:text-sm md:text-base lg:text-lg">
              Blending high-stakes competitive programming, cutting-edge engineering hackathons, design sprints, and intense esports battles, Arcane delivers an electrifying arena where technology meets culture.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-dark-red/30 pt-6 sm:grid-cols-4">
            <div>
              <p className="font-heading text-2xl font-bold text-medium-red sm:text-3xl lg:text-4xl">20+</p>
              <p className="font-mono text-[10px] font-semibold tracking-wider text-mist/60 uppercase sm:text-xs">Events</p>
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-medium-red sm:text-3xl lg:text-4xl">1.5K+</p>
              <p className="font-mono text-[10px] font-semibold tracking-wider text-mist/60 uppercase sm:text-xs">Delegates</p>
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-medium-red sm:text-3xl lg:text-4xl">₹100K</p>
              <p className="font-mono text-[10px] font-semibold tracking-wider text-mist/60 uppercase sm:text-xs">Prize Pool</p>
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-medium-red sm:text-3xl lg:text-4xl">48H</p>
              <p className="font-mono text-[10px] font-semibold tracking-wider text-mist/60 uppercase sm:text-xs">Non-Stop</p>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Deep-Dive Events */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -5, scale: 1.015 }}
          className="group relative flex flex-col justify-between rounded-xl border border-dark-red/30 bg-near-black/80 p-5 transition-colors duration-300 hover:border-medium-red/60 hover:shadow-[0_0_25px_rgba(170,52,48,0.18)] cursor-default"
        >
          <div>
            <div className="flex items-center justify-between pb-3">
              <span className="font-mono text-[11px] font-semibold tracking-widest text-mist/60 uppercase">
                EVENTS & TRACKS
              </span>
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

          <div className="mt-5 h-[2px] w-full overflow-hidden rounded-full bg-dark-red/30">
            <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-dark-red to-medium-red transition-all duration-500 group-hover:w-full" />
          </div>
        </motion.div>

        {/* Card 3: Prize Pool */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -5, scale: 1.015 }}
          className="group relative flex flex-col justify-between rounded-xl border border-dark-red/30 bg-near-black/80 p-5 transition-colors duration-300 hover:border-medium-red/60 hover:shadow-[0_0_25px_rgba(170,52,48,0.18)] cursor-default"
        >
          <div>
            <div className="flex items-center justify-between pb-3">
              <span className="font-mono text-[11px] font-semibold tracking-widest text-mist/60 uppercase">
                PRIZE POOL
              </span>
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

          <div className="mt-5 h-[2px] w-full overflow-hidden rounded-full bg-dark-red/30">
            <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-dark-red to-medium-red transition-all duration-500 group-hover:w-full" />
          </div>
        </motion.div>

        {/* Card 4: Non-Stop Marathon */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -5, scale: 1.015 }}
          className="group relative flex flex-col justify-between rounded-xl border border-dark-red/30 bg-near-black/80 p-5 transition-colors duration-300 hover:border-medium-red/60 hover:shadow-[0_0_25px_rgba(170,52,48,0.18)] cursor-default"
        >
          <div>
            <div className="flex items-center justify-between pb-3">
              <span className="font-mono text-[11px] font-semibold tracking-widest text-mist/60 uppercase">
                RIGOROUS MARATHON
              </span>
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

          <div className="mt-5 h-[2px] w-full overflow-hidden rounded-full bg-dark-red/30">
            <div className="h-full w-full rounded-full bg-gradient-to-r from-dark-red to-medium-red" />
          </div>
        </motion.div>
      </motion.div>

      {/* Arcane 2.0 archive collage */}
      <FlashCollage />
    </section>
  )
}
