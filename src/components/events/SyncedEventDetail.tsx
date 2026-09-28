import { useState } from 'react'
import { Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import BackgroundParticles from '../BackgroundParticles.tsx'
import EventMarkdown from './EventMarkdown.tsx'
import type { EventItem } from '../../data/events.ts'

function ordinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return 'TH'
  switch (day % 10) {
    case 1:
      return 'ST'
    case 2:
      return 'ND'
    case 3:
      return 'RD'
    default:
      return 'TH'
  }
}

/** Raw ISO -> "6TH OCTOBER 2026" in the venue timezone. */
function formatFullDate(iso: string): string | null {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const day = Number(get('day'))
  return `${day}${ordinalSuffix(day)} ${get('month').toUpperCase()} ${get('year')}`
}

function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

export default function SyncedEventDetail({ event }: { event: EventItem }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [token, setToken] = useState('')
  const [formData, setFormData] = useState({
    leadName: '',
    email: '',
    phone: '',
    college: '',
    squadSize: '2',
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setToken(`#ARC-${Math.floor(1000 + Math.random() * 9000)}`)
    setIsSubmitted(true)
  }

  const resetModal = () => {
    setIsModalOpen(false)
    setIsSubmitted(false)
    setToken('')
    setFormData({
      leadName: '',
      email: '',
      phone: '',
      college: '',
      squadSize: '2',
      notes: '',
    })
  }

  const dateLine =
    (event.startsAt ? formatFullDate(event.startsAt) : null) ?? 'OCT 6, 7, 8'
  const feeLine =
    event.feeAmount != null && event.feeAmount > 0
      ? `${formatINR(event.feeAmount)} / SQUAD`
      : (event.fee ?? 'FREE')
  const prizeLine =
    event.prizeAmount != null && event.prizeAmount > 0
      ? `${formatINR(event.prizeAmount)} POOL`
      : (event.prize ?? '')

  return (
    <div className="relative -mx-4 -mt-[4.5rem] sm:-mx-8 sm:-mt-[5rem] -mb-8 overflow-hidden soil-bg-layer px-4 pt-8 pb-16 sm:px-8 sm:pt-12">
      {/* Ambient floating ember particles */}
      <BackgroundParticles density={14} className="z-0" />

      {/* Main Container */}
      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Navigation Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
          className="mb-6 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-mist/60 sm:mb-8"
        >
          <Link
            to="/#events"
            className="group flex items-center gap-2 rounded-lg border border-dark-red/30 bg-near-black/70 px-3 py-1.5 transition-all duration-200 hover:border-medium-red/60 hover:text-mist hover:shadow-[0_0_12px_rgba(170,52,48,0.3)]"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            <span>BACK TO ALL ARENAS</span>
          </Link>
        </motion.div>

        {/* Hero Header: Title, Telemetry, Quick Register */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] as const }}
          className="mb-10"
        >
          {/* Main Heading */}
          <h1 className="font-heading text-4xl font-bold tracking-tight text-mist sm:text-6xl md:text-7xl uppercase">
            {event.title}
          </h1>

          {event.description && (
            <p className="mt-2.5 max-w-3xl font-mono text-xs font-medium text-mist/80 sm:text-sm md:text-base">
              {event.description}
            </p>
          )}

          {/* Key Telemetry Badges Grid (Date/Time, Venue, Fee, Prize Pool) */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
            {/* Date & Time */}
            <div className="flex flex-col justify-start rounded-xl border border-dark-red/35 bg-near-black/80 p-4 transition-all duration-200 hover:border-medium-red/50">
              <span className="block font-mono text-[10px] font-semibold tracking-wider text-mist/50 uppercase">
                DATE & SPRINT TIME
              </span>
              <span className="mt-1 font-mono text-xs font-bold text-mist sm:text-sm">
                {dateLine}
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
                SQUAD: {event.squad || '—'}
              </span>
            </div>

            {/* Registration Fee */}
            <div className="flex flex-col justify-start rounded-xl border border-dark-red/35 bg-near-black/80 p-4 transition-all duration-200 hover:border-medium-red/50">
              <span className="block font-mono text-[10px] font-semibold tracking-wider text-mist/50 uppercase">
                REGISTRATION FEE
              </span>
              <span className="mt-1 font-mono text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#e05652] to-[#f4938f] sm:text-xl md:text-2xl">
                {feeLine}
              </span>
            </div>

            {/* Prize Pool */}
            <div className="flex flex-col justify-start rounded-xl border border-dark-red/35 bg-near-black/80 p-4 transition-all duration-200 hover:border-medium-red/50">
              <span className="block font-mono text-[10px] font-semibold tracking-wider text-mist/50 uppercase">
                PRIZE POOL
              </span>
              <span className="mt-1 font-mono text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#e05652] to-[#f4938f] sm:text-xl md:text-2xl">
                {prizeLine}
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

            {event.longDescription ? (
              <EventMarkdown source={event.longDescription} />
            ) : (
              <p className="font-content text-sm leading-relaxed text-mist/95 sm:text-base md:text-lg">
                {event.description}
              </p>
            )}
          </div>
        </motion.div>

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
                      OPERATIVE REGISTRATION // {event.code || '•EVT'}
                    </span>
                    <h3 className="mt-1 font-heading text-2xl font-bold tracking-tight text-mist sm:text-3xl uppercase">
                      REGISTER FOR {event.title}
                    </h3>
                    <p className="mt-1 font-content text-xs text-mist/70">
                      Fee: <strong className="text-medium-red">{feeLine}</strong> • Venue: {event.venue}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block font-mono text-xs font-semibold text-mist/80 uppercase">
                        Squad Lead Name *
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
                          Squad Size *
                        </label>
                        <select
                          value={formData.squadSize}
                          onChange={(e) => setFormData({ ...formData, squadSize: e.target.value })}
                          className="mt-1.5 w-full rounded-lg border border-dark-red/40 bg-near-black px-3.5 py-2 font-mono text-xs text-mist focus:border-medium-red focus:outline-hidden"
                        >
                          <option value="1">1 Operative (Solo)</option>
                          <option value="2">2 Operatives (Duo)</option>
                          <option value="3">3 Operatives (Trio)</option>
                          <option value="4">4 Operatives (Full Squad)</option>
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
                    REGISTRATION CONFIRMED // TOKEN {token}
                  </span>

                  <h3 className="mt-2 font-heading text-2xl font-bold tracking-tight text-mist uppercase sm:text-3xl">
                    SQUAD ENROLLED IN {event.title}
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
