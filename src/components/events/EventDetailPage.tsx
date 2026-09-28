import { useState } from 'react'
import { Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import BackgroundParticles from '../BackgroundParticles.tsx'

export interface EventDetailData {
  id?: string
  code?: string
  track?: string
  title: string
  subtitle?: string
  status?: string
  image?: string
  prize?: string
  fee: string
  venue: string
  date: string
  time: string
  reportingTime?: string
  team: string
  description: string
  longDescription?: string[]
  guidelines:
    | string[]
    | {
        category: string
        rules: string[]
      }[]
  timeline?: {
    time: string
    phase: string
    detail: string
  }[]
  coordinators?: {
    name: string
    role: string
    phone: string
  }[]
}

export const DEFAULT_EVENT_DATA: EventDetailData = {
  id: 'byte-surge',
  code: '•EVT_01 [24H_HACK]',
  track: '01 // CODE & HACK',
  title: 'BYTE_SURGE',
  subtitle: '24-Hour Autonomous Code Forge & Terminal Gauntlet',
  status: 'SLOTS OPEN',
  image: '/events/byte-surge.jpg',
  prize: '₹50,000 POOL',
  fee: '₹300 / TEAM',
  venue: 'LAB_04 // ADVANCED COMPUTING WING, FISAT',
  date: '29TH SEPTEMBER 2026',
  time: '09:30 AM - 09:30 AM (24 HOURS)',
  reportingTime: '08:45 AM SHARP',
  team: '2 - 4 MEMBERS',
  description:
    'Enter the underground code foundry of Arcane 3.0. BYTE_SURGE is a high-octane 24-hour continuous hackathon demanding rapid prototyping, decentralized algorithms, and low-latency system design. Compete against top university engineering teams, build production-grade web3 or terminal artifacts, and survive the midnight evaluation checkpoint.',
  longDescription: [
    'Participants will be presented with mission tracks covering Decentralized Infrastructure, Autonomous Agentic Systems, Cyber-Physical Interfaces, and Developer Tooling.',
    'Teams are provided with high-speed unthrottled gigabit ethernet, continuous power redundancy, midnight fuel/refreshments, and dedicated hardware-lab workstations.',
    'Industry mentors and lead architects will conduct checkpoint reviews at hours 06:00, 12:00, and 18:00 to guide architecture decisions and score development progression.',
  ],
  guidelines: [
    'Open to all currently enrolled undergraduate and postgraduate students with a valid college identity card.',
    'Teams must consist of 2 to 4 members. Inter-college and inter-departmental teams are strictly permitted.',
    'Every member must carry their original college photo ID for verification at the security checkpoint.',
    'All application code, architectures, and assets must be developed exclusively within the 24-hour hackathon window.',
    'Public open-source libraries, frameworks, and APIs are allowed provided they are declared in the project README.',
    'Pre-built private repositories or plagiarized boilerplate will lead to immediate disqualification by the audit panel.',
    'Version control must be maintained on a public GitHub/GitLab repository with regular, timestamped commits.',
    'Final deliverables must include a functioning working prototype, public repo link, and a 3-minute terminal walk-through.',
    'Evaluation breakdown: Innovation & Concept (30%), Technical Depth (30%), Execution & Stability (25%), Presentation (15%).',
    'Participants must bring their own laptops, chargers, and development hardware/peripherals.',
    'High-speed Wi-Fi, power strips, and sleeping/rest bays are arranged on-campus throughout the 24-hour duration.',
    'Food, midnight energy drinks, and breakfast are included with the team registration fee.',
    'Judges reserve full authority over tie-breaks, prize distribution, and security disqualifications.',
  ],
  timeline: [
    {
      time: '08:45 AM',
      phase: 'CHECK-IN & TERMINAL VERIFICATION',
      detail: 'Member badging, desk allocation, and network authentication at Lab 04 entrance.',
    },
    {
      time: '09:30 AM',
      phase: 'MISSION BRIEF & SPRINT KICKOFF',
      detail: 'Problem statements unlocked across all tracks. Timer initiates.',
    },
    {
      time: '04:00 PM',
      phase: 'MENTORSHIP CHECKPOINT I',
      detail: 'Preliminary architecture review and feasibility scoring with senior industry mentors.',
    },
    {
      time: '11:30 PM',
      phase: 'MIDNIGHT SYNC & ENERGY FUEL',
      detail: 'Warm refreshments, rhythm beat drops, and secondary git audit commit check.',
    },
    {
      time: '07:30 AM',
      phase: 'FINAL SPRINT & CODE FREEZE',
      detail: 'All commits pushed to upstream. Readme and deployment links finalized.',
    },
    {
      time: '09:00 AM',
      phase: 'LIVE JURY AUDIT & AWARDS',
      detail: 'Stage pitches, live jury cross-examination, and grand victory announcements.',
    },
  ],
  coordinators: [
    {
      name: 'Dr. Arjun Varma',
      role: 'FACULTY COORDINATOR',
      phone: '+91 94471 28901',
    },
    {
      name: 'Rohan Thomas',
      role: 'STUDENT LEAD // TECH',
      phone: '+91 98460 54321',
    },
    {
      name: 'Ananya S.',
      role: 'OPERATIONS LEAD',
      phone: '+91 97455 12345',
    },
  ],
}

interface EventDetailPageProps {
  event?: EventDetailData
}

export default function EventDetailPage({
  event = DEFAULT_EVENT_DATA,
}: EventDetailPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    leadName: '',
    email: '',
    phone: '',
    college: '',
    teamSize: '2',
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
  }

  const resetModal = () => {
    setIsModalOpen(false)
    setIsSubmitted(false)
    setFormData({
      leadName: '',
      email: '',
      phone: '',
      college: '',
      teamSize: '2',
      notes: '',
    })
  }

  return (
    <div className="relative -mx-4 -mt-[4.5rem] sm:-mx-8 sm:-mt-[5rem] -mb-8 overflow-hidden soil-bg-layer px-4 pt-[calc(4.5rem+2rem)] pb-16 sm:px-8 sm:pt-[calc(5rem+3rem)]">
      {/* Ambient floating ember particles */}
      <BackgroundParticles density={14} className="z-0" />

      {/* Main Container */}
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        {/* Full-width Event Poster */}
        {event.image && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
            className="mb-8 overflow-hidden rounded-2xl border border-dark-red/35 bg-black/60 shadow-[0_0_25px_rgba(0,0,0,0.6)] sm:mb-10"
          >
            <img
              src={event.image}
              alt={`${event.title} poster`}
              loading="eager"
              className="max-h-[75vh] w-full object-contain"
            />
          </motion.div>
        )}

        {/* Hero Header: Title, Telemetry, Quick Register */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] as const }}
          className="mb-10"
        >
          {/* Main Heading */}
          <h1 className="font-heading text-4xl font-bold tracking-tight text-mist sm:text-6xl md:text-7xl uppercase">
            {event.title}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e05652] via-[#ea6e6b] to-[#f4938f] [text-shadow:0_0_35px_rgba(170,52,48,0.45)]">
              CHALLENGE
            </span>
          </h1>

          {event.subtitle && (
            <p className="mt-2.5 w-full font-mono text-xs font-medium text-mist/80 sm:text-sm md:text-base">
              {event.subtitle}
            </p>
          )}

          {/* Key Telemetry Badges Grid (Date/Time, Venue, Team Size, Fee, Prize Pool) */}
          <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
            {/* Date & Time */}
            <div className="flex flex-col justify-start rounded-xl border border-dark-red/35 bg-near-black/80 p-4 transition-all duration-200 hover:border-medium-red/50">
              <span className="block font-mono text-[10px] font-semibold tracking-wider text-mist/50 uppercase">
                DATE & SPRINT TIME
              </span>
              <span className="mt-1 font-mono text-xs font-bold text-mist sm:text-sm">
                {event.date}
              </span>
              <span className="mt-0.5 block font-mono text-[11px] text-medium-red">
                {event.time}
              </span>
            </div>

            {/* Venue */}
            <div className="flex flex-col justify-start rounded-xl border border-dark-red/35 bg-near-black/80 p-4 transition-all duration-200 hover:border-medium-red/50">
              <span className="block font-mono text-[10px] font-semibold tracking-wider text-mist/50 uppercase">
                SECTOR / VENUE
              </span>
              <span className="mt-1 font-mono text-xs font-bold text-mist sm:text-sm">
                {event.venue}
              </span>
              <span className="mt-0.5 block font-mono text-[11px] text-mist/60">
                REPORT: {event.reportingTime || '08:45 AM'}
              </span>
            </div>

            {/* Team Size */}
            <div className="flex flex-col justify-start rounded-xl border border-dark-red/35 bg-near-black/80 p-4 transition-all duration-200 hover:border-medium-red/50">
              <span className="block font-mono text-[10px] font-semibold tracking-wider text-mist/50 uppercase">
                TEAM SIZE
              </span>
              <span className="mt-1 font-mono text-xs font-bold text-mist sm:text-sm">
                {event.team}
              </span>
            </div>

            {/* Registration Fee */}
            <div className="flex flex-col justify-start rounded-xl border border-dark-red/35 bg-near-black/80 p-4 transition-all duration-200 hover:border-medium-red/50">
              <span className="block font-mono text-[10px] font-semibold tracking-wider text-mist/50 uppercase">
                REGISTRATION FEE
              </span>
              <span className="mt-1 font-mono text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#e05652] to-[#f4938f] sm:text-xl md:text-2xl">
                {event.fee}
              </span>
            </div>

            {/* Prize Pool */}
            <div className="flex flex-col justify-start rounded-xl border border-dark-red/35 bg-near-black/80 p-4 transition-all duration-200 hover:border-medium-red/50">
              <span className="block font-mono text-[10px] font-semibold tracking-wider text-mist/50 uppercase">
                PRIZE POOL
              </span>
              <span className="mt-1 font-mono text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#e05652] to-[#f4938f] sm:text-xl md:text-2xl">
                {event.prize || '₹50,000 POOL'}
              </span>
            </div>
          </div>

          {/* Primary Action Row with Register Button */}
          <div className="mt-6 flex items-center">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-medium-red bg-medium-red px-8 py-3.5 font-mono text-sm font-bold tracking-wider text-mist uppercase transition-all duration-300 hover:bg-dark-red hover:shadow-[0_0_28px_rgba(170,52,48,0.7)] active:scale-[0.98] cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>ENTER ARENA // REGISTER NOW</span>
                <span className="transition-transform group-hover:translate-x-1">▶</span>
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </button>
          </div>

          {/* Event Description Section */}
          <div className="mt-8 space-y-3 rounded-2xl border border-dark-red/35 bg-near-black/75 p-5 sm:p-7 shadow-[0_0_25px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-medium-red uppercase">
              <span className="h-2 w-2 bg-medium-red" />
              <span>MISSION BRIEFING // OPERATIONAL OVERVIEW</span>
            </div>

            <p className="font-content text-sm leading-relaxed text-mist/95 sm:text-base md:text-lg">
              {event.description}
            </p>
            {event.longDescription &&
              event.longDescription.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="font-content text-xs leading-relaxed text-mist/75 sm:text-sm"
                >
                  {paragraph}
                </p>
              ))}
          </div>
        </motion.div>

        {/* Strata Divider Line */}
        <div
          aria-hidden="true"
          className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-dark-red/35 to-transparent animate-strata-pulse sm:my-12"
        />

        {/* Detailed Guidelines Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] as const }}
          className="mb-12"
        >
          <div className="mb-3 flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-medium-red uppercase">
            <span className="h-2 w-2 bg-medium-red" />
            <span>DIRECTIVES // OPERATING PROTOCOLS</span>
          </div>

          <h2 className="font-heading text-3xl font-bold tracking-tight text-mist sm:text-4xl md:text-5xl uppercase">
            OFFICIAL{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e05652] via-[#ea6e6b] to-[#f4938f]">
              GUIDELINES
            </span>{' '}
            & RULES
          </h2>

          <p className="mt-2 max-w-2xl font-content text-xs text-mist/70 sm:text-sm">
            All participants entering this track must strictly comply with the following regulations. Breach of protocol leads to immediate revocation of terminal credentials.
          </p>

          {/* Single Unified Guidelines Box */}
          <div className="mt-8 rounded-2xl border border-dark-red/40 bg-near-black/85 p-6 sm:p-8 md:p-10 shadow-[0_0_35px_rgba(0,0,0,0.7)] backdrop-blur-xs transition-all duration-300 hover:border-medium-red/50">
            {/* Box Header Bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-dark-red/30 pb-4">
              <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-wider text-mist uppercase">
                <span className="h-2 w-2 rounded-full bg-medium-red animate-pulse" />
                <span>TERMINAL RULEBOOK & PROTOCOLS // {event.title}</span>
              </div>
              <span className="rounded-md border border-dark-red/40 bg-black/60 px-3 py-1 font-mono text-[11px] font-semibold text-medium-red">
                {Array.isArray(event.guidelines) ? event.guidelines.flatMap((g) => (typeof g === 'string' ? g : g.rules)).length : 0} DIRECTIVES
              </span>
            </div>

            {/* One Sequential List of Guidelines */}
            <ul className="space-y-3 font-content text-xs leading-relaxed text-mist/85 sm:text-sm sm:space-y-3.5">
              {(Array.isArray(event.guidelines)
                ? event.guidelines.flatMap((g) => (typeof g === 'string' ? g : g.rules))
                : []
              ).map((rule, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3.5 rounded-xl border border-dark-red/20 bg-black/40 p-3.5 transition-colors duration-200 hover:border-medium-red/40 hover:bg-black/60 sm:p-4"
                >
                  <span className="mt-0.5 shrink-0 rounded-md border border-dark-red/40 bg-dark-red/20 px-2.5 py-0.5 font-mono text-xs font-bold text-medium-red">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="pt-0.5 text-mist/90">{rule}</span>
                </li>
              ))}
            </ul>

            {/* Box Footer Directives Notice */}
            <div className="mt-8 border-t border-dark-red/25 pt-4 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-mist/60">
              <span className="flex items-center gap-2">
                <span className="text-medium-red">⚠</span>
                <span>Violations result in immediate revocation of terminal credentials by jury.</span>
              </span>
              <span className="text-mist/40">COMPLIANCE MANDATORY ACROSS ALL 24 HOURS</span>
            </div>
          </div>
        </motion.section>

        {/* Strata Divider Line */}
        <div
          aria-hidden="true"
          className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-dark-red/35 to-transparent animate-strata-pulse sm:my-12"
        />

        {/* Timeline & Schedule Section */}
        {event.timeline && event.timeline.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] as const }}
            className="mb-12"
          >
            <div className="mb-3 flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-medium-red uppercase">
              <span className="h-2 w-2 bg-medium-red" />
              <span>CHRONO TIMELINE // STAGE PHASES</span>
            </div>

            <h2 className="font-heading text-3xl font-bold tracking-tight text-mist sm:text-4xl md:text-5xl uppercase">
              EVENT{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e05652] via-[#ea6e6b] to-[#f4938f]">
                SCHEDULE
              </span>
            </h2>

            <div className="mt-8 space-y-4">
              {event.timeline.map((item, tIdx) => (
                <div
                  key={tIdx}
                  className="flex flex-col gap-2 rounded-xl border border-dark-red/30 bg-near-black/70 p-4 transition-colors hover:border-medium-red/40 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5"
                >
                  <div className="flex items-center gap-3 sm:w-1/3">
                    <span className="rounded-md border border-dark-red/40 bg-near-black px-2.5 py-1 font-mono text-xs font-bold text-medium-red">
                      {item.time}
                    </span>
                    <span className="font-mono text-xs font-bold text-mist uppercase sm:text-sm">
                      {item.phase}
                    </span>
                  </div>

                  <p className="font-content text-xs text-mist/70 sm:w-2/3 sm:text-sm">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Strata Divider Line */}
        <div
          aria-hidden="true"
          className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-dark-red/35 to-transparent animate-strata-pulse sm:my-12"
        />

        {/* Bottom Call to Action Card & Coordinators */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Registration Call to Action */}
          <div className="lg:col-span-2 rounded-2xl border border-medium-red/40 bg-gradient-to-b from-near-black via-near-black to-dark-red/10 p-6 sm:p-8 shadow-[0_0_30px_rgba(170,52,48,0.15)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-medium-red">
                <span className="h-2 w-2 rounded-full bg-medium-red animate-pulse" />
                <span>REGISTRATION OPEN // LIMITED TEAM SLOTS</span>
              </div>

              <h3 className="mt-2 font-heading text-3xl font-bold tracking-tight text-mist sm:text-4xl uppercase">
                LOCK IN YOUR TEAM FOR{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e05652] to-[#f4938f]">
                  {event.title}
                </span>
              </h3>

              <p className="mt-2 font-content text-xs text-mist/75 sm:text-sm">
                Slots are assigned on a first-confirmed basis. Entry fee covers technical infrastructure, official certificates, kit access, and refreshments for the entire team.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-xs">
                <div className="rounded-md border border-dark-red/40 bg-near-black/80 px-3 py-1.5 text-mist">
                  ENTRY FEE: <strong className="text-medium-red">{event.fee}</strong>
                </div>
                <div className="rounded-md border border-dark-red/40 bg-near-black/80 px-3 py-1.5 text-mist">
                  VENUE: <strong className="text-mist">{event.venue}</strong>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="group relative inline-flex items-center justify-center gap-2 rounded-xl border border-medium-red bg-medium-red px-6 py-3.5 font-mono text-sm font-bold tracking-wider text-mist uppercase transition-all duration-300 hover:bg-dark-red hover:shadow-[0_0_24px_rgba(170,52,48,0.7)] active:scale-95 cursor-pointer"
              >
                <span>REGISTER NOW</span>
                <span className="transition-transform group-hover:translate-x-1">▶</span>
              </button>

              <Link
                to="/#events"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-dark-red/40 bg-near-black/80 px-5 py-3.5 font-mono text-xs font-semibold text-mist/75 hover:border-dark-red/70 hover:text-mist"
              >
                EXPLORE OTHER EVENTS
              </Link>
            </div>
          </div>

          {/* Coordinators Contact Box */}
          <div className="rounded-2xl border border-dark-red/35 bg-near-black/80 p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs font-semibold tracking-wider text-medium-red uppercase">
                COMM CHANNELS // HELPDESK
              </span>
              <h4 className="mt-1 font-heading text-xl font-bold text-mist uppercase">
                EVENT LEADS
              </h4>
              <p className="mt-1 font-content text-xs text-mist/60">
                Direct queries regarding rules, lab specifications, or transport:
              </p>

              <div className="mt-4 space-y-3 font-mono text-xs">
                {event.coordinators?.map((c, i) => (
                  <div key={i} className="border-b border-dark-red/20 pb-2.5 last:border-none">
                    <span className="block font-bold text-mist">{c.name}</span>
                    <span className="text-[11px] text-medium-red">{c.role}</span>
                    <a
                      href={`tel:${c.phone.replace(/[^0-9+]/g, '')}`}
                      className="block text-[11px] text-mist/75 hover:text-mist hover:underline"
                    >
                      {c.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 border-t border-dark-red/25 pt-3 font-mono text-[11px] text-mist/50">
              LOCATION: FISAT Campus, Angamaly, Kerala 683577
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Registration Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
              className="relative w-full max-w-lg rounded-2xl border border-medium-red/50 bg-near-black p-6 font-content text-mist shadow-[0_0_40px_rgba(170,52,48,0.35)] sm:p-8 z-10"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={resetModal}
                className="absolute top-4 right-4 rounded-lg border border-dark-red/40 bg-near-black/80 p-2 font-mono text-xs text-mist/60 hover:border-medium-red hover:text-mist"
              >
                ✕
              </button>

              {!isSubmitted ? (
                <>
                  <div className="mb-4">
                    <span className="font-mono text-xs font-semibold tracking-wider text-medium-red uppercase">
                      TEAM REGISTRATION // {event.code || '•EVT'}
                    </span>
                    <h3 className="mt-1 font-heading text-2xl font-bold tracking-tight text-mist sm:text-3xl uppercase">
                      REGISTER FOR {event.title}
                    </h3>
                    <p className="mt-1 font-content text-xs text-mist/70">
                      Fee: <strong className="text-medium-red">{event.fee}</strong> • Venue: {event.venue}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block font-mono text-xs font-semibold text-mist/80 uppercase">
                        Team Lead Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alex Mercer"
                        value={formData.leadName}
                        onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                        className="mt-1.5 w-full rounded-lg border border-dark-red/40 bg-black/60 px-3.5 py-2 font-mono text-xs text-mist placeholder:text-mist/30 focus:border-medium-red focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block font-mono text-xs font-semibold text-mist/80 uppercase">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="lead@university.edu"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="mt-1.5 w-full rounded-lg border border-dark-red/40 bg-black/60 px-3.5 py-2 font-mono text-xs text-mist placeholder:text-mist/30 focus:border-medium-red focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-xs font-semibold text-mist/80 uppercase">
                          Mobile Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="mt-1.5 w-full rounded-lg border border-dark-red/40 bg-black/60 px-3.5 py-2 font-mono text-xs text-mist placeholder:text-mist/30 focus:border-medium-red focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block font-mono text-xs font-semibold text-mist/80 uppercase">
                          Institution / College *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. FISAT"
                          value={formData.college}
                          onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                          className="mt-1.5 w-full rounded-lg border border-dark-red/40 bg-black/60 px-3.5 py-2 font-mono text-xs text-mist placeholder:text-mist/30 focus:border-medium-red focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-xs font-semibold text-mist/80 uppercase">
                          Team Size *
                        </label>
                        <select
                          value={formData.teamSize}
                          onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                          className="mt-1.5 w-full rounded-lg border border-dark-red/40 bg-near-black px-3.5 py-2 font-mono text-xs text-mist focus:border-medium-red focus:outline-hidden"
                        >
                          <option value="1">1 Member</option>
                          <option value="2">2 Members</option>
                          <option value="3">3 Members</option>
                          <option value="4">4 Members</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-xs font-semibold text-mist/80 uppercase">
                        Special Requests / Hardware Specs (Optional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Any hardware interfaces or dietary needs..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="mt-1.5 w-full rounded-lg border border-dark-red/40 bg-black/60 px-3.5 py-2 font-mono text-xs text-mist placeholder:text-mist/30 focus:border-medium-red focus:outline-hidden"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full rounded-xl border border-medium-red bg-medium-red py-3 font-mono text-xs font-bold tracking-wider text-mist uppercase transition-all duration-200 hover:bg-dark-red hover:shadow-[0_0_20px_rgba(170,52,48,0.6)] cursor-pointer"
                      >
                        CONFIRM REGISTRATION & SECURE SLOT ▶
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="py-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/50 bg-emerald-950/60 text-emerald-400">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>

                  <span className="font-mono text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                    REGISTRATION CONFIRMED // TOKEN #ARC-{Math.floor(1000 + Math.random() * 9000)}
                  </span>

                  <h3 className="mt-2 font-heading text-2xl font-bold tracking-tight text-mist uppercase sm:text-3xl">
                    TEAM ENROLLED IN {event.title}
                  </h3>

                  <p className="mt-2 font-content text-xs text-mist/75">
                    Registration details sent to <strong className="text-mist">{formData.email || 'your email'}</strong>. Please present this confirmation token at the verification desk on event day.
                  </p>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={resetModal}
                      className="rounded-xl border border-medium-red/60 bg-medium-red/20 px-6 py-2.5 font-mono text-xs font-bold text-mist hover:bg-medium-red"
                    >
                      CLOSE WINDOW
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
