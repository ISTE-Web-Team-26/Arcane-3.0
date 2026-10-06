import { Link } from 'react-router'
import { motion } from 'framer-motion'
import BackgroundParticles from '../BackgroundParticles.tsx'
import EventMarkdown from './EventMarkdown.tsx'
import VoiceMessage from './VoiceMessage.tsx'
import type { EventItem } from '../../data/events.ts'
import {
  eventDateLine,
  eventFeeLine,
  eventPrizeLine,
  eventTeamLine,
  eventTimeLine,
} from '../../data/eventDetails.ts'

export default function SyncedEventDetail({ event }: { event: EventItem }) {
  const dateLine = eventDateLine(event)
  const timeLine = eventTimeLine(event)
  const feeLine = eventFeeLine(event)
  const prizeLine = eventPrizeLine(event)
  const teamLine = eventTeamLine(event)

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
          <h1 className="font-heading text-4xl font-bold tracking-tight uppercase sm:text-6xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-white via-[#f4938f] to-[#e05652] [text-shadow:0_0_35px_rgba(170,52,48,0.45)]">
            {event.title}
          </h1>

          {event.description && (
            <p className="mt-2.5 w-full font-mono text-xs font-medium text-mist/80 sm:text-sm md:text-base">
              {event.description}
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
                {dateLine}
              </span>
              <span className="mt-0.5 block font-mono text-[11px] text-medium-red">
                {timeLine}
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
            </div>

            {/* Team Size */}
            <div className="flex flex-col justify-start rounded-xl border border-dark-red/35 bg-near-black/80 p-4 transition-all duration-200 hover:border-medium-red/50">
              <span className="block font-mono text-[10px] font-semibold tracking-wider text-mist/50 uppercase">
                TEAM SIZE
              </span>
              <span className="mt-1 font-mono text-xs font-bold text-mist sm:text-sm">
                {teamLine}
              </span>
              {event.teamLabel && (
                <span className="mt-0.5 block font-mono text-[11px] text-mist/60">
                  {event.teamLabel}
                </span>
              )}
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

            {/* Prize Pool — hidden when the event has none */}
            {prizeLine ? (
              <div className="flex flex-col justify-start rounded-xl border border-dark-red/35 bg-near-black/80 p-4 transition-all duration-200 hover:border-medium-red/50">
                <span className="block font-mono text-[10px] font-semibold tracking-wider text-mist/50 uppercase">
                  PRIZE POOL
                </span>
                <span className="mt-1 font-mono text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#e05652] to-[#f4938f] sm:text-xl md:text-2xl">
                  {prizeLine}
                </span>
              </div>
            ) : null}
          </div>

          {/* Organizer voice note — only when the event has one */}
          {event.voiceMsg ? (
            <div className="mt-4">
              <VoiceMessage key={event.voiceMsg} src={event.voiceMsg} />
            </div>
          ) : null}

          {/* Primary Action Row with Register Button */}
          <div className="mt-6 flex items-center">
            <Link
              to={`/events/${event.id}/register`}
              className="group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-medium-red bg-medium-red px-8 py-3.5 font-mono text-sm font-bold tracking-wider text-mist uppercase transition-all duration-300 hover:bg-dark-red hover:shadow-[0_0_28px_rgba(170,52,48,0.7)] active:scale-[0.98] cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>REGISTER NOW</span>
                <span className="transition-transform group-hover:translate-x-1">▶</span>
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>
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
    </div>
  )
}
